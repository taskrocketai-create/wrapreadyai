def vectorize_image(image_path: str) -> str:
    """
    Vectorize a raster image to SVG.
    TODO: Integrate Potrace or vtracer for real vectorization.
    Returns a stub SVG string.
    """
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">'
        '<rect width="100" height="100" fill="#14B8A6" opacity="0.5"/>'
        '<text x="10" y="50" font-size="10" fill="white">Vector Placeholder</text>'
        "</svg>"
    )
