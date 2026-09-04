"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ShieldChakra3D } from "@/components/ShieldChakra3D";
import { ThreatRadar } from "@/components/ThreatRadar";
import { useTranslation } from "@/lib/i18n";

export default function Home() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [showUpcomingNotice, setShowUpcomingNotice] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    try {
      setIsAuth(Boolean(localStorage.getItem("sk-user")));
    } catch {
      setIsAuth(false);
    }
  }, []);

  const handleCheckNow = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem("sk-user");
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login?redirect=/dashboard");
      }
    } catch {
      router.push("/login?redirect=/dashboard");
    }
  };

  return (
    <div className="main-viewport-wrapper">
      <Nav />
      <main className="shell">

        {/* Hero Section */}
        <section className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "40px", alignItems: "center", padding: "50px 0 60px" }}>
          <div>
            <div className="eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              {t.hero.eyebrow}
            </div>

            <h1 className="heading-xl">
              {t.hero.title} <span className="text-gradient-orange">{t.hero.highlight}</span>
            </h1>

            <p className="lead-text">
              {t.hero.subtitle}
            </p>

            <div className="hero-cta-group" style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginBottom: "28px" }}>
              <Link
                href={isAuth ? "/dashboard" : "/login?redirect=/dashboard"}
                onClick={handleCheckNow}
                className="btn btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                {t.hero.ctaCheck}
              </Link>

              <a href="#how-it-works" className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                {t.hero.ctaHow}
              </a>
            </div>

            {/* Trust Guarantee Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
              <span style={{ color: "#10b981", fontSize: "1.1rem" }}>✓</span>
              <span>{t.hero.trustBadge}</span>
            </div>
          </div>

          {/* 3D Golden Sudarshan Chakra Hero Visual */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ShieldChakra3D />
          </div>
        </section>

        {/* WhatsApp Bot: The Grandmother Installs Nothing Path (Phase 5) */}
        <section style={{ marginBottom: "40px" }} id="whatsapp-bot">
          <div
            className="card-premium"
            style={{
              padding: "32px 28px",
              background: "linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(18, 140, 126, 0.04) 100%)",
              border: "1.5px solid rgba(37, 211, 102, 0.35)",
              borderRadius: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    background: "var(--brand-orange-light, #fff7ed)",
                    color: "var(--brand-orange-dark, #c2410c)",
                    border: "1px solid var(--brand-orange-subtle, #fed7aa)",
                  }}
                >
                  UPCOMING
                </span>
              </div>

              <h2 className="heading-lg" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", marginBottom: "12px", color: "var(--text-primary)" }}>
                {t.whatsappBot.title}
              </h2>

              <p className="lead-text" style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginBottom: "18px", lineHeight: 1.6 }}>
                {t.whatsappBot.description}
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowUpcomingNotice(true)}
                  className="btn btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    borderColor: "#128C7E",
                    color: "#fff",
                    fontWeight: 800,
                    padding: "12px 24px",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 6px 18px rgba(37, 211, 102, 0.35)",
                    cursor: "pointer",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  {t.whatsappBot.chatBtn}
                </button>
              </div>

              {showUpcomingNotice && (
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    border: "1.5px solid #fed7aa",
                    boxShadow: "0 4px 14px rgba(234, 88, 12, 0.08)",
                    marginTop: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <strong style={{ display: "block", color: "#c2410c", fontSize: "0.95rem", marginBottom: 6 }}>
                        Under construction.
                      </strong>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        Forwarding to WhatsApp will let anyone check a message without installing anything. We are building this without routing messages through a third-party provider, so it is not live yet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpcomingNotice(false)}
                      style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#9ca3af", padding: "0 4px" }}
                      aria-label="Close notice"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Steps Card */}
            <div
              style={{
                background: "#ffffff",
                padding: "20px 22px",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                How It Works:
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    1
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block" }}>
                      Forward SMS or Link
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Forward any suspicious message directly to the WhatsApp bot when live.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    2
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block" }}>
                      Auto Language Detection
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Detects Kannada, Telugu, Hindi or English script automatically.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                    3
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)", display: "block" }}>
                      Instant Screen Verdict
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Compact 🔴 DANGEROUS or ✅ SAFE verdict returned in seconds.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Differentiators / Features */}
        <section style={{ padding: "40px 0" }}>
          <div className="grid-3">
            <div className="card-premium">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "var(--brand-orange-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "var(--brand-orange)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="heading-md" style={{ fontSize: "1.15rem", marginBottom: "8px" }}>
                {t.hero.feature1Title}
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {t.hero.feature1Desc}
              </p>
            </div>

            <div className="card-premium">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "#3b82f6",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="heading-md" style={{ fontSize: "1.15rem", marginBottom: "8px" }}>
                {t.hero.feature2Title}
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {t.hero.feature2Desc}
              </p>
            </div>

            <div className="card-premium">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "#10b981",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="heading-md" style={{ fontSize: "1.15rem", marginBottom: "8px" }}>
                {t.hero.feature3Title}
              </h3>
              <p className="text-secondary" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {t.hero.feature3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Live Indian Cyber Threat Radar */}
        <ThreatRadar />

        {/* How It Works Section */}
        <section id="how-it-works" style={{ padding: "60px 0 40px" }}>
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 48px" }}>
            <div className="eyebrow" style={{ display: "inline-flex" }}>
              <span>EXPLAINABLE DEFENSE WORKFLOW</span>
            </div>
            <h2 className="heading-lg" style={{ marginTop: "12px", marginBottom: "12px" }}>
              {t.hero.howTitle}
            </h2>
            <p className="text-secondary" style={{ fontSize: "1rem" }}>
              {t.hero.howSubtitle}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {t.hero.howSteps.map((step, idx) => (
              <div
                key={idx}
                className="card-premium"
                style={{
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--brand-orange)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  {idx + 1}
                </div>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Fraud Safety Resources Bar */}
        <section
          style={{
            background: "linear-gradient(135deg, #090d16 0%, #1e293b 100%)",
            color: "#fff",
            borderRadius: "24px",
            padding: "36px 32px",
            margin: "40px 0 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ maxWidth: "550px" }}>
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "0.74rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {lang === "kn" ? "ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ 1930" : lang === "hi" ? "राष्ट्रीय हेल्पलाइन 1930" : "NATIONAL HELPLINE 1930"}
            </span>
            <h3 className="heading-md" style={{ color: "#fff", marginTop: 12, marginBottom: 6 }}>
              {t.hero.emergencyHeading}
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{t.hero.emergencySub}</p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/safety"
              className="btn btn-danger"
              style={{
                background: "#ef4444",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
                fontWeight: 800,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {lang === "kn" ? "ನಾನು ಈಗಾಗಲೇ ಹಣ ಪಾವತಿಸಿದ್ದೇನೆ ಅಥವಾ ನನ್ನ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದೇನೆ" : lang === "hi" ? "मैंने पहले ही भुगतान कर दिया है या विवरण साझा कर दिया है" : lang === "te" ? "నేను ఇప్పటికే డబ్బు చెల్లించాను లేదా నా వివరాలను పంచుకున్నాను" : "I have already paid or shared my details"}
            </Link>

            <a href="tel:1930" className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {t.hero.dial1930}
            </a>
          </div>
        </section>
      </main>

      {/* Commercial SaaS Footer with Shield Emblem without text */}
      <Footer />
    </div>
  );
}
