import os
from pathlib import Path

STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")


def get_storage_path() -> Path:
    p = Path(STORAGE_PATH)
    p.mkdir(parents=True, exist_ok=True)
    return p


def get_job_dir(job_id: str) -> Path:
    d = get_storage_path() / "originals" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def get_output_dir(job_id: str) -> Path:
    d = get_storage_path() / "outputs" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def get_preview_dir(job_id: str) -> Path:
    d = get_storage_path() / "previews" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_uploaded_file(job_id: str, filename: str, content: bytes) -> str:
    job_dir = get_job_dir(job_id)
    file_path = job_dir / filename
    with open(file_path, "wb") as f:
        f.write(content)
    return str(file_path)


def save_output_file(job_id: str, filename: str, content: bytes) -> str:
    out_dir = get_output_dir(job_id)
    file_path = out_dir / filename
    with open(file_path, "wb") as f:
        f.write(content)
    return str(file_path)


def save_preview_file(job_id: str, filename: str, content: bytes) -> str:
    prev_dir = get_preview_dir(job_id)
    file_path = prev_dir / filename
    with open(file_path, "wb") as f:
        f.write(content)
    return str(file_path)


def read_file(file_path: str) -> bytes:
    with open(file_path, "rb") as f:
        return f.read()
