"""Read-only instrumentation of the actual Python pipeline, spoken to over JSONL.

No copied detector/arbitration logic, monkeypatches, or replacement API endpoint.
The wrappers observe inputs/outputs and return the delegate's result unchanged.
"""
from __future__ import annotations

import contextlib
import json
import os
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app.pipeline.analyzer import analyze
from app.pipeline.anthropic_reasoner import _safe_json
from app.pipeline.groq_reasoner import DEFAULT_GROQ_MODEL, GroqReasoner, _RealGroqClient


class ObservedClient:
    def __init__(self, delegate):
        self.delegate = delegate
        self.raw = None
        self.error = None

    def create_message(self, **kwargs):
        try:
            self.raw = self.delegate.create_message(**kwargs)
            return self.raw
        except Exception as exc:
            self.error = f"{type(exc).__name__}: {exc}"
            raise


class ObservedReasoner:
    def __init__(self, delegate):
        self.delegate = delegate
        self.raw_signals = []
        self.reasoning_signals = []
        self.accepted_proposal = None

    def reason(self, normalized, signals, language):
        # Snapshot before the delegate or analyzer can mutate signal objects.
        self.raw_signals = [s.model_dump(mode="json") for s in signals]
        result = self.delegate.reason(normalized, signals, language)
        self.reasoning_signals = [s.model_dump(mode="json") for s in result.signals]
        self.accepted_proposal = result.proposed_level
        return result


def measure(content, language, client):
    observed_client = ObservedClient(client)
    reasoner = ObservedReasoner(GroqReasoner(client=observed_client))
    started = time.perf_counter()
    response = analyze(content, language=language, reasoner=reasoner)
    latency_ms = (time.perf_counter() - started) * 1000
    parsed = _safe_json(observed_client.raw) if observed_client.raw else None
    return {
        "response": response.model_dump(mode="json"),
        "latency_ms": latency_ms,
        "raw_signals": reasoner.raw_signals,
        "reasoning_signals": reasoner.reasoning_signals,
        # Capture BEFORE the reasoner's validation discards attempted downgrades.
        "model_proposed_level": parsed.get("risk_level") if parsed else None,
        "accepted_model_proposed_level": reasoner.accepted_proposal,
        "raw_model_response": observed_client.raw,
        "model_error": observed_client.error,
    }


def emit(value):
    print(json.dumps(value, ensure_ascii=False), flush=True)


def main():
    from dotenv import load_dotenv
    load_dotenv(ROOT / "backend" / ".env", override=False)
    if not os.environ.get("GROQ_API_KEY"):
        raise RuntimeError("GROQ_API_KEY is required; refusing to measure a silent deterministic fallback")
    client = _RealGroqClient()
    emit({"ready": True, "provider": "groq", "model": os.environ.get("GROQ_MODEL") or DEFAULT_GROQ_MODEL})
    for line in sys.stdin:
        request = json.loads(line)
        try:
            # Keep pipeline/library stdout from corrupting the JSONL protocol.
            with contextlib.redirect_stdout(sys.stderr):
                result = measure(request["content"], request["language"], client)
            emit({"id": request["id"], **result})
        except Exception as exc:
            emit({"id": request["id"], "error": f"{type(exc).__name__}: {exc}"})


if __name__ == "__main__":
    main()
