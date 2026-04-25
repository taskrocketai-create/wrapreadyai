import os
import uuid
import io
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from PIL import Image
from database import get_db
from models import Job
from schemas import UploadResponse
from storage import save_uploaded_file, get_preview_dir

router = APIRouter()

MAX_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_DIMENSION = 3000


def resize_if_needed(content: bytes) -> bytes:
    """Cap image to MAX_DIMENSION on longest side to reduce memory during processing."""
    img = Image.open(io.BytesIO(content))
    fmt = img.format or "PNG"
    if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format=fmt)
        return buf.getvalue()
    return content


def run_analysis_sync(job_id: str):
    """Run analysis synchronously in background."""
    from database import SessionLocal
    from models import Job, JobAnalysis
    from services.analysis_engine import analyze_image

    db = SessionLocal()
    job = None
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        job.status = "analyzing"
        db.commit()

        result = analyze_image(
            job.original_path,
            job.target_width_in,
            job.target_height_in,
            job.target_dpi,
        )
        analysis = JobAnalysis(job_id=job_id, **result)
        db.add(analysis)

        from PIL import Image
        try:
            prev_dir = get_preview_dir(job_id)
            img = Image.open(job.original_path)
            img.thumbnail((800, 600), Image.Resampling.LANCZOS)
            img.convert("RGB").save(str(Path(prev_dir) / "original.jpg"), "JPEG", quality=85)
        except Exception:
            pass

        job.status = "analyzed"
        db.commit()
    except Exception:
        if job is not None:
            job.status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_width_in: float = Form(120.0),
    target_height_in: float = Form(48.0),
    use_type: str = Form("vehicle_wrap"),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPG, PNG, and WebP files are allowed.")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File must be under {MAX_SIZE_MB}MB.")

    content = resize_if_needed(content)

    job_id = str(uuid.uuid4())
    filename = file.filename or f"{job_id}.jpg"
    file_path = save_uploaded_file(job_id, filename, content)

    job = Job(
        id=job_id,
        use_type=use_type,
        original_filename=filename,
        original_path=file_path,
        target_width_in=target_width_in,
        target_height_in=target_height_in,
        target_dpi=int(os.getenv("TARGET_DPI", "120")),
        status="uploaded",
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(run_analysis_sync, job_id)

    return UploadResponse(job_id=job_id, status="uploaded", message="File uploaded successfully.")
