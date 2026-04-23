from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.models.job import Job, JobStatus, CheckResult
from backend.storage import save_job
import aiofiles
import os

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".ai", ".eps", ".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".psd"}
UPLOAD_DIR = "uploads"


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    vehicle_type: str = Form(default="Full Wrap"),
    print_width: str = Form(default='54"'),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename or "upload")

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    file_size_mb = len(content) / 1024 / 1024

    job = Job(
        filename=file.filename or "upload",
        file_size_mb=round(file_size_mb, 2),
        vehicle_type=vehicle_type,
        print_width=print_width,
        status=JobStatus.pending,
        checks=[
            CheckResult(label="Resolution", status=JobStatus.pending, detail="Not checked yet"),
            CheckResult(label="Color Mode", status=JobStatus.pending, detail="Not checked yet"),
            CheckResult(label="Embedded Text", status=JobStatus.pending, detail="Not checked yet"),
            CheckResult(label="Bleed Area", status=JobStatus.pending, detail="Not checked yet"),
        ],
    )

    save_job(job)
    return {"job_id": job.id, "filename": job.filename, "status": job.status}
