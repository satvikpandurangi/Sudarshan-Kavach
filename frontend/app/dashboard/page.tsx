"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Checker } from "@/components/Checker";
import { ThreatRadar } from "@/components/ThreatRadar";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const [userName, setUserName] = useState("Citizen");
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("sk-user") || "{}");
      if (user.name) setUserName(user.name);
    } catch {}
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      <main className="page-container" style={{ flex: 1 }}>
        {/* Header Control Center Greeting & Status */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
            <div className="eyebrow" style={{ marginBottom: 0 }}>
              <span className="pulse-dot" style={{ backgroundColor: "#10b981" }} />
              <span>{t.dashboard.greeting}, {userName.toUpperCase()} 👋</span>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  background: "#ecfdf5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="pulse-dot" style={{ backgroundColor: "#10b981", width: 6, height: 6 }} />
                <span>Detection Engine Active</span>
              </span>
            </div>
          </div>

          <h1 className="heading-xl" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: "8px" }}>
            {t.dashboard.title}
          </h1>

          <p className="text-secondary" style={{ fontSize: "1.05rem", maxWidth: "700px" }}>
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Security Control Station / Checker Form */}
        <Checker />

        {/* Informative Safety Guarantee Micro-Cards */}
        <div className="grid-3" style={{ marginTop: "32px" }}>
          <div
            style={{
              padding: "18px 20px",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ color: "var(--brand-orange)", marginTop: "2px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                {t.hero.feature2Title}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {t.hero.feature2Desc}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "18px 20px",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ color: "var(--brand-orange)", marginTop: "2px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                {t.hero.feature3Title}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {t.hero.feature3Desc}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "18px 20px",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ color: "var(--brand-orange)", marginTop: "2px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                {t.hero.feature1Title}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {t.hero.feature1Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Live Indian Threat Radar & Scam Trends */}
        <ThreatRadar />
      </main>

      {/* Commercial SaaS Footer */}
      <Footer />
    </div>
  );
}
