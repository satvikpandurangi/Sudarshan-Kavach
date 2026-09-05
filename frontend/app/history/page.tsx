"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Analysis } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const data: Analysis[] = JSON.parse(localStorage.getItem("sk-history") || "[]");
      setAnalyses(data);
    } catch {
      setAnalyses([]);
    }
  }, []);

  const filtered = analyses.filter((item) => {
    if (filter === "ALL") return true;
    return item.riskLevel === filter;
  });

  const countByRisk = (level: "HIGH" | "MEDIUM" | "LOW") =>
    analyses.filter((a) => a.riskLevel === level).length;

  return (
    <div className="main-viewport-wrapper">
      <Nav />

      <main className="page-container" style={{ flex: 1 }}>
        {/* Header Section */}
        <div style={{ marginBottom: "28px" }}>
          <h1 className="heading-xl page-title" style={{ marginBottom: "8px" }}>
            {t.history.title}
          </h1>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid-4" style={{ marginBottom: "28px" }}>
          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.history.all}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
              {analyses.length}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.history.high}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-dangerous)", marginTop: "4px" }}>
              {countByRisk("HIGH")}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.history.medium}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-suspicious)", marginTop: "4px" }}>
              {countByRisk("MEDIUM")}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.history.low}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-safe)", marginTop: "4px" }}>
              {countByRisk("LOW")}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "4px", scrollbarWidth: "none" }}>
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                background: filter === lvl ? "var(--brand-orange)" : "#ffffff",
                color: filter === lvl ? "#ffffff" : "var(--text-secondary)",
                border: "1px solid",
                borderColor: filter === lvl ? "var(--brand-orange)" : "var(--border-subtle)",
                borderRadius: "9999px",
                padding: "8px 18px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                minHeight: "42px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "manipulation",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {lvl === "ALL"
                ? t.history.all
                : lvl === "HIGH"
                ? t.history.high
                : lvl === "MEDIUM"
                ? t.history.medium
                : t.history.low}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((item) => {
              const isHigh = item.riskLevel === "HIGH";
              const isMedium = item.riskLevel === "MEDIUM";

              return (
                <Link
                  href={`/result/${item.id}`}
                  key={item.id}
                  className="card-premium"
                  style={{
                    padding: "clamp(12px, 3.5vw, 18px)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap",
                    borderLeft: `5px solid ${
                      isHigh ? "var(--risk-dangerous)" : isMedium ? "var(--risk-suspicious)" : "var(--risk-safe)"
                    }`,
                  }}
                >
                  <div style={{ maxWidth: "600px", minWidth: 0, flex: "1 1 220px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "var(--bg-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.inputType}
                      </span>
                      <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {item.classification}
                    </h3>
                    <p
                      className="text-muted"
                      style={{
                        fontSize: "0.86rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                    >
                      {item.submitted}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 900,
                          color: isHigh
                            ? "var(--risk-dangerous)"
                            : isMedium
                            ? "var(--risk-suspicious)"
                            : "var(--risk-safe)",
                        }}
                      >
                        {item.riskScore}
                        <small style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/100</small>
                      </div>
                      <span
                        style={{
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          color: isHigh
                            ? "var(--risk-dangerous)"
                            : isMedium
                            ? "var(--risk-suspicious)"
                            : "var(--risk-safe)",
                        }}
                      >
                        {item.riskLevel === "LOW" ? t.common.verifiedSafe : `${t.risk[item.riskLevel as "LOW" | "MEDIUM" | "HIGH"]} ${t.common.riskWord}`}
                      </span>
                    </div>

                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* High-Quality Empty State with Shield Illustration */
          <div className="card-premium" style={{ textAlign: "center", padding: "64px 20px" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--brand-orange-light)",
                color: "var(--brand-orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                border: "1px solid var(--brand-orange-subtle)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="heading-md" style={{ marginBottom: 6 }}>
              {t.history.emptyTitle}
            </h3>
            <p className="text-muted" style={{ maxWidth: "450px", margin: "0 auto 24px", fontSize: "0.95rem" }}>
              {t.history.emptySubtitle}
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Run Your First Scan
            </Link>
          </div>
        )}
      </main>

      {/* Commercial SaaS Footer */}
      <Footer />
    </div>
  );
}
