from typing import Tuple

def run_ocr(image_path: str) -> Tuple[str, float]:
    """Run OCR on an image. Returns (text, confidence)."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(image_path)
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        texts = [t for t, c in zip(data["text"], data["conf"]) if int(c) > 0 and t.strip()]
        confs = [int(c) for c in data["conf"] if int(c) > 0]
        text = " ".join(texts)
        avg_conf = sum(confs) / len(confs) / 100.0 if confs else 0.0
        return text, avg_conf
    except Exception:
        return "", 0.0
