FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y tesseract-ocr libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Worker code is copied from the build context (apps/worker/)
# The api/ directory must be included in the build context (built from repo root):
# docker build -f apps/worker/Dockerfile --build-context api=apps/api .
COPY . .
# api/ is expected to be passed as a separate build context or bind-mounted at runtime
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
