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

export async function registerUser(data: {
  mobile: string;
  password?: string;
  confirm_password?: string;
  email?: string;
  full_name?: string;
  role?: string;
  auto_generate_password?: boolean;
}): Promise<any> {
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
    return data;
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
  impact_percentage: string;
  description: string;
  remedy: string;
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
  vle_operator_name: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
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

// --- MODULE 5: MULTILINGUAL AI CHATBOT (RAG) ---
export interface ChatResponse {
  answer: string;
  detected_language: string;
  matched_scheme?: string;
  confidence_score?: number;
  source_gazette?: string;
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
  return await res.json();
}
