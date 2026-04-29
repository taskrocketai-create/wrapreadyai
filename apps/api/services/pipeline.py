import os
import io
import time
import httpx
from pathlib import Path
from typing import List, Dict, Any

try:
    from PIL import Image, ImageFilter, ImageEnhance
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")
TARGET_DPI = int(os.getenv("TARGET_DPI", "120"))
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")


def get_output_dir(job_id: str) -> Path:
    d = Path(STORAGE_PATH) / "outputs" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def get_preview_dir(job_id: str) -> Path:
    d = Path(STORAGE_PATH) / "previews" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def stage_normalize(img: "Image.Image") -> "Image.Image":
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    return img


def stage_analyze(img: "Image.Image", job_id: str, db: Any) -> "Image.Image":
    return img


def stage_upscale(
    img: "Image.Image",
    target_width_in: float,
    target_height_in: float,
    target_dpi: int,
) -> "Image.Image":
    """
    Upscale to meet target DPI while preserving the original aspect ratio.

    Strategy:
    - Compute the pixel dimensions required to hit target_dpi at the
      requested print size.
    - Find the scale factor needed on each axis; use the *smaller* one so
      the image fits within the print canvas without distortion.
    - Only upscale, never downscale (the image is already big enough if
      both axes already exceed target resolution).
    """
    target_w_px = int(target_width_in * target_dpi)
    target_h_px = int(target_height_in * target_dpi)

    cur_w, cur_h = img.size

    # Scale factor required on each axis to reach target resolution
    scale_w = target_w_px / cur_w
    scale_h = target_h_px / cur_h

    # Use the smaller scale so the image fits within the canvas;
    # this preserves aspect ratio.
    scale = min(scale_w, scale_h)

    if scale <= 1.0:
        # Already meets or exceeds target DPI on the constraining axis
        return img

    if REPLICATE_API_TOKEN:
        try:
            import base64

            buf = io.BytesIO()
            img.convert("RGB").save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode()
            data_uri = f"data:image/png;base64,{b64}"

            headers = {
                "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
                "Content-Type": "application/json",
                "Prefer": "wait",
            }

            esrgan_scale = 4 if scale > 2 else 2

            payload = {
                "version": "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
                "input": {
                    "image": data_uri,
                    "scale": esrgan_scale,
                    "face_enhance": False,
                },
            }

            with httpx.Client(timeout=120) as client:
                response = client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers=headers,
                    json=payload,
                )
                result = response.json()

                if result.get("status") not in ("succeeded", "failed"):
                    prediction_id = result["id"]
                    for _ in range(60):
                        time.sleep(3)
                        poll = client.get(
                            f"https://api.replicate.com/v1/predictions/{prediction_id}",
                            headers=headers,
                        )
                        result = poll.json()
                        if result.get("status") in ("succeeded", "failed"):
                            break

                if result.get("status") == "succeeded":
                    output_url = result["output"]
                    img_response = client.get(output_url)
                    upscaled = Image.open(io.BytesIO(img_response.content)).convert("RGB")

                    # Downscale to exact target if Real-ESRGAN overshot
                    new_w = int(cur_w * scale)
                    new_h = int(cur_h * scale)
                    if upscaled.width > new_w or upscaled.height > new_h:
                        upscaled = upscaled.resize((new_w, new_h), Image.Resampling.LANCZOS)

                    return upscaled

        except Exception as e:
            print(f"Replicate upscale failed, falling back to Lanczos: {e}")

    # Fallback: Lanczos — scale preserving aspect ratio
    new_w = int(cur_w * scale)
    new_h = int(cur_h * scale)
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def stage_segment(img: "Image.Image") -> "Image.Image":
    return img


def stage_text_reconstruct(img: "Image.Image") -> "Image.Image":
    return img


def stage_vectorize(img: "Image.Image", job_id: str) -> str:
    """
    Vectorize the processed image to SVG.

    We work from a reasonably sized copy of the image (≤ 1024px on the
    long side) because vtracer's complexity and output file size scale
    with pixel count — passing a 14 400 px monster in would produce a
    multi-MB SVG and take forever.
    """
    from services.vectorizer import vectorize_image

    out_dir = get_output_dir(job_id)
    svg_path = str(out_dir / "output.svg")

    # Write a downscaled PNG for vtracer input
    import tempfile
    vec_img = img.copy()
    MAX_VEC_DIM = 1024
    if vec_img.width > MAX_VEC_DIM or vec_img.height > MAX_VEC_DIM:
        vec_img.thumbnail((MAX_VEC_DIM, MAX_VEC_DIM), Image.Resampling.LANCZOS)

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    vec_img.convert("RGB").save(tmp.name, "PNG")
    tmp.close()

    try:
        svg_content = vectorize_image(tmp.name)
    finally:
        try:
            os.remove(tmp.name)
        except OSError:
            pass

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    return svg_path


def stage_texture(img: "Image.Image") -> "Image.Image":
    if HAS_PIL:
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
    return img


def stage_recompose(img: "Image.Image") -> "Image.Image":
    return img


def stage_export(img: "Image.Image", job_id: str, target_dpi: int) -> List[Dict[str, Any]]:
    out_dir = get_output_dir(job_id)
    outputs = []

    png_path = str(out_dir / "output.png")
    img.save(png_path, "PNG", dpi=(target_dpi, target_dpi))
    outputs.append({
        "output_type": "png",
        "file_path": png_path,
        "file_size": os.path.getsize(png_path),
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": True,
    })

    tiff_path = str(out_dir / "output.tiff")
    img.save(tiff_path, "TIFF", dpi=(target_dpi, target_dpi), compression="tiff_lzw")
    outputs.append({
        "output_type": "tiff",
        "file_path": tiff_path,
        "file_size": os.path.getsize(tiff_path),
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": True,
    })

    try:
        pdf_path = str(out_dir / "output.pdf")
        img_rgb = img.convert("RGB") if img.mode == "RGBA" else img
        img_rgb.save(pdf_path, "PDF", resolution=target_dpi)
        outputs.append({
            "output_type": "pdf",
            "file_path": pdf_path,
            "file_size": os.path.getsize(pdf_path),
            "width_px": img.width,
            "height_px": img.height,
            "is_production_ready": True,
        })
    except Exception:
        pass

    return outputs


def stage_validate(
    img: "Image.Image",
    outputs: List[Dict[str, Any]],
    target_dpi: int,
) -> List[Dict[str, Any]]:
    for output in outputs:
        output["is_production_ready"] = (
            output["width_px"] > 0
            and output["height_px"] > 0
            and output["file_size"] > 0
        )
    return outputs


def run_pipeline(
    job_id: str,
    original_path: str,
    target_width_in: float,
    target_height_in: float,
    target_dpi: int,
    db: Any,
) -> List[Dict[str, Any]]:
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
    svg_output = {
        "output_type": "svg",
        "file_path": svg_path,
        "file_size": os.path.getsize(svg_path),
        "width_px": img.width,
        "height_px": img.height,
        "is_production_ready": False,  # SVG is a reference, not production-ready on its own
    }

    update_stage("texture")
    img = stage_texture(img)

    update_stage("recompose")
    img = stage_recompose(img)

    # Save preview before the heavy export so UI has something to show
    update_stage("export")
    preview_dir = get_preview_dir(job_id)
    ratio = min(800 / img.width, 600 / img.height)
    prev_w, prev_h = int(img.width * ratio), int(img.height * ratio)
    preview_img = img.resize((prev_w, prev_h), Image.Resampling.LANCZOS)
    preview_path = str(preview_dir / "processed.jpg")
    preview_img.convert("RGB").save(preview_path, "JPEG", quality=85)
    del preview_img  # free memory before export

    outputs = stage_export(img, job_id, target_dpi)
    outputs.append(svg_output)

    update_stage("validate")
    outputs = stage_validate(img, outputs, target_dpi)

    return outputs
