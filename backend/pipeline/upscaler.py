"""Real-ESRGAN stub — upscales low-resolution rasters to 300 DPI."""
import asyncio


async def upscale(file_path: str, target_dpi: int = 300) -> dict:
    await asyncio.sleep(0.5)
    return {
        "status": "ready",
        "detail": f"Upscaled to {target_dpi} DPI",
        "output_path": file_path.replace(".", "_upscaled."),
    }
