import crypto from "crypto";

const SERVER_SECRET =
  process.env.AUTH_SERVER_SECRET ||
  process.env.SERVER_SECRET ||
  "sudarshan-kavach-stateless-auth-secret-key-2026";

// In-memory rate limiting: 3 requests per phone number per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(phone: string): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const timestamps = rateLimitMap.get(cleanPhone) || [];

  // Filter timestamps within sliding window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  recent.push(now);
  rateLimitMap.set(cleanPhone, recent);
  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - recent.length };
}

export function generate6DigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Generates HMAC-SHA256(SERVER_SECRET, phone + otp + expiry)
 */
export function createOtpHash(phone: string, otp: string, expiry: number): string {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const payload = `${cleanPhone}:${otp}:${expiry}`;
  return crypto.createHmac("sha256", SERVER_SECRET).update(payload).digest("hex");
}

/**
 * Timing-safe HMAC-SHA256 verification
 */
export function verifyOtpHash(phone: string, otp: string, expiry: number, hash: string): boolean {
  if (Date.now() > expiry) {
    return false;
  }
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const expectedHash = createOtpHash(cleanPhone, otp, expiry);
  const hashBuf = Buffer.from(hash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  if (hashBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuf, expectedBuf);
}

// Lightweight JWT implementation using HMAC-SHA256 (no external dependencies, zero database)
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

export function createSessionJwt(phone: string, name?: string): string {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: cleanPhone,
    phone: cleanPhone,
    name: name || "Citizen",
    iat: now,
    exp: now + 86400, // 24 hours
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", SERVER_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

export function verifySessionJwt(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = crypto
      .createHmac("sha256", SERVER_SECRET)
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
