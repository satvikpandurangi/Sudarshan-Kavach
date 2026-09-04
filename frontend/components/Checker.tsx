"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Analysis } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { decodeQrImage, formatQrAnalysisContent, parseUpiPayload, type QrDecodeResult } from "@/lib/qr-decoder";
import jsQR from "jsqr";

import type { Language } from "@/lib/i18n";

const localizedSampleScenarios: Record<Language, Record<string, string>> = {
  en: {
    "Urgent Bank Scam":
      "URGENT SBI BANK ALERT: Your bank account will be suspended immediately today. Download verified apk at http://192.168.1.1/sbi-verify-login to pay fee and update your netbanking password, OTP and ATM PIN.",
    "Fake KYC Message":
      "SBI ALERT: Your account will be suspended today. Verify KYC immediately at http://sbi-secure-verify-login.xyz and share OTP.",
    "Fake Job Offer":
      "Work from home job. Pay Rs 499 by UPI today and earn guaranteed returns.",
    "Investment Scam":
      "Double your money in 7 days. Send payment now for guaranteed returns.",
    "Safe Link":
      "https://www.rbi.org.in",
  },
  kn: {
    "ತುರ್ತು ಬ್ಯಾಂಕ್ ವಂಚನೆ":
      "ತುರ್ತು SBI ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ಇಂದೇ ಅಮಾನತುಗೊಳಿಸಲಾಗುವುದು. ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು OTP ಅಪ್‌ಡೇಟ್ ಮಾಡಲು ತಕ್ಷಣ http://192.168.1.1/sbi-verify-login ನಲ್ಲಿ APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    "ನಕಲಿ KYC ಸಂದೇಶ":
      "SBI ಸೂಚನೆ: ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಇಂದೇ ನಿರ್ಬಂಧಿಸಲಾಗುತ್ತದೆ. ತಕ್ಷಣ http://sbi-secure-verify-login.xyz ನಲ್ಲಿ KYC ಪರಿಶೀಲಿಸಿ ಮತ್ತು OTP ಹಂಚಿಕೊಳ್ಳಿ.",
    "ನಕಲಿ ಉದ್ಯೋಗ ಕೊಡುಗೆ":
      "ಮನೆಯಿಂದಲೇ ಕೆಲಸ. ಇಂದೇ UPI ಮೂಲಕ ರೂ 499 ಪಾವತಿಸಿ ಮತ್ತು ಖಾತರಿ ಲಾಭ ಪಡೆಯಿರಿ.",
    "ಹೂಡಿಕೆ ವಂಚನೆ":
      "7 ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಹಣವನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಿ. ಖಾತರಿ ಲಾಭಕ್ಕಾಗಿ ಈಗಲೇ ಹಣ ವರ್ಗಾಯಿಸಿ.",
    "ಸುರಕ್ಷಿತ ಲಿಂಕ್":
      "https://www.rbi.org.in",
  },
  hi: {
    "अति-आवश्यक बैंक चेतावनी":
      "अति आवश्यक SBI अलर्ट: आपका बैंक खाता आज ही तुरंत निलंबित कर दिया जाएगा। शुल्क भुगतान और पासवर्ड, OTP तथा ATM पिन अपडेट करने के लिए http://192.168.1.1/sbi-verify-login से सत्यापित ऐप डाउनलोड करें।",
    "फर्जी KYC संदेश":
      "SBI अलर्ट: आपका खाता आज निलंबित कर दिया जाएगा। तुरंत http://sbi-secure-verify-login.xyz पर KYC सत्यापित करें और OTP साझा करें।",
    "फर्जी जॉब ऑफर":
      "घर बैठे काम। आज ही UPI द्वारा 499 रुपये का भुगतान करें और निश्चित दैनिक रिटर्न कमाएं।",
    "निवेश घोटाला":
      "7 दिनों में अपना पैसा दोगुना करें। गारंटीड रिटर्न के लिए अभी पेमेंट भेजें।",
    "सुरक्षित लिंक":
      "https://www.rbi.org.in",
  },
  te: {
    "అత్యవసర బ్యాంక్ హెచ్చరిక":
      "అత్యవసర SBI అలర్ట్: మీ బ్యాంక్ ఖాతా ఈరోజే నిలిపివేయబడుతుంది. నెట్‌బ్యాంకింగ్ పాస్‌వర్డ్, OTP అప్‌డేట్ చేయడానికి http://192.168.1.1/sbi-verify-login నుండి యాప్ డౌన్‌లోడ్ చేయండి.",
    "నకిలీ KYC సందేశం":
      "SBI అలర్ట్: మీ ఖాతా ఈరోజే బ్లాక్ చేయబడుతుంది. వెంటనే http://sbi-secure-verify-login.xyz లో KYC ధృవీకరించండి మరియు OTP పంచుకోండి.",
    "నకిలీ ఉద్యోగ ఆఫర్":
      "ఇంటి నుండి పని చేసే ఉద్యోగం. ఈరోజే UPI ద్వారా రూ. 499 చెల్లించి హామీతో కూడిన రాబడి పొందండి.",
    "పెట్టుబడి మోసం":
      "7 రోజుల్లో మీ డబ్బును రెట్టింపు చేసుకోండి. గ్యారెంటీ రిటర్న్స్ కోసం ఇప్పుడే చెల్లించండి.",
    "సురక్షిత లింక్":
      "https://www.rbi.org.in",
  },
};

export function Checker() {
  const [tab, setTab] = useState<"URL" | "MESSAGE" | "SCREENSHOT" | "QR">("URL");
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // QR Scanning state (Decoded client-side only)
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrDecoding, setQrDecoding] = useState<boolean>(false);
  const [decodedQr, setDecodedQr] = useState<QrDecodeResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [busy, setBusy] = useState(false);
  const [scanningStageIndex, setScanningStageIndex] = useState(0);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { lang, t } = useTranslation();
  const scenarios = localizedSampleScenarios[lang] || localizedSampleScenarios.en;

  // Stop camera on unmount or tab switch
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (tab !== "QR" && cameraActive) {
      stopCamera();
    }
  }, [tab, cameraActive]);

  // Progress scanner stage during analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (busy) {
      setScanningStageIndex(0);
      interval = setInterval(() => {
        setScanningStageIndex((prev) => (prev < t.dashboard.scanningSteps.length - 1 ? prev + 1 : prev));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [busy, t.dashboard.scanningSteps.length]);

  // Load prefill input from Threat Radar if present
  useEffect(() => {
    try {
      const pendingStr = sessionStorage.getItem("sk-pending-check");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.value) setValue(pending.value);
        if (pending.tab) setTab(pending.tab);
        sessionStorage.removeItem("sk-pending-check");
      } else {
        const prefill = sessionStorage.getItem("sk-prefill-input");
        if (prefill) {
          setValue(prefill);
          setTab("MESSAGE");
          sessionStorage.removeItem("sk-prefill-input");
        }
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const createOptimizedPreview = (selectedFile: File, callback: (dataUrl: string) => void) => {
    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 900;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL("image/jpeg", 0.82));
          return;
        }
      } catch {
        // canvas fallback
      }
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(selectedFile);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(selectedFile);
    };
    img.src = url;
  };

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Use a valid image format: JPG, PNG, or WEBP.");
      return;
    }
    if (selected.size > 10485760) {
      setError("Image size must be under 10 MB.");
      return;
    }
    setError("");
    setFile(selected);
    createOptimizedPreview(selected, (preview) => setFilePreview(preview));
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startScanningLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imgData.data, w, h, { inversionAttempts: "dontInvert" });

      if (code && code.data && code.data.trim()) {
        const rawText = code.data.trim();
        const upi = parseUpiPayload(rawText);

        try {
          const previewSnapshot = canvas.toDataURL("image/jpeg", 0.85);
          setQrPreview(previewSnapshot);
        } catch {
          // fallback
        }

        setQrFile(null);
        setDecodedQr({
          text: rawText,
          upiDetails: upi,
        });

        stopCamera();
      }
    }, 150);
  };

  const startCamera = async () => {
    setError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(t.dashboard.qrCameraPermission);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      mediaStreamRef.current = stream;
      setCameraActive(true);
      setDecodedQr(null);
      setQrFile(null);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          startScanningLoop();
        }
      }, 100);
    } catch {
      setError(t.dashboard.qrCameraPermission);
      setCameraActive(false);
    }
  };

  const handleQrFileChange = async (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Use a valid image format: JPG, PNG, or WEBP.");
      return;
    }
    if (selected.size > 10485760) {
      setError("Image size must be under 10 MB.");
      return;
    }
    setError("");
    if (cameraActive) stopCamera();
    setQrFile(selected);
    createOptimizedPreview(selected, (preview) => setQrPreview(preview));

    setQrDecoding(true);
    setDecodedQr(null);
    try {
      const result = await decodeQrImage(selected);
      setDecodedQr(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.dashboard.qrErrorNoCode
      );
      setDecodedQr(null);
    } finally {
      setQrDecoding(false);
    }
  };

  async function submit() {
    setError("");
    let input = value;

    if (tab === "QR") {
      if (!decodedQr || !decodedQr.text) {
        setError(qrFile ? t.dashboard.qrErrorNoCode : "Please upload a photo of a QR code to inspect.");
        return;
      }
      input = formatQrAnalysisContent(decodedQr.text, decodedQr.upiDetails);
    } else if (file) {
      if (!/image\/(jpeg|png|webp)/.test(file.type) || file.size > 5242880) {
        setError("Use a JPG, PNG, or WEBP image under 5 MB.");
        return;
      }
      input = `Image upload: ${file.name}. OCR optical analysis verified threat patterns on screenshot.`;
    }

    if (!input.trim()) {
      setError("Please enter a link, message, or upload an image to inspect.");
      return;
    }

    // Enforce mobile verification login before running security checks
    try {
      const savedUser = JSON.parse(localStorage.getItem("sk-user") || "{}");
      if (!savedUser.mobile) {
        sessionStorage.setItem("sk-pending-check", JSON.stringify({ value: input, tab }));
        router.push("/login?reason=check_required");
        return;
      }
    } catch {
      sessionStorage.setItem("sk-pending-check", JSON.stringify({ value: input, tab }));
      router.push("/login?reason=check_required");
      return;
    }

    setBusy(true);

    try {
      let res: Response;
      if (file && tab === "SCREENSHOT") {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("inputType", tab);
        formData.append("language", lang);
        res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, inputType: tab, language: lang }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const result: Analysis = {
        ...data,
        id: crypto.randomUUID(),
        inputType: tab,
        submitted: tab === "QR" && decodedQr ? `[QR Decoded]: ${decodedQr.text}` : data.extractedText ? `[Screenshot OCR]: ${data.extractedText}` : input,
        createdAt: new Date().toISOString(),
      };

      const existingHistory: Analysis[] = JSON.parse(localStorage.getItem("sk-history") || "[]");
      localStorage.setItem("sk-history", JSON.stringify([result, ...existingHistory].slice(0, 50)));

      router.push(`/result/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis service is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  function loadScenario(name: string) {
    const sampleText = scenarios[name] || "";
    setValue(sampleText);
    setFile(null);
    setFilePreview(null);
    setQrFile(null);
    setQrPreview(null);
    setDecodedQr(null);
    setTab(sampleText.startsWith("http") ? "URL" : "MESSAGE");
  }

  return (
    <div className="card-premium">
      {/* Segmented Input Type Tabs */}
      <div className="segmented-tabs" role="tablist">
        <button
          className={`segmented-tab ${tab === "URL" ? "active" : ""}`}
          onClick={() => {
            setTab("URL");
            setFile(null);
            setFilePreview(null);
          }}
          role="tab"
          aria-selected={tab === "URL"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {t.dashboard.tabUrl}
        </button>

        <button
          className={`segmented-tab ${tab === "MESSAGE" ? "active" : ""}`}
          onClick={() => {
            setTab("MESSAGE");
            setFile(null);
            setFilePreview(null);
          }}
          role="tab"
          aria-selected={tab === "MESSAGE"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {t.dashboard.tabMessage}
        </button>

        <button
          className={`segmented-tab ${tab === "SCREENSHOT" ? "active" : ""}`}
          onClick={() => {
            setTab("SCREENSHOT");
            setError("");
          }}
          role="tab"
          aria-selected={tab === "SCREENSHOT"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          {t.dashboard.tabScreenshot}
        </button>

        <button
          className={`segmented-tab ${tab === "QR" ? "active" : ""}`}
          onClick={() => {
            setTab("QR");
            setError("");
          }}
          role="tab"
          aria-selected={tab === "QR"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="6" height="6" rx="1"></rect>
            <rect x="15" y="3" width="6" height="6" rx="1"></rect>
            <rect x="3" y="15" width="6" height="6" rx="1"></rect>
            <path d="M15 15h2v2h-2z"></path>
            <path d="M19 15h2v6h-6v-2h4v-4z"></path>
            <path d="M15 19h2v2h-2z"></path>
          </svg>
          {t.dashboard.tabQr}
        </button>
      </div>

      {/* Sample Scenario Simulation Helpers */}
      <div className="sample-scenarios">
        <div className="sample-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          {t.dashboard.sampleTitle}
        </div>
        <div className="sample-pills">
          {Object.keys(scenarios).map((key) => (
            <button
              key={key}
              type="button"
              className="sample-pill-btn"
              onClick={() => loadScenario(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Input Surface with Security Laser Scanner Effect */}
      <div className="scanner-container">
        {busy && <div className="scanner-laser" />}

        {tab === "URL" ? (
          <div className="input-wrapper">
            <input
              type="url"
              className="analysis-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.dashboard.urlPlaceholder}
              disabled={busy}
              autoFocus
            />
          </div>
        ) : tab === "MESSAGE" ? (
          <div className="input-wrapper">
            <textarea
              className="analysis-input analysis-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.dashboard.messagePlaceholder}
              disabled={busy}
            />
          </div>
        ) : tab === "SCREENSHOT" ? (
          <div className="input-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            <div
              className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
            >
              {filePreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <img
                    src={filePreview}
                    alt="Screenshot preview"
                    style={{
                      maxHeight: "180px",
                      borderRadius: "12px",
                      objectFit: "contain",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    }}
                  />
                  <p style={{ fontWeight: 700, color: "var(--brand-orange-dark)", fontSize: "0.92rem" }}>
                    ✓ {file?.name} (Click to change)
                  </p>
                </div>
              ) : (
                <>
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{t.dashboard.screenshotDrop}</h4>
                  <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {t.dashboard.screenshotNote}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : tab === "QR" ? (
          <div className="input-wrapper">
            <input
              type="file"
              ref={qrInputRef}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleQrFileChange(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />

            {cameraActive ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "300px",
                  maxHeight: "380px",
                  background: "#0f172a",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />

                {/* Reticle / Viewfinder Frame */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: "210px",
                    height: "210px",
                    border: "2px dashed rgba(249, 115, 22, 0.8)",
                    borderRadius: "16px",
                    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.52)",
                    pointerEvents: "none",
                  }}
                >
                  {/* Glowing Orange Corner Brackets */}
                  <span style={{ position: "absolute", top: -2, left: -2, width: 20, height: 20, borderTop: "3.5px solid #f97316", borderLeft: "3.5px solid #f97316", borderTopLeftRadius: 8 }} />
                  <span style={{ position: "absolute", top: -2, right: -2, width: 20, height: 20, borderTop: "3.5px solid #f97316", borderRight: "3.5px solid #f97316", borderTopRightRadius: 8 }} />
                  <span style={{ position: "absolute", bottom: -2, left: -2, width: 20, height: 20, borderBottom: "3.5px solid #f97316", borderLeft: "3.5px solid #f97316", borderBottomLeftRadius: 8 }} />
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderBottom: "3.5px solid #f97316", borderRight: "3.5px solid #f97316", borderBottomRightRadius: 8 }} />

                  {/* Scanning sweep laser */}
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      right: 6,
                      height: 2,
                      background: "#f97316",
                      boxShadow: "0 0 10px 2px #f97316",
                      animation: "scanLaser 2s ease-in-out infinite alternate",
                    }}
                  />
                </div>

                {/* Top overlay controls */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 16,
                    right: 16,
                    zIndex: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: "rgba(15, 23, 42, 0.78)",
                      backdropFilter: "blur(8px)",
                      padding: "5px 14px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    <span className="pulse-dot" style={{ background: "#22c55e", width: 8, height: 8 }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.03em" }}>
                      {t.dashboard.qrCameraPoint}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{
                      background: "rgba(15, 23, 42, 0.78)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "#ffffff",
                      padding: "5px 14px",
                      borderRadius: "9999px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ✕ {t.dashboard.qrCloseCamera}
                  </button>
                </div>
              </div>
            ) : !decodedQr && !qrDecoding ? (
              <div
                className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
                onClick={() => qrInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleQrFileChange(e.dataTransfer.files[0]);
                  }
                }}
              >
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="3" height="3" rx="0.5"></rect>
                  <rect x="18" y="18" width="3" height="3" rx="0.5"></rect>
                  <rect x="18" y="14" width="3" height="3" rx="0.5"></rect>
                  <rect x="14" y="18" width="3" height="3" rx="0.5"></rect>
                </svg>
                <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{t.dashboard.qrDrop}</h4>
                <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: 16 }}>
                  {t.dashboard.qrNote}
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    style={{
                      padding: "8px 20px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: "9999px",
                      background: "#ffffff",
                      border: "1.5px solid var(--brand-orange)",
                      color: "var(--brand-orange-dark)",
                      boxShadow: "0 2px 8px rgba(249, 115, 22, 0.12)",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    {t.dashboard.qrOpenCamera}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      qrInputRef.current?.click();
                    }}
                    style={{
                      padding: "8px 20px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload QR Image
                  </button>
                </div>
              </div>
            ) : qrDecoding ? (
              <div
                className="upload-dropzone"
                style={{ cursor: "default", background: "var(--brand-orange-light)", borderColor: "var(--brand-orange)" }}
              >
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="QR Code"
                    style={{
                      maxHeight: "140px",
                      borderRadius: "10px",
                      objectFit: "contain",
                      marginBottom: 12,
                      opacity: 0.85,
                    }}
                  />
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "chakraSpin 1.5s linear infinite" }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                  </svg>
                  <span style={{ fontWeight: 700, color: "var(--brand-orange-dark)", fontSize: "0.95rem" }}>
                    {t.dashboard.qrDecoding}
                  </span>
                </div>
              </div>
            ) : decodedQr ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "2px solid #22c55e",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  boxShadow: "0 6px 20px rgba(34, 197, 94, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                  {qrPreview && (
                    <img
                      src={qrPreview}
                      alt="Decoded QR Preview"
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "10px",
                        objectFit: "contain",
                        border: "1px solid var(--border-mid)",
                        background: "#fafafa",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        ✓ QR CODE DECODED
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {qrFile ? `${qrFile.name} (${(qrFile.size / 1024).toFixed(1)} KB)` : "Live Camera Scan"}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        marginBottom: 10,
                      }}
                    >
                      <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                        VERIFICATION PREVIEW
                      </p>
                      <p
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          wordBreak: "break-all",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        Decoded: <span style={{ color: "var(--brand-orange-dark)", fontWeight: 700 }}>{decodedQr.text}</span> — this is what will be checked.
                      </p>
                    </div>

                    {decodedQr.upiDetails && (decodedQr.upiDetails.vpa || decodedQr.upiDetails.amount) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 6,
                          marginBottom: 8,
                          padding: "8px 12px",
                          background: "#fff7ed",
                          borderRadius: "8px",
                          border: "1px solid #fed7aa",
                        }}
                      >
                        {decodedQr.upiDetails.vpa && (
                          <div style={{ fontSize: "0.82rem" }}>
                            <span style={{ color: "#9a3412", fontWeight: 700 }}>{t.dashboard.qrUpiVpaLabel}: </span>
                            <span style={{ fontWeight: 800, color: "#7c2d12" }}>{decodedQr.upiDetails.vpa}</span>
                          </div>
                        )}
                        {decodedQr.upiDetails.amount && (
                          <div style={{ fontSize: "0.82rem" }}>
                            <span style={{ color: "#9a3412", fontWeight: 700 }}>{t.dashboard.qrUpiAmountLabel}: </span>
                            <span style={{ fontWeight: 800, color: "#7c2d12" }}>₹{decodedQr.upiDetails.amount}</span>
                          </div>
                        )}
                        {decodedQr.upiDetails.name && (
                          <div style={{ fontSize: "0.82rem" }}>
                            <span style={{ color: "#9a3412", fontWeight: 700 }}>Merchant: </span>
                            <span style={{ fontWeight: 600, color: "#7c2d12" }}>{decodedQr.upiDetails.name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-link"
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--brand-orange-dark)",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        📷 Scan with Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => qrInputRef.current?.click()}
                        className="text-link"
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        ↻ Upload Different File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Security Processing Stage Badge during Analysis */}
      {busy && (
        <div className="scanner-status-box" aria-live="polite">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: "0.86rem", fontWeight: 800, letterSpacing: "0.08em", color: "#fb923c" }}>
              {t.dashboard.scanningSteps[scanningStageIndex]}
            </span>
          </div>
          <div className="scanner-progress-bar">
            <div className="scanner-progress-fill" />
          </div>
        </div>
      )}

      {/* Submit Action Button */}
      <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <p className="text-muted" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6, margin: 0, flex: 1, minWidth: "260px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>
            {tab === "QR"
              ? t.dashboard.qrPrivacyNote
              : t.dashboard.privacyNote}
          </span>
        </p>

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={busy || (tab === "QR" && !decodedQr)}
          style={{ minWidth: "220px", flexShrink: 0, marginLeft: "auto" }}
        >
          {busy ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "chakraSpin 1.5s linear infinite" }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
              {t.dashboard.analyzingText}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {tab === "URL" ? t.dashboard.btnAnalyzeLink : tab === "QR" ? t.dashboard.btnAnalyzeQr : t.dashboard.btnAnalyzeContent}
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 18,
            padding: "14px 18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            color: "#b91c1c",
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
