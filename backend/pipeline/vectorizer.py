"""Potrace stub — converts raster elements to vector paths."""
import asyncio


async def vectorize(file_path: str) -> dict:
    await asyncio.sleep(0.6)
    return {
        "status": "ready",
        "detail": "Raster elements vectorized successfully",
        "output_path": file_path.replace(".", "_vector."),
    }
