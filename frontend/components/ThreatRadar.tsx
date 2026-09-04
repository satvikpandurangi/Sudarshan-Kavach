"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export function ThreatRadar() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleTestScam = (sampleText: string) => {
    sessionStorage.setItem("sk-prefill-input", sampleText);
    router.push("/dashboard");
  };

  const trends = t.radar?.trends || [];

  return (
    <section className="card-premium" style={{ margin: "32px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <div className="eyebrow" style={{ color: "#ef4444", background: "#fef2f2", borderColor: "#fecaca" }}>
            <span className="pulse-dot" style={{ backgroundColor: "#ef4444" }} />
            <span>{t.radar.eyebrow}</span>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: "6px" }}>
            {t.radar.title}
          </h2>
          <p className="text-secondary" style={{ fontSize: "1rem", maxWidth: "680px" }}>
            {t.radar.subtitle}
          </p>
        </div>
      </div>

      <div className="grid-2">
        {trends.map((trend) => (
          <div
            key={trend.id}
            style={{
              padding: "clamp(16px, 4vw, 24px)",
              borderRadius: "16px",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
              transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.06em", color: "var(--brand-orange-dark)", textTransform: "uppercase" }}>
                  {trend.tag}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    background: trend.severity === "CRITICAL" ? "#ef4444" : "#f59e0b",
                    color: "#fff",
                  }}
                >
                  {trend.severity} {t.common.riskWord}
                </span>
              </div>

              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                {trend.name}
              </h3>

              {/* Sample Box */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  color: "#334155",
                  lineHeight: 1.5,
                  marginBottom: "12px",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                &ldquo;{trend.sample}&rdquo;
              </div>

              <p className="text-secondary" style={{ fontSize: "0.86rem", lineHeight: 1.5 }}>
                {trend.explanation}
              </p>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => handleTestScam(trend.sample)}
              style={{ width: "100%", fontSize: "0.88rem", padding: "10px 14px", minHeight: "40px" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {t.radar.testBtn}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
