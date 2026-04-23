from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import upload, jobs, review

app = FastAPI(
    title="WrapReady AI API",
    description="Print-ready large format graphics processing pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
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
