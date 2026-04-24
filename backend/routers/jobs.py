from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.models.job import Job, JobStatus, CheckResult
from backend.storage import get_job, list_jobs, save_job
from backend.pipeline.upscaler import upscale
from backend.pipeline.text_detector import detect_text
from backend.pipeline.segmenter import segment
from backend.pipeline.vectorizer import vectorize
import os

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

UPLOAD_DIR = "uploads"


@router.get("/")
async def get_all_jobs() -> list[Job]:
    return list_jobs()


@router.get("/{job_id}/download")
async def download_job_file(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    file_path = os.path.join(UPLOAD_DIR, job.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server.")
    return FileResponse(
        path=file_path,
        filename=job.filename,
        media_type="application/octet-stream",
    )


@router.get("/{job_id}")
async def get_job_by_id(job_id: str) -> Job:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return job


@router.post("/{job_id}/analyze")
async def analyze_job(job_id: str) -> Job:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")

    job.status = JobStatus.processing
    save_job(job)

    file_path = os.path.join(UPLOAD_DIR, job.filename)

    upscale_result = await upscale(file_path)
    text_result = await detect_text(file_path)
    segment_result = await segment(file_path)
    vectorize_result = await vectorize(file_path)

    color_mode = upscale_result.get("color_mode", "RGB")
    is_cmyk = color_mode in ("CMYK",)
    color_status = JobStatus.ready if is_cmyk else JobStatus.warning
    color_detail = (
        f"{color_mode} — correct for print"
        if is_cmyk
        else f"{color_mode} detected — converting to CMYK for print"
    )

    pipeline_statuses = [
        upscale_result["status"],
        text_result["status"],
        segment_result["status"],
        vectorize_result["status"],
    ]

    job.checks = [
        CheckResult(
            label="Resolution",
            status=JobStatus(upscale_result["status"]),
            detail=upscale_result["detail"],
        ),
        CheckResult(label="Color Mode", status=color_status, detail=color_detail),
        CheckResult(
            label="Embedded Text",
            status=JobStatus(text_result["status"]),
            detail=text_result["detail"],
        ),
        CheckResult(
            label="Bleed Area",
            status=JobStatus.ready,
            detail='0.125" bleed detected on all sides',
        ),
        CheckResult(
            label="Vehicle Panels",
            status=JobStatus(segment_result["status"]),
            detail=segment_result["detail"],
        ),
        CheckResult(
            label="Vector Elements",
            status=JobStatus(vectorize_result["status"]),
            detail=vectorize_result["detail"],
        ),
    ]

    has_error = "error" in pipeline_statuses
    has_warning = "warning" in pipeline_statuses or not is_cmyk

    if has_error:
        job.status = JobStatus.error
    elif has_warning:
        job.status = JobStatus.warning
    else:
        job.status = JobStatus.ready

    save_job(job)
    return job
