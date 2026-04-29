"""
Real raster-to-SVG vectorizer using vtracer.
Drop this file in at apps/api/services/vectorizer.py
"""

import os
import tempfile
from pathlib import Path

try:
    import vtracer
    HAS_VTRACER = True
except ImportError:
    HAS_VTRACER = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def _preprocess_for_vectorization(image_path: str) -> str:
    """
    Optionally downscale the image before vectorization to keep SVG complexity
    manageable. Returns a path to the (possibly resized) image.
    If no resizing is needed the original path is returned unchanged.
    """
    if not HAS_PIL:
        return image_path

    MAX_DIM = 1024  # cap longest side – vtracer works best on medium-res inputs

    img = Image.open(image_path).convert("RGB")
    w, h = img.size

    if w <= MAX_DIM and h <= MAX_DIM:
        return image_path  # nothing to do

    # Resize while keeping aspect ratio
    scale = MAX_DIM / max(w, h)
    new_w, new_h = int(w * scale), int(h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    img.save(tmp.name, "PNG")
    return tmp.name


def vectorize_image(
    image_path: str,
    colormode: str = "color",          # "color" | "binary"
    hierarchical: str = "stacked",     # "stacked" | "cutout"
    mode: str = "spline",              # "spline" | "polygon" | "none"
    filter_speckle: int = 4,           # remove noise patches smaller than N px
    color_precision: int = 8,          # number of significant bits for colour
    layer_difference: int = 16,        # colour-layer merging threshold
    corner_threshold: int = 60,        # corner sharpness in degrees
    length_threshold: float = 4.0,     # min segment length before simplification
    max_iterations: int = 10,
    splice_threshold: int = 45,
    path_precision: int = 8,           # decimal places in SVG path data
) -> str:
    """
    Convert a raster image to an SVG string using vtracer.

    Falls back to a meaningful placeholder SVG when vtracer is unavailable
    (so the rest of the pipeline never breaks).
    """
    if not HAS_VTRACER:
        return _fallback_svg(image_path)

    preprocessed = _preprocess_for_vectorization(image_path)
    tmp_path_created = preprocessed != image_path  # did we create a temp file?

    # vtracer writes to a file; use a temp file to capture the output
    tmp_svg = tempfile.NamedTemporaryFile(suffix=".svg", delete=False)
    tmp_svg.close()

    try:
        vtracer.convert_image_to_svg_py(
            preprocessed,
            tmp_svg.name,
            colormode=colormode,
            hierarchical=hierarchical,
            mode=mode,
            filter_speckle=filter_speckle,
            color_precision=color_precision,
            layer_difference=layer_difference,
            corner_threshold=corner_threshold,
            length_threshold=length_threshold,
            max_iterations=max_iterations,
            splice_threshold=splice_threshold,
            path_precision=path_precision,
        )
        with open(tmp_svg.name, "r", encoding="utf-8") as fh:
            svg_str = fh.read()
        return svg_str
    except Exception as exc:
        print(f"[vectorizer] vtracer failed ({exc}), using fallback SVG")
        return _fallback_svg(image_path)
    finally:
        if os.path.exists(tmp_svg.name):
            try:
                os.remove(tmp_svg.name)
            except OSError:
                pass
        if tmp_path_created and os.path.exists(preprocessed):
            try:
                os.remove(preprocessed)
            except OSError:
                pass


def _fallback_svg(image_path: str) -> str:
    """
    Return a minimal but valid SVG that embeds the original image as a
    base64 data-URI so at least *something* renders in the browser.
    """
    if not HAS_PIL:
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">'
            '<rect width="400" height="300" fill="#1a1a2e"/>'
            '<text x="200" y="150" text-anchor="middle" font-size="16" fill="#e94560">'
            "Vectorization unavailable"
            "</text>"
            "</svg>"
        )

    import base64, io

    try:
        img = Image.open(image_path).convert("RGB")
        img.thumbnail((800, 600), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode()
        w, h = img.size
        return (
            f'<?xml version="1.0" encoding="UTF-8"?>'
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<image width="{w}" height="{h}" '
            f'xlink:href="data:image/png;base64,{b64}"/>'
            f"</svg>"
        )
    except Exception:
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">'
            '<rect width="400" height="300" fill="#111"/>'
            '<text x="200" y="150" text-anchor="middle" font-size="14" fill="#aaa">'
            "Image unavailable"
            "</text>"
            "</svg>"
        )
