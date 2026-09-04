"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState("");
  const [expiry, setExpiry] = useState<number | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");
  const [fromCheck, setFromCheck] = useState(false);
  const router = useRouter();
  const { t, lang } = useTranslation();

  const isKn = lang === "kn";
  const isHi = lang === "hi";

  useEffect(() => {
    try {
      const user = localStorage.getItem("sk-user");
      if (user) {
        const params = new URLSearchParams(window.location.search);
        router.replace(params.get("redirect") || "/dashboard");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectUrl(redirect);
        setFromCheck(true);
      }
    } catch {}
  }, [router]);


  async function handleRequestOtp() {
    setError("");
    const cleanPhone = mobile.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(
        isKn
          ? "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "कृपया एक वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to request OTP.");
        return;
      }

      setHash(data.hash);
      setExpiry(data.expiry);
      setIsDemoMode(Boolean(data.isDemoMode));
      if (data.demoOtp) {
        setDemoOtp(data.demoOtp);
      }
      setOtpStep(true);
    } catch {
      setError("Network error requesting verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    const cleanOtp = code.trim();
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      setError(
        isKn
          ? "ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ."
          : isHi
          ? "कृपया 6 अंकों का सत्यापन कोड दर्ज करें।"
          : "Please enter a 6-digit verification code."
      );
      return;
    }

    const cleanPhone = mobile.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: cleanOtp,
          hash,
          expiry,
          name: name.trim() || "Citizen",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please check the code.");
        return;
      }

      // Stateless session: store signed JWT and user profile in client localStorage only
      if (data.token) {
        localStorage.setItem("sk-auth-token", data.token);
      }
      localStorage.setItem("sk-user", JSON.stringify(data.user));

      router.push(redirectUrl);
    } catch {
      setError("Network error verifying code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-viewport-wrapper">
      <Nav />

      <main
        className="shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px 80px",
        }}
      >
        <div
          className="card-premium"
          style={{
            maxWidth: "460px",
            width: "100%",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {/* Security Gate Notice when redirected from Check Now */}
          {fromCheck && (
            <div
              style={{
                marginBottom: "22px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                border: "1.5px solid rgba(249, 115, 22, 0.35)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                boxShadow: "0 2px 10px rgba(249, 115, 22, 0.1)",
              }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🛡️</span>
              <div>
                <strong style={{ display: "block", color: "#9a3412", fontSize: "0.88rem", marginBottom: 2 }}>
                  {t.login.authRequiredTitle}
                </strong>
                <span style={{ fontSize: "0.82rem", color: "#c2410c", lineHeight: 1.4 }}>
                  {t.login.authRequiredDesc}
                </span>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <img
                src="/sudarshan-shield-emblem.png"
                alt="Sudarshan Kavach Logo"
                style={{
                  height: "56px",
                  width: "56px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 14px rgba(234, 88, 12, 0.35))",
                }}
              />
            </div>

            <h1 className="heading-lg" style={{ fontSize: "1.6rem", marginBottom: "6px" }}>
              {t.login.title}
            </h1>
            <p className="text-secondary" style={{ fontSize: "0.92rem" }}>
              {t.login.subtitle}
            </p>
          </div>


          {/* Demo Mode Badge */}
          {isDemoMode && otpStep && demoOtp && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: "0.86rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    DEMO MODE
                  </span>
                  <strong>Venue SMS Simulated</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setCode(demoOtp)}
                  style={{
                    fontSize: "0.78rem",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#047857",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Autofill Code: {demoOtp}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#047857" }}>
                Venue Wi-Fi often delays carrier SMS. Use this generated code directly for the demonstration.
              </p>
            </div>
          )}

          {!otpStep ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                  {t.login.fullName} <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "0.78rem" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="analysis-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  disabled={loading}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                  {t.login.mobileNumber}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      borderRadius: "10px",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    className="analysis-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: "#ef4444", fontSize: "0.84rem", fontWeight: 600, marginTop: "4px" }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRequestOtp}
                disabled={loading}
                style={{ width: "100%", marginTop: "8px" }}
              >
                {loading ? "Sending Code..." : t.login.btnContinue}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--bg-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.88rem",
                }}
              >
                <span>
                  {t.login.sentTo} <strong>+91 {mobile}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand-orange)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  {t.login.editNumber}
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                  {t.login.otpCode}
                </label>
                <input
                  type="text"
                  className="analysis-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.2rem", fontWeight: 800 }}
                />
              </div>

              {error && (
                <div style={{ color: "#ef4444", fontSize: "0.84rem", fontWeight: 600, marginTop: "4px" }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerifyOtp}
                disabled={loading}
                style={{ width: "100%", marginTop: "8px" }}
              >
                {loading ? "Verifying..." : t.login.btnVerify}
              </button>
            </div>
          )}

          {/* Zero DB Notice */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🔒</span>
            <div>
              <strong>{t.login.zeroDbTitle}</strong> — {t.login.zeroDbDesc}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
