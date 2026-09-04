/**
 * Sudarshan Kavach - WhatsApp Bot Utilities
 * Phase 5: "Grandmother installs nothing" path
 *
 * Implements stateless language detection, in-memory sliding window rate limiting,
 * compact response formatting for mobile screens, and TwiML XML construction.
 */

// In-memory sliding window rate limiter: max 10 checks per phone number per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CHECKS_PER_WINDOW = 10;
const rateLimitStore = new Map<string, number[]>();

export function checkWhatsAppRateLimit(rawPhone: string): { allowed: boolean; remaining: number } {
  const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10) || rawPhone;
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimitStore.get(cleanPhone) || []).filter((ts) => ts > cutoff);

  if (timestamps.length >= MAX_CHECKS_PER_WINDOW) {
    rateLimitStore.set(cleanPhone, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  rateLimitStore.set(cleanPhone, timestamps);
  return { allowed: true, remaining: MAX_CHECKS_PER_WINDOW - timestamps.length };
}

// Cheap and deterministic language detection:
// Scans for Kannada (U+0C80–U+0CFF), Telugu (U+0C00–U+0C7F), and Hindi (U+0900–U+097F)
export function detectWhatsAppLanguage(text: string): "kn" | "te" | "hi" | "en" {
  if (/[\u0C80-\u0CFF]/.test(text || "")) return "kn";
  if (/[\u0C00-\u0C7F]/.test(text || "")) return "te";
  if (/[\u0900-\u097F]/.test(text || "")) return "hi";
  return "en";
}

export interface WhatsAppAnalysisData {
  riskLevel: "HIGH" | "MEDIUM" | "LOW" | "CANNOT_DETERMINE";
  riskScore: number;
  classification: string;
  explanation: string;
  recommendedActions: string[];
  warningSigns: string[];
}

export function formatWhatsAppResponse(
  data: WhatsAppAnalysisData,
  lang: "kn" | "en"
): string {
  const isKn = lang === "kn";

  if (data.riskLevel === "HIGH") {
    if (isKn) {
      const explanation = data.explanation || "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಇದು ಡಿಜಿಟಲ್ ವಂಚನೆಯಾಗಿದೆ.";
      const action = data.recommendedActions?.[0] || "ಯಾವುದೇ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಹಣ ಕಳುಹಿಸಬೇಡಿ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಸಂಪರ್ಕಿಸಿ.";
      return `🔴 ಅಪಾಯಕಾರಿ — ಇದು ವಂಚನೆಯಾಗಿದೆ.\n\n${explanation}\n\n${action}`;
    }
    const explanation = data.explanation || "This message matches patterns commonly used in digital financial fraud and phishing.";
    const action = data.recommendedActions?.[0] || "Do not open any link. Never share OTP or UPI PIN. Call your bank using the number on your debit card.";
    return `🔴 DANGEROUS — This is a scam.\n\n${explanation}\n\n${action}`;
  }

  if (data.riskLevel === "CANNOT_DETERMINE") {
    if (isKn) {
      return `⚠️ ಅನಿಶ್ಚಿತ — ಇದು ನೈಜವೋ ನಕಲಿಯೋ ಹೇಳಲು ಸಾಧ್ಯವಿಲ್ಲ.\n\nಇದರಲ್ಲಿ ಸಾಮಾನ್ಯ ವಂಚನೆಯ ಚಿಹ್ನೆಗಳಿಲ್ಲ, ಆದರೆ ಇದು ಅಧಿಕೃತವೆಂದು ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ಸುರಕ್ಷಿತ ಕ್ರಮಗಳು:\n• ಸಂದೇಶದಲ್ಲಿರುವ ಯಾವುದೇ ಸಂಖ್ಯೆ ಅಥವಾ ಲಿಂಕ್ ಬಳಸಬೇಡಿ\n• ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಮೂಲಕ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ\n• ಅನಪೇಕ್ಷಿತ ಸಂದೇಶಕ್ಕೆ ಹಣ ಪಾವತಿಸಬೇಡಿ`;
    }
    return `⚠️ UNCERTAIN — We cannot tell if this is real or fake.\n\nIt does not have the usual warning signs, but it is also not one we can verify as genuine. The safest path:\n• Do not use any number or link in the message\n• Contact the company directly using their official website\n• Never pay in response to an unsolicited message`;
  }

  if (data.riskLevel === "LOW") {
    if (isKn) {
      return `✅ ಸುರಕ್ಷಿತ — ಇದು ಅಧಿಕೃತವೆಂದು ತೋರುತ್ತದೆ.\n\nಯಾವುದೇ ವಂಚನೆಯ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಸಾಮಾನ್ಯ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.`;
    }
    return `✅ SAFE — This appears to be legitimate.\n\nNo scam patterns detected. Normal caution still applies.`;
  }

  // Fallback for MEDIUM (Suspicious)
  if (isKn) {
    const explanation = data.explanation || "ಅನುಮಾನಾಸ್ಪದ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿವೆ. ಅಧಿಕೃತ ಚಾನಲ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.";
    const action = data.recommendedActions?.[0] || "ಯಾವುದೇ OTP ಅಥವಾ ಹಣ ಪಾವತಿಸುವ ಮೊದಲು ಸ್ವತಂತ್ರವಾಗಿ ದೃಢೀಕರಿಸಿ.";
    return `🟡 ಅನುಮಾನಾಸ್ಪದ — ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.\n\n${explanation}\n\n${action}`;
  }
  const explanation = data.explanation || "Suspicious patterns detected. Verify through official channels before proceeding.";
  const action = data.recommendedActions?.[0] || "Verify independently before sharing any details or making payment.";
  return `🟡 SUSPICIOUS — Caution advised.\n\n${explanation}\n\n${action}`;
}

// Generate Twilio TwiML XML response
export function createTwiMLResponse(text: string): string {
  // Escape XML entities
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${escaped}</Message>
</Response>`;
}
