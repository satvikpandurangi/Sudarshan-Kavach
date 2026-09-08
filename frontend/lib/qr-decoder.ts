import jsQR from "jsqr";

export interface UpiDetails {
  vpa?: string;
  name?: string;
  amount?: string;
  currency?: string;
  note?: string;
  merchantCode?: string;
}

export interface QrDecodeResult {
  text: string;
  upiDetails: UpiDetails | null;
}

/**
 * Extracts structured UPI parameters from deep links like upi://pay?pa=...&pn=...&am=...
 */
export function parseUpiPayload(payload: string): UpiDetails | null {
  if (!payload || !payload.toLowerCase().startsWith("upi://pay")) {
    return null;
  }
  try {
    const qIndex = payload.indexOf("?");
    if (qIndex === -1) return {};
    const query = payload.slice(qIndex + 1);
    const params = new URLSearchParams(query);
    return {
      vpa: params.get("pa") || undefined,
      name: params.get("pn") || undefined,
      amount: params.get("am") || undefined,
      currency: params.get("cu") || "INR",
      note: params.get("tn") || undefined,
      merchantCode: params.get("mc") || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Formats decoded payload for the analysis pipeline.
 * For UPI deep links, extracts payee VPA and amount so existing signal detectors inspect them.
 */
export function formatQrAnalysisContent(decodedText: string, upiDetails: UpiDetails | null): string {
  if (!upiDetails || (!upiDetails.vpa && !upiDetails.amount)) {
    return decodedText;
  }
  const lines: string[] = [decodedText, ""];
  lines.push("UPI Payment Request Particulars:");
  if (upiDetails.vpa) lines.push(`Payee VPA: ${upiDetails.vpa}`);
  if (upiDetails.name) lines.push(`Payee Name: ${upiDetails.name}`);
  if (upiDetails.amount) lines.push(`Amount: Rs ${upiDetails.amount} ${upiDetails.currency || "INR"}`);
  if (upiDetails.note) lines.push(`Transaction Note: ${upiDetails.note}`);
  return lines.join("\n");
}

/**
 * Decodes a QR code completely client-side in the user's browser using jsQR.
 * The raw image is NEVER transmitted to any external server or model.
 */
export async function decodeQrImage(file: File): Promise<QrDecodeResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image file provided."));
      return;
    }

    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|bmp|gif|heic|heif)$/i.test(file.name)) {
      reject(new Error("Please upload a valid image file (JPG, PNG, or WEBP)."));
      return;
    }

    if (file.size > 15728640) {
      reject(new Error("Image size exceeds 15 MB limit."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Helper function to scan canvas at given dimensions
          const scanAtResolution = (targetW: number, targetH: number): ReturnType<typeof jsQR> => {
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            return jsQR(imgData.data, targetW, targetH, {
              inversionAttempts: "attemptBoth",
            });
          };

          // 1. First attempt: capped at 1400px for speed and accuracy
          const firstMax = 1400;
          let w1 = width;
          let h1 = height;
          if (w1 > firstMax || h1 > firstMax) {
            const scale = Math.min(firstMax / w1, firstMax / h1);
            w1 = Math.round(w1 * scale);
            h1 = Math.round(h1 * scale);
          }
          let qrCode = scanAtResolution(w1, h1);

          // 2. Second attempt: mid-scale 800px (common for mobile camera captures)
          if (!qrCode && (width > 800 || height > 800)) {
            const scale = Math.min(800 / width, 800 / height);
            const w2 = Math.round(width * scale);
            const h2 = Math.round(height * scale);
            qrCode = scanAtResolution(w2, h2);
          }

          // 3. Third attempt: compact 500px (catches dense or low-contrast mobile QRs)
          if (!qrCode && (width > 500 || height > 500)) {
            const scale = Math.min(500 / width, 500 / height);
            const w3 = Math.round(width * scale);
            const h3 = Math.round(height * scale);
            qrCode = scanAtResolution(w3, h3);
          }

          if (qrCode && qrCode.data && qrCode.data.trim()) {
            const rawText = qrCode.data.trim();
            const upi = parseUpiPayload(rawText);
            resolve({
              text: rawText,
              upiDetails: upi,
            });
          } else {
            reject(
              new Error(
                "No valid QR code could be detected in this image. Please ensure the QR code is clearly visible, well-lit, in focus, and not cropped."
              )
            );
          }
        } catch (err) {
          reject(err instanceof Error ? err : new Error("Failed to process QR image."));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image. Please provide a valid JPG, PNG, or WEBP file."));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file from device."));
    };

    reader.readAsDataURL(file);
  });
}
