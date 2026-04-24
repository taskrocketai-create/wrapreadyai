"""OpenCV stub — segments vehicle panels from graphic file."""
import asyncio


async def segment(file_path: str) -> dict:
    await asyncio.sleep(0.3)
    return {
        "status": "ready",
        "detail": "Vehicle panels detected and segmented",
        "panels": ["hood", "driver_side", "passenger_side", "rear"],
    }
