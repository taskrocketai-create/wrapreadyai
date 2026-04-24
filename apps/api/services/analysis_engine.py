import os
import math
from typing import Dict, Any

try:
    import cv2
    import numpy as np
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def calculate_effective_dpi(width_px: int, height_px: int, target_width_in: float, target_height_in: float) -> float:
    """Calculate effective DPI based on pixel dimensions and target print size."""
    if target_width_in <= 0 or target_height_in <= 0:
        return 0.0
    dpi_w = width_px / target_width_in
    dpi_h = height_px / target_height_in
    return min(dpi_w, dpi_h)


def calculate_edge_density(image_path: str) -> float:
    """Calculate edge density using Canny edge detection."""
    if not HAS_CV2:
        return 0.5
    try:
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.5
        edges = cv2.Canny(img, 50, 150)
        return float(np.count_nonzero(edges)) / float(edges.size)
    except Exception:
        return 0.5


def count_dominant_colors(image_path: str, max_colors: int = 16) -> int:
    """Count distinct dominant colors in image."""
    if not HAS_PIL:
        return 256
    try:
        img = Image.open(image_path).convert("RGB")
        img_small = img.resize((100, 100), Image.Resampling.LANCZOS)
        quantized = img_small.quantize(colors=max_colors)
        return len(quantized.getcolors() or [])
    except Exception:
        return 256


def calculate_texture_score(image_path: str) -> float:
    """Calculate texture complexity score (0-1)."""
    if not HAS_CV2:
        return 0.5
    try:
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.5
        laplacian = cv2.Laplacian(img, cv2.CV_64F)
        variance = float(laplacian.var())
        score = min(1.0, variance / 1000.0)
        return score
    except Exception:
        return 0.5


def classify_image(
    effective_dpi: float,
    edge_density: float,
    color_count: int,
    text_detected: bool,
    vector_candidate: bool,
) -> str:
    """Classify image type for processing route selection."""
    if vector_candidate and color_count <= 8:
        return "vector_graphic"
    if text_detected and edge_density > 0.1:
        return "text_heavy"
    if edge_density > 0.15:
        return "complex_graphic"
    if color_count > 200:
        return "photo"
    return "simple_graphic"


def recommend_route(
    effective_dpi: float,
    confidence_score: float,
    classification: str,
    text_detected: bool,
) -> str:
    """Recommend processing route based on analysis."""
    if effective_dpi >= 100 and confidence_score >= 75:
        return "AUTO_PROCESS"
    if effective_dpi >= 60 or (text_detected and confidence_score >= 50):
        return "QUICK_REVIEW"
    return "FULL_RECONSTRUCTION"


def calculate_confidence_score(
    effective_dpi: float,
    edge_density: float,
    texture_score: float,
    text_detected: bool,
    ocr_confidence: float,
) -> float:
    """Calculate overall confidence score (0-100)."""
    dpi_score = min(100, (effective_dpi / 120.0) * 100)
    edge_score = min(100, edge_density * 500)
    texture_score_norm = texture_score * 100

    if text_detected:
        text_factor = ocr_confidence * 20
    else:
        text_factor = 10

    score = (dpi_score * 0.5) + (edge_score * 0.2) + (texture_score_norm * 0.2) + text_factor
    return min(100.0, max(0.0, score))


def analyze_image(
    image_path: str,
    target_width_in: float,
    target_height_in: float,
    target_dpi: int = 120,
) -> Dict[str, Any]:
    """
    Full image analysis pipeline.
    Returns dict of analysis results matching JobAnalysis model fields.
    """
    width_px, height_px = 0, 0
    if HAS_PIL:
        try:
            with Image.open(image_path) as img:
                width_px, height_px = img.size
        except Exception:
            pass

    effective_dpi = calculate_effective_dpi(width_px, height_px, target_width_in, target_height_in)
    edge_density = calculate_edge_density(image_path)
    color_count = count_dominant_colors(image_path)
    texture_score = calculate_texture_score(image_path)

    text_detected = False
    ocr_confidence = 0.0
    ocr_text = ""
    try:
        from services.ocr_service import run_ocr
        ocr_text, ocr_confidence = run_ocr(image_path)
        text_detected = len(ocr_text.strip()) > 3
    except Exception:
        pass

    vector_candidate = color_count <= 16 and edge_density > 0.05
    vector_node_count = int(edge_density * 10000) if vector_candidate else 0

    classification = classify_image(effective_dpi, edge_density, color_count, text_detected, vector_candidate)
    confidence_score = calculate_confidence_score(effective_dpi, edge_density, texture_score, text_detected, ocr_confidence)
    route_recommendation = recommend_route(effective_dpi, confidence_score, classification, text_detected)

    return {
        "effective_dpi": effective_dpi,
        "confidence_score": confidence_score,
        "route_recommendation": route_recommendation,
        "classification": classification,
        "original_width_px": width_px,
        "original_height_px": height_px,
        "text_detected": text_detected,
        "ocr_confidence": ocr_confidence,
        "ocr_text": ocr_text,
        "vector_candidate": vector_candidate,
        "vector_node_count": vector_node_count,
        "edge_density": edge_density,
        "color_count": color_count,
        "texture_score": texture_score,
    }
