from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    is_active = Column(Boolean, default=True)
    jobs = relationship("Job", back_populates="user")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="uploaded")
    use_type = Column(String, default="vehicle_wrap")
    original_filename = Column(String)
    original_path = Column(String)
    target_width_in = Column(Float, default=120.0)
    target_height_in = Column(Float, default=48.0)
    target_dpi = Column(Integer, default=120)
    current_stage = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    user = relationship("User", back_populates="jobs")
    analysis = relationship("JobAnalysis", back_populates="job", uselist=False)
    outputs = relationship("JobOutput", back_populates="job")
    reviews = relationship("ReviewEvent", back_populates="job")


class JobAnalysis(Base):
    __tablename__ = "job_analyses"
    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("jobs.id"), unique=True)
    effective_dpi = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    route_recommendation = Column(String, default="AUTO_PROCESS")
    classification = Column(String, default="photo")
    original_width_px = Column(Integer, default=0)
    original_height_px = Column(Integer, default=0)
    text_detected = Column(Boolean, default=False)
    ocr_confidence = Column(Float, default=0.0)
    ocr_text = Column(Text, nullable=True)
    vector_candidate = Column(Boolean, default=False)
    vector_node_count = Column(Integer, default=0)
    edge_density = Column(Float, default=0.0)
    color_count = Column(Integer, default=0)
    texture_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)
    job = relationship("Job", back_populates="analysis")


class JobOutput(Base):
    __tablename__ = "job_outputs"
    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("jobs.id"))
    output_type = Column(String)
    file_path = Column(String)
    file_size = Column(Integer, default=0)
    width_px = Column(Integer, default=0)
    height_px = Column(Integer, default=0)
    is_production_ready = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    job = relationship("Job", back_populates="outputs")


class ReviewEvent(Base):
    __tablename__ = "review_events"
    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("jobs.id"))
    reviewer_id = Column(String, nullable=True)
    action = Column(String)
    ocr_corrections = Column(JSON, nullable=True)
    font_choice = Column(String, nullable=True)
    smoothing_value = Column(Integer, nullable=True)
    texture_value = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    job = relationship("Job", back_populates="reviews")
