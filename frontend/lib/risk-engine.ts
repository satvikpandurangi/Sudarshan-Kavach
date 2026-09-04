import { inspectUrls } from "./url-analysis";
import type { RiskLevel, Analysis } from "./types";

export function assess(input: string, type: string, language: string = "en"): Analysis {
  const text = input.toLowerCase();
  const url = inspectUrls(input);
  let score = url.score;
  const isKn = language === "kn";
  const isHi = language === "hi";
  const isTe = language === "te";

  const signs: string[] = isKn
    ? url.flags.map((f) => `ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್: ${f}`)
    : isHi
    ? url.flags.map((f) => `संदिग्ध लिंक: ${f}`)
    : isTe
    ? url.flags.map((f) => `అనుమానాస్పద లింక్: ${f}`)
    : [...url.flags];
  const evidence: string[] = [...url.flags];

  interface RuleDef {
    id: string;
    re: RegExp;
    pts: number;
    severity: "high" | "medium" | "low";
    signEn: string;
    evEn: string;
    signKn: string;
    evKn: string;
    signHi: string;
    evHi: string;
    signTe: string;
    evTe: string;
  }

  const rules: RuleDef[] = [
    // 1. collect_request_to_receive (severity: high)
    {
      id: "collect_request_to_receive",
      re: /(?:approve|accept|enter.*pin|scan.*code).*(?:receive|get|claim|cashback|refund|prize)|(?:receive|cashback|refund|prize).*(?:approve|accept|enter.*pin|scan.*code|collect request)/i,
      pts: 35,
      severity: "high",
      signEn: "Collect request or PIN requested to receive money",
      evEn: "Your UPI PIN is only ever needed to SEND money. Nothing that pays you into your account will ask for it. If a request needs your PIN, it is taking money, not giving it.",
      signKn: "ಹಣ ಸ್ವೀಕರಿಸಲು UPI ವಿನಂತಿ ಅಥವಾ PIN ಕೇಳಲಾಗಿದೆ",
      evKn: "ಹಣ ಸ್ವೀಕರಿಸಲು UPI PIN ಅಗತ್ಯವಿಲ್ಲ. PIN ಕೇವಲ ಹಣ ಕಳುಹಿಸಲು ಮಾತ್ರ ಬೇಕು. ಇದು ಹಣ ನೀಡುವ ಬದಲು ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕದಿಯುವ ತಂತ್ರವಾಗಿದೆ.",
      signHi: "पैसे प्राप्त करने के लिए UPI अनुरोध या PIN मांगा गया",
      evHi: "पैसे प्राप्त करने के लिए UPI PIN की कभी आवश्यकता नहीं होती। PIN केवल पैसे भेजने के लिए होता है। यह आपके खाते से पैसे निकालने की चाल है।",
      signTe: "డబ్బు స్వీకరించడానికి UPI అభ్యర్థన లేదా PIN అడగడం",
      evTe: "డబ్బు స్వీకరించడానికి UPI PIN అవసరం లేదు. కేవలం డబ్బు పంపడానికి మాత్రమే PIN అవసరం. ఇది మీ ఖాతా నుండి డబ్బును కాజేసే మోసం.",
    },
    // 2. upi_pin_requested (severity: high)
    {
      id: "upi_pin_requested",
      re: /(?:share|enter|provide|send|verify|confirm).*(?:upi\s*pin|atm\s*pin|otp|cvv|password|netbanking)/i,
      pts: 30,
      severity: "high",
      signEn: "UPI PIN, OTP, or Banking Password Requested",
      evEn: "It asks for your UPI PIN, ATM PIN, OTP, CVV, or banking password. No legitimate service will ever ask for these.",
      signKn: "UPI PIN, OTP ಅಥವಾ ಗೌಪ್ಯ ವಿವರಗಳ ವಿನಂತಿ",
      evKn: "ಇದು ನಿಮ್ಮ UPI PIN, OTP, CVV ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ಪಾಸ್‌ವರ್ಡ್ ಕೇಳುತ್ತಿದೆ. ಅಧಿಕೃತ ಸಂಸ್ಥೆಗಳು ಎಂದಿಗೂ ಇವುಗಳನ್ನು ಕೇಳುವುದಿಲ್ಲ.",
      signHi: "UPI PIN, OTP या बैंकिंग पासवर्ड का अनुरोध",
      evHi: "यह आपका UPI PIN, OTP, CVV या बैंकिंग पासवर्ड मांग रहा है। कोई भी वैध संस्था इन्हें कभी नहीं मांगती।",
      signTe: "UPI PIN, OTP లేదా బ్యాంకింగ్ వివరాలు కోరడం",
      evTe: "ఇది మీ UPI PIN, ATM PIN, OTP, CVV లేదా బ్యాంకింగ్ పాస్‌వర్డ్ అడుగుతోంది. ఏ చట్టబద్ధమైన సంస్థ కూడా వీటిని ఎప్పుడూ అడగదు.",
    },
    // 3. refund_reversal_bait (severity: high)
    {
      id: "refund_reversal_bait",
      re: /(?:sent|transferred|paid).*(?:by mistake|accidentally|wrongly)|(?:wrong|accidental|mistaken|excess|double).*(?:transfer|payment|refund).*(?:return|send back|pay back)/i,
      pts: 30,
      severity: "high",
      signEn: "Accidental transfer or refund reversal bait",
      evEn: "Claims an accidental transfer or excess refund asking for money back. Always verify your bank statement directly in your bank app.",
      signKn: "ತಪ್ಪಾದ ವರ್ಗಾವಣೆ ಅಥವಾ ಮರುಪಾವತಿಯ ನೆಪ",
      evKn: "ತಪ್ಪಾಗಿ ಹಣ ವರ್ಗಾವಣೆಯಾಗಿದೆ ಎಂದು ಹೇಳಿ ಹಣವನ್ನು ವಾಪಸ್ ಕಳುಹಿಸಲು ಕೇಳಲಾಗುತ್ತಿದೆ. ಯಾವುದೇ ಹಣ ಕಳುಹಿಸುವ ಮುನ್ನ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಆ್ಯಪ್ ಪರಿಶೀಲಿಸಿ.",
      signHi: "गलत ट्रांसफर या रिफंड वापसी का झांसा",
      evHi: "गलती से पैसे ट्रांसफर होने का दावा करके पैसे वापस भेजने को कहा जा रहा है। कोई भी भुगतान करने से पहले अपने बैंक ऐप में स्टेटमेंट जांचें।",
      signTe: "తప్పు లావాదేవీ లేదా రీఫండ్ పేరుతో మోసం",
      evTe: "పొరపాటున డబ్బు బదిలీ అయిందని లేదా ఎక్కువ రీఫండ్ వచ్చిందని డబ్బు తిరిగి పంపమని కోరుతున్నారు. మీ బ్యాంక్ స్టేట్‌మెంట్‌ను నేరుగా మీ బ్యాంక్ యాప్‌లో ఎల్లప్పుడూ ధృవీకరించుకోండి.",
    },
    // 4. advance_fee (severity: high)
    {
      id: "advance_fee",
      re: /(?:registration|processing|security|refundable|activation|training|courier|delivery|clearance|loan approval|sanction).*(?:fee|deposit|charge|amount)|pay.*(?:before|to (?:receive|claim|get|unlock|release))/i,
      pts: 25,
      severity: "high",
      signEn: "Upfront fee required before job, loan, or prize",
      evEn: "Payment required before receiving a job, loan, prize, or parcel delivery. Genuine employers and prizes never ask for advance fees.",
      signKn: "ಉದ್ಯೋಗ, ಸಾಲ ಅಥವಾ ಬಹುಮಾನಕ್ಕೂ ಮುನ್ನ ಮುಂಗಡ ಶುಲ್ಕದ ವಿನಂತಿ",
      evKn: "ಉದ್ಯೋಗ, ಸಾಲ ಅಥವಾ ಬಹುಮಾನ ನೀಡುವ ಮುನ್ನ ಮುಂಗಡ ಶುಲ್ಕ ಕೇಳಲಾಗುತ್ತಿದೆ. ಅಧಿಕೃತ ಉದ್ಯೋಗದಾತರು ಮುಂಗಡ ಶುಲ್ಕ ಕೇಳುವುದಿಲ್ಲ.",
      signHi: "नौकरी, ऋण या पुरस्कार से पहले अग्रिम शुल्क का अनुरोध",
      evHi: "नौकरी, लोन या पुरस्कार देने से पहले अग्रिम शुल्क मांगा जा रहा है। असली कंपनियां कभी अग्रिम फीस नहीं मांगतीं।",
      signTe: "ఉద్యోగం లేదా రుణం కోసం ముందస్తు రుసుము అభ్యర్థన",
      evTe: "ఉద్యోగం, రుణం, బహుమతి లేదా పార్శిల్ డెలివరీ పొందడానికి ముందే చెల్లింపు అవసరం అని అడుగుతున్నారు. నిజమైన యజమానులు ఎప్పుడూ ముందస్తు రుసుము అడగరు.",
    },
    // 5. unknown_vpa_payment (severity: medium)
    {
      id: "unknown_vpa_payment",
      re: / [a-zA-Z0-9.\-_]{2,64}@(?!gmail|yahoo|outlook|hotmail)[a-zA-Z0-9]{2,32} .*(?:pay|payment|transfer|send|deposit|₹|rs|bhim|upi)|(?:pay|payment|transfer|send|deposit|₹|rs|bhim|upi).* [a-zA-Z0-9.\-_]{2,64}@(?!gmail|yahoo|outlook|hotmail)[a-zA-Z0-9]{2,32} /i,
      pts: 18,
      severity: "medium",
      signEn: "Personal UPI ID (VPA) in payment request",
      evEn: "Payment is directed to an unverified personal UPI ID (VPA) rather than a registered merchant gateway.",
      signKn: "ಪಾವತಿ ವಿನಂತಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸದ ವೈಯಕ್ತಿಕ UPI ID (VPA)",
      evKn: "ನೋಂದಾಯಿತ ವ್ಯಾಪಾರಿ ಗೇಟ್‌ವೇ ಬದಲಿಗೆ ಪರಿಶೀಲಿಸದ ವೈಯಕ್ತಿಕ UPI ID (VPA) ಗೆ ಹಣ ಪಾವತಿಸಲು ಕೇಳಲಾಗುತ್ತಿದೆ.",
      signHi: "भुगतान अनुरोध में असत्यापित व्यक्तिगत UPI ID (VPA)",
      evHi: "पंजीकृत मर्चेंट गेटवे के बजाय किसी असत्यापित व्यक्तिगत UPI ID (VPA) पर भुगतान करने के लिए कहा जा रहा है।",
      signTe: "చెల్లింపు అభ్యర్థనలో తెలియని వ్యక్తిగత UPI ID (VPA)",
      evTe: "చెల్లింపు నమోదిత వ్యాపారి గేట్‌వేకి కాకుండా ధృవీకరించబడని వ్యక్తిగత UPI ID (VPA) కి నిర్దేశించబడింది.",
    },
    // 6. authority_impersonation
    {
      id: "authority_impersonation",
      re: /(?:bank|police|income tax|cyber crime|trai|customs).*(?:blocked|suspended|arrest|penalty|fine|warrant|fir)|(?:your account will be (?:blocked|suspended|closed))/i,
      pts: 18,
      severity: "medium",
      signEn: "Authority impersonation with threat",
      evEn: "It invokes a bank, police, or regulator and pairs it with a threat of arrest, suspension, or penalty.",
      signKn: "ಬೆದರಿಕೆಯೊಂದಿಗೆ ಅಧಿಕೃತ ಸಂಸ್ಥೆಯ ವೇಷ ಧರಿಸುವಿಕೆ",
      evKn: "ಬ್ಯಾಂಕ್, ಪೊಲೀಸ್ ಅಥವಾ ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಯ ಹೆಸರನ್ನು ಬಳಸಿ ಖಾತೆ ಅಮಾನತು ಅಥವಾ ದಂಡದ ಬೆದರಿಕೆ ಹಾಕಲಾಗುತ್ತಿದೆ.",
      signHi: "धमकी के साथ आधिकारिक संस्था का रूप धारण करना",
      evHi: "बैंक, पुलिस या सरकारी एजेंसी का नाम लेकर खाता ब्लॉक या कानूनी कार्रवाई की धमकी दी जा रही है।",
      signTe: "అధికారిక సంస్థ పేరుతో బెదిరింపు మరియు మోసం",
      evTe: "ఇది బ్యాంక్, పోలీసులు లేదా నియంత్రణ సంస్థల పేరును ఉపయోగిస్తూ అరెస్టు, ఖాతా నిలిపివేత లేదా జరిమానా విధిస్తామని బెదిరిస్తుంది.",
    },
  ];

  let matchedHighs = 0;
  for (const r of rules) {
    const match = text.match(r.re);
    if (match) {
      score += r.pts;
      if (r.severity === "high") matchedHighs++;
      signs.push(isKn ? r.signKn : isHi ? r.signHi : isTe ? r.signTe : r.signEn);
      // Literal evidence extract
      evidence.push(match[0]);
    }
  }

  // 7. Gated urgency: urgency pressure only fires if accompanied by payment/credential/link
  const urgencyMatch = text.match(/(?:immediately|urgently|right now|today only|within \d+ (?:hours|mins|days)|act now|expires soon)/i);
  if (urgencyMatch && (url.flags.length > 0 || /(?:pay|upi|pin|otp|password|cvv|transfer|fee)/i.test(text))) {
    score += 12;
    signs.push(isKn ? "ತುರ್ತು ಅಥವಾ ಒತ್ತಡದ ಭಾಷೆ" : isHi ? "जल्दबाजी या दबाव की भाषा" : isTe ? "అత్యవసర ఒత్తిడి లేదా బెదిరింపు" : "Creates a false sense of urgency");
    evidence.push(urgencyMatch[0]);
  }

  // Check Cannot Determine conditions:
  // 1. Text too thin/short (< 12 chars without URL)
  // 2. Conflicting: trusted official link + high scam keywords
  const isTooShort = text.trim().length < 12 && url.flags.length === 0;
  const isConflict = /(?:onlinesbi\.sbi|hdfcbank\.com|icicibank\.com|axisbank\.com|amazon\.in|flipkart\.com)/i.test(text) && matchedHighs > 0;

  if (isTooShort || isConflict) {
    const claim = /(?:job|salary|hiring)/i.test(text)
      ? "job"
      : /(?:parcel|courier|delivery|order)/i.test(text)
      ? "delivery"
      : /(?:upi|payment|vpa|cashback)/i.test(text)
      ? "payment"
      : "bank";

    const checklists: Record<string, Record<string, string[]>> = {
      bank: {
        en: [
          "Do not use any number or link in the message",
          "Call the number printed on the back of your debit card",
          "Or check official notices inside your bank's mobile app directly",
        ],
        kn: [
          "ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ",
          "ನಿಮ್ಮ ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ನ ಹಿಂಭಾಗದಲ್ಲಿ ಮುದ್ರಿತವಾಗಿರುವ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ",
          "ಅಥವಾ ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ ಅಧಿಕೃತ ಮೊಬೈಲ್ ಆ್ಯಪ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ",
        ],
        hi: [
          "संदेश में दिए गए किसी भी नंबर या लिंक का उपयोग न करें",
          "अपने डेबिट कार्ड के पीछे मुद्रित आधिकारिक नंबर पर कॉल करें",
          "या सीधे अपने बैंक के मोबाइल ऐप के अंदर आधिकारिक सूचनाएँ जाँचें",
        ],
        te: [
          "సందేశంలో ఉన్న ఏ నంబర్ లేదా లింక్‌ను ఉపయోగించవద్దు",
          "మీ డెబిట్ కార్డు వెనుక ముద్రించిన అధికారిక నంబర్‌కు కాల్ చేయండి",
          "లేదా నేరుగా మీ బ్యాంక్ అధికారిక మొబైల్ యాప్‌లో అధికారిక నోటీసులను తనిఖీ చేయండి",
        ],
      },
      job: {
        en: [
          "Search the company name with 'reviews' and 'fraud'",
          "Verify the recruiter's domain matches the corporate domain",
          "Legitimate employers never demand upfront fees or security deposits",
        ],
        kn: [
          "ಕಂಪನಿಯ ಹೆಸರನ್ನು 'reviews' ಮತ್ತು 'scam' ನೊಂದಿಗೆ ಹುಡುಕಿ",
          "ನೇಮಕಾತಿದಾರರ ಇಮೇಲ್ ಅಧಿಕೃತ ಕಾರ್ಪೊರೇಟ್ ಡೊಮೇನ್‌ಗೆ ಹೊಂದುತ್ತದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ",
          "ನಿಜವಾದ ಉದ್ಯೋಗದಾತರು ಎಂದಿಗೂ ನೋಂದಣಿ ಶುಲ್ಕ ಅಥವಾ ಠೇವಣಿ ಕೇಳುವುದಿಲ್ಲ",
        ],
        hi: [
          "कंपनी के नाम के साथ 'reviews' और 'scam' खोजें",
          "जाँचें कि भर्तीकर्ता का ईमेल डोमेन कंपनी की आधिकारिक वेबसाइट से मेल खाता है",
          "असली नियोक्ता कभी भी नौकरी के लिए कोई अग्रिम फीस या जमा राशि नहीं मांगते",
        ],
        te: [
          "కంపెనీ పేరుతో పాటు 'reviews' మరియు 'scam' అని వెతకండి",
          "రిక్రూటర్ ఇమెయిల్ అధికారిక కార్పొరేట్ డొమైన్‌తో సరిపోలుతుందో లేదో ధృవీకరించండి",
          "నిజమైన కంపెనీలు ఎప్పుడూ ముందస్తు రుసుము లేదా సెక్యూరిటీ డిపాజిట్ అడగవు",
        ],
      },
      delivery: {
        en: [
          "Check courier official tracking using your original tracking number",
          "Real couriers collect payment on delivery, never via personal UPI links",
        ],
        kn: [
          "ನಿಮ್ಮ ಮೂಲ ಆರ್ಡರ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಕೊರಿಯರ್‌ನ ಅಧಿಕೃತ ಟ್ರ್ಯಾಕಿಂಗ್ ಪರಿಶೀಲಿಸಿ",
          "ನಿಜವಾದ ಕೊರಿಯರ್‌ಗಳು ವೈಯಕ್ತಿಕ UPI ಲಿಂಕ್ ಮೂಲಕ ಎಂದಿಗೂ ಹಣ ಪಡೆಯುವುದಿಲ್ಲ",
        ],
        hi: [
          "अपने मूल ट्रैकिंग नंबर से कूरियर की आधिकारिक वेबसाइट पर जांच करें",
          "असली कूरियर कभी भी व्यक्तिगत UPI लिंक से भुगतान नहीं लेते",
        ],
        te: [
          "మీ అసలు ఆర్డర్ ట్రాకింగ్ నంబర్‌ను ఉపయోగించి కొరియర్ అధికారిక వెబ్‌సైట్‌లో తనిఖీ చేయండి",
          "నిజమైన కొరియర్లు వ్యక్తిగత UPI లింక్‌ల ద్వారా ఎప్పుడూ చెల్లింపులు కోరరు",
        ],
      },
      payment: {
        en: [
          "Confirm directly with the sender on a known trusted phone call",
          "UPI PIN is only needed to SEND money. Receiving money never needs a PIN",
        ],
        kn: [
          "ಕಳುಹಿಸಿದವರೊಂದಿಗೆ ಪರಿಚಿತ ಫೋನ್ ಕರೆಯ ಮೂಲಕ ನೇರವಾಗಿ ದೃಢೀಕರಿಸಿ",
          "ಹಣ ಸ್ವೀಕರಿಸಲು UPI PIN ಅಗತ್ಯವಿಲ್ಲ. PIN ಕೇಳಿದರೆ ಅದು ಹಣ ಕಳೆಯುವ ವಿನಂತಿಯಾಗಿದೆ",
        ],
        hi: [
          "प्रेषक के साथ किसी परिचित फोन कॉल पर सीधे पुष्टि करें",
          "पैसे प्राप्त करने के लिए UPI PIN की आवश्यकता नहीं होती; PIN केवल पैसे भेजने के लिए होता है",
        ],
        te: [
          "తెలిసిన నమ్మకమైన ఫోన్ కాల్ ద్వారా పంపినవారితో నేరుగా నిర్ధారించుకోండి",
          "డబ్బు పంపడానికి మాత్రమే UPI PIN అవసరం. డబ్బు స్వీకరించడానికి ఎప్పుడూ PIN అవసరం లేదు",
        ],
      },
    };

    const tailoredSteps = checklists[claim][language] || checklists[claim]["en"];

    return {
      id: "cd-" + Date.now(),
      inputType: (type as any) || "MESSAGE",
      submitted: input,
      riskScore: 0,
      riskLevel: "CANNOT_DETERMINE",
      classification: isKn
        ? "ಅನಿರ್ದಿಷ್ಟ — ಅಸ್ಪಷ್ಟ ಸಾಕ್ಷ್ಯ (ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ)"
        : isHi
        ? "अस्पष्ट — अपर्याप्त साक्ष्य (सतर्क रहें)"
        : isTe
        ? "అనిశ్చితం — అసంపూర్ణ సాక్ష్యం (అప్రమత్తంగా ఉండండి)"
        : "Cannot Determine — Inconclusive Evidence (Stay Vigilant)",
      confidence: 0.5,
      warningSigns: [],
      evidence: [],
      explanation: isKn
        ? "ಸಾಕ್ಷ್ಯಗಳು ಅಸ್ಪಷ್ಟವಾಗಿವೆ ಅಥವಾ ಸಂಘರ್ಷಮಯವಾಗಿವೆ. ಯಾವುದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಈ ಕೆಳಗಿನ ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ."
        : isHi
        ? "साक्ष्य अस्पष्ट या परस्पर विरोधी हैं। कोई भी कदम उठाने से पहले नीचे दिए गए सत्यापन चरणों का पालन करें।"
        : isTe
        ? "సాక్ష్యాలు అనిశ్చితంగా ఉన్నాయి. ఏదైనా చర్య తీసుకునే ముందు ఈ మాన్యువల్ ధృవీకరణ దశలను పూర్తి చేయండి."
        : "The evidence is inconclusive or conflicting. Complete these manual verification steps before taking action.",
      recommendedActions: tailoredSteps,
      detectedUrls: url.flags,
      createdAt: new Date().toISOString(),
      aiProvider: isKn ? "ಸುದರ್ಶನ ನಿಯಮ ಇಂಜಿನ್" : isHi ? "सुदर्शन नियम इंजन" : isTe ? "సుదర్శన నియమ ఇంజిన్" : "Sudarshan Heuristic Engine",
      checklist: tailoredSteps,
    };
  }

  score = Math.min(100, Math.round(score));
  const riskLevel: RiskLevel = matchedHighs >= 2 || score >= 71 ? "HIGH" : matchedHighs === 1 || score >= 31 ? "MEDIUM" : "LOW";

  const classification = isKn
    ? riskLevel === "HIGH"
      ? "ಅಪಾಯಕಾರಿ — ಸಕ್ರಿಯ ವಂಚನೆ / ಫಿಶಿಂಗ್ ಬೆದರಿಕೆ ಪತ್ತೆಯಾಗಿದೆ"
      : riskLevel === "MEDIUM"
      ? "ಅನುಮಾನಾಸ್ಪದ — ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ (ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ)"
      : "ಕಡಿಮೆ ಅಪಾಯ — ಅಧಿಕೃತ ಅಥವಾ ಸುರಕ್ಷಿತ ಚಾನಲ್"
    : isHi
    ? riskLevel === "HIGH"
      ? "खतरनाक — सक्रिय धोखाधड़ी / फ़िशिंग का खतरा"
      : riskLevel === "MEDIUM"
      ? "संदिग्ध — भ्रामक पैटर्न पहचाने गए (सावधानी आवश्यक)"
      : "कम जोखिम — सत्यापित आधिकारिक या सुरक्षित चैनल"
    : isTe
    ? riskLevel === "HIGH"
      ? "ప్రమాదకరమైనది — క్రియాశీల మోసం / ఫిషింగ్ ముప్పు గుర్తించబడింది"
      : riskLevel === "MEDIUM"
      ? "అనుమానాస్పదమైనది — మోసపూరిత నమూనాలు కనుగొనబడ్డాయి (జాగ్రత్త అవసరం)"
      : "తక్కువ ప్రమాదం — ధృవీకరించబడిన అధికారిక లేదా సురక్షితమైనది"
    : riskLevel === "HIGH"
    ? "Dangerous — Active Scam / Phishing Threat Detected"
    : riskLevel === "MEDIUM"
    ? "Suspicious — Deceptive Patterns Flagged (Caution Advised)"
    : "Low Risk — Verified Official Channel / Safe";

  const actions = isKn
    ? riskLevel === "HIGH"
      ? [
          "ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಪಾವತಿ ಆ್ಯಪ್‌ನಲ್ಲಿ ಮರು-ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ.",
          "ನಿಮ್ಮ OTP, ಪಾಸ್‌ವರ್ಡ್, PIN ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ವಿವರಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
          "ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯ ಮೂಲಕ ನೇರವಾಗಿ ದೃಢೀಕರಿಸಿ.",
          "ಹಣ ಕಳುಹಿಸಿದ್ದರೆ, ತಕ್ಷಣ ಬ್ಯಾಂಕ್ ಸಂಪರ್ಕಿಸಿ 1930 ಅಥವಾ cybercrime.gov.in ನಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
        ]
      : riskLevel === "MEDIUM"
      ? [
          "ಮುಂದುವರಿಯುವ ಮುನ್ನ ಅಧಿಕೃತ ಚಾನಲ್ ಬಳಸಿ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
          "ಯಾವುದೇ ಕಾರಣಕ್ಕೂ OTP, PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ನೀಡಬೇಡಿ.",
          "ಕಳುಹಿಸುವವರ ಗುರುತು ದೃಢೀಕರಿಸುವವರೆಗೆ ಯಾವುದೇ ಪಾವತಿ ಮಾಡಬೇಡಿ.",
        ]
      : [
          "ಯಾವುದೇ ಪ್ರಮುಖ ಅನುಮಾನಾಸ್ಪದ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
          "ಅನಪೇಕ್ಷಿತ ಸಂದೇಶಗಳಿದ್ದಲ್ಲಿ ಅಧಿಕೃತ ಮೂಲದಿಂದ ದೃಢೀಕರಿಸಿ.",
          "ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯು ಸಂಪೂರ್ಣ ಸುರಕ್ಷತೆಯ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ; ಸದಾ ಜಾಗರೂಕರಾಗಿರಿ.",
        ]
    : isHi
    ? riskLevel === "HIGH"
      ? [
          "संदिग्ध लिंक पर क्लिक न करें या भुगतान ऐप पर दोबारा स्कैन न करें।",
          "अपना OTP, पासवर्ड, PIN या बैंकिंग विवरण कभी किसी से साझा न करें।",
          "संबंधित संस्था की आधिकारिक वेबसाइट या फोन नंबर के माध्यम से सीधे पुष्टि करें।",
          "यदि पैसे भेज दिए हैं, तो तुरंत अपने बैंक से संपर्क करें और 1930 या cybercrime.gov.in पर रिपोर्ट करें।",
        ]
      : riskLevel === "MEDIUM"
      ? [
          "आगे बढ़ने से पहले किसी आधिकारिक चैनल का उपयोग करके स्वतंत्र रूप से पुष्टि करें।",
          "किसी भी हाल में OTP, PIN या पासवर्ड साझा न करें।",
          "प्रेषक की पहचान सुनिश्चित होने तक कोई भी भुगतान न करें।",
        ]
      : [
          "कोई प्रमुख संदिग्ध संकेतक नहीं मिले।",
          "अप्रत्याशित संदेशों की आधिकारिक स्रोत से पुष्टि अवश्य करें।",
          "स्वचालित विश्लेषण पूर्ण सुरक्षा की गारंटी नहीं दे सकता; सदैव सतर्क रहें।",
        ]
    : isTe
    ? riskLevel === "HIGH"
      ? [
          "అనుమానాస్పద లింక్‌లపై క్లిక్ చేయవద్దు లేదా చెల్లింపు యాప్‌లలో స్కాన్ చేయవద్దు.",
          "మీ OTP, పాస్‌వర్డ్, PIN లేదా బ్యాంకింగ్ వివరాలను ఎవరితోనూ పంచుకోవద్దు.",
          "సంబంధిత సంస్థ యొక్క అధికారిక వెబ్‌సైట్ లేదా ఫోన్ నంబర్ ద్వారా నేరుగా నిర్ధారించుకోండి.",
          "ఒకవేళ డబ్బు పంపినట్లయితే, వెంటనే మీ బ్యాంకును సంప్రదించి 1930 లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి.",
        ]
      : riskLevel === "MEDIUM"
      ? [
          "కొనసాగే ముందు అధికారిక మార్గాల ద్వారా స్వతంత్రంగా ధృవీకరించుకోండి.",
          "ఎట్టి పరిస్థితుల్లోనూ OTP, PIN లేదా పాస్‌వర్డ్ పంచుకోవద్దు.",
          "పంపినవారి గుర్తింపు నిర్ధారణ అయ్యే వరకు ఎటువంటి చెల్లింపులు చేయవద్దు.",
        ]
      : [
          "ఎటువంటి ముఖ్యమైన అనుమానాస్పద సంకేతాలు కనుగొనబడలేదు.",
          "అనుకోని సందేశాలను ఎల్లప్పుడూ అధికారిక వనరులతో ధృవీకరించుకోండి.",
          "ఆటోమేటెడ్ విశ్లేషణ కేవలం సలహా మాత్రమే; ఎల్లప్పుడూ జాగ్రత్తగా ఉండండి.",
        ]
    : riskLevel === "HIGH"
    ? [
        "Do not click links or scan again on a payment app.",
        "Do not share OTP, password, PIN, or banking details.",
        "Verify directly through the organization's official website or customer service number.",
        "If money was lost, call 1930 immediately or file a report on cybercrime.gov.in.",
      ]
    : riskLevel === "MEDIUM"
    ? [
        "Verify independently through an official channel before proceeding.",
        "Never share OTPs, PINs, or passwords.",
        "Do not make any payments until sender identity is confirmed.",
      ]
    : [
        "No major risk indicators detected in this content.",
        "Always verify unexpected communications through official channels.",
        "Automated checks do not guarantee complete safety; exercise caution.",
      ];

  return {
    id: "risk-" + Date.now(),
    inputType: (type as any) || "MESSAGE",
    submitted: input,
    riskScore: score,
    riskLevel,
    classification,
    confidence: riskLevel === "HIGH" ? 0.95 : riskLevel === "MEDIUM" ? 0.75 : 0.9,
    warningSigns: signs,
    evidence,
    explanation: isKn
      ? (riskLevel === "HIGH"
          ? "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಇವು ಡಿಜಿಟಲ್ ವಂಚನೆ ಮತ್ತು ಫಿಶಿಂಗ್ ತಂತ್ರಗಳಿಗೆ ನಿಕಟವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ. ಯಾವುದೇ ಲಿಂಕ್ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
          : riskLevel === "MEDIUM"
          ? "ಅನುಮಾನಾಸ್ಪದ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ. ಯಾವುದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಅಧಿಕೃತ ಚಾನಲ್ ಮೂಲಕ ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ."
          : "ಈ ವಿಷಯದಲ್ಲಿ ಯಾವುದೇ ಅನುಮಾನಾಸ್ಪದ ಅಥವಾ ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಅಪರಿಚಿತ ವಿನಂತಿಗಳ ಬಗ್ಗೆ ಸದಾ ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ.")
      : isHi
      ? (riskLevel === "HIGH"
          ? "सुरक्षा चेतावनी संकेत मिले हैं। ये डिजिटल धोखाधड़ी और फ़िशिंग तकनीकों से मेल खाते हैं। किसी भी लिंक पर क्लिक न करें या OTP साझा न करें।"
          : riskLevel === "MEDIUM"
          ? "संदिग्ध पैटर्न मिले हैं। कोई भी कदम उठाने से पहले आधिकारिक चैनल के माध्यम से स्वतंत्र रूप से पुष्टि करें।"
          : "इस सबमिशन में कोई संदिग्ध या भ्रामक पैटर्न नहीं मिला। अप्रत्याशित अनुरोधों के प्रति हमेशा सतर्क रहें।")
      : isTe
      ? (riskLevel === "HIGH"
          ? "భద్రతా హెచ్చరిక సంకేతాలు గుర్తించబడ్డాయి. ఇవి డిజిటల్ మోసాలు మరియు ఫిషింగ్ పద్ధతులకు సరిపోతాయి. ఏ లింక్ క్లిక్ చేయవద్దు లేదా OTP పంచుకోవద్దు."
          : riskLevel === "MEDIUM"
          ? "అనుమానాస్పద నమూనాలు కనిపించాయి. ఏ చర్య తీసుకునే ముందైనా అధికారిక మార్గాల ద్వారా ధృవీకరించుకోండి."
          : "ఈ కంటెంట్‌లో ఎలాంటి అనుమానాస్పద లేదా మోసపూరిత నమూనాలు కనుగొనబడలేదు. అపరిచిత అభ్యర్థనల పట్ల ఎల్లప్పుడూ అప్రమత్తంగా ఉండండి.")
      : (riskLevel === "HIGH"
          ? "Security alert indicators detected. These strongly align with payment fraud and phishing patterns."
          : riskLevel === "MEDIUM"
          ? "Deceptive patterns identified. Independent verification through an official channel is advised."
          : "No deceptive patterns found in this submission."),
    recommendedActions: actions,
    detectedUrls: url.flags,
    createdAt: new Date().toISOString(),
    aiProvider: isKn ? "ಸುದರ್ಶನ ನಿಯಮ ಇಂಜಿನ್" : isHi ? "सुदर्शन हेयूरिस्टिक इंजन" : isTe ? "సుదర్శన నియమ ఇంజిన్" : "Sudarshan Heuristic Engine",
  };
}
