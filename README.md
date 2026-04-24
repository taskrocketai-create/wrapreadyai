# WrapReadyAI

**Artwork Prep for Wrap Shops** — Submit an image, get a wrap-ready file optimized at 120 DPI for large-format print.

## Overview

WrapReadyAI is an AI-powered artwork preparation platform for vehicle wrap shops. It automates the process of analyzing, upscaling, and optimizing artwork for large-format printing — reducing manual prep time and improving output quality.

## Features

- **Smart Image Analysis** — Automatically evaluates DPI, edge density, color count, text presence, and vector candidacy
- **Route Recommendation** — AUTO_PROCESS, QUICK_REVIEW, or FULL_RECONSTRUCTION based on analysis
- **10-Stage Processing Pipeline** — Normalize → Analyze → Upscale → Segment → Text Reconstruct → Vectorize → Texture → Recompose → Export → Validate
- **Multi-Format Export** — PNG, TIFF, PDF, SVG outputs at 120 DPI
- **Before/After Comparison** — Interactive slider to compare original vs processed artwork
- **Internal Review Workflow** — Human-in-the-loop controls for OCR correction, font selection, smoothing, and texture
- **Use Type Support** — Vehicle Wrap, Trailer Wrap, Banner, Decal, Sign, Logo

## Architecture

```
wrapreadyai/
├── apps/
│   ├── web/          # Next.js 16 frontend (TypeScript + Tailwind CSS v4)
│   ├── api/          # FastAPI backend (Python)
│   └── worker/       # Celery async worker
├── docker-compose.yml
└── .env.example
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, SQLAlchemy, SQLite/Postgres |
| Image Processing | Pillow, OpenCV, Tesseract OCR |
| Queue | Celery + Redis |
| Deployment | Docker, Vercel (frontend) |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Run with Docker

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Run Locally

**Frontend:**
```bash
cd apps/web
npm install
cp .env.local.example .env.local
npm run dev
```

**Backend:**
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload artwork file |
| GET | `/api/jobs/{id}` | Get job status |
| GET | `/api/jobs/{id}/analysis` | Get analysis results |
| POST | `/api/jobs/{id}/process` | Trigger processing pipeline |
| GET | `/api/jobs/{id}/outputs` | List output files |
| GET | `/api/jobs/{id}/download/{type}` | Download output (png/tiff/pdf/svg) |
| GET | `/api/jobs/{id}/preview/{type}` | Get preview image (original/processed) |
| POST | `/api/jobs/{id}/review` | Submit review decision |
| GET | `/api/health` | Health check |

## Processing Pipeline

1. **Normalize** — Convert to RGB, normalize color profile
2. **Analyze** — DPI, edge density, color count, OCR, vector detection
3. **Upscale** — Lanczos resampling to target 120 DPI *(TODO: Real-ESRGAN)*
4. **Segment** — Layer separation *(TODO: SAM)*
5. **Text Reconstruct** — Crisp text rendering *(TODO: text layer extraction)*
6. **Vectorize** — SVG generation *(TODO: Potrace/vtracer)*
7. **Texture Extract** — Sharpness enhancement
8. **Recompose** — Layer recombination
9. **Export** — PNG, TIFF, PDF, SVG at 120 DPI
10. **Validate** — Production readiness check

## Environment Variables

```env
DATABASE_URL=sqlite:///./storage/wrapready.db
REDIS_URL=redis://localhost:6379/0
STORAGE_PATH=./storage
MAX_UPLOAD_SIZE_MB=50
TARGET_DPI=120
CORS_ORIGINS=http://localhost:3000
```

## License

MIT
