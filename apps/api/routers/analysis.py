from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import JobAnalysis
from schemas import JobAnalysisResponse

router = APIRouter()


@router.get("/jobs/{job_id}/analysis", response_model=JobAnalysisResponse)
def get_analysis(job_id: str, db: Session = Depends(get_db)):
    analysis = db.query(JobAnalysis).filter(JobAnalysis.job_id == job_id).first()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    return analysis
