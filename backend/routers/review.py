from fastapi import APIRouter, HTTPException
from backend.models.job import JobStatus
from backend.storage import get_job, save_job, list_jobs, delete_job

router = APIRouter(prefix="/api/review", tags=["review"])


@router.get("/queue")
async def get_review_queue():
    jobs = list_jobs()
    return [j for j in jobs if j.status in (JobStatus.ready, JobStatus.warning, JobStatus.error)]


@router.post("/{job_id}/approve")
async def approve_job(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    delete_job(job_id)
    return {"message": f"Job {job_id} approved and removed from queue."}


@router.post("/{job_id}/reject")
async def reject_job(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    job.status = JobStatus.error
    save_job(job)
    return {"message": f"Job {job_id} rejected.", "job": job}
