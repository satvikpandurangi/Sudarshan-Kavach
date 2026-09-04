"use client";

import { useEffect, useState } from "react";

interface RiskScoreGaugeProps {
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
  size?: number;
}

export function RiskScoreGauge({ score, riskLevel, size = 170 }: RiskScoreGaugeProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const targetScore = Math.max(0, Math.min(100, score || 0));

  // Count-up animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(eased * targetScore));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetScore]);

  // Color mapping
  const isCD = riskLevel === "CANNOT_DETERMINE";
  const color =
    riskLevel === "HIGH"
      ? "#ef4444"
      : riskLevel === "MEDIUM"
      ? "#f59e0b"
      : riskLevel === "LOW"
      ? "#10b981"
      : isCD
      ? "#3b82f6"
      : "#64748b";

  const glow =
    riskLevel === "HIGH"
      ? "rgba(239, 68, 68, 0.4)"
      : riskLevel === "MEDIUM"
      ? "rgba(245, 158, 11, 0.35)"
      : riskLevel === "LOW"
      ? "rgba(16, 185, 129, 0.35)"
      : isCD
      ? "rgba(59, 130, 246, 0.35)"
      : "rgba(100, 116, 139, 0.25)";

  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={`Security Risk Score: ${targetScore} out of 100, ${riskLevel} risk`}
      role="progressbar"
      aria-valuenow={targetScore}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 10px ${glow})` }}
      >
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(0, 0, 0, 0.07)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic score ring */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.1s ease-out, stroke 0.4s ease",
          }}
        />
      </svg>

      {/* Centered Score Label */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "2.4rem",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: color,
          }}
        >
          {displayedScore}
        </span>
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#64748b",
            marginTop: "2px",
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
