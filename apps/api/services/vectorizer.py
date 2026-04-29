"""
Raster-to-SVG vectorizer with proper color-layer separation.

Each dominant color in the image becomes its own named <g> layer in the SVG,
compatible with Inkscape and Adobe Illustrator.  Wrap shops can open the file,
toggle layers on/off, recolor, resize, and reposition elements independently.

Drop this file at:  apps/api/services/vectorizer.py
Also add to requirements.txt:  vtracer==0.6.12
"""

from __future__ import annotations

import os
import re
import tempfile
from typing import List

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

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def vectorize_image(
    image_path: str,
    n_colors: int = 16,
    min_pixel_ratio: float = 0.002,   # ignore regions < 0.2 % of total pixels
    filter_speckle: int = 4,
    corner_threshold: int = 60,
    length_threshold: float = 4.0,
    path_precision: int = 3,
) -> str:
    """
    Convert a raster image to a *layered* SVG string.

    Each dominant color becomes a separate named <g> layer so the file is
    editable in Inkscape / Illustrator — wrap shops can isolate, recolor,
    scale and reposition each element independently.

    Falls back to a base64-embedded image SVG when dependencies are missing.
    """
    if not (HAS_VTRACER and HAS_PIL and HAS_NUMPY):
        return _fallback_svg(image_path)

    try:
        img = Image.open(image_path).convert("RGB")
        img = _cap_size(img, max_dim=1024)

        min_pixels = max(1, int(img.width * img.height * min_pixel_ratio))

        return _build_layered_svg(
            img,
            n_colors=n_colors,
            min_pixels=min_pixels,
            filter_speckle=filter_speckle,
            corner_threshold=corner_threshold,
            length_threshold=length_threshold,
            path_precision=path_precision,
        )
    except Exception as exc:
        print(f"[vectorizer] layered SVG failed ({exc}), using fallback")
        return _fallback_svg(image_path)


# ---------------------------------------------------------------------------
# Core: color separation + per-layer tracing
# ---------------------------------------------------------------------------

def _detect_background_idx(arr: "np.ndarray", min_edge_coverage: float = 0.30):
    """
    Return the quantized color index that dominates the image edges.
    If no single color covers >= min_edge_coverage of all edge pixels, return None.
    Edge-sampling reliably finds rectangular canvas backgrounds without
    accidentally removing white/light design elements in the interior.
    """
    import numpy as np
    h, w = arr.shape
    edge = np.concatenate([arr[0, :], arr[-1, :], arr[:, 0], arr[:, -1]])
    unique, counts = np.unique(edge, return_counts=True)
    best = np.argmax(counts)
    if counts[best] / len(edge) >= min_edge_coverage:
        return unique[best]
    return None


def _build_layered_svg(
    img: "Image.Image",
    n_colors: int,
    min_pixels: int,
    filter_speckle: int,
    corner_threshold: int,
    length_threshold: float,
    path_precision: int,
) -> str:
    import numpy as np

    w, h = img.size

    # 1. Quantize to N dominant colors
    quantized = img.quantize(colors=n_colors, method=Image.Quantize.MEDIANCUT)
    arr = np.array(quantized)          # shape (H, W) — color index per pixel
    palette = quantized.getpalette()   # flat list [R,G,B, R,G,B, ...]

    unique_idxs, counts = np.unique(arr, return_counts=True)
    # Largest region first → background drawn at bottom
    order = np.argsort(-counts)

    # Detect canvas background — SVG default is transparent, which is
    # exactly what wrap shops need; no background rect is emitted.
    bg_idx = _detect_background_idx(arr)

    # 2. Vectorize each color region separately
    layer_svgs: List[str] = []

    for rank, pos in enumerate(order):
        color_idx = unique_idxs[pos]
        pixel_count = counts[pos]

        if pixel_count < min_pixels:
            continue

        # Skip canvas background — transparent SVG canvas is correct for
        # vinyl cutting and layer editing in Inkscape / Illustrator
        if bg_idx is not None and color_idx == bg_idx:
            continue

        r = palette[color_idx * 3]
        g = palette[color_idx * 3 + 1]
        b = palette[color_idx * 3 + 2]
        hex_color = f"#{r:02x}{g:02x}{b:02x}"

        layer_id = f"layer-{rank + 1:02d}-{hex_color[1:]}"
        layer_label = f"{hex_color}  ({pixel_count:,} px)"

        # Binary mask: white where this color, black elsewhere
        mask_arr = ((arr == color_idx) * 255).astype(np.uint8)
        mask_img = Image.fromarray(mask_arr, mode="L")

        paths_svg = _trace_mask(
            mask_img,
            filter_speckle=filter_speckle,
            corner_threshold=corner_threshold,
            length_threshold=length_threshold,
            path_precision=path_precision,
        )
        if not paths_svg:
            continue

        # vtracer binary mode outputs black fill — replace with actual color
        paths_svg = re.sub(r'fill="[^"]*"', f'fill="{hex_color}"', paths_svg)

        layer_svgs.append(
            f'  <g id="{layer_id}"\n'
            f'     inkscape:label="{layer_label}"\n'
            f'     inkscape:groupmode="layer">\n'
            f"{paths_svg}\n"
            f"  </g>"
        )

    if not layer_svgs:
        return _fallback_svg_from_img(img, w, h)

    # 3. Assemble final SVG with Inkscape layer metadata
    return "\n".join([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg version="1.1"',
        '     xmlns="http://www.w3.org/2000/svg"',
        '     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"',
        '     xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.0.dtd"',
        f'     width="{w}" height="{h}"',
        f'     viewBox="0 0 {w} {h}">',
        '  <sodipodi:namedview inkscape:document-units="px"/>',
        *layer_svgs,
        "</svg>",
    ])


def _trace_mask(
    mask_img: "Image.Image",
    filter_speckle: int,
    corner_threshold: int,
    length_threshold: float,
    path_precision: int,
) -> str:
    """Trace a binary mask through vtracer; return the raw <path .../> elements."""
    tmp_in = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tmp_out = tempfile.NamedTemporaryFile(suffix=".svg", delete=False)
    tmp_in.close()
    tmp_out.close()

    try:
        mask_img.save(tmp_in.name)
        vtracer.convert_image_to_svg_py(
            tmp_in.name,
            tmp_out.name,
            colormode="binary",
            mode="spline",
            filter_speckle=filter_speckle,
            corner_threshold=corner_threshold,
            length_threshold=length_threshold,
            path_precision=path_precision,
        )
        svg_raw = open(tmp_out.name, encoding="utf-8").read()
    finally:
        _rm(tmp_in.name)
        _rm(tmp_out.name)

    paths = re.findall(r"<path[^>]*/?>", svg_raw, re.DOTALL)
    return "\n".join("    " + p for p in paths)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cap_size(img: "Image.Image", max_dim: int) -> "Image.Image":
    if img.width <= max_dim and img.height <= max_dim:
        return img
    img = img.copy()
    img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
    return img


def _rm(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


def _fallback_svg(image_path: str) -> str:
    if not HAS_PIL:
        return _minimal_error_svg()
    try:
        img = Image.open(image_path).convert("RGB")
        img = _cap_size(img, 800)
        return _fallback_svg_from_img(img, img.width, img.height)
    except Exception:
        return _minimal_error_svg()


def _fallback_svg_from_img(img: "Image.Image", w: int, h: int) -> str:
    import base64
    import io as _io
    buf = _io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    return (
        f'<?xml version="1.0" encoding="UTF-8"?>'
        f'<svg xmlns="http://www.w3.org/2000/svg"'
        f' xmlns:xlink="http://www.w3.org/1999/xlink"'
        f' width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        f'<image width="{w}" height="{h}"'
        f' xlink:href="data:image/png;base64,{b64}"/>'
        f"</svg>"
    )


def _minimal_error_svg() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">'
        '<rect width="400" height="200" fill="#111"/>'
        '<text x="200" y="105" text-anchor="middle" font-size="14" fill="#aaa">'
        "Vectorization unavailable — install vtracer"
        "</text>"
        "</svg>"
    )
