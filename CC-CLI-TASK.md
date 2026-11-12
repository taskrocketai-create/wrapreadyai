# CC-CLI Engineering Task Candidate: WrapReadyAI

## Project

WrapReadyAI is an image preparation application for large-format printing, with a Next.js frontend, FastAPI backend, and Celery processing worker. See [README.md](README.md) for setup and architecture.

## Proposed task: Reliable processing and export failure handling

Investigate the lifecycle of an uploaded artwork job across `apps/api/routers/`, `apps/api/services/pipeline.py`, `apps/api/services/export_layers.py`, and `apps/worker/tasks.py`. Identify and reproduce a concrete failure mode involving invalid input, missing intermediate artifacts, failed processing, or an unavailable export. Do not assume a defect exists without reproduction.

### Expected deliverables

1. Add a minimal reproducible regression test with a small, redistributable synthetic fixture.
2. Implement a narrowly scoped fix preserving successful processing paths.
3. Ensure failures are reported with actionable status/error information and do not silently advertise nonexistent outputs.
4. Run available tests and document commands, results, and any infrastructure-dependent checks that could not run.
5. Avoid introducing real customer artwork, credentials, or proprietary sample files.

### Review boundaries

- The README currently marks some advanced reconstruction stages as planned/TODO; do not present them as completed.
- Confirm external API and background-worker dependencies before selecting a task that needs them.
- This is a task proposal, not evidence that a bug was reproduced or that tests passed.
- Repository is public. Review commit history and tracked files for sensitive information before linking it in an application.
- Licensing is pending an explicit choice by the owner; adding an MIT license would permit third-party reuse and redistribution of covered code.

## Developer starting point

```bash
# Backend dependencies
cd apps/api
pip install -r requirements.txt

# Frontend dependencies
cd ../web
npm ci
npm run build
```

Use the root `docker-compose.yml` for integrated services where Docker is available. Commands above are guidance, not validated execution results.
