"use client";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScamSimulator } from "@/components/ScamSimulator";
import { useTranslation } from "@/lib/i18n";

import { GoldenHourIncidentFlow } from "@/components/GoldenHourIncidentFlow";

export default function SafetyPage() {
  const { t } = useTranslation();

  const playbooks = t.safety?.playbooks || [];

  return (
    <div className="main-viewport-wrapper">
      <Nav />

      <main className="page-container" style={{ flex: 1 }}>
        {/* Header Eyebrow & Title */}
        <div style={{ marginBottom: "28px" }}>
          <div className="eyebrow" style={{ color: "#ef4444", background: "#fef2f2", borderColor: "#fecaca" }}>
            <span className="pulse-dot" style={{ backgroundColor: "#ef4444" }} />
            <span>{t.safety.eyebrow}</span>
          </div>

          <h1 className="heading-xl" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: "8px" }}>
            {t.safety.title}
          </h1>

          <p className="text-secondary" style={{ fontSize: "1.05rem", maxWidth: "720px" }}>
            {t.safety.subtitle}
          </p>
        </div>

        {/* Guided Interactive Golden Hour Incident Flow */}
        <GoldenHourIncidentFlow />

        {/* Incident Playbooks Grid */}
        <div style={{ marginBottom: "32px" }}>
          <h2 className="heading-lg" style={{ marginBottom: "18px" }}>
            {t.safety.guidesTitle}
          </h2>

          <div className="grid-2">
            {playbooks.map((g) => (
              <article key={g.id} className="card-premium" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      color: "var(--brand-orange-dark)",
                      background: "var(--brand-orange-light)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--brand-orange-subtle)",
                    }}
                  >
                    #{g.id}
                  </span>
                </div>

                <h3 className="heading-md" style={{ fontSize: "1.1rem" }}>
                  {g.title}
                </h3>

                <p className="text-secondary" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {g.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Crucial Rule Card */}
        <section
          className="card-premium"
          style={{
            background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
            borderColor: "var(--brand-orange-subtle)",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "var(--brand-orange)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h3 className="heading-md" style={{ color: "var(--brand-orange-dark)", marginBottom: "4px" }}>
              {t.safety.rememberTitle}
            </h3>
            <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
              {t.safety.rememberText}
            </p>
          </div>
        </section>

        {/* Interactive Scam Awareness Simulator */}
        <ScamSimulator />
      </main>

      {/* Commercial SaaS Footer */}
      <Footer />
    </div>
  );
}
