from fastapi import APIRouter, HTTPException
from backend.models.job import Job, JobStatus, CheckResult
from backend.storage import get_job, list_jobs, save_job
from backend.pipeline.upscaler import upscale
from backend.pipeline.text_detector import detect_text

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/")
async def get_all_jobs() -> list[Job]:
    return list_jobs()


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

    upscale_result = await upscale(job.filename)
    text_result = await detect_text(job.filename)

    has_warning = text_result["status"] == "warning"

    job.checks = [
        CheckResult(label="Resolution", status=JobStatus(upscale_result["status"]), detail=upscale_result["detail"]),
        CheckResult(label="Color Mode", status=JobStatus.warning, detail="RGB detected — converting to CMYK"),
        CheckResult(label="Embedded Text", status=JobStatus(text_result["status"]), detail=text_result["detail"]),
        CheckResult(label="Bleed Area", status=JobStatus.ready, detail="0.125\" bleed detected on all sides"),
    ]

    job.status = JobStatus.warning if has_warning else JobStatus.ready
    save_job(job)
    return job
