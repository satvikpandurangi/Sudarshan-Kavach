# 📖 Operations & Deployment Manual — Digital Safety Co-pilot

This document provides complete instructions for running the **Digital Safety Co-pilot (Sudarshan Kavach AI)** locally, testing the end-to-end pipeline, and deploying the system to production on **Railway** (Backend) and **Vercel** (Frontend).

---

## Table of Contents

1. [Local Development](#1-local-development)
   - [Prerequisites](#prerequisites)
   - [Running the Backend (FastAPI)](#running-the-backend-fastapi)
   - [Running the Frontend (Next.js)](#running-the-frontend-nextjs)
2. [Production Deployment to Railway (Backend)](#2-production-deployment-to-railway-backend)
   - [Step-by-Step Deployment](#step-by-step-railway-setup)
   - [Railway Environment Variables](#railway-environment-variables)
   - [Verifying the Railway Deployment](#verifying-the-railway-deployment)
3. [Production Deployment to Vercel (Frontend)](#3-production-deployment-to-vercel-frontend)
   - [Step-by-Step Deployment](#step-by-step-vercel-setup)
   - [Vercel Environment Variables](#vercel-environment-variables)
   - [Verifying the Vercel Deployment](#verifying-the-vercel-deployment)
4. [Automated Testing & Quality Checks](#4-automated-testing--quality-checks)
   - [Backend Unit & Integration Tests](#backend-tests)
   - [Evaluation Benchmark Harness](#evaluation-harness)
   - [Frontend Production Build Check](#frontend-build-check)
5. [Production Operations & Troubleshooting](#5-production-operations--troubleshooting)
   - [CORS Configuration](#cors-configuration)
   - [Tesseract OCR Setup](#tesseract-ocr-setup)
   - [Degraded Mode & Fallbacks](#degraded-mode--fallbacks)

---

## 1. Local Development

### Prerequisites

| Tool | Minimum Version | Recommended | Notes |
|---|---|---|---|
| **Python** | 3.10+ | 3.11 / 3.12 | FastAPI backend runtime |
| **Node.js** | 18.17+ | 20+ LTS | Next.js 14 frontend runtime |
| **npm** | 9.0+ | 10.0+ | Node package manager |
| **Tesseract OCR** | 5.0+ | Latest | Optional, for screenshot analysis |

---

### Running the Backend (FastAPI)

1. Open a terminal and navigate to the ackend/ directory:
   `ash
   cd backend
   `

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     `powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     `
   - **macOS / Linux**:
     `ash
     python3 -m venv .venv
     source .venv/bin/activate
     `

3. Install project dependencies:
   `ash
   pip install -r requirements.txt
   `

4. Configure your local environment:
   `ash
   cp .env.example .env
   `
   *(Optionally, add your GROQ_API_KEY or ANTHROPIC_API_KEY inside .env to test LLM reasoning).*

5. Start the FastAPI development server:
   `ash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   `

6. Verify the server is running by opening:
   - Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)
   - Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Running the Frontend (Next.js)

1. Open a second terminal window and navigate to rontend/:
   `ash
   cd frontend
   `

2. Install Node dependencies:
   `ash
   npm install
   `

3. Configure your local frontend environment:
   `ash
   cp .env.example .env.local
   `
   Ensure BACKEND_URL=http://127.0.0.1:8000 is present.

4. Start the Next.js development server:
   `ash
   npm run dev
   `

5. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 2. Production Deployment to Railway (Backend)

The backend is packaged with a dedicated [ackend/Dockerfile](backend/Dockerfile) and [ackend/railway.toml](backend/railway.toml) for containerized deployment on **Railway**.

### Step-by-Step Railway Setup

1. **Log in to Railway**:
   Navigate to [railway.app](https://railway.app) and sign in with your GitHub account.

2. **Create a New Project**:
   - Click **New Project** > **Deploy from GitHub repo**.
   - Select your repository: digital-safety-co-pilot.

3. **Set the Service Root Directory**:
   - In your Railway dashboard, click on the newly created service.
   - Go to **Settings** > **General**.
   - Under **Root Directory**, enter: ackend.
   - Click **Save**.

4. **Verify Build Configuration**:
   - Railway will automatically detect [ackend/Dockerfile](backend/Dockerfile).
   - Under **Deployments**, Railway builds the container using Python 3.11-slim, installs Tesseract OCR with Indic language packs, installs requirements, and launches Uvicorn.

5. **Configure Environment Variables in Railway**:
   Go to the **Variables** tab of the service and add:

   | Variable | Value | Explanation |
   |---|---|---|
   | `PORT` | *(Leave empty)* | Railway injects this dynamically. Uvicorn binds to `${PORT:-8000}`. |
   | `CORS_ORIGINS` | `*` *(or your Vercel URL)* | Allows cross-origin requests from your frontend. |
   | `GROQ_API_KEY` | `gsk_...` | Enables ultra-fast Groq Qwen-27B reasoning. |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` | Default Groq model for explanation generation. |
   | `ENVIRONMENT` | `production` | Declares production environment. |

6. **Generate a Public Domain**:
   - Go to **Settings** > **Networking** > **Generate Domain**.
   - You will receive a URL like: https://digital-safety-production.up.railway.app.

### Verifying the Railway Deployment

Test your live backend using curl or a browser:

`ash
# 1. Health check
curl -X GET "https://your-railway-backend.up.railway.app/api/v1/health"
# Expected response: {"status":"ok","reasoning_layer":"ok","ocr":"ok"}

# 2. Text analysis endpoint
curl -X POST "https://your-railway-backend.up.railway.app/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your SBI account is blocked. Update KYC at http://sbi-kyc-verify.online immediately", "language": "en"}'
`

---

## 3. Production Deployment to Vercel (Frontend)

The frontend is a Next.js 14 App Router application configured for edge deployment on **Vercel**.

### Step-by-Step Vercel Setup

1. **Log in to Vercel**:
   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Import the Repository**:
   - Click **Add New** > **Project**.
   - Locate and import digital-safety-co-pilot.

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click **Edit** and choose rontend.
   - **Build Command**: 
ext build (default).
   - **Output Directory**: .next (default).
   - **Install Command**: 
pm install (default).

4. **Set Environment Variables in Vercel**:
   Expand the **Environment Variables** section and add:

   | Variable | Value | Explanation |
   |---|---|---|
   | BACKEND_URL | https://your-railway-backend.up.railway.app | Points Next.js API routes to your live Railway backend. |
   | NEXT_PUBLIC_APP_URL | https://your-app-name.vercel.app | Sets canonical domain for OpenGraph cards & metadata. |

5. **Click Deploy**:
   Vercel will compile the Next.js bundle, optimize static routes, and deploy the application globally.

### Verifying the Vercel Deployment

1. Visit your public Vercel URL (e.g., https://sudarshan-kavach.vercel.app).
2. Test a sample scan on the home page.
3. Test language switching across **English**, **Hindi (हिंदी)**, **Kannada (ಕನ್ನಡ)**, and **Telugu (తెలుగు)**.
4. Upload a sample screenshot to verify OCR analysis end-to-end.

---

## 4. Automated Testing & Quality Checks

### Backend Tests

To execute the entire 158-test suite:

`ash
cd backend
.\.venv\Scripts\python.exe -m pytest -v
`

All tests run fully offline without requiring API keys or external network connections:
- 	est_checkpoint_10.py: Verifies deterministic baseline accuracy.
- 	est_groq_reasoner.py: Verifies Groq inference and JSON parsing.
- 	est_anthropic_reasoner.py: Verifies Claude grounding and invariants.
- 	est_evidence_invariant.py: Asserts no hallucinated or ungrounded evidence can be returned.
- 	est_arbitration.py: Asserts escalate-never-de-escalate and conflict handling.
- 	est_phase3_payment_rail.py: Asserts UPI collect, reverse-scam, and advance-fee detectors.
- 	est_image_endpoint.py: Asserts OCR image extraction and confidence degradation.

### Evaluation Harness

To run the 100-message benchmark dataset:

`ash
cd backend
# Run deterministic evaluation (no key needed):
.\.venv\Scripts\python.exe -m eval.run_eval

# Run model evaluation (requires GROQ_API_KEY or ANTHROPIC_API_KEY):
.\.venv\Scripts\python.exe -m eval.run_eval --mode groq
`

### Frontend Build Check

To verify that the Next.js frontend builds without errors:

`ash
cd frontend
npm run build
`

Expected output:
`
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (13/13)
✓ Finalizing page optimization
`

---

## 5. Production Operations & Troubleshooting

### CORS Configuration
If your frontend on Vercel reports NetworkError or CORS blocked:
1. Check that CORS_ORIGINS in your Railway backend environment variables includes your Vercel URL (e.g. https://your-app.vercel.app), or is set to *.
2. Check that BACKEND_URL in your Vercel project settings does not have a trailing slash.

### Tesseract OCR Setup
In the Railway production container ([ackend/Dockerfile](backend/Dockerfile)), Tesseract OCR and Indic language packs are pre-installed in the Linux system paths.

For local Windows development:
1. Install Tesseract OCR: winget install UB-Mannheim.TesseractOCR
2. Set the binary path in ackend/.env:
   `env
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   `

### Degraded Mode & Fallbacks
The system is architected to never crash even when third-party services fail:
- **No LLM Key / API Quota Exhausted**: The backend automatically falls back to DeterministicReasoner, delivering accurate risk classifications with deterministic explanations.
- **Railway Backend Offline**: The Next.js frontend route (rontend/app/api/analyze/route.ts) automatically falls back to the client-side heuristic engine ([rontend/lib/risk-engine.ts](frontend/lib/risk-engine.ts)), ensuring user queries are always answered.
