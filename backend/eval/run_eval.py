"""Evaluation runner CLI.

Usage:
    python -m eval.run_eval                 # deterministic mode (default)
    python -m eval.run_eval --mode anthropic  # model mode (needs API key)

Writes eval/results.csv and prints the metrics report. Reproducible: uses the
fixed domain-age map so the same dataset yields the same numbers.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from app.pipeline import domain_age

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from eval.domain_ages import EvalDomainAgeProvider
from eval.harness import (
    compute_metrics,
    load_dataset,
    make_reasoner,
    run_dataset,
    target_report,
    write_results,
)

_HERE = Path(__file__).resolve().parent
DATASET = _HERE / "dataset.csv"
RESULTS = _HERE / "results.csv"


def _pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Digital Safety Co-pilot evaluation.")
    parser.add_argument(
        "--mode",
        choices=["deterministic", "anthropic", "groq"],
        default="deterministic",
        help="Reasoning mode. deterministic needs no API key.",
    )
    parser.add_argument("--dataset", default=str(DATASET))
    parser.add_argument("--results", default=str(RESULTS))
    parser.add_argument("--groundedness-sample", type=int, default=20)
    args = parser.parse_args()

    # Fixed domain ages -> reproducible run, no network.
    domain_age.set_provider(EvalDomainAgeProvider())

    reasoner, resolved_mode = make_reasoner(args.mode)
    rows = load_dataset(args.dataset)
    outcomes = run_dataset(rows, reasoner=reasoner, groundedness_sample=args.groundedness_sample)
    write_results(outcomes, args.results)

    metrics = compute_metrics(outcomes, resolved_mode, args.groundedness_sample)
    report = target_report(metrics)

    print("=" * 62)
    print("  Digital Safety Co-pilot — Evaluation")
    print("=" * 62)
    print(f"  Mode:            {metrics.mode}")
    print(f"  Dataset:         n={metrics.n}  ({metrics.n_scam} scam / {metrics.n_legit} legit)")
    degraded = sum(1 for o in outcomes if o.degraded)
    print(f"  Degraded rows:   {degraded}/{metrics.n} "
          f"({'expected in deterministic mode' if 'deterministic' in metrics.mode else 'model unreachable on these'})")
    print("-" * 62)

    def line(label, key, shown):
        r = report[key]
        status = "PASS" if r["pass"] else "MISS"
        op = r["op"]
        tgt = r["target"]
        tgt_s = (f"{tgt[0]*100:.0f}-{tgt[1]*100:.0f}%" if op == "range"
                 else f"{op} {tgt*100:.0f}%")
        print(f"  {label:<26} {shown:>8}   target {tgt_s:<10} [{status}]")

    line("Detection rate", "detection_rate", _pct(metrics.detection_rate))
    line("False positive rate", "false_positive_rate", _pct(metrics.false_positive_rate))
    line("Dangerous-tier precision", "dangerous_precision", _pct(metrics.dangerous_precision))
    line("Cannot Determine rate", "cannot_determine_rate", _pct(metrics.cannot_determine_rate))
    line("Explanation groundedness", "groundedness",
         f"{_pct(metrics.groundedness)}")
    print(f"  (groundedness sample size: {metrics.groundedness_sample_size})")
    print("-" * 62)

    print("  Per-category flag rate:")
    for cat, m in metrics.per_category.items():
        kind = "scam " if m["true_label_is_scam"] else "legit"
        print(f"    [{kind}] {cat:<22} {int(m['flagged'])}/{int(m['n'])}  "
              f"({_pct(m['flag_rate'])})")
    print("=" * 62)

    print(f"  Results written to: {args.results}")


if __name__ == "__main__":
    main()
