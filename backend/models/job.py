from pydantic import BaseModel
from typing import Optional
from enum import Enum
import uuid
from datetime import datetime


class JobStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    ready = "ready"
    warning = "warning"
    error = "error"


class CheckResult(BaseModel):
    label: str
    status: JobStatus
    detail: str


class Job(BaseModel):
    id: str = ""
    filename: str
    file_size_mb: float
    vehicle_type: str = "Full Wrap"
    print_width: str = '54"'
    status: JobStatus = JobStatus.pending
    checks: list[CheckResult] = []
    created_at: str = ""
    updated_at: str = ""

    def model_post_init(self, __context: object) -> None:
        if not self.id:
            self.id = str(uuid.uuid4())[:8].upper()
        now = datetime.utcnow().isoformat()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now


class JobUpdate(BaseModel):
    status: Optional[JobStatus] = None
    checks: Optional[list[CheckResult]] = None
