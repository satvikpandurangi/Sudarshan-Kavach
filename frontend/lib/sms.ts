/**
 * Pluggable SMS Provider Interface.
 * Implementations:
 *  - MockSmsProvider: venue demo mode (logs to console, returns success, UI displays OTP)
 *  - Msg91SmsProvider: real SMS dispatch via MSG91 OTP API
 */

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock?: boolean;
}

export interface SmsProvider {
  name: string;
  isMock: boolean;
  sendOtp(phone: string, otp: string): Promise<SmsSendResult>;
}

export class MockSmsProvider implements SmsProvider {
  name = "mock";
  isMock = true;

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    console.log(`[DEMO SMS PROVIDER] Simulated OTP send to ${phone}: ${otp}`);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      isMock: true,
    };
  }
}

export class Msg91SmsProvider implements SmsProvider {
  name = "msg91";
  isMock = false;
  private authKey: string;
  private templateId?: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || "";
    this.templateId = process.env.MSG91_TEMPLATE_ID;
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.authKey) {
      console.warn("[MSG91] Missing MSG91_AUTH_KEY. Falling back to simulated send.");
      return { success: true, messageId: `mock-fallback-${Date.now()}`, isMock: true };
    }

    try {
      // MSG91 OTP API format
      const cleanPhone = phone.replace(/^\+?91/, "").trim();
      const res = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${this.templateId || ""}&mobile=91${cleanPhone}&authkey=${this.authKey}&otp=${otp}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (res.ok && data.type !== "error") {
        return { success: true, messageId: data.message || "msg91-sent" };
      }
      return { success: false, error: data.message || "Failed to send SMS via MSG91" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error sending SMS" };
    }
  }
}

export function getSmsProvider(): SmsProvider {
  const providerType = (process.env.SMS_PROVIDER || "mock").toLowerCase().trim();
  if (providerType === "msg91" || providerType === "fast2sms") {
    return new Msg91SmsProvider();
  }
  return new MockSmsProvider();
}
