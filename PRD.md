# 🇮🇳 SahayakAI: Product Requirements Document (PRD)

**Document Version:** 1.0.0  
**Status:** Approved & Implemented  
**Standard:** Digital India • MeitY • Digital Public Infrastructure (DPI)  
**Target Platform:** Web (Desktop, Tablet, Mobile Responsive)  

---

## 1. Executive Summary

In India, central and state governments allocate over **₹3.5 Lakh Crore annually** toward welfare programs such as Pradhan Mantri Awas Yojana (PMAY-G), PM-KISAN, Ayushman Bharat (PM-JAY), and National Social Assistance Programme (NSAP). Despite statutory entitlement, **40% to 60% of eligible marginalized citizens face silent exclusion, administrative stalls, or outright application rejections**.

The primary bottleneck is not statutory ineligibility, but **administrative and socioeconomic access friction**:
1. Expired or unrenewed caste/income certificates (Tehsil delays).
2. Unseeded Aadhaar-bank account linkages preventing Direct Benefit Transfer (DBT).
3. Severe rural digital illiteracy and language barriers.
4. Geographical distance to physical Common Service Centres (CSCs / Jan Seva Kendras).

**SahayakAI** bridges India's welfare divide through a **Phygital (Physical + Digital)** governance model combining **Explainable AI (TreeSHAP)** for pre-application risk auditing, **Deterministic Rule Engines** for gazette-verified eligibility, and **Zero-Queue Priority QR Token Passes** connecting citizens to physical village kiosks.

---

## 2. Product Vision & Value Proposition

### 2.1 Vision Statement
> *"To ensure that no eligible Indian citizen is denied their statutory government welfare due to administrative friction, algorithmic obscurity, or digital illiteracy."*

### 2.2 Core Value Proposition: The 3-Step Paradigm Shift
Unlike existing portals (e.g., MyScheme) that stop at information retrieval:
```
Traditional Portals: [ Information Only ] ──> [ Citizen Left to Struggle Alone ] ──> [ Rejection ]
SahayakAI:           [ Information ] ──> [ AI Risk Prediction ] ──> [ Actionable CSC Assistance ]
```

---

## 3. User Personas

| Persona | Archetype | Needs & Pain Points | SahayakAI Solution |
| :--- | :--- | :--- | :--- |
| **Ramu Kaka** (Age 52, Rural Farmer, OBC) | Vulnerable Citizen | Low digital literacy, owns basic feature phone, speaks Bhojpuri/Hindi, faces PM-Kisan DBT stops. | Vernacular voice assistance, plain Hindi UI, single-window CSC token pass with QR code. |
| **Ramesh Sharma** (Age 28, Village VLE Operator) | CSC Kiosk Operator | Overcrowded queues, citizens bring incomplete/expired documents, high friction filing. | Scannable QR token pass, pre-screened document checklist, instant applicant profile import. |
| **Sunita Devi** (Age 45, BPL Beneficiary) | First-time Applicant | Fears applying because past housing application was rejected without explanation. | TreeSHAP Explainable AI decomposition detailing exact 40% income cert barrier and remedy. |
| **District Collector** (Varanasi / Lucknow) | State Welfare Administrator | Lacks district-level visibility on where dropouts occur before final submission. | Public Welfare Analytics Dashboard mapping rejection risk hot-spots across tehsils. |

---

## 4. Functional Requirements (FR)

### Module 1: Citizen Onboarding & Socioeconomic Profiling (FR-01)
- **FR-01.1:** Provide a 3-step progressive onboarding wizard with client-side validation.
  - *Step 1 (Demographics):* Age (18-100), Gender (Male/Female/Other), Social Category (General/OBC/SC/ST).
  - *Step 2 (Socioeconomic):* Annual Family Income (with dynamic BPL badge if $\le ₹1,20,000$), BPL Status toggle, State, District, Distance to nearest CSC (km).
  - *Step 3 (Ground Realities):* Digital Literacy level (Low/Medium/High), 4-point Document Checklist (Bank Aadhaar DBT, Income Certificate, BPL Ration Card, Caste Certificate), Prior Rejection history.
- **FR-01.2:** Dynamic round-trip travel time calculation based on distance to CSC ($\text{Time} \approx \text{Distance} \times 2.5\text{ mins}$).
- **FR-01.3:** Ephemeral local storage persistence (`sahayak_citizen_profile`) for offline resilience.

### Module 2: Deterministic Scheme Matching Rule Engine (FR-02)
- **FR-02.1:** Execute deterministic statutory eligibility checks across national schemes without AI hallucination.
- **FR-02.2:** Covered schemes include PMAY-G (Housing), PM-KISAN (Agriculture), PM-JAY (Ayushman Bharat), IGNOAPS (Old Age Pension), and PMUY (Ujjwala Gas).
- **FR-02.3:** Calculate exact match percentage (0% to 100%), verified benefits summary, and mandatory document checklists.

### Module 3: Explainable AI (XAI) Access Rejection Risk Audit (FR-03 & FR-04)
- **FR-03.1:** Predict administrative rejection probability ($0\% - 100\%$) using a pre-trained **XGBoost Classifier** ($v1.0.0$).
- **FR-03.2:** Classify risk into tri-color bands:
  - **Low Risk ($<30\%$):** Green badge • Safe to submit online.
  - **Medium Risk ($30\% - 60\%$):** Amber badge • CSC assisted filing recommended.
  - **High Risk ($>60\%$):** Red badge • Mandatory pre-certification needed before application.
- **FR-04.1:** Decompose total risk using **TreeSHAP (Shapley Additive exPlanations)** into top 3 mathematical barrier contributions (e.g., Missing Income Cert: $+40\%$, Low Literacy: $+30\%$, Distance: $+15\%$).
- **FR-04.2:** Provide a verifiable, practical **Actionable Remedy** for every identified barrier.

### Module 4: Phygital CSC Kiosk Locator & Priority Appointment Booking (FR-05 & FR-06)
- **FR-05.1:** Interactive Leaflet GIS mapping displaying registered CSC Jan Seva Kendras filtered by Pincode and District.
- **FR-05.2:** Dual-pane layout: searchable kiosk directory with operator contact details and live distance computation.
- **FR-06.1:** Priority slot reservation system generating an immutable Appointment Token (`#SAH-XXXXX`).
- **FR-06.2:** Real-time generation of an **Offline-Verifiable Scannable QR Code** encoding citizen ID, token number, center ID, and appointment timestamp.
- **FR-06.3:** Bulletproof vector SVG fallback rendering ($25 \times 25$ matrix) if backend image streaming is unavailable.

### Module 5: Gazette-Grounded Vernacular RAG AI Assistant (FR-07)
- **FR-07.1:** Floating conversational widget on all pages ("Ask Sahayak AI").
- **FR-07.2:** Retrieval-Augmented Generation (RAG) backed by a FAISS vector store indexing official Central Ministry gazettes.
- **FR-07.3:** Zero hallucination guarantee: every response must cite the official Gazette Notification Number (e.g., *Gazette No. 142/2026*).
- **FR-07.4:** Native browser Web Speech API voice capture and audio playback in Hindi (`hi-IN`) and English (`en-IN`).

### Module 6: Real-Time Application & Token Status Tracker (FR-08)
- **FR-08.1:** Single-input search by Application Reference ID or CSC Token Number.
- **FR-08.2:** 4-stage visual milestone lifecycle timeline:
  1. *Token Generated Online*
  2. *Slot Reserved at Kiosk*
  3. *Biometric e-KYC & Document Verification*
  4. *Final Directorate Sanction & DBT Disbursal*
- **FR-08.3:** Highlight actionable blockers (e.g., re-upload notification for expired Tehsil certificates).

### Module 7: CPGRAMS-Aligned AI Grievance Redressal (FR-09)
- **FR-09.1:** Natural language grievance intake in Hindi, English, and Hinglish.
- **FR-09.2:** Automated classification into target Administrative Ministry (e.g., MoA&FW, MoRD).
- **FR-09.3:** Step-by-step resolution protocol (e.g., NPCI bank Aadhaar seeding mandate submission).

### Module 8: Public Welfare Analytics Dashboard (FR-10)
- **FR-10.1:** Executive KPI metrics: Citizens Audited, High-Risk Cases, CSC Tokens Dispatched, DBT Success Rate.
- **FR-10.2:** District-level stacked risk distribution bar charts across UP & Bihar regions.
- **FR-10.3:** Scheme adoption donut chart distribution.
- **FR-10.4:** One-click administrative print/PDF export (`window.print()`).

---

## 5. Non-Functional Requirements (NFR)

| Requirement | Metric / Specification | Implementation Strategy |
| :--- | :--- | :--- |
| **Inference Latency** | $<250\text{ ms}$ for XGBoost & SHAP | Pre-loaded joblib pipelines in memory; zero disk I/O per request. |
| **API Response Time** | $<100\text{ ms}$ for 95th percentile | FastAPI asynchronous endpoints, optimized SQLite index queries. |
| **High Concurrency** | 500+ parallel transactions | SQLite WAL mode (`PRAGMA journal_mode=WAL`), connection timeout 30s. |
| **Multilingual Fidelity** | Zero bilingual cross-contamination | Pure dedicated dictionaries in `translations.ts` via `LanguageContext`. |
| **Offline Resilience** | 100% core UI operable offline | Client-side vector SVG QR generation, local storage profile caching. |
| **Accessibility** | WCAG 2.1 Level AAA | High-contrast text ($\ge 7:1$), 44px+ touch targets, Web Speech narration. |
| **Data Privacy** | DPDP Act 2023 Compliant | Ephemeral data handling, zero biometric storage, 1-click session purge. |

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

1. **Rejection Reduction Rate:** $>85\%$ reduction in pre-submission document rejection.
2. **First-Pass CSC Efficiency:** $>92\%$ of citizens visiting CSC with a SahayakAI QR pass complete filing on the first visit.
3. **Queue Time Elimination:** Average physical waiting time reduced from 4.5 hours to $<15\text{ minutes}$.
4. **Multilingual Adoption:** $>70\%$ user engagement in Hindi/Vernacular mode.
