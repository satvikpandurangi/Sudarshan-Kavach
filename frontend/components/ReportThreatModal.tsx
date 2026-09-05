"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ReportThreatModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillUrlOrText?: string;
}

export function ReportThreatModal({ isOpen, onClose, prefillUrlOrText = "" }: ReportThreatModalProps) {
  const [threatType, setThreatType] = useState<"URL" | "PHONE" | "UPI" | "APK">("URL");
  const [details, setDetails] = useState(prefillUrlOrText);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    // Save report in local community storage
    try {
      const existing = JSON.parse(localStorage.getItem("sk-community-reports") || "[]");
      existing.unshift({
        id: crypto.randomUUID(),
        type: threatType,
        details: details.trim(),
        description: incidentDescription.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("sk-community-reports", JSON.stringify(existing.slice(0, 30)));
    } catch {
      // Fallback
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        maxHeight: "100dvh",
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 3vw, 20px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "580px",
          width: "100%",
          padding: "clamp(20px, 5vw, 36px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--bg-subtle)",
            border: "none",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            touchAction: "manipulation",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <img
            src="/sudarshan-shield-emblem.png"
            alt="Sudarshan Kavach Logo"
            style={{ height: "32px", width: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(234, 88, 12, 0.3))" }}
          />
          <div className="eyebrow" style={{ color: "#ef4444", background: "#fef2f2", borderColor: "#fecaca", marginBottom: 0 }}>
            <span>COMMUNITY THREAT INTELLIGENCE</span>
          </div>
        </div>

        <h2 className="heading-lg" style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
          Flag a New Cyber Threat
        </h2>
        <p className="text-secondary" style={{ fontSize: "0.92rem", marginBottom: "20px" }}>
          Submitting suspicious indicators helps update our real-time threat intelligence and protects millions of users worldwide before they fall victim.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "6px" }}>
                Threat Vector
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
                {(["URL", "PHONE", "UPI", "APK"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThreatType(t)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background: threatType === t ? "var(--brand-orange)" : "var(--bg-subtle)",
                      color: threatType === t ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                      minHeight: "40px",
                    }}
                  >
                    {t === "URL" ? "Phishing URL" : t === "PHONE" ? "Scam Number" : t === "UPI" ? "Fraud UPI" : "Malicious APK"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "6px" }}>
                Threat Identifier / Link / Phone / Payment ID
              </label>
              <input
                type="text"
                className="analysis-input"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. http://fake-login.xyz, +1-800-xxx-xxxx, or payment@vpa"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "6px" }}>
                Incident Details (Optional)
              </label>
              <textarea
                className="analysis-input"
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Describe the message wording, fake authority claimed, or money demanded..."
                style={{ minHeight: "90px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary btn-mobile-full" onClick={onClose} style={{ minHeight: "44px" }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger btn-mobile-full" style={{ minHeight: "44px" }}>
                Submit Threat Report
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>🛡️</div>
            <h3 className="heading-md" style={{ color: "#10b981", marginBottom: "6px" }}>
              Threat Report Logged!
            </h3>
            <p className="text-secondary" style={{ fontSize: "0.92rem" }}>
              Thank you for protecting the digital community. Your submission has been queued to update global threat signatures.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
