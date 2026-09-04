"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 0 30px",
        marginTop: "80px",
      }}
    >
      <div className="shell">
        {/* Main Footer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "50px",
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: "320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <img
                src="/sudarshan-shield-emblem.png"
                alt="Sudarshan Kavach Logo"
                style={{
                  height: "40px",
                  width: "40px",
                  objectFit: "contain",
                  flexShrink: 0,
                  filter: "drop-shadow(0 2px 8px rgba(234, 88, 12, 0.35))",
                }}
              />
              <div className="brand-text">
                <span className="brand-title" style={{ fontSize: "1.18rem" }}>{t.brand}</span>
              </div>
            </div>

            <p className="text-secondary" style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "18px" }}>
              {t.tagline}
            </p>

            {/* Live Uptime & Status Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "9999px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#065f46",
              }}
            >
              <span className="pulse-dot" style={{ backgroundColor: "#10b981", width: 6, height: 6 }} />
              <span>Prototype • YUKTIMANTHAN 2.0</span>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", color: "var(--text-primary)" }}>
              {t.footer.featuresTitle}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
              <li>
                <Link href="/dashboard" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.featureInspector}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.featureDecoder}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.featureOcr}
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.featureHistory}
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Legal Playbooks */}
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", color: "var(--text-primary)" }}>
              {t.footer.emergencyTitle}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
              <li>
                <a href="tel:1930" style={{ color: "#ef4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>☎</span> {t.footer.helpline1930}
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>◎</span> {t.footer.portalGov}
                </a>
              </li>
              <li>
                <Link href="/safety" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.recoveryChecklist}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.disputeGuide}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>›</span> {t.footer.apkGuide}
                </Link>
              </li>
            </ul>
          </div>

          {/* Threat Advisory Newsletter */}
          <div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", color: "var(--text-primary)" }}>
              {t.footer.feedTitle}
            </h4>
            <p className="text-secondary" style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "12px" }}>
              {t.footer.feedSubtitle}
            </p>

            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="citizen@security.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "16px", /* Prevents iOS Safari auto-zoom */
                  background: "#ffffff",
                  outline: "none",
                  minHeight: "44px",
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  minHeight: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  touchAction: "manipulation",
                }}
              >
                {t.footer.subscribeBtn}
              </button>
            </form>

            {subscribed && (
              <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
                {t.footer.subscribedMsg}
              </div>
            )}
          </div>
        </div>

        {/* Trust & Transparency Bar */}
        <div
          style={{
            padding: "20px 0 12px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <div>
            Links are never opened • No content stored • AI analysis via Groq
          </div>

          <div>
            {t.footer.builtWith}
          </div>
        </div>

        <div
          style={{
            paddingBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          Analysis is powered by the Groq API. Content leaves your device to be analyzed and is not retained. This is advisory guidance, not a guarantee.
        </div>

        {/* Copyright & Disclaimer */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <p>© {new Date().getFullYear()} {t.footer.rights}</p>
          <p style={{ maxWidth: "600px", textAlign: "right", fontSize: "0.76rem" }}>
            {t.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
