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

    if (!/image\/(jpeg|png|webp)/.test(file.type)) {
      reject(new Error("Please upload a valid image file (JPG, PNG, or WEBP)."));
      return;
    }

    if (file.size > 5242880) {
      reject(new Error("Image size exceeds 5 MB limit."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            reject(new Error("Browser canvas context could not be initialized."));
            return;
          }

          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          let qrCode = jsQR(imageData.data, width, height, {
            inversionAttempts: "attemptBoth",
          });

          // Multi-resolution fallback: if high-res phone camera shot fails, downscale to <= 1200px
          if (!qrCode && (width > 1200 || height > 1200)) {
            const maxDim = 1200;
            const scale = Math.min(maxDim / width, maxDim / height);
            const scaledW = Math.round(width * scale);
            const scaledH = Math.round(height * scale);

            const scaledCanvas = document.createElement("canvas");
            scaledCanvas.width = scaledW;
            scaledCanvas.height = scaledH;
            const sCtx = scaledCanvas.getContext("2d", { willReadFrequently: true });
            if (sCtx) {
              sCtx.drawImage(img, 0, 0, scaledW, scaledH);
              const sImgData = sCtx.getImageData(0, 0, scaledW, scaledH);
              qrCode = jsQR(sImgData.data, scaledW, scaledH, {
                inversionAttempts: "attemptBoth",
              });
            }
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
