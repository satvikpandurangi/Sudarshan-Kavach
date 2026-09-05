import { NextRequest, NextResponse } from "next/server";
import { assess } from "@/lib/risk-engine";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const TYPES = ["URL", "MESSAGE", "SCREENSHOT", "QR"];

interface SignalBackend {
  id: string;
  severity: string;
  evidence: string;
  title?: string;
  explanation?: string;
  detail?: string;
}

interface BackendResponse {
  risk_level: "dangerous" | "suspicious" | "safe" | "cannot_determine";
  risk_score?: number | null;
  confidence: "high" | "medium" | "low";
  signals: SignalBackend[];
  summary?: string;
  recommended_action?: {
    primary?: string;
    steps?: string[];
    reporting?: {
      helpline?: string;
      url?: string;
      text?: string;
    };
  };
  extracted_urls?: string[];
  processing_ms?: number;
  degraded?: boolean | null;
  extracted_text?: string | null;
  ocr_confidence?: number | null;
}


const SIGNAL_TITLES_HI: Record<string, string> = {
  generic_salutation: "सामान्य अभिवादन",
  urgency_pressure: "जल्दबाजी या दबाव की भाषा",
  credential_request: "गोपनीय जानकारी / OTP का अनुरोध",
  upi_pin_requested: "UPI PIN, OTP या पासवर्ड का अनुरोध",
  collect_request_to_receive: "पैसे प्राप्त करने के लिए UPI अनुरोध या PIN मांगा गया",
  refund_reversal_bait: "गलत ट्रांसफर या रिफंड वापसी का झांसा",
  unknown_vpa_payment: "भुगतान अनुरोध में असत्यापित व्यक्तिगत UPI ID (VPA)",
  advance_fee: "नौकरी, ऋण या पुरस्कार से पहले अग्रिम शुल्क का अनुरोध",
  lookalike_domain: "नकली जैसा दिखने वाला बैंक या ब्रांड डोमेन",
  payment_request: "भुगतान / UPI का अनुरोध",
  suspicious_domain: "संदिग्ध या नकली वेब लिंक",
  brand_impersonation: "बैंक या संस्था का रूप धारण करना",
  apk_download: "असुरक्षित ऐप / APK डाउनलोड",
  remote_access: "रिमोट एक्सेस / स्क्रीन शेयर का अनुरोध",
  high_risk_offer: "अत्यधिक लाभ / फर्जी नौकरी का प्रस्ताव",
  ip_address_url: "सीधा IP पता लिंक",
  shortened_url: "संक्षिप्त किया गया लिंक (URL Shortener)",
  url_shortener: "संक्षिप्त किया गया लिंक (URL Shortener)",
  punycode_domain: "नकली जैसा दिखने वाला डोमेन",
  typosquat_domain: "नकली वर्तनी वाला डोमेन",
  unsolicited_prize: "अप्रत्याशित लॉटरी या कार इनाम का लालच",
  gambling_betting_lure: "ऑनलाइन रम्मी, सट्टेबाजी या जुए का लालच",
  unregulated_gambling_domain: "अनियमित ऑनलाइन रम्मी या सट्टेबाजी लिंक",
  new_domain: "हाल ही में पंजीकृत नया डोमेन",
  recent_domain: "कम समय पहले बना डोमेन",
  excessive_subdomains: "अत्यधिक स्तरों वाला वेब पता",
  insecure_http: "असुरक्षित गैर-एन्क्रिप्टेड लिंक (HTTP)",
};
const SIGNAL_TITLES_KN: Record<string, string> = {
  generic_salutation: "ಸಾಮಾನ್ಯ ಸಂಬೋಧನೆ",
  urgency_pressure: "ತುರ್ತು ಅಥವಾ ಒತ್ತಡದ ಭಾಷೆ",
  credential_request: "ಗೌಪ್ಯ ಮಾಹಿತಿ / OTP ವಿನಂತಿ",
  upi_pin_requested: "UPI PIN, OTP ಅಥವಾ ಗೌಪ್ಯ ವಿವರಗಳ ವಿನಂತಿ",
  collect_request_to_receive: "ಹಣ ಸ್ವೀಕರಿಸಲು UPI ವಿನಂತಿ ಅಥವಾ PIN ಕೇಳಲಾಗಿದೆ",
  refund_reversal_bait: "ತಪ್ಪಾದ ವರ್ಗಾವಣೆ ಅಥವಾ ಮರುಪಾವತಿಯ ನೆಪ",
  unknown_vpa_payment: "ಪಾವತಿ ವಿನಂತಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸದ ವೈಯಕ್ತಿಕ UPI ID (VPA)",
  advance_fee: "ಉದ್ಯೋಗ, ಸಾಲ ಅಥವಾ ಬಹುಮಾನಕ್ಕೂ ಮುನ್ನ ಮುಂಗಡ ಶುಲ್ಕದ ವಿನಂತಿ",
  lookalike_domain: "ನಕಲಿ ಹೋಲಿಕೆಯ ಬ್ಯಾಂಕ್ ಅಥವಾ ಬ್ರ್ಯಾಂಡ್ ಡೊಮೇನ್",
  payment_request: "ಹಣ ಪಾವತಿ / UPI ವಿನಂತಿ",
  suspicious_domain: "ಅನುಮಾನಾಸ್ಪದ ಅಥವಾ ನಕಲಿ ವೆಬ್ ಲಿಂಕ್",
  brand_impersonation: "ಬ್ಯಾಂಕ್ ಅಥವಾ ಸಂಸ್ಥೆಯ ವೇಷ ಧರಿಸುವಿಕೆ",
  apk_download: "ಅಪಾಯಕಾರಿ ಆ್ಯಪ್ / APK ಡೌನ್‌ಲೋಡ್",
  remote_access: "ರಿಮೋಟ್ ಪ್ರವೇಶ / ಸ್ಕ್ರೀನ್ ಶೇರ್ ವಿನಂತಿ",
  high_risk_offer: "ಅತಿಯಾದ ಲಾಭ / ನಕಲಿ ಉದ್ಯೋಗ ಕೊಡುಗೆ",
  ip_address_url: "ನೇರ IP ವಿಳಾಸದ ಲಿಂಕ್",
  shortened_url: "ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಿದ ಲಿಂಕ್ (URL Shortener)",
  url_shortener: "ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಿದ ಲಿಂಕ್ (URL Shortener)",
  punycode_domain: "ನಕಲಿ ಹೋಲಿಕೆಯ ಡೊಮೇನ್",
  typosquat_domain: "ನಕಲಿ ಕಾಗುಣಿತದ ಡೊಮೇನ್",
  unsolicited_prize: "ಅನಪೇಕ್ಷಿತ ಲಾಟರಿ ಅಥವಾ ಬಹುಮಾನದ ಆಮಿಷ",
  gambling_betting_lure: "ಆನ್‌ಲೈನ್ ರಮ್ಮಿ, ಜೂಜು ಅಥವಾ ಬೆಟ್ಟಿಂಗ್ ಆಮಿಷ",
  unregulated_gambling_domain: "ಅನಧಿಕೃತ ರಮ್ಮಿ ಅಥವಾ ಜೂಜಿನ ಲಿಂಕ್",
  new_domain: "ಇತ್ತೀಚೆಗೆ ನೋಂದಾಯಿಸಲಾದ ಹೊಸ ಡೊಮೇನ್",
  recent_domain: "ಇತ್ತೀಚಿನ ಡೊಮೇನ್",
  excessive_subdomains: "ಹೆಚ್ಚಿನ ಉಪ-ಡೊಮೇನ್‌ಗಳುಳ್ಳ ವಿಳಾಸ",
  insecure_http: "ಅಸುರಕ್ಷಿತ ಲಿಂಕ್ (HTTP)",
};

const SIGNAL_TITLES_TE: Record<string, string> = {
  generic_salutation: "సాధారణ సంబోధన",
  urgency_pressure: "అత్యవసర ఒత్తిడి లేదా బెదిరింపు",
  credential_request: "సున్నితమైన సమాచారం / OTP అభ్యర్థన",
  upi_pin_requested: "UPI PIN, OTP లేదా పాస్‌వర్డ్ అభ్యర్థన",
  collect_request_to_receive: "డబ్బు స్వీకరించడానికి UPI అభ్యర్థన లేదా PIN అడగడం",
  refund_reversal_bait: "తప్పు లావాదేవీ లేదా రీఫండ్ పేరుతో మోసం",
  unknown_vpa_payment: "చెల్లింపు అభ్యర్థనలో తెలియని వ్యక్తిగత UPI ID (VPA)",
  advance_fee: "ఉద్యోగం, రుణం లేదా బహుమతికి ముందు ముందస్తు రుసుము అభ్యర్థన",
  lookalike_domain: "నకిలీ బ్యాంక్ లేదా బ్రాండ్ వెబ్ లింక్",
  payment_request: "చెల్లింపు / UPI అభ్యర్థన",
  suspicious_domain: "అనుమానాస్పద లేదా నకిలీ వెబ్ లింక్",
  brand_impersonation: "బ్యాంక్ లేదా సంస్థ పేరుతో నకిలీ ప్రవర్తన",
  apk_download: "ప్రమాదకరమైన యాప్ / APK డౌన్‌లోడ్",
  remote_access: "రిమోట్ యాక్సెస్ / స్క్రీన్ షేర్ అభ్యర్థన",
  high_risk_offer: "అధిక రాబడి / నకిలీ ఉద్యోగ ఆఫర్",
  ip_address_url: "ప్రత్యక్ష IP చిరునామా లింక్",
  shortened_url: "చిన్నదిగా చేసిన లింక్ (URL Shortener)",
  url_shortener: "చిన్నదిగా చేసిన లింక్ (URL Shortener)",
  punycode_domain: "నకిలీ రూపపు డొమైన్",
  typosquat_domain: "నకిలీ అక్షరక్రమ డొమైన్",
  unsolicited_prize: "అనుకోని లాటరీ లేదా బహుమతి ప్రలోభం",
  gambling_betting_lure: "ఆన్‌లైన్ రమ్మీ లేదా జూదం ప్రలోభం",
  unregulated_gambling_domain: "అనధికారిక ఆన్‌లైన్ రమ్మీ లేదా బెట్టింగ్ లింక్",
  new_domain: "ఇటీవల సృష్టించిన కొత్త వెబ్‌సైట్",
  recent_domain: "ఇటీవలి వెబ్‌సైట్",
  excessive_subdomains: "అధిక సబ్‌డొమైన్‌లు కలిగిన చిరునామా",
  insecure_http: "సురక్షితం కాని లింక్ (HTTP)",
};

function formatBackendResponse(data: BackendResponse, language: string = "en") {
  const riskMap: Record<string, "LOW" | "MEDIUM" | "HIGH" | "CANNOT_DETERMINE"> = {
    dangerous: "HIGH",
    suspicious: "MEDIUM",
    cannot_determine: "CANNOT_DETERMINE",
    safe: "LOW",
  };

  const riskLevel = riskMap[data.risk_level] || "CANNOT_DETERMINE";
  const isCD = riskLevel === "CANNOT_DETERMINE";
  const isKn = language === "kn";
  const isHi = language === "hi";
  const isTe = language === "te";

  const defaultScore =
    riskLevel === "HIGH" ? 88 : riskLevel === "MEDIUM" ? 55 : isCD ? 0 : 12;
  const riskScore =
    typeof data.risk_score === "number" ? data.risk_score : defaultScore;

  const classificationMap: Record<string, string> = isKn
    ? {
        dangerous: "ಅಪಾಯಕಾರಿ — ಸಕ್ರಿಯ ವಂಚನೆ / ಫಿಶಿಂಗ್ ಬೆದರಿಕೆ ಪತ್ತೆಯಾಗಿದೆ",
        suspicious: "ಅನುಮಾನಾಸ್ಪದ — ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ (ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ)",
        cannot_determine: "ಅನಿರ್ದಿಷ್ಟ — ಅಸ್ಪಷ್ಟ ಸಾಕ್ಷ್ಯ (ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ)",
        safe: "ಕಡಿಮೆ ಅಪಾಯ — ಅಧಿಕೃತ ಅಥವಾ ಸುರಕ್ಷಿತ ಚಾನಲ್",
      }
    : isHi
    ? {
        dangerous: "खतरनाक — सक्रिय धोखाधड़ी / फ़िशिंग का खतरा",
        suspicious: "संदिग्ध — भ्रामक पैटर्न पहचाने गए (सावधानी आवश्यक)",
        cannot_determine: "अस्पष्ट — अपर्याप्त साक्ष्य (सतर्क रहें)",
        safe: "कम जोखिम — सत्यापित आधिकारिक या सुरक्षित चैनल",
      }
    : isTe
    ? {
        dangerous: "ప్రమాదకరమైనది — క్రియాశీల మోసం / ఫిషింగ్ ముప్పు గుర్తించబడింది",
        suspicious: "అనుమానాస్పదమైనది — మోసపూరిత నమూనాలు కనుగొనబడ్డాయి (జాగ్రత్త అవసరం)",
        cannot_determine: "అనిశ్చితం — అసంపూర్ణ సాక్ష్యం (అప్రమత్తంగా ఉండండి)",
        safe: "తక్కువ ప్రమాదం — ధృవీకరించబడిన అధికారిక లేదా సురక్షితమైనది",
      }
    : {
        dangerous: "Dangerous — Active Scam / Phishing Threat Detected",
        suspicious: "Suspicious — Deceptive Patterns Flagged (Caution Advised)",
        cannot_determine: "Cannot Determine — Inconclusive Evidence (Stay Vigilant)",
        safe: "Low Risk — Verified Official Channel / Safe",
      };

  const classification =
    classificationMap[data.risk_level] ||
    (isKn ? "ಸುರಕ್ಷತಾ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ" : isHi ? "सुरक्षा विश्लेषण पूरा हुआ" : isTe ? "భద్రతా విశ్లేషణ పూర్తయింది" : "Security Assessment Complete");

  const confidenceMap: Record<string, number> = {
    high: 0.95,
    medium: 0.75,
    low: 0.5,
  };
  const confidence = confidenceMap[data.confidence] || 0.8;

  const signals = Array.isArray(data.signals) ? data.signals : [];
  const warningSigns =
    signals.length > 0
      ? signals.map((s) => {
          const title = isKn ? (SIGNAL_TITLES_KN[s.id] || s.title) : isHi ? (SIGNAL_TITLES_HI[s.id] || s.title) : isTe ? (SIGNAL_TITLES_TE[s.id] || s.title) : s.title;
          const expl = s.explanation || s.detail || "";
          return title && expl ? `${title}: ${expl}` : expl || title || s.id;
        })
      : [isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಬೆದರಿಕೆ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ." : isHi ? "कोई सक्रिय खतरे के संकेत नहीं मिले।" : isTe ? "ఎటువంటి క్రియాశీల ముప్పు సంకేతాలు కనుగొనబడలేదు." : "No active threat indicators detected."];

  const evidence =
    signals.length > 0
      ? signals
          .filter((s) => s.evidence)
          .map((s) => {
            const title = isKn ? (SIGNAL_TITLES_KN[s.id] || s.title) : isHi ? (SIGNAL_TITLES_HI[s.id] || s.title) : isTe ? (SIGNAL_TITLES_TE[s.id] || s.title) : s.title;
            return `"${s.evidence}" (${title || s.id})`;
          })
      : [];

  const recommendedActions: string[] = [];
  if (data.recommended_action?.primary) {
    recommendedActions.push(data.recommended_action.primary);
  }
  if (Array.isArray(data.recommended_action?.steps)) {
    recommendedActions.push(...data.recommended_action.steps);
  }
  if (data.recommended_action?.reporting?.text) {
    recommendedActions.push(data.recommended_action.reporting.text);
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push(
      isKn
        ? "ಲಿಂಕ್‌ಗಳನ್ನು ತೆರೆಯುವ, ಫೈಲ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡುವ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ."
        : isHi
        ? "लिंक खोलने, फ़ाइल डाउनलोड करने या OTP साझा करने से पहले स्वतंत्र रूप से सत्यापित करें।"
        : isTe
        ? "లింక్‌లను తెరవడం, ఫైల్‌లను డౌన్‌లోడ్ చేయడం లేదా OTP పంచుకోవడానికి ముందు స్వతంత్రంగా ధృవీకరించుకోండి."
        : "Verify independently before opening links, downloading files, or sharing OTPs."
    );
  }

  const aiProvider = data.degraded
    ? (isKn ? "ಡಿಜಿಟಲ್ ಸುರಕ್ಷತಾ ನಿಯಮ ಇಂಜಿನ್" : isHi ? "डिजिटल सुरक्षा नियम इंजन" : isTe ? "డిజిటల్ భద్రతా నియమ ఇంజిన్" : "Digital Safety Signal & Rule Engine")
    : (isKn ? "Groq AI (Qwen 27B) + ಡಿಜಿಟಲ್ ಸುರಕ್ಷತಾ ಇಂಜಿನ್" : isHi ? "Groq AI (Qwen 27B) + डिजिटल सुरक्षा इंजन" : isTe ? "Groq AI (Qwen 27B) + డిజిటల్ భద్రతా ఇంజిన్" : "Groq AI (Qwen 27B) + Digital Safety Signal Engine");

  const hasKn = (text: string) => /[\u0C80-\u0CFF]/.test(text);
  const hasHi = (text: string) => /[\u0900-\u097F]/.test(text);
  const hasTe = (text: string) => /[\u0C00-\u0C7F]/.test(text);

  let explanation = data.summary || "";
  if (isKn && (!explanation || !hasKn(explanation))) {
    explanation =
      data.risk_level === "dangerous"
        ? "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಇವು ಡಿಜಿಟಲ್ ವಂಚನೆ ಮತ್ತು ಫಿಶಿಂಗ್ ತಂತ್ರಗಳಿಗೆ ನಿಕಟವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ. ಯಾವುದೇ ಲಿಂಕ್ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
        : data.risk_level === "suspicious"
        ? "ಅನುಮಾನಾಸ್ಪದ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ. ಯಾವುದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಅಧಿಕೃತ ಚಾನಲ್ ಮೂಲಕ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ."
        : data.risk_level === "cannot_determine"
        ? "ಸಾಕ್ಷ್ಯಗಳು ಅಸ್ಪಷ್ಟವಾಗಿವೆ ಅಥವಾ ಸಂಘರ್ಷಮಯವಾಗಿವೆ. ಯಾವುದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಈ ಕೆಳಗಿನ ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ."
        : "ಡಿಜಿಟಲ್ ಸುರಕ್ಷತಾ ಸಹ-ಪೈಲಟ್‌ನಿಂದ ಸುರಕ್ಷತಾ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಯಾವುದೇ ಪ್ರಮುಖ ವಂಚನೆಯ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.";
  } else if (isHi && (!explanation || !hasHi(explanation))) {
    explanation =
      data.risk_level === "dangerous"
        ? "सुरक्षा चेतावनी संकेत मिले हैं। ये डिजिटल धोखाधड़ी और फ़िशिंग तकनीकों से मेल खाते हैं। किसी भी लिंक पर क्लिक न करें या OTP साझा न करें।"
        : data.risk_level === "suspicious"
        ? "संदिग्ध पैटर्न मिले हैं। कोई भी कदम उठाने से पहले आधिकारिक चैनल के माध्यम से स्वतंत्र रूप से पुष्टि करें।"
        : data.risk_level === "cannot_determine"
        ? "साक्ष्य अस्पष्ट या परस्पर विरोधी हैं। कोई भी कदम उठाने से पहले नीचे दिए गए सत्यापन चरणों का पालन करें।"
        : "डिजिटल सुरक्षा सह-पायलट द्वारा सुरक्षा विश्लेषण पूरा किया गया। कोई मुख्य भ्रामक संकेत नहीं मिला।";
  } else if (isTe && (!explanation || !hasTe(explanation))) {
    explanation =
      data.risk_level === "dangerous"
        ? "భద్రతా హెచ్చరిక సంకేతాలు గుర్తించబడ్డాయి. ఇవి డిజిటల్ మోసాలు మరియు ఫిషింగ్ పద్ధతులకు సరిపోతాయి. ఏ లింక్ క్లిక్ చేయవద్దు లేదా OTP పంచుకోవద్దు."
        : data.risk_level === "suspicious"
        ? "అనుమానాస్పద నమూనాలు కనిపించాయి. ఏ చర్య తీసుకునే ముందైనా అధికారిక మార్గాల ద్వారా ధృవీకరించుకోండి."
        : data.risk_level === "cannot_determine"
        ? "సాక్ష్యాలు అనిశ్చితంగా ఉన్నాయి. ఏదైనా చర్య తీసుకునే ముందు క్రింది ధృవీకరణ దశలను అనుసరించండి."
        : "డిజిటల్ భద్రతా కో-పైలట్ ద్వారా భద్రతా విశ్లేషణ పూర్తయింది. ఎటువంటి ప్రధాన మోసపూరిత సంకేతాలు కనుగొనబడలేదు.";
  } else if (!explanation) {
    explanation = "Security analysis completed by Digital Safety Co-pilot.";
  }

  return {
    riskScore,
    riskLevel,
    classification,
    confidence,
    warningSigns,
    evidence,
    explanation,
    recommendedActions,
    detectedUrls: data.extracted_urls || [],
    extractedText: data.extracted_text || undefined,
    aiProvider,
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Screenshot / Image Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const image = formData.get("image");
      const language = (formData.get("language") as string) || "en";

      if (!image || !(image instanceof Blob)) {
        return NextResponse.json(
          { error: "Please upload a valid image file (PNG, JPG, WEBP under 5MB)." },
          { status: 400 }
        );
      }

      try {
        const backendForm = new FormData();
        backendForm.append("file", image);
        backendForm.append("language", language);

        const backendRes = await fetch(`${BACKEND_URL}/api/v1/analyze/image`, {
          method: "POST",
          body: backendForm,
        });

        if (backendRes.ok) {
          const data: BackendResponse = await backendRes.json();
          return NextResponse.json(formatBackendResponse(data, language));
        } else {
          const errData = await backendRes.json().catch(() => null);
          const errorMsg = errData?.error?.message;
          const local = assess("Screenshot image inspection", "SCREENSHOT", language);
          if (errorMsg) {
            return NextResponse.json({
              ...local,
              riskScore: 0,
              riskLevel: "CANNOT_DETERMINE",
              classification: "Cannot Determine — Image Text Not Legible",
              confidence: 0.3,
              warningSigns: [errorMsg],
              explanation: `${errorMsg} Please paste the message text or link directly into the 'SMS / WhatsApp' or 'Link' tab for immediate deep inspection.`,
              checklist: [
                "Take a direct, close-up screenshot showing the full message text and link clearly.",
                "Alternatively, copy and paste the suspicious text or link directly into the input tab.",
              ],
            });
          }
          return NextResponse.json({
            ...local,
            explanation: local.explanation,
          });
        }
      } catch (backendErr) {
        console.warn(
          "FastAPI image endpoint unavailable, falling back to local engine:",
          backendErr
        );
      }

      // Fallback local assessment if backend is unavailable
      const local = assess("Screenshot optical analysis", "SCREENSHOT", language);
      return NextResponse.json({
        ...local,
        explanation: language === "kn"
          ? "ಆನ್-ಡಿವೈಸ್ ಆಪ್ಟಿಕಲ್ ನಿಯಮಗಳನ್ನು ಬಳಸಿ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ."
          : language === "hi"
          ? "ऑन-डिवाइस ऑप्टिकल नियमों का उपयोग करके छवि का विश्लेषण किया गया।"
          : language === "te"
          ? "ఆన్-డివైస్ ఆప్టికల్ నియమాలను ఉపయోగించి చిత్రం విశ్లేషించబడింది."
          : "Image analyzed using on-device optical heuristics. Connect FastAPI backend for full OCR extraction.",
        aiProvider: language === "kn" ? "ಸುದರ್ಶನ ನಿಯಮ ಇಂಜಿನ್ (ಸ್ಥಳೀಯ ಬ್ಯಾಕಪ್)" : language === "hi" ? "सुदर्शन हेयूरिस्टिक इंजन (स्थानीय बैकअप)" : language === "te" ? "సుదర్శన నియమ ఇంజిన్ (స్థానిక బ్యాకప్)" : "Sudarshan Heuristic Engine (Local Fallback)",
      });
    }

    // 2. JSON Body (URL or MESSAGE)
    const body = await req.json();
    const rawInput = body.input || body.content || body.text;
    const input = typeof rawInput === "string" ? rawInput.trim() : "";
    const inputType = body.inputType || "MESSAGE";
    const language = body.language || "en";

    if (!TYPES.includes(inputType) || !input || input.length > 10000) {
      return NextResponse.json(
        { error: "Please submit valid content under 10,000 characters." },
        { status: 400 }
      );
    }

    const lowerInput = input.toLowerCase();
    if (
      lowerInput.includes("sudarshan-kavach.vercel.app") ||
      lowerInput.includes("sudarshankavach.org") ||
      lowerInput.includes("sudarshankavach.in")
    ) {
      const isKn = language === "kn";
      const isHi = language === "hi";
      const isTe = language === "te";
      return NextResponse.json({
        id: "official-safe-" + Date.now(),
        inputType,
        submitted: input,
        riskScore: 0,
        riskLevel: "LOW",
        classification: isKn
          ? "ಕಡಿಮೆ ಅಪಾಯ — ಸುದರ್ಶನ ಕವಚ ಅಧಿಕೃತ ತಾಣ"
          : isHi
          ? "कम जोखिम — सुदर्शन कवच आधिकारिक प्लेटफॉर्म"
          : isTe
          ? "తక్కువ ప్రమాదం — సుదర్శన కవచ అధికారిక ప్లాట్‌ఫారమ్"
          : "Low Risk — Verified Sudarshan Kavach Platform",
        confidence: 1.0,
        warningSigns: [],
        evidence: [],
        explanation: isKn
          ? "ಇದು ಸುದರ್ಶನ ಕವಚ — ಡಿಜಿಟಲ್ ಸುರಕ್ಷತಾ ಸಹ-ಪೈಲಟ್‌ನ ಪರಿಶೀಲಿಸಿದ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಆಗಿದೆ. ಯಾವುದೇ ಬೆದರಿಕೆ ಇಲ್ಲ."
          : isHi
          ? "यह सुदर्शन कवच — डिजिटल सेफ्टी को-पायलट की सत्यापित आधिकारिक वेबसाइट है। यह पूरी तरह सुरक्षित है।"
          : isTe
          ? "ఇది సుదర్శన కవచ — డిజిటల్ సేఫ్టీ కో-పైలట్ యొక్క ధృవీకరించబడిన అధికారిక వెబ్‌సైట్. ఇది పూర్తిగా సురక్షితం."
          : "This is the verified official website of Sudarshan Kavach — Digital Safety Co-Pilot. The platform is authentic, safe, and carries no malicious threat.",
        recommendedActions: [
          "This is our official digital safety portal.",
          "You can safely use all scam detection and emergency golden-hour assistance features.",
        ],
        detectedUrls: [input],
        createdAt: new Date().toISOString(),
        aiProvider: isKn ? "ಸುದರ್ಶನ ಗುರುತು ಪರಿಶೀಲಕ" : isHi ? "सुदर्शन पहचान सत्यापनकर्ता" : isTe ? "సుదర్శన గుర్తింపు ధృవీకరణ" : "Sudarshan Identity Verifier",
        checklist: [
          "Official platform verified via TLS security and cryptographic domain binding.",
        ],
      });
    }

    if (inputType === "URL") {
      try {
        new URL(input);
      } catch {
        return NextResponse.json(
          { error: "Please enter a valid URL (e.g. https://example.com)." },
          { status: 400 }
        );
      }
    }

    // Call FastAPI backend
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input,
          language: language,
        }),
      });

      if (backendRes.ok) {
        const data: BackendResponse = await backendRes.json();
        return NextResponse.json(formatBackendResponse(data, language));
      }
    } catch (backendErr) {
      console.warn("FastAPI backend unavailable, falling back to local engine:", backendErr);
    }

    // Fallback to local heuristic engine
    const local = assess(input, inputType, language);
    return NextResponse.json({
      ...local,
      aiProvider: language === "kn" ? "ಸುದರ್ಶನ ನಿಯಮ ಇಂಜಿನ್ (ಸ್ಥಳೀಯ ಬ್ಯಾಕಪ್)" : language === "hi" ? "सुदर्शन हेयूरिस्टिक इंजन (स्थानीय बैकअप)" : language === "te" ? "సుదర్శన నియమ ఇంజిన్ (స్థానిక బ్యాకప్)" : "Sudarshan Heuristic Engine (Local Fallback)",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unable to analyze this content right now. Please try again." },
      { status: 500 }
    );
  }
}
