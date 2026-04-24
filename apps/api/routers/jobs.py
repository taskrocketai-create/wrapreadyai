import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Job, JobOutput
from schemas import JobResponse, JobOutputResponse

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/jobs/{job_id}/outputs", response_model=list[JobOutputResponse])
def get_job_outputs(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return job.outputs


@router.get("/jobs/{job_id}/download/{output_type}")
def download_output(job_id: str, output_type: str, db: Session = Depends(get_db)):
    output = db.query(JobOutput).filter(
        JobOutput.job_id == job_id,
        JobOutput.output_type == output_type
    ).first()
    if not output or not os.path.exists(output.file_path):
        raise HTTPException(404, "Output not found")
    media_types = {
        "png": "image/png",
        "tiff": "image/tiff",
        "pdf": "application/pdf",
        "svg": "image/svg+xml",
    }
    media_type = media_types.get(output_type, "application/octet-stream")
    return FileResponse(
        output.file_path,
        media_type=media_type,
        filename=f"wrapready_{job_id[:8]}.{output_type}",
    )


def run_processing_sync(job_id: str):
    from database import SessionLocal
    from models import Job, JobOutput
    from services.pipeline import run_pipeline

    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        job.status = "processing"
        db.commit()

        outputs = run_pipeline(
            job_id,
            job.original_path,
            job.target_width_in,
            job.target_height_in,
            job.target_dpi,
            db,
        )
        for o in outputs:
            out = JobOutput(job_id=job_id, **o)
            db.add(out)

        job.status = "completed"
        job.current_stage = None
        db.commit()
    except Exception as e:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/jobs/{job_id}/process")
def trigger_processing(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    if job.status not in ("analyzed", "uploaded", "review"):
        return {"message": f"Job already in status: {job.status}"}

    background_tasks.add_task(run_processing_sync, job_id)
    return {"message": "Processing started", "job_id": job_id}


@router.get("/jobs/{job_id}/preview/{image_type}")
def get_preview(job_id: str, image_type: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")
    preview_dir = Path(STORAGE_PATH) / "previews" / job_id

    if image_type == "original":
        preview_path = preview_dir / "original.jpg"
        if not preview_path.exists():
            if job.original_path and os.path.exists(job.original_path):
                return FileResponse(job.original_path, media_type="image/jpeg")
            raise HTTPException(404, "Preview not found")
        return FileResponse(str(preview_path), media_type="image/jpeg")

    elif image_type == "processed":
        preview_path = preview_dir / "processed.jpg"
        if not preview_path.exists():
            orig_preview = preview_dir / "original.jpg"
            if orig_preview.exists():
                return FileResponse(str(orig_preview), media_type="image/jpeg")
            if job.original_path and os.path.exists(job.original_path):
                return FileResponse(job.original_path, media_type="image/jpeg")
            raise HTTPException(404, "Preview not found")
        return FileResponse(str(preview_path), media_type="image/jpeg")

    raise HTTPException(400, "Invalid image type. Use 'original' or 'processed'.")
