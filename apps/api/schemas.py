from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class JobCreate(BaseModel):
    use_type: str = "vehicle_wrap"
    target_width_in: float = 120.0
    target_height_in: float = 48.0


class JobResponse(BaseModel):
    id: str
    status: str
    use_type: str
    original_filename: Optional[str] = None
    target_width_in: float
    target_height_in: float
    target_dpi: int
    current_stage: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobAnalysisResponse(BaseModel):
    id: str
    job_id: str
    effective_dpi: float
    confidence_score: float
    route_recommendation: str
    classification: str
    original_width_px: int
    original_height_px: int
    text_detected: bool
    ocr_confidence: float
    ocr_text: Optional[str] = None
    vector_candidate: bool
    vector_node_count: int
    edge_density: float
    color_count: int
    texture_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class JobOutputResponse(BaseModel):
    id: str
    job_id: str
    output_type: str
    file_size: int
    width_px: int
    height_px: int
    is_production_ready: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewRequest(BaseModel):
    action: str
    ocr_corrections: Optional[Dict[str, Any]] = None
    font_choice: Optional[str] = None
    smoothing_value: Optional[int] = None
    texture_value: Optional[int] = None
    notes: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    job_id: str
    action: str
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    job_id: str
    status: str
    message: str
