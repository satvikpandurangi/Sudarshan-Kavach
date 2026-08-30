// Lightweight loading state. A moving bar plus a cycling status line so a
// multi-second wait never looks frozen. No external animation libraries.

import { useEffect, useState } from "react";

const FALLBACK_STEPS = [
  "Reading the message…",
  "Checking links and domains…",
  "Looking for scam patterns…",
  "Writing the explanation…",
];

export default function Loading({ label, steps }) {
  const list = steps && steps.length ? steps : FALLBACK_STEPS;
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => {
      setStep((prev) => (prev + 1) % list.length);
    }, 1100);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-bar"><div className="loading-fill" /></div>
      <div className="loading-primary">{label || "Analysing…"}</div>
      <div className="loading-step">{list[step]}</div>
    </div>
  );
}
