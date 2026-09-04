export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CANNOT_DETERMINE";

export type Analysis = {
  id: string;
  inputType: "URL" | "MESSAGE" | "SCREENSHOT" | "QR";
  submitted: string;
  riskScore: number;
  riskLevel: RiskLevel;
  classification: string;
  confidence: number;
  warningSigns: string[];
  evidence: string[];
  explanation: string;
  recommendedActions: string[];
  detectedUrls: string[];
  extractedText?: string;
  createdAt: string;
  aiProvider?: string;
  checklist?: string[];
  checkedFor?: string | { name: string; mobile: string };
};
