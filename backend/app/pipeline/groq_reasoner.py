"""Groq-backed reasoning layer.

Implements the Reasoner protocol using Groq's high-speed inference API
(OpenAI-compatible chat completions). Inherits strict grounding,
escalate-but-never-de-escalate safety invariants, and automatic deterministic
fallback from AnthropicReasoner.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Optional

from app.pipeline.anthropic_reasoner import AnthropicClient, AnthropicReasoner
from app.pipeline.reasoning import DeterministicReasoner, Reasoner

DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b"
DEFAULT_BASE_URL = "https://api.groq.com/openai/v1"
logger = logging.getLogger(__name__)


class _RealGroqClient:
    """HTTP client adapter for Groq's chat completions API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 15.0,
    ) -> None:
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def create_message(
        self, *, model: str, max_tokens: int, system: str, user: str
    ) -> str:
        import httpx

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "digital-safety-copilot/1.0",
        }
        payload = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.0,
        }

        with httpx.Client(timeout=self.timeout) as client:
            for attempt in range(3):
                resp = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if (resp.status_code == 429 or 500 <= resp.status_code <= 599) and attempt < 2:
                    delay = float(2 ** attempt)
                    try:
                        retry_after = float(resp.headers.get("retry-after", "0"))
                        if 0 <= retry_after <= 30:
                            delay = max(delay, retry_after)
                        elif retry_after > 30:
                            # Do not hold the demo request open for a long quota reset.
                            resp.raise_for_status()
                    except ValueError:
                        pass
                    logger.warning("Groq retry: status=%s retry=%s/2 delay_seconds=%.3f",
                                   resp.status_code, attempt + 1, delay)
                    time.sleep(delay)
                    continue
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]


class GroqReasoner(AnthropicReasoner):
    """Groq model-backed reasoner with grounding validation and fallback."""

    def __init__(
        self,
        client: AnthropicClient,
        model: Optional[str] = None,
        fallback: Optional[Reasoner] = None,
    ) -> None:
        resolved_model = model or os.environ.get("GROQ_MODEL") or DEFAULT_GROQ_MODEL
        super().__init__(
            client=client,
            model=resolved_model,
            fallback=fallback or DeterministicReasoner(),
        )
