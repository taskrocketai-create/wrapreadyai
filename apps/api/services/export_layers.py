"""
Layer export service for WrapReadyAI.

Produces a ZIP file containing:
  - layered.pdf         — PDF with Optional Content Groups (layers); opens in
                          Acrobat, Illustrator, CorelDRAW, Affinity Designer
  - layers/01_e94560.png — transparent PNG for each color region (RGBA)
  - layers/02_0f3460.png
  - composite.png       — full flattened image at print resolution
  - README.txt          — plain-English guide for the wrap shop

Drop this file at:  apps/api/services/export_layers.py
Add to requirements.txt:  pikepdf  (already pulled in via pypdf usually)
"""

from __future__ import annotations

import io
import os
import zlib
import zipfile
import tempfile
from pathlib import Path
from typing import List, Tuple, Optional

try:
    import pikepdf
    HAS_PIKEPDF = True
except ImportError:
    HAS_PIKEPDF = False

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

def export_layers_zip(
    image_path: str,
    output_path: str,
    n_colors: int = 16,
    min_pixel_ratio: float = 0.002,
) -> str:
    """
    Analyse ``image_path``, separate it into color regions, and write a ZIP
    to ``output_path`` containing a layered PDF, per-layer PNGs, and a README.

    Returns ``output_path``.
    """
    if not (HAS_PIL and HAS_NUMPY):
        raise RuntimeError("Pillow and numpy are required for layer export.")

    img = Image.open(image_path).convert("RGB")
    layers = _extract_layers(img, n_colors=n_colors, min_pixel_ratio=min_pixel_ratio)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Layered PDF
        if HAS_PIKEPDF:
            pdf_bytes = _build_layered_pdf(img, layers)
            zf.writestr("layered.pdf", pdf_bytes)

        # 2. Per-layer transparent PNGs
        for i, layer in enumerate(layers):
            png_bytes = _layer_to_png_bytes(layer["rgba"])
            fname = f"layers/{i + 1:02d}_{layer['hex'][1:]}.png"
            zf.writestr(fname, png_bytes)

        # 3. Full composite PNG
        composite_bytes = _img_to_png_bytes(img)
        zf.writestr("composite.png", composite_bytes)

        # 4. Plain-English README
        zf.writestr("README.txt", _build_readme(layers, HAS_PIKEPDF))

    return output_path


# ---------------------------------------------------------------------------
# Color-region extraction
# ---------------------------------------------------------------------------

def _extract_layers(
    img: "Image.Image",
    n_colors: int,
    min_pixel_ratio: float,
) -> List[dict]:
    """
    Quantize the image and return one dict per significant color region.
    Each dict has: hex, r, g, b, pixels, rgba (RGBA PIL Image), label.
    Background (canvas) region is excluded.
    """
    import numpy as np

    quantized = img.quantize(colors=n_colors, method=Image.Quantize.MEDIANCUT)
    arr = np.array(quantized)
    palette = quantized.getpalette()

    unique_idxs, counts = np.unique(arr, return_counts=True)
    order = np.argsort(-counts)          # largest first

    min_pixels = max(1, int(arr.size * min_pixel_ratio))
    bg_idx = _detect_background(arr)

    layers = []
    for rank, pos in enumerate(order):
        cidx = unique_idxs[pos]
        pcount = counts[pos]

        if pcount < min_pixels:
            continue
        if bg_idx is not None and cidx == bg_idx:
            continue

        r = palette[cidx * 3]
        g = palette[cidx * 3 + 1]
        b = palette[cidx * 3 + 2]
        hex_color = f"#{r:02x}{g:02x}{b:02x}"

        # RGBA image: color where this region, transparent elsewhere
        mask_arr = ((arr == cidx) * 255).astype(np.uint8)
        mask_img = Image.fromarray(mask_arr, "L")
        rgba = Image.new("RGBA", img.size, (0, 0, 0, 0))
        color_fill = Image.new("RGBA", img.size, (r, g, b, 255))
        rgba.paste(color_fill, mask=mask_img)

        layers.append({
            "rank": rank + 1,
            "hex": hex_color,
            "r": r, "g": g, "b": b,
            "pixels": int(pcount),
            "rgba": rgba,
            "label": f"Layer {len(layers) + 1:02d} — {hex_color}",
        })

    return layers


def _detect_background(arr: "np.ndarray", min_coverage: float = 0.30) -> Optional[int]:
    """Return the color index dominating image edges, or None."""
    import numpy as np
    edge = np.concatenate([arr[0, :], arr[-1, :], arr[:, 0], arr[:, -1]])
    unique, counts = np.unique(edge, return_counts=True)
    best = np.argmax(counts)
    if counts[best] / len(edge) >= min_coverage:
        return int(unique[best])
    return None


# ---------------------------------------------------------------------------
# Layered PDF via pikepdf OCG
# ---------------------------------------------------------------------------

def _build_layered_pdf(img: "Image.Image", layers: List[dict]) -> bytes:
    """
    Build a PDF where each color region is a separate Optional Content Group
    (layer).  Toggling a layer in Acrobat/Illustrator/CorelDRAW shows/hides
    that color region.

    Also includes a composite base image (all layers merged onto white) so the
    file shows the full artwork when opened in any flat viewer like Photopea,
    Preview, or Acrobat without needing to enable layers.
    """
    w, h = img.size
    pdf = pikepdf.Pdf.new()

    # Build composite: all layers composited onto white background
    # This is the base image visible in flat viewers (Photopea, Acrobat, etc.)
    composite = Image.new("RGB", (w, h), "white")
    for layer in layers:
        composite.paste(
            layer["rgba"].convert("RGB"),
            mask=layer["rgba"].split()[3]
        )

    # Create one OCG per layer
    ocg_entries = []
    for layer in layers:
        ocg = pdf.make_indirect(pikepdf.Dictionary(
            Type=pikepdf.Name("/OCG"),
            Name=pikepdf.String(layer["label"]),
            Usage=pikepdf.Dictionary(
                View=pikepdf.Dictionary(ViewState=pikepdf.Name("/ON")),
                Print=pikepdf.Dictionary(PrintState=pikepdf.Name("/ON")),
            ),
        ))
        ocg_entries.append(ocg)

    pdf.Root.OCProperties = pikepdf.Dictionary(
        OCGs=pikepdf.Array(ocg_entries),
        D=pikepdf.Dictionary(
            Order=pikepdf.Array(ocg_entries),
            ON=pikepdf.Array(ocg_entries),
            BaseState=pikepdf.Name("/ON"),
        ),
    )

    content_parts: List[str] = []
    xobjects: dict = {}
    properties: dict = {}

    # Base composite layer (always visible, no OCG)
    comp_bytes = zlib.compress(composite.tobytes())
    comp_xobj = pdf.make_indirect(pikepdf.Stream(pdf, comp_bytes, **{
        "/Type": pikepdf.Name("/XObject"),
        "/Subtype": pikepdf.Name("/Image"),
        "/Width": w,
        "/Height": h,
        "/ColorSpace": pikepdf.Name("/DeviceRGB"),
        "/BitsPerComponent": 8,
        "/Filter": pikepdf.Name("/FlateDecode"),
    }))
    xobjects["ImBase"] = comp_xobj
    content_parts.append(f"q\n{w} 0 0 {h} 0 0 cm\n/ImBase Do\nQ\n")

    # OCG layers on top (for Illustrator / CorelDRAW layer editing)
    for i, (ocg, layer) in enumerate(zip(ocg_entries, layers)):
        rgba = layer["rgba"]
        img_key = f"Im{i}"
        ocg_key = f"Oc{i}"

        # Alpha (soft mask)
        alpha_bytes = zlib.compress(rgba.split()[3].tobytes())
        smask = pdf.make_indirect(pikepdf.Stream(pdf, alpha_bytes, **{
            "/Type": pikepdf.Name("/XObject"),
            "/Subtype": pikepdf.Name("/Image"),
            "/Width": w,
            "/Height": h,
            "/ColorSpace": pikepdf.Name("/DeviceGray"),
            "/BitsPerComponent": 8,
            "/Filter": pikepdf.Name("/FlateDecode"),
        }))

        # RGB image with alpha reference
        rgb_bytes = zlib.compress(rgba.convert("RGB").tobytes())
        img_xobj = pdf.make_indirect(pikepdf.Stream(pdf, rgb_bytes, **{
            "/Type": pikepdf.Name("/XObject"),
            "/Subtype": pikepdf.Name("/Image"),
            "/Width": w,
            "/Height": h,
            "/ColorSpace": pikepdf.Name("/DeviceRGB"),
            "/BitsPerComponent": 8,
            "/Filter": pikepdf.Name("/FlateDecode"),
            "/SMask": smask,
        }))

        xobjects[img_key] = img_xobj
        properties[ocg_key] = ocg

        content_parts.append(
            f"/OC /{ocg_key} BDC\n"
            f"q\n"
            f"{w} 0 0 {h} 0 0 cm\n"
            f"/{img_key} Do\n"
            f"Q\n"
            f"EMC\n"
        )

    content_stream = "".join(content_parts).encode()

    page = pdf.make_indirect(pikepdf.Dictionary(
        Type=pikepdf.Name("/Page"),
        MediaBox=pikepdf.Array([0, 0, w, h]),
        Contents=pdf.make_indirect(pikepdf.Stream(pdf, content_stream)),
        Resources=pikepdf.Dictionary(
            XObject=pikepdf.Dictionary(**xobjects),
            Properties=pikepdf.Dictionary(**properties),
        ),
    ))
    pdf.pages.append(pikepdf.Page(page))

    buf = io.BytesIO()
    pdf.save(buf, min_version="1.4")
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def _layer_to_png_bytes(rgba: "Image.Image") -> bytes:
    buf = io.BytesIO()
    rgba.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def _img_to_png_bytes(img: "Image.Image") -> bytes:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# README
# ---------------------------------------------------------------------------

def _build_readme(layers: List[dict], has_pdf: bool) -> str:
    layer_lines = "\n".join(
        f"  layers/{i + 1:02d}_{l['hex'][1:]}.png  —  {l['hex']}  "
        f"({l['pixels']:,} pixels)"
        for i, l in enumerate(layers)
    )

    pdf_section = ""
    if has_pdf:
        pdf_section = """
HOW TO USE layered.pdf
──────────────────────
Adobe Illustrator / Affinity Designer
  File > Open > layered.pdf
  Open the Layers panel (Window > Layers).
  Each color region is a separate layer you can click, move, recolor, or hide.

CorelDRAW
  File > Import > layered.pdf
  Open the Object Manager docker.
  Each PDF layer appears as a separate group.

Adobe Acrobat / Reader
  Open the file and go to View > Show/Hide > Navigation Panes > Layers.
  Toggle individual color regions on/off.

"""

    return f"""WrapReadyAI — Layer Export Package
===================================

This ZIP contains your artwork broken into separate color regions so you can
edit, move, recolor, or resize each element independently.

FILES INCLUDED
──────────────
  layered.pdf      — Layered PDF (best for Illustrator / CorelDRAW)
  composite.png    — Full flattened image at print resolution
  layers/          — One transparent PNG per color region

COLOR REGIONS FOUND ({len(layers)} total)
{layer_lines}

HOW TO USE THE TRANSPARENT PNGs
────────────────────────────────
Each file in the layers/ folder is a transparent PNG containing ONLY that
color region.  The background has been removed.

To use in any software (Roland VersaWorks, Caldera, Flexi, SignCut, etc.):
  1. Create a new canvas at your print size.
  2. Import composite.png as the base (or leave the canvas empty).
  3. Import each layers/XX_xxxxxx.png as a separate object.
  4. Each object can be moved, scaled, recolored independently.
  5. Stack them in the same order as numbered to recreate the design.
{pdf_section}
TIPS
────
• The layer numbers reflect stacking order: 01 = bottom, highest = top.
• Colors are approximate — the original artwork is in composite.png.
• If a region looks wrong, use composite.png as a reference.
• For vinyl cutting, use the individual layer PNGs as cut paths.

Generated by WrapReadyAI — https://wrapreadyai.com
"""
