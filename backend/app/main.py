"""FastAPI application entrypoint.

Endpoints (api-spec.md):
  POST /api/v1/analyze        — analyze pasted text
  POST /api/v1/analyze/image  — analyze a screenshot (OCR -> same pipeline)
  GET  /api/v1/health         — service health

Error responses use the documented envelope: {"error": {"code", "message"}}.
"""

from __future__ import annotations

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.pipeline import ocr as ocr_module
from app.pipeline.analyzer import analyze
from app.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse, RiskLevel

MAX_CONTENT_CHARS = 5000
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB (api-spec.md)
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}

app = FastAPI(title="Digital Safety Co-pilot API", version="0.1.0")

# Frontend runs on a different origin (Vite dev server / Vercel). Permissive in
# the MVP — no auth, nothing persisted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error(code: str, message: str, status: int) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message}},
    )


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(request: Request):
    # Parse manually so validation failures return the documented error envelope
    # rather than FastAPI's default 422 shape.
    try:
        payload = await request.json()
    except Exception:
        return _error("content_empty", "Request body must be valid JSON.", 400)

    content = payload.get("content")
    language = payload.get("language", "en")

    if not isinstance(content, str) or not content.strip():
        return _error("content_empty", "Content must not be empty.", 400)

    if len(content) > MAX_CONTENT_CHARS:
        return _error(
            "content_too_long",
            f"Content must be under {MAX_CONTENT_CHARS} characters.",
            400,
        )

    if language not in ("en", "kn", "hi"):
        language = "en"

    # Validate against the request schema (keeps the contract honest).
    req = AnalyzeRequest(content=content, language=language)

    result = analyze(content=req.content, language=req.language.value)
    return result


@app.post("/api/v1/analyze/image", response_model=AnalyzeResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """Screenshot -> OCR -> the identical analysis pipeline (api-spec.md).

    Adds `extracted_text` and `ocr_confidence` to the standard response. OCR
    confidence below the floor forces cannot_determine — analysing garbled text
    and returning a confident verdict is worse than admitting the read failed.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return _error(
            "unsupported_file_type",
            "Please upload a PNG, JPG, or WEBP image.",
            400,
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        return _error("file_too_large", "Image must be under 5 MB.", 413)
    if not image_bytes:
        return _error("ocr_failed", "The uploaded image was empty.", 422)

    if language not in ("en", "kn", "hi"):
        language = "en"

    ocr_result = ocr_module.get_provider().extract(image_bytes)
    if not ocr_result.text:
        return _error(
            "ocr_failed",
            "We could not read any text from this image. Try a clearer screenshot.",
            422,
        )

    result = analyze(content=ocr_result.text, language=language)

    # Attach OCR metadata. Low confidence forces cannot_determine.
    result.extracted_text = ocr_result.text
    result.ocr_confidence = round(ocr_result.confidence, 2)
    if ocr_result.confidence < ocr_module.OCR_CONFIDENCE_FLOOR:
        result.risk_level = RiskLevel.cannot_determine
        result.risk_score = None

    return result


@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    # reasoning_layer reports whether the model layer is active; ocr reports
    # whether an OCR engine is available.
    import os

    reasoning = "ok" if os.environ.get("ANTHROPIC_API_KEY") else "degraded"
    ocr_status = (
        "unavailable"
        if isinstance(ocr_module.get_provider(), ocr_module.NullOcrProvider)
        else "ok"
    )
    return HealthResponse(status="ok", reasoning_layer=reasoning, ocr=ocr_status)
