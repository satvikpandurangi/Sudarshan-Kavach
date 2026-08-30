// UI chrome strings, hand-written per language (EN / KN / HI).
//
// This mirrors the backend's localization approach: safety-critical and
// user-facing text is predefined and reviewed, never machine-translated at
// runtime. The backend owns the recommended-action / reporting / checklist copy
// (it comes back already localized in the API response); this module owns the
// static interface labels that never leave the client.
//
// English is authoritative. Kannada and Hindi should be verified by a native
// reader on the team before the demo (build-plan.md Phase 6).

export const UI = {
  en: {
    tagline: "Before you Click, Pay, Share, or Trust — check the message first.",
    intro:
      "Paste a suspicious SMS, WhatsApp message, or email — or upload a screenshot. We show you the exact warning signs, explain why they matter, and tell you what to do.",
    tabText: "Paste text",
    tabImage: "Upload screenshot",
    placeholder: "Paste the message here…",
    trySample: "Try a sample scam",
    outputLanguage: "Output language",
    analyze: "Analyze",
    privacy: "🔒 We store nothing. Your submission is processed and discarded.",
    pasteFirst: "Please paste a message first.",
    // dropzone
    dropPrimary: "Tap to upload a screenshot",
    dropHint: "or drag an image here · PNG, JPG, WEBP · max 5 MB",
    dropNote:
      "We read the text from your screenshot and show it to you before the verdict, so you can confirm we read it correctly.",
    imgTypeError: "That file type isn't supported. Upload a PNG, JPG, or WEBP screenshot.",
    imgSizeError: "That image is too large. Please upload one under 5 MB.",
    // loading
    loadingText: "Checking the message for warning signs…",
    loadingImage: "Reading your screenshot and checking it…",
    loadingSteps: [
      "Reading the message…",
      "Checking links and domains…",
      "Looking for scam patterns…",
      "Writing the explanation…",
    ],
    tryAgain: "Try again",
    // result
    ocrReadout: "Text we read from your screenshot",
    confident: "confident",
    degradedTitle: "Offline check.",
    degradedBody:
      "The AI explanation service wasn't reachable, so this result is based on our security signals alone. The warning signs below are still accurate.",
    warningsTitle: "Warning signs found",
    noticedTitle: "What we noticed",
    fromYourMessage: "From your message:",
    whatToDo: "What to do",
    howToCheck: "How to check for yourself",
    linksFound: "Links found in this message",
    checkAnother: "Check another message",
    analysedIn: "Analysed in",
    confidence: "Confidence",
    // risk leads
    leads: {
      safe: "Nothing alarming found",
      suspicious: "Warning signs found — verify before acting",
      dangerous: "Strong signs of a scam — do not act",
      cannot_determine: "We can't be sure — here's how to check yourself",
    },
    labels: {
      safe: "Safe",
      suspicious: "Suspicious",
      dangerous: "Dangerous",
      cannot_determine: "Cannot Determine",
    },
    severity: { high: "High", medium: "Medium", low: "Low" },
    footerTeam: "Team Hayagreeva · YUKTIMANTHAN 2.0",
    footerPrivacy: "No accounts. No history. Nothing stored.",
  },

  kn: {
    tagline: "ಕ್ಲಿಕ್ ಮಾಡುವ, ಪಾವತಿಸುವ, ಹಂಚಿಕೊಳ್ಳುವ ಅಥವಾ ನಂಬುವ ಮೊದಲು — ಸಂದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ.",
    intro:
      "ಅನುಮಾನಾಸ್ಪದ SMS, WhatsApp ಸಂದೇಶ ಅಥವಾ ಇಮೇಲ್ ಅಂಟಿಸಿ — ಅಥವಾ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನಿಖರವಾದ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳನ್ನು ತೋರಿಸಿ, ಅವು ಏಕೆ ಮುಖ್ಯ ಎಂದು ವಿವರಿಸಿ, ಏನು ಮಾಡಬೇಕೆಂದು ಹೇಳುತ್ತೇವೆ.",
    tabText: "ಪಠ್ಯ ಅಂಟಿಸಿ",
    tabImage: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್",
    placeholder: "ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ…",
    trySample: "ಮಾದರಿ ವಂಚನೆಯನ್ನು ಪ್ರಯತ್ನಿಸಿ",
    outputLanguage: "ಔಟ್‌ಪುಟ್ ಭಾಷೆ",
    analyze: "ವಿಶ್ಲೇಷಿಸಿ",
    privacy: "🔒 ನಾವು ಏನನ್ನೂ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ. ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯನ್ನು ಸಂಸ್ಕರಿಸಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.",
    pasteFirst: "ದಯವಿಟ್ಟು ಮೊದಲು ಸಂದೇಶವನ್ನು ಅಂಟಿಸಿ.",
    dropPrimary: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    dropHint: "ಅಥವಾ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ · PNG, JPG, WEBP · ಗರಿಷ್ಠ 5 MB",
    dropNote:
      "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ನಿಂದ ಪಠ್ಯವನ್ನು ಓದಿ, ತೀರ್ಪಿನ ಮೊದಲು ಅದನ್ನು ನಿಮಗೆ ತೋರಿಸುತ್ತೇವೆ, ಇದರಿಂದ ನಾವು ಸರಿಯಾಗಿ ಓದಿದ್ದೇವೆ ಎಂದು ನೀವು ಖಚಿತಪಡಿಸಬಹುದು.",
    imgTypeError: "ಆ ಫೈಲ್ ಪ್ರಕಾರ ಬೆಂಬಲಿತವಲ್ಲ. PNG, JPG ಅಥವಾ WEBP ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    imgSizeError: "ಆ ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. 5 MB ಗಿಂತ ಕಡಿಮೆ ಇರುವ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    loadingText: "ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳಿಗಾಗಿ ಸಂದೇಶವನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
    loadingImage: "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಓದಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
    loadingSteps: [
      "ಸಂದೇಶವನ್ನು ಓದಲಾಗುತ್ತಿದೆ…",
      "ಲಿಂಕ್‌ಗಳು ಮತ್ತು ಡೊಮೇನ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
      "ವಂಚನೆ ಮಾದರಿಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
      "ವಿವರಣೆಯನ್ನು ಬರೆಯಲಾಗುತ್ತಿದೆ…",
    ],
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    ocrReadout: "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ನಿಂದ ನಾವು ಓದಿದ ಪಠ್ಯ",
    confident: "ವಿಶ್ವಾಸ",
    degradedTitle: "ಆಫ್‌ಲೈನ್ ಪರಿಶೀಲನೆ.",
    degradedBody:
      "AI ವಿವರಣೆ ಸೇವೆ ತಲುಪಲಾಗಲಿಲ್ಲ, ಆದ್ದರಿಂದ ಈ ಫಲಿತಾಂಶವು ನಮ್ಮ ಭದ್ರತಾ ಸಂಕೇತಗಳ ಆಧಾರದ ಮೇಲಿದೆ. ಕೆಳಗಿನ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು ಇನ್ನೂ ನಿಖರವಾಗಿವೆ.",
    warningsTitle: "ಕಂಡುಬಂದ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು",
    noticedTitle: "ನಾವು ಗಮನಿಸಿದ್ದು",
    fromYourMessage: "ನಿಮ್ಮ ಸಂದೇಶದಿಂದ:",
    whatToDo: "ಏನು ಮಾಡಬೇಕು",
    howToCheck: "ನೀವೇ ಹೇಗೆ ಪರಿಶೀಲಿಸುವುದು",
    linksFound: "ಈ ಸಂದೇಶದಲ್ಲಿ ಕಂಡುಬಂದ ಲಿಂಕ್‌ಗಳು",
    checkAnother: "ಮತ್ತೊಂದು ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
    analysedIn: "ವಿಶ್ಲೇಷಿಸಿದ ಸಮಯ",
    confidence: "ವಿಶ್ವಾಸ",
    leads: {
      safe: "ಆತಂಕಕಾರಿ ಏನೂ ಇಲ್ಲ",
      suspicious: "ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳಿವೆ — ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ",
      dangerous: "ವಂಚನೆಯ ಪ್ರಬಲ ಚಿಹ್ನೆಗಳು — ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಡಿ",
      cannot_determine: "ನಮಗೆ ಖಚಿತವಿಲ್ಲ — ನೀವೇ ಪರಿಶೀಲಿಸುವ ವಿಧಾನ ಇಲ್ಲಿದೆ",
    },
    labels: {
      safe: "ಸುರಕ್ಷಿತ",
      suspicious: "ಅನುಮಾನಾಸ್ಪದ",
      dangerous: "ಅಪಾಯಕಾರಿ",
      cannot_determine: "ನಿರ್ಧರಿಸಲಾಗದು",
    },
    severity: { high: "ಹೆಚ್ಚು", medium: "ಮಧ್ಯಮ", low: "ಕಡಿಮೆ" },
    footerTeam: "ಟೀಮ್ ಹಯಗ್ರೀವ · YUKTIMANTHAN 2.0",
    footerPrivacy: "ಖಾತೆಗಳಿಲ್ಲ. ಇತಿಹಾಸವಿಲ್ಲ. ಏನೂ ಸಂಗ್ರಹಿಸಿಲ್ಲ.",
  },

  hi: {
    tagline: "क्लिक, भुगतान, साझा या भरोसा करने से पहले — संदेश की जाँच करें।",
    intro:
      "कोई संदिग्ध SMS, WhatsApp संदेश या ईमेल पेस्ट करें — या स्क्रीनशॉट अपलोड करें। हम आपको सटीक चेतावनी संकेत दिखाते हैं, बताते हैं कि वे क्यों मायने रखते हैं, और क्या करना है यह बताते हैं।",
    tabText: "टेक्स्ट पेस्ट करें",
    tabImage: "स्क्रीनशॉट अपलोड करें",
    placeholder: "संदेश यहाँ पेस्ट करें…",
    trySample: "एक नमूना धोखाधड़ी आज़माएँ",
    outputLanguage: "आउटपुट भाषा",
    analyze: "विश्लेषण करें",
    privacy: "🔒 हम कुछ भी संग्रहीत नहीं करते। आपका सबमिशन संसाधित कर हटा दिया जाता है।",
    pasteFirst: "कृपया पहले एक संदेश पेस्ट करें।",
    dropPrimary: "स्क्रीनशॉट अपलोड करने के लिए टैप करें",
    dropHint: "या यहाँ एक छवि खींचें · PNG, JPG, WEBP · अधिकतम 5 MB",
    dropNote:
      "हम आपके स्क्रीनशॉट से टेक्स्ट पढ़ते हैं और निर्णय से पहले आपको दिखाते हैं, ताकि आप पुष्टि कर सकें कि हमने सही पढ़ा है।",
    imgTypeError: "यह फ़ाइल प्रकार समर्थित नहीं है। PNG, JPG या WEBP स्क्रीनशॉट अपलोड करें।",
    imgSizeError: "यह छवि बहुत बड़ी है। कृपया 5 MB से छोटी छवि अपलोड करें।",
    loadingText: "चेतावनी संकेतों के लिए संदेश की जाँच की जा रही है…",
    loadingImage: "आपका स्क्रीनशॉट पढ़ा और जाँचा जा रहा है…",
    loadingSteps: [
      "संदेश पढ़ा जा रहा है…",
      "लिंक और डोमेन जाँचे जा रहे हैं…",
      "धोखाधड़ी के पैटर्न खोजे जा रहे हैं…",
      "व्याख्या लिखी जा रही है…",
    ],
    tryAgain: "फिर से प्रयास करें",
    ocrReadout: "आपके स्क्रीनशॉट से पढ़ा गया टेक्स्ट",
    confident: "विश्वास",
    degradedTitle: "ऑफ़लाइन जाँच।",
    degradedBody:
      "AI व्याख्या सेवा उपलब्ध नहीं थी, इसलिए यह परिणाम केवल हमारे सुरक्षा संकेतों पर आधारित है। नीचे दिए चेतावनी संकेत फिर भी सटीक हैं।",
    warningsTitle: "मिले चेतावनी संकेत",
    noticedTitle: "हमने क्या देखा",
    fromYourMessage: "आपके संदेश से:",
    whatToDo: "क्या करें",
    howToCheck: "स्वयं कैसे जाँचें",
    linksFound: "इस संदेश में मिले लिंक",
    checkAnother: "दूसरा संदेश जाँचें",
    analysedIn: "विश्लेषण में लगा समय",
    confidence: "विश्वास",
    leads: {
      safe: "कुछ भी चिंताजनक नहीं मिला",
      suspicious: "चेतावनी संकेत मिले — कार्रवाई से पहले जाँचें",
      dangerous: "धोखाधड़ी के मजबूत संकेत — कार्रवाई न करें",
      cannot_determine: "हम निश्चित नहीं हैं — स्वयं जाँचने का तरीका यहाँ है",
    },
    labels: {
      safe: "सुरक्षित",
      suspicious: "संदिग्ध",
      dangerous: "खतरनाक",
      cannot_determine: "निर्धारित नहीं",
    },
    severity: { high: "उच्च", medium: "मध्यम", low: "निम्न" },
    footerTeam: "टीम हयग्रीव · YUKTIMANTHAN 2.0",
    footerPrivacy: "कोई खाता नहीं। कोई इतिहास नहीं। कुछ भी संग्रहीत नहीं।",
  },
};

export function t(lang) {
  return UI[lang] || UI.en;
}
