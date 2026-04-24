import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job, ReviewEvent
from schemas import ReviewRequest, ReviewResponse

router = APIRouter()


@router.post("/jobs/{job_id}/review", response_model=ReviewResponse)
def submit_review(job_id: str, review: ReviewRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    event = ReviewEvent(
        id=str(uuid.uuid4()),
        job_id=job_id,
        action=review.action,
        ocr_corrections=review.ocr_corrections,
        font_choice=review.font_choice,
        smoothing_value=review.smoothing_value,
        texture_value=review.texture_value,
        notes=review.notes,
    )
    db.add(event)

    if review.action == "approved":
        job.status = "completed"
    elif review.action in ("needs_rework", "full_rebuild"):
        job.status = "review"

    db.commit()
    return event
