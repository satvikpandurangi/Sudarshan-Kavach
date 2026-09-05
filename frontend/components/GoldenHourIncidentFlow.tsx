"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

export interface IncidentDetails {
  amountLost?: string;
  approxTime?: string;
  upiTxnId?: string;
  beneficiaryInfo?: string;
  scammerContact?: string;
  description?: string;
}

export interface IncidentState {
  isActive: boolean;
  startedAt: number;
  currentStep: number;
  step1Called1930: boolean;
  step1CompletedAt?: number;
  step2CalledBank: boolean;
  step2BankCardNumber?: string;
  step2CompletedAt?: number;
  details: IncidentDetails;
  complaintCopied?: boolean;
}

const STORAGE_KEY = "sk_incident";
const PREFILL_KEY = "sk_prefill_incident_msg";

export function generateComplaintNarrative(details: IncidentDetails, step1Called1930: boolean, step2CalledBank: boolean): string {
  const lines: string[] = [];
  lines.push("===============================================================");
  lines.push("INCIDENT COMPLAINT NARRATIVE — NATIONAL CYBER CRIME REPORTING PORTAL (cybercrime.gov.in)");
  lines.push("Subject: Urgent Financial Fraud Report — Golden Hour Asset Recovery Request");
  lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
  lines.push("===============================================================");
  lines.push("");

  lines.push("1. INCIDENT DESCRIPTION & MODUS OPERANDI:");
  if (details.description && details.description.trim()) {
    lines.push(details.description.trim());
  } else {
    lines.push("I fell victim to an unauthorized cyber financial fraud where I was deceived into authorizing an illicit transaction under false pretenses.");
  }
  lines.push("");

  const txnItems: string[] = [];
  if (details.amountLost && details.amountLost.trim()) {
    txnItems.push(`- Disputed Amount Lost: ₹${details.amountLost.trim()}`);
  }
  if (details.approxTime && details.approxTime.trim()) {
    txnItems.push(`- Date and Approximate Time of Transaction: ${details.approxTime.trim()}`);
  }
  if (details.upiTxnId && details.upiTxnId.trim()) {
    txnItems.push(`- Transaction Reference / UTR Number: ${details.upiTxnId.trim()}`);
  }
  if (details.beneficiaryInfo && details.beneficiaryInfo.trim()) {
    txnItems.push(`- Beneficiary / Recipient UPI ID or Bank Account: ${details.beneficiaryInfo.trim()}`);
  }
  if (details.scammerContact && details.scammerContact.trim()) {
    txnItems.push(`- Suspect Phone Number / Fraud Message Used: ${details.scammerContact.trim()}`);
  }

  if (txnItems.length > 0) {
    lines.push("2. TRANSACTION & EVIDENCE PARTICULARS:");
    lines.push(...txnItems);
    lines.push("");
  }

  lines.push("3. IMMEDIATE ACTIONS TAKEN:");
  lines.push(`- Reported to National Cyber Helpline (1930): ${step1Called1930 ? "YES (Contacted immediately)" : "Pending / In Progress"}`);
  lines.push(`- Bank Fraud Center Contacted for UPI/Account Freeze & Recall: ${step2CalledBank ? "YES (Compromise reported to bank)" : "Pending / In Progress"}`);
  lines.push("");

  lines.push("4. PRAYER / RELIEF REQUESTED:");
  lines.push("In accordance with the Ministry of Home Affairs and Reserve Bank of India Citizen Financial Fraud reporting protocols, I request the Cybercrime Nodal Authorities and Bank Nodal Officers to kindly freeze the beneficiary mule account immediately, stop further fund settlement, and initiate an official transaction recall.");

  return lines.join("\n");
}

export function GoldenHourIncidentFlow() {
  const { lang } = useTranslation();
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  const L = (en: string, kn: string, hi: string, te?: string) => {
    if (lang === "kn") return kn;
    if (lang === "hi") return hi;
    if (lang === "te") return te || en;
    return en;
  };
  const [incident, setIncident] = useState<IncidentState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage or URL parameter
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let initial: IncidentState | null = null;
      if (saved) {
        initial = JSON.parse(saved);
      }

      // Check URL for auto-start or prefilled message
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const shouldStart = params.get("flow") === "start";
        const prefillMsg = sessionStorage.getItem(PREFILL_KEY) || params.get("prefillMsg") || "";

        if (shouldStart || !initial) {
          if (!initial && shouldStart) {
            initial = {
              isActive: true,
              startedAt: Date.now(),
              currentStep: 1,
              step1Called1930: false,
              step2CalledBank: false,
              details: {
                scammerContact: prefillMsg || "",
              },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
          } else if (initial && prefillMsg && !initial.details.scammerContact) {
            initial.details.scammerContact = prefillMsg;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
          }
        }
      }

      if (initial) {
        setIncident(initial);
        setActiveTab(initial.currentStep || 1);
      }
    } catch (e) {
      console.error("Failed to parse incident state:", e);
    }
  }, []);

  // Live Timer: live-counting elapsed timer (MM:SS) pinned at top
  useEffect(() => {
    if (!incident?.isActive || !incident.startedAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - incident.startedAt) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [incident?.isActive, incident?.startedAt]);

  const saveState = (updated: IncidentState) => {
    setIncident(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save incident state:", e);
    }
  };

  const startFlow = (prefill?: string) => {
    const fresh: IncidentState = {
      isActive: true,
      startedAt: Date.now(),
      currentStep: 1,
      step1Called1930: false,
      step2CalledBank: false,
      details: {
        scammerContact: prefill || sessionStorage.getItem(PREFILL_KEY) || "",
      },
    };
    saveState(fresh);
    setActiveTab(1);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearIncident = () => {
    const confirmMsg = L(
      "Are you sure you want to clear your active incident record? This will reset all steps and remove the record from your browser.",
      "ನಿಮ್ಮ ಸಕ್ರಿಯ ಘಟನಾ ದಾಖಲೆಯನ್ನು ತೆರವುಗೊಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ? ಇದು ಎಲ್ಲಾ ಹಂತಗಳನ್ನು ಮರುಹೊಂದಿಸುತ್ತದೆ.",
      "क्या आप वाकई अपना सक्रिय घटना रिकॉर्ड हटाना चाहते हैं? यह सभी चरणों को रीसेट कर देगा।",
      "మీ క్రియాశీల సంఘటన రికార్డును తొలగించాలనుకుంటున్నారా? ఇది అన్ని దశలను రీసెట్ చేస్తుంది మరియు మీ బ్రౌజర్ నుండి రికార్డును తొలగిస్తుంది."
    );
    if (window.confirm(confirmMsg)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(PREFILL_KEY);
      } catch (e) {}
      setIncident(null);
      setElapsedSeconds(0);
      setActiveTab(1);
    }
  };

  const updateDetails = (key: keyof IncidentDetails, value: string) => {
    if (!incident) return;
    const updated: IncidentState = {
      ...incident,
      details: {
        ...incident.details,
        [key]: value,
      },
    };
    saveState(updated);
  };

  const setStep1Called = (checked: boolean) => {
    if (!incident) return;
    const updated: IncidentState = {
      ...incident,
      step1Called1930: checked,
      step1CompletedAt: checked ? Date.now() : undefined,
      currentStep: checked ? Math.max(2, incident.currentStep) : incident.currentStep,
    };
    saveState(updated);
    if (checked && activeTab === 1) {
      setActiveTab(2);
    }
  };

  const setStep2Called = (checked: boolean) => {
    if (!incident) return;
    const updated: IncidentState = {
      ...incident,
      step2CalledBank: checked,
      step2CompletedAt: checked ? Date.now() : undefined,
      currentStep: checked ? Math.max(3, incident.currentStep) : incident.currentStep,
    };
    saveState(updated);
    if (checked && activeTab === 2) {
      setActiveTab(3);
    }
  };

  const goToStep = (step: number) => {
    if (!incident) return;
    const updated = {
      ...incident,
      currentStep: Math.max(incident.currentStep, step),
    };
    saveState(updated);
    setActiveTab(step);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const mm = String(mins).padStart(2, "0");
    const ss = String(secs).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const copyScriptToClipboard = () => {
    const scriptText = "My account has been compromised. I want to report unauthorised transactions, freeze my UPI and netbanking, and request a transaction recall.";
    navigator.clipboard.writeText(scriptText);
    alert(L(
      "Bank emergency call script copied to clipboard!",
      "ಬ್ಯಾಂಕ್ ತುರ್ತು ಕರೆ ಸ್ಕ್ರಿಪ್ಟ್ ನಕಲಿಸಲಾಗಿದೆ!",
      "बैंक आपातकालीन कॉल स्क्रिप्ट कॉपी कर ली गई है!",
      "బ్యాంక్ అత్యవసర కాల్ స్క్రిప్ట్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!"
    ));
  };

  const copyComplaint = () => {
    if (!incident) return;
    const narrative = generateComplaintNarrative(incident.details, incident.step1Called1930, incident.step2CalledBank);
    navigator.clipboard.writeText(narrative);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const downloadComplaintTxt = () => {
    if (!incident) return;
    const narrative = generateComplaintNarrative(incident.details, incident.step1Called1930, incident.step2CalledBank);
    const blob = new Blob([narrative], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ncrp-complaint-narrative-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCompleteRecord = () => {
    if (!incident) return;
    const lines: string[] = [];
    lines.push("===============================================================");
    lines.push("SUDARSHAN KAVACH — GOLDEN HOUR INCIDENT TIMELINE & RECORD");
    lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
    lines.push("===============================================================");
    lines.push("");
    lines.push(`Incident Tracking Started: ${new Date(incident.startedAt).toLocaleString("en-IN")}`);
    lines.push(`Elapsed Tracking Duration: ${formatTimer(elapsedSeconds)}`);
    lines.push(`Step 1 - Called 1930 Helpline: ${incident.step1Called1930 ? `YES (${incident.step1CompletedAt ? new Date(incident.step1CompletedAt).toLocaleTimeString("en-IN") : "Logged"})` : "NO / SKIPPED"}`);
    lines.push(`Step 2 - Contacted Bank Fraud Desk: ${incident.step2CalledBank ? `YES (${incident.step2CompletedAt ? new Date(incident.step2CompletedAt).toLocaleTimeString("en-IN") : "Logged"})` : "NO / SKIPPED"}`);
    if (incident.step2BankCardNumber) {
      lines.push(`Bank Customer Care Number Dialed: ${incident.step2BankCardNumber}`);
    }
    lines.push("");
    lines.push("INCIDENT DATA:");
    lines.push(`- Disputed Amount: ${incident.details.amountLost || "Not provided"}`);
    lines.push(`- Transaction Time: ${incident.details.approxTime || "Not provided"}`);
    lines.push(`- Transaction / UTR ID: ${incident.details.upiTxnId || "Not provided"}`);
    lines.push(`- Beneficiary Info: ${incident.details.beneficiaryInfo || "Not provided"}`);
    lines.push(`- Suspect Contact / Origin: ${incident.details.scammerContact || "Not provided"}`);
    lines.push(`- Modus Operandi / Summary: ${incident.details.description || "Not provided"}`);
    lines.push("");
    lines.push(generateComplaintNarrative(incident.details, incident.step1Called1930, incident.step2CalledBank));
    lines.push("");
    lines.push("===============================================================");
    lines.push("RECOVERY ADVISORY & EVIDENCE PRESERVATION CHECKLIST:");
    lines.push("1. Never pay any third-party fee for recovering stolen money. Recovery-agent scams prey on recent victims.");
    lines.push("2. Reset your UPI PIN, mobile banking credentials, and email password using an uncompromised device.");
    lines.push("3. Retain your NCRP acknowledgement number and visit your local cyber police station if requested.");
    lines.push("===============================================================");

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sudarshan-kavach-incident-record-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If flow is not active, render prominent entry banner
  if (!incident?.isActive) {
    return (
      <section
        ref={containerRef}
        id="incident-flow"
        style={{
          marginBottom: "36px",
          padding: "clamp(16px, 3.5vw, 24px)",
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          borderRadius: "18px",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.3)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: "600px", minWidth: 0, flex: "1 1 280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                fontSize: "0.74rem",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "9999px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {L("EMERGENCY INCIDENT RESPONSE", "ತುರ್ತು ಸೈಬರ್ ಘಟನಾ ಪ್ರತಿಕ್ರಿಯೆ", "आपातकालीन साइबर घटना प्रतिक्रिया", "అత్యవసర సైబర్ సంఘటన ప్రతిస్పందన")}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
              {L("• The Golden Hour Protocol", "• ಗೋಲ್ಡನ್ ಅವರ್ ನಿಯಮಾವಳಿ", "• गोल्डन आवर प्रोटोकॉल", "• గోల్డెన్ అవర్ ప్రోటోకాల్")}
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(1.15rem, 3.5vw, 1.35rem)", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
            {L("Did you already send money, approve a UPI request, or share bank details?", "ನೀವು ಈಗಾಗಲೇ ಹಣ ಕಳುಹಿಸಿದ್ದೀರಾ, UPI ವಿನಂತಿ ಅನುಮೋದಿಸಿದ್ದೀರಾ ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರ ಹಂಚಿಕೊಂಡಿದ್ದೀರಾ?", "क्या आपने पहले ही पैसे भेज दिए हैं, UPI अनुरोध स्वीकृत किया है या बैंक विवरण साझा किए हैं?", "మీరు ఇప్పటికే డబ్బు పంపారా, UPI అభ్యర్థనను ఆమోదించారా లేదా బ్యాంక్ వివరాలను పంచుకున్నారా?")}
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "0.92rem", lineHeight: 1.5 }}>
            {L("Every minute matters. Funds are most often frozen when reported within the first hour before illicit cash-outs. Walk through this guided step-by-step emergency recovery flow right now.", "ಪ್ರತಿ ನಿಮಿಷವೂ ಮುಖ್ಯ. ವಂಚಕರು ಹಣವನ್ನು ಬೇರೆಡೆಗೆ ವರ್ಗಾಯಿಸುವ ಮುನ್ನ ಮೊದಲ ಒಂದು ಗಂಟೆಯೊಳಗೆ ವರದಿ ಮಾಡಿದರೆ ಹಣವನ್ನು ಫ್ರೀಜ್ ಮಾಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. ಈ ತುರ್ತು ಚೇತರಿಕೆ ಹಂತಗಳನ್ನು ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ.", "हर मिनट कीमती है। अनधिकृत निकासी से पहले पहले 1 घंटे के भीतर रिपोर्ट करने पर पैसे फ्रीज होने की संभावना सबसे अधिक होती है। इस आपातकालीन रिकवरी प्रक्रिया को तुरंत शुरू करें।", "ప్రతి నిమిషం ఎంతో కీలకం. మోసగాళ్లు విత్‌డ్రా చేసేలోపు మొదటి గంటలోపు ఫిర్యాదు చేస్తే నిధులు ఫ్రీజ్ అయ్యే అవకాశం ఎక్కువ. ఈ అత్యవసర రికవరీ దశలను ఇప్పుడే ప్రారంభించండి.")}
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: "420px", minWidth: 0, flex: "1 1 260px" }}>
          <button
            onClick={() => startFlow()}
            className="btn btn-danger btn-mobile-full"
            style={{
              padding: "14px 20px",
              fontSize: "0.95rem",
              fontWeight: 800,
              boxShadow: "0 4px 18px rgba(239, 68, 68, 0.45)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              whiteSpace: "normal",
              textAlign: "center",
              lineHeight: 1.35,
              minHeight: "48px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>{L("I have already paid or shared my details", "ನಾನು ಈಗಾಗಲೇ ಹಣ ಪಾವತಿಸಿದ್ದೇನೆ ಅಥವಾ ನನ್ನ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದೇನೆ", "मैंने पहले ही भुगतान कर दिया है या विवरण साझा कर दिया है", "నేను ఇప్పటికే చెల్లించాను లేదా నా వివరాలను పంచుకున్నాను")}</span>
          </button>
        </div>
      </section>
    );
  }

  // Active Flow Render
  return (
    <section
      ref={containerRef}
      id="incident-flow"
      style={{
        marginBottom: "40px",
        background: "#ffffff",
        borderRadius: "20px",
        border: "2px solid #ef4444",
        boxShadow: "0 16px 40px rgba(239, 68, 68, 0.12)",
        overflow: "hidden",
      }}
    >
      {/* STEP 0: Pinned Clock & Live Elapsed Timer Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
          color: "#fff",
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,0,0,0.3)",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span
              className="pulse-dot"
              style={{ backgroundColor: "#fca5a5", width: "10px", height: "10px" }}
            />
            <span style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.08em", color: "#fecaca" }}>
              {L("ELAPSED TIME", "ಕಳೆದ ಸಮಯ", "बीता हुआ समय", "గడిచిన సమయం")}
            </span>
            <span
              style={{
                fontSize: "1.45rem",
                fontWeight: 900,
                fontFamily: "monospace",
                color: "#ffffff",
                marginLeft: "4px",
              }}
            >
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#fecaca", textTransform: "uppercase" }}>
              {L("ACTIVE INCIDENT PROTOCOL", "ಸಕ್ರಿಯ ಘಟನಾ ನಿಯಮಾವಳಿ", "सक्रिय घटना प्रोटोकॉल", "యాక్టివ్ సంఘటన ప్రోటోకాల్")}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff" }}>
              {L("Funds are most often frozen when reported within the first hour. Work through these steps in order.", "ಮೊದಲ 1 ಗಂಟೆಯೊಳಗೆ ವರದಿ ಮಾಡಿದಾಗ ಹಣವನ್ನು ಫ್ರೀಜ್ ಮಾಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. ಈ ಹಂತಗಳನ್ನು ಅನುಕ್ರಮವಾಗಿ ಪಾಲಿಸಿ.", "अनधिकृत डेबिट के पहले 1 घंटे के भीतर रिपोर्ट करने पर धन फ्रीज होने की संभावना सबसे अधिक होती है। इन चरणों का क्रमवार पालन करें।", "మొదటి గంటలోపు నివేదించినప్పుడు నిధులు ఫ్రీజ్ అయ్యే అవకాశం ఎక్కువ. ఈ దశలను వరుసగా పూర్తి చేయండి.")}
            </div>
          </div>
        </div>

        <button
          onClick={clearIncident}
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {L("Clear incident record", "ದಾಖಲೆ ತೆರವುಗೊಳಿಸಿ", "रिकॉर्ड हटाएं", "రికార్డును తొలగించండి")}
        </button>
      </div>

      {/* Step Navigation Bar */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "10px 14px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {[
          { num: 1, label: L("1. Call 1930", "1. 1930 ಗೆ ಕರೆ ಮಾಡಿ", "1. 1930 पर कॉल करें", "1. 1930కి కాల్ చేయండి"), done: incident.step1Called1930 },
          { num: 2, label: L("2. Call Bank", "2. ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ", "2. बैंक को कॉल करें", "2. బ్యాంక్‌కి కాల్ చేయండి"), done: incident.step2CalledBank },
          { num: 3, label: L("3. Incident Details", "3. ಘಟನೆಯ ವಿವರಗಳು", "3. घटना का विवरण", "3. సంఘటన వివరాలు"), done: !!incident.details.amountLost || !!incident.details.upiTxnId },
          { num: 4, label: L("4. Generate Complaint", "4. ದೂರು ರಚಿಸಿ", "4. शिकायत तैयार करें", "4. ఫిర్యాదును రూపొందించండి"), done: false },
          { num: 5, label: L("5. Aftercare & Preservation", "5. ನಂತರದ ಎಚ್ಚರಿಕೆ & ಸಂರಕ್ಷಣೆ", "5. बाद की सुरक्षा & सावधानियां", "5. తదుపరి భద్రత & జాగ్రత్తలు"), done: false },
        ].map((s) => {
          const isCurrent = activeTab === s.num;
          return (
            <button
              key={s.num}
              onClick={() => goToStep(s.num)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: isCurrent ? "1px solid #ef4444" : "1px solid var(--border-subtle)",
                background: isCurrent ? "#fef2f2" : "#ffffff",
                color: isCurrent ? "#b91c1c" : "var(--text-secondary)",
                fontWeight: isCurrent ? 800 : 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                gap: "6px",
                touchAction: "manipulation",
              }}
            >
              {s.done ? <span style={{ color: "#10b981", fontWeight: 900 }}>✓</span> : null}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div style={{ padding: "clamp(16px, 4vw, 28px) clamp(12px, 3.5vw, 24px)" }}>
        {/* ================= STEP 1: CALL 1930 ================= */}
        {activeTab === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}>
                {L("STEP 1 OF 5 — PRIORITY #1", "ಹಂತ 1 / 5 — ಆದ್ಯತೆ #1", "चरण 1 / 5 — प्राथमिकता #1", "దశ 1 / 5 — ప్రాధాన్యత #1")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {L("Dial immediately from any phone", "ಯಾವುದೇ ಫೋನ್‌ನಿಂದ ತಕ್ಷಣ ಡಯಲ್ ಮಾಡಿ", "किसी भी फोन से तुरंत डायल करें", "ఏదైనా ఫోన్ నుండి వెంటనే డయల్ చేయండి")}
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
              {L("Call 1930 (National Cyber Financial Fraud Helpline)", "1930 ಗೆ ಕರೆ ಮಾಡಿ (ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಹಣಕಾಸು ವಂಚನೆ ಸಹಾಯವಾಣಿ)", "1930 पर कॉल करें (राष्ट्रीय साइबर वित्तीय धोखाधड़ी हेल्पलाइन)", "1930కి కాల్ చేయండి (జాతీయ సైబర్ ఆర్థిక మోసాల హెల్ప్‌లైన్)")}
            </h3>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              {L(
                "1930 is operated by the Ministry of Home Affairs (MHA) Citizen Financial Fraud Reporting System. When you call, law enforcement immediately flags the transaction with beneficiary bank nodal officers to freeze the money inside the recipient mule account before fraudsters can withdraw it at an ATM.",
                "1930 ಸಹಾಯವಾಣಿಯನ್ನು ಕೇಂದ್ರ ಗೃಹ ಸಚಿವಾಲಯದ (MHA) ನಾಗರಿಕ ಹಣಕಾಸು ವಂಚನೆ ವರದಿ ವ್ಯವಸ್ಥೆಯು ನಿರ್ವಹಿಸುತ್ತದೆ. ನೀವು ಕರೆ ಮಾಡಿದಾಗ, ವಂಚಕರು ಹಣವನ್ನು ಹಿಂಪಡೆಯುವ ಮುನ್ನ ಅವರ ಖಾತೆಯಲ್ಲಿ ಹಣವನ್ನು ಫ್ರೀಜ್ ಮಾಡಲು ಬ್ಯಾಂಕ್ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳಿಗೆ ತಕ್ಷಣ ಮಾಹಿತಿ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.",
                "1930 गृह मंत्रालय (MHA) के नागरिक वित्तीय धोखाधड़ी रिपोर्टिंग सिस्टम द्वारा संचालित है। आपके कॉल करते ही, धोखाधड़ी करने वाले के बैंक खाते में धन को तुरंत फ्रीज करने के लिए बैंक नोडल अधिकारियों को अलर्ट भेजा जाता है ताकि वे ATM से निकासी न कर सकें।",
                "1930 హెల్ప్‌లైన్‌ను కేంద్ర హోం మంత్రిత్వ శాఖ (MHA) పౌర ఆర్థిక మోసాల నివేదన వ్యవస్థ నిర్వహిస్తోంది. మీరు కాల్ చేసిన వెంటనే, మోసగాళ్లు ఏటీఎం ద్వారా డబ్బు విత్‌డ్రా చేయకముందే వారి మ్యూల్ ఖాతాలో నిధులను ఫ్రీజ్ చేయడానికి బ్యాంక్ నోడల్ అధికారులకు సమాచారం చేరుతుంది."
              )}
            </p>

            {/* Tap-to-Call Primary Card */}
            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {L("MHA NATIONAL CYBER HELPLINE (TOLL FREE)", "ಗೃಹ ಸಚಿವಾಲಯದ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ (ಟೋಲ್ ಫ್ರೀ)", "गृह मंत्रालय राष्ट्रीय साइबर हेल्पलाइन (टोल फ्री)", "హోం మంత్రిత్వ శాఖ జాతీయ సైబర్ హెల్ప్‌లైన్ (టోల్ ఫ్రీ)")}
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#991b1b", letterSpacing: "0.05em" }}>
                  1930
                </div>
                <div style={{ fontSize: "0.85rem", color: "#7f1d1d", marginTop: "2px" }}>
                  {L("Operates 24x7 across all Indian telecom circles.", "ಭಾರತದ ಎಲ್ಲಾ ಟೆಲಿಕಾಂ ವಲಯಗಳಲ್ಲಿ 24x7 ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.", "पूरे भारत के सभी टेलीकॉम सर्किलों में 24x7 संचालित।", "భారతదేశంలోని అన్ని టెలికాం సర్కిళ్లలో 24x7 పని చేస్తుంది.")}
                </div>
              </div>

              <a
                href="tel:1930"
                className="btn btn-danger"
                style={{
                  padding: "14px 28px",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
                  minHeight: "50px",
                  width: "100%",
                  maxWidth: "360px",
                  touchAction: "manipulation",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {L("Tap to Call 1930 Now", "📞 ಈಗಲೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ", "📞 अभी 1930 पर कॉल करें", "📞 ఇప్పుడే 1930కి కాల్ చేయండి")}
              </a>
            </div>

            {/* What they will ask you checklist */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                padding: "20px 24px",
                marginBottom: "24px",
              }}
            >
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
                {L("Keep this ready when the 1930 operator answers:", "1930 ಆಪರೇಟರ್ ಉತ್ತರಿಸಿದಾಗ ಈ ವಿವರಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ:", "1930 ऑपरेटर से बात करते समय यह जानकारी तैयार रखें:", "1930 ఆపరేటర్ మాట్లాడినప్పుడు ఈ వివరాలను సిద్ధంగా ఉంచుకోండి:")}
              </h4>
              <ul style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "20px" }}>
                <li><strong>{L("Your Bank & Account:", "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಮತ್ತು ಖಾತೆ:", "आपका बैंक और खाता:", "మీ బ్యాంక్ మరియు ఖాతా:")}</strong> {L("Name of your bank and debit card/account number debited.", "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಹೆಸರು ಮತ್ತು ಡೆಬಿಟ್ ಆದ ಖಾತೆ ಸಂಖ್ಯೆ.", "आपके बैंक का नाम और डेबिट हुआ खाता/कार्ड नंबर।", "మీ బ్యాంక్ పేరు మరియు డబ్బు కట్ అయిన ఖాతా/డెబిట్ కార్డు సంఖ్య.")}</li>
                <li><strong>{L("Transaction Reference:", "ವಹಿವಾಟು ರೆಫರೆನ್ಸ್:", "लेनदेन संदर्भ संख्या:", "లావాదేవీ రిఫరెన్స్:")}</strong> {L("12-digit UTR number or UPI transaction reference from your SMS/app receipt.", "SMS ಅಥವಾ ರಶೀದಿಯಿಂದ 12-ಅಂಕಿಯ UTR ಸಂಖ್ಯೆ ಅಥವಾ UPI ID.", "SMS या रसीद से प्राप्त 12-अंकों का UTR नंबर या UPI संदर्भ संख्या।", "మీ SMS లేదా యాప్ రసీదు నుండి 12-అంకెల UTR లేదా UPI లావాదేవీ రిఫరెన్స్ సంఖ్య.")}</li>
                <li><strong>{L("Exact Timestamp:", "ನಿಖರ ಸಮಯ:", "सटीक समय:", "ఖచ్చితమైన సమయం:")}</strong> {L("Approximate time and date the transaction occurred.", "ವಹಿವಾಟು ಸಂಭವಿಸಿದ ದಿನಾಂಕ ಮತ್ತು ಅಂದಾಜು ಸಮಯ.", "लेनदेन होने की अनुमानित तारीख और समय।", "లావాదేవీ జరిగిన తేదీ మరియు సుమారు సమయం.")}</li>
                <li><strong>{L("Suspect Details:", "ವಂಚಕರ ವಿವರ:", "धोखेबाज का विवरण:", "మోసగాడి వివరాలు:")}</strong> {L("The recipient UPI ID, beneficiary account number, or fraudster phone number.", "ಸ್ವೀಕರಿಸಿದವರ UPI ID, ಬ್ಯಾಂಕ್ ಖಾತೆ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆ.", "पैसे प्राप्त करने वाले की UPI ID, बैंक खाता या धोखेबाज का फोन नंबर।", "డబ్బు అందుకున్నవారి UPI ID, బ్యాంక్ ఖాతా సంఖ్య లేదా మోసగాడి ఫోన్ నంబర్.")}</li>
              </ul>
            </div>

            {/* Checkbox and Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: incident.step1Called1930 ? "#10b981" : "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={incident.step1Called1930}
                  onChange={(e) => setStep1Called(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#ef4444" }}
                />
                {L("I have called 1930 (records timestamp & advances)", "ನಾನು 1930 ಗೆ ಕರೆ ಮಾಡಿದ್ದೇನೆ (ಸಮಯ ದಾಖಲಿಸಿ ಮುಂದುವರಿಯಿರಿ)", "मैंने 1930 पर कॉल कर लिया है (समय रिकॉर्ड करें और आगे बढ़ें)", "నేను 1930కి కాల్ చేసాను (సమయం నమోదు చేసి ముందుకు సాగండి)")}
              </label>

              <button
                onClick={() => goToStep(2)}
                className="btn btn-primary"
                style={{ padding: "10px 20px" }}
              >
                {L("Continue to Step 2: Call Bank →", "ಹಂತ 2 ಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ: ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ →", "चरण 2 पर जाएं: बैंक को कॉल करें →", "దశ 2కి కొనసాగండి: బ్యాంక్‌కి కాల్ చేయండి →")}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CALL THE BANK ================= */}
        {activeTab === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}>
                {L("STEP 2 OF 5 — ACCOUNT ISOLATION", "ಹಂತ 2 / 5 — ಖಾತೆ ಸಂರಕ್ಷಣೆ", "चरण 2 / 5 — खाता सुरक्षा", "దశ 2 / 5 — ఖాతా భద్రత & నిరోధం")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {L("Stop secondary debit attempts immediately", "ಮುಂದಿನ ಅನಧಿಕೃತ ವರ್ಗಾವಣೆಗಳನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ", "आगे के अनधिकृत लेनदेन तुरंत रोकें", "తదుపరి అనధికార లావాదేవీలను వెంటనే ఆపండి")}
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
              {L("Call Your Bank's 24x7 Fraud Support Helpline", "ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ 24x7 ವಂಚನೆ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ", "अपने बैंक की 24x7 फ्रॉड हेल्पलाइन पर कॉल करें", "మీ బ్యాంక్ యొక్క 24x7 ఫ్రాడ్ హెల్ప్‌లైన్‌కు కాల్ చేయండి")}
            </h3>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              {isKn
                ? "1930 ಗೆ ಕರೆ ಮಾಡಿದ ತಕ್ಷಣ, ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ ಅಧಿಕೃತ ಗ್ರಾಹಕ ಸೇವಾ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ. ವಂಚನೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ ವರದಿ ಮಾಡಿ, ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು UPI ಅನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿರ್ಬಂಧಿಸಿ (Freeze) ಹಾಗೂ ವಹಿವಾಟು ಹಿಂಪಡೆಯುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು (Recall) ಪ್ರಾರಂಭಿಸಲು ಕೋರಿ."
                : "While 1930 alerts the receiving bank, you must immediately call your own bank to block your compromised debit card, freeze your UPI handles, and submit an official transaction recall request."}
            </p>

            {/* Debit Card Customer Care Lookup */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                padding: "20px 24px",
                marginBottom: "24px",
              }}
            >
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {isKn ? "ಬ್ಯಾಂಕ್ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ (ನಿಮ್ಮ ಡೆಬಿಟ್ ಕಾರ್ಡ್ ಹಿಂಭಾಗದಲ್ಲಿ ಮುದ್ರಿತವಾಗಿದೆ):" : "Bank Helpline Number (Printed on the back of your Debit / Credit Card):"}
              </label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="e.g. 1800 11 1109 or 1800 1600..."
                  value={incident.step2BankCardNumber || ""}
                  onChange={(e) => {
                    if (!incident) return;
                    saveState({ ...incident, step2BankCardNumber: e.target.value });
                  }}
                  className="input-field"
                  style={{ flex: "1 1 200px", maxWidth: "100%" }}
                />
                {incident.step2BankCardNumber && (
                  <a
                    href={`tel:${incident.step2BankCardNumber.replace(/[^0-9+]/g, "")}`}
                    className="btn btn-secondary btn-mobile-full"
                    style={{ textDecoration: "none" }}
                  >
                    📞 Dial {incident.step2BankCardNumber}
                  </a>
                )}
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>
                Quick Reference: SBI: 1800 11 1109 | HDFC: 1800 1600 | ICICI: 1800 2662 | Axis: 1800 419 0068 | PNB: 1800 180 2222
              </p>
            </div>

            {/* Script Box */}
            <div
              style={{
                background: "#fff7ed",
                borderRadius: "14px",
                border: "1px solid var(--brand-orange-subtle)",
                padding: "20px 24px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--brand-orange-dark)", textTransform: "uppercase" }}>
                  {L("SCRIPT TO READ TO THE BANK OFFICER:", "ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಗೆ ಓದಲು ತುರ್ತು ಸ್ಕ್ರಿಪ್ಟ್:", "बैंक अधिकारी को पढ़ने के लिए आपातकालीन स्क्रिप्ट:", "బ్యాంక్ అధికారికి చదవడానికి అత్యవసర స్క్రిప్ట్:")}
                </div>
                <button
                  onClick={copyScriptToClipboard}
                  className="btn btn-secondary"
                  style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                >
                  {L("📋 Copy Script", "📋 ಸ್ಕ್ರಿಪ್ಟ್ ನಕಲಿಸಿ", "📋 स्क्रिप्ट कॉपी करें", "📋 స్క్రిప్ట్ కాపీ చేయండి")}
                </button>
              </div>

              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                  background: "#ffffff",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(249, 115, 22, 0.2)",
                  lineHeight: 1.5,
                }}
              >
                {L(
                  "\"My account has been compromised. I want to report unauthorised transactions, freeze my UPI and netbanking, and request a transaction recall.\"",
                  "\"ನನ್ನ ಖಾತೆ ಹ್ಯಾಕ್ ಆಗಿದೆ/ಅಪಾಯದಲ್ಲಿದೆ. ಅನಧಿಕೃತ ವಹಿವಾಟುಗಳನ್ನು ವರದಿ ಮಾಡಲು, ನನ್ನ UPI ಮತ್ತು ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ಅನ್ನು ತಕ್ಷಣ ಫ್ರೀಜ್ ಮಾಡಲು ಮತ್ತು ಹಣ ವಾಪಸಾತಿ (transaction recall) ಕೋರಲು ನಾನು ಬಯಸುತ್ತೇನೆ.\"",
                  "\"मेरा खाता खतरे में है / अनधिकृत लेनदेन हुआ है। मैं अनधिकृत लेनदेन की रिपोर्ट करना चाहता हूँ, अपनी UPI और नेटबैंकिंग को तुरंत ब्लॉक/फ्रीज करना चाहता हूँ और लेनदेन को वापस मंगाने (transaction recall) का अनुरोध करता हूँ।\"",
                  "\"నా ఖాతా రాజీ పడింది/మోసానికి గురైంది. అనధికార లావాదేవీలను నివేదించి, నా UPI మరియు నెట్ బ్యాంకింగ్‌ను వెంటనే ఫ్రీజ్ చేసి, ట్రాన్సాక్షన్ రీకాల్ ప్రారంభించవలసిందిగా కోరుతున్నాను.\""
                )}
              </div>
            </div>

            {/* Checkbox and Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: incident.step2CalledBank ? "#10b981" : "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={incident.step2CalledBank}
                  onChange={(e) => setStep2Called(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#ef4444" }}
                />
                {isKn ? "ನಾನು ನನ್ನ ಬ್ಯಾಂಕ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿದ್ದೇನೆ (ವಿವರಗಳ ಫಾರ್ಮ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ)" : "I have contacted my bank (advances to details form)"}
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => goToStep(1)}
                  className="btn btn-secondary"
                  style={{ padding: "10px 16px" }}
                >
                  {L("← Back to Step 1", "← ಹಂತ 1 ಕ್ಕೆ ಹಿಂತಿರುಗಿ", "← चरण 1 पर वापस", "← దశ 1కి వెనుకకు")}
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="btn btn-primary"
                  style={{ padding: "10px 20px" }}
                >
                  {L("Continue to Step 3: Collect Details →", "ಹಂತ 3 ಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ: ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ →", "चरण 3 पर जाएं: विवरण दर्ज करें →", "దశ 3కి కొనసాగండి: వివరాలు నమోదు చేయండి →")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: COLLECT INCIDENT DETAILS ================= */}
        {activeTab === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}>
                {L("STEP 3 OF 5 — INCIDENT PARTICULARS", "ಹಂತ 3 / 5 — ಘಟನೆಯ ವಿವರಗಳು", "चरण 3 / 5 — घटना का विवरण", "దశ 3 / 5 — సంఘటన వివరాలు")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {isKn ? "ಎಲ್ಲವೂ ಐಚ್ಛಿಕ • ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಯುತ್ತದೆ" : "All optional • 100% client-side in browser memory"}
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              {L("Document Incident Facts", "ಘಟನೆಯ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ", "घटना के तथ्यों को दर्ज करें", "సంఘటన వాస్తవాలను నమోదు చేయండి")}
            </h3>
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              {isKn ? "ನಿಮಗೆ ತಿಳಿದಿರುವ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ. ಯಾವುದೇ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ; ಇವು ಹಂತ 4 ರಲ್ಲಿ ನಿಮ್ಮ ಅಧಿಕೃತ ಸೈಬರ್ ಕ್ರೈಮ್ ದೂರಿಗೆ ನೇರವಾಗಿ ಸೇರ್ಪಡೆಗೊಳ್ಳುತ್ತವೆ." : "Fill in what you know. Nothing is sent to any server; these entries are formatted directly into your formal cybercrime complaint narrative in Step 4."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {L("Amount Lost (₹)", "ಕಳೆದುಹೋದ ಮೊತ್ತ (₹)", "खोई गई राशि (₹)", "నష్టపోయిన మొత్తం (₹)")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25,000"
                  value={incident.details.amountLost || ""}
                  onChange={(e) => updateDetails("amountLost", e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {L("Approximate Date & Time", "ವಹಿವಾಟಿನ ದಿನಾಂಕ ಮತ್ತು ಅಂದಾಜು ಸಮಯ", "लेनदेन की अनुमानित तारीख और समय", "లావాదేవీ సుమారు తేదీ & సమయం")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today at 2:30 PM"
                  value={incident.details.approxTime || ""}
                  onChange={(e) => updateDetails("approxTime", e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {L("UPI Txn ID / Reference (UTR)", "UPI ವಹಿವಾಟು ID / ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ (UTR)", "UPI लेनदेन ID / संदर्भ संख्या (UTR)", "UPI లావాదేవీ ID / రిఫరెన్స్ సంఖ్య (UTR)")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-digit UTR: 421098765432"
                  value={incident.details.upiTxnId || ""}
                  onChange={(e) => updateDetails("upiTxnId", e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {L("Beneficiary UPI ID or Bank Account", "ಸ್ವೀಕರಿಸಿದವರ UPI ID ಅಥವಾ ಬ್ಯಾಂಕ್ ಖಾತೆ", "पैसे प्राप्तकर्ता का UPI ID या बैंक खाता", "స్వీకర్త UPI ID లేదా బ్యాంక్ ఖాతా")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. suspect@okhdfcbank or A/C 9876543210"
                  value={incident.details.beneficiaryInfo || ""}
                  onChange={(e) => updateDetails("beneficiaryInfo", e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Scammer's Phone Number, URL, or Message Sent
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210 or paste SMS text..."
                value={incident.details.scammerContact || ""}
                onChange={(e) => updateDetails("scammerContact", e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Briefly: How Did It Happen?
              </label>
              <textarea
                placeholder="e.g. Received SMS about electricity power disconnection. Called the number, caller instructed me to download an APK file and make a ₹10 test payment..."
                value={incident.details.description || ""}
                onChange={(e) => updateDetails("description", e.target.value)}
                rows={3}
                className="input-field"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <button
                onClick={() => goToStep(2)}
                className="btn btn-secondary"
                style={{ padding: "10px 16px" }}
              >
                {L("← Back to Step 2", "← ಹಂತ 2 ಕ್ಕೆ ಹಿಂತಿರುಗಿ", "← चरण 2 पर वापस", "← దశ 2కి వెనుకకు")}
              </button>

              <button
                onClick={() => goToStep(4)}
                className="btn btn-primary"
                style={{ padding: "12px 24px", fontWeight: 800 }}
              >
                {L("Generate NCRP Complaint Narrative (Step 4) →", "NCRP ದೂರು ರಚಿಸಿ (ಹಂತ 4) →", "NCRP शिकायत का मसौदा तैयार करें (चरण 4) →", "NCRP ఫిర్యాదు ముసాయిదా రూపొందించండి (దశ 4) →")}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: GENERATE THE COMPLAINT ================= */}
        {activeTab === 4 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}>
                {L("STEP 4 OF 5 — OFFICIAL COMPLAINT DRAFT", "ಹಂತ 4 / 5 — ಅಧಿಕೃತ ದೂರಿನ ಕರಡು", "चरण 4 / 5 — आधिकारिक शिकायत का मसौदा", "దశ 4 / 5 — అధికారిక ఫిర్యాదు ముసాయిదా")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {L("Ready to paste into cybercrime.gov.in", "cybercrime.gov.in ಗೆ ನಕಲಿಸಲು ಸಿದ್ಧವಾಗಿದೆ", "cybercrime.gov.in पर पेस्ट करने के लिए तैयार", "cybercrime.gov.in లో పేస్ట్ చేయడానికి సిద్ధంగా ఉంది")}
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              {L("Formatted National Cyber Crime Complaint", "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಕ್ರೈಮ್ ಪೋರ್ಟಲ್ ದೂರು", "राष्ट्रीय साइबर अपराध पोर्टल शिकायत", "జాతీయ సైబర్ నేరాల పోర్టల్ ఫిర్యాదు")}
            </h3>
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              {L(
                "Generated deterministically from your facts using the standard National Cyber Crime Reporting Portal (NCRP) structure. No AI hallucinations; empty fields are cleanly excluded.",
                "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಕ್ರೈಮ್ ರಿಪೋರ್ಟಿಂಗ್ ಪೋರ್ಟಲ್ (NCRP) ರಚನೆಗೆ ಅನುಗುಣವಾಗಿ ನಿಮ್ಮ ವಿವರಗಳಿಂದ ನೇರವಾಗಿ ರಚಿಸಲಾಗಿದೆ. ಯಾವುದೇ ತಪ್ಪುಗಳಿಲ್ಲದೆ ಖಾಲಿ ವಿವರಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.",
                "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (NCRP) संरचना के अनुसार आपके तथ्यों से सीधे तैयार किया गया।",
                "ప్రామాణిక జాతీయ సైబర్ క్రైమ్ రిపోర్టింగ్ పోర్టల్ (NCRP) విధానంలో మీ వివరాల ఆధారంగా రూపొందించబడింది. ఖాళీ ఫీల్డ్‌లు మినహాయించబడతాయి."
              )}
            </p>

                        {/* MANDATORY NCRP Language Notice per jury spec */}
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "14px 18px",
                marginBottom: "16px",
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
              <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                {L(
                  "Your complaint is drafted in English because that is what the portal expects.",
                  "ಗಮನಿಸಿ: ನಿಮ್ಮ ದೂರನ್ನು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ರಚಿಸಲಾಗಿದೆ, ಏಕೆಂದರೆ ಅಧಿಕೃತ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಕ್ರೈಮ್ ಪೋರ್ಟಲ್ (cybercrime.gov.in) ಇಂಗ್ಲಿಷ್ ಭಾಷೆಯನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತದೆ.",
                  "नोट: आपकी शिकायत अंग्रेजी में तैयार की गई है, क्योंकि आधिकारिक राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in) अंग्रेजी भाषा की अपेक्षा करता है।",
                  "గమనిక: మీ ఫిర్యాదు ఆంగ్లంలో రూపొందించబడింది, ఎందుకంటే అధికారిక పోర్టల్ (cybercrime.gov.in) ఆంగ్ల భాషను ఆశిస్తుంది."
                )}
              </span>
            </div>

            {/* Checklist of attachments */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                padding: "18px 22px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {L("Documents & Evidence to Attach on cybercrime.gov.in:", "cybercrime.gov.in ನಲ್ಲಿ ಲಗತ್ತಿಸಬೇಕಾದ ಸಾಕ್ಷ್ಯ ದಾಖಲೆಗಳು:", "cybercrime.gov.in पर संलग्न किए जाने वाले साक्ष्य दस्तावेज:", "cybercrime.gov.in లో జతచేయవలసిన సాక్ష్యాలు & పత్రాలు:")}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "8px", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                <div>☑ <strong>{L("Bank Account Statement", "ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್", "बैंक खाता विवरण", "బ్యాంక్ ఖాతా స్టేట్‌మెంట్")}</strong> {L("showing unauthorized debit", "(ಅನಧಿಕೃತ ಡೆಬಿಟ್ ತೋರಿಸುವ ಪುಟ)", "(अनधिकृत डेबिट लेनदेन को दर्शाने वाला विवरण)", "(అనధికార డెబిట్ చూపించేది)")}</div>
                <div>☑ <strong>{L("Transaction Receipt / Screenshot", "ವಹಿವಾಟು ರಶೀದಿ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್", "लेनदेन रसीद / स्क्रीनशॉट", "లావాదేవీ రసీదు / స్క్రీన్‌షాట్")}</strong> {L("from UPI app", "(UPI ಆ್ಯಪ್‌ನಿಂದ UTR ಸಹಿತ)", "(UPI ऐप से प्राप्त रसीद)", "(UPI యాప్ నుండి UTR సహా)")}</div>
                <div>☑ <strong>{L("Scam Message / Chat Screenshot", "ವಂಚನೆಯ ಸಂದೇಶ / ಚಾಟ್", "धोखाधड़ी वाला संदेश / चैट", "మోసపూరిత సందేశం / చాట్ స్క్రీన్‌షాట్")}</strong> {L("(SMS / WhatsApp)", "(SMS ಅಥವಾ WhatsApp)", "(SMS या WhatsApp)", "(SMS / వాట్సాప్)")}</div>
                <div>☑ <strong>{L("1930 Acknowledgment SMS", "1930 ಸ್ವೀಕೃತಿ ಸಂದೇಶ", "1930 पावती SMS", "1930 రసీదు SMS")}</strong> {L("/ Reference Number", "(ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ)", "(संदर्भ संख्या)", "/ రిఫరెన్స్ సంఖ్య")}</div>
              </div>
            </div>

            {/* Generated Narrative Box */}
            <div
              style={{
                position: "relative",
                background: "#0f172a",
                color: "#f8fafc",
                borderRadius: "14px",
                border: "1px solid #334155",
                padding: "20px",
                fontFamily: "monospace",
                fontSize: "0.86rem",
                lineHeight: 1.6,
                maxHeight: "360px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                marginBottom: "20px",
              }}
            >
              {generateComplaintNarrative(incident.details, incident.step1Called1930, incident.step2CalledBank)}
            </div>

            {/* Copy & Download Actions */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
              <button
                onClick={copyComplaint}
                className="btn btn-primary"
                style={{
                  padding: "12px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  minHeight: "44px",
                  touchAction: "manipulation",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {copySuccess ? (isKn ? "✓ ದೂರಿನ ಪಠ್ಯ ನಕಲಿಸಲಾಗಿದೆ!" : "✓ Complaint Text Copied!") : (isKn ? "ದೂರಿನ ಪಠ್ಯವನ್ನು ನಕಲಿಸಿ" : "Copy Complaint Text")}
              </button>

              <button
                onClick={downloadComplaintTxt}
                className="btn btn-secondary"
                style={{
                  padding: "12px 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "44px",
                  touchAction: "manipulation",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {L("Download as .txt", ".txt ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", ".txt के रूप में डाउनलोड करें", ".txt రూపంలో డౌన్‌లోడ్ చేయండి")}
              </button>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: "12px 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#1d4ed8",
                  textDecoration: "none",
                  minHeight: "44px",
                  touchAction: "manipulation",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Open cybercrime.gov.in (NCRP) ↗
              </a>
            </div>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <button
                onClick={() => goToStep(3)}
                className="btn btn-secondary"
                style={{ padding: "10px 16px" }}
              >
                {L("← Edit Incident Details", "← ವಿವರಗಳನ್ನು ತಿದ್ದಿ", "← घटना का विवरण संपादित करें", "← సంఘటన వివరాలను సవరించండి")}
              </button>

              <button
                onClick={() => goToStep(5)}
                className="btn btn-primary"
                style={{ padding: "12px 24px", fontWeight: 800 }}
              >
                {L("Continue to Step 5: Aftercare & Save Record →", "ಹಂತ 5 ಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ: ನಂತರದ ಎಚ್ಚರಿಕೆಗಳು →", "चरण 5 पर जाएं: बाद की सुरक्षा और सावधानियां →", "దశ 5కి కొనసాగండి: తదుపరి జాగ్రత్తలు & రికార్డు →")}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: AFTERCARE & PRESERVATION ================= */}
        {activeTab === 5 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px" }}>
                {L("STEP 5 OF 5 — AFTERCARE & SECURITY HYGIENE", "ಹಂತ 5 / 5 — ನಂತರದ ರಕ್ಷಣೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ", "चरण 5 / 5 — बाद की सुरक्षा और स्वच्छता", "దశ 5 / 5 — తదుపరి సంరక్షణ & భద్రతా జాగ్రత్తలు")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {L("Protect against secondary fraud attacks", "ಎರಡನೇ ಸುತ್ತಿನ ವಂಚನೆಯಿಂದ ರಕ್ಷಣೆ ಪಡೆಯಿರಿ", "द्वितीयक धोखाधड़ी के हमलों से बचाव", "ద్వితీయ మోసపూరిత దాడుల నుండి రక్షణ పొందండి")}
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>
              {L("Critical Warnings & Preservation", "ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ದಾಖಲೆ ಸಂರಕ್ಷಣೆ", "महत्वपूर्ण चेतावनियां और रिकॉर्ड संरक्षण", "కీలక హెచ్చరికలు & రికార్డుల సంరక్షణ")}
            </h3>

            {/* Three Critical Warning Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🛑</span>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#991b1b", marginBottom: "4px" }}>
                    {L("Warning 1: Beware of \"Recovery-Agent\" Scams", "ಎಚ್ಚರಿಕೆ 1: 'ಹಣ ಮರುಪಡೆಯುವ ಏಜೆಂಟ್'ಗಳ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ", "चेतावनी 1: 'रिकवरी एजेंट' घोटालों से सावधान रहें", "హెచ్చరిక 1: \"రికవరీ ఏజెంట్\" మోసాల పట్ల జాగ్రత్త")}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#7f1d1d", lineHeight: 1.5 }}>
                    {L(
                      "Do not pay anyone who offers to recover your money. Secondary fraud rings actively monitor cyber complaint hashtags and forums to pose as \"ethical hackers\" or recovery agents to extort extra money from recent victims. Official police and bank recovery is completely free.",
                      "ಕಳೆದುಹೋದ ಹಣವನ್ನು ಮರಳಿ ಕೊಡಿಸುತ್ತೇವೆ ಎಂದು ಹೇಳುವ ಯಾರಿಗೂ ಹಣ ನೀಡಬೇಡಿ. ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ನಕಲಿ ಹ್ಯಾಕರ್‌ಗಳು ಇತ್ತೀಚಿನ ಸಂತ್ರಸ್ತರನ್ನು ಗುರಿಯಾಗಿಸಿ ಮತ್ತೆ ವಂಚಿಸಲು ಯತ್ನಿಸುತ್ತಾರೆ. ಅಧಿಕೃತ ಪೊಲೀಸ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ತನಿಖೆ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿರುತ್ತದೆ.",
                      "खोए हुए पैसे वापस दिलाने का दावा करने वाले किसी भी तीसरे पक्ष को पैसे न दें। फर्जी हैकर्स और एजेंट सोशल मीडिया पर हाल ही में ठगे गए लोगों को फिर से शिकार बनाते हैं। आधिकारिक पुलिस और बैंक प्रक्रिया पूरी तरह से निःशुल्क है।",
                      "మీ డబ్బును రికవరీ చేస్తామని చెప్పే ఎవరికీ ఎలాంటి రుసుము చెల్లించవద్దు. మోసగాళ్లు సోషల్ మీడియాలో బాధితులను లక్ష్యంగా చేసుకుని \"ఎథికల్ హ్యాకర్లు\" లేదా రికవరీ ఏజెంట్లుగా నటిస్తూ మళ్లీ మోసం చేస్తారు. అధికారిక పోలీసు మరియు బ్యాంక్ రికవరీ ప్రక్రియ పూర్తిగా ఉచితం."
                    )}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid var(--brand-orange-subtle)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🔑</span>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--brand-orange-dark)", marginBottom: "4px" }}>
                    {L("Warning 2: Rotate All Banking Credentials From a Different Device", "ಎಚ್ಚರಿಕೆ 2: ಬೇರೊಂದು ಸುರಕ್ಷಿತ ಸಾಧನದಿಂದ ಬ್ಯಾಂಕಿಂಗ್ ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ", "चेतावनी 2: किसी अन्य सुरक्षित डिवाइस से बैंकिंग पासवर्ड बदलें", "హెచ్చరిక 2: వేరొక పరికరం నుండి మీ బ్యాంకింగ్ వివరాలు/పాస్‌వర్డ్‌లు మార్చండి")}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#7c2d12", lineHeight: 1.5 }}>
                    {L(
                      "Change your UPI PIN, netbanking password, and primary email password immediately from a family member's or different clean device in case malware or an APK was installed on your phone.",
                      "ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಯಾವುದೇ ಅಸುರಕ್ಷಿತ APK ಅಥವಾ ಸ್ಕ್ರೀನ್ ಶೇರ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಆಗಿದ್ದರೆ, ಕುಟುಂಬದ ಸದಸ್ಯರ ಅಥವಾ ಬೇರೊಂದು ಸುರಕ್ಷಿತ ಸಾಧನದಿಂದ ನಿಮ್ಮ UPI PIN, ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಇಮೇಲ್ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ತಕ್ಷಣ ಬದಲಾಯಿಸಿ.",
                      "यदि आपके फोन में कोई संदिग्ध APK डाउनलोड हुआ था या रिमोट एक्सेस दिया गया था, तो परिवार के किसी सदस्य के सुरक्षित फोन या कंप्यूटर का उपयोग करके अपना UPI PIN, नेटबैंकिंग पासवर्ड और मुख्य ईमेल पासवर्ड तुरंत बदलें।",
                      "మీ ఫోన్‌లో మాల్వేర్ లేదా అనుమానాస్పద APK ఇన్‌స్టాల్ అయి ఉండే అవకాశం ఉంటే, కుటుంబ సభ్యుల లేదా వేరే సురక్షిత పరికరం ద్వారా మీ UPI పిన్, నెట్ బ్యాంకింగ్ మరియు ఈమెయిల్ పాస్‌వర్డ్‌లను వెంటనే మార్చండి."
                    )}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>📋</span>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>
                    {L("Warning 3: Retain Your NCRP & 1930 Acknowledgement Number", "ಎಚ್ಚರಿಕೆ 3: ನಿಮ್ಮ NCRP ಮತ್ತು 1930 ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇರಿಸಿ", "चेतावनी 3: अपना NCRP और 1930 संदर्भ नंबर सुरक्षित रखें", "హెచ్చరిక 3: మీ NCRP & 1930 రసీదు సంఖ్యను భద్రపరుచుకోండి")}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#14532d", lineHeight: 1.5 }}>
                    {L(
                      "Keep your NCRP acknowledgement number safely; you will need it to follow up with your local cyber police station, Nodal Bank Officer, and the Banking Ombudsman.",
                      "ನಿಮ್ಮ NCRP ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆಯನ್ನು ಜೋಪಾನವಾಗಿ ಇರಿಸಿ; ಸ್ಥಳೀಯ ಸೈಬರ್ ಪೊಲೀಸ್ ಠಾಣೆ, ಬ್ಯಾಂಕ್ ನೋಡಲ್ ಅಧಿಕಾರಿ ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್ ಒಂಬುಡ್ಸ್‌ಮನ್ ಜೊತೆ ಮುಂದಿನ ಕ್ರಮ ಕೈಗೊಳ್ಳಲು ಈ ಸಂಖ್ಯೆಯ ಅಗತ್ಯವಿದೆ.",
                      "अपना NCRP संदर्भ नंबर संभाल कर रखें; स्थानीय साइबर पुलिस स्टेशन और बैंक नोडल अधिकारी के साथ फॉलो-अप के लिए इसकी आवश्यकता होगी।",
                      "మీ NCRP అక్నాలెడ్జ్‌మెంట్ నంబర్‌ను భద్రంగా ఉంచుకోండి; స్థానిక సైబర్ పోలీస్ స్టేషన్, నోడల్ బ్యాంక్ అధికారి మరియు బ్యాంకింగ్ అంబుడ్స్‌మన్‌ను సంప్రదించడానికి ఇది అవసరం."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Incident Record Download & Controls */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {L("Save Your Incident Record", "ನಿಮ್ಮ ಘಟನಾ ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ", "अपना घटना रिकॉर्ड सहेजें", "మీ సంఘటన రికార్డును భద్రపరచండి")}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {isKn ? "ಎಲ್ಲಾ ಸಮಯದ ಮುದ್ರೆಗಳು, ಕರೆ ಪರಿಶೀಲನೆಗಳು, ವಹಿವಾಟಿನ ಸತ್ಯಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ NCRP ದೂರಿನ ವಿವರಗಳನ್ನು ಸ್ಪಷ್ಟ ಪಠ್ಯ (.txt) ಫೈಲ್‌ನಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡುತ್ತದೆ." : "Downloads all timestamps, call verifications, transaction facts, and the full NCRP complaint narrative in a clean text file."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={downloadCompleteRecord}
                  className="btn btn-primary"
                  style={{
                    padding: "12px 22px",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {L("Save your incident record (.txt)", "ನಿಮ್ಮ ಘಟನಾ ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ (.txt)", "अपना पूरा घटना रिकॉर्ड सहेजें (.txt)", "మీ సంఘటన రಿಕార్డును సేవ్ చేయండి (.txt)")}
                </button>

                <button
                  onClick={clearIncident}
                  className="btn btn-secondary"
                  style={{ color: "#b91c1c", borderColor: "#fca5a5" }}
                >
                  Clear incident record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
