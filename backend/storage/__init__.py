from typing import Dict
from backend.models.job import Job

_store: Dict[str, Job] = {}


def save_job(job: Job) -> Job:
    _store[job.id] = job
    return job


def get_job(job_id: str) -> Job | None:
    return _store.get(job_id)


def list_jobs() -> list[Job]:
    return list(_store.values())


def delete_job(job_id: str) -> bool:
    if job_id in _store:
        del _store[job_id]
        return True
    return False
