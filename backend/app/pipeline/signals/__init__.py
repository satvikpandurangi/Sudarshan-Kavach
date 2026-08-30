"""Signal layer: independent deterministic detectors.

Each detector is a pure function from NormalizedInput to a list of Signal
objects. Every Signal carries a mandatory `evidence` span that is an exact
substring of the submitted content.

Adding a detector in a later phase is just: write the function, register it in
DETECTORS. The arbitration layer consumes the combined list and does not care
which detector produced what.
"""

from __future__ import annotations

from typing import Callable, List

from app.pipeline.normalizer import NormalizedInput
from app.schemas import Signal

from . import patterns, url_inspector, brand_lookalike, contact_channel

# The detector registry. Order does not matter — arbitration reads severities.
DETECTORS: List[Callable[[NormalizedInput], List[Signal]]] = [
    url_inspector.detect,
    brand_lookalike.detect,
    patterns.detect,
    contact_channel.detect,
]


def run_all(normalized: NormalizedInput) -> List[Signal]:
    """Run every registered detector and collect the signals."""
    signals: List[Signal] = []
    for detector in DETECTORS:
        try:
            signals.extend(detector(normalized))
        except Exception:
            # A single misbehaving detector must not take down the pipeline.
            # Degraded-but-useful beats a 500. Phase 2 can add logging here.
            continue
    return signals
