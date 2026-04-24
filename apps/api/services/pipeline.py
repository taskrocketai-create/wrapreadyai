import os
from pathlib import Path
from typing import List, Dict, Any

try:
    from PIL import Image, ImageFilter, ImageEnhance
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")
TARGET_DPI = int(os.getenv("TARGET_DPI", "120"))


def get_output_dir(job_id: str) -> Path:
    d = Path(STORAGE_PATH) / "outputs" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def get_preview_dir(job_id: str) -> Path:
    d = Path(STORAGE_PATH) / "previews" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def stage_normalize(img: "Image.Image") -> "Image.Image":
    """Normalize image: convert to RGB and normalize color profile."""
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    return img


def stage_analyze(img: "Image.Image", job_id: str, db: Any) -> "Image.Image":
    """Analysis stage - analysis was already done; this stage is a no-op in pipeline."""
    return img


def stage_upscale(img: "Image.Image", target_width_in: float, target_height_in: float, target_dpi: int) -> "Image.Image":
    """
    Upscale image to target DPI.
    TODO: Replace Lanczos with Real-ESRGAN for AI-based upscaling.
    """
    target_w_px = int(target_width_in * target_dpi)
    target_h_px = int(target_height_in * target_dpi)
    if img.width < target_w_px or img.height < target_h_px:
        img = img.resize((target_w_px, target_h_px), Image.LANCZOS)
    return img


def stage_segment(img: "Image.Image") -> "Image.Image":
    """
    Segment image layers.
    TODO: Implement AI segmentation (e.g., SAM - Segment Anything Model).
    """
    return img


def stage_text_reconstruct(img: "Image.Image") -> "Image.Image":
    """
    Reconstruct text elements for crisp rendering.
    TODO: Implement text layer extraction and reconstruction.
    """
    return img


def stage_vectorize(img: "Image.Image", job_id: str) -> str:
    """
    Vectorize image to SVG.
    TODO: Integrate Potrace or vtracer for real vectorization.
    Returns path to SVG file.
    """
    from services.vectorizer import vectorize_image
    out_dir = get_output_dir(job_id)
    tmp_path = str(out_dir / "temp_vectorize.png")
    img.save(tmp_path, "PNG")
    svg_content = vectorize_image(tmp_path)
    svg_path = str(out_dir / "output.svg")
    with open(svg_path, "w") as f:
        f.write(svg_content)
    try:
        os.remove(tmp_path)
    except Exception:
        pass
    return svg_path


def stage_texture(img: "Image.Image") -> "Image.Image":
    """Extract and enhance texture details."""
    if HAS_PIL:
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
    return img


def stage_recompose(img: "Image.Image") -> "Image.Image":
    """Recompose all processed layers back into final image."""
    return img


def stage_export(img: "Image.Image", job_id: str, target_dpi: int) -> List[Dict[str, Any]]:
    """Export final image to PNG, TIFF, PDF formats."""
    out_dir = get_output_dir(job_id)
    outputs = []

    png_path = str(out_dir / "output.png")
    img.save(png_path, "PNG", dpi=(target_dpi, target_dpi))
    png_size = os.path.getsize(png_path)
    outputs.append({
        "output_type": "png",
        "file_path": png_path,
        "file_size": png_size,
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": True,
    })

    tiff_path = str(out_dir / "output.tiff")
    img.save(tiff_path, "TIFF", dpi=(target_dpi, target_dpi))
    tiff_size = os.path.getsize(tiff_path)
    outputs.append({
        "output_type": "tiff",
        "file_path": tiff_path,
        "file_size": tiff_size,
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": True,
    })

    try:
        pdf_path = str(out_dir / "output.pdf")
        img_rgb = img.convert("RGB") if img.mode == "RGBA" else img
        img_rgb.save(pdf_path, "PDF", resolution=target_dpi)
        pdf_size = os.path.getsize(pdf_path)
        outputs.append({
            "output_type": "pdf",
            "file_path": pdf_path,
            "file_size": pdf_size,
            "width_px": img.width,
            "height_px": img.height,
            "is_production_ready": True,
        })
    except Exception:
        pass

    return outputs


def stage_validate(img: "Image.Image", outputs: List[Dict[str, Any]], target_dpi: int) -> List[Dict[str, Any]]:
    """Validate outputs meet production requirements."""
    validated = []
    for output in outputs:
        output["is_production_ready"] = (
            output["width_px"] > 0 and
            output["height_px"] > 0 and
            output["file_size"] > 0
        )
        validated.append(output)
    return validated


def run_pipeline(
    job_id: str,
    original_path: str,
    target_width_in: float,
    target_height_in: float,
    target_dpi: int,
    db: Any,
) -> List[Dict[str, Any]]:
    """Run the full 10-stage processing pipeline."""
    from models import Job

    def update_stage(stage: str):
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.current_stage = stage
            db.commit()

    if not HAS_PIL:
        return []

    img = Image.open(original_path)

    update_stage("normalize")
    img = stage_normalize(img)

    update_stage("analyze")
    img = stage_analyze(img, job_id, db)

    update_stage("upscale")
    img = stage_upscale(img, target_width_in, target_height_in, target_dpi)

    update_stage("segment")
    img = stage_segment(img)

    update_stage("text_reconstruct")
    img = stage_text_reconstruct(img)

    update_stage("vectorize")
    svg_path = stage_vectorize(img, job_id)
    svg_size = os.path.getsize(svg_path)
    svg_output = {
        "output_type": "svg",
        "file_path": svg_path,
        "file_size": svg_size,
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": False,
    }

    update_stage("texture")
    img = stage_texture(img)

    update_stage("recompose")
    img = stage_recompose(img)

    preview_dir = get_preview_dir(job_id)
    preview_img = img.copy()
    preview_img.thumbnail((800, 600), Image.LANCZOS)
    preview_path = str(preview_dir / "processed.jpg")
    preview_img.convert("RGB").save(preview_path, "JPEG", quality=85)

    update_stage("export")
    outputs = stage_export(img, job_id, target_dpi)
    outputs.append(svg_output)

    update_stage("validate")
    outputs = stage_validate(img, outputs, target_dpi)

    return outputs
