"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Analysis } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  const [user, setUser] = useState({ name: "Guest User", mobile: "—" });
  const [history, setHistory] = useState<Analysis[]>([]);
  const [notice, setNotice] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("sk-user") || '{"name":"Guest User","mobile":"—"}'));
      setHistory(JSON.parse(localStorage.getItem("sk-history") || "[]"));
    } catch {
      // Fallback
    }
  }, []);

  const countByRisk = (level: string) => history.filter((x) => x.riskLevel === level).length;
  const latest = history[0];
  const totalScans = history.length;

  function clearHistory() {
    if (confirm("Are you sure you want to clear your private on-device analysis history?")) {
      localStorage.removeItem("sk-history");
      setHistory([]);
      setNotice(t.profile.historyCleared);
      setTimeout(() => setNotice(""), 4000);
    }
  }

  function handleSignOut() {
    if (confirm("Sign out of this session? (Your analysis history remains safely stored on this device)")) {
      localStorage.removeItem("sk-user");
      localStorage.removeItem("sk-token");
      window.location.href = "/login";
    }
  }

  const isLoggedIn = user.mobile && user.mobile !== "—";

  return (
    <div className="main-viewport-wrapper">
      <Nav />

      <main className="page-container" style={{ flex: 1 }}>
        {/* Header Section */}
        <div style={{ marginBottom: "28px" }}>
          <div className="eyebrow">{t.profile.eyebrow}</div>
          <h1 className="heading-xl page-title" style={{ marginBottom: "8px" }}>
            {t.profile.title}
          </h1>
        </div>

        {/* User Account Card */}
        <section className="card-premium" style={{ marginBottom: "24px", padding: "clamp(16px, 3.5vw, 24px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", minWidth: 0, flex: "1 1 240px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #fb923c, #ea580c)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  boxShadow: "0 6px 16px rgba(234, 88, 12, 0.3)",
                  flexShrink: 0,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    background: "var(--brand-orange-light)",
                    color: "var(--brand-orange-dark)",
                    border: "1px solid var(--brand-orange-subtle)",
                  }}
                >
                  {isLoggedIn ? "Verified Mobile Session" : t.profile.accountBadge}
                </span>
                <h2 style={{ fontSize: "clamp(1.15rem, 3.5vw, 1.3rem)", fontWeight: 800, marginTop: 4, marginBottom: 2, overflowWrap: "anywhere" }}>
                  {user.name}
                </h2>
                <p className="text-secondary" style={{ fontSize: "0.88rem" }}>
                  {isLoggedIn ? `+91 ${user.mobile}` : t.profile.noMobileText}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%", maxWidth: "160px", flex: "1 1 120px" }}>
              {isLoggedIn ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-mobile-full"
                  onClick={handleSignOut}
                  style={{ fontSize: "0.82rem", padding: "8px 16px", minHeight: "44px" }}
                >
                  {t.profile.signOutBtn}
                </button>
              ) : (
                <a
                  href="/login"
                  className="btn btn-primary btn-mobile-full"
                  style={{ fontSize: "0.82rem", padding: "8px 16px", minHeight: "44px", justifyContent: "center" }}
                >
                  {t.profile.authMobileBtn}
                </a>
              )}
            </div>
          </div>

          <p className="text-muted" style={{ fontSize: "0.86rem", marginTop: 18, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
            Stateless authentication: no server database or central user table. Your mobile number and scan history remain strictly in your browser&apos;s localStorage.
          </p>
        </section>

        {/* Security Metrics Grid */}
        <section className="grid-4" style={{ marginBottom: "24px" }}>
          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.profile.totalChecks}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
              {totalScans}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.profile.highRiskDetected}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-dangerous)", marginTop: 4 }}>
              {countByRisk("HIGH")}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.profile.mediumRiskDetected}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-suspicious)", marginTop: 4 }}>
              {countByRisk("MEDIUM")}
            </div>
          </div>

          <div className="card-premium" style={{ padding: "20px" }}>
            <span className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {t.profile.lowRiskDetected}
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--risk-safe)", marginTop: 4 }}>
              {countByRisk("LOW")}
            </div>
          </div>
        </section>

        {/* Latest Activity Preview */}
        <section className="card-premium" style={{ marginBottom: "24px" }}>
          <h3 className="heading-md" style={{ marginBottom: 12 }}>
            {t.profile.recentActivity}
          </h3>

          {latest ? (
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "var(--bg-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: "#ffffff",
                    color: "var(--text-secondary)",
                    marginRight: 8,
                  }}
                >
                  {latest.inputType}
                </span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{latest.classification}</span>
                <div className="text-muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>
                  {new Date(latest.createdAt).toLocaleString("en-IN")}
                </div>
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color:
                    latest.riskLevel === "HIGH"
                      ? "var(--risk-dangerous)"
                      : latest.riskLevel === "MEDIUM"
                      ? "var(--risk-suspicious)"
                      : "var(--risk-safe)",
                }}
              >
                {latest.riskScore}/100 • {latest.riskLevel === "LOW" ? "VERIFIED SAFE" : `${t.risk[latest.riskLevel as "LOW" | "MEDIUM" | "HIGH"]} RISK`}
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: "0.95rem" }}>
              {t.profile.noActivity}
            </p>
          )}
        </section>

        {/* Privacy Controls Section */}
        <section className="card-premium" style={{ padding: "clamp(16px, 3.5vw, 24px)" }}>
          <h3 className="heading-md" style={{ marginBottom: 6 }}>
            {t.profile.privacyTitle}
          </h3>
          <p className="text-secondary" style={{ fontSize: "0.92rem", marginBottom: 18 }}>
            {t.profile.privacyDesc}
          </p>

          <button className="btn btn-secondary btn-mobile-full" onClick={clearHistory} style={{ minHeight: "44px", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>{t.profile.clearHistoryBtn}</span>
          </button>

          {notice && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 600,
              }}
            >
              {notice}
            </div>
          )}
        </section>
      </main>

      {/* Commercial SaaS Footer */}
      <Footer />
    </div>
  );
}
