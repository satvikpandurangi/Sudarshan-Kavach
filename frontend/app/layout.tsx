import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sudarshan-kavach.vercel.app"),
  title: "SUDARSHAN KAVACH | AI-Powered Digital Safety Co-Pilot",
  description: "Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot. AI security analysis with real-time threat intelligence.",
  keywords: ["cybersecurity", "phishing detection", "scam alert", "India cyber safety", "1930 helpline", "UPI scam check", "Sudarshan Kavach"],
  authors: [{ name: "Sudarshan Kavach AI" }],
  icons: {
    icon: "/sudarshan-shield-emblem.png",
    shortcut: "/sudarshan-shield-emblem.png",
    apple: "/sudarshan-shield-emblem.png",
  },
  openGraph: {
    title: "SUDARSHAN KAVACH | Digital Safety Co-Pilot",
    description: "Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.",
    type: "website",
    locale: "en_IN",
    images: ["/sudarshan-shield-emblem.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SUDARSHAN KAVACH | Digital Safety Co-Pilot",
    description: "Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.",
    images: ["/sudarshan-shield-emblem.png"],
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sudarshan Kavach",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
  viewportFit: "cover",
};

import { OverflowAuditor } from "@/components/OverflowAuditor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/sudarshan-shield-emblem.png" />
        <link rel="apple-touch-icon" href="/sudarshan-shield-emblem.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <OverflowAuditor />
        {children}
      </body>
    </html>
  );
}
