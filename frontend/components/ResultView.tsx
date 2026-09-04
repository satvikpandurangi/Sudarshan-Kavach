"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Analysis } from "@/lib/types";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { useTranslation } from "@/lib/i18n";
import { ReportThreatModal } from "@/components/ReportThreatModal";

export function ResultView({ id }: { id: string }) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { t, lang } = useTranslation();
  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";

  useEffect(() => {
    try {
      const history: Analysis[] = JSON.parse(localStorage.getItem("sk-history") || "[]");
      const found = history.find((x) => x.id === id);
      if (found) {
        setAnalysis(found);
      }
    } catch {
      // Fallback
    }
  }, [id]);

  // Mobile Haptic Feedback trigger with graceful fallback
  useEffect(() => {
    if (!analysis || hasVibrated) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        if (analysis.riskLevel === "HIGH") {
          // Urgent double buzz
          navigator.vibrate([120, 60, 180]);
        } else if (analysis.riskLevel === "MEDIUM") {
          // Caution single tap
          navigator.vibrate(80);
        }
        setHasVibrated(true);
      } catch {
        // Safe fallback if permission denied or browser restricts
      }
    }
  }, [analysis, hasVibrated]);

  if (!analysis) {
    return (
      <div className="card-premium" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 18px", color: "var(--brand-orange)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="heading-md">Security Record Not Found</h2>
        <p className="text-muted" style={{ marginBottom: 20 }}>
          This analysis is unavailable in your device&apos;s current browser session.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Check a Link or Message
        </Link>
      </div>
    );
  }

  const SIGN_TRANSLATIONS_KN: Record<string, string> = {
    "Sensitive information request": "ಗೌಪ್ಯ ಮಾಹಿತಿ / OTP ವಿನಂತಿ",
    "Pressure and urgency": "ತುರ್ತು ಮತ್ತು ಒತ್ತಡದ ಭಾಷೆ",
    "Payment request": "ಹಣ ಪಾವತಿ / UPI ವಿನಂತಿ",
    "Possible impersonation": "ಅಧಿಕೃತ ಸಂಸ್ಥೆಯ ವೇಷ ಧರಿಸುವಿಕೆ",
    "High-risk offer pattern": "ಅಪಾಯಕಾರಿ ಉದ್ಯೋಗ/ಹೂಡಿಕೆ ಕೊಡುಗೆ",
    "Potential device-risk request": "ಅಪಾಯಕಾರಿ ಆ್ಯಪ್ / APK ಡೌನ್‌ಲೋಡ್",
    "Greets you generically": "ಸಾಮಾನ್ಯ ಸಂಬೋಧನೆ",
    "generic_salutation": "ಸಾಮಾನ್ಯ ಸಂಬೋಧನೆ",
    "urgency_pressure": "ತುರ್ತು ಅಥವಾ ಒತ್ತಡದ ಭಾಷೆ",
    "credential_request": "ಗೌಪ್ಯ ಮಾಹಿತಿ / OTP ವಿನಂತಿ",
    "upi_pin_requested": "UPI PIN, OTP ಅಥವಾ ಗೌಪ್ಯ ವಿವರಗಳ ವಿನಂತಿ",
    "collect_request_to_receive": "ಹಣ ಸ್ವೀಕರಿಸಲು UPI ವಿನಂತಿ ಅಥವಾ PIN ಕೇಳಲಾಗಿದೆ",
    "refund_reversal_bait": "ತಪ್ಪಾದ ವರ್ಗಾವಣೆ ಅಥವಾ ಮರುಪಾವತಿಯ ನೆಪ",
    "unknown_vpa_payment": "ಪಾವತಿ ವಿನಂತಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸದ ವೈಯಕ್ತಿಕ UPI ID (VPA)",
    "advance_fee": "ಉದ್ಯೋಗ, ಸಾಲ ಅಥವಾ ಬಹುಮಾನಕ್ಕೂ ಮುನ್ನ ಮುಂಗಡ ಶುಲ್ಕದ ವಿನಂತಿ",
    "lookalike_domain": "ನಕಲಿ ಹೋಲಿಕೆಯ ಬ್ಯಾಂಕ್ ಅಥವಾ ಬ್ರ್ಯಾಂಡ್ ಡೊಮೇನ್",
    "payment_request": "ಹಣ ಪಾವತಿ / UPI ವಿನಂತಿ",
    "suspicious_domain": "ಅನುಮಾನಾಸ್ಪದ ಅಥವಾ ನಕಲಿ ವೆಬ್ ಲಿಂಕ್",
    "brand_impersonation": "ಬ್ಯಾಂಕ್ ಅಥವಾ ಸಂಸ್ಥೆಯ ವೇಷ ಧರಿಸುವಿಕೆ",
    "apk_download": "ಅಪಾಯಕಾರಿ ಆ್ಯಪ್ / APK ಡೌನ್‌ಲೋಡ್",
    "remote_access": "ರಿಮೋಟ್ ಪ್ರವೇಶ / ಸ್ಕ್ರೀನ್ ಶೇರ್ ವಿನಂತಿ",
    "high_risk_offer": "ಅತಿಯಾದ ಲಾಭ / ನಕಲಿ ಉದ್ಯೋಗ ಕೊಡುಗೆ",
    "No active threat indicators detected.": "ಯಾವುದೇ ಸಕ್ರಿಯ ಬೆದರಿಕೆ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
  };

  const DEFAULT_ACTIONS_KN: Record<"LOW" | "MEDIUM" | "HIGH" | "CANNOT_DETERMINE", string[]> = {
    HIGH: [
      "ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಪಾವತಿ ಆ್ಯಪ್‌ನಲ್ಲಿ ಮರು-ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ.",
      "ನಿಮ್ಮ OTP, ಪಾಸ್‌ವರ್ಡ್, PIN ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ವಿವರಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
      "ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯ ಮೂಲಕ ನೇರವಾಗಿ ದೃಢೀಕರಿಸಿ.",
      "ಹಣ ಕಳುಹಿಸಿದ್ದರೆ, ತಕ್ಷಣ ಬ್ಯಾಂಕ್ ಸಂಪರ್ಕಿಸಿ 1930 ಅಥವಾ cybercrime.gov.in ನಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
    ],
    MEDIUM: [
      "ಮುಂದುವರಿಯುವ ಮುನ್ನ ಅಧಿಕೃತ ಚಾನಲ್ ಬಳಸಿ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
      "ಯಾವುದೇ ಕಾರಣಕ್ಕೂ OTP, PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ನೀಡಬೇಡಿ.",
      "ಕಳುಹಿಸುವವರ ಗುರುತು ದೃಢೀಕರಿಸುವವರೆಗೆ ಯಾವುದೇ ಪಾವತಿ ಮಾಡಬೇಡಿ.",
    ],
    LOW: [
      "ಯಾವುದೇ ಪ್ರಮುಖ ಅನುಮಾನಾಸ್ಪದ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      "ಅನಪೇಕ್ಷಿತ ಸಂದೇಶಗಳಿದ್ದಲ್ಲಿ ಅಧಿಕೃತ ಮೂಲದಿಂದ ದೃಢೀಕರಿಸಿ.",
      "ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯು ಸಂಪೂರ್ಣ ಸುರಕ್ಷತೆಯ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ; ಸದಾ ಜಾಗರೂಕರಾಗಿರಿ.",
    ],
    CANNOT_DETERMINE: [
      "ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ.",
      "ನಿಮ್ಮ ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ನ ಹಿಂಭಾಗದಲ್ಲಿ ಮುದ್ರಿತವಾಗಿರುವ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ.",
      "ಅಥವಾ ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ ಅಧಿಕೃತ ಮೊಬೈಲ್ ಆ್ಯಪ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
    ],
  };

  const hasKn = (str?: string) => Boolean(str && /[\u0C80-\u0CFF]/.test(str));
  const SIGN_TRANSLATIONS_HI: Record<string, string> = {
    "Sensitive information request": "गोपनीय जानकारी / OTP का अनुरोध",
    "Pressure and urgency": "जल्दबाजी और दबाव की भाषा",
    "Payment request": "भुगतान / UPI का अनुरोध",
    "Possible impersonation": "आधिकारिक संस्था का रूप धारण करना",
    "High-risk offer pattern": "जोखिम भरा नौकरी/निवेश का प्रस्ताव",
    "Potential device-risk request": "असुरक्षित ऐप / APK डाउनलोड",
    "Greets you generically": "सामान्य अभिवादन",
    "generic_salutation": "सामान्य अभिवादन",
    "urgency_pressure": "जल्दबाजी या दबाव की भाषा",
    "credential_request": "गोपनीय जानकारी / OTP का अनुरोध",
    "upi_pin_requested": "UPI PIN, OTP या पासवर्ड का अनुरोध",
    "collect_request_to_receive": "पैसे प्राप्त करने के लिए UPI अनुरोध या PIN मांगा गया",
    "refund_reversal_bait": "गलत ट्रांसफर या रिफंड वापसी का झांसा",
    "unknown_vpa_payment": "भुगतान अनुरोध में असत्यापित व्यक्तिगत UPI ID (VPA)",
    "advance_fee": "नौकरी, ऋण या पुरस्कार से पहले अग्रिम शुल्क का अनुरोध",
    "lookalike_domain": "नकली जैसा दिखने वाला बैंक या ब्रांड डोमेन",
    "payment_request": "भुगतान / UPI का अनुरोध",
    "suspicious_domain": "संदिग्ध या नकली वेब लिंक",
    "brand_impersonation": "बैंक या संस्था का रूप धारण करना",
    "apk_download": "असुरक्षित ऐप / APK डाउनलोड",
    "remote_access": "रिमोट एक्सेस / स्क्रीन शेयर का अनुरोध",
    "high_risk_offer": "अत्यधिक लाभ / फर्जी नौकरी का प्रस्ताव",
    "No active threat indicators detected.": "कोई सक्रिय खतरे के संकेत नहीं मिले।",
  };

  const DEFAULT_ACTIONS_HI: Record<"LOW" | "MEDIUM" | "HIGH" | "CANNOT_DETERMINE", string[]> = {
    HIGH: [
      "संदिग्ध लिंक पर क्लिक न करें या भुगतान ऐप पर दोबारा स्कैन न करें।",
      "अपना OTP, पासवर्ड, PIN या बैंकिंग विवरण कभी किसी से साझा न करें।",
      "संबंधित संस्था की आधिकारिक वेबसाइट या फोन नंबर के माध्यम से सीधे पुष्टि करें।",
      "यदि पैसे भेज दिए हैं, तो तुरंत अपने बैंक से संपर्क करें और 1930 या cybercrime.gov.in पर रिपोर्ट करें।",
    ],
    MEDIUM: [
      "आगे बढ़ने से पहले किसी आधिकारिक चैनल का उपयोग करके स्वतंत्र रूप से पुष्टि करें।",
      "किसी भी हाल में OTP, PIN या पासवर्ड साझा न करें।",
      "प्रेषक की पहचान सुनिश्चित होने तक कोई भी भुगतान न करें।",
    ],
    LOW: [
      "कोई प्रमुख संदिग्ध संकेतक नहीं मिले।",
      "अप्रत्याशित संदेशों की आधिकारिक स्रोत से पुष्टि अवश्य करें।",
      "स्वचालित विश्लेषण पूर्ण सुरक्षा की गारंटी नहीं दे सकता; सदैव सतर्क रहें।",
    ],
    CANNOT_DETERMINE: [
      "संदेश में दिए गए किसी भी नंबर या लिंक का उपयोग न करें।",
      "अपने डेबिट कार्ड के पीछे दिए गए आधिकारिक नंबर पर कॉल करें।",
      "या सीधे अपने बैंक के आधिकारिक मोबाइल ऐप में जांचें।",
    ],
  };

  const hasHi = (str?: string) => Boolean(str && /[\u0900-\u097F]/.test(str));

  const SIGN_TRANSLATIONS_TE: Record<string, string> = {
    "Sensitive information request": "సున్నితమైన సమాచారం / OTP అభ్యర్థన",
    "Pressure and urgency": "అత్యవసర ఒత్తిడి మరియు బెదిరింపు",
    "Payment request": "చెల్లింపు / UPI అభ్యర్థన",
    "Possible impersonation": "అధికారిక సంస్థ లేదా బ్యాంక్ రూపంలో మోసం",
    "High-risk offer pattern": "అధిక రాబడి / నకిలీ ఉద్యోగ ఆఫర్",
    "Potential device-risk request": "ప్రమాదకరమైన యాప్ / APK డౌన్‌లోడ్",
    "Greets you generically": "సాధారణ సంబోధన",
    "generic_salutation": "సాధారణ సంబోధన",
    "urgency_pressure": "అత్యవసర ఒత్తిడి లేదా బెదిరింపు",
    "credential_request": "సున్నితమైన సమాచారం / OTP అభ్యర్థన",
    "upi_pin_requested": "UPI PIN, OTP లేదా బ్యాంకింగ్ వివరాలు కోరడం",
    "collect_request_to_receive": "డబ్బు స్వీకరించడానికి UPI పిన్ ఎంటర్ చేయమనడం",
    "refund_reversal_bait": "తప్పు లావాదేవీ లేదా రీఫండ్ పేరుతో మోసం",
    "unknown_vpa_payment": "వ్యక్తిగత తెలియని UPI ID (VPA) కి చెల్లింపు కోరడం",
    "advance_fee": "ఉద్యోగం లేదా బహుమతి కోసం ముందస్తు రుసుము అడగడం",
    "lookalike_domain": "నకిలీ బ్యాంక్ లేదా బ్రాండ్ వెబ్ లింక్",
    "payment_request": "చెల్లింపు / UPI అభ్యర్థన",
    "suspicious_domain": "అనుమానాస్పద లేదా నకిలీ వెబ్ లింక్",
    "brand_impersonation": "బ్యాంక్ లేదా ప్రభుత్వ సంస్థ పేరుతో నకిలీ",
    "apk_download": "సురక్షితం కాని యాప్ / APK డౌన్‌లోడ్",
    "remote_access": "రిమోట్ యాక్సెస్ లేదా స్క్రీన్ షేరింగ్ అభ్యర్థన",
    "high_risk_offer": "భారీ లాభాలు / నకిలీ పెట్టుబడి ఆఫర్",
    "No active threat indicators detected.": "ఎటువంటి క్రియాశీల ముప్పు సంకేతాలు కనుగొనబడలేదు.",
  };

  const DEFAULT_ACTIONS_TE: Record<"LOW" | "MEDIUM" | "HIGH" | "CANNOT_DETERMINE", string[]> = {
    HIGH: [
      "అనుమానాస్పద లింక్‌లపై క్లిక్ చేయవద్దు లేదా చెల్లింపు యాప్‌లలో స్కాన్ చేయవద్దు.",
      "మీ OTP, పాస్‌వర్డ్, PIN లేదా బ్యాంకింగ్ వివరాలను ఎవరితోనూ పంచుకోవద్దు.",
      "సంబంధిత సంస్థ యొక్క అధికారిక వెబ్‌సైట్ లేదా ఫోన్ నంబర్ ద్వారా నేరుగా నిర్ధారించుకోండి.",
      "ఒకవేళ డబ్బు పంపినట్లయితే, వెంటనే మీ బ్యాంకును సంప్రదించి 1930 లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి.",
    ],
    MEDIUM: [
      "కొనసాగే ముందు అధికారిక మార్గాల ద్వారా స్వతంత్రంగా ధృవీకరించుకోండి.",
      "ఎట్టి పరిస్థితుల్లోనూ OTP, PIN లేదా పాస్‌వర్డ్ పంచుకోవద్దు.",
      "పంపినవారి గుర్తింపు నిర్ధారణ అయ్యే వరకు ఎటువంటి చెల్లింపులు చేయవద్దు.",
    ],
    LOW: [
      "ఎటువంటి ముఖ్యమైన అనుమానాస్పద సంకేతాలు కనుగొనబడలేదు.",
      "అనుకోని సందేశాలను ఎల్లప్పుడూ అధికారిక వనరులతో ధృవీకరించుకోండి.",
      "ఆటోమేటెడ్ విశ్లేషణ కేవలం సలహా మాత్రమే; ఎల్లప్పుడూ జాగ్రత్తగా ఉండండి.",
    ],
    CANNOT_DETERMINE: [
      "సందేశంలో ఇచ్చిన ఏ ఫోన్ నంబర్ లేదా లింక్‌ను ఉపయోగించవద్దు.",
      "మీ డెబిట్ కార్డు వెనుక ఉన్న అధికారిక కస్టమర్ కేర్ నంబర్‌కు కాల్ చేయండి.",
      "లేదా నేరుగా మీ బ్యాంక్ అధికారిక మొబైల్ యాప్‌లో తనిఖీ చేయండి.",
    ],
  };

  const hasTe = (str?: string) => Boolean(str && /[\u0C00-\u0C7F]/.test(str));

  const isCD = analysis.riskLevel === "CANNOT_DETERMINE";
  const riskKey = analysis.riskLevel;
  const localizedRiskName = isCD
    ? (t.risk.CANNOT_DETERMINE || (isKn ? "ಅನಿರ್ದಿಷ್ಟ" : isHi ? "अस्पष्ट" : isTe ? "అనిశ్చితం" : "CANNOT DETERMINE"))
    : (t.risk[riskKey as "LOW" | "MEDIUM" | "HIGH"] || analysis.riskLevel);

  const displayClassification = isCD
    ? (isKn
        ? "ಅನಿರ್ದಿಷ್ಟ — ಅಸ್ಪಷ್ಟ ಸಾಕ್ಷ್ಯ (ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ)"
        : isHi
        ? "अस्पष्ट — अपर्याप्त साक्ष्य (सतर्क रहें)"
        : isTe
        ? "అనిశ్చితం — అసంపూర్ణ సాక్ష్యం (అప్రమత్తంగా ఉండండి)"
        : "Cannot Determine — Inconclusive Evidence (Stay Vigilant)")
    : isKn
    ? (riskKey === "HIGH"
        ? "ಅಪಾಯಕಾರಿ — ಸಕ್ರಿಯ ವಂಚನೆ / ಫಿಶಿಂಗ್ ಬೆದರಿಕೆ ಪತ್ತೆಯಾಗಿದೆ"
        : riskKey === "MEDIUM"
        ? "ಅನುಮಾನಾಸ್ಪದ — ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ (ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ)"
        : "ಕಡಿಮೆ ಅಪಾಯ — ಅಧಿಕೃತ ಅಥವಾ ಸುರಕ್ಷಿತ ಚಾನಲ್")
    : isHi
    ? (riskKey === "HIGH"
        ? "खतरनाक — सक्रिय धोखाधड़ी / फ़िशिंग का खतरा"
        : riskKey === "MEDIUM"
        ? "संदिग्ध — भ्रामक पैटर्न पहचाने गए (सावधानी आवश्यक)"
        : "कम जोखिम — सत्यापित आधिकारिक या सुरक्षित चैनल")
    : isTe
    ? (riskKey === "HIGH"
        ? "ప్రమాదకరమైనది — క్రియాశీల మోసం / ఫిషింగ్ ముప్పు గుర్తించబడింది"
        : riskKey === "MEDIUM"
        ? "అనుమానాస్పదమైనది — మోసపూరిత నమూనాలు కనుగొనబడ్డాయి (జాగ్రత్త అవసరం)"
        : "తక్కువ ప్రమాదం — ధృవీకరించబడిన అధికారిక లేదా సురక్షితమైనది")
    : analysis.classification;

  const displayExplanation = isCD
    ? (isKn
        ? "ಖಚಿತ ವಂಚನೆ ಕಂಡುಬಂದಿಲ್ಲ, ಆದರೆ ಇದು ಅಧಿಕೃತವೆಂದು ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ಕೆಳಗಿನ ಪರಿಶೀಲನಾ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ."
        : isHi
        ? "निश्चित धोखाधड़ी नहीं मिली, लेकिन यह संदेश प्रामाणिक है इसकी पुष्टि नहीं हो सकी। नीचे दिए गए सत्यापन चरणों का पालन करें।"
        : isTe
        ? "ఖచ్చితమైన మోసం కనుగొనబడలేదు, కానీ ఇది ప్రామాణికమైనదని నిర్ధారించలేకపోయాము. దిగువ ధృవీకరణ దశలను పూర్తి చేయండి."
        : "We could not find definite scam signs, but could not confirm this message is authentic. Complete the manual verification steps below before taking any action.")
    : isKn && !hasKn(analysis.explanation)
      ? (riskKey === "HIGH"
          ? "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಇವು ಡಿಜಿಟಲ್ ವಂಚನೆ ಮತ್ತು ಫಿಶಿಂಗ್ ತಂತ್ರಗಳಿಗೆ ನಿಕಟವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ. ಯಾವುದೇ ಲಿಂಕ್ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
          : riskKey === "MEDIUM"
          ? "ಅನುಮಾನಾಸ್ಪದ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ. ಯಾವುದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಅಧಿಕೃತ ಚಾನಲ್ ಮೂಲಕ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ."
          : "ಈ ವಿಷಯದಲ್ಲಿ ಯಾವುದೇ ಅನುಮಾನಾಸ್ಪದ ಅಥವಾ ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಅಪರಿಚಿತ ವಿನಂತಿಗಳ ಬಗ್ಗೆ ಸದಾ ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ.")
      : isHi && !hasHi(analysis.explanation)
      ? (riskKey === "HIGH"
          ? "सुरक्षा चेतावनी संकेत मिले हैं। ये डिजिटल धोखाधड़ी और फ़िशिंग तकनीकों से मेल खाते हैं। किसी भी लिंक पर क्लिक न करें या OTP साझा न करें।"
          : riskKey === "MEDIUM"
          ? "संदिग्ध पैटर्न मिले हैं। कोई भी कदम उठाने से पहले आधिकारिक चैनल के माध्यम से स्वतंत्र रूप से पुष्टि करें।"
          : "इस सबमिशन में कोई संदिग्ध या भ्रामक पैटर्न नहीं मिला। अप्रत्याशित अनुरोधों के प्रति हमेशा सतर्क रहें।")
      : isTe && !hasTe(analysis.explanation)
      ? (riskKey === "HIGH"
          ? "భద్రతా హెచ్చరిక సంకేతాలు గుర్తించబడ్డాయి. ఇవి డిజిటల్ మోసాలు మరియు ఫిషింగ్ పద్ధతులకు సరిపోతాయి. ఏ లింక్ క్లిక్ చేయవద్దు లేదా OTP పంచుకోవద్దు."
          : riskKey === "MEDIUM"
          ? "అనుమానాస్పద నమూనాలు కనిపించాయి. ఏ చర్య తీసుకునే ముందైనా అధికారిక మార్గాల ద్వారా ధృవీకరించుకోండి."
          : "ఈ కంటెంట్‌లో ఎలాంటి అనుమానాస్పద లేదా మోసపూరిత నమూనాలు కనుగొనబడలేదు. అపరిచిత అభ్యర్థనల పట్ల ఎల్లప్పుడూ అప్రమత్తంగా ఉండండి.")
      : analysis.explanation;

  const displayWarningSigns = (analysis.warningSigns && analysis.warningSigns.length > 0)
    ? analysis.warningSigns.map((sign) => {
        if (isKn) {
          if (hasKn(sign)) return sign;
          for (const [enP, knP] of Object.entries(SIGN_TRANSLATIONS_KN)) {
            if (sign.startsWith(enP)) return sign.replace(enP, knP);
          }
        } else if (isHi) {
          if (hasHi(sign)) return sign;
          for (const [enP, hiP] of Object.entries(SIGN_TRANSLATIONS_HI)) {
            if (sign.startsWith(enP)) return sign.replace(enP, hiP);
          }
        } else if (isTe) {
          if (hasTe(sign)) return sign;
          for (const [enP, teP] of Object.entries(SIGN_TRANSLATIONS_TE)) {
            if (sign.startsWith(enP)) return sign.replace(enP, teP);
          }
        }
        return sign;
      })
    : [isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಬೆದರಿಕೆ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ." : isHi ? "कोई सक्रिय खतरे के संकेत नहीं मिले।" : isTe ? "ఎటువంటి క్రియాశీల ముప్పు సంకేతాలు కనుగొనబడలేదు." : "No active threat indicators detected."];

  const hasActionsKn = analysis.recommendedActions?.some((a) => hasKn(a));
  const hasActionsHi = analysis.recommendedActions?.some((a) => hasHi(a));
  const hasActionsTe = analysis.recommendedActions?.some((a) => hasTe(a));
  const displayActions =
    isKn && !hasActionsKn
      ? DEFAULT_ACTIONS_KN[riskKey]
      : isHi && !hasActionsHi
      ? DEFAULT_ACTIONS_HI[riskKey]
      : isTe && !hasActionsTe
      ? DEFAULT_ACTIONS_TE[riskKey]
      : analysis.recommendedActions;

  // Recommended Primary Action Banner text
  const primaryActionText = isCD
    ? (isKn ? "ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ" : isHi ? "कोई भी कदम उठाने से पहले स्वतंत्र रूप से पुष्टि करें" : isTe ? "ముందుకు సాగే ముందు స్వతంత్రంగా ధృవీకరించుకోండి" : "Verify independently through official channels before proceeding")
    : riskKey === "HIGH"
    ? t.result.stopDoNotClick
    : riskKey === "MEDIUM"
    ? t.result.pauseAndVerify
    : t.result.proceedWithCaution;

  const copyReportToClipboard = () => {
    const report = `SUDARSHAN KAVACH SECURITY REPORT
Verdict: ${localizedRiskName} (${analysis.riskScore}/100)
Classification: ${analysis.classification}
Input: ${analysis.submitted}
Warning Signs:
${analysis.warningSigns.map((s) => `• ${s}`).join("\n")}
Recommended Actions:
${analysis.recommendedActions.map((a) => `• ${a}`).join("\n")}
Analyzed with Sudarshan Kavach Digital Safety Co-pilot.`;

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const downloadAuditReport = () => {
    if (!analysis) return;
    const auditData = {
      product: "Sudarshan Kavach AI",
      timestamp: new Date().toISOString(),
      reportId: analysis.id,
      riskLevel: analysis.riskLevel,
      riskScore: analysis.riskScore,
      classification: analysis.classification,
      submittedContent: analysis.submitted,
      warningSigns: analysis.warningSigns,
      evidence: analysis.evidence,
      recommendedActions: analysis.recommendedActions,
      detectedUrls: analysis.detectedUrls || [],
      legalDisclaimer: "Advisory digital forensic report generated by Sudarshan Kavach for reporting to 1930 / cybercrime.gov.in",
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sudarshan-kavach-evidence-${analysis.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const handleActedOnMessage = () => {
    if (!analysis) return;
    try {
      sessionStorage.setItem("sk_prefill_incident_msg", analysis.submitted);
      const existing = localStorage.getItem("sk_incident");
      let inc = existing ? JSON.parse(existing) : null;
      if (!inc || !inc.isActive) {
        inc = {
          isActive: true,
          startedAt: Date.now(),
          currentStep: 1,
          step1Called1930: false,
          step2CalledBank: false,
          details: {
            scammerContact: analysis.submitted,
          },
        };
      } else {
        inc.details = {
          ...inc.details,
          scammerContact: inc.details?.scammerContact || analysis.submitted,
        };
      }
      localStorage.setItem("sk_incident", JSON.stringify(inc));
    } catch (e) {
      console.error(e);
    }
    router.push("/safety?flow=start#incident-flow");
  };

  const handleShareWhatsApp = () => {
    if (!analysis) return;

    let emoji = "✅";
    let tierLabel = t.risk.LOW || "SAFE";
    if (riskKey === "HIGH") {
      emoji = "🔴";
      tierLabel = isKn ? "ಅಪಾಯಕಾರಿ" : isHi ? "ख़तरनाक" : isTe ? "ప్రమాదకరమైనది" : "DANGEROUS";
    } else if (riskKey === "MEDIUM") {
      emoji = "🟠";
      tierLabel = isKn ? "ಅನುಮಾನಾಸ್ಪದ" : isHi ? "संदिग्ध" : isTe ? "అనుమానాస్పదమైనది" : "SUSPICIOUS";
    } else if (isCD) {
      emoji = "⚠️";
      tierLabel = isKn ? "ಅನಿರ್ದಿಷ್ಟ" : isHi ? "अस्पष्ट" : isTe ? "అనిశ్చితం" : "UNCERTAIN";
    } else {
      emoji = "✅";
      tierLabel = isKn ? "ಸುರಕ್ಷಿತ" : isHi ? "सुरक्षित" : isTe ? "సురక్షితమైనది" : "SAFE";
    }

    const header = `${emoji} ${tierLabel} — Sudarshan Kavach`;
    const reason = (displayExplanation || "").split("\n")[0].split(". ")[0].trim();

    const signsHeader = isKn ? "ಎಚ್ಚರಿಕೆ ಸೂಚನೆಗಳು:" : isHi ? "चेतावनी के संकेत:" : isTe ? "హెచ్చరిక సంకేతాలు:" : "Warning signs:";
    const topSigns = displayWarningSigns.slice(0, 3).map((s) => `• ${s}`).join("\n");

    const whatToDoLabel = isKn ? "ಮಾಡಬೇಕಾದ ಕ್ರಮ:" : isHi ? "क्या करें:" : isTe ? "చేయవలసిన పని:" : "What to do:";
    const primaryAction = (displayActions && displayActions.length > 0) ? displayActions[0] : primaryActionText;

    const footer = isKn
      ? "ಸುದರ್ಶನ ಕವಚದಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ"
      : isHi
      ? "सुदर्शन कवच द्वारा सत्यापित"
      : isTe
      ? "సుదర్శన కవచం ద్వారా ధృవీకరించబడింది"
      : "Checked with Sudarshan Kavach";

    const parts = [
      header,
      "",
      reason,
      "",
      signsHeader,
      topSigns,
      "",
      `${whatToDoLabel} ${primaryAction}`,
      "",
      footer,
    ];

    const shareBody = parts.join("\n");
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareBody)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <section className={`result-view-container risk-theme-${riskKey}`}>
      {/* Header Pill & Engine Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "var(--brand-orange-light)",
              color: "var(--brand-orange-dark)",
              border: "1px solid var(--brand-orange-subtle)",
            }}
          >
            SECURITY ANALYSIS
          </span>
          <span className="text-muted" style={{ fontSize: "0.82rem" }}>
            • {new Date(analysis.createdAt).toLocaleString("en-IN")}
          </span>
        </div>

        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "6px",
            background: "#f1f5f9",
            color: "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <img
            src="/sudarshan-shield-emblem.png"
            alt="Sudarshan Kavach Logo"
            style={{ height: "18px", width: "18px", objectFit: "contain", flexShrink: 0 }}
          />
          <span>{analysis.aiProvider ? (isKn ? `ಇಂಜಿನ್: ${analysis.aiProvider}` : isHi ? `इंजन: ${analysis.aiProvider}` : isTe ? `ఇంజిన్: ${analysis.aiProvider}` : `Engine: ${analysis.aiProvider}`) : (isKn ? "ಇಂಜಿನ್: ಸುದರ್ಶನ ಬೆದರಿಕೆ ಇಂಜಿನ್" : isHi ? "इंजन: सुदर्शन सुरक्षा इंजन" : isTe ? "ఇంజిన్: సుదర్శన ముప్పు ఇంజిన్" : "Engine: Sudarshan Threat Engine v2.4")}</span>
        </span>
      </div>

      {/* Truecaller-style Scam Alert Hero Banner */}
      <div className="result-hero-card">
        <div className="result-score-gauge-box">
          <RiskScoreGauge score={analysis.riskScore} riskLevel={riskKey} size={150} />
        </div>

        <div className="result-info-box">
          <div className="result-status-badge">
            {isCD ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : riskKey === "HIGH" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            ) : riskKey === "MEDIUM" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            <span>{isCD ? localizedRiskName : riskKey === "LOW" ? t.result.verifiedSafe : `${localizedRiskName} ${t.common.riskWord}`}</span>
          </div>

          <h1 className="result-title">{displayClassification}</h1>

          <div className="result-meta">
            <span>
              <strong>{t.result.confidence}:</strong> {Math.round(analysis.confidence * 100)}%
            </span>
            <span>•</span>
            <span>
              <strong>{t.result.typeLabel}:</strong> {analysis.inputType}
            </span>
          </div>
        </div>
      </div>

      {/* Prominent High-Impact Recommended Action Banner */}
      <div className="action-banner" role="alert">
        <div className="action-banner-icon">
          {riskKey === "HIGH" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ) : riskKey === "MEDIUM" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <div className="action-banner-content">
          <h3>{primaryActionText}</h3>
          <p>{displayExplanation}</p>
        </div>
      </div>

      {/* Device-Native WhatsApp Sharing Card (All 4 Risk Tiers) */}
      <div
        style={{
          marginTop: "16px",
          marginBottom: "16px",
          padding: "16px 20px",
          borderRadius: "14px",
          background: "#f0fdf4",
          border: "1.5px solid #86efac",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "#16a34a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ color: "#14532d", fontSize: "0.98rem" }}>
                {t.result.shareResult}
              </strong>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  background: "#dcfce7",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                }}
              >
                Device-Native • Zero Server Contact
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#166534" }}>
              {t.result.shareDisclaimer}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="btn btn-primary"
            style={{
              background: "#16a34a",
              borderColor: "#15803d",
              color: "#fff",
              fontWeight: 700,
              padding: "10px 18px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {t.result.shareResult}
          </button>
          <span style={{ fontSize: "0.74rem", color: "#166534" }}>
            {t.result.shareDisclaimer}
          </span>
        </div>
      </div>

      {/* When Cannot Determine: return tailored manual verification checklist instead of signals */}
      {isCD ? (
        <div className="evidence-section">
          <div
            className="evidence-card"
            style={{
              border: "1px solid rgba(59, 130, 246, 0.35)",
              background: "rgba(59, 130, 246, 0.04)",
              padding: "24px 20px",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div>
                <h2 className="heading-md" style={{ margin: 0, fontSize: "1.2rem", color: "#1e3a8a" }}>
                  {isKn
                    ? "ಹಸ್ತಚಾಲಿತ ಪರಿಶೀಲನಾ ಪರಿಶೀಲನಾಪಟ್ಟಿ"
                    : isHi
                    ? "मैनुअल सत्यापन चेकलिस्ट"
                    : isTe
                    ? "మాన్యువల్ ధృవీకరణ చెక్‌లిస్ట్"
                    : "Manual Verification Checklist"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#475569" }}>
                  {isKn
                    ? "ಅನಿರ್ದಿಷ್ಟ ಪುರಾವೆ. ಯಾವುದೇ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡುವ ಅಥವಾ ಹಣ ಪಾವತಿಸುವ ಮುನ್ನ ಈ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ:"
                    : isHi
                    ? "अस्पष्ट साक्ष्य। किसी लिंक पर क्लिक करने या पैसे भेजने से पहले इन चरणों को पूरा करें:"
                    : isTe
                    ? "అనిశ్చిత సాక్ష్యం. ఏదైనా లింక్ క్లిక్ చేయడానికి లేదా డబ్బు పంపడానికి ముందు ఈ క్రింది దశలను పూర్తి చేయండి:"
                    : "Inconclusive evidence. Complete these tailored verification steps before clicking, paying, or trusting:"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(analysis.checklist && analysis.checklist.length > 0 ? analysis.checklist : displayActions).map((step, index) => (
                <label
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginTop: 3, accentColor: "#2563eb", width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.93rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.45 }}>
                    {step}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Warning Signs Section */}
          <div className="evidence-section">
            <h2 className="heading-md" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--active-risk-color)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {t.result.whyFlagged}
            </h2>

            {displayWarningSigns && displayWarningSigns.length > 0 ? (
              displayWarningSigns.map((sign, index) => (
                <div
                  key={index}
                  className={`evidence-chip ${
                    riskKey === "HIGH" ? "alert-chip" : riskKey === "MEDIUM" ? "caution-chip" : ""
                  }`}
                >
                  <span style={{ fontSize: "1.1rem" }}>
                    {riskKey === "HIGH" ? "🔴" : riskKey === "MEDIUM" ? "🟡" : "🟢"}
                  </span>
                  <div>
                    <strong>{sign}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="evidence-chip">
                <span>🟢</span>
                <div>{t.result.safeNotice}</div>
              </div>
            )}
          </div>

          {/* Exact Evidence Grounding Section */}
          <div className="evidence-section">
            <div className="evidence-card">
              <h2 className="heading-md" style={{ marginBottom: 12 }}>
                {t.result.evidenceTitle}
              </h2>
              <p className="text-secondary" style={{ marginBottom: 16, fontSize: "0.95rem" }}>
                {displayExplanation}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {analysis.evidence.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ color: "var(--brand-orange-dark)", fontWeight: 700 }}>›</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recommended Actions Checklist */}
      <div className="evidence-section">
        <div className="evidence-card">
          <h2 className="heading-md" style={{ marginBottom: 12 }}>
            {t.result.actionTitle}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayActions.map((action, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--bg-subtle)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange-dark)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detected URLs if any */}
      {analysis.detectedUrls && analysis.detectedUrls.length > 0 && (
        <div className="evidence-section">
          <div className="evidence-card">
            <h3 className="heading-md" style={{ fontSize: "1.05rem", marginBottom: 10 }}>
              {t.result.detectedUrls}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {analysis.detectedUrls.map((u, i) => (
                <code
                  key={i}
                  style={{
                    padding: "8px 12px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    wordBreak: "break-all",
                    color: "#334155",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {u}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>
        {/* Row 1: Primary Navigation & Emergency Action */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "stretch" }}>
          {riskKey === "HIGH" && (
            <button
              onClick={handleActedOnMessage}
              className="btn btn-danger"
              style={{
                flex: 1.3,
                minWidth: "240px",
                justifyContent: "center",
                padding: "12px 20px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {isKn ? "ನಾನು ಈಗಾಗಲೇ ಈ ಸಂದೇಶದ ಮೇಲೆ ಕ್ರಮ ಕೈಗೊಂಡಿದ್ದೇನೆ" : isHi ? "मैंने इस संदेश पर पहले ही कदम उठा लिया है" : isTe ? "నేను ఇప్పటికే ఈ సందేశంపై చర్య తీసుకున్నాను" : "I already acted on this message"}
            </button>
          )}

          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{ flex: 1, minWidth: "180px", justifyContent: "center", padding: "12px 20px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            {t.result.checkAnother}
          </Link>

          {riskKey === "HIGH" && (
            <a
              href="tel:1930"
              className="btn btn-secondary"
              style={{
                flex: 1,
                minWidth: "180px",
                justifyContent: "center",
                padding: "12px 20px",
                color: "#b91c1c",
                borderColor: "#fca5a5",
                background: "#fef2f2",
                fontWeight: 700,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {t.result.reportTo1930}
            </a>
          )}
        </div>

        {/* Row 2: Secondary Forensic Tools */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={copyReportToClipboard} style={{ flex: 1, minWidth: "140px", fontSize: "0.85rem" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copied ? t.result.reportCopied : t.result.copyReport}
          </button>

          <button className="btn btn-secondary" onClick={downloadAuditReport} style={{ flex: 1, minWidth: "140px", fontSize: "0.85rem" }} title="Download forensic JSON evidence file">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {t.result.exportJson}
          </button>

          <button className="btn btn-secondary" onClick={printReport} style={{ flex: 1, minWidth: "140px", fontSize: "0.85rem" }} title="Print formal report for Bank or Police station">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            {t.result.printEvidence}
          </button>

          <button className="btn btn-secondary" onClick={() => setShowReportModal(true)} style={{ flex: 1, minWidth: "140px", fontSize: "0.85rem", color: "#b91c1c" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            {t.result.reportThreat}
          </button>
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: "0.82rem", marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
        {t.result.disclaimer}
      </p>

      {/* Community Report Modal */}
      <ReportThreatModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        prefillUrlOrText={analysis.submitted}
      />
    </section>
  );
}
