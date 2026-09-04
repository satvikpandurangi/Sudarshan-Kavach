"""Adapter tests use canned protocol responses, not an evaluation message corpus."""
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
sys.path.insert(0, str(ROOT / "eval"))
from bridge import measure
from app.schemas import Severity, Signal


class Client:
    def create_message(self, **kwargs):
        return json.dumps({"risk_level": "safe", "confidence": "high",
                           "summary": "unit fixture", "signal_explanations": {}})


class BridgeTest(unittest.TestCase):
    def test_observes_raw_downgrade_before_production_validation_discards_it(self):
        signals = [Signal(id=sid, severity=Severity.high, evidence="fixture")
                   for sid in ["advance_fee", "lookalike_domain"]]
        with patch("app.pipeline.analyzer.signal_layer.run_all", return_value=signals):
            trace = measure("unit fixture alpha beta", "en", Client())
        self.assertEqual(trace["model_proposed_level"], "safe")
        self.assertIsNone(trace["accepted_model_proposed_level"])
        self.assertEqual(trace["response"]["risk_level"], "dangerous")
        self.assertEqual(len(trace["raw_signals"]), 2)
        self.assertEqual(len(trace["reasoning_signals"]), 2)
        self.assertGreaterEqual(trace["latency_ms"], 0)

    def test_observes_provider_failure_instead_of_hiding_fallback(self):
        class FailingClient:
            def create_message(self, **kwargs):
                raise RuntimeError("unit rate-limit failure")
        with patch("app.pipeline.analyzer.signal_layer.run_all", return_value=[]):
            trace = measure("unit fixture alpha beta", "en", FailingClient())
        self.assertTrue(trace["response"]["degraded"])
        self.assertIsNone(trace["model_proposed_level"])
        self.assertIn("unit rate-limit failure", trace["model_error"])


if __name__ == "__main__":
    unittest.main()
