"""Tests for POST /api/v1/analyze/image — OCR path and its error handling.

Uses a fake OCR provider so there is no image/Tesseract dependency.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.pipeline import domain_age, ocr
from app.pipeline.ocr import OcrResult

client = TestClient(app)

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"fake image payload"


class _FakeOcr:
    def __init__(self, text, confidence):
        self._text = text
        self._confidence = confidence

    def extract(self, image_bytes):
        return OcrResult(text=self._text, confidence=self._confidence)


@pytest.fixture
def set_ocr():
    original = ocr.get_provider()

    def _install(text, confidence):
        ocr.set_provider(_FakeOcr(text, confidence))

    yield _install
    ocr.set_provider(original)


@pytest.fixture(autouse=True)
def offline_ages():
    original = domain_age.get_provider()
    domain_age.set_provider(domain_age.NullDomainAgeProvider())
    yield
    domain_age.set_provider(original)


def _post_image(content_type="image/png", data=PNG_BYTES, language="en"):
    return client.post(
        "/api/v1/analyze/image",
        files={"file": ("shot.png", data, content_type)},
        data={"language": language},
    )


def test_image_ocr_then_analysis():
    ocr.set_provider(_FakeOcr("Please share your OTP and CVV now", 0.95))
    domain_age.set_provider(domain_age.NullDomainAgeProvider())
    r = _post_image()
    assert r.status_code == 200
    body = r.json()
    assert body["extracted_text"] == "Please share your OTP and CVV now"
    assert body["ocr_confidence"] == 0.95
    # A credential request should flag it.
    assert body["risk_level"] in ("suspicious", "dangerous")


def test_low_confidence_forces_cannot_determine(set_ocr):
    set_ocr("garbl3d t3xt maybe", 0.4)  # below the 0.6 floor
    r = _post_image()
    assert r.status_code == 200
    body = r.json()
    assert body["risk_level"] == "cannot_determine"
    assert body["risk_score"] is None
    assert body["ocr_confidence"] == 0.4


def test_ocr_failure_returns_422(set_ocr):
    set_ocr(None, 0.0)
    r = _post_image()
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "ocr_failed"


def test_unsupported_file_type():
    r = _post_image(content_type="application/pdf")
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "unsupported_file_type"


def test_empty_image_ocr_failed(set_ocr):
    set_ocr("ignored", 0.9)
    r = _post_image(data=b"")
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "ocr_failed"


def test_extracted_text_present_on_success(set_ocr):
    set_ocr("Your Amazon order has shipped", 0.9)
    r = _post_image()
    body = r.json()
    assert "extracted_text" in body and body["extracted_text"]


def test_text_endpoint_has_no_ocr_fields():
    # Regression: the text endpoint response should not carry OCR fields.
    domain_age.set_provider(domain_age.NullDomainAgeProvider())
    r = client.post("/api/v1/analyze", json={"content": "hello there friend", "language": "en"})
    assert r.status_code == 200
    body = r.json()
    assert body.get("extracted_text") is None
    assert body.get("ocr_confidence") is None
