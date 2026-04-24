from celery_app import celery_app
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))


@celery_app.task
def run_analysis(job_id: str):
    from database import SessionLocal
    from models import Job, JobAnalysis
    from services.analysis_engine import analyze_image
    db = SessionLocal()
    job = None
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}
        job.status = "analyzing"
        db.commit()
        result = analyze_image(job.original_path, job.target_width_in, job.target_height_in, job.target_dpi)
        analysis = JobAnalysis(job_id=job_id, **result)
        db.add(analysis)
        job.status = "analyzed"
        db.commit()
        return {"status": "analyzed", "job_id": job_id}
    except Exception as e:
        if job is not None:
            job.status = "failed"
            db.commit()
        return {"error": str(e)}
    finally:
        db.close()


@celery_app.task
def run_processing(job_id: str):
    from database import SessionLocal
    from models import Job, JobOutput
    from services.pipeline import run_pipeline
    db = SessionLocal()
    job = None
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}
        job.status = "processing"
        db.commit()
        outputs = run_pipeline(job_id, job.original_path, job.target_width_in, job.target_height_in, job.target_dpi, db)
        for o in outputs:
            out = JobOutput(job_id=job_id, **o)
            db.add(out)
        job.status = "completed"
        db.commit()
        return {"status": "completed", "job_id": job_id}
    except Exception as e:
        if job is not None:
            job.status = "failed"
            db.commit()
        return {"error": str(e)}
    finally:
        db.close()
