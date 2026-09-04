"use client";

import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";

interface QuizItem {
  id: number;
  sender: string;
  body: string;
  isScam: boolean;
  explanation: string;
  telltale: string;
}

const localizedQuizzes: Record<Language, QuizItem[]> = {
  en: [
    {
      id: 1,
      sender: "VK-INDPOST",
      body: "India Post: Your package #IN892189 cannot be delivered due to missing house number. Update your address within 12 hours at http://indiapost-parcel-delivery.top/update or parcel will be returned.",
      isScam: true,
      explanation: "Scam! India Post never uses '.top' or random domain extensions. Official portal is indiapost.gov.in. Notice the artificial 12-hour urgency.",
      telltale: "Unauthorized '.top' domain and urgency trap",
    },
    {
      id: 2,
      sender: "SBI-ALERT",
      body: "Your SBI A/c XX1294 debited by Rs 4,500 on 03-Sep-26 by UPI/P2A/Ref 424102941. If not done by you, forward this SMS to 9223008333 or call 1800112211.",
      isScam: false,
      explanation: "Legitimate! This is a standard RBI-mandated transactional debit alert. It does NOT ask you to click an unknown link or disclose your OTP/PIN.",
      telltale: "Official bank toll-free numbers and no credential request",
    },
    {
      id: 3,
      sender: "WA-REWARD",
      body: "Congratulations! You have received a lottery scratch card worth Rs 2,50,000 from KBC Jio Lucky Draw. To credit amount to bank, send processing fee of Rs 1,999 to upi@fraud.",
      isScam: true,
      explanation: "Scam! Real prizes or lotteries never demand upfront 'processing fee' or 'GST' to claim money. KBC does not run WhatsApp lotteries.",
      telltale: "Advance fee fraud for fake lottery winnings",
    },
  ],
  kn: [
    {
      id: 1,
      sender: "VK-INDPOST",
      body: "ಇಂಡಿಯಾ ಪೋಸ್ಟ್: ಮನೆ ಸಂಖ್ಯೆ ಇಲ್ಲದ ಕಾರಣ ನಿಮ್ಮ ಪಾರ್ಸೆಲ್ #IN892189 ತಲುಪಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. 12 ಗಂಟೆಗಳ ಒಳಗೆ http://indiapost-parcel-delivery.top/update ನಲ್ಲಿ ವಿಳಾಸ ನವೀಕರಿಸಿ ಇಲ್ಲವೇ ಪಾರ್ಸೆಲ್ ಹಿಂತಿರುಗಿಸಲಾಗುವುದು.",
      isScam: true,
      explanation: "ವಂಚನೆ! ಇಂಡಿಯಾ ಪೋಸ್ಟ್ ಎಂದಿಗೂ '.top' ನಂತಹ ಅಪರಿಚಿತ ಡೊಮೇನ್‌ಗಳನ್ನು ಬಳಸುವುದಿಲ್ಲ. ಅಧಿಕೃತ ಪೋರ್ಟಲ್ indiapost.gov.in ಆಗಿದೆ.",
      telltale: "ಅನಧಿಕೃತ ಡೊಮೇನ್ ಮತ್ತು 12 ಗಂಟೆಗಳ ನಕಲಿ ತುರ್ತು ಎಚ್ಚರಿಕೆ",
    },
    {
      id: 2,
      sender: "SBI-ALERT",
      body: "ನಿಮ್ಮ SBI ಖಾತೆ XX1294 ನಿಂದ ದಿನಾಂಕ 03-Sep-26 ರಂದು ರೂ 4,500 ಕಡಿತಗೊಂಡಿದೆ. ಈ ವಹಿವಾಟು ನೀವು ಮಾಡಿರದಿದ್ದರೆ 1800112211 ಗೆ ಕರೆ ಮಾಡಿ.",
      isScam: false,
      explanation: "ಅಧಿಕೃತ! ಇದು ಆರ್‌ಬಿಐ ನಿಯಮಾವಳಿಯ ಪ್ರಕಾರ ಬರುವ ಸಾಮಾನ್ಯ ಬ್ಯಾಂಕ್ ಎಚ್ಚರಿಕೆ. ಇದು ಯಾವುದೇ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಲು ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಲು ಕೇಳುವುದಿಲ್ಲ.",
      telltale: "ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಟೋಲ್-ಫ್ರೀ ಸಂಖ್ಯೆ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಕೇಳಿಲ್ಲ",
    },
    {
      id: 3,
      sender: "WA-REWARD",
      body: "ಅಭಿನಂದನೆಗಳು! KBC ಜಿಯೋ ಲಕ್ಕಿ ಡ್ರಾದಲ್ಲಿ ನೀವು ರೂ 2,50,000 ನಗದು ಬಹುಮಾನ ಗೆದ್ದಿದ್ದೀರಿ. ಹಣ ಜಮೆ ಮಾಡಲು ರೂ 1,999 ಶುಲ್ಕವನ್ನು ಈ UPI ಗೆ ಕಳುಹಿಸಿ.",
      isScam: true,
      explanation: "ವಂಚನೆ! ನಿಜವಾದ ಲಾಟರಿಗಳು ಎಂದಿಗೂ ಮುಂಗಡ ಶುಲ್ಕ ಅಥವಾ ತೆರಿಗೆ ಪಾವತಿಸಲು ಕೇಳುವುದಿಲ್ಲ. ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಲಾಟರಿ ಹಣ ನೀಡುವುದಿಲ್ಲ.",
      telltale: "ನಕಲಿ ಲಾಟರಿ ಹಣದ ಹೆಸರಿನಲ್ಲಿ ಮುಂಗಡ ಶುಲ್ಕ ವಂಚನೆ",
    },
  ],
  hi: [
    {
      id: 1,
      sender: "VK-INDPOST",
      body: "इंडिया पोस्ट: मकान नंबर अधूरा होने के कारण आपका पार्सल #IN892189 डिलीवर नहीं हो सका। 12 घंटे के भीतर http://indiapost-parcel-delivery.top/update पर पता अपडेट करें अथवा पार्सल वापस कर दिया जाएगा।",
      isScam: true,
      explanation: "धोखाधड़ी! इंडिया पोस्ट कभी भी '.top' या अज्ञात डोमेन का उपयोग नहीं करता। आधिकारिक पोर्टल indiapost.gov.in है।",
      telltale: "अनधिकृत '.top' डोमेन और 12 घंटे की नकली तात्कालिकता",
    },
    {
      id: 2,
      sender: "SBI-ALERT",
      body: "आपके SBI खाते XX1294 से 03-Sep-26 को 4,500 रुपये डेबिट किए गए हैं। यदि यह आपने नहीं किया है तो तुरंत 1800112211 पर कॉल करें।",
      isScam: false,
      explanation: "वैध सूचना! यह आरबीआई द्वारा अनिवार्य सामान्य बैंक डेबिट अलर्ट है। इसमें किसी लिंक पर क्लिक करने या OTP देने को नहीं कहा गया है।",
      telltale: "आधिकारिक बैंक टोल-फ्री नंबर और कोई संवेदनशील जानकारी नहीं मांगी गई",
    },
    {
      id: 3,
      sender: "WA-REWARD",
      body: "बधाई हो! आपको KBC जियो लकी ड्रा में 2,50,000 रुपये का नकद पुरस्कार मिला है। राशि खाते में प्राप्त करने के लिए 1,999 रुपये प्रोसेसिंग फीस इस UPI पर भेजें।",
      isScam: true,
      explanation: "धोखाधड़ी! कोई भी वैध लॉटरी पुरस्कार देने के लिए अग्रिम प्रोसेसिंग शुल्क या जीएसटी नहीं मांगती है।",
      telltale: "फर्जी लॉटरी के नाम पर अग्रिम शुल्क ठगी",
    },
  ],
  te: [
    {
      id: 1,
      sender: "VK-INDPOST",
      body: "ఇండియా పోస్ట్: ఇంటి నంబర్ లేనందున మీ పార్శిల్ #IN892189 డెలివరీ చేయబడలేదు. 12 గంటల్లో http://indiapost-parcel-delivery.top/update లో చిరునామా అప్‌డేట్ చేయండి లేదా పార్శిల్ వెనక్కి పంపబడుతుంది.",
      isScam: true,
      explanation: "మోసం! ఇండియా పోస్ట్ ఎప్పుడూ '.top' వంటి అనధికారిక డొమైన్‌లను ఉపయోగించదు. అధికారిక పోర్టల్ indiapost.gov.in.",
      telltale: "అనధికారిక డొమైన్ మరియు 12 గంటల తప్పుడు అత్యవసరత",
    },
    {
      id: 2,
      sender: "SBI-ALERT",
      body: "మీ SBI ఖాతా XX1294 నుండి 03-Sep-26 న రూ 4,500 డెబిట్ చేయబడింది. ఈ లావాదేవీ మీరు చేయకపోతే వెంటనే 1800112211 కి కాల్ చేయండి.",
      isScam: false,
      explanation: "నిజమైనది! ఇది ఆర్బీఐ నిబంధనల ప్రకారం బ్యాంక్ పంపే సాధారణ డెబిట్ సందేశం. ఇది ఎటువంటి లింక్‌లు లేదా OTP వివరాలను అడగదు.",
      telltale: "అధికారిక బ్యాంక్ టోల్-ఫ్రీ నంబర్ మరియు సున్నితమైన సమాచారం అడగకపోవడం",
    },
    {
      id: 3,
      sender: "WA-REWARD",
      body: "అభినందనలు! KBC జియో లక్కీ డ్రాలో మీరు రూ 2,50,000 గెలుచుకున్నారు. నగదు పొందడానికి ప్రాసెసింగ్ ఫీజు రూ 1,999 ఈ UPI కి పంపండి.",
      isScam: true,
      explanation: "మోసం! నిజమైన లాటరీలు లేదా బహుమతులు ఎప్పుడూ ముందస్తు ప్రాసెసింగ్ ఫీజును డిమాండ్ చేయవు.",
      telltale: "నకిలీ లాటరీ పేరుతో ముందస్తు రుసుము మోసం",
    },
  ],
};

export function ScamSimulator() {
  const { lang, t } = useTranslation();
  const quizQuestions = localizedQuizzes[lang] || localizedQuizzes.en;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const current = quizQuestions[currentIdx] || quizQuestions[0];

  const handleAnswer = (choice: boolean) => {
    setUserChoice(choice);
    if (choice === current.isScam) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setUserChoice(null);
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setUserChoice(null);
    setScore(0);
    setCompleted(false);
  };

  return (
    <section className="card-premium" style={{ margin: "40px 0", padding: "36px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div className="eyebrow">
            <span>{t.safety.quizEyebrow}</span>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: "6px" }}>
            {t.safety.quizTitle}
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
            {t.safety.quizSubtitle}
          </p>
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-orange-dark)", background: "var(--brand-orange-light)", padding: "6px 14px", borderRadius: "9999px" }}>
          {lang === "kn" ? `ಪ್ರಶ್ನೆ ${currentIdx + 1} / ${quizQuestions.length}` : lang === "hi" ? `प्रश्न ${currentIdx + 1} / ${quizQuestions.length}` : `Question ${currentIdx + 1} of ${quizQuestions.length}`}
        </div>
      </div>

      {!completed ? (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Simulated Mobile SMS Card */}
          <div
            style={{
              padding: "24px",
              borderRadius: "18px",
              background: "#090d16",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 14px 30px rgba(0, 0, 0, 0.25)",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem" }}>
                SMS
              </div>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>{current.sender}</div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{lang === "kn" ? "ಇಂದು ಬಂದಿದೆ • 10:42 AM" : lang === "hi" ? "आज प्राप्त हुआ • 10:42 AM" : "Received Today • 10:42 AM"}</div>
              </div>
            </div>

            <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "#e2e8f0" }}>
              {current.body}
            </p>
          </div>

          {/* User Decision Buttons */}
          {userChoice === null ? (
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn btn-danger"
                onClick={() => handleAnswer(true)}
                style={{ flex: 1, minWidth: "180px", padding: "14px 20px" }}
              >
                {t.safety.flagScamBtn}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => handleAnswer(false)}
                style={{ flex: 1, minWidth: "180px", padding: "14px 20px" }}
              >
                {t.safety.markLegitBtn}
              </button>
            </div>
          ) : (
            /* Instant Feedback Box */
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: userChoice === current.isScam ? "#ecfdf5" : "#fef2f2",
                border: `1.5px solid ${userChoice === current.isScam ? "#a7f3d0" : "#fecaca"}`,
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>
                  {userChoice === current.isScam
                    ? (lang === "kn" ? "🎯 ಸರಿ!" : lang === "hi" ? "🎯 सही जवाब!" : "🎯 Correct!")
                    : (lang === "kn" ? "⚠️ ಗಮನಿಸಿ!" : lang === "hi" ? "⚠️ ध्यान दें!" : "⚠️ Watch Out!")}
                </span>
                <strong style={{ color: userChoice === current.isScam ? "#065f46" : "#991b1b" }}>
                  {current.isScam
                    ? (lang === "kn" ? "ಇದು ನಿಜವಾಗಿಯೂ ಅಪಾಯಕಾರಿ ವಂಚನೆ." : lang === "hi" ? "यह वास्तव में एक खतरनाक धोखाधड़ी है।" : "This is indeed a malicious scam.")
                    : (lang === "kn" ? "ಇದು ಅಧಿಕೃತ ಸಾಮಾನ್ಯ ಸೂಚನೆಯಾಗಿದೆ." : lang === "hi" ? "यह एक सामान्य वैध सूचना है।" : "This is a legitimate standard notification.")}
                </strong>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "8px" }}>
                {current.explanation}
              </p>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-orange-dark)" }}>
                {lang === "kn" ? `ಮುಖ್ಯ ಸೂಚನೆ: ${current.telltale}` : lang === "hi" ? `मुख्य पहचान: ${current.telltale}` : `Key Signal: ${current.telltale}`}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ marginTop: "14px", width: "100%" }}
              >
                {currentIdx < quizQuestions.length - 1
                  ? (lang === "kn" ? "ಮುಂದಿನ ಪ್ರಶ್ನೆ ›" : lang === "hi" ? "अगला प्रश्न ›" : "Next Simulation ›")
                  : (lang === "kn" ? "ಅಂತಿಮ ಅಂಕ ನೋಡಿ" : lang === "hi" ? "अंतिम स्कोर देखें" : "View Final Safety Score")}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Score Summary Card */
        <div style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
            {score === quizQuestions.length ? "🛡️" : score > 1 ? "⚡" : "🔍"}
          </div>
          <h3 className="heading-md" style={{ marginBottom: "6px" }}>
            {lang === "kn" ? `ಸುರಕ್ಷತಾ ಅಂಕ: ${score} / ${quizQuestions.length}` : lang === "hi" ? `सुरक्षा स्कोर: ${score} / ${quizQuestions.length}` : `Safety Score: ${score} / ${quizQuestions.length}`}
          </h3>
          <p className="text-secondary" style={{ fontSize: "0.92rem", marginBottom: "20px" }}>
            {score === quizQuestions.length
              ? (lang === "kn" ? "ಉತ್ತಮ ಜಾಗರೂಕತೆ! ಫಿಶಿಂಗ್ ಬಲೆಗಳು ಮತ್ತು ನಕಲಿ ಡೊಮೇನ್‌ಗಳನ್ನು ನೀವು ಸುಲಭವಾಗಿ ಪತ್ತೆಹಚ್ಚಬಲ್ಲಿರಿ." : lang === "hi" ? "उत्कृष्ट सतर्कता! आप फ़िशिंग जाल और फर्जी डोमेन को आसानी से पहचान सकते हैं।" : "Impressive vigilance! You can confidently spot phishing lures, fake domains, and pressure tactics.")
              : (lang === "kn" ? "ವಂಚಕರು ಸದಾ ಹೊಸ ತಂತ್ರಗಳನ್ನು ಬಳಸುತ್ತಾರೆ. ಸಂಶಯವಿದ್ದಾಗ ಸುದರ್ಶನ ಕವಚದಲ್ಲಿ ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ." : lang === "hi" ? "धोखेबाज लगातार नए तरीके खोजते हैं। किसी भी संदेश को पहले सुदर्शन कवच से जांचें।" : "Scammers continuously evolve their tactics. Always verify suspicious communications through official channels or Sudarshan Kavach.")}
          </p>

          <button className="btn btn-secondary" onClick={resetQuiz}>
            {lang === "kn" ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : lang === "hi" ? "फिर से टेस्ट करें" : "Try Simulations Again"}
          </button>
        </div>
      )}
    </section>
  );
}
