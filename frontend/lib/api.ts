/**
 * SahayakAI Frontend API Client
 * Seamlessly connects React/Next.js frontend with FastAPI backend (17 endpoints)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- HEALTH & STATUS ---
export async function checkBackendHealth(): Promise<{ status: string; version: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend unhealthy");
    return await res.json();
  } catch (err) {
    return { status: "offline", version: "unknown", service: "SahayakAI Gateway" };
  }
}

// --- AUTHENTICATION APIS ---
export async function loginUser(mobile: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Invalid mobile number or password");
  }
  return await res.json();
}

export async function sendOTP(mobile: string): Promise<{
  mobile: string;
  message: string;
  expires_in_seconds: number;
  resend_available_in_seconds: number;
  demo_otp?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "OTP dispatch failed. Please check your mobile number.");
  }
  return await res.json();
}

export async function verifyOTP(
  mobile: string,
  otp: string,
  fullName?: string
): Promise<{
  access_token: string;
  token_type: string;
  user_id: number;
  mobile: string;
  role: string;
  is_new_user: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp, full_name: fullName }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Invalid OTP code. Please try again.");
  }
  return await res.json();
}

export async function firebaseLogin(
  mobile: string,
  idToken?: string,
  fullName?: string
): Promise<{
  access_token: string;
  token_type: string;
  user_id: number;
  mobile: string;
  role: string;
  is_new_user: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/firebase-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, id_token: idToken, full_name: fullName }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Firebase login failed");
  }
  return await res.json();
}

export async function registerUser(data: {
  mobile: string;
  password?: string;
  confirm_password?: string;
  email?: string;
  full_name?: string;
  role?: string;
  auto_generate_password?: boolean;
}): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      role: (data.role || "citizen").toLowerCase(),
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Registration failed");
  }
  return await res.json();
}



// --- MODULE 2: RULE ENGINE SCHEME MATCHING ---
export interface SchemeMatchParams {
  age: number;
  annual_income: number;
  bpl_status: boolean;
  gender: string;
  caste_category: string;
  occupation?: string;
  rural_or_urban?: string;
  has_income_certificate?: boolean;
  bank_account_aadhaar_linked?: boolean;
  has_caste_certificate?: boolean;
  has_bpl_ration_card?: boolean;
  state?: string;
  district?: string;
}

export interface MatchedScheme {
  scheme_id: number;
  scheme_code: string;
  name: string;
  category: string;
  match_percentage: number;
  is_eligible: boolean;
  benefits_summary: string;
  matched_criteria: string[];
  unmatched_criteria: string[];
  required_documents: string[];
  official_url?: string;
}

export interface SchemeMatchResponse {
  citizen_id?: number;
  total_eligible: number;
  schemes: MatchedScheme[];
}

export async function matchSchemes(data: SchemeMatchParams): Promise<SchemeMatchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/schemes/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to match schemes: ${res.statusText}`);
  }
  return await res.json();
}

export async function getAllSchemes(): Promise<MatchedScheme[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/schemes`);
    if (!res.ok) throw new Error("Failed to fetch schemes catalog");
    const data = await res.json();
    return data.map((s: MatchedScheme & { id?: number }) => ({
      ...s,
      scheme_id: s.scheme_id || s.id || 0,
      id: s.id || s.scheme_id || 0
    }));
  } catch (err) {
    console.warn("Using default central schemes:", err);
    return [
      {
        scheme_id: 1,
        scheme_code: "PMAY-G",
        name: "Pradhan Mantri Awas Yojana - Gramin",
        category: "Housing",
        match_percentage: 100,
        is_eligible: true,
        benefits_summary: "Rs. 1,20,000 in plain areas / Rs. 1,30,000 in hilly areas + 90 days MGNREGA wages",
        matched_criteria: ["Income < Rs. 1,20,000", "BPL Status Verified", "Rural Resident"],
        unmatched_criteria: [],
        required_documents: ["Aadhaar Card", "Bank Account Passbook", "BPL Ration Card", "Land Possession Proof"],
        official_url: "https://pmayg.nic.in"
      },
      {
        scheme_id: 2,
        scheme_code: "PM-KISAN",
        name: "Pradhan Mantri Kisan Samman Nidhi",
        category: "Agriculture",
        match_percentage: 100,
        is_eligible: true,
        benefits_summary: "Rs. 6,000 per year deposited directly into bank accounts in 3 equal installments",
        matched_criteria: ["Landholder Farmer", "Aadhaar e-KYC Active"],
        unmatched_criteria: [],
        required_documents: ["Aadhaar Card", "Land Record (Khatauni)", "Bank Account (Aadhaar Linked)"],
        official_url: "https://pmkisan.gov.in"
      },
      {
        scheme_id: 3,
        scheme_code: "IGNOAPS",
        name: "Indira Gandhi National Old Age Pension Scheme",
        category: "Pension",
        match_percentage: 100,
        is_eligible: true,
        benefits_summary: "Rs. 1,000 to Rs. 1,500 monthly direct DBT pension for senior citizens",
        matched_criteria: ["Age >= 60", "BPL Family"],
        unmatched_criteria: [],
        required_documents: ["Age Certificate / Aadhaar", "BPL Ration Card", "Bank Passbook"],
        official_url: "https://nsap.nic.in"
      },
      {
        scheme_id: 4,
        scheme_code: "PM-JAY",
        name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
        category: "Health",
        match_percentage: 100,
        is_eligible: true,
        benefits_summary: "Rs. 5,00,000 cashless hospital health insurance cover per family per year",
        matched_criteria: ["SECC 2011 Deprivation Criteria", "BPL / Antyodaya"],
        unmatched_criteria: [],
        required_documents: ["Ration Card", "Aadhaar Card"],
        official_url: "https://pmjay.gov.in"
      },
      {
        scheme_id: 5,
        scheme_code: "PMUY",
        name: "Pradhan Mantri Ujjwala Yojana (Ujjwala 2.0)",
        category: "Energy",
        match_percentage: 100,
        is_eligible: true,
        benefits_summary: "Free LPG connection with subsidized cylinder refill and stove",
        matched_criteria: ["Adult Woman in BPL Household", "No Existing LPG Connection"],
        unmatched_criteria: [],
        required_documents: ["BPL Ration Card", "Aadhaar Card of Applicant", "Bank Passbook"],
        official_url: "https://pmuy.gov.in"
      }
    ];
  }
}

// --- MODULE 3: ML RISK & SHAP BARRIER ASSESSMENT ---
export interface AssessRiskParams {
  scheme_id: number;
  citizen_id?: number;
  age?: number;
  annual_income?: number;
  bpl_status?: boolean;
  gender?: string;
  caste_category?: string;
  distance_to_csc_km?: number;
  digital_literacy?: "Low" | "Medium" | "High";
  has_income_certificate?: boolean;
  bank_account_aadhaar_linked?: boolean;
  has_caste_certificate?: boolean;
  prior_rejections_count?: number;
}

export interface SHAPBarrier {
  factor_key: string;
  factor: string;
  factor_hi?: string;
  impact_percentage: string;
  description: string;
  description_hi?: string;
  remedy: string;
  remedy_hi?: string;
}

export interface ActionStep {
  step_number: number;
  title: string;
  instruction: string;
  action_type: "document" | "bank" | "kiosk" | "online";
}

export interface AssessRiskResponse {
  citizen_id?: number;
  scheme_id: number;
  scheme_name: string;
  scheme_code: string;
  eligibility_match: string;
  is_eligible: boolean;
  risk_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  top_barriers: SHAPBarrier[];
  action_plan: ActionStep[];
  required_documents: string[];
}

export async function assessRisk(data: AssessRiskParams): Promise<AssessRiskResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/risk/assess-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to assess risk: ${res.statusText}`);
  }
  return await res.json();
}

// --- MODULE 4: KIOSK SEARCH & QR TOKEN BOOKING ---
export interface Kiosk {
  id: number;
  center_name: string;
  name?: string;
  vle_operator_name: string;
  operator_name?: string;
  phone: string;
  contact_number?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: string;
  supported_services?: string;
  distance_km?: number;
}

export async function getNearbyKiosks(pincode?: string, district?: string): Promise<Kiosk[]> {
  const params = new URLSearchParams();
  if (pincode) params.append("pincode", pincode);
  if (district) params.append("district", district);

  const res = await fetch(`${API_BASE_URL}/api/v1/kiosks/nearby?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch kiosks: ${res.statusText}`);
  }
  return await res.json();
}

export interface BookTokenParams {
  citizen_id?: number;
  kiosk_id: number;
  scheme_id?: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time_slot: string;
  preferred_language?: string;
  notes?: string;
}

export interface TokenResponse {
  token_number: string;
  appointment_id?: number;
  status?: string;
  kiosk_name: string;
  operator_name?: string;
  operator_phone?: string;
  kiosk_address: string;
  appointment_date: string;
  appointment_time_slot?: string;
  time_slot?: string;
  qr_code_base64: string;
  preferred_language?: string;
  receipt_title?: string;
  status_message?: string;
  localized_instructions?: string[];
  instructions?: string[];
}

export async function bookKioskToken(data: BookTokenParams): Promise<TokenResponse> {
  const payload = {
    citizen_id: data.citizen_id || 1,
    kiosk_id: data.kiosk_id,
    scheme_id: data.scheme_id || 1,
    appointment_date: data.appointment_date,
    appointment_time_slot: data.appointment_time_slot,
    preferred_language: data.preferred_language || "hi",
    notes: data.notes || "CSC assisted registration",
  };

  const res = await fetch(`${API_BASE_URL}/api/v1/kiosks/book-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to book token: ${res.statusText}`);
  }
  return await res.json();
}

export interface TrackingStepData {
  name: string;
  name_hi?: string;
  date: string;
  date_hi?: string;
  completed: boolean;
  current?: boolean;
  error?: string;
  error_hi?: string;
}

export interface TrackingDetailData {
  id: string;
  scheme_name: string;
  scheme_name_hi: string;
  type: string;
  type_hi: string;
  status: string;
  status_hi: string;
  kiosk_name: string;
  date: string;
  date_hi: string;
  progress: number;
  qr_code_base64?: string;
  operator_phone?: string;
  steps: TrackingStepData[];
}

export async function fetchTrackingDetail(referenceId: string): Promise<TrackingDetailData> {
  const encoded = encodeURIComponent(referenceId.trim());
  const res = await fetch(`${API_BASE_URL}/api/v1/kiosks/track/${encoded}`);
  if (!res.ok) {
    throw new Error(`Failed to track reference: ${res.statusText}`);
  }
  return await res.json();
}

// --- MODULE 5: MULTILINGUAL AI CHATBOT (RAG) ---
export interface ChatResponse {
  answer: string;
  response?: string;
  detected_language: string;
  matched_scheme?: string;
  confidence_score?: number;
  source_gazette?: string;
  source_guidelines?: string[];
  suggested_action?: string;
}

export async function sendChatMessage(message: string, language: string = "hi"): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send chat: ${res.statusText}`);
  }
  const data = await res.json();
  return {
    ...data,
    answer: data.answer || data.response || "",
    response: data.response || data.answer || ""
  };
}

export async function fetchSpeechAudio(text: string, voiceId?: string): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId }),
  });
  if (!res.ok) {
    throw new Error(`TTS generation failed: ${res.statusText}`);
  }
  return await res.blob();
}

export interface DocumentAuditResult {
  document_type: string;
  filename: string;
  is_valid: boolean;
  confidence_score: number;
  clarity_rating: string;
  hologram_or_seal_detected: boolean;
  masked_identifier: string;
  raw_identifier?: string;
  detected_name?: string;
  detected_dob?: string;
  detected_age?: number;
  detected_gender?: string;
  detected_date: string;
  is_expired: boolean;
  findings: string[];
  recommendation: string;
}

export async function verifyUploadedDocument(file: File, documentType: string = "income"): Promise<DocumentAuditResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/verify`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Document audit failed: ${errorText}`);
  }

  return await res.json();
}

// --- API SETU DEVELOPER SANDBOX APIS ---
export interface ApiSetuDocRequest {
  doc_type: string; // income, ration, dbt, caste
  doc_number: string;
  state?: string;
  citizen_name?: string;
  aadhaar_last_four?: string;
}

export interface ApiSetuDocResponse {
  status: "verified" | "expired" | "rejected" | "not_found";
  is_valid: boolean;
  is_expired: boolean;
  doc_type: string;
  doc_number: string;
  holder_name: string;
  authority: string;
  issue_date?: string;
  expiry_date?: string;
  verified_via: string;
  signature_hash: string;
  metadata: Record<string, unknown>;
  message: string;
  message_hi: string;
}

export interface ApiSetuSampleItem {
  doc_type: string;
  doc_number: string;
  label: string;
  label_hi: string;
  expected_status: string;
  details: string;
  details_hi: string;
  auto_fill: Record<string, unknown>;
}

export async function verifyDocumentWithApiSetu(payload: ApiSetuDocRequest): Promise<ApiSetuDocResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apisetu/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "API Setu verification request failed");
  }
  return await res.json();
}

export async function getApiSetuSamples(): Promise<{ sandbox_mode: boolean; samples: ApiSetuSampleItem[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/apisetu/samples`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load sample documents");
    return await res.json();
  } catch (err) {
    return {
      sandbox_mode: true,
      samples: [
        {
          doc_type: "income",
          doc_number: "UP/INC/2026/89412",
          label: "Valid UP Income Certificate",
          label_hi: "वैध उत्तर प्रदेश आय प्रमाण पत्र",
          expected_status: "verified",
          details: "₹65,000/yr • UP Revenue Dept • Valid until 2029",
          details_hi: "₹65,000/वर्ष • राजस्व विभाग उ.प्र. • 2029 तक वैध",
          auto_fill: { income: 65000, has_income_certificate: true }
        },
        {
          doc_type: "dbt",
          doc_number: "DBT-ACTIVE-9102",
          label: "Active NPCI Aadhaar DBT Account",
          label_hi: "सक्रिय NPCI आधार DBT बैंक खाता",
          expected_status: "verified",
          details: "SBI • DBT Active • Direct Welfare Transfer OK",
          details_hi: "SBI बैंक • DBT सक्रिय • सीधा नकद भुगतान सुरक्षित",
          auto_fill: { has_bank_account: true, dbt_active: true }
        }
      ]
    };
  }
}

export interface RegionalStatsResponse {
  is_live_data?: boolean;
  data_mode?: "LIVE_DATABASE" | "DEMO_BASELINE" | "NO_DATA_AVAILABLE";
  demo_notice?: string | null;
  database_live_metrics?: {
    citizens_registered: number;
    csc_tokens_dispatched: number;
    active_districts: number;
  };
  kpis: {
    citizens_audited: number;
    high_risk_cases: number;
    csc_tokens_dispatched: number;
    dbt_success_rate: number;
  };
  district_risk_breakdown: Array<{
    district: string;
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  }>;
  scheme_adoption_share: Array<{
    name: string;
    share_percentage: number;
    beneficiaries: number;
  }>;
}

export async function getRegionalStats(): Promise<RegionalStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/regional-stats`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch regional stats: ${res.statusText}`);
  }
  return await res.json();
}

