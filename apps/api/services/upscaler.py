from PIL import Image

def upscale_image(image_path: str, target_width_px: int, target_height_px: int) -> Image.Image:
    """
    Upscale image to target dimensions using Lanczos resampling.
    TODO: Replace with Real-ESRGAN for AI-based upscaling.
    """
    img = Image.open(image_path).convert("RGB")
    if img.width < target_width_px or img.height < target_height_px:
        img = img.resize((target_width_px, target_height_px), Image.LANCZOS)
    return img
