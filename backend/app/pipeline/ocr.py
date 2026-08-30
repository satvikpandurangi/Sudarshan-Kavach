"""OCR provider for the screenshot input path.

architecture.md: for screenshots, OCR runs first, then the extracted text takes
the identical analysis path. api-spec.md: /analyze/image returns the normal
response plus `extracted_text` and `ocr_confidence`; confidence below 0.6 forces
`cannot_determine`.

The provider is injectable (same pattern as domain_age / reasoning), so:
  - production can use a Tesseract-backed provider (offline, no API key), and
  - tests use a deterministic fake with no image dependency.

`python-tesseract` and Pillow are optional. If they are not installed, the
default provider reports failure gracefully (result.text is None), and the
endpoint returns the documented `ocr_failed` error rather than crashing.
"""

from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from typing import Optional, Protocol


@dataclass
class OcrResult:
    text: Optional[str]     # extracted text, or None if OCR could not read it
    confidence: float       # 0.0-1.0; 0.0 when text is None


class OcrProvider(Protocol):
    def extract(self, image_bytes: bytes) -> OcrResult:
        ...


class NullOcrProvider:
    """Always fails to read. The safe default when no OCR engine is installed."""

    def extract(self, image_bytes: bytes) -> OcrResult:
        return OcrResult(text=None, confidence=0.0)


class TesseractOcrProvider:
    """Tesseract-backed OCR. Best-effort; any failure yields an empty result.

    Imports Pillow + pytesseract lazily so they remain optional dependencies.
    Confidence is derived from Tesseract's per-word confidence scores.
    """

    def extract(self, image_bytes: bytes) -> OcrResult:
        try:
            import io

            import pytesseract  # type: ignore
            from PIL import Image  # type: ignore
        except Exception:
            return OcrResult(text=None, confidence=0.0)

        _configure_tesseract_cmd(pytesseract)

        try:
            image = Image.open(io.BytesIO(image_bytes))
            data = pytesseract.image_to_data(
                image, output_type=pytesseract.Output.DICT
            )
        except Exception:
            return OcrResult(text=None, confidence=0.0)

        words = []
        confs = []
        for word, conf in zip(data.get("text", []), data.get("conf", [])):
            if word and word.strip():
                words.append(word)
                try:
                    c = float(conf)
                    if c >= 0:
                        confs.append(c)
                except (TypeError, ValueError):
                    pass

        text = " ".join(words).strip()
        if not text:
            return OcrResult(text=None, confidence=0.0)

        # Tesseract confidences are 0-100; normalise to 0-1.
        confidence = (sum(confs) / len(confs) / 100.0) if confs else 0.0
        return OcrResult(text=text, confidence=confidence)


def _configure_tesseract_cmd(pytesseract) -> None:
    """Point pytesseract at the Tesseract binary if it is not already on PATH.

    On Windows the installer does not always add Tesseract to PATH, so we check
    the standard install locations. Honours a TESSERACT_CMD override. This only
    sets a path; if the binary genuinely isn't present, the extract() call fails
    gracefully and OCR degrades to no-text (never crashes).
    """
    override = os.environ.get("TESSERACT_CMD")
    if override and os.path.exists(override):
        pytesseract.pytesseract.tesseract_cmd = override
        return

    if shutil.which("tesseract"):
        return  # already resolvable on PATH

    for candidate in (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    ):
        if os.path.exists(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            return


# Active provider. Defaults to Tesseract; falls back to null behaviour inside
# the provider itself if the engine is missing.
_provider: OcrProvider = TesseractOcrProvider()

# OCR confidence below this forces cannot_determine (api-spec.md).
OCR_CONFIDENCE_FLOOR = 0.6


def get_provider() -> OcrProvider:
    return _provider


def set_provider(provider: OcrProvider) -> None:
    """Swap the active provider (used by tests and offline configuration)."""
    global _provider
    _provider = provider
