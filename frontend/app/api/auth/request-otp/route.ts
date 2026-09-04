import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, createOtpHash, generate6DigitOtp } from "@/lib/auth";
import { getSmsProvider } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);

    // Validate 10-digit Indian mobile number
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Enforce in-memory rate limiting: 3 requests per number per 10 minutes
    const rateLimit = checkRateLimit(cleanPhone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many OTP requests for this number. Please wait ${rateLimit.retryAfterSec || 600} seconds before trying again.`,
          retryAfterSec: rateLimit.retryAfterSec,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP and 5-minute expiry
    const otp = generate6DigitOtp();
    const expiry = Date.now() + 5 * 60 * 1000; // now + 5 minutes
    const hash = createOtpHash(cleanPhone, otp, expiry);

    // Dispatch via pluggable SMS Provider
    const provider = getSmsProvider();
    const sendResult = await provider.sendOtp(cleanPhone, otp);

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || "Failed to deliver SMS. Please try again." },
        { status: 500 }
      );
    }

    // In mock mode, return the demoOtp for venue demo resilience
    const responseData: Record<string, any> = {
      success: true,
      hash,
      expiry,
      isDemoMode: provider.isMock,
    };

    if (provider.isMock) {
      responseData.demoOtp = otp;
      responseData.demoNotice = "Demo mode active: Venue SMS simulated. Use the demo OTP provided.";
    }

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("[request-otp] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal error requesting OTP. Please try again." },
      { status: 500 }
    );
  }
}
