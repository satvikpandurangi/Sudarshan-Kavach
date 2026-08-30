"""Tests for the Tesseract OCR provider integration.

These do not require the Tesseract binary: they exercise the graceful-failure
path and the binary-path configuration helper with mocks. A real end-to-end OCR
run is verified manually during Phase 6 (documented in RUNNING.md).
"""

from __future__ import annotations

import sys
import types

from app.pipeline import ocr


def test_null_provider_reports_failure():
    r = ocr.NullOcrProvider().extract(b"anything")
    assert r.text is None
    assert r.confidence == 0.0


def test_tesseract_missing_packages_degrades(monkeypatch):
    # Force the pytesseract import to fail -> graceful empty result, no crash.
    import builtins

    real_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name in ("pytesseract", "PIL"):
            raise ImportError("not installed")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", fake_import)
    r = ocr.TesseractOcrProvider().extract(b"fake-image-bytes")
    assert r.text is None
    assert r.confidence == 0.0


def test_configure_tesseract_cmd_honours_env(monkeypatch, tmp_path):
    # A fake pytesseract module whose tesseract_cmd we can inspect.
    fake = types.SimpleNamespace(pytesseract=types.SimpleNamespace(tesseract_cmd=""))
    exe = tmp_path / "tesseract.exe"
    exe.write_text("")
    monkeypatch.setenv("TESSERACT_CMD", str(exe))
    ocr._configure_tesseract_cmd(fake)
    assert fake.pytesseract.tesseract_cmd == str(exe)


def test_configure_tesseract_cmd_skips_when_on_path(monkeypatch):
    fake = types.SimpleNamespace(pytesseract=types.SimpleNamespace(tesseract_cmd="UNSET"))
    monkeypatch.delenv("TESSERACT_CMD", raising=False)
    monkeypatch.setattr(ocr.shutil, "which", lambda name: "/usr/bin/tesseract")
    ocr._configure_tesseract_cmd(fake)
    # Left unchanged because tesseract is already resolvable on PATH.
    assert fake.pytesseract.tesseract_cmd == "UNSET"
