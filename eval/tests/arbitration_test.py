"""Direct safety-property tests against production arbitration; no pipeline/model calls."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))
from app.pipeline.arbitration import arbitrate
from app.pipeline.normalizer import NormalizedInput
from app.pipeline.reasoning import ReasoningResult
from app.schemas import Confidence, RiskLevel, Severity, Signal


class ArbitrationSafetyTest(unittest.TestCase):
    def setUp(self):
        self.input = NormalizedInput(raw="unit fixture alpha beta", text="unit fixture alpha beta")

    def final(self, signals, proposal):
        reasoning = ReasoningResult(signals=signals, summary=None,
                                    proposed_level=proposal, proposed_confidence=Confidence.high)
        return arbitrate(self.input, signals, reasoning)[0]

    def signals(self, ids, severity=Severity.high):
        return [Signal(id=sid, severity=severity, evidence="alpha") for sid in ids]

    def test_two_independent_high_signals_cannot_be_lowered_by_safe_model(self):
        # Actual independent signal ids, avoiding intentional alias deduplication.
        for ids in [("lookalike_domain", "credential_request"),
                    ("advance_fee", "upi_pin_requested"),
                    ("collect_request_to_receive", "upi_pin_requested")]:
            with self.subTest(ids=ids):
                self.assertEqual(self.final(self.signals(ids), RiskLevel.safe), RiskLevel.dangerous)

    def test_every_lower_model_proposal_keeps_dangerous_floor(self):
        for proposal in [RiskLevel.safe, RiskLevel.cannot_determine, RiskLevel.suspicious, None]:
            with self.subTest(proposal=proposal):
                self.assertEqual(self.final(self.signals(["advance_fee", "lookalike_domain"]), proposal),
                                 RiskLevel.dangerous)

    def test_single_high_and_medium_floors_cannot_be_lowered(self):
        for severity in [Severity.high, Severity.medium]:
            for proposal in [RiskLevel.safe, RiskLevel.cannot_determine, None]:
                with self.subTest(severity=severity, proposal=proposal):
                    self.assertEqual(self.final(self.signals(["advance_fee"], severity), proposal),
                                     RiskLevel.suspicious)

    def test_model_can_raise_risk(self):
        self.assertEqual(self.final([], RiskLevel.dangerous), RiskLevel.dangerous)
        self.assertEqual(self.final(self.signals(["advance_fee"]), RiskLevel.dangerous), RiskLevel.dangerous)


if __name__ == "__main__":
    unittest.main()
