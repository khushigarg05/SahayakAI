# SahayakAI (सहायक AI) 🇮🇳
### AI-Powered Welfare Access Intelligence & Citizen Assistance Platform
*An Academic Engineering Capstone / Mini-Project for Digital India Welfare Inclusivity*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/Machine%20Learning-XGBoost%2097.4%25%20Acc-FF6F00)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/Explainable%20AI-SHAP%20Values-blue)](https://shap.readthedocs.io/)
[![TestSprite](https://img.shields.io/badge/Automated%20QA-TestSprite%20MCP%20Verified%20(100%25)-brightgreen)](https://www.testsprite.com/)
[![License](https://img.shields.io/badge/License-MIT%20Academic-blue.svg)](#license)

---

## 📌 1. Project Overview & Problem Statement

Despite India's extensive welfare architecture comprising thousands of Central and State schemes (e.g., PM-KISAN, Ayushman Bharat, PMAY-G), millions of eligible rural and economically vulnerable citizens remain excluded due to the **"Last-Mile Informational Divide"**.

Common barriers include:
1. **Opaque Statutory Criteria:** Citizens struggle to identify which schemes match their demographic profile.
2. **High Application Rejection Rates:** Discrepancies in documents, lack of digital literacy, and distance to physical Common Service Centers (CSCs) lead to unexpected rejections.
3. **Lack of Language Accessibility:** Official scheme documentation is predominantly technical and unavailable in conversational regional dialects.

**SahayakAI** addresses these challenges through a unified, full-stack intelligence platform that provides **deterministic scheme eligibility matching**, **explainable AI access risk scoring**, **multilingual conversational assistance (RAG)**, and **direct Jan Seva Kendra / CSC kiosk priority token booking**.

---

## 🚀 2. Key Architecture & Features

### A. Deterministic Scheme Eligibility Engine
- Rule-based evaluation engine validating citizen profiles (age, annual income, social category, landholding, BPL status, and gender) against statutory guidelines.
- Authoritative mapping to official portals (`pmkisan.gov.in`, `pmayg.nic.in`, `nsap.nic.in`, `pmjay.gov.in`, `pmuy.gov.in`) with statutory disclaimers and document checklists.

### B. Explainable AI Access Risk Meter (XGBoost + SHAP)
- Machine Learning classification model assessing application vulnerability into **Low**, **Medium**, or **High Risk**.
- Integrated **TreeSHAP explainability engine** computing per-citizen feature contributions to explain *why* an application is at risk (e.g., missing income certificate, lack of bank-Aadhaar linking).

### C. Multilingual RAG Conversational Assistant
- Retrieval-Augmented Generation (RAG) assistant delivering scheme guidance grounded in official ministry rulebooks.
- Zero-crash fallback architecture with regional script support (Hindi, English, Bengali, Telugu, and Hinglish).

### D. CSC Jan Seva Kendra Discovery & QR Pass Booking
- Geo-spatial directory search filtering active CSC centers by district or 6-digit postal pincode.
- Generates immutable appointment tokens and scannable base64 QR passes for streamlined offline verification.

### E. Dynamic OCR Document Pre-Screening
- Client-side and server-side document analysis pre-screening Aadhaar, Income, and Caste certificates for expiration and readability issues prior to formal submission.
- Honest offline error handling with active user retry.

### F. Multi-Tier Security & Rate Limiting
- **Password Hashing:** `bcrypt` with cost factor 12 and safe 72-byte truncation.
- **Session Auth:** Digitally signed JWT tokens (`HS256`).
- **Authorization:** IDOR multi-tenant isolation guarding private citizen records.
- **Hybrid Rate Limiter:** Sliding-window rate limiting protecting login (10 req/min) and chat (30 req/min), supporting distributed Redis in cloud deployments and thread-safe in-memory execution locally.

---

## 🧠 3. Machine Learning Methodology

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│ Citizen Profile │ ──> │ Feature Preprocessor │ ──> │  XGBoost Classifier  │
│ (Demographics)  │     │ (One-Hot & Scaler)   │     │ (97.4% Test Accuracy)│
└─────────────────┘     └─────────────────────┘     └──────────┬───────────┘
                                                               │
                                                               v
                                                    ┌──────────────────────┐
                                                    │  TreeSHAP Explainer  │
                                                    │ (Barrier Detection)  │
                                                    └──────────────────────┘
```

- **Feature Engineering:** Socioeconomic vulnerability indicators including annual income, BPL status, caste category, land acreage, distance to nearest CSC (km), digital literacy level, and bank account Aadhaar-linking.
- **Model Evaluation:** Evaluated across Logistic Regression, Random Forest, and XGBoost. XGBoost achieved top performance:
  - **Accuracy:** `97.40%`
  - **Precision:** `0.97` | **Recall:** `0.97` | **F1-Score:** `0.97`
- **Explainability:** SHAP values rank the top structural barriers preventing successful scheme disbursement, guiding the citizen on actionable remedies before applying.

> **Academic Note on Data Ethics:**  
> In compliance with data privacy principles and the Digital Personal Data Protection (DPDP) Act 2023, the ML models in this project were trained and evaluated exclusively on **representative synthetic socioeconomic datasets** engineered for academic demonstration. No real citizen PII was collected or utilized.

---

## 🛠️ 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap |
| **Backend** | FastAPI, Python 3.11, Pydantic V2, SQLAlchemy, Uvicorn, SQLite WAL (PostgreSQL Ready) |
| **Machine Learning** | Scikit-learn, XGBoost, SHAP, Joblib, Pillow |
| **Security** | Passlib, Bcrypt, Python-Jose (JWT), Custom Sliding-Window Rate Limiter |
| **Testing & QA** | TestSprite MCP Cloud Automation, Pytest, Next.js Static Optimization |

---

## 💻 5. Installation & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Python:** v3.10 or v3.11
- **Git**

### A. Backend Setup
```bash
# 1. Clone the repository
git clone https://github.com/khushigarg05/SahayakAI.git
cd SahayakAI

# 2. Create and activate a Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env

# 5. Seed the database with initial schemes and CSC kiosks
PYTHONPATH=. python app/db/seed_data.py

# 6. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be live at `http://localhost:8000` (Interactive Swagger docs: `http://localhost:8000/docs`).

### B. Frontend Setup
```bash
# Open a new terminal in the project root
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Configure frontend environment variables
cp .env.example .env.local

# 3. Start the Next.js development server
npm run dev
```
The citizen web application will be accessible at `http://localhost:3000`.

### C. One-Command Docker Setup (Recommended for Evaluation)
Run the entire full-stack platform (FastAPI + ML Intelligence + Next.js 15) in isolated production-ready containers with a single command:

```bash
# Build and run all services in the background
docker compose up --build -d

# View live streaming container logs
docker compose logs -f

# Stop all containers
docker compose down
```
- **Citizen Web App**: `http://localhost:3000`
- **FastAPI Backend & Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Backend Health Check**: `http://localhost:8000/health`

---

## 🧪 6. Testing & Automated Verification

SahayakAI features a comprehensive full-stack testing harness covering **64 automated verification checks** with a **100% pass rate**:

```bash
# 1. Run Core Python Backend Regression Suite (23 Tests)
PYTHONPATH=backend python scratch/run_full_qa_suite.py

# 2. Run Dynamic OCR Document Extraction Suite (5 Tests)
PYTHONPATH=backend python backend/test_ocr_dynamic.py

# 3. Run ML Diagnostic & Classification Benchmark
PYTHONPATH=backend python ml/src/test_predictions_v2.py

# 4. Run SQLite WAL Concurrency & Stress Load Benchmark (300 Requests)
PYTHONPATH=backend python backend/benchmark_sqlite_concurrency.py

# 5. Run Frontend TypeScript Type Check & ESLint Audit
cd frontend
npx tsc --noEmit
npm run lint

# 6. Compile Next.js Production Bundle (All 15 Routes)
npm run build
```

### TestSprite MCP Cloud Automation Results
SahayakAI was independently audited by the **TestSprite AI Cloud Testing Fleet**:
- **Backend APIs:** 5 / 5 PASSED (100%)
- **Frontend UI Browser Flows:** 5 / 5 PASSED (100%)
- *Full Cloud Reports:* See `testsprite_tests/testsprite-mcp-test-report.md` and `testsprite_tests/testsprite-frontend-test-report.md`.

---

## 📁 7. Project Directory Structure

```
SahayakAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Endpoints (Auth, Schemes, Kiosks, Risk, Chat, Dashboard)
│   │   ├── core/           # Config, Security, Hybrid Rate Limiter
│   │   ├── db/             # SQLAlchemy Session, Seed Data
│   │   ├── ml_artifacts/   # Trained XGBoost, Scaler, and Vector Store
│   │   ├── models/         # Database Models (User, Citizen, Scheme, Kiosk, Appt)
│   │   ├── schemas/        # Pydantic Request/Response DTOs
│   │   └── services/       # ML Risk, SHAP, OCR, RAG, and OTP Services
│   ├── benchmark_sqlite_concurrency.py  # Concurrency benchmark
│   ├── test_api_setu.py    # API Setu sandbox suite
│   ├── test_ocr_dynamic.py # OCR verification suite
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── app/                # Next.js App Router Pages (15 Routes)
│   │   ├── (auth)/         # Login & Register
│   │   └── (dashboard)/    # Dashboard, Onboarding, Schemes, Map, Documents, Tracker
│   ├── components/         # UI Components, AIAssistantWidget, DynamicMap
│   ├── context/            # Language & Auth Providers
│   └── lib/                # API Client, Firebase Auth, Translations
├── ml/
│   ├── data/               # Synthetic Training Datasets
│   ├── notebooks/          # Exploratory Data Analysis & Model Training
│   └── src/                # Model Training, Evaluation, and Diagnostic Pipelines
├── testsprite_tests/       # TestSprite Automated Cloud Test Scripts & Plans
├── ARCHITECTURE.md         # Full System Architecture Specifications
├── PRD.md                  # Product Requirements Document
├── SECURITY.md             # Security Protocols & DPDP Compliance
└── README.md               # Project Master Documentation
```

---

## ⚖️ 8. Statutory Disclaimer

> **Academic Facilitation Notice:**  
> SahayakAI is an AI-assisted research and facilitation platform developed for academic evaluation. It does not replace official statutory discretion. Final welfare entitlements, eligibility determinations, and disbursements remain subject to verification by competent government authorities under relevant ministry rules and operational guidelines.

---

## 👥 Contributors & Academic Credits
- **Project:** SahayakAI
- **Focus:** AI for Social Good / Digital India Welfare Inclusion
- **Frameworks:** Google Antigravity & TestSprite AI Automated QA
