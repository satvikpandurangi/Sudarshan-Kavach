import { NextRequest, NextResponse } from "next/server";
import { createSessionJwt, verifyOtpHash } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const hash = typeof body.hash === "string" ? body.hash.trim() : "";
    const expiry = typeof body.expiry === "number" ? body.expiry : parseInt(body.expiry, 10);
    const name = typeof body.name === "string" ? body.name.trim() : "Citizen";

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number provided." },
        { status: 400 }
      );
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    if (!hash || !expiry) {
      return NextResponse.json(
        { error: "Missing verification payload. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Reject if expired
    if (Date.now() > expiry) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Timing-safe HMAC comparison
    const isValid = verifyOtpHash(cleanPhone, otp, expiry, hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check and try again." },
        { status: 401 }
      );
    }

    // On success: generate signed session JWT (24-hour expiry)
    const token = createSessionJwt(cleanPhone, name);

    return NextResponse.json({
      success: true,
      token,
      user: {
        name: name || "Citizen",
        mobile: cleanPhone,
        authenticatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[verify-otp] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal error verifying OTP. Please try again." },
      { status: 500 }
    );
  }
}
