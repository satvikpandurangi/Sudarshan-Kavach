export type UrlIndicators = {
  urls: string[];
  flags: string[];
  score: number;
  isOfficial?: boolean;
};

const OFFICIAL_DOMAINS = new Set([
  "sudarshan-kavach.vercel.app",
  "sudarshankavach.org",
  "sudarshankavach.in",
  "onlinesbi.sbi",
  "sbi.co.in",
  "hdfcbank.com",
  "icicibank.com",
  "axisbank.com",
  "kotak.com",
  "paytm.com",
  "phonepe.com",
  "pay.google.com",
  "bhimupi.org.in",
  "npci.org.in",
  "uidai.gov.in",
  "incometax.gov.in",
  "cybercrime.gov.in",
  "amazon.in",
  "amazon.com",
  "flipkart.com",
  "rummycircle.com",
  "jungleerummy.com",
  "dream11.com",
]);

const BAD_WORDS = /login|verify|secure|update|wallet|reward|bonus|claim|kyc|bank|pay|upi|gift|free|apk|download/i;
const SHORTENERS = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|is\.gd|cutt\.ly|rebrand\.ly|t\.ly|wa\.me|rummyc\.co|shorturl\.at|bit\.do|tiny\.cc|v\.gd|qr\.ae|trib\.al|bl\.ink)$/i;
const GAMBLING_RE = /(?:rummy|bet\d*|casino|jackpot|poker|teenpatti|aviator|satta|matka|lottery)/i;
const IP_HOST = /^(\d{1,3}\.){3}\d{1,3}$/;

export function extractUrls(text: string): string[] {
  return (text.match(/https?:\/\/[^\s<>()]+/gi) || []).map((x) =>
    x.replace(/[.,!?]+$/, "")
  );
}

export function inspectUrls(input: string): UrlIndicators {
  const urls = extractUrls(input);
  let score = 0;
  const flags: string[] = [];
  let isOfficial = false;

  for (const raw of urls) {
    try {
      const u = new URL(raw);
      const host = u.hostname.toLowerCase();

      // Check official safe domains (e.g. sudarshan-kavach.vercel.app)
      if (OFFICIAL_DOMAINS.has(host) || host.endsWith(".sudarshan-kavach.vercel.app")) {
        isOfficial = true;
        continue;
      }

      if (u.protocol !== "https:") {
        score += 15;
        flags.push("The link does not use HTTPS");
      }

      const isShortener =
        SHORTENERS.test(host) ||
        (/^(?:co|top|vip|xyz|bet|win|cc|ly|is|to)$/i.test(host.split(".").pop() || "") &&
          host.length <= 12 &&
          u.pathname.length > 1 &&
          u.pathname.length <= 12);

      if (isShortener) {
        score += 25;
        flags.push("A shortened link hides its true destination");
      }

      if (GAMBLING_RE.test(host) || GAMBLING_RE.test(u.pathname)) {
        score += 35;
        flags.push("Link points to an unregulated gambling or betting platform");
      }

      if (IP_HOST.test(host)) {
        score += 35;
        flags.push("The link uses an IP address instead of a named domain");
      }

      if (host.split(".").length > 3) {
        score += 15;
        flags.push("The domain has an unusually deep subdomain");
      }

      // Brand lookalike check in frontend
      const brandTokens = ["sbi", "hdfc", "icici", "axis", "kotak", "paytm", "phonepe", "gpay", "aadhaar", "rummy"];
      for (const token of brandTokens) {
        if (host.includes(token) && !OFFICIAL_DOMAINS.has(host)) {
          score += 35;
          flags.push(`The web address mimics ${token.toUpperCase()} but is not an official address`);
          break;
        }
      }

      if (BAD_WORDS.test(u.href)) {
        score += 15;
        flags.push("The link contains terms often used in impersonation or reward scams");
      }

      if (/[0-9]/.test(host) && host.length > 12) {
        score += 10;
        flags.push("The domain has an unusual numeric pattern");
      }
    } catch {
      score += 25;
      flags.push("A submitted link is malformed");
    }
  }

  // If there are only official URLs and no other flags, score is 0
  if (isOfficial && flags.length === 0) {
    return { urls, flags: [], score: 0, isOfficial: true };
  }

  return {
    urls,
    flags: [...new Set(flags)],
    score: Math.min(score, 90),
    isOfficial,
  };
}
