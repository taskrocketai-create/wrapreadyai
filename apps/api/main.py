import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import Base, engine
from routers import upload, jobs, analysis, review

app = FastAPI(
    title="WrapReadyAI API",
    description="Artwork Prep for Wrap Shops",
    version="1.0.0",
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in CORS_ORIGINS.split(",")] if CORS_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(review.router, prefix="/api")


@app.on_event("startup")
def startup():
    os.makedirs("./storage/originals", exist_ok=True)
    os.makedirs("./storage/outputs", exist_ok=True)
    os.makedirs("./storage/previews", exist_ok=True)
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "WrapReadyAI API"}


@app.get("/")
def root():
    return {"message": "WrapReadyAI API", "docs": "/docs"}
