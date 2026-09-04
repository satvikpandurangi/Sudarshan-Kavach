# 🛡️ Sudarshan Kavach AI — Frontend Application

Production-ready, accessible, mobile-first web interface for the **Digital Safety Co-pilot**, built with **Next.js 14 App Router**, React 18, TypeScript, and modern CSS/Tailwind.

Hosted on **Vercel** with zero-latency edge delivery and dynamic API routing to the FastAPI backend on **Railway**.

---

## 🌟 Key Capabilities

- **Multi-Modal Input Scanner**: Accepts raw message text (SMS/WhatsApp/email), URLs, and screenshot image uploads (PNG/JPG/WEBP with client-side OCR preview and validation).
- **Evidence-Forward Visualization**: Visual emphasis on verbatim quoted evidence spans directly extracted from user submissions.
- **4-Tier Risk Banner**: High-contrast, unambiguous visual indicators for **Safe**, **Suspicious**, **Dangerous**, and **Cannot Determine**.
- **Multilingual Support**: Real-time localization across **English**, **Hindi (हिंदी)**, **Kannada (ಕನ್ನಡ)**, and **Telugu (తెలుగు)**.
- **Fail-Safe Resilience**: If the Railway backend is unreachable, the frontend automatically falls back to an internal client-side heuristic engine (lib/risk-engine.ts), ensuring users always receive safety guidance.
- **Safety Handoff**: Dedicated emergency call action (1930) and reporting link (cybercrime.gov.in) embedded directly in the action cards.

---

## 🚀 Running Locally

### 1. Install Dependencies
`ash
cd frontend
npm install
`

### 2. Configure Environment
`ash
cp .env.example .env.local
`
Ensure BACKEND_URL is set to http://127.0.0.1:8000.

### 3. Start Development Server
`ash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push your changes to GitHub.
2. Log into [Vercel](https://vercel.com) and import the repository.
3. Configure the build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: rontend
   - **Build Command**: 
ext build
   - **Output Directory**: .next
4. Add Environment Variables in Vercel:
   - BACKEND_URL: https://your-railway-backend.up.railway.app
   - NEXT_PUBLIC_APP_URL: https://your-app-name.vercel.app
5. Click **Deploy**.

---

## 📁 Directory Structure

`
frontend/
├── app/
│   ├── layout.tsx             # Root layout with fonts, metadata, and theme
│   ├── page.tsx               # Landing page with hero, quick scan, features
│   ├── check/page.tsx         # Full-featured interactive inspection screen
│   ├── safety/page.tsx        # Comprehensive fraud prevention manual
│   ├── history/page.tsx       # Local scan history view
│   ├── login/page.tsx         # Mobile OTP authentication demo
│   ├── profile/page.tsx       # User profile and security preferences
│   ├── result/[id]/page.tsx   # Detailed analysis result view
│   └── api/
│       ├── analyze/route.ts   # Backend proxy & on-device fallback router
│       └── auth/              # Mock OTP verification endpoints
├── components/                # Reusable UI components (Footer, Navbar, etc.)
├── lib/
│   ├── risk-engine.ts         # Standalone on-device heuristic engine
│   ├── url-analysis.ts        # Static URL parser & lookalike detector
│   └── whatsapp.ts            # WhatsApp scam report parser helper
├── prisma/
│   └── schema.prisma          # PostgreSQL production persistence schema
├── public/                    # Static assets, icons, and emblems
├── vercel.json                # Vercel deployment configuration
└── tsconfig.json              # TypeScript configuration
`

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| BACKEND_URL | Yes (in prod) | http://127.0.0.1:8000 | URL of the Railway FastAPI backend service |
| NEXT_PUBLIC_APP_URL | Recommended | http://localhost:3000 | Canonical public URL used for OpenGraph cards |
| DATABASE_URL | Optional | - | PostgreSQL connection string for optional persistence |
