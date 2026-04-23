"""PaddleOCR stub — detects embedded/live text layers that need outlining."""
import asyncio


async def detect_text(file_path: str) -> dict:
    await asyncio.sleep(0.4)
    return {
        "status": "warning",
        "detail": "3 live text layers detected — convert to outlines before print",
        "layers": ["headline", "phone_number", "tagline"],
    }
