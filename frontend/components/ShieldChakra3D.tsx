"use client";

import { useState, useRef } from "react";
import { useTranslation, Language } from "@/lib/i18n";

export interface MantraEntry {
  title: string;
  sanskritDevanagari: string;
  scriptMantra: string;
  phonetic: string;
  meaning: string;
  fontFamily: string;
}

export const SUDARSHAN_MANTRA_DATA: Record<Language, MantraEntry> = {
  en: {
    title: "Sudarshan Maha-Mantra • Divine Protection",
    sanskritDevanagari: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्वारिष्ट विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    scriptMantra: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्वारिष्ट विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    phonetic: "Aum namo bhagavate maha sudarshanaya deeptre, jwala parivritaya sarvaarishta vinaashaaya, sarva sampatkaryaaya... hum phat swaahaa",
    meaning: "Sacred invocation of the Sudarshan Chakra for the annihilation of all adversities, fraud vectors, and harm, bestowing total security.",
    fontFamily: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif",
  },
  hi: {
    title: "सुदर्शन महा-मन्त्र • दिव्य अभय कवच",
    sanskritDevanagari: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्वारिष्ट विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    scriptMantra: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्वारिष्ट विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    phonetic: "Aum namo bhagavate maha sudarshanaya deeptre, jwala parivritaya sarvaarishta vinaashaaya, sarva sampatkaryaaya... hum phat swaahaa",
    meaning: "समस्त विघ्न-बाधाओं, साइबर खतरों एवं अनिष्टों के समूल नाश तथा सर्वतोभद्र सुरक्षा हेतु दिव्य सुदर्शन महा-मन्त्र।",
    fontFamily: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif",
  },
  kn: {
    title: "ಸುದರ್ಶನ ಮಹಾ-ಮಂತ್ರ • ದಿವ್ಯ ರಕ್ಷಾ ಕವಚ",
    sanskritDevanagari: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्वारिष्ट विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    scriptMantra: "॥ ಓಂ ನಮೋ ಭಗವತೇ ಮಹಾ ಸುದರ್ಶನಾಯ ದೀಪ್ತ್ರೇ, ಜ್ವಾಲಾ ಪರಿವೃತಾಯ ಸರ್ವಾರಿಷ್ಟ ವಿನಾಶಾಯ, ಸರ್ವ ಸಂಪತ್ಕರಾಯ... ಹುಂ ಫಟ್ ಸ್ವಾಹಾ ॥",
    phonetic: "Aum namo bhagavate maha sudarshanaya deeptre, jwala parivritaya sarvaarishta vinaashaaya, sarva sampatkaryaaya... hum phat swaahaa",
    meaning: "ಸಕಲ ಆಪತ್ತು, ವಂಚನೆ ಹಾಗೂ ಅನಿಷ್ಟಗಳ ನಿರ್ಮೂಲನೆಗೆ ಮತ್ತು ಸರ್ವತೋಮುಖ ರಕ್ಷಣೆಗಾಗಿ ಪರಮ ಪವಿತ್ರ ಸುದರ್ಶನ ಮಹಾ-ಮಂತ್ರ.",
    fontFamily: "'Noto Sans Kannada', 'Plus Jakarta Sans', sans-serif",
  },
  te: {
    title: "సుదర్శన మహా-మంత్రం • దివ్య రక్షా కవచం",
    sanskritDevanagari: "॥ ॐ नमो भगवते महा सुदर्शनाय दीप्त्रे, ज्वाला परिवृताय सर्వారిష్ట विनाशाय, सर्व सम्पत्कराय... हुं फट् स्वाहा ॥",
    scriptMantra: "॥ ఓం నమో భగవతే మహా సుదర్శనాయ దీప్త్రే, జ్వాలా పరివృతాయ సర్వారిష్ట వినాశాయ, సర్వ సంపత్కరాయ... హుం ఫట్ స్వాహా ॥",
    phonetic: "Aum namo bhagavate maha sudarshanaya deeptre, jwala parivritaya sarvaarishta vinaashaaya, sarva sampatkaryaaya... hum phat swaahaa",
    meaning: "సర్వ సంకటాల నివారణకు, మోసాల నుండి సంరక్షణకు మరియు సర్వ సంపత్-భద్రతకు పవిత్ర సుదర్శన చక్ర మహా-మంత్రం.",
    fontFamily: "'Noto Sans Telugu', 'Plus Jakarta Sans', sans-serif",
  },
};

interface ShieldChakra3DProps {
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  interactive?: boolean;
  language?: Language;
}

export function ShieldChakra3D({ riskLevel, interactive = true, language }: ShieldChakra3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { lang: contextLang } = useTranslation();
  const activeLang: Language = language || contextLang || "en";
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic aura and glow colors based on risk state
  const glowColor =
    riskLevel === "HIGH"
      ? "rgba(239, 68, 68, 0.55)"
      : riskLevel === "MEDIUM"
      ? "rgba(245, 158, 11, 0.5)"
      : riskLevel === "LOW"
      ? "rgba(16, 185, 129, 0.5)"
      : "rgba(249, 115, 22, 0.45)";

  const auraGradient =
    riskLevel === "HIGH"
      ? "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 72%)"
      : riskLevel === "MEDIUM"
      ? "radial-gradient(circle, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 72%)"
      : riskLevel === "LOW"
      ? "radial-gradient(circle, rgba(16, 185, 129, 0.32) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 72%)"
      : "radial-gradient(circle, rgba(251, 146, 60, 0.38) 0%, rgba(234, 88, 12, 0.12) 55%, transparent 72%)";

  const statusLabel =
    riskLevel === "HIGH"
      ? "HIGH RISK DETECTED"
      : riskLevel === "MEDIUM"
      ? "CAUTION ADVISED"
      : riskLevel === "LOW"
      ? "VERIFIED SECURE"
      : "THREAT DETECTION ACTIVE";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(pointer: fine)").matches) {
      return; // Skip tilt on touch devices to conserve resources and prevent layout overflow
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    // Up to 12 degrees tilt for subtle 3D perspective
    const factorX = ((y - midY) / midY) * -12;
    const factorY = ((x - midX) / midX) * 12;
    setRotateX(factorX);
    setRotateY(factorY);

    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const mantraItem = SUDARSHAN_MANTRA_DATA[activeLang] || SUDARSHAN_MANTRA_DATA.en;

  return (
    <div
      className="hero-3d-stage"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      style={{
        perspective: "1000px",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        contain: "layout paint",
      }}
    >
      {/* 3D Floating Chakra Box */}
      <div
        style={{
          position: "relative",
          width: "clamp(160px, 48vw, 260px)",
          height: "clamp(160px, 48vw, 260px)",
          maxWidth: "84vw",
          maxHeight: "84vw",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.04 : 1})`,
          transition: isHovered
            ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1)"
            : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Layer 1: Ambient Risk-State Pulsing Glow Aura */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: auraGradient,
            filter: "blur(20px)",
            transform: "translateZ(-20px)",
            pointerEvents: "none",
            boxShadow: `0 0 35px ${glowColor}`,
            animation: "auraBreath 4s ease-in-out infinite alternate",
          }}
        />

        {/* Layer 2: Concentric Golden Celestial Rings (Counter-Rotating) */}
        <div
          style={{
            position: "absolute",
            width: "96%",
            height: "96%",
            borderRadius: "50%",
            border: "1.5px dashed rgba(249, 115, 22, 0.4)",
            transform: "translateZ(10px)",
            pointerEvents: "none",
            animation: "chakraSpin 45s linear infinite reverse",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "88%",
            height: "88%",
            borderRadius: "50%",
            border: "1px solid rgba(234, 88, 12, 0.25)",
            transform: "translateZ(15px)",
            pointerEvents: "none",
          }}
        />

        {/* Layer 3: The Golden Sudarshan Chakra Ornament */}
        <div
          style={{
            position: "relative",
            width: "82%",
            height: "82%",
            transformStyle: "preserve-3d",
            transform: "translateZ(30px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 16px 26px rgba(0, 0, 0, 0.25))",
          }}
        >
          <img
            src="/sudarshan-chakra-gold.png"
            alt="Sacred Golden Sudarshan Chakra"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              animation: isHovered ? "chakraSpin 14s linear infinite" : "chakraSpin 28s linear infinite",
              transition: "animation-duration 0.8s ease",
            }}
          />

          {/* Dynamic Specular Lighting Glare Reflection */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              pointerEvents: "none",
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.35) 0%, transparent 55%)`,
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Layer 4: Floating Security Status Pill */}
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            transform: "translateZ(25px)",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(8px)",
            color: "var(--text-primary)",
            fontSize: "clamp(0.66rem, 2.4vw, 0.74rem)",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: "9999px",
            border: "1.5px solid rgba(249, 115, 22, 0.35)",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            maxWidth: "92%",
            boxSizing: "border-box",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span
            className="pulse-dot"
            style={{
              backgroundColor:
                riskLevel === "HIGH"
                  ? "#ef4444"
                  : riskLevel === "MEDIUM"
                  ? "#f59e0b"
                  : riskLevel === "LOW"
                  ? "#10b981"
                  : "#f97316",
              width: 7,
              height: 7,
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{statusLabel}</span>
        </div>
      </div>

      {/* Layer 5: Sacred Protection Inscription — Sudarshan Maha-Mantra in Sanskrit Across All Languages */}
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          maxWidth: "460px",
          width: "100%",
          padding: "clamp(12px, 3.5vw, 16px)",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 247, 237, 0.92) 100%)",
          borderRadius: "18px",
          border: "1.5px solid rgba(249, 115, 22, 0.3)",
          boxShadow: "0 8px 24px rgba(249, 115, 22, 0.1), 0 2px 6px rgba(0, 0, 0, 0.03)",
          backdropFilter: "blur(10px)",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {/* Sacred Emblem & Title */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.68rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#c2410c",
            marginBottom: "8px",
            padding: "3px 12px",
            borderRadius: "9999px",
            background: "rgba(249, 115, 22, 0.12)",
          }}
        >
          <span>🔱</span>
          <span>{mantraItem.title}</span>
        </div>

        {/* Sacred Sanskrit Mantra in Selected Language Script */}
        <div
          style={{
            fontSize: activeLang === "kn" || activeLang === "te" ? "0.98rem" : "0.92rem",
            fontWeight: 700,
            lineHeight: 1.65,
            color: "#7c2d12",
            fontFamily: mantraItem.fontFamily,
            letterSpacing: activeLang === "kn" || activeLang === "te" ? "0.01em" : "0.02em",
          }}
        >
          {mantraItem.scriptMantra}
        </div>

        {/* Devanagari Sanskrit Sub-line (if active language is Kannada or Telugu) */}
        {(activeLang === "kn" || activeLang === "te") && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "#9a3412",
              marginTop: "4px",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
              opacity: 0.85,
            }}
          >
            {mantraItem.sanskritDevanagari}
          </div>
        )}

        {/* Phonetic Transliteration */}
        <div
          style={{
            fontSize: "0.76rem",
            fontStyle: "italic",
            color: "#b45309",
            marginTop: "6px",
            lineHeight: 1.45,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          &ldquo;{mantraItem.phonetic}&rdquo;
        </div>

        {/* Subtitle / Meaning in the user's language */}
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            marginTop: "8px",
            fontWeight: 500,
            borderTop: "1px dashed rgba(249, 115, 22, 0.25)",
            paddingTop: "7px",
            lineHeight: 1.5,
          }}
        >
          {mantraItem.meaning}
        </div>
      </div>
    </div>
  );
}
