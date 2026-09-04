"use client";

import { useState, useEffect } from "react";

export type Language = "en" | "kn" | "hi" | "te";

export interface Translations {
  brand: string;
  tagline: string;
  common: {
    devApi: string;
    playbooks: string;
    verifiedSafe: string;
    riskWord: string;
    statusActive: string;
  };
  nav: {
    dashboard: string;
    history: string;
    safety: string;
    profile: string;
    login: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaCheck: string;
    ctaHow: string;
    trustBadge: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    howTitle: string;
    howSubtitle: string;
    howSteps: string[];
    emergencyHeading: string;
    emergencySub: string;
    dial1930: string;
  };
  dashboard: {
    greeting: string;
    title: string;
    subtitle: string;
    privacyNote: string;
    tabUrl: string;
    tabMessage: string;
    tabScreenshot: string;
    tabQr: string;
    urlPlaceholder: string;
    messagePlaceholder: string;
    screenshotDrop: string;
    screenshotNote: string;
    qrDrop: string;
    qrNote: string;
    qrPlaceholder: string;
    qrDecodedMsg: string;
    qrDecoding: string;
    qrErrorNoCode: string;
    qrUpiVpaLabel: string;
    qrUpiAmountLabel: string;
    qrChangePhoto: string;
    qrOpenCamera: string;
    qrCloseCamera: string;
    qrCameraPoint: string;
    qrCameraPermission: string;
    qrPrivacyNote: string;
    sampleTitle: string;
    btnAnalyzeLink: string;
    btnAnalyzeContent: string;
    btnAnalyzeQr: string;
    analyzingText: string;
    scanningSteps: string[];
  };
  radar: {
    eyebrow: string;
    title: string;
    subtitle: string;
    liveBadge: string;
    testBtn: string;
    trends: {
      id: string;
      tag: string;
      name: string;
      severity: "CRITICAL" | "HIGH";
      vector: string;
      sample: string;
      reportedIncrease: string;
      explanation: string;
    }[];
  };
  result: {
    assessmentTitle: string;
    scoreLabel: string;
    confidence: string;
    aiEngine: string;
    verifiedSecurityChecks: string;
    whyFlagged: string;
    evidenceTitle: string;
    actionTitle: string;
    stopDoNotClick: string;
    pauseAndVerify: string;
    proceedWithCaution: string;
    verifyManually: string;
    detectedUrls: string;
    copyReport: string;
    reportCopied: string;
    reportTo1930: string;
    checkAnother: string;
    disclaimer: string;
    safeNotice: string;
    verifiedSafe: string;
    typeLabel: string;
    exportJson: string;
    printEvidence: string;
    reportThreat: string;
    shareResult: string;
    shareDisclaimer: string;
  };
  risk: {
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    UNKNOWN: string;
    CANNOT_DETERMINE: string;
  };
  history: {
    eyebrow: string;
    title: string;
    subtitle: string;
    all: string;
    high: string;
    medium: string;
    low: string;
    emptyTitle: string;
    emptySubtitle: string;
    viewDetails: string;
    clearBtn: string;
  };
  safety: {
    eyebrow: string;
    title: string;
    subtitle: string;
    urgentBadge1930: string;
    urgentBadgePortal: string;
    urgentRule: string;
    timelineTitle: string;
    timelineIntro: string;
    timelineSteps: { step: string; title: string; desc: string; alert?: boolean }[];
    guidesTitle: string;
    playbooks: { id: string; title: string; desc: string }[];
    quizEyebrow: string;
    quizTitle: string;
    quizSubtitle: string;
    flagScamBtn: string;
    markLegitBtn: string;
    rememberTitle: string;
    rememberText: string;
  };
  profile: {
    eyebrow: string;
    title: string;
    accountBadge: string;
    deviceStorageNote: string;
    totalChecks: string;
    highRiskDetected: string;
    mediumRiskDetected: string;
    lowRiskDetected: string;
    recentActivity: string;
    noActivity: string;
    privacyTitle: string;
    privacyDesc: string;
    clearHistoryBtn: string;
    historyCleared: string;
    readinessTitle: string;
    signOutBtn: string;
    authMobileBtn: string;
    noMobileText: string;
  };
  login: {
    title: string;
    subtitle: string;
    fullName: string;
    mobileNumber: string;
    otpCode: string;
    otpCodeNote: string;
    btnContinue: string;
    btnVerify: string;
    authRequiredTitle: string;
    authRequiredDesc: string;
    sentTo: string;
    editNumber: string;
    zeroDbTitle: string;
    zeroDbDesc: string;
    encryptedSession: string;
  };
  whatsappBot: {
    badge: string;
    title: string;
    description: string;
    chatBtn: string;
    sandboxNotice: string;
    howItWorks: string;
  };
  footer: {
    featuresTitle: string;
    featureInspector: string;
    featureDecoder: string;
    featureOcr: string;
    featureQr: string;
    featureHistory: string;
    emergencyTitle: string;
    helpline1930: string;
    portalGov: string;
    recoveryChecklist: string;
    disputeGuide: string;
    apkGuide: string;
    feedTitle: string;
    feedSubtitle: string;
    subscribeBtn: string;
    subscribedMsg: string;
    certIn: string;
    dpdpa: string;
    zeroKnowledge: string;
    sslTls: string;
    builtWith: string;
    rights: string;
    disclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brand: "SUDARSHAN KAVACH",
    tagline: "Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.",
    common: {
      devApi: "Developer API",
      playbooks: "View Incident Playbooks",
      verifiedSafe: "VERIFIED SAFE",
      riskWord: "RISK",
      statusActive: "Engine Active",
    },
    nav: {
      dashboard: "Dashboard",
      history: "History",
      safety: "Safety",
      profile: "Profile",
      login: "Login",
    },
    hero: {
      eyebrow: "AI-POWERED FRAUD DETECTION",
      title: "Your digital",
      highlight: "safety shield.",
      subtitle: "Check suspicious links, messages, and screenshots before you click, pay, share, or trust. AI analysis that shows you the evidence, not just a verdict.",
      ctaCheck: "Check Now",
      ctaHow: "How It Works",
      trustBadge: "Nothing Stored • Links Never Opened • Evidence-Based Analysis",
      feature1Title: "Built for Indian Scam Patterns",
      feature1Desc: "Detection rules written for the scams that actually circulate here: fake KYC and electricity disconnection notices, courier APK traps, digital arrest calls, and fraudulent UPI refund requests.",
      feature2Title: "Links Are Never Opened",
      feature2Desc: "We inspect a URL's structure, domain and destination without visiting it. Nothing is fetched, downloaded, or executed.",
      feature3Title: "Nothing Is Stored",
      feature3Desc: "Your check history stays in your browser. Submitted content is sent to our AI provider for analysis and is not retained by us.",
      howTitle: "How Sudarshan Kavach Protects You",
      howSubtitle: "Simple, explainable, and instantaneous defense in 4 transparent stages.",
      howSteps: [
        "Paste any suspicious SMS, WhatsApp message, URL, or upload a screenshot.",
        "Our engine extracts domain signals, linguistic urgency hooks, and payment endpoints.",
        "Domains are checked against a curated list of official Indian bank, government and payment domains to catch lookalikes.",
        "Get an instantaneous plain-language risk rating with precise evidence and next steps."
      ],
      emergencyHeading: "Already Paid or Shared Confidential Banking Details?",
      emergencySub: "Immediate action within the first 60 minutes ('The Golden Hour') can stop fund settlement and preserve your accounts.",
      dial1930: "Call National Helpline 1930",
    },
    dashboard: {
      greeting: "Welcome",
      title: "Threat Detection Engine",
      subtitle: "Submit suspicious messages, links, or screenshots for immediate analysis.",
      privacyNote: "We never open the link. URLs are inspected as text only.",
      tabUrl: "Link / Domain",
      tabMessage: "SMS / WhatsApp Message",
      tabScreenshot: "Screenshot Upload",
      tabQr: "Scan QR Code",
      urlPlaceholder: "https://secure-bank-verify.xyz/login...",
      messagePlaceholder: "Paste your SMS, WhatsApp, Telegram message, or fake KYC notice here...",
      screenshotDrop: "Drop screenshot here or click to browse",
      screenshotNote: "Supports JPG, PNG, WEBP (Max 5MB). Optical scanner inspects image text locally.",
      qrDrop: "Scan QR with camera or drop photo here",
      qrNote: "Supports live camera scanning or image files (Max 5MB). Decoded in your browser.",
      qrPlaceholder: "Decoded QR code content will appear here...",
      qrDecodedMsg: "Decoded: {payload} — this is what will be checked.",
      qrDecoding: "Decoding QR code in browser...",
      qrErrorNoCode: "No valid QR code could be detected in this image. Please ensure the QR code is clearly visible, well-lit, in focus, and not cropped.",
      qrUpiVpaLabel: "Payee VPA",
      qrUpiAmountLabel: "Requested Amount",
      qrChangePhoto: "Scan / Choose another",
      qrOpenCamera: "Open Camera Scanner",
      qrCloseCamera: "Close Camera",
      qrCameraPoint: "Align QR code inside the frame",
      qrCameraPermission: "Camera access unavailable. Please allow camera access or upload an image instead.",
      qrPrivacyNote: "We decode QR in your browser. Links are inspected without opening.",
      sampleTitle: "SAMPLE THREAT SIMULATIONS",
      btnAnalyzeLink: "Analyze Link Securely",
      btnAnalyzeContent: "Analyze Content Securely",
      btnAnalyzeQr: "Analyze QR Destination Securely",
      analyzingText: "Analyzing Safely...",
      scanningSteps: [
        "PARSING CONTENT & SIGNALS",
        "INSPECTING DOMAINS & PATTERNS",
        "CROSS-REFERENCING FRAUD INDICATORS",
        "EVALUATING FINANCIAL THREAT VECTORS",
        "PREPARING EXPLAINABLE SAFETY REPORT"
      ]
    },
    radar: {
      eyebrow: "CYBER THREAT ADVISORY • ACTIVE CAMPAIGNS",
      title: "Emerging Cyber Threats & Scam Trends",
      subtitle: "Scam formats currently circulating in India, compiled from public advisories. Paste any of these into the analyzer to see how it responds.",
      liveBadge: "Updated Hourly via Global Threat Signatures",
      testBtn: "Test This Scam in Analyzer",
      trends: [
        {
          id: "electricity-bill-scam",
          tag: "UTILITY IMPERSONATION",
          name: "Urgent Electricity Disconnection Notice",
          severity: "HIGH",
          vector: "SMS Spoofing + Fake APK Call Support",
          sample: "Dear Consumer, Your Electricity power will be disconnected tonight at 9:30 PM from the main sub-station office because your previous month bill was not updated. Please immediately call Electricity Verification Officer at 9876543210 to prevent black-out.",
          reportedIncrease: "+410% this Month",
          explanation: "Scammers induce panic about power cuts to make victims download AnyDesk/RustDesk or pay token amounts of Rs 10 via malicious links."
        },
        {
          id: "digital-arrest-cbi",
          tag: "AUDIO/VIDEO EXTORTION",
          name: "TRAI / Mumbai Police 'Digital Arrest'",
          severity: "CRITICAL",
          vector: "Impersonation of Police, CBI & Supreme Court",
          sample: "TRAI ALERT: All mobile numbers under your Aadhaar will be disconnected within 2 hours due to 17 illegal money laundering transactions. Press 9 to connect immediately with Mumbai Crime Branch Officer or face immediate arrest warrant.",
          reportedIncrease: "+520% Nationwide",
          explanation: "Victims are kept on Skype/WhatsApp video calls by actors in fake police stations and coerced into transferring funds into 'RBI verification accounts'."
        },
        {
          id: "sbi-yono-apk",
          tag: "ANDROID MALWARE",
          name: "SBI YONO Netbanking Expire APK",
          severity: "CRITICAL",
          vector: "Fake Banking APKs + SMS Stealer",
          sample: "Dear Customer, Your SBI YONO Account will be blocked today due to pending PAN Card verification. Please install our verified secure bank APK at http://192.168.1.50/sbi-yono-update.apk to maintain seamless service.",
          reportedIncrease: "+280% targeting Netbanking",
          explanation: "Malicious APKs prompt for banking credentials and secretly intercept incoming 2FA SMS OTPs to drain funds."
        },
        {
          id: "telegram-task-scam",
          tag: "PONZI & INVESTMENT FRAUD",
          name: "Work-From-Home YouTube Likes Scheme",
          severity: "HIGH",
          vector: "Guaranteed Daily Returns + Prepaid Tasks",
          sample: "Google Partner Job Opportunity: Earn Rs 2,500 to Rs 8,000 daily simply by liking 3 YouTube videos per task. No experience required. Free registration. Join our official Telegram group now to receive your first Rs 500 bonus immediately.",
          reportedIncrease: "+340% targeting Youth",
          explanation: "Scammers pay small initial amounts to gain trust, then trick victims into depositing lakhs for high-tier 'crypto merchant tasks' with blocked withdrawals."
        }
      ]
    },
    result: {
      assessmentTitle: "Security Risk Assessment",
      scoreLabel: "Risk Score",
      confidence: "Confidence",
      aiEngine: "Security Engine",
      verifiedSecurityChecks: "Verified Security Checks",
      whyFlagged: "Why We Flagged This",
      evidenceTitle: "Exact Evidence & Explanation",
      actionTitle: "Recommended Action",
      stopDoNotClick: "STOP: DO NOT CLICK OR PROCEED",
      pauseAndVerify: "PAUSE & VERIFY BEFORE PROCEEDING",
      proceedWithCaution: "SAFE TO PROCEED — STAY CAUTIOUS",
      verifyManually: "INCONCLUSIVE — VERIFY MANUALLY",
      detectedUrls: "Detected Links & Endpoints",
      copyReport: "Copy Safety Report",
      reportCopied: "Report Copied to Clipboard!",
      reportTo1930: "Report Fraud (1930 / Portal)",
      checkAnother: "Check Another Content",
      disclaimer: "Automated analysis provides advisory guidance. Always verify sensitive requests via official bank/institutional channels.",
      safeNotice: "No significant malicious indicators detected in this content.",
      verifiedSafe: "VERIFIED SAFE",
      typeLabel: "Type",
      exportJson: "Export JSON",
      printEvidence: "Print Evidence",
      reportThreat: "Report Threat",
      shareResult: "Share this result",
      shareDisclaimer: "Opens your own WhatsApp. We never see your contacts.",
    },
    risk: {
      LOW: "SAFE",
      MEDIUM: "SUSPICIOUS",
      HIGH: "DANGEROUS",
      UNKNOWN: "CANNOT DETERMINE",
      CANNOT_DETERMINE: "CANNOT DETERMINE",
    },
    history: {
      eyebrow: "",
      title: "Scan History",
      subtitle: "",
      all: "All Scans",
      high: "High Risk",
      medium: "Medium Risk",
      low: "Safe",
      emptyTitle: "No Scans Yet",
      emptySubtitle: "Scan a link, message, QR code, or screenshot on the dashboard to view your history here.",
      viewDetails: "View Full Report",
      clearBtn: "Clear History",
    },
    safety: {
      eyebrow: "ACT FAST, STAY SAFE",
      title: "National Fraud Safety Center",
      subtitle: "Immediate emergency guidance and verified procedures when something feels suspicious.",
      urgentBadge1930: "National Helpline: 1930",
      urgentBadgePortal: "Official Portal: cybercrime.gov.in",
      urgentRule: "Golden Rule: Cut off all communication immediately",
      timelineTitle: "The Golden Hour: First 30 Minutes Checklist",
      timelineIntro: "Reporting within 30 to 60 minutes of unauthorized financial debit drastically increases the chances of law enforcement freezing the illicit funds in the beneficiary mule account.",
      timelineSteps: [
        {
          step: "01",
          title: "Call 1930 Helpline Immediately",
          desc: "Dial 1930 from any Indian phone to connect directly with the Ministry of Home Affairs National Cybercrime Citizen Financial Fraud Reporting System.",
          alert: true
        },
        {
          step: "02",
          title: "Call Your Bank's Fraud Desk",
          desc: "Immediately freeze your netbanking, debit cards, UPI access, and ask for an urgent transaction recall with your bank's 24x7 toll-free emergency number.",
          alert: false
        },
        {
          step: "03",
          title: "File Formal Complaint on cybercrime.gov.in",
          desc: "Submit your transaction IDs, bank statements, scam SMS screenshots, and fraudulent phone numbers within 24 hours to secure an official NCRP acknowledgment.",
          alert: false
        }
      ],
      guidesTitle: "Incident Recovery Playbooks",
      playbooks: [
        {
          id: "01",
          title: "If You Clicked a Suspicious Link",
          desc: "Close the browser tab immediately. Do not enter OTPs, passwords, or personal details. Clear your browser cookies and check downloaded files for unverified APKs."
        },
        {
          id: "02",
          title: "If You Shared an OTP or PIN",
          desc: "Change your netbanking password, UPI PIN, and ATM PIN instantly using your official bank mobile app. Call your bank fraud desk to block all outward transfers."
        },
        {
          id: "03",
          title: "If Trapped in an Investment or Telegram Scam",
          desc: "Stop depositing more money for 'withdrawal fees' or 'tax clearances'. Take complete screenshots of Telegram chat logs, UPI IDs, and transaction receipts, then report to 1930."
        },
        {
          id: "04",
          title: "If You Installed a Suspicious APK or App",
          desc: "Disconnect your phone from Wi-Fi and cellular mobile data right away. Uninstall the app immediately. Run a reputable antivirus scan, and reset your key financial and email passwords using a different phone or laptop."
        },
        {
          id: "05",
          title: "How to Spot Common Scam Signatures",
          desc: "Pause whenever an unexpected message induces panic ('Account suspended today', 'Electricity bill unpaid, power cut at 9 PM', 'Customs parcel seized', 'Guaranteed daily income from home'). Real agencies don't issue threats over WhatsApp."
        },
        {
          id: "06",
          title: "The Zero-Trust Checking Habit",
          desc: "Never click verification links or call phone numbers embedded within sudden SMS alerts. Always manually navigate to the bank's official website or dial the verified toll-free number printed directly on your bank passbook or debit card."
        }
      ],
      quizEyebrow: "CITIZEN CYBER DEFENSE LAB",
      quizTitle: "Test Your Security Vigilance",
      quizSubtitle: "Can you distinguish legitimate banking and courier communications from high-risk phishing traps?",
      flagScamBtn: "🚨 Flag as Dangerous Scam",
      markLegitBtn: "✓ Mark as Legitimate Alert",
      rememberTitle: "Crucial Rule to Remember",
      rememberText: "Legitimate banks, RBI, police officers, and government agencies will NEVER ask for your OTP, ATM PIN, UPI PIN, or password via phone calls, SMS, or WhatsApp messages.",
    },
    profile: {
      eyebrow: "YOUR SECURITY POSTURE",
      title: "Security Profile",
      accountBadge: "ACTIVE SECURED PROFILE",
      deviceStorageNote: "Your check history is stored in this browser only. Submitted content is sent to our AI provider for analysis and is not stored by us.",
      totalChecks: "Total Scans",
      highRiskDetected: "Threats Blocked",
      mediumRiskDetected: "Suspicious Flagged",
      lowRiskDetected: "Clean Checks",
      recentActivity: "Recent Activity",
      noActivity: "No scans recorded yet. Use the dashboard to perform your first check.",
      privacyTitle: "Privacy & Data Controls",
      privacyDesc: "Purge your on-device analysis logs at any time. This action is immediate and cannot be undone.",
      clearHistoryBtn: "Purge Local History",
      historyCleared: "Your on-device analysis history has been successfully purged.",
      readinessTitle: "SECURITY READINESS",
      signOutBtn: "Sign Out / Switch Number",
      authMobileBtn: "Authenticate Mobile",
      noMobileText: "No Mobile Authenticated",
    },
    login: {
      title: "Continue Securely",
      subtitle: "India (+91) • Secured Access Portal",
      fullName: "Full Name",
      mobileNumber: "Mobile Number",
      otpCode: "One-Time Password (OTP)",
      otpCodeNote: "Enter verification code: 123456 to authenticate.",
      btnContinue: "Continue Securely",
      btnVerify: "Verify & Enter Control Center",
      authRequiredTitle: "Authentication Required to Check",
      authRequiredDesc: "Please verify your mobile number with OTP before running security checks.",
      sentTo: "Sent to",
      editNumber: "Edit Number",
      zeroDbTitle: "Zero Database Retention",
      zeroDbDesc: "Your session and mobile verification remain 100% on this device in browser memory. No user identity or phone numbers are stored in any database.",
      encryptedSession: "Verified 256-bit Encrypted Session",
    },
    whatsappBot: {
      badge: "UPCOMING FEATURE",
      title: "Forward to Verify on WhatsApp",
      description: "Forward any suspicious message or link to WhatsApp and get an instant verdict without installing anything.",
      chatBtn: "Forward to Verify (Upcoming)",
      sandboxNotice: "Inbound forwarding is being built directly without third-party messaging providers to protect user privacy.",
      howItWorks: "1. Forward suspicious SMS or link • 2. AI Threat Engine evaluates in seconds • 3. Instant verdict in your chosen language",
    },
    footer: {
      featuresTitle: "Product Features",
      featureInspector: "Link & URL Threat Inspector",
      featureDecoder: "SMS & WhatsApp Scam Decoder",
      featureOcr: "OCR Screenshot Scanner",
      featureQr: "Financial QR Destination Verifier",
      featureHistory: "Local Browser History",
      emergencyTitle: "Emergency & Legal",
      helpline1930: "National Cyber Helpline 1930",
      portalGov: "cybercrime.gov.in Portal",
      recoveryChecklist: "Golden Hour Recovery Checklist",
      disputeGuide: "UPI & Bank Fraud Dispute Guide",
      apkGuide: "APK Malware Disinfection Steps",
      feedTitle: "Threat Intelligence Feed",
      feedSubtitle: "Get weekly bulletins on emerging UPI traps, fake KYC campaigns, and digital arrest threats.",
      subscribeBtn: "Subscribe",
      subscribedMsg: "✓ Subscribed to Real-Time Threat Advisory.",
      certIn: "CERT-In Threat Aligned",
      dpdpa: "DPDPA 2023 Privacy Compliant",
      zeroKnowledge: "Zero-Knowledge Sandbox",
      sslTls: "256-Bit SSL/TLS Protection",
      builtWith: "Built in India",
      rights: "Sudarshan Kavach AI. All rights reserved.",
      disclaimer: "Disclaimer: Sudarshan Kavach provides advisory guidance based on heuristic and AI analysis. Never share banking OTPs, PINs, or credentials with anyone.",
    }
  },
  kn: {
    brand: "ಸುದರ್ಶನ ಕವಚ",
    tagline: "ಕ್ಲಿಕ್ ಮಾಡುವ, ಪಾವತಿಸುವ ಅಥವಾ ನಂಬುವ ಮುನ್ನ — ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸುರಕ್ಷತಾ ಸಹ-ಪೈಲಟ್‌ನೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",
    common: {
      devApi: "ಡೆವಲಪರ್ API",
      playbooks: "ಘಟನಾ ಚೇತರಿಕೆ ಮಾರ್ಗದರ್ಶಿಗಳು",
      verifiedSafe: "ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷಿತ",
      riskWord: "ಅಪಾಯ",
      statusActive: "ಇಂಜಿನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    },
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      history: "ಇತಿಹಾಸ",
      safety: "ಸುರಕ್ಷತೆ",
      profile: "ಪ್ರೊಫೈಲ್",
      login: "ಲಾಗಿನ್",
    },
    hero: {
      eyebrow: "AI-ಚಾಲಿತ ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ",
      title: "ನಿಮ್ಮ ಡಿಜಿಟಲ್",
      highlight: "ರಕ್ಷಣಾ ಕವಚ.",
      subtitle: "ಕ್ಲಿಕ್ ಮಾಡುವ, ಹಣ ಪಾವತಿಸುವ ಅಥವಾ ಹಂಚಿಕೊಳ್ಳುವ ಮುನ್ನ ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್‌ಗಳು, ಸಂದೇಶಗಳು ಮತ್ತು ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ನೈಜ-ಸಮಯದ ಬೆದರಿಕೆ ಗುಪ್ತಚರ ಬೆಂಬಲಿತವಾಗಿದೆ.",
      ctaCheck: "ಈಗ ಪರಿಶೀಲಿಸಿ",
      ctaHow: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
      trustBadge: "ಯಾವುದನ್ನೂ ಉಳಿಸಲಾಗುವುದಿಲ್ಲ • ಲಿಂಕ್‌ಗಳನ್ನು ಎಂದಿಗೂ ತೆರೆಯಲಾಗುವುದಿಲ್ಲ • ಸಾಕ್ಷ್ಯ ಆಧಾರಿತ ವಿಶ್ಲೇಷಣೆ",
      feature1Title: "ಭಾರತೀಯ ವಂಚನೆ ಮಾದರಿಗಳಿಗಾಗಿ ರಚಿತ",
      feature1Desc: "ಇಲ್ಲಿ ನಿಜವಾಗಿಯೂ ಚಲಾವಣೆಯಲ್ಲಿರುವ ವಂಚನೆಗಳಿಗಾಗಿ ಪತ್ತೆ ನಿಯಮಗಳು: ನಕಲಿ KYC ಮತ್ತು ವಿದ್ಯುತ್ ಕಡಿತ ಸೂಚನೆಗಳು, ಕೊರಿಯರ್ APK ಬಲೆಗಳು, ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್ ಕರೆಗಳು ಮತ್ತು ನಕಲಿ UPI ಮರುಪಾವತಿ ವಿನಂತಿಗಳು.",
      feature2Title: "ಲಿಂಕ್‌ಗಳನ್ನು ಎಂದಿಗೂ ತೆರೆಯಲಾಗುವುದಿಲ್ಲ",
      feature2Desc: "ನಾವು URL ಅನ್ನು ತೆರೆಯದೆಯೇ ಅದರ ರಚನೆ, ಡೊಮೇನ್ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನವನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇವೆ. ಏನನ್ನೂ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ಚಲಾಯಿಸುವುದಿಲ್ಲ.",
      feature3Title: "ಯಾವುದನ್ನೂ ಉಳಿಸಲಾಗುವುದಿಲ್ಲ",
      feature3Desc: "ನಿಮ್ಮ ತಪಾಸಣೆ ಇತಿಹಾಸವು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿಯೇ ಇರುತ್ತದೆ. ಸಲ್ಲಿಸಿದ ವಿಷಯವನ್ನು ವಿಶ್ಲೇಷಣೆಗಾಗಿ ನಮ್ಮ AI ಪೂರೈಕೆದಾರರಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅದನ್ನು ನಾವು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.",
      howTitle: "ಸುದರ್ಶನ ಕವಚ ನಿಮ್ಮನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುತ್ತದೆ",
      howSubtitle: "4 ಸರಳ ಮತ್ತು ಪಾರದರ್ಶಕ ಹಂತಗಳಲ್ಲಿ ತಕ್ಷಣದ ಭದ್ರತೆ.",
      howSteps: [
        "ಯಾವುದೇ ಸಂಶಯಾಸ್ಪದ SMS, ವಾಟ್ಸಾಪ್ ಸಂದೇಶ, ಲಿಂಕ್ ಅಂಟಿಸಿ ಅಥವಾ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
        "ನಮ್ಮ ಇಂಜಿನ್ ಡೊಮೇನ್, ಸಂದೇಶದ ತೀವ್ರತೆ ಮತ್ತು ಪಾವತಿ ವಿವರಗಳನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸುತ್ತದೆ.",
        "ನಕಲಿಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಅಧಿಕೃತ ಭಾರತೀಯ ಬ್ಯಾಂಕ್, ಸರ್ಕಾರಿ ಮತ್ತು ಪಾವತಿ ಡೊಮೇನ್‌ಗಳ ಕ್ಯುರೇಟೆಡ್ ಪಟ್ಟಿಯೊಂದಿಗೆ ಡೊಮೇನ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
        "ಸರಳ ಕನ್ನಡದಲ್ಲಿ ನಿಖರ ಸಾಕ್ಷ್ಯಗಳೊಂದಿಗೆ ಅಪಾಯದ ಮಟ್ಟ ಮತ್ತು ರಕ್ಷಣಾ ಹಂತಗಳನ್ನು ಪಡೆಯಿರಿ."
      ],
      emergencyHeading: "ಈಗಾಗಲೇ ಹಣ ಪಾವತಿಸಿದ್ದೀರಾ ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದೀರಾ?",
      emergencySub: "ಮೊದಲ 60 ನಿಮಿಷಗಳಲ್ಲಿ ('ಗೋಲ್ಡನ್ ಅವರ್') ದೂರು ನೀಡುವುದರಿಂದ ಹಣ ವರ್ಗಾವಣೆಯನ್ನು ನಿಲ್ಲಿಸಬಹುದು.",
      dial1930: "ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ",
    },
    dashboard: {
      greeting: "ಸ್ವಾಗತ",
      title: "ಬೆದರಿಕೆ ಪತ್ತೆ ಇಂಜಿನ್",
      subtitle: "ತಕ್ಷಣದ ಭದ್ರತಾ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಸಂಶಯಾಸ್ಪದ ಸಂದೇಶಗಳು, ಲಿಂಕ್‌ಗಳು ಅಥವಾ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಸಲ್ಲಿಸಿ.",
      privacyNote: "ನಾವು ಎಂದಿಗೂ ಲಿಂಕ್ ತೆರೆಯುವುದಿಲ್ಲ. URLಗಳನ್ನು ಪಠ್ಯವಾಗಿ ಮಾತ್ರ ಪರೀಕ್ಷಿಸಲಾಗುತ್ತದೆ.",
      tabUrl: "ಲಿಂಕ್ / ಡೊಮೇನ್",
      tabMessage: "SMS / ವಾಟ್ಸಾಪ್ ಸಂದೇಶ",
      tabScreenshot: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್",
      tabQr: "QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      urlPlaceholder: "https://secure-bank-verify.xyz/login...",
      messagePlaceholder: "ನಿಮ್ಮ SMS, ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಅಥವಾ ನಕಲಿ KYC ಸೂಚನೆಯನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...",
      screenshotDrop: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಇಲ್ಲಿ ಹಾಕಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಿ",
      screenshotNote: "JPG, PNG, WEBP ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 5MB). ಸ್ಥಳೀಯ ಆಪ್ಟಿಕಲ್ ಸ್ಕ್ಯಾನರ್ ಚಿತ್ರದ ಪಠ್ಯವನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
      qrDrop: "ಕ್ಯಾಮೆರಾದಿಂದ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      qrNote: "ಲೈವ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಇಮೇಜ್ ಫೈಲ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 5MB). ಬ್ರೌಸರ್‌ನಲ್ಲಿಯೇ ಡಿಕೋಡ್ ಮಾಡಲಾಗುತ್ತದೆ.",
      qrPlaceholder: "ಡಿಕೋಡ್ ಮಾಡಲಾದ QR ವಿವರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ...",
      qrDecodedMsg: "ಡಿಕೋಡ್ ಮಾಡಲಾಗಿದೆ: {payload} — ಇದನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
      qrDecoding: "ಬ್ರೌಸರ್‌ನಲ್ಲಿ QR ಕೋಡ್ ಡಿಕೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      qrErrorNoCode: "ಈ ಚಿತ್ರದಲ್ಲಿ ಮಾನ್ಯವಾದ QR ಕೋಡ್ ಕಂಡುಬಂದಿಲ್ಲ. QR ಕೋಡ್ ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಫೋಕಸ್‌ನಲ್ಲಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      qrUpiVpaLabel: "ಸ್ವೀಕರಿಸುವವರ UPI ID (VPA)",
      qrUpiAmountLabel: "ಕೋರಲಾದ ಮೊತ್ತ",
      qrChangePhoto: "ಮತ್ತೊಂದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ / ಆಯ್ಕೆಮಾಡಿ",
      qrOpenCamera: "ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ",
      qrCloseCamera: "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ",
      qrCameraPoint: "QR ಕೋಡ್ ಅನ್ನು ಫ್ರೇಮ್ ಒಳಗೆ ಇರಿಸಿ",
      qrCameraPermission: "ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಅನುಮತಿ ನೀಡಿ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
      qrPrivacyNote: "ನಾವು QR ಅನ್ನು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಡಿಕೋಡ್ ಮಾಡುತ್ತೇವೆ. ಲಿಂಕ್ ತೆರೆಯದೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
      sampleTitle: "ಮಾದರಿ ಬೆದರಿಕೆ ಸನ್ನಿವೇಶಗಳು",
      btnAnalyzeLink: "ಲಿಂಕ್ ಸುರಕ್ಷಿತವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ",
      btnAnalyzeContent: "ವಿಷಯವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ",
      btnAnalyzeQr: "QR ತಾಣವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ",
      analyzingText: "ಸುರಕ್ಷಿತವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      scanningSteps: [
        "ಸಂದೇಶ ಮತ್ತು ಸಂಕೇತಗಳ ಪರಿಶೀಲನೆ",
        "ಡೊಮೇನ್ ಮತ್ತು ಮೋಸದ ಮಾದರಿಗಳ ತಪಾಸಣೆ",
        "ಸೈಬರ್ ಭದ್ರತಾ ಡೇಟಾಬೇಸ್‌ನೊಂದಿಗೆ ತುಲನೆ",
        "ಹಣಕಾಸು ಬೆದರಿಕೆ ಸಂಕೇತಗಳ ಮೌಲ್ಯಮಾಪನ",
        "ವಿವರವಾದ ಸುರಕ್ಷತಾ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ"
      ]
    },
    radar: {
      eyebrow: "ಸೈಬರ್ ಬೆದರಿಕೆ ಎಚ್ಚರಿಕೆ • ಸಕ್ರಿಯ ವಂಚನೆಗಳು",
      title: "ಪ್ರಮುಖ ಸೈಬರ್ ಬೆದರಿಕೆಗಳು ಮತ್ತು ವಂಚನೆ ಟ್ರೆಂಡ್‌ಗಳು",
      subtitle: "ನೈಜ-ಸಮಯದ ಸೈಬರ್ ಭದ್ರತಾ ಮಾಹಿತಿ. ಈ ಸಕ್ರಿಯ ವಂಚನೆ ಸಂದೇಶಗಳನ್ನು ನಮ್ಮ ವಿಶ್ಲೇಷಕದಲ್ಲಿ ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ.",
      liveBadge: "ಜಾಗತಿಕ ಬೆದರಿಕೆ ಮಾಹಿತಿಯೊಂದಿಗೆ ಪ್ರತಿ ಗಂಟೆಗೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ",
      testBtn: "ಈ ವಂಚನೆಯನ್ನು ವಿಶ್ಲೇಷಕದಲ್ಲಿ ಪರೀಕ್ಷಿಸಿ",
      trends: [
        {
          id: "electricity-bill-scam",
          tag: "ಯುಟಿಲಿಟಿ ವಂಚನೆ",
          name: "ತುರ್ತು ವಿದ್ಯುತ್ ಕಡಿತದ ನಕಲಿ ನೋಟಿಸ್",
          severity: "HIGH",
          vector: "SMS ಸ್ಪೂಫಿಂಗ್ + ನಕಲಿ APK ಕರೆ ಬೆಂಬಲ",
          sample: "ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಹಿಂದಿನ ತಿಂಗಳ ಬಿಲ್ ಅಪ್‌ಡೇಟ್ ಆಗದ ಕಾರಣ ಇಂದು ರಾತ್ರಿ 9:30 ಕ್ಕೆ ನಿಮ್ಮ ವಿದ್ಯುತ್ ಕಡಿತಗೊಳ್ಳುತ್ತದೆ. ಕಡಿತ ತಡೆಯಲು ತಕ್ಷಣ 9876543210 ಗೆ ಕರೆ ಮಾಡಿ.",
          reportedIncrease: "ಈ ತಿಂಗಳು +410% ಹೆಚ್ಚಳ",
          explanation: "ವಿದ್ಯುತ್ ಕಡಿತದ ಭಯ ಹುಟ್ಟಿಸಿ AnyDesk ನಂತಹ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಅಥವಾ ಹಣ ಪಾವತಿಸಲು ವಂಚಕರು ಒತ್ತಾಯಿಸುತ್ತಾರೆ."
        },
        {
          id: "digital-arrest-cbi",
          tag: "ಆಡಿಯೋ/ವಿಡಿಯೋ ಬ್ಲಾಕ್‌ಮೇಲ್",
          name: "TRAI / ಮುಂಬೈ ಪೊಲೀಸ್ 'ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್'",
          severity: "CRITICAL",
          vector: "ಪೊಲೀಸ್, CBI ಮತ್ತು ನ್ಯಾಯಾಲಯದ ಹೆಸರಿನಲ್ಲಿ ವಂಚನೆ",
          sample: "TRAI ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆಯಲ್ಲಿ 17 ಅಕ್ರಮ ಹಣ ವರ್ಗಾವಣೆ ಪ್ರಕರಣಗಳು ಪತ್ತೆಯಾಗಿವೆ. ತಕ್ಷಣ ಮುಂಬೈ ಕ್ರೈಮ್ ಬ್ರಾಂಚ್ ಜೊತೆ ಮಾತನಾಡಲು 9 ಒತ್ತಿ ಅಥವಾ ಬಂಧನ ವಾರಂಟ್ ಎದುರಿಸಿ.",
          reportedIncrease: "ದೇಶಾದ್ಯಂತ +520% ಹೆಚ್ಚಳ",
          explanation: "ನಕಲಿ ಪೊಲೀಸ್ ಠಾಣೆಯ ವೀಡಿಯೊ ಕರೆ ಮೂಲಕ ಜನರನ್ನು ಬೆದರಿಸಿ 'ಆರ್‌ಬಿಐ ಪರಿಶೀಲನಾ ಖಾತೆ'ಗೆ ಹಣ ವರ್ಗಾಯಿಸಲು ಬಲವಂತಪಡಿಸುತ್ತಾರೆ."
        },
        {
          id: "sbi-yono-apk",
          tag: "ಆಂಡ್ರಾಯ್ಡ್ ಮಾಲ್ವೇರ್",
          name: "SBI YONO ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ನಕಲಿ APK",
          severity: "CRITICAL",
          vector: "ನಕಲಿ ಬ್ಯಾಂಕಿಂಗ್ ಆಪ್ + SMS ಕಳ್ಳತನ",
          sample: "ಗ್ರಾಹಕರೇ, ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಪರಿಶೀಲನೆ ಬಾಕಿ ಇರುವುದರಿಂದ ನಿಮ್ಮ SBI ಖಾತೆಯನ್ನು ಇಂದು ನಿರ್ಬಂಧಿಸಲಾಗುತ್ತದೆ. ಸೇವೆ ಮುಂದುವರಿಸಲು http://192.168.1.50/sbi-yono-update.apk ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.",
          reportedIncrease: "ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್ ಮೇಲೆ +280% ದಾಳಿ",
          explanation: "ನಕಲಿ APK ನಿಮ್ಮ ಲಾಗಿನ್ ವಿವರಗಳನ್ನು ಕದ್ದು, ಬರುವ ಬ್ಯಾಂಕಿಂಗ್ OTP ಗಳನ್ನು ರಹಸ್ಯವಾಗಿ ಫಾರ್ವರ್ಡ್ ಮಾಡುತ್ತದೆ."
        },
        {
          id: "telegram-task-scam",
          tag: "ಹೂಡಿಕೆ ವಂಚನೆ",
          name: "ಮನೆಯಿಂದಲೇ ಕೆಲಸ: ಯೂಟ್ಯೂಬ್ ಲೈಕ್ ವಂಚನೆ",
          severity: "HIGH",
          vector: "ಖಾತರಿ ದೈನಂದಿನ ಆದಾಯ + ಪ್ರಿಪೇಯ್ಡ್ ಟಾಸ್ಕ್‌ಗಳು",
          sample: "ಗೂಗಲ್ ಪಾರ್ಟ್ನರ್ ಉದ್ಯೋಗಾವಕಾಶ: ದಿನಕ್ಕೆ 3 ವೀಡಿಯೊಗಳನ್ನು ಲೈಕ್ ಮಾಡಿ ರೂ 2,500 ರಿಂದ ರೂ 8,000 ಸಂಪಾದಿಸಿ. ರೂ 500 ಬೋನಸ್ ಪಡೆಯಲು ನಮ್ಮ ಟೆಲಿಗ್ರಾಮ್ ಗ್ರೂಪ್ ಸೇರಿಕೊಳ್ಳಿ.",
          reportedIncrease: "ಯುವಕರನ್ನು ಗುರಿಯಾಗಿಸಿ +340% ಹೆಚ್ಚಳ",
          explanation: "ಮೊದಲು ಸಣ್ಣ ಲಾಭ ನೀಡಿ ನಂಬಿಕೆ ಗಳಿಸಿ, ನಂತರ ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ಠೇವಣಿ ಇಡಿಸಿಕೊಂಡು ಹಣವನ್ನು ತಡೆಹಿಡಿಯುತ್ತಾರೆ."
        }
      ]
    },
    result: {
      assessmentTitle: "ಭದ್ರತಾ ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ",
      scoreLabel: "ಅಪಾಯದ ಅಂಕ",
      confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",
      aiEngine: "ಭದ್ರತಾ ಇಂಜಿನ್",
      verifiedSecurityChecks: "ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷತಾ ತಪಾಸಣೆಗಳು",
      whyFlagged: "ಇದನ್ನು ಏಕೆ ಗುರುತಿಸಲಾಗಿದೆ",
      evidenceTitle: "ನಿಖರ ಪುರಾವೆ ಮತ್ತು ವಿವರಣೆ",
      actionTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
      stopDoNotClick: "ನಿಲ್ಲಿಸಿ: ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಮುಂದುವರಿಯಬೇಡಿ",
      pauseAndVerify: "ಮುಂದುವರಿಯುವ ಮುನ್ನ ಪರಿಶೀಲಿಸಿ",
      proceedWithCaution: "ಮುಂದುವರಿಯಲು ಸುರಕ್ಷಿತ — ಜಾಗರೂಕರಾಗಿರಿ",
      verifyManually: "ಅನಿರ್ದಿಷ್ಟ — ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲಿಸಿ",
      detectedUrls: "ಪತ್ತೆಯಾದ ಲಿಂಕ್‌ಗಳು",
      copyReport: "ವರದಿ ನಕಲಿಸಿ",
      reportCopied: "ವರದಿಯನ್ನು ನಕಲಿಸಲಾಗಿದೆ!",
      reportTo1930: "ವಂಚನೆ ವರದಿ ಮಾಡಿ (1930 / ಪೋರ್ಟಲ್)",
      checkAnother: "ಇನ್ನೊಂದನ್ನು ಪರಿಶೀಲಿಸಿ",
      disclaimer: "ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯು ಸಲಹಾತ್ಮಕ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತದೆ. ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಮೂಲಗಳ ಮೂಲಕ ಯಾವಾಗಲೂ ಪರಿಶೀಲಿಸಿ.",
      safeNotice: "ಈ ವಿಷಯದಲ್ಲಿ ಯಾವುದೇ ಗಮನಾರ್ಹ ದುರುದ್ದೇಶಪೂರಿತ ಸಂಕೇತಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ.",
      verifiedSafe: "ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷಿತ",
      typeLabel: "ಮಾದರಿ",
      exportJson: "JSON ರಫ್ತು ಮಾಡಿ",
      printEvidence: "ಸಾಕ್ಷ್ಯ ಮುದ್ರಿಸಿ",
      reportThreat: "ಬೆದರಿಕೆ ವರದಿ ಮಾಡಿ",
      shareResult: "ಈ ಫಲಿತಾಂಶವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
      shareDisclaimer: "ನಿಮ್ಮ ಸ್ವಂತ WhatsApp ತೆರೆಯುತ್ತದೆ. ನಾವು ನಿಮ್ಮ ಸಂಪರ್ಕಗಳನ್ನು ಎಂದಿಗೂ ನೋಡುವುದಿಲ್ಲ.",
    },
    risk: {
      LOW: "ಸುರಕ್ಷಿತ",
      MEDIUM: "ಅನುಮಾನಾಸ್ಪದ",
      HIGH: "ಅಪಾಯಕಾರಿ",
      UNKNOWN: "ಅನಿರ್ದಿಷ್ಟ",
      CANNOT_DETERMINE: "ಅನಿರ್ದಿಷ್ಟ",
    },
    history: {
      eyebrow: "",
      title: "ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ",
      subtitle: "",
      all: "ಎಲ್ಲಾ ಸ್ಕ್ಯಾನ್‌ಗಳು",
      high: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
      medium: "ಮಧ್ಯಮ ಅಪಾಯ",
      low: "ಸುರಕ್ಷಿತ",
      emptyTitle: "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ",
      emptySubtitle: "ನಿಮ್ಮ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಲು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಲಿಂಕ್, ಸಂದೇಶ ಅಥವಾ QR ಕೋಡ್ ಅನ್ನು ಪರಿಶೀಲಿಸಿ.",
      viewDetails: "ಸಂಪೂರ್ಣ ವರದಿ ನೋಡಿ",
      clearBtn: "ಇತಿಹಾಸ ಅಳಿಸಿ",
    },
    safety: {
      eyebrow: "ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ, ಸುರಕ್ಷಿತವಾಗಿರಿ",
      title: "ರಾಷ್ಟ್ರೀಯ ವಂಚನೆ ಸುರಕ್ಷತಾ ಕೇಂದ್ರ",
      subtitle: "ಸಂಶಯ ಉಂಟಾದಾಗ ತುರ್ತು ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಅಧಿಕೃತ ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆಗಳು.",
      urgentBadge1930: "ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ: 1930",
      urgentBadgePortal: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್: cybercrime.gov.in",
      urgentRule: "ಚಿನ್ನದ ನಿಯಮ: ಎಲ್ಲಾ ಸಂವಹನಗಳನ್ನು ತಕ್ಷಣ ಕಡಿತಗೊಳಿಸಿ",
      timelineTitle: "ಗೋಲ್ಡನ್ ಅವರ್: ಮೊದಲ 30 ನಿಮಿಷಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
      timelineIntro: "ಅನಧಿಕೃತ ಹಣ ಕಡಿತವಾದ 30 ರಿಂದ 60 ನಿಮಿಷಗಳಲ್ಲಿ ವರದಿ ಮಾಡುವುದರಿಂದ ಪೊಲೀಸರು ವಂಚಕರ ಖಾತೆಯನ್ನು ತಕ್ಷಣ ಫ್ರೀಜ್ ಮಾಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚಾಗುತ್ತದೆ.",
      timelineSteps: [
        {
          step: "01",
          title: "ತಕ್ಷಣ 1930 ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ",
          desc: "ಗೃಹ ಸಚಿವಾಲಯದ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ವರದಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ಯಾವುದೇ ಫೋನ್‌ನಿಂದ 1930 ಗೆ ಡಯಲ್ ಮಾಡಿ.",
          alert: true
        },
        {
          step: "02",
          title: "ನಿಮ್ಮ ಬ್ಯಾಂಕಿನ ವಂಚನೆ ವಿಭಾಗಕ್ಕೆ ಕರೆ ಮಾಡಿ",
          desc: "ನಿಮ್ಮ ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್, ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು UPI ಅನ್ನು ತಕ್ಷಣ ಬ್ಲಾಕ್ ಮಾಡಿ ಮತ್ತು ಹಣ ಹಿಂಪಡೆಯಲು ವಿನಂತಿಸಿ.",
          alert: false
        },
        {
          step: "03",
          title: "cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ",
          desc: "ಅಧಿಕೃತ NCRP ಸ್ವೀಕೃತಿಯನ್ನು ಪಡೆಯಲು ವಹಿವಾಟು ಐಡಿಗಳು ಮತ್ತು ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳೊಂದಿಗೆ 24 ಗಂಟೆಗಳ ಒಳಗೆ ದೂರು ದಾಖಲಿಸಿ.",
          alert: false
        }
      ],
      guidesTitle: "ಘಟನಾ ಚೇತರಿಕೆ ಮಾರ್ಗದರ್ಶಿಗಳು",
      playbooks: [
        {
          id: "01",
          title: "ಸಂಶಯಾಸ್ಪದ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿದ್ದರೆ",
          desc: "ಬ್ರೌಸರ್ ಟ್ಯಾಬ್ ಅನ್ನು ತಕ್ಷಣ ಮುಚ್ಚಿ. OTP, ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ನಮೂದಿಸಬೇಡಿ. ಕುಕೀಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ."
        },
        {
          id: "02",
          title: "OTP ಅಥವಾ PIN ಹಂಚಿಕೊಂಡಿದ್ದರೆ",
          desc: "ಬ್ಯಾಂಕ್ ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಿ ತಕ್ಷಣ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು UPI ಪಿನ್ ಬದಲಾಯಿಸಿ. ಎಲ್ಲಾ ವರ್ಗಾವಣೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲು ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ."
        },
        {
          id: "03",
          title: "ಹೂಡಿಕೆ ಅಥವಾ ಟೆಲಿಗ್ರಾಮ್ ವಂಚನೆಗೆ ಸಿಲುಕಿದ್ದರೆ",
          desc: "ಹೆಚ್ಚಿನ ಹಣವನ್ನು ಠೇವಣಿ ಮಾಡಬೇಡಿ. ಚಾಟ್ ಲಾಗ್‌ಗಳು ಮತ್ತು ವಹಿವಾಟು ರಶೀದಿಗಳ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ತೆಗೆದುಕೊಂಡು 1930 ಗೆ ವರದಿ ಮಾಡಿ."
        },
        {
          id: "04",
          title: "ಸಂಶಯಾಸ್ಪದ APK ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿದ್ದರೆ",
          desc: "ಫೋನ್‌ನಿಂದ ವೈ-ಫೈ ಮತ್ತು ಡೇಟಾವನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ. ಅಪ್ಲಿಕೇಶನ್ ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ ಮತ್ತು ಇತರ ಸಾಧನದಿಂದ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ."
        },
        {
          id: "05",
          title: "ಸಾಮಾನ್ಯ ವಂಚನೆಗಳನ್ನು ಹೇಗೆ ಗುರುತಿಸುವುದು",
          desc: "ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳನ್ನು ಗಮನಿಸಿ ('ಇಂದೇ ಖಾತೆ ಅಮಾನತು', 'ವಿದ್ಯುತ್ ಕಡಿತ'). ಯಾವುದೇ ನೈಜ ಸರ್ಕಾರಿ ಸಂಸ್ಥೆಗಳು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಬೆದರಿಕೆ ಹಾಕುವುದಿಲ್ಲ."
        },
        {
          id: "06",
          title: "ಶೂನ್ಯ-ನಂಬಿಕೆಯ ಪರಿಶೀಲನಾ ಅಭ್ಯಾಸ",
          desc: "SMS ನಲ್ಲಿ ಬರುವ ಲಿಂಕ್‌ಗಳನ್ನು ಎಂದಿಗೂ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ. ಯಾವಾಗಲೂ ನಿಮ್ಮ ಪಾಸ್‌ಬುಕ್‌ನಲ್ಲಿರುವ ಅಧಿಕೃತ ಟೋಲ್-ಫ್ರೀ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ."
        }
      ],
      quizEyebrow: "ನಾಗರಿಕ ಸೈಬರ್ ರಕ್ಷಣಾ ಪ್ರಯೋಗಾಲಯ",
      quizTitle: "ನಿಮ್ಮ ಭದ್ರತಾ ಜಾಗರೂಕತೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ",
      quizSubtitle: "ನೈಜ ಬ್ಯಾಂಕ್ ಸಂದೇಶಗಳು ಮತ್ತು ಅಪಾಯಕಾರಿ ಫಿಶಿಂಗ್ ಬಲೆಗಳನ್ನು ನೀವು ಗುರುತಿಸಬಲ್ಲಿರಾ?",
      flagScamBtn: "🚨 ಅಪಾಯಕಾರಿ ವಂಚನೆ ಎಂದು ಗುರುತಿಸಿ",
      markLegitBtn: "✓ ಅಧಿಕೃತ ಸಂದೇಶ ಎಂದು ಗುರುತಿಸಿ",
      rememberTitle: "ನೆನಪಿಡಬೇಕಾದ ಪ್ರಮುಖ ನಿಯಮ",
      rememberText: "ಅಧಿಕೃತ ಬ್ಯಾಂಕುಗಳು, ಆರ್‌ಬಿಐ ಅಥವಾ ಪೊಲೀಸರು ಎಂದಿಗೂ ಫೋನ್ ಕರೆ ಅಥವಾ ಸಂದೇಶಗಳ ಮೂಲಕ ನಿಮ್ಮ OTP, ATM PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಕೇಳುವುದಿಲ್ಲ.",
    },
    profile: {
      eyebrow: "ನಿಮ್ಮ ಭದ್ರತಾ ಸ್ಥಿತಿ",
      title: "ಭದ್ರತಾ ಪ್ರೊಫೈಲ್",
      accountBadge: "ಸಕ್ರಿಯ ಸಂರಕ್ಷಿತ ಪ್ರೊಫೈಲ್",
      deviceStorageNote: "ನಿಮ್ಮ ವಿಶ್ಲೇಷಣಾ ದಾಖಲೆಗಳನ್ನು ಈ ಸಾಧನದ ಬ್ರೌಸರ್ ಮೆಮೊರಿಯಲ್ಲಿ ಮಾತ್ರ ಖಾಸಗಿಯಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ. ಸರ್ವರ್‌ನಲ್ಲಿ ಏನೂ ಉಳಿಯುವುದಿಲ್ಲ.",
      totalChecks: "ಒಟ್ಟು ಪರಿಶೀಲನೆಗಳು",
      highRiskDetected: "ತಡೆಹಿಡಿದ ಬೆದರಿಕೆಗಳು",
      mediumRiskDetected: "ಸಂಶಯಾಸ್ಪದ ಎಚ್ಚರಿಕೆಗಳು",
      lowRiskDetected: "ಸುರಕ್ಷಿತ ಸ್ಕ್ಯಾನ್‌ಗಳು",
      recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
      noActivity: "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ದಾಖಲಾಗಿಲ್ಲ.",
      privacyTitle: "ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ ನಿಯಂತ್ರಣ",
      privacyDesc: "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿರುವ ಇತಿಹಾಸವನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸಬಹುದು.",
      clearHistoryBtn: "ಇತಿಹಾಸ ಅಳಿಸಿ",
      historyCleared: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ಇತಿಹಾಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
      readinessTitle: "ಸುರಕ್ಷತಾ ಸನ್ನದ್ಧತೆ",
      signOutBtn: "ಲಾಗ್ ಔಟ್ / ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ",
      authMobileBtn: "ಮೊಬೈಲ್ ದೃಢೀಕರಿಸಿ",
      noMobileText: "ಮೊಬೈಲ್ ದೃಢೀಕರಿಸಲಾಗಿಲ್ಲ",
    },
    login: {
      title: "ಸುರಕ್ಷಿತವಾಗಿ ಮುಂದುವರಿಯಿರಿ",
      subtitle: "ಭಾರತ (+91) • ಸುರಕ್ಷಿತ ಪ್ರವೇಶ",
      fullName: "ಪೂರ್ಣ ಹೆಸರು",
      mobileNumber: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      otpCode: "ಒನ್-ಟೈಮ್ ಪಾಸ್‌ವರ್ಡ್ (OTP)",
      otpCodeNote: "ದೃಢೀಕರಿಸಲು ಪರಿಶೀಲನಾ ಕೋಡ್ 123456 ಅನ್ನು ನಮೂದಿಸಿ.",
      btnContinue: "ಮುಂದುವರಿಯಿರಿ",
      btnVerify: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ಪ್ರವೇಶಿಸಿ",
      authRequiredTitle: "ಪರಿಶೀಲನೆಗೆ ಮೊಬೈಲ್ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ",
      authRequiredDesc: "ಭದ್ರತಾ ತಪಾಸಣೆ ನಡೆಸುವ ಮುನ್ನ ದಯವಿಟ್ಟು OTP ಮೂಲಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ದೃಢೀಕರಿಸಿ.",
      sentTo: "ಕಳುಹಿಸಲಾಗಿದೆ",
      editNumber: "ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ",
      zeroDbTitle: "ಶೂನ್ಯ ಡೇಟಾಬೇಸ್ ಸಂಗ್ರಹಣೆ",
      zeroDbDesc: "ನಿಮ್ಮ ಸೆಷನ್ ಮತ್ತು ಪರಿಶೀಲನೆ 100% ಈ ಸಾಧನದ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಇರುತ್ತದೆ. ನಿಮ್ಮ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ನಮ್ಮ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾಗುವುದಿಲ್ಲ.",
      encryptedSession: "ಪರಿಶೀಲಿಸಿದ 256-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಸೆಷನ್",
    },
    whatsappBot: {
      badge: "ಮುಂದಿನ ವೈಶಿಷ್ಟ್ಯ",
      title: "ಪರಿಶೀಲನೆಗಾಗಿ WhatsApp ಗೆ ಫಾರ್ವರ್ಡ್ ಮಾಡಿ",
      description: "ಯಾವುದೇ ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ ಅಥವಾ ಲಿಂಕ್ ಅನ್ನು WhatsApp ನಲ್ಲಿ ಫಾರ್ವರ್ಡ್ ಮಾಡಿ ಮತ್ತು ಯಾವುದೇ ಆ್ಯಪ್ ಇಲ್ಲದೆ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ತೀರ್ಪು ಪಡೆಯಿರಿ.",
      chatBtn: "ಪರಿಶೀಲಿಸಲು ಫಾರ್ವರ್ಡ್ ಮಾಡಿ (ಶೀಘ್ರದಲ್ಲೇ)",
      sandboxNotice: "ಬಳಕೆದಾರರ ಗೌಪ್ಯತೆಯನ್ನು ರಕ್ಷಿಸಲು ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸಂದೇಶ ಪೂರೈಕೆದಾರರಿಲ್ಲದೆ ಇದನ್ನು ನೇರವಾಗಿ ನಿರ್ಮಿಸಲಾಗುತ್ತಿದೆ.",
      howItWorks: "1. ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ ಫಾರ್ವರ್ಡ್ ಮಾಡಿ • 2. ಸುದರ್ಶನ ಇಂಜಿನ್ ವಿಶ್ಲೇಷಿಸುತ್ತದೆ • 3. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲೇ ತ್ವರಿತ ಎಚ್ಚರಿಕೆ ತೀರ್ಪು",
    },
    footer: {
      featuresTitle: "ಉತ್ಪನ್ನ ವೈಶಿಷ್ಟ್ಯಗಳು",
      featureInspector: "ಲಿಂಕ್ ಮತ್ತು URL ಬೆದರಿಕೆ ತಪಾಸಣೆ",
      featureDecoder: "SMS ಮತ್ತು ವಾಟ್ಸಾಪ್ ವಂಚನೆ ಡಿಕೋಡರ್",
      featureOcr: "OCR ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಸ್ಕ್ಯಾನರ್",
      featureQr: "ಹಣಕಾಸು QR ಗಮ್ಯಸ್ಥಾನ ಪರಿಶೀಲಕ",
      featureHistory: "ಸ್ಥಳೀಯ ಬ್ರೌಸರ್ ಇತಿಹಾಸ",
      emergencyTitle: "ತುರ್ತು ಮತ್ತು ಕಾನೂನು ನೆರವು",
      helpline1930: "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930",
      portalGov: "cybercrime.gov.in ಪೋರ್ಟಲ್",
      recoveryChecklist: "ಗೋಲ್ಡನ್ ಅವರ್ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
      disputeGuide: "UPI ಮತ್ತು ಬ್ಯಾಂಕ್ ವಂಚನೆ ವಿವಾದ ಮಾರ್ಗದರ್ಶಿ",
      apkGuide: "APK ಮಾಲ್ವೇರ್ ನಿರ್ಮೂಲನ ಹಂತಗಳು",
      feedTitle: "ಬೆದರಿಕೆ ಮಾಹಿತಿ ಬುಲೆಟಿನ್",
      feedSubtitle: "ಹೊಸ UPI ಬಲೆಗಳು, ನಕಲಿ KYC ಅಭಿಯಾನಗಳು ಮತ್ತು ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್ ಬೆದರಿಕೆಗಳ ಕುರಿತು ಸಾಪ್ತಾಹಿಕ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
      subscribeBtn: "ಚಂದಾದಾರರಾಗಿ",
      subscribedMsg: "✓ ನೈಜ ಸಮಯದ ಬೆದರಿಕೆ ಸಲಹೆಗೆ ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ.",
      certIn: "CERT-In ಬೆದರಿಕೆ ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ",
      dpdpa: "DPDPA 2023 ಗೌಪ್ಯತೆ ನಿಯಮಗಳಿಗೆ ಬದ್ಧವಾಗಿದೆ",
      zeroKnowledge: "ಶೂನ್ಯ-ಜ್ಞಾನ ಪ್ರತ್ಯೇಕ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್",
      sslTls: "256-ಬಿಟ್ SSL/TLS ಭದ್ರತೆ",
      builtWith: "ಜಾಗತಿಕ ಸೈಬರ್ ರಕ್ಷಣೆಗಾಗಿ 🇮🇳 ನಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ",
      rights: "ಸುದರ್ಶನ ಕವಚ AI. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
      disclaimer: "ಹಕ್ಕುತ್ಯಾಗ: ಸುದರ್ಶನ ಕವಚವು ತಾಂತ್ರಿಕ ಮತ್ತು AI ವಿಶ್ಲೇಷಣೆಯ ಆಧಾರದ ಮೇಲೆ ಸಲಹಾ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಬ್ಯಾಂಕಿಂಗ್ OTP ಅಥವಾ PIN ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
    }
  },
  hi: {
    brand: "सुदर्शन कवच",
    tagline: "क्लिक करने, भुगतान करने या विश्वास करने से पहले — अपने डिजिटल सुरक्षा साथी से जांचें।",
    common: {
      devApi: "डेवलपर API",
      playbooks: "घटना रिकवरी गाइड",
      verifiedSafe: "सत्यापित सुरक्षित",
      riskWord: "जोखिम",
      statusActive: "इंजन सक्रिय है",
    },
    nav: {
      dashboard: "डैशबोर्ड",
      history: "इतिहास",
      safety: "सुरक्षा",
      profile: "प्रोफ़ाइल",
      login: "लॉगिन",
    },
    hero: {
      eyebrow: "AI-संचालित धोखाधड़ी पहचान",
      title: "आपका डिजिटल",
      highlight: "सुरक्षा कवच।",
      subtitle: "क्लिक करने, भुगतान करने या साझा करने से पहले संदिग्ध लिंक, संदेश और स्क्रीनशॉट की तुरंत जांच करें। वास्तविक समय की थ्रेट इंटेलिजेंस द्वारा संचालित।",
      ctaCheck: "अभी जांचें",
      ctaHow: "यह कैसे काम करता है",
      trustBadge: "कुछ भी सहेजा नहीं जाता • लिंक कभी नहीं खोले जाते • साक्ष्य-आधारित विश्लेषण",
      feature1Title: "भारतीय धोखाधड़ी पैटर्न के लिए निर्मित",
      feature1Desc: "यहाँ वास्तव में चलने वाले घोटालों के लिए डिटेक्शन नियम: फर्जी KYC और बिजली बिल कटौती नोटिस, कूरियर APK ट्रैप, डिजिटल अरेस्ट कॉल और फर्जी UPI रिफंड अनुरोध।",
      feature2Title: "लिंक कभी नहीं खोले जाते",
      feature2Desc: "हम किसी URL को खोले बिना उसकी संरचना, डोमेन और गंतव्य की जांच करते हैं। कुछ भी फ़ेच, डाउनलोड या निष्पादित नहीं किया जाता है।",
      feature3Title: "कुछ भी सहेजा नहीं जाता",
      feature3Desc: "आपका जांच इतिहास आपके ब्राउज़र में रहता है। सबमिट की गई सामग्री विश्लेषण के लिए हमारे AI प्रदाता को भेजी जाती है और हमारे द्वारा सहेजी नहीं जाती है।",
      howTitle: "सुदर्शन कवच आपकी सुरक्षा कैसे करता है",
      howSubtitle: "4 सरल और पारदर्शी चरणों में त्वरित और सटीक सुरक्षा।",
      howSteps: [
        "कोई भी संदिग्ध SMS, व्हाट्सएप संदेश, URL पेस्ट करें या स्क्रीनशॉट अपलोड करें।",
        "हमारा इंजन डोमेन विवरण, तात्कालिकता के संकेत और भुगतान विवरणों की जांच करता है।",
        "मिलते-जुलते फर्जी डोमेन पकड़ने के लिए आधिकारिक भारतीय बैंक, सरकारी और भुगतान डोमेन की चुनिंदा सूची से मिलान किया जाता है।",
        "स्पष्ट हिंदी में सटीक सबूतों के साथ जोखिम रेटिंग और बचाव के उपाय प्राप्त करें।"
      ],
      emergencyHeading: "क्या आपने पहले ही भुगतान कर दिया है या बैंकिंग विवरण साझा किए हैं?",
      emergencySub: "अनधिकृत डेबिट के पहले 60 मिनट ('गोल्डन आवर') के भीतर शिकायत करने से अपराधी के खाते में धन फ्रीज करने में मदद मिलती है।",
      dial1930: "राष्ट्रीय हेल्पलाइन 1930 पर कॉल करें",
    },
    dashboard: {
      greeting: "स्वागत है",
      title: "खतरा पहचान इंजन",
      subtitle: "तत्काल सुरक्षा विश्लेषण के लिए संदिग्ध संदेश, लिंक या स्क्रीनशॉट दर्ज करें।",
      privacyNote: "हम कभी भी लिंक नहीं खोलते। URL का केवल टेक्स्ट के रूप में विश्लेषण किया जाता है।",
      tabUrl: "लिंक / डोमेन",
      tabMessage: "SMS / व्हाट्सएप संदेश",
      tabScreenshot: "स्क्रीनशॉट अपलोड",
      tabQr: "QR कोड स्कैन करें",
      urlPlaceholder: "https://secure-bank-verify.xyz/login...",
      messagePlaceholder: "अपना संदिग्ध SMS, व्हाट्सएप संदेश या बैंक केवाईसी नोटिस यहां पेस्ट करें...",
      screenshotDrop: "स्क्रीनशॉट यहां खींचें या ब्राउज़ करें",
      screenshotNote: "JPG, PNG, WEBP समर्थित (अधिकतम 5MB)। ऑप्टिकल स्कैनर स्थानीय रूप से छवि की जांच करता है।",
      qrDrop: "कैमरे से QR स्कैन करें या फोटो अपलोड करें",
      qrNote: "लाइव कैमरा या इमेज फाइल समर्थित (अधिकतम 5MB)। आपके ब्राउज़र में डिकोड किया जाता है।",
      qrPlaceholder: "डिकोड की गई QR सामग्री यहां दिखाई देगी...",
      qrDecodedMsg: "डिकोड किया गया: {payload} — इसकी जांच की जाएगी।",
      qrDecoding: "ब्राउज़र में QR कोड डिकोड किया जा रहा है...",
      qrErrorNoCode: "इस छवि में कोई वैध QR कोड नहीं मिला। कृपया सुनिश्चित करें कि QR कोड स्पष्ट और फोकस में हो।",
      qrUpiVpaLabel: "प्राप्तकर्ता UPI ID (VPA)",
      qrUpiAmountLabel: "अनुरोधित राशि",
      qrChangePhoto: "दूसरा स्कैन / फोटो चुनें",
      qrOpenCamera: "कैमरा स्कैनर खोलें",
      qrCloseCamera: "कैमरा बंद करें",
      qrCameraPoint: "QR कोड को फ्रेम के अंदर रखें",
      qrCameraPermission: "कैमरा एक्सेस उपलब्ध नहीं है। कृपया अनुमति दें या फोटो अपलोड करें।",
      qrPrivacyNote: "हम आपके ब्राउज़र में QR डिकोड करते हैं। लिंक बिना खोले जांचे जाते हैं।",
      sampleTitle: "त्वरित सुरक्षा परीक्षण नमूने",
      btnAnalyzeLink: "लिंक सुरक्षित रूप से जांचें",
      btnAnalyzeContent: "सामग्री सुरक्षित रूप से जांचें",
      btnAnalyzeQr: "QR गंतव्य की सुरक्षित जांच करें",
      analyzingText: "सुरक्षित जांच जारी है...",
      scanningSteps: [
        "सामग्री और सुरक्षा संकेतों का विश्लेषण",
        "डोमेन और धोखाधड़ी पैटर्न की जांच",
        "साइबर सुरक्षा डाटाबेस से मिलान",
        "वित्तीय खतरे के संकेतों का मूल्यांकन",
        "विस्तृत सुरक्षा रिपोर्ट तैयार की जा रही है"
      ]
    },
    radar: {
      eyebrow: "साइबर सुरक्षा चेतावनी • सक्रिय धोखाधड़ी अभियान",
      title: "उभरते साइबर खतरे और धोखाधड़ी के ट्रेंड्स",
      subtitle: "वैश्विक साइबर सुरक्षा और सामुदायिक रिपोर्टों से रीयल-टाइम डेटा। इन धोखाधड़ी संदेशों को हमारे विश्लेषक में जांचें।",
      liveBadge: "वैश्विक सुरक्षा डेटा द्वारा प्रति घंटे अपडेटेड",
      testBtn: "इस धोखाधड़ी को विश्लेषक में जांचें",
      trends: [
        {
          id: "electricity-bill-scam",
          tag: "उपयोगिता धोखाधड़ी",
          name: "बिजली बिल भुगतान का फर्जी नोटिस",
          severity: "HIGH",
          vector: "SMS स्पूफिंग + फर्जी कॉल सपोर्ट",
          sample: "प्रिय उपभोक्ता, पिछले महीने का बिल अपडेट न होने के कारण आज रात 9:30 बजे आपकी बिजली काट दी जाएगी। बिजली काटने से रोकने के लिए तुरंत 9876543210 पर कॉल करें।",
          reportedIncrease: "इस महीने +410% की वृद्धि",
          explanation: "बिजली कटने का डर दिखाकर पीड़ित से AnyDesk इंस्टॉल करवाया जाता है या 10 रुपये के टोकन भुगतान के बहाने खाते से पैसे निकाले जाते हैं।"
        },
        {
          id: "digital-arrest-cbi",
          tag: "ऑडियो/वीडियो ब्लैकमेल",
          name: "TRAI / मुंबई पुलिस 'डिजिटल अरेस्ट'",
          severity: "CRITICAL",
          vector: "पुलिस, CBI और सुप्रीम कोर्ट का फर्जी प्रतिरूपण",
          sample: "TRAI अलर्ट: आपके आधार पर 17 अवैध मनी लॉन्ड्रिंग मामलों के कारण 2 घंटे में सभी नंबर ब्लॉक होंगे। क्राइम ब्रांच से बात करने के लिए 9 दबाएं या गिरफ्तारी वारंट का सामना करें।",
          reportedIncrease: "देशभर में +520% की वृद्धि",
          explanation: "नकली पुलिस स्टेशन के स्काइप/व्हाट्सएप वीडियो कॉल पर लोगों को घंटों डराकर 'आरबीआई सत्यापन खाते' में पैसे ट्रांसफर करवाए जाते हैं।"
        },
        {
          id: "sbi-yono-apk",
          tag: "एंड्रॉइड मैलवेयर",
          name: "SBI YONO नेटबैंकिंग फर्जी APK",
          severity: "CRITICAL",
          vector: "फर्जी बैंकिंग ऐप + SMS चोरी",
          sample: "प्रिय ग्राहक, पैन कार्ड सत्यापन लंबित होने के कारण आपका SBI खाता आज ब्लॉक कर दिया जाएगा। निर्बाध सेवा के लिए http://192.168.1.50/sbi-yono-update.apk इंस्टॉल करें।",
          reportedIncrease: "नेटबैंकिंग को निशाना बनाकर +280% वृद्धि",
          explanation: "फर्जी ऐप आपकी बैंकिंग जानकारी चुराता है और बैंक से आने वाले 2FA SMS OTP को गुप्त रूप से हैकर्स को भेज देता है।"
        },
        {
          id: "telegram-task-scam",
          tag: "निवेश धोखाधड़ी",
          name: "घर बैठे काम: यूट्यूब लाइक पोंजी स्कीम",
          severity: "HIGH",
          vector: "गारंटीड दैनिक रिटर्न + प्रीपेड टास्क",
          sample: "गूगल पार्टनर जॉब अवसर: दिन में केवल 3 वीडियो लाइक करके 2,500 से 8,000 रुपये कमाएं। 500 रुपये तुरंत बोनस पाने के लिए हमारे टेलीग्राम ग्रुप से जुड़ें।",
          reportedIncrease: "युवाओं को निशाना बनाकर +340% वृद्धि",
          explanation: "पहले छोटे मुनाफे देकर भरोसा जीता जाता है, फिर लाखों रुपये जमा करवाकर पैसे निकालना ब्लॉक कर दिया जाता है।"
        }
      ]
    },
    result: {
      assessmentTitle: "सुरक्षा जोखिम मूल्यांकन",
      scoreLabel: "जोखिम स्कोर",
      confidence: "विश्वास स्तर",
      aiEngine: "सुरक्षा इंजन",
      verifiedSecurityChecks: "सत्यापित सुरक्षा जांच",
      whyFlagged: "इसे संदिग्ध क्यों माना गया",
      evidenceTitle: "सटीक सबूत और कारण",
      actionTitle: "अनुशंसित कार्रवाई",
      stopDoNotClick: "रुकें: क्लिक न करें या आगे न बढ़ें",
      pauseAndVerify: "आगे बढ़ने से पहले पुष्टि करें",
      proceedWithCaution: "आगे बढ़ना सुरक्षित है — सतर्क रहें",
      verifyManually: "अस्पष्ट — आधिकारिक तौर पर सत्यापित करें",
      detectedUrls: "पहचाने गए लिंक",
      copyReport: "सुरक्षा रिपोर्ट कॉपी करें",
      reportCopied: "रिपोर्ट क्लिपबोर्ड पर कॉपी हो गई!",
      reportTo1930: "धोखाधड़ी रिपोर्ट करें (1930 / पोर्टल)",
      checkAnother: "अन्य सामग्री की जांच करें",
      disclaimer: "स्वचालित विश्लेषण केवल सलाहकारी मार्गदर्शन प्रदान करता है। आधिकारिक बैंक चैनलों के माध्यम से हमेशा पुष्टि करें।",
      safeNotice: "इस सामग्री में कोई दुर्भावनापूर्ण संकेत नहीं मिले।",
      verifiedSafe: "सत्यापित सुरक्षित",
      typeLabel: "प्रकार",
      exportJson: "JSON निर्यात करें",
      printEvidence: "साक्ष्य प्रिंट करें",
      reportThreat: "धोखाधड़ी रिपोर्ट करें",
      shareResult: "यह परिणाम साझा करें",
      shareDisclaimer: "यह आपका अपना WhatsApp खोलता है। हम आपके संपर्कों को कभी नहीं देखते।",
    },
    risk: {
      LOW: "सुरक्षित",
      MEDIUM: "संदिग्ध",
      HIGH: "खतरनाक",
      UNKNOWN: "अस्पष्ट",
      CANNOT_DETERMINE: "अस्पष्ट",
    },
    history: {
      eyebrow: "",
      title: "स्कैन इतिहास",
      subtitle: "",
      all: "सभी स्कैन",
      high: "उच्च जोखिम",
      medium: "मध्यम जोखिम",
      low: "सुरक्षित",
      emptyTitle: "अभी तक कोई स्कैन नहीं",
      emptySubtitle: "अपना इतिहास देखने के लिए डैशबोर्ड पर कोई लिंक, संदेश, क्यूआर कोड या स्क्रीनशॉट जांचें।",
      viewDetails: "पूरी रिपोर्ट देखें",
      clearBtn: "इतिहास साफ़ करें",
    },
    safety: {
      eyebrow: "त्वरित कार्रवाई, सुरक्षित भविष्य",
      title: "राष्ट्रीय साइबर सुरक्षा केंद्र",
      subtitle: "संदिग्ध परिस्थितियों में तत्काल आपातकालीन मार्गदर्शन और आधिकारिक प्रक्रियाएं।",
      urgentBadge1930: "राष्ट्रीय हेल्पलाइन: 1930",
      urgentBadgePortal: "आधिकारिक पोर्टल: cybercrime.gov.in",
      urgentRule: "स्वर्ण नियम: सभी बातचीत तुरंत बंद करें",
      timelineTitle: "गोल्डन आवर: पहले 30 मिनट की चेकलिस्ट",
      timelineIntro: "अनधिकृत वित्तीय डेबिट के 30 से 60 मिनट के भीतर रिपोर्ट करने से कानून प्रवर्तन द्वारा अपराधी के खाते को फ्रीज करने की संभावना काफी बढ़ जाती है।",
      timelineSteps: [
        {
          step: "01",
          title: "तुरंत 1930 हेल्पलाइन पर कॉल करें",
          desc: "गृह मंत्रालय के राष्ट्रीय साइबर अपराध नागरिक वित्तीय धोखाधड़ी रिपोर्टिंग सिस्टम से जुड़ने के लिए 1930 डायल करें।",
          alert: true
        },
        {
          step: "02",
          title: "अपने बैंक के फ्रॉड डेस्क पर कॉल करें",
          desc: "तुरंत अपनी नेटबैंकिंग, डेबिट कार्ड, यूपीआई ब्लॉक करें और 24x7 इमरजेंसी नंबर पर लेनदेन वापस लेने का अनुरोध करें।",
          alert: false
        },
        {
          step: "03",
          title: "cybercrime.gov.in पर औपचारिक शिकायत दर्ज करें",
          desc: "आधिकारिक पावती प्राप्त करने के लिए 24 घंटे के भीतर लेनदेन आईडी और स्क्रीनशॉट के साथ शिकायत दर्ज करें।",
          alert: false
        }
      ],
      guidesTitle: "घटना रिकवरी प्लेबुक्स",
      playbooks: [
        {
          id: "01",
          title: "यदि आपने किसी संदिग्ध लिंक पर क्लिक किया है",
          desc: "ब्राउज़र टैब तुरंत बंद करें। कोई भी पासवर्ड या विवरण न भरें। ब्राउज़र कुकीज़ साफ करें और अज्ञात फाइलें हटाएं।"
        },
        {
          id: "02",
          title: "यदि आपने कोई OTP या पिन साझा किया है",
          desc: "अपने बैंक ऐप से तुरंत पासवर्ड और UPI पिन बदलें। बैंक को कॉल करके पैसे की निकासी तुरंत रोकें।"
        },
        {
          id: "03",
          title: "यदि आप निवेश या टेलीग्राम घोटाले में फंस गए हैं",
          desc: "पैसे निकालने के नाम पर और पैसे न भेजें। चैट और बैंक लेनदेन के स्क्रीनशॉट लेकर 1930 पर रिपोर्ट करें।"
        },
        {
          id: "04",
          title: "यदि आपने कोई संदिग्ध APK इंस्टॉल किया है",
          desc: "फोन का इंटरनेट तुरंत बंद करें। ऐप को तुरंत अनइंस्टॉल करें और दूसरे फोन से अपने सभी पासवर्ड बदलें।"
        },
        {
          id: "05",
          title: "आम घोटालों को कैसे पहचानें",
          desc: "अचानक आई धमकियों से सावधान रहें ('आज ही खाता बंद होगा', 'बिजली कटेगी')। कोई भी सरकारी एजेंसी व्हाट्सएप पर धमकी नहीं देती।"
        },
        {
          id: "06",
          title: "जीरो-ट्रस्ट जांच की आदत",
          desc: "अचानक आए SMS में दिए गए लिंक पर कभी क्लिक न करें। हमेशा बैंक की आधिकारिक वेबसाइट या पासबुक पर दिए नंबर से संपर्क करें।"
        }
      ],
      quizEyebrow: "नागरिक साइबर सुरक्षा लैब",
      quizTitle: "अपनी सुरक्षा सतर्कता का परीक्षण करें",
      quizSubtitle: "क्या आप वास्तविक बैंक संदेशों और खतरनाक फ़िशिंग धोखाधड़ी में अंतर पहचान सकते हैं?",
      flagScamBtn: "🚨 खतरनाक धोखाधड़ी के रूप में चिह्नित करें",
      markLegitBtn: "✓ वैध संदेश के रूप में चिह्नित करें",
      rememberTitle: "याद रखने योग्य महत्वपूर्ण नियम",
      rememberText: "असली बैंक, आरबीआई, पुलिस या सरकारी एजेंसियां फोन या संदेशों पर कभी भी आपका OTP, ATM PIN या पासवर्ड नहीं मांगती हैं।",
    },
    profile: {
      eyebrow: "आपकी सुरक्षा स्थिति",
      title: "सुरक्षा प्रोफ़ाइल",
      accountBadge: "सक्रिय सुरक्षित प्रोफ़ाइल",
      deviceStorageNote: "आपके विश्लेषण रिकॉर्ड केवल इस डिवाइस के ब्राउज़र में निजी तौर पर सहेजे जाते हैं। सर्वर पर कोई डेटा नहीं रहता।",
      totalChecks: "कुल जांचें",
      highRiskDetected: "रोके गए खतरे",
      mediumRiskDetected: "संदिग्ध चेतावनियां",
      lowRiskDetected: "सुरक्षित स्कैन",
      recentActivity: "हालिया गतिविधि",
      noActivity: "अभी तक कोई गतिविधि दर्ज नहीं हुई है।",
      privacyTitle: "गोपनीयता और डेटा नियंत्रण",
      privacyDesc: "इस ब्राउज़र में संग्रहीत अपना विश्लेषण इतिहास कभी भी साफ़ करें।",
      clearHistoryBtn: "इतिहास साफ़ करें",
      historyCleared: "आपका स्थानीय विश्लेषण इतिहास सफलतापूर्वक साफ़ कर दिया गया है।",
      readinessTitle: "सुरक्षा तत्परता",
      signOutBtn: "साइन आउट / नंबर बदलें",
      authMobileBtn: "मोबाइल सत्यापित करें",
      noMobileText: "मोबाइल सत्यापित नहीं है",
    },
    login: {
      title: "सुरक्षित रूप से आगे बढ़ें",
      subtitle: "भारत (+91) • सुरक्षित सुरक्षा पोर्टल",
      fullName: "पूरा नाम",
      mobileNumber: "मोबाइल नंबर",
      otpCode: "वन-टाइम पासवर्ड (OTP)",
      otpCodeNote: "प्रमाणीकरण के लिए सत्यापन कोड 123456 दर्ज करें।",
      btnContinue: "सुरक्षित रूप से आगे बढ़ें",
      btnVerify: "सत्यापित करें और प्रवेश करें",
      authRequiredTitle: "जांच के लिए मोबाइल सत्यापन आवश्यक है",
      authRequiredDesc: "सुरक्षा जांच चलाने से पहले कृपया अपने मोबाइल नंबर को OTP से सत्यापित करें।",
      sentTo: "भेजा गया",
      editNumber: "नंबर बदलें",
      zeroDbTitle: "शून्य डेटाबेस प्रतिधारण",
      zeroDbDesc: "आपका सत्र और मोबाइल सत्यापन 100% आपके डिवाइस पर रहता है। आपका कोई भी डेटा रिमोट डेटाबेस में सहेजा नहीं जाता।",
      encryptedSession: "सत्यापित 256-बिट एन्क्रिप्टेड सत्र",
    },
    whatsappBot: {
      badge: "आगामी सुविधा",
      title: "सत्यापन के लिए WhatsApp पर फ़ॉरवर्ड करें",
      description: "बिना किसी ऐप को इंस्टॉल किए, किसी भी संदिग्ध संदेश या लिंक को WhatsApp पर फ़ॉरवर्ड करके तुरंत निर्णय प्राप्त करें।",
      chatBtn: "सत्यापित करने के लिए फ़ॉरवर्ड करें (जल्द आ रहा है)",
      sandboxNotice: "उपयोगकर्ता गोपनीयता की रक्षा के लिए इसे किसी तीसरे पक्ष के प्रदाता के बिना सीधे बनाया जा रहा है।",
      howItWorks: "1. संदिग्ध संदेश फ़ॉरवर्ड करें • 2. AI सुरक्षा इंजन तुरंत जांचेगा • 3. आपकी चुनी हुई भाषा में त्वरित निर्णय",
    },
    footer: {
      featuresTitle: "उत्पाद सुविधाएँ",
      featureInspector: "लिंक और URL खतरा विश्लेषक",
      featureDecoder: "SMS और व्हाट्सएप स्कैम डिकोडर",
      featureOcr: "OCR स्क्रीनशॉट स्कैनर",
      featureQr: "फाइनेंशियल QR गंतव्य सत्यापन",
      featureHistory: "स्थानीय ब्राउज़र इतिहास",
      emergencyTitle: "आपातकालीन एवं कानूनी सहायता",
      helpline1930: "राष्ट्रीय साइबर हेल्पलाइन 1930",
      portalGov: "cybercrime.gov.in पोर्टल",
      recoveryChecklist: "गोल्डन आवर रिकवरी चेकलिस्ट",
      disputeGuide: "UPI और बैंक धोखाधड़ी समाधान गाइड",
      apkGuide: "APK मैलवेयर हटाने के चरण",
      feedTitle: "खतरा खुफिया बुलेटिन",
      feedSubtitle: "नए UPI जाल, फर्जी केवाईसी अभियान और डिजिटल अरेस्ट खतरों पर साप्ताहिक अपडेट प्राप्त करें।",
      subscribeBtn: "सब्सक्राइब करें",
      subscribedMsg: "✓ रीयल-टाइम सुरक्षा बुलेटिन की सदस्यता ली गई।",
      certIn: "CERT-In सुरक्षा मानकों के अनुरूप",
      dpdpa: "DPDPA 2023 गोपनीयता अनुपालन",
      zeroKnowledge: "जीरो-नॉलेज सुरक्षित सैंडबॉक्स",
      sslTls: "256-बिट SSL/TLS सुरक्षा",
      builtWith: "वैश्विक साइबर सुरक्षा के लिए 🇮🇳 में निर्मित",
      rights: "सुदर्शन कवच AI. सर्वाधिकार सुरक्षित।",
      disclaimer: "अस्वीकरण: सुदर्शन कवच AI विश्लेषण के आधार पर सलाहकारी मार्गदर्शन प्रदान करता है। अपना बैंकिंग OTP या पासवर्ड कभी किसी के साथ साझा न करें।",
    }
  },
  te: {
    brand: "సుదర్శన కవచ",
    tagline: "మీరు క్లిక్ చేయడం, చెల్లించడం, పంచుకోవడం లేదా విశ్వసించే ముందు — మీ డిజిటల్ భద్రతా కో-పైలట్‌తో తనిఖీ చేయండి.",
    common: {
      devApi: "",
      playbooks: "సంఘటన ప్రణాళికలు",
      verifiedSafe: "ధృవీకరించబడిన సురక్షితమైనది",
      riskWord: "ప్రమాదం",
      statusActive: "ఇంజిన్ సక్రియంగా ఉంది",
    },
    nav: {
      dashboard: "కంట్రోల్ సెంటర్",
      history: "చరిత్ర",
      safety: "జాతీయ రక్షణ",
      profile: "ఖాతా & గోప్యత",
      login: "లాగిన్",
    },
    hero: {
      eyebrow: "AI-ఆధారిత మోసాల గుర్తింపు",
      title: "మీ డిజిటల్",
      highlight: "రక్షణ కవచం",
      subtitle: "భారతీయ పౌరుల కోసం నిజ-సమయ ఫిషింగ్, UPI మోసాలు మరియు హానికరమైన లింక్‌లను గుర్తించే అధునాతన భద్రతా వ్యవస్థ.",
      ctaCheck: "సందేశం లేదా లింక్ తనిఖీ చేయండి",
      ctaHow: "ఇది ఎలా పనిచేస్తుంది",
      trustBadge: "జీరో సర్వర్ నిల్వ • పూర్తి పరికర గోప్యత",
      feature1Title: "తక్షణ ముప్పు విశ్లేషణ",
      feature1Desc: "అనుమానాస్పద లింక్‌లు, SMS మరియు చెల్లింపు అభ్యర్థనలను సెకన్లలో స్కాన్ చేస్తుంది.",
      feature2Title: "గోల్డెన్ అవర్ సహాయం",
      feature2Desc: "మోసం జరిగిన మొదటి 60 నిమిషాల్లో ఖాతా ఫ్రీజ్ మరియు రికవరీ కోసం అధికారిక మార్గదర్శకత్వం.",
      feature3Title: "బహుభాషా AI మద్దతు",
      feature3Desc: "తెలుగు, కన్నడ, హిందీ మరియు ఆంగ్లంలో స్థానిక అవగాహనతో స్పష్టమైన భద్రతా సలహాలు.",
      howTitle: "సుదర్శన కవచం ఎలా పనిచేస్తుంది",
      howSubtitle: "కేవలం మూడు సరళమైన దశల్లో డిజిటల్ బెదిరింపుల నుండి మిమ్మల్ని రక్షిస్తుంది.",
      howSteps: [
        "1. అనుమానాస్పద లింక్, SMS లేదా స్క్రీన్‌షాట్‌ను అతికించండి",
        "2. మా AI ఇంజిన్ మోసపూరిత సంకేతాలను తక్షణమే విశ్లేషిస్తుంది",
        "3. స్పష్టమైన ప్రమాద స్కోరు మరియు తీసుకోవలసిన చర్యలను పొందండి",
      ],
      emergencyHeading: "మీరు ఇప్పటికే మోసపోయారా?",
      emergencySub: "ఆందోళన చెందకండి. గోల్డెన్ అవర్ అత్యవసర ప్రోటోకాల్‌ను తక్షణమే ప్రారంభించండి.",
      dial1930: "1930 కి డయల్ చేయండి",
    },
    dashboard: {
      greeting: "నమస్కారం, మీ డిజిటల్ రక్షణకు స్వాగతం",
      title: "కంట్రోల్ సెంటర్",
      subtitle: "సందేశాలు, చెల్లింపు లింక్‌లు లేదా స్క్రీన్‌షాట్‌లను విశ్లేషించి మోసాల నుండి రక్షణ పొందండి.",
      privacyNote: "మీ సమాచారం మీ బ్రౌజర్‌లోనే ఉంటుంది. ఎటువంటి డేటా సర్వర్‌లో నిల్వ చేయబడదు.",
      tabUrl: "వెబ్ లింక్ (URL)",
      tabMessage: "SMS / సందేశం",
      tabScreenshot: "స్క్రీన్‌షాట్ OCR",
      tabQr: "QR కోడ్ స్కాన్ చేయండి",
      urlPlaceholder: "ఉదాహరణకు: https://secure-bank-login.xyz లేదా అనుమానాస్పద లింక్",
      messagePlaceholder: "మీరు అందుకున్న SMS, WhatsApp సందేశం లేదా చెల్లింపు అభ్యర్థనను ఇక్కడ అతికించండి...",
      screenshotDrop: "స్క్రీన్‌షాట్ ఇక్కడ అప్‌లోడ్ చేయండి",
      screenshotNote: "PNG, JPG లేదా WEBP చిత్రాలు (గరిష్టంగా 5MB). టెక్స్ట్ స్వయంచాలకంగా విశ్లేషించబడుతుంది.",
      qrDrop: "కెమెరాతో QR స్కాన్ చేయండి లేదా ఫోటో అప్‌లోడ్ చేయండి",
      qrNote: "లైవ్ కెమెరా లేదా ఇమేజ్ ఫైల్‌లకు మద్దతు ఉంది (గరిష్టంగా 5MB). బ్రౌజర్‌లోనే డీకోడ్ చేయబడుతుంది.",
      qrPlaceholder: "డీకోడ్ చేయబడిన QR వివరాలు ఇక్కడ కనిపిస్తాయి...",
      qrDecodedMsg: "డీకోడ్ చేయబడింది: {payload} — ఇది తనిఖీ చేయబడుతుంది.",
      qrDecoding: "బ్రౌజర్‌లో QR కోడ్ డీకోడ్ అవుతోంది...",
      qrErrorNoCode: "ఈ చిత్రంలో సరైన QR కోడ్ కనుగొనబడలేదు. దయచేసి QR కోడ్ స్పష్టంగా ఉండేలా చూసుకోండి.",
      qrUpiVpaLabel: "గ్రహీత UPI ID (VPA)",
      qrUpiAmountLabel: "కోరిన మొత్తం",
      qrChangePhoto: "మరొకటి స్కాన్ / ఎంచుకోండి",
      qrOpenCamera: "కెమెరా స్కానర్ తెరవండి",
      qrCloseCamera: "కెమెరా మూసివేయండి",
      qrCameraPoint: "QR కోడ్‌ను ఫ్రేమ్‌లో ఉంచండి",
      qrCameraPermission: "కెమెరా అనుమతి లభించలేదు. దయచేసి అనుమతించండి లేదా ఫోటో అప్‌లోడ్ చేయండి.",
      qrPrivacyNote: "మేము మీ బ్రౌజర్‌లోనే QR డీకోడ్ చేస్తాము. లింక్ తెరవకుండానే తనిఖీ చేయబడుతుంది.",
      sampleTitle: "సాధారణ మోసాల ఉదాహరణలను పరీక్షించండి:",
      btnAnalyzeLink: "లింక్‌ను విశ్లేషించండి",
      btnAnalyzeContent: "సందేశాన్ని విశ్లేషించండి",
      btnAnalyzeQr: "QR గమ్యాన్ని సురక్షితంగా విశ్లేషించండి",
      analyzingText: "విశ్లేషిస్తోంది...",
      scanningSteps: [
        "ఇన్‌పుట్ ధృవీకరించబడుతోంది...",
        "హానికరమైన సంకేతాలు శోధించబడుతున్నాయి...",
        "AI విశ్లేషణ పూర్తవుతోంది..."
      ]
    },
    radar: {
      eyebrow: "సైబర్ ముప్పు హెచ్చరిక • క్రియాశీల ప్రచారాలు",
      title: "ప్రస్తుతం ప్రచారంలో ఉన్న సైబర్ మోసాలు",
      subtitle: "భారతదేశంలో సర్క్యులేట్ అవుతున్న తాజా మోసాల నమూనాలు. వీటిని విశ్లేషకంలో పరీక్షించి ఫలితాన్ని చూడండి.",
      liveBadge: "తాజా ముప్పు సంతకాల ఆధారంగా నవీకరించబడింది",
      testBtn: "ఈ మోసాన్ని విశ్లేషకంలో పరీక్షించండి",
      trends: [
        {
          id: "electricity-bill-scam",
          tag: "యుటిలిటీ మోసం",
          name: "విద్యుత్ సరఫరా నిలిపివేత అత్యవసర నోటీసు",
          severity: "HIGH",
          vector: "SMS స్పూఫింగ్ + నకిలీ APK కాల్ సపోర్ట్",
          sample: "గౌరవనీయ వినియోగదారులారా, గత నెల బిల్లు అప్‌డేట్ కానందున మీ విద్యుత్ సరఫరా ఈ రాత్రి 9:30 గంటలకు నిలిపివేయబడుతుంది. వెంటనే 9876543210 కు కాల్ చేయండి.",
          reportedIncrease: "ఈ నెలలో +410% పెరుగుదల",
          explanation: "కరెంట్ కట్ అవుతుందనే భయాన్ని సృష్టించి AnyDesk వంటి యాప్‌లను ఇన్‌స్టాల్ చేయిస్తారు లేదా నకిలీ లింక్‌ల ద్వారా డబ్బులు కాజేస్తారు.",
        },
        {
          id: "digital-arrest-cbi",
          tag: "ఆడియో/వీడియో బెదిరింపు",
          name: "TRAI / ముంబై పోలీసుల 'డిజిటల్ అరెస్ట్'",
          severity: "CRITICAL",
          vector: "పోలీస్, CBI మరియు సుప్రీంకోర్టు అధికారుల వలె నటించడం",
          sample: "TRAI హెచ్చరిక: మీ ఆధార్‌పై 17 అక్రమ లావాదేవీలు ఉన్నందున మీ మొబైల్ నంబర్ 2 గంటల్లో నిలిపివేయబడుతుంది. ముంబై క్రైమ్ బ్రాంచ్ అధికారితో మాట్లాడటానికి 9 నొక్కండి.",
          reportedIncrease: "దేశవ్యాప్తంగా +520% పెరుగుదల",
          explanation: "బాధితులను స్కైప్ లేదా వాట్సాప్ వీడియో కాల్స్‌లో ఉంచి, నకిలీ పోలీస్ స్టేషన్ సెటప్‌లతో బెదిరించి 'RBI వెరిఫికేషన్ ఖాతా' పేరుతో డబ్బును బదిలీ చేయిస్తారు.",
        },
        {
          id: "sbi-yono-apk",
          tag: "ఆండ్రాయిడ్ మాల్వేర్",
          name: "SBI YONO నెట్‌బ్యాంకింగ్ గడువు APK",
          severity: "CRITICAL",
          vector: "నకిలీ బ్యాంకింగ్ APKలు + SMS స్టీలర్",
          sample: "ప్రియమైన కస్టమర్, పాన్ కార్డ్ ధృవీకరణ పెండింగ్‌లో ఉన్నందున మీ SBI YONO ఖాతా నిరోధించబడుతుంది. సేవలు కొనసాగడానికి http://192.168.1.50/sbi-yono-update.apk లో యాప్ అప్‌డేట్ చేసుకోండి.",
          reportedIncrease: "నెట్‌బ్యాంకింగ్‌ను లక్ష్యంగా చేసుకుని +280%",
          explanation: "హానికరమైన APKలు బ్యాంకింగ్ ఆధారాలను దొంగిలిస్తాయి మరియు ఖాతా నుండి డబ్బును విత్‌డ్రా చేయడానికి వచ్చే OTP SMS లను రహస్యంగా చదువుతాయి.",
        },
        {
          id: "telegram-task-scam",
          tag: "పెట్టుబడి మోసం",
          name: "పార్ట్-టైమ్ యూట్యూబ్ లైక్ & రివ్యూ ఉద్యోగం",
          severity: "HIGH",
          vector: "టెలిగ్రామ్ టాస్క్ గ్రూపులు + క్రిప్టో వాలెట్లు",
          sample: "గూగుల్ మ్యాప్స్ మరియు యూట్యూబ్ వీడియోలను లైక్ చేయడం ద్వారా రోజుకు రూ. 3,500 సంపాదించండి. మొదటి 3 టాస్క్‌లకు రూ. 150 తక్షణ చెల్లింపు. టెలిగ్రామ్‌లో చేరండి.",
          reportedIncrease: "+340% యువతను లక్ష్యంగా చేసుకుని",
          explanation: "మొదట్లో చిన్న మొత్తాలను చెల్లించి నమ్మకం కుదిర్చి, ఆపై అధిక రాబడి పేరుతో 'ప్రీపెయిడ్ ఇన్వెస్ట్‌మెంట్ టాస్క్' ల ద్వారా లక్షల రూపాయలను కాజేస్తారు.",
        },
      ],
    },
    result: {
      assessmentTitle: "భద్రతా విశ్లేషణ నివేదిక",
      scoreLabel: "ప్రమాద సూచిక స్కోరు",
      confidence: "విశ్వసనీయత",
      aiEngine: "విశ్లేషణ ఇంజిన్",
      verifiedSecurityChecks: "ధృవీకరించబడిన భద్రతా తనిఖీలు",
      whyFlagged: "దీన్ని ఎందుకు గుర్తించారు",
      evidenceTitle: "ఖచ్చితమైన ఆధారాలు మరియు వివరణ",
      actionTitle: "సిఫార్సు చేయబడిన తక్షణ చర్య",
      stopDoNotClick: "ఆగండి: క్లిక్ చేయవద్దు లేదా ముందుకు సాగవద్దు",
      pauseAndVerify: "ముందుకు వెళ్లే ముందు స్వతంత్రంగా ధృవీకరించండి",
      proceedWithCaution: "ముందుకు సాగవచ్చు — జాగ్రత్తగా ఉండండి",
      verifyManually: "అనిశ్చితం — అధికారికంగా ధృవీకరించండి",
      detectedUrls: "గుర్తించిన లింక్‌లు",
      copyReport: "నివేదికను కాపీ చేయండి",
      reportCopied: "నివేదిక కాపీ చేయబడింది!",
      reportTo1930: "మోసాన్ని నివేదించండి (1930 / పోర్టల్)",
      checkAnother: "మరొకటి తనిఖీ చేయండి",
      disclaimer: "ఆటోమేటెడ్ విశ్లేషణ సలహా మార్గదర్శకత్వాన్ని మాత్రమే అందిస్తుంది. ఎల్లప్పుడూ అధికారిక బ్యాంక్ ఛానెల్‌ల ద్వారా ధృవీకరించుకోండి.",
      safeNotice: "ఈ కంటెంట్‌లో ఎటువంటి హానికరమైన సంకేతాలు గుర్తించబడలేదు.",
      verifiedSafe: "ధృవీకరించబడిన సురక్షితమైనది",
      typeLabel: "రకం",
      exportJson: "JSON ఎగుమతి",
      printEvidence: "ఆధారాన్ని ముద్రించండి",
      reportThreat: "ముప్పును నివేదించండి",
      shareResult: "ఈ ఫలితాన్ని భాగస్వామ్యం చేయండి",
      shareDisclaimer: "ఇది మీ స్వంత WhatsApp ను తెరుస్తుంది. మేము మీ పరిచయాలను ఎప్పటికీ చూడము.",
    },
    risk: {
      LOW: "సురక్షితమైనది",
      MEDIUM: "అనుమానాస్పదమైనది",
      HIGH: "ప్రమాదకరమైనది",
      UNKNOWN: "అనిశ్చితం",
      CANNOT_DETERMINE: "అనిశ్చితం",
    },
    history: {
      eyebrow: "",
      title: "స్కాన్ చరిత్ర",
      subtitle: "",
      all: "అన్ని స్కాన్‌లు",
      high: "అధిక ప్రమాదం",
      medium: "మధ్యమ ప్రమాదం",
      low: "సురక్షితమైనవి",
      emptyTitle: "ఇంకా స్కాన్‌లు లేవు",
      emptySubtitle: "మీ చరిత్రను ప్రారంభించడానికి డాష్‌బోర్డ్‌లో లిಂಕ್, సందేశం, క్యూఆర్ కోడ్ లేదా స్క్రీన్‌షాట్‌ను విశ్లేషించండి.",
      viewDetails: "పూర్తి నివేదిక చూడండి",
      clearBtn: "చరిత్రను తొలగించండి",
    },
    safety: {
      eyebrow: "తక్షణ చర్య, సురక్షిత భవిష్యత్తు",
      title: "జాతీయ సైబర్ భద్రతా కేంద్రం",
      subtitle: "అనుమానం కలిగినప్పుడు తక్షణ అత్యవసర మార్గదర్శకత్వం మరియు అధికారిక సహాయక చర్యలు.",
      urgentBadge1930: "జాతీయ హెల్ప్‌లైన్: 1930",
      urgentBadgePortal: "అధికారిక పోర్టల్: cybercrime.gov.in",
      urgentRule: "బంగారు నియమం: అన్ని సంభాషణలను తక్షణమే నిలిపివేయండి",
      timelineTitle: "గోల్డెన్ అవర్: మొదటి 30 నిమిషాల చెక్‌లిస్ట్",
      timelineIntro: "అనధికారిక లావాదేవీ జరిగిన 30 నుండి 60 నిమిషాల్లో నివేదించడం వల్ల పోలీసులు నేరగాళ్ల ఖాతాను తక్షణమే ఫ్రీజ్ చేసే అవకాశం ఎక్కువగా ఉంటుంది.",
      timelineSteps: [
        {
          step: "01",
          title: "వెంటనే 1930 హెల్ప్‌లైన్‌కు కాల్ చేయండి",
          desc: "కేంద్ర హోం మంత్రిత్వ శాఖ ఆధ్వర్యంలోని జాతీయ సైబర్ నేరాల రిపోర్టింగ్ వ్యవస్థను సంప్రదించడానికి ఏ ఫోన్ నుండైనా 1930 కి డయల్ చేయండి.",
          alert: true,
        },
        {
          step: "02",
          title: "మీ బ్యాంక్ మోసాల విభాగానికి కాల్ చేయండి",
          desc: "మీ నెట్‌బ్యాంకింగ్, డెబిట్ కార్డులు మరియు UPI ని వెంటనే బ్లాక్ చేయండి మరియు లావాదేవీని నిలిపివేయాలని అభ్యర్థించండి.",
          alert: false,
        },
        {
          step: "03",
          title: "cybercrime.gov.in లో అధికారిక ఫిర్యాదు నమోదు చేయండి",
          desc: "అధికారిక రసీదును పొందడానికి లావాదేవీల ఐడీలు మరియు స్క్రీన్‌షాట్‌లతో 24 గంటల్లోగా ఫిర్యాదు నమోదు చేయండి.",
          alert: false,
        },
      ],
      guidesTitle: "సంఘటన రికవరీ గైడ్‌లు",
      playbooks: [
        {
          id: "unauthorized-debit",
          title: "అనధికారిక బ్యాంక్ లేదా UPI డెబిట్",
          desc: "మీ ఖాతా నుండి తెలియకుండా డబ్బు కట్ అయినప్పుడు బ్యాంక్ ఖాతాలను ఫ్రీజ్ చేయడానికి మరియు 1930 లో నివేదించడానికి దశలవారీ మార్గదర్శకత్వం.",
        },
        {
          id: "fake-apk-installed",
          title: "హానికరమైన లేదా నకిలీ APK ఇన్‌స్టాల్ చేయబడింది",
          desc: "మీ ఫోన్‌లో అనుమానాస్పద యాప్ లేదా రిమోట్ స్క్రీన్ షేరింగ్ యాప్ ఇన్‌స్టాల్ అయినప్పుడు దాన్ని తొలగించే విధానం.",
        },
        {
          id: "blackmail-digital-arrest",
          title: "డిజిటల్ అరెస్ట్ మరియు బెదిరింపు కాల్స్",
          desc: "పోలీసులు, సిబిఐ లేదా కస్టమ్స్ అధికారుల వలె నటిస్తూ వీడియో కాల్స్‌లో బెదిరించే వారి నుండి రక్షణ పొందే మార్గాలు.",
        },
      ],
      quizEyebrow: "మీ జ్ఞానాన్ని పరీక్షించుకోండి",
      quizTitle: "మోసాల గుర్తింపు శిక్షణ",
      quizSubtitle: "ఈ క్రింది సందేశం నిజమైనదా లేక మోసమా అని గుర్తించండి.",
      flagScamBtn: "ఇది మోసం అని ఫ్లాగ్ చేయండి",
      markLegitBtn: "ఇది సురక్షితం అని గుర్తించండి",
      rememberTitle: "గుర్తుంచుకోవలసిన ముఖ్యమైన విషయం",
      rememberText: "ఏ బ్యాంక్ లేదా ప్రభుత్వ సంస్థ కూడా ఫోన్ లేదా వాట్సాప్‌లో మీ OTP లేదా పాస్‌వర్డ్ అడగదు.",
    },
    profile: {
      eyebrow: "స్థానిక సెషన్ & పరికర నియంత్రణ",
      title: "ఖాతా & గోప్యతా నియంత్రణలు",
      accountBadge: "స్థానిక బ్రౌజర్ సెషన్",
      deviceStorageNote: "మీ విశ్లేషణ చరిత్ర ఈ బ్రౌజర్‌లో మాత్రమే నిల్వ ఉంటుంది. సమర్పించిన కంటెంట్ విశ్లేషణ కోసం పంపబడుతుంది మరియు మా వద్ద నిల్వ చేయబడదు.",
      totalChecks: "మొత్తం తనిఖీలు",
      highRiskDetected: "ప్రమాదకరమైనవి",
      mediumRiskDetected: "అనుమానాస్పదమైనవి",
      lowRiskDetected: "సురక్షితమైనవి",
      recentActivity: "ఇటీవలి కార్యకలాపాలు",
      noActivity: "ఈ పరికరంలో ఇంకా ఎలాంటి విశ్లేషణలు నిర్వహించబడలేదు.",
      privacyTitle: "పరికర నిల్వ & చరిత్ర నిర్వహణ",
      privacyDesc: "విశ్లేషణ చరిత్ర అంతా మీ పరికరంలో మాత్రమే నిల్వ ఉంటుంది. మీరు ఎప్పుడైనా దీన్ని తొలగించవచ్చు.",
      clearHistoryBtn: "స్థానిక చరిత్రను తొలగించండి",
      historyCleared: "మీ స్థానిక చరిత్ర విజయవంతంగా తొలగించబడింది.",
      readinessTitle: "భద్రతా సంసిద్ధత",
      signOutBtn: "సెషన్ ముగించండి",
      authMobileBtn: "మొబైల్ OTP తో ధృవీకరించండి",
      noMobileText: "పరికరంలో స్థానికంగా సేవ్ చేయబడింది",
    },
    login: {
      title: "సురక్షితంగా కొనసాగించండి",
      subtitle: "భారతదేశం (+91) • సురక్షిత యాక్సెస్ పోర్టల్",
      fullName: "పూర్తి పేరు",
      mobileNumber: "మొబైల్ నంబర్",
      otpCode: "వన్-టైమ్ పాస్‌వర్డ్ (OTP)",
      otpCodeNote: "ధృవీకరణ కోసం 123456 కోడ్‌ను నమోదు చేయండి.",
      btnContinue: "సురక్షితంగా కొనసాగించండి",
      btnVerify: "ధృవీకరించి ప్రవేశించండి",
      authRequiredTitle: "తనిఖీ చేయడానికి లాగిన్ అవసరం",
      authRequiredDesc: "భద్రతా తనిఖీలను అమలు చేయడానికి దయచేసి OTP తో లాగిన్ అవ్వండి.",
      sentTo: "పంపబడింది",
      editNumber: "నంబర్ సవరించండి",
      zeroDbTitle: "జీరో డేటాబేస్ నిల్వ",
      zeroDbDesc: "మీ మొబైల్ ధృవీకరణ పూర్తిగా ఈ పరికరంలోనే ఉంటుంది. ఏ డేటాబేస్‌లోనూ నిల్వ చేయబడదు.",
      encryptedSession: "256-బిట్ ఎన్‌క్రిప్టెడ్ సెషన్",
    },
    whatsappBot: {
      badge: "రాబోయే ఫీచర్",
      title: "ధృవీకరణ కోసం WhatsApp కు ఫార్వర్డ్ చేయండి",
      description: "ఏదైనా అనుమానాస్పద సందేశం లేదా లింక్‌ను నేరుగా WhatsApp కు ఫార్వర్డ్ చేసి తక్షణ తీర్పు పొందండి — యాప్ లేదు, సైన్-అప్ అవసరం లేదు.",
      chatBtn: "WhatsApp లో ఫార్వర్డ్ చేయండి (త్వరలో)",
      sandboxNotice: "పూర్తి గోప్యతను నిర్ధారించడానికి మూడవ పక్ష మెసేజింగ్ ప్రొవైడర్ లేకుండా నేరుగా దీన్ని రూపొందిస్తున్నాము.",
      howItWorks: "1. అనుమానాస్పద SMS లేదా లింక్ ఫార్వర్డ్ చేయండి • 2. AI ఇంజిన్ త్వరగా విశ్లేషిస్తుంది • 3. క్షణాల్లో తక్షణ తీర్పు",
    },
    footer: {
      featuresTitle: "ఉత్పత్తి ఫీచర్లు",
      featureInspector: "లింక్ & URL ముప్పు ఇన్‌స్పెక్టర్",
      featureDecoder: "SMS & WhatsApp మోసాల డీకోడర్",
      featureOcr: "OCR స్క్రీన్‌షాట్ స్కానర్",
      featureQr: "ఫైనాన్షియల్ QR గమ్యస్థాన ధృవీకరణ",
      featureHistory: "స్థానిక బ్రౌజర్ చరిత్ర",
      emergencyTitle: "అత్యవసర & చట్టపరమైన మార్గదర్శకాలు",
      helpline1930: "జాతీయ సైబర్ హెల్ప్‌లైన్ 1930",
      portalGov: "cybercrime.gov.in అధికారిక పోర్టల్",
      recoveryChecklist: "గోల్డెన్ అవర్ రికవరీ చెక్‌లిస్ట్",
      disputeGuide: "బ్యాంక్ లావాదేవీ వివాద గైడ్",
      apkGuide: "హానికరమైన APK తొలగింపు గైడ్",
      feedTitle: "ముప్పు హెచ్చరికల సమాచారం",
      feedSubtitle: "తాజా సైబర్ మోసాల నివారణ చిట్కాలను పొందండి.",
      subscribeBtn: "సబ్‌స్క్రైబ్",
      subscribedMsg: "ధన్యవాదాలు! మీరు సబ్‌స్క్రైబ్ చేసుకున్నారు.",
      certIn: "CERT-In మార్గదర్శకాలకు అనుగుణంగా రూపొందించబడింది",
      dpdpa: "DPDPA 2023 గోప్యతా సూత్రాలకు కట్టుబడి ఉంది",
      zeroKnowledge: "జీరో-నాలెడ్జ్ ఆర్కిటెక్చర్ • డేటా నిల్వ లేదు",
      sslTls: "రక్షిత 256-బిట్ TLS ట్రాఫిక్",
      builtWith: "యుక్తిమంథన్ 2.0 కోసం రూపొందించబడింది",
      rights: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",
      disclaimer: "సుదర్శన కవచం ఒక విశ్లేషణాత్మక డిజిటల్ భద్రతా కో-పైలట్. అధికారిక మార్గాల ద్వారా ఎల్లప్పుడూ ధృవీకరించుకోండి.",
    },
  },

};

export function useTranslation() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sk-lang") as Language;
    if (saved && (saved === "en" || saved === "kn" || saved === "hi" || saved === "te")) {
      setLang(saved);
      if (typeof document !== "undefined") {
        document.documentElement.lang = saved;
        document.documentElement.setAttribute("data-lang", saved);
      }
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("sk-lang", newLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
      document.documentElement.setAttribute("data-lang", newLang);
    }
    // Dispatch a custom event so all mounted components re-render simultaneously
    window.dispatchEvent(new Event("sk-lang-change"));
  };

  useEffect(() => {
    const handleLangChange = () => {
      const current = (localStorage.getItem("sk-lang") as Language) || "en";
      setLang(current);
      if (typeof document !== "undefined") {
        document.documentElement.lang = current;
        document.documentElement.setAttribute("data-lang", current);
      }
    };
    window.addEventListener("sk-lang-change", handleLangChange);
    return () => window.removeEventListener("sk-lang-change", handleLangChange);
  }, []);

  return {
    lang,
    setLanguage: changeLanguage,
    t: translations[lang] || translations.en,
  };
}
