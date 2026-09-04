"""Localization for safety-critical, non-generated text.

architecture.md / false-positives.md: recommended actions and reporting details
are pre-written per language, NOT machine-translated, because accuracy matters
most in exactly the sentence the user will act on. A mistranslated "do not share
your OTP" is a safety failure.

The language model generates the per-signal explanations and summary in the
requested language. Everything in this module is fixed, reviewed copy:

  - recommended_action.primary + steps, per risk tier
  - the Cannot Determine manual verification checklists, per claim-type
  - reporting handoff text (1930 / cybercrime.gov.in)

Kannada and Hindi strings here should be verified by a native reader on the team
before the demo (build-plan.md Phase 6). English is authoritative.
"""

from __future__ import annotations

from typing import Dict, List

from app.schemas import Reporting, RiskLevel

# --------------------------------------------------------------------------- #
# Reporting handoff (1930 / cybercrime.gov.in)
# --------------------------------------------------------------------------- #
_REPORTING_TEXT: Dict[str, str] = {
    "en": "You can report this to the national cybercrime helpline on 1930.",
    "hi": "आप इसकी शिकायत राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कर सकते हैं।",
    "kn": "ನೀವು ಇದನ್ನು ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ 1930 ಗೆ ವರದಿ ಮಾಡಬಹುದು.",
    "te": "మీరు దీన్ని 1930 లో జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్‌కు నివేదించవచ్చు.",
}


def reporting_for(language: str) -> Reporting:
    lang = language if language in _REPORTING_TEXT else "en"
    return Reporting(
        helpline="1930",
        url="https://cybercrime.gov.in",
        text=_REPORTING_TEXT[lang],
    )


# --------------------------------------------------------------------------- #
# Recommended action per risk tier
# --------------------------------------------------------------------------- #
# Structure: ACTIONS[language][risk_level] = {"primary": str, "steps": [str, ...]}
ACTIONS: Dict[str, Dict[str, Dict[str, object]]] = {
    "en": {
        RiskLevel.dangerous.value: {
            "primary": "Do not open any link and do not enter any details.",
            "steps": [
                "Delete the message",
                "If you are worried about your account, call the number printed on your debit card",
                "Never complete KYC or verify details through a link received by SMS or WhatsApp",
            ],
        },
        RiskLevel.suspicious.value: {
            "primary": "Do not act on this message until you have verified it independently.",
            "steps": [
                "Do not use any phone number or link inside this message",
                "Contact the company using details from their official website or app",
                "If a payment or code is requested, treat it as unsafe until confirmed",
            ],
        },
        RiskLevel.cannot_determine.value: {
            "primary": "Verify independently before acting.",
            "steps": [
                "Do not use any phone number or link inside this message",
                "Search for the company's official website yourself",
                "Contact them using details from that website only",
            ],
        },
        RiskLevel.safe.value: {
            "primary": "Nothing alarming was found, but normal caution still applies.",
            "steps": [
                "Never share an OTP, PIN or password with anyone",
                "If a message asks for money or details, confirm on an official channel first",
            ],
        },
    },
    "hi": {
        RiskLevel.dangerous.value: {
            "primary": "कोई भी लिंक न खोलें और कोई जानकारी दर्ज न करें।",
            "steps": [
                "इस संदेश को हटा दें",
                "यदि आपको अपने खाते की चिंता है, तो अपने डेबिट कार्ड पर छपे नंबर पर कॉल करें",
                "SMS या WhatsApp पर मिले लिंक से कभी KYC पूरा न करें या जानकारी सत्यापित न करें",
            ],
        },
        RiskLevel.suspicious.value: {
            "primary": "जब तक आप स्वतंत्र रूप से सत्यापित न कर लें, इस संदेश पर कार्रवाई न करें।",
            "steps": [
                "इस संदेश में दिए गए किसी भी फोन नंबर या लिंक का उपयोग न करें",
                "कंपनी से उनकी आधिकारिक वेबसाइट या ऐप की जानकारी से संपर्क करें",
                "यदि भुगतान या कोड मांगा जाए, तो पुष्टि होने तक उसे असुरक्षित मानें",
            ],
        },
        RiskLevel.cannot_determine.value: {
            "primary": "कार्रवाई करने से पहले स्वतंत्र रूप से सत्यापित करें।",
            "steps": [
                "इस संदेश में दिए गए किसी भी फोन नंबर या लिंक का उपयोग न करें",
                "कंपनी की आधिकारिक वेबसाइट स्वयं खोजें",
                "केवल उसी वेबसाइट की जानकारी से उनसे संपर्क करें",
            ],
        },
        RiskLevel.safe.value: {
            "primary": "कुछ भी चिंताजनक नहीं मिला, फिर भी सामान्य सावधानी बरतें।",
            "steps": [
                "अपना OTP, PIN या पासवर्ड किसी के साथ साझा न करें",
                "यदि कोई संदेश पैसे या जानकारी मांगे, तो पहले आधिकारिक माध्यम से पुष्टि करें",
            ],
        },
    },
    "kn": {
        RiskLevel.dangerous.value: {
            "primary": "ಯಾವುದೇ ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ವಿವರಗಳನ್ನು ನಮೂದಿಸಬೇಡಿ.",
            "steps": [
                "ಈ ಸಂದೇಶವನ್ನು ಅಳಿಸಿ",
                "ನಿಮ್ಮ ಖಾತೆಯ ಬಗ್ಗೆ ಚಿಂತೆ ಇದ್ದರೆ, ನಿಮ್ಮ ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಮುದ್ರಿತ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ",
                "SMS ಅಥವಾ WhatsApp ನಲ್ಲಿ ಬಂದ ಲಿಂಕ್ ಮೂಲಕ ಎಂದಿಗೂ KYC ಪೂರ್ಣಗೊಳಿಸಬೇಡಿ ಅಥವಾ ವಿವರ ಪರಿಶೀಲಿಸಬೇಡಿ",
            ],
        },
        RiskLevel.suspicious.value: {
            "primary": "ನೀವು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸುವವರೆಗೆ ಈ ಸಂದೇಶದ ಮೇಲೆ ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಡಿ.",
            "steps": [
                "ಈ ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ",
                "ಕಂಪನಿಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಆ್ಯಪ್‌ನ ವಿವರಗಳಿಂದ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ",
                "ಪಾವತಿ ಅಥವಾ ಕೋಡ್ ಕೇಳಿದರೆ, ದೃಢೀಕರಿಸುವವರೆಗೆ ಅದನ್ನು ಅಸುರಕ್ಷಿತವೆಂದು ಪರಿಗಣಿಸಿ",
            ],
        },
        RiskLevel.cannot_determine.value: {
            "primary": "ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
            "steps": [
                "ಈ ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ",
                "ಕಂಪನಿಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನೀವೇ ಹುಡುಕಿ",
                "ಆ ವೆಬ್‌ಸೈಟ್‌ನ ವಿವರಗಳಿಂದ ಮಾತ್ರ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ",
            ],
        },
        RiskLevel.safe.value: {
            "primary": "ಆತಂಕಕಾರಿ ಏನೂ ಕಂಡುಬಂದಿಲ್ಲ, ಆದರೆ ಸಾಮಾನ್ಯ ಎಚ್ಚರಿಕೆ ಇನ್ನೂ ಅಗತ್ಯ.",
            "steps": [
                "ನಿಮ್ಮ OTP, PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ",
                "ಸಂದೇಶವು ಹಣ ಅಥವಾ ವಿವರ ಕೇಳಿದರೆ, ಮೊದಲು ಅಧಿಕೃತ ಮಾರ್ಗದಿಂದ ದೃಢೀಕರಿಸಿ",
            ],
        },
    },
    "te": {
        RiskLevel.dangerous.value: {
            "primary": "ఎటువంటి లింక్‌ను తెరవవద్దు మరియు ఎలాంటి వివరాలను నమోదు చేయవద్దు.",
            "steps": [
                "ఈ సందేశాన్ని తొలగించండి",
                "మీ ఖాతా గురించి ఆందోళనగా ఉంటే, మీ డెబిట్ కార్డుపై ముద్రించిన నంబర్‌కు కాల్ చేయండి",
                "SMS లేదా WhatsApp లో వచ్చిన లింక్ ద్వారా ఎప్పుడూ KYC పూర్తి చేయవద్దు లేదా వివరాలను ధృవీకరించవద్దు",
            ],
        },
        RiskLevel.suspicious.value: {
            "primary": "మీరు స్వతంత్రంగా ధృవీకరించే వరకు ఈ సందేశంపై ఎటువంటి చర్య తీసుకోకండి.",
            "steps": [
                "ఈ సందేశంలో ఉన్న ఫోన్ నంబర్ లేదా లింక్‌ను ఉపయోగించవద్దు",
                "సంస్థ యొక్క అధికారిక వెబ్‌సైట్ లేదా యాప్ ద్వారా వారిని సంప్రదించండి",
                "చెల్లింపు లేదా కోడ్ అడిగితే, నిర్ధారించబడే వరకు దాన్ని అసురక్షితమైనదిగా పరిగణించండి",
            ],
        },
        RiskLevel.cannot_determine.value: {
            "primary": "చర్య తీసుకునే ముందు స్వతంత్రంగా ధృవీకరించండి.",
            "steps": [
                "ఈ సందేశంలో ఉన్న ఫోన్ నంబర్ లేదా లింక్‌ను ఉపయోగించవద్దు",
                "సంస్థ అధికారిక వెబ్‌సైట్‌ను మీరే స్వయంగా శోధించండి",
                "ఆ వెబ్‌సైట్ వివరాల ద్వారా మాత్రమే వారిని సంప్రదించండి",
            ],
        },
        RiskLevel.safe.value: {
            "primary": "ఎటువంటి ఆందోళనకరమైన అంశాలు కనుగొనబడలేదు, అయినప్పటికీ సాధారణ జాగ్రత్త అవసరం.",
            "steps": [
                "మీ OTP, PIN లేదా పాస్‌వర్డ్‌ను ఎవరితోనూ పంచుకోవద్దు",
                "సందేశం డబ్బు లేదా వివరాలను అడిగితే, ముందుగా అధికారిక మార్గంలో నిర్ధారించుకోండి",
            ],
        },
    },
}


def action_for(language: str, level: RiskLevel) -> Dict[str, object]:
    lang = language if language in ACTIONS else "en"
    tier = ACTIONS[lang].get(level.value) or ACTIONS["en"][level.value]
    return tier


# --------------------------------------------------------------------------- #
# Cannot Determine — manual verification checklists per claim-type
# (false-positives.md). Used to replace the generic steps when we can infer
# what the message claims to be.
# --------------------------------------------------------------------------- #
# claim-type -> language -> list of steps
CHECKLISTS: Dict[str, Dict[str, List[str]]] = {
    "bank": {
        "en": [
            "Do not use any number or link in the message",
            "Call the number printed on your debit card or passbook",
            "Or open your bank's official app directly and check for notifications there",
        ],
        "hi": [
            "संदेश में दिए किसी नंबर या लिंक का उपयोग न करें",
            "अपने डेबिट कार्ड या पासबुक पर छपे नंबर पर कॉल करें",
            "या अपने बैंक का आधिकारिक ऐप सीधे खोलकर वहाँ सूचनाएँ जाँचें",
        ],
        "kn": [
            "ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ",
            "ನಿಮ್ಮ ಡೆಬಿಟ್ ಕಾರ್ಡ್ ಅಥವಾ ಪಾಸ್‌ಬುಕ್‌ನಲ್ಲಿ ಮುದ್ರಿತ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ",
            "ಅಥವಾ ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ ಅಧಿಕೃತ ಆ್ಯಪ್ ನೇರವಾಗಿ ತೆರೆದು ಅಲ್ಲಿ ಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
        ],
        "te": [
            "సందేశంలో ఉన్న ఎలాంటి నంబర్ లేదా లింక్‌ను ఉపయోగించవద్దు",
            "మీ డెబిట్ కార్డు లేదా పాస్‌బుక్‌పై ముద్రించిన నంబర్‌కు కాల్ చేయండి",
            "లేదా మీ బ్యాంక్ అధికారిక యాప్‌ను నేరుగా తెరిచి అక్కడ నోటిఫికేషన్‌లను తనిఖీ చేయండి",
        ],
    },
    "job": {
        "en": [
            "Search the company name plus 'reviews' and 'scam'",
            "Check whether the recruiter's email domain matches the company's real website",
            "Legitimate employers never ask you to pay for a job",
        ],
        "hi": [
            "कंपनी के नाम के साथ 'reviews' और 'scam' खोजें",
            "जाँचें कि भर्तीकर्ता का ईमेल डोमेन कंपनी की असली वेबसाइट से मेल खाता है या नहीं",
            "असली नियोक्ता कभी नौकरी के लिए पैसे नहीं माँगते",
        ],
        "kn": [
            "ಕಂಪನಿಯ ಹೆಸರಿನೊಂದಿಗೆ 'reviews' ಮತ್ತು 'scam' ಎಂದು ಹುಡುಕಿ",
            "ನೇಮಕಾತಿದಾರರ ಇಮೇಲ್ ಡೊಮೇನ್ ಕಂಪನಿಯ ನಿಜವಾದ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹೊಂದುತ್ತದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ",
            "ನಿಜವಾದ ಉದ್ಯೋಗದಾತರು ಎಂದಿಗೂ ಕೆಲಸಕ್ಕಾಗಿ ಹಣ ಕೇಳುವುದಿಲ್ಲ",
        ],
        "te": [
            "కంపెనీ పేరుతో పాటు 'reviews' మరియు 'scam' అని శోధించండి",
            "రిక్రూటర్ ఇమెయిల్ డొమైన్ కంపెనీ నిజమైన వెబ్‌సైట్‌తో సరిపోలుతుందో లేదో తనిఖీ చేయండి",
            "నిజమైన ఉద్యోగ యజమానులు ఎప్పుడూ ఉద్యోగం కోసం డబ్బు అడగరు",
        ],
    },
    "delivery": {
        "en": [
            "Check the courier's official site or app using your order number",
            "Real couriers do not collect fees by UPI or personal payment link",
        ],
        "hi": [
            "अपने ऑर्डर नंबर से कूरियर की आधिकारिक साइट या ऐप जाँचें",
            "असली कूरियर UPI या निजी भुगतान लिंक से शुल्क नहीं लेते",
        ],
        "kn": [
            "ನಿಮ್ಮ ಆರ್ಡರ್ ಸಂಖ್ಯೆಯಿಂದ ಕೊರಿಯರ್‌ನ ಅಧಿಕೃತ ಸೈಟ್ ಅಥವಾ ಆ್ಯಪ್ ಪರಿಶೀಲಿಸಿ",
            "ನಿಜವಾದ ಕೊರಿಯರ್‌ಗಳು UPI ಅಥವಾ ವೈಯಕ್ತಿಕ ಪಾವತಿ ಲಿಂಕ್‌ನಿಂದ ಶುಲ್ಕ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ",
        ],
        "te": [
            "మీ ఆర్డర్ నంబర్‌ని ఉపయోగించి కొరియర్ అధికారిక సైట్ లేదా యాప్‌ను తనిఖీ చేయండి",
            "నిజమైన కొరియర్‌లు UPI లేదా వ్యక్తిగత చెల్లింపు లింక్ ద్వారా రుసుము వసూలు చేయరు",
        ],
    },
    "payment": {
        "en": [
            "Confirm with the person on a channel you already trust — call them, don't reply",
            "UPI never requires your PIN to receive money. A PIN request means money is leaving your account",
        ],
        "hi": [
            "जिस पर आप पहले से भरोसा करते हैं उस माध्यम से पुष्टि करें — कॉल करें, जवाब न दें",
            "पैसे पाने के लिए UPI कभी PIN नहीं माँगता। PIN माँगना मतलब पैसे आपके खाते से जा रहे हैं",
        ],
        "kn": [
            "ನೀವು ಈಗಾಗಲೇ ನಂಬುವ ಮಾರ್ಗದಿಂದ ಆ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ದೃಢೀಕರಿಸಿ — ಕರೆ ಮಾಡಿ, ಉತ್ತರಿಸಬೇಡಿ",
            "ಹಣ ಸ್ವೀಕರಿಸಲು UPI ಎಂದಿಗೂ PIN ಕೇಳುವುದಿಲ್ಲ. PIN ಕೇಳಿದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಹೋಗುತ್ತಿದೆ ಎಂದರ್ಥ",
        ],
        "te": [
            "మీరు ఇప్పటికే విశ్వసించే మార్గంలో ఆ వ్యక్తితో నిర్ధారించుకోండి — కాల్ చేయండి, ప్రత్యుత్తరం ఇవ్వవద్దు",
            "డబ్బు స్వీకరించడానికి UPI ఎప్పుడూ PIN అడగదు. PIN అడిగారంటే మీ ఖాతా నుండి డబ్బు పోతోందని అర్థం",
        ],
    },
}


def checklist_for(language: str, claim_type: str) -> List[str]:
    lang = language if language in ("en", "hi", "kn", "te") else "en"
    by_lang = CHECKLISTS.get(claim_type)
    if not by_lang:
        return []
    return by_lang.get(lang) or by_lang["en"]
