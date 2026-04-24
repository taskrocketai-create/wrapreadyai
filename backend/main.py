from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import upload, jobs, review
import os

app = FastAPI(
    title="WrapReady AI API",
    description="Print-ready large format graphics processing pipeline.",
    version="1.0.0",
)

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:80")
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(jobs.router)
app.include_router(review.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "WrapReady AI API"}
