# 🛡️ Digital Safety Co-pilot (Sudarshan Kavach)

[![Frontend - Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Backend - FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Hosted on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Hosted on Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway)](https://railway.app)
[![Tests - 158 Passed](https://img.shields.io/badge/Tests-158%20Passed-brightgreen?style=flat-square)](https://pytest.org/)
[![Indic Languages](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20KN%20%7C%20TE-orange?style=flat-square)](#-multilingual-support)
[![Privacy - Zero Retention](https://img.shields.io/badge/Privacy-Zero%20Storage-blue?style=flat-square)](#-privacy--security-invariants)

An explainable, evidence-first AI security assistant engineered to tell people **why** a message, URL, or screenshot is dangerous — not just deliver a black-box verdict.

Paste a suspicious SMS, WhatsApp message, UPI collect request, banking alert, email, or screenshot. Receive an immediate risk classification, the exact verbatim warning signs highlighted from your message, an intuitive plain-language explanation, and certified safety steps — in **English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), or Telugu (తెలుగు)**.

> *Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.*

**Team Hayagreeva** · YUKTIMANTHAN 2.0 Hackathon

---

## 🌟 Why Digital Safety Co-pilot is Different

Existing fraud detectors return a binary score or label ("safe" vs. "unsafe") and stop. A generic label doesn't educate a vulnerable citizen who just received an urgent SMS claiming their electricity connection or bank account will be blocked tonight.

Our engine produces **structured evidence, not an opaque verdict**:

`
Risk Level → Detected Warning Signs (Verbatim Evidence) → Plain Explanation → Recommended Action
`

1. **Evidence Over Verdict**: Every flagged warning quotes the exact triggering text, domain name, or pattern from the input.
2. **Honest Uncertainty Tier (Cannot Determine)**: A four-tier model (**Safe**, **Suspicious**, **Dangerous**, and **Cannot Determine**). When evidence is conflicting or inconclusive, it admits uncertainty and provides an actionable manual verification checklist rather than guessing.
3. **Regional Language Synthesis**: Safety-critical advice, reporting numbers (1930 Helpline / cybercrime.gov.in), and step-by-step guidance rendered natively in Indic languages.
4. **Resilient Dual Engine (Cloud + Edge Fallback)**: High-speed LLM reasoning via **Groq (Qwen 3.8 27B)** with a 100% offline deterministic rule engine fallback.

---

## 🏗️ System Architecture

`mermaid
flowchart TD
    User([User Input: Text / URL / Screenshot]) --> FE[Next.js 14 Frontend\nHosted on Vercel]
    FE --> API_Proxy[Next.js API Route /api/analyze]
    
    subgraph Edge_Fallback [Resilience Layer]
        API_Proxy -.->|Offline Fallback| LocalEngine[On-Device Heuristic & Rule Engine]
    end

    API_Proxy -->|Secure HTTPS| BE[FastAPI Engine\nHosted on Railway]
    
    subgraph Backend_Pipeline [FastAPI Analysis Pipeline]
        BE --> Norm[Normalizer & Unicode Cleaner]
        Norm --> OCR[Tesseract OCR Engine]
        Norm --> SignalLayer[Deterministic Signal Layer]
        
        SignalLayer --> URL_Insp[URL Inspector & WHOIS]
        SignalLayer --> Brand_Match[Brand Lookalike & Typo-squat]
        SignalLayer --> Pattern_Match[Pattern Matcher & Payment Rails]
        SignalLayer --> Channel_Check[Contact Channel Validator]
        
        SignalLayer --> Reasoner[Hybrid Reasoner Layer]
        Reasoner -->|High-Speed Inference| Groq[Groq AI - Qwen 27B]
        Reasoner -->|Offline / Degraded Path| DetReasoner[Deterministic Reasoner]
        
        Reasoner --> Arbitrate[Scoring & 4-Tier Arbitration Guard]
        Arbitrate --> Localize[Localization Layer EN / HI / KN / TE]
    end
    
    Localize --> ResultPayload([Structured Evidence Response])
    ResultPayload --> FE
`

---

## 🚀 Production Deployment

This repository is architected for turnkey production hosting:
- **Frontend**: Hosted on **Vercel** (Edge network, global CDN, SSR/Static App Router).
- **Backend**: Hosted on **Railway** (Containerized Docker runtime, automated health checks, dynamic port binding).

### 1. Backend Deployment on Railway

1. **Create a Railway Project**:
   - Go to [Railway.app](https://railway.app) and create a new project.
   - Choose **Deploy from GitHub repo** and select digital-safety-co-pilot.
2. **Set Root Directory**:
   - In Railway Service Settings, set **Root Directory** to `backend`.
   - Railway will automatically detect [`backend/Dockerfile`](backend/Dockerfile) and [`backend/railway.toml`](backend/railway.toml).
3. **Configure Environment Variables in Railway**:
   | Variable | Value / Description | Required? |
   |---|---|---|
   | `PORT` | Set automatically by Railway (defaults to 8000) | No |
   | `CORS_ORIGINS` | `*` or your Vercel URL: `https://your-app.vercel.app` | Recommended |
   | `GROQ_API_KEY` | Your Groq API key (for sub-second Qwen-27B reasoning) | Recommended |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` (default) | Optional |
   | `ENVIRONMENT` | `production` | Recommended |
4. **Deploy & Copy Domain**:
   - Railway will build the container with Python 3.11 and Tesseract OCR.
   - Generate a domain in Railway (e.g., https://digital-safety-production.up.railway.app).
   - Verify health at https://your-backend.up.railway.app/api/v1/health.

### 2. Frontend Deployment on Vercel

1. **Import Project to Vercel**:
   - Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
   - Select your digital-safety-co-pilot repository.
2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click edit and set to rontend.
   - **Build Command**: 
ext build (or leave default).
   - **Output Directory**: .next (default).
3. **Set Environment Variables in Vercel**:
   | Variable | Value | Description |
   |---|---|---|
   | BACKEND_URL | https://your-backend.up.railway.app | Points Next.js server actions to Railway backend |
   | NEXT_PUBLIC_APP_URL | https://your-app.vercel.app | Public canonical URL for OpenGraph metadata |
4. **Deploy**:
   - Click **Deploy**. Vercel deploys the Next.js app globally in under 2 minutes.

---

## 💻 Local Development Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (tested on Python 3.11 / 3.12 / 3.14)
- (Optional) Tesseract OCR for screenshot analysis

### 1. Clone the Repository
`ash
git clone https://github.com/satvikpandurangi/digital-safety-co-pilot.git
cd digital-safety-co-pilot
`

### 2. Run the Backend (FastAPI)
`ash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI backend on port 8000
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
`
Verify the backend is live: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health).

### 3. Run the Frontend (Next.js)
Open a new terminal:
`ash
cd frontend
npm install
cp .env.example .env.local

# Run Next.js on port 3000
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing and Quality Assurance

The codebase includes an exhaustive automated test suite with **158 unit and integration tests**:

`ash
cd backend
.\.venv\Scripts\python.exe -m pytest -q
# Result: 158 passed in ~1.1s
`

### Test Coverage Highlights
- **Grounding Invariants**: Validates that no model output can invent facts or cite text not present in the input.
- **Escalate-Never-De-Escalate Safety Rule**: Verified across all 4 tiers — a language model can escalate a suspicion level based on reasoning, but cannot downgrade a hard deterministic risk signal.
- **Brand Lookalike & Typo-Squatting**: Rigorous testing against SBI, HDFC, ICICI, India Post, electricity boards, and major payment brands.
- **Payment Rails & UPI Collect Traps**: Tested against fraudulent UPI collect requests, reversal scams, and advance fee patterns.
- **OCR & Image Extraction**: Verification of screenshot ingestion and degradation when OCR confidence falls below the floor.

---

## 📁 Repository Structure

`
digital-safety-co-pilot/
├── backend/                        # FastAPI Service (Hosted on Railway)
│   ├── app/
│   │   ├── main.py                 # FastAPI endpoints & CORS configuration
│   │   ├── schemas.py              # Pydantic request/response models
│   │   └── pipeline/
│   │       ├── analyzer.py         # End-to-end analysis orchestrator
│   │       ├── arbitration.py      # 4-tier decision & guardrail logic
│   │       ├── domain_age.py       # Live & mock WHOIS resolution
│   │       ├── groq_reasoner.py    # Sub-second Groq Qwen-27B engine
│   │       ├── anthropic_reasoner.py # Claude 3.5 Sonnet engine
│   │       ├── localization.py     # Multilingual generation (EN/KN/HI/TE)
│   │       ├── ocr.py              # Tesseract OCR screenshot integration
│   │       ├── reasoning.py        # Abstract Reasoner & Deterministic engine
│   │       └── signals/            # URL, brand, pattern & channel detectors
│   ├── tests/                      # 158 automated pytest test cases
│   ├── eval/                       # Python evaluation harness & dataset
│   ├── Dockerfile                  # Production container for Railway
│   ├── Procfile                    # Process command for Railway
│   ├── railway.toml                # Railway deployment config
│   ├── requirements.txt            # Production dependencies
│   └── requirements-dev.txt        # Testing dependencies
│
├── frontend/                       # Next.js 14 App (Hosted on Vercel)
│   ├── app/                        # App Router pages & API routes
│   │   ├── page.tsx                # Hero, quick scan, feature highlights
│   │   ├── check/page.tsx          # Full interactive scanner (Text/URL/Image)
│   │   ├── safety/page.tsx         # Comprehensive digital safety guide
│   │   ├── api/analyze/route.ts    # Backend proxy & on-device fallback
│   │   └── layout.tsx              # Root layout, theme, SEO metadata
│   ├── components/                 # Reusable UI components
│   ├── lib/                        # Risk engine, WhatsApp helper, URL parser
│   ├── prisma/schema.prisma        # PostgreSQL database schema
│   ├── vercel.json                 # Vercel deployment configuration
│   └── package.json                # Frontend dependencies & scripts
│
├── docs/                           # Architectural & Engineering Specifications
│   ├── README.md                   # Documentation index & status
│   ├── architecture.md             # System design, data flow, & topology
│   ├── api-spec.md                 # Full OpenAPI contract & field reference
│   ├── detection-approach.md       # Signal layer & LLM arbitration rules
│   ├── evaluation.md               # Benchmark metrics & dataset taxonomy
│   ├── false-positives.md          # Uncertainty tier & guardrail math
│   └── scope.md                    # Core features & boundary design
│
├── eval/                           # Node.js Evaluation Framework
│   ├── run.js                      # Evaluation runner
│   ├── report.js                   # Metric summary reporter
│   └── dataset.csv                 # Benchmark test cases
│
├── RUNNING.md                      # Comprehensive Deployment & Operations Manual
└── README.md                       # Main project documentation
`

---

## 🔒 Privacy & Security Invariants

1. **Zero Data Retention**: The system does not store, log, or persist user submissions, messages, or uploaded screenshots. Analysis is performed in-memory and discarded upon response delivery.
2. **Never Opens Links**: Links submitted for inspection are statically analyzed for structure, WHOIS age, character homoglyphs, and TLD reputation. We never execute or crawl untrusted links.
3. **Air-Gapped Safety Advice**: National helpline numbers (1930) and reporting portals (cybercrime.gov.in) are hard-coded in immutable localization files — they are never generated by an LLM to prevent hallucination.

---

## 👥 Team Hayagreeva

Developed for the **YUKTIMANTHAN 2.0 Hackathon**:
- **Satvik Pandurangi**
- **Aditi**
- **K Vardhan**
- **Prateek Deshpande**

## 📄 License

This project is licensed under the [MIT License](LICENSE).
