"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  ArrowRight, 
  Building2, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  Award,
  Wallet,
  Calendar,
  BadgeAlert,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { AssessRiskResponse, SchemeMatchResponse, MatchedScheme, SHAPBarrier, ActionStep, assessRisk, matchSchemes } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

function localizeBarrier(b: SHAPBarrier, lang: "en" | "hi") {
  const key = b.factor_key || "";
  const factorLower = (b.factor || "").toLowerCase();

  if (lang === "hi") {
    if (b.factor_hi && b.description_hi && b.remedy_hi) {
      return { factor: b.factor_hi, description: b.description_hi, remedy: b.remedy_hi };
    }
    if (key === "has_income_certificate" || factorLower.includes("income")) {
      return {
        factor: "आय प्रमाण पत्र अनुपलब्ध (Missing Income Certificate)",
        description: "तहसील द्वारा पिछले 6 माह के भीतर जारी वैध आय प्रमाण पत्र न होने से फॉर्म प्रशासनिक जांच (स्क्रूटनी) में निरस्त हो सकता है।",
        remedy: "तहसील राजस्व कार्यालय या निकटतम सीएससी केंद्र जाकर आय प्रमाण पत्र का नवीनीकरण या नया आवेदन करवाएं।"
      };
    }
    if (key === "has_caste_certificate" || factorLower.includes("caste")) {
      return {
        factor: "जाति प्रमाण पत्र अनुपलब्ध (Missing Caste Certificate)",
        description: "आरक्षित वर्ग हेतु निर्धारित सब्सिडी एवं सरकारी सहायता का लाभ प्राप्त करने के लिए अधिकृत जाति प्रमाण पत्र अनिवार्य है।",
        remedy: "राज्य के ई-डिस्ट्रिक्ट पोर्टल अथवा तहसील कार्यालय से प्रमाणित जाति प्रमाण पत्र जारी करवाएं।"
      };
    }
    if (key === "has_bpl_ration_card" || factorLower.includes("ration")) {
      return {
        factor: "बीपीएल / अंत्योदय राशन कार्ड अनुपलब्ध",
        description: "आवास एवं खाद्यान्न जैसी प्रमुख योजनाओं में गरीबी रेखा (बीपीएल) पात्रता साबित करने के लिए वैध राशन कार्ड अनिवार्य है।",
        remedy: "खाद्य एवं रसद विभाग के पोर्टल अथवा निकटतम जन सेवा केंद्र पर जाकर नया राशन कार्ड आवेदन करें।"
      };
    }
    if (key === "bank_account_aadhaar_linked" || factorLower.includes("bank") || factorLower.includes("dbt")) {
      return {
        factor: "बैंक खाता आधार (DBT) से लिंक नहीं",
        description: "बैंक खाता एनपीसीआई मैपर में आधार से लिंक न होने के कारण सरकारी डीबीटी योजना की धनराशि खाते में हस्तांतरित नहीं हो पाएगी।",
        remedy: "अपनी बैंक शाखा में जाकर आधार सीडिंग मैंडेट फॉर्म जमा करें ताकि प्रत्यक्ष लाभ हस्तांतरण (DBT) सक्रिय हो सके।"
      };
    }
    if (key === "distance_to_csc_km" || factorLower.includes("distance") || factorLower.includes("km")) {
      return {
        factor: "सीएससी केंद्र से अत्यधिक दूरी (Geographical Distance)",
        description: "निकटतम जन सेवा केंद्र दूर स्थित होने के कारण बायोमेट्रिक सत्यापन और दस्तावेज जमा करने में समय व यात्रा खर्च बढ़ता है।",
        remedy: "एक ही यात्रा में संपूर्ण भौतिक सत्यापन पूरा करने के लिए सीएससी प्राथमिकता अपॉइंटमेंट टोकन बुक करें।"
      };
    }
    if (key === "digital_literacy" || factorLower.includes("literacy")) {
      return {
        factor: "कम डिजिटल साक्षरता (Low Digital Literacy)",
        description: "ऑनलाइन पोर्टल पर जटिल फॉर्म भरने, दस्तावेज स्कैन करने और बायोमेट्रिक सत्यापन में तकनीकी कठिनाई का जोखिम है।",
        remedy: "ग्राम-स्तरीय सीएससी वीएलई ऑपरेटर की सहायता से असिस्टेड फाइलिंग टोकन के माध्यम से आवेदन पूर्ण करवाएं।"
      };
    }
    if (key === "prior_rejections_count" || factorLower.includes("rejection")) {
      return {
        factor: "पूर्व में आवेदन निरस्त होने का रिकॉर्ड (Prior Rejections)",
        description: "पूर्व में आवेदन निरस्त होने का रिकॉर्ड नए आवेदन की प्रशासनिक स्क्रूटनी में उच्च जोखिम उत्पन्न करता है।",
        remedy: "पूर्व निरस्तीकरण पर्ची सीएससी ऑपरेटर को दिखाएं और कमियों को ठीक करवाकर त्रुटि-मुक्त आवेदन जमा करें।"
      };
    }
    return {
      factor: b.factor_hi || b.factor,
      description: b.description_hi || b.description,
      remedy: b.remedy_hi || b.remedy
    };
  }

  // ENGLISH MODE (en)
  // Ensure pristine English (no Hinglish allowed)
  if (key === "has_income_certificate" || factorLower.includes("income")) {
    return {
      factor: "Missing Income Certificate",
      description: "Without an updated income certificate issued by the Tehsil within the last 6 months, applications face administrative rejection during scrutiny.",
      remedy: "Apply for an income certificate renewal at your local Tehsil Revenue Office or nearest CSC Jan Seva Kendra."
    };
  }
  if (key === "has_caste_certificate" || factorLower.includes("caste")) {
    return {
      factor: b.factor.includes("(") ? b.factor : "Missing Caste Certificate (SC/ST/OBC)",
      description: "A verified caste certificate is mandatory by government gazette rules to claim targeted welfare benefits, quotas, and subsidies.",
      remedy: "Apply for a digital caste certificate via your state's e-District portal or at your local Tehsil sub-divisional magistrate office."
    };
  }
  if (key === "has_bpl_ration_card" || factorLower.includes("ration")) {
    return {
      factor: "Missing BPL / Antyodaya Ration Card",
      description: "A registered BPL or Antyodaya ration card is required to establish household poverty line status for housing and food welfare schemes.",
      remedy: "Apply for a family ration card through the Food & Civil Supplies portal or at your nearest CSC Jan Seva Kendra."
    };
  }
  if (key === "bank_account_aadhaar_linked" || factorLower.includes("bank") || factorLower.includes("dbt")) {
    return {
      factor: "Unlinked Bank Account (DBT Inactive)",
      description: "Bank account is not mapped to Aadhaar NPCI. Direct Benefit Transfer (DBT) funds cannot be credited by the PFMS payment gateway.",
      remedy: "Visit your bank branch with your Aadhaar card and submit the DBT Aadhaar Seeding Mandate form to activate transfers."
    };
  }
  if (key === "distance_to_csc_km" || factorLower.includes("distance") || factorLower.includes("km")) {
    return {
      factor: b.factor,
      description: "The nearest authorized CSC Jan Seva Kendra is located at a distance, creating physical commute costs and potential delays in document verification.",
      remedy: "Generate a priority CSC QR token pass to complete biometric e-KYC and documentation in a single scheduled visit."
    };
  }
  if (key === "digital_literacy" || factorLower.includes("literacy")) {
    return {
      factor: b.factor,
      description: "Navigating multi-step online forms, document compression, and biometric authentication presents self-submission barriers.",
      remedy: "Use assisted filing at your village CSC center where the certified VLE operator handles form submission and tracking."
    };
  }
  if (key === "prior_rejections_count" || factorLower.includes("rejection")) {
    return {
      factor: b.factor,
      description: "A past record of rejected application(s) triggers high-scrutiny verification in the automated risk model.",
      remedy: "Present previous rejection slips to the CSC operator to conduct a pre-submission document audit and resolve discrepancies."
    };
  }

  return {
    factor: b.factor,
    description: b.description,
    remedy: b.remedy
  };
}

interface CitizenProfileData {
  age?: number;
  gender?: string;
  caste_category?: string;
  occupation?: string;
  annual_income?: number;
  bpl_status?: string | boolean;
  rural_or_urban?: string;
  state?: string;
  district?: string;
  distance_to_csc_km?: number;
  digital_literacy?: string;
  has_income_certificate?: boolean;
  bank_account_aadhaar_linked?: boolean;
  has_caste_certificate?: boolean;
  has_bpl_ration_card?: boolean;
  prior_rejections_count?: number;
}

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [schemeData, setSchemeData] = useState<SchemeMatchResponse | null>(null);
  const [riskData, setRiskData] = useState<AssessRiskResponse | null>(null);
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfileData | null>(null);
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, { docNumber?: string; [key: string]: unknown }>>({});

  useEffect(() => {
    async function initDashboardData() {
      try {
        const storedSchemes = localStorage.getItem("sahayak_scheme_matches");
        const storedRisk = localStorage.getItem("sahayak_risk_assessment");
        const storedProfile = localStorage.getItem("sahayak_citizen_profile");
        const storedDocs = localStorage.getItem("sahayak_verified_docs");

        if (storedProfile) setCitizenProfile(JSON.parse(storedProfile));
        if (storedRisk) setRiskData(JSON.parse(storedRisk));
        if (storedDocs) setVerifiedDocs(JSON.parse(storedDocs));

        if (storedSchemes) {
          setSchemeData(JSON.parse(storedSchemes));
        } else if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          try {
            const matches = await matchSchemes({
              age: parsed.age || 45,
              annual_income: parsed.annual_income || 60000,
              bpl_status: parsed.bpl_status === "yes" || parsed.bpl_status === true,
              gender: parsed.gender || "Male",
              caste_category: parsed.caste_category || "OBC",
              occupation: parsed.occupation || "Farmer",
              rural_or_urban: parsed.rural_or_urban || "Rural",
              has_income_certificate: parsed.has_income_certificate ?? false,
              bank_account_aadhaar_linked: parsed.bank_account_aadhaar_linked ?? false,
              has_caste_certificate: parsed.has_caste_certificate ?? false,
              has_bpl_ration_card: parsed.has_bpl_ration_card ?? true,
              state: parsed.state || "Uttar Pradesh",
              district: parsed.district || "Varanasi",
            });
            setSchemeData(matches);
            localStorage.setItem("sahayak_scheme_matches", JSON.stringify(matches));
          } catch (mErr) {
            console.error("Auto match schemes failed on init:", mErr);
          }
        }
      } catch (e) {
        console.error("Failed to parse stored backend data:", e);
      } finally {
        setLoading(false);
      }
    }
    initDashboardData();
  }, []);

  const riskLevel = riskData?.risk_level || "MEDIUM";
  const riskScore = riskData?.risk_score ? Math.round(riskData.risk_score * 100) : 42;
  const eligibleCount = schemeData?.total_eligible ?? 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getRiskBadgeText = () => {
    if (riskLevel === "HIGH") return t.dashboard.riskLevelHigh;
    if (riskLevel === "MEDIUM") return t.dashboard.riskLevelMedium;
    return t.dashboard.riskLevelLow;
  };

  const [simulating, setSimulating] = useState(false);

  const simulateHighRisk = async () => {
    setSimulating(true);
    try {
      const payload = {
        scheme_id: 1,
        age: 58,
        annual_income: 25000,
        bpl_status: true,
        gender: "Male",
        caste_category: "SC",
        occupation: "Daily Wage Worker",
        rural_or_urban: "Rural",
        state: "Uttar Pradesh",
        district: "Varanasi (Rural)",
        distance_to_csc_km: 26.0,
        digital_literacy: "Low" as const,
        has_income_certificate: false,
        bank_account_aadhaar_linked: false,
        has_caste_certificate: false,
        has_bpl_ration_card: false,
        prior_rejections_count: 3,
        lang,
      };
      const res = await assessRisk(payload);
      setRiskData(res);

      const matchPayload = {
        age: 58,
        annual_income: 25000,
        bpl_status: true,
        gender: "Male",
        caste_category: "SC",
        occupation: "Daily Wage Worker",
        rural_or_urban: "Rural",
        state: "Uttar Pradesh",
        district: "Varanasi (Rural)",
        has_income_certificate: false,
        bank_account_aadhaar_linked: false,
        has_caste_certificate: false,
        has_bpl_ration_card: false,
      };
      try {
        const matchRes = await matchSchemes(matchPayload);
        setSchemeData(matchRes);
        localStorage.setItem("sahayak_scheme_matches", JSON.stringify(matchRes));
      } catch (err) {
        console.error("High risk scheme match failed:", err);
      }

      const highProfile = {
        age: 58,
        annual_income: 25000,
        bpl_status: "yes",
        gender: "Male",
        caste_category: "SC",
        occupation: "Daily Wage Worker",
        rural_or_urban: "Rural",
        distance_to_csc_km: 26.0,
        digital_literacy: "Low",
        district: "Varanasi (Rural)",
        state: "Uttar Pradesh",
        has_income_certificate: false,
        bank_account_aadhaar_linked: false,
        has_caste_certificate: false,
        has_bpl_ration_card: false,
        prior_rejections_count: 3,
      };
      setCitizenProfile(highProfile);
      localStorage.setItem("sahayak_citizen_profile", JSON.stringify(highProfile));
      localStorage.setItem("sahayak_risk_assessment", JSON.stringify(res));
    } catch (e) {
      console.error("Failed to simulate high risk:", e);
    } finally {
      setSimulating(false);
    }
  };

  const simulateLowRisk = async () => {
    setSimulating(true);
    try {
      const payload = {
        scheme_id: 1,
        age: 32,
        annual_income: 60000,
        bpl_status: true,
        gender: "Female",
        caste_category: "General",
        occupation: "Farmer",
        rural_or_urban: "Rural",
        state: "Uttar Pradesh",
        district: "Varanasi",
        distance_to_csc_km: 1.5,
        digital_literacy: "High" as const,
        has_income_certificate: true,
        bank_account_aadhaar_linked: true,
        has_caste_certificate: true,
        has_bpl_ration_card: true,
        prior_rejections_count: 0,
        lang,
      };
      const res = await assessRisk(payload);
      setRiskData(res);

      const matchPayload = {
        age: 32,
        annual_income: 60000,
        bpl_status: true,
        gender: "Female",
        caste_category: "General",
        occupation: "Farmer",
        rural_or_urban: "Rural",
        state: "Uttar Pradesh",
        district: "Varanasi",
        has_income_certificate: true,
        bank_account_aadhaar_linked: true,
        has_caste_certificate: true,
        has_bpl_ration_card: true,
      };
      try {
        const matchRes = await matchSchemes(matchPayload);
        setSchemeData(matchRes);
        localStorage.setItem("sahayak_scheme_matches", JSON.stringify(matchRes));
      } catch (err) {
        console.error("Low risk scheme match failed:", err);
      }

      const lowProfile = {
        age: 32,
        annual_income: 60000,
        bpl_status: "yes",
        gender: "Female",
        caste_category: "General",
        occupation: "Farmer",
        rural_or_urban: "Rural",
        distance_to_csc_km: 1.5,
        digital_literacy: "High",
        district: "Varanasi",
        state: "Uttar Pradesh",
        has_income_certificate: true,
        bank_account_aadhaar_linked: true,
        has_caste_certificate: true,
        has_bpl_ration_card: true,
        prior_rejections_count: 0,
      };
      setCitizenProfile(lowProfile);
      localStorage.setItem("sahayak_citizen_profile", JSON.stringify(lowProfile));
      localStorage.setItem("sahayak_risk_assessment", JSON.stringify(res));
    } catch (e) {
      console.error("Failed to simulate low risk:", e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP OFFICIAL BANNER & CITIZEN PROFILE BAR */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>{t.dashboard.tag}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {citizenProfile?.district ? `${citizenProfile.district}, ${citizenProfile.state}` : "Varanasi, Uttar Pradesh"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{t.dashboard.dpdpVerified}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.dashboard.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                {t.dashboard.subtitle}
              </p>
            </div>

            {/* Right Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              {/* Quick ML Simulator Buttons */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={simulateHighRisk}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-900 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="Simulate High Risk Citizen"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>🔴 Simulate High Risk</span>
                </button>
                <button
                  onClick={simulateLowRisk}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="Simulate Low Risk Citizen"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>🟢 Simulate Low Risk</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                title={t.dashboard.btnPrint}
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.dashboard.btnPrint}</span>
              </button>

              <Link
                href="/onboarding"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.dashboard.btnEdit}</span>
              </Link>

              <Link
                href="/map"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-sm shadow-blue-800/20 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.dashboard.btnBook}</span>
              </Link>
            </div>

          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.dashboard.kpiEligible}
              </span>
              <div className="text-lg font-black mt-0.5 flex flex-wrap items-baseline gap-1.5">
                <span className={eligibleCount > 0 ? "text-emerald-700" : "text-amber-700"}>
                  {eligibleCount} {t.dashboard.schemesUnit}
                </span>
                {eligibleCount === 0 ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {lang === "hi" ? "रुकावटों से अवरुद्ध" : "Blocked by Barriers"}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {lang === "hi" ? "सत्यापित पात्र" : "Verified Ready"}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.dashboard.kpiRisk}
              </span>
              <div className={`text-lg font-black mt-0.5 ${
                riskLevel === "HIGH" ? "text-red-700" : riskLevel === "MEDIUM" ? "text-amber-700" : "text-emerald-700"
              }`}>
                {riskScore}% ({getRiskBadgeText()})
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.dashboard.kpiBpl}
              </span>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {(citizenProfile?.bpl_status === "yes" || citizenProfile?.bpl_status === true) 
                  ? (lang === "hi" ? "BPL सत्यापित" : "BPL Verified") 
                  : (lang === "hi" ? "गैर-बीपीएल (सामान्य)" : "Non-BPL (General)")}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.dashboard.kpiDistance}
              </span>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {citizenProfile?.distance_to_csc_km || 12.5} km
              </div>
            </div>
          </div>
        </div>

        {/* API Setu Verified Dossier Seal (if verified docs exist) */}
        {Object.keys(verifiedDocs).length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-blue-50/50 to-slate-50 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {t.apiSetu.dossierSeal}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    DIGITAL INDIA VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {Object.keys(verifiedDocs).length} document(s) pre-screened via State Gazette. Ready for expedited CSC Kendra token filing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {Object.entries(verifiedDocs).map(([type, d]) => (
                <span key={type} className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                  ✓ {type.toUpperCase()}: {d.docNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2-COLUMN MAIN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: THE ACCESS RISK SPEEDOMETER & REASONING (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Risk Gauge Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-blue-700" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {t.dashboard.riskTitle}
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  XGBoost v1.0
                </span>
              </div>

              {/* Circular Radial Risk Score Meter */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={riskLevel === "HIGH" ? "#ef4444" : riskLevel === "MEDIUM" ? "#f59e0b" : "#10b981"}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{riskScore}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                      {t.dashboard.riskScoreLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    riskLevel === "HIGH"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : riskLevel === "MEDIUM"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {getRiskBadgeText()}
                  </span>
                </div>

                <p className="text-xs text-slate-500 text-center font-medium mt-3 px-2 leading-relaxed">
                  {t.dashboard.riskProbNotice} {riskScore}%. {t.dashboard.riskProbResolution}
                </p>
              </div>

              {/* Advisory Callout */}
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                riskLevel === "HIGH"
                  ? "bg-red-50/80 border-red-200 text-red-900"
                  : riskLevel === "MEDIUM"
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{t.dashboard.advisoryTitle}</span>
                </div>
                <p className="leading-relaxed font-medium">
                  {t.dashboard.advisoryText}
                </p>
              </div>

              {/* Direct Handoff Button */}
              <Link
                href="/map"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.dashboard.btnBookKiosk}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Profile Snapshot Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2.5 text-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                {t.dashboard.profileParams}
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.dashboard.paramAgeCategory}:</span>
                <span className="font-bold text-slate-800">
                  {citizenProfile?.age || 45} {t.dashboard.yearsUnit} / {citizenProfile?.caste_category || "OBC"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.dashboard.paramOccupation}:</span>
                <span className="font-bold text-slate-800">
                  {citizenProfile?.occupation === "Farmer"
                    ? (lang === "hi" ? "किसान (Farmer)" : "Farmer")
                    : citizenProfile?.occupation === "Daily Wage Worker"
                    ? (lang === "hi" ? "दैनिक मजदूर (Daily Wage)" : "Daily Wage Worker")
                    : citizenProfile?.occupation === "Small Business"
                    ? (lang === "hi" ? "छोटा व्यापारी (Small Business)" : "Small Business")
                    : citizenProfile?.occupation === "Self Employed"
                    ? (lang === "hi" ? "स्वरोजगार (Self Employed)" : "Self Employed")
                    : citizenProfile?.occupation === "Homemaker"
                    ? (lang === "hi" ? "गृहणी (Homemaker)" : "Homemaker")
                    : citizenProfile?.occupation === "Student"
                    ? (lang === "hi" ? "विद्यार्थी (Student)" : "Student")
                    : (citizenProfile?.occupation || (lang === "hi" ? "किसान (Farmer)" : "Farmer"))}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.dashboard.paramAnnualIncome}:</span>
                <span className="font-bold text-slate-800">
                  ₹{(citizenProfile?.annual_income || 60000).toLocaleString("en-IN")} {t.dashboard.perYearUnit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.dashboard.paramArea}:</span>
                <span className="font-bold text-slate-800">
                  {citizenProfile?.rural_or_urban === "Urban"
                    ? (lang === "hi" ? "शहरी (Urban)" : "Urban")
                    : (lang === "hi" ? "ग्रामीण (Rural)" : "Rural")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.dashboard.paramDistance}:</span>
                <span className="font-bold text-slate-800">
                  {citizenProfile?.distance_to_csc_km || 12.5} km
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t.dashboard.paramDigitalLiteracy}:</span>
                <span className="font-bold text-slate-800">
                  {citizenProfile?.digital_literacy || "Low"}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SHAP BARRIER DECOMPOSITION & SCHEMES LIST (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. SHAP EXPLAINABLE AI BARRIER / ENABLER CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className={`w-4 h-4 ${riskLevel === "LOW" ? "text-emerald-500" : "text-amber-500"}`} />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {riskLevel === "LOW" 
                        ? (lang === "hi" ? "SHAP AI पहुंच एवं तैयारी कारक (Readiness Factors)" : "SHAP Explainable AI Readiness & Access Factors")
                        : t.dashboard.shapTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {riskLevel === "LOW" 
                      ? (lang === "hi" 
                          ? "गणितीय साक्ष्य: शून्य प्रशासनिक रुकावट • आवेदन को सुरक्षित और सफल बनाने वाले मुख्य कारक"
                          : "Mathematical proof: Zero critical barriers • Top factors ensuring successful fast-track processing")
                      : t.dashboard.shapSub}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  riskLevel === "LOW" 
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}>
                  XAI Core
                </span>
              </div>

              {/* Real SHAP Barriers / Enablers Breakdown */}
              <div className="space-y-4">
                {(riskData?.top_barriers && riskData.top_barriers.length > 0 
                  ? riskData.top_barriers 
                  : []
                ).map((barrier, bIdx) => {
                  const isLow = riskLevel === "LOW";
                  const loc = localizeBarrier(barrier, lang);
                  return (
                    <div 
                      key={bIdx} 
                      className={`p-4 rounded-xl border space-y-2 transition-all ${
                        isLow ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isLow ? "bg-emerald-500" : "bg-red-500"
                          }`} />
                          <span className="text-xs font-bold text-slate-900">{loc.factor}</span>
                        </div>
                        <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded border ${
                          isLow 
                            ? "text-emerald-800 bg-emerald-100 border-emerald-300" 
                            : "text-red-800 bg-red-100 border-red-200"
                        }`}>
                          {barrier.impact_percentage} {isLow ? (lang === "hi" ? "सकारात्मक प्रभाव" : "Positive Impact") : t.dashboard.impactLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium pl-4">{loc.description}</p>

                      <div className={`mt-2 ml-4 p-2.5 rounded-lg border text-[11px] font-semibold flex items-start space-x-1.5 ${
                        isLow 
                          ? "bg-white border-emerald-200 text-emerald-900" 
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{isLow ? (lang === "hi" ? "स्थिति:" : "Status:") : t.dashboard.remedyTitle}</strong> {loc.remedy}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. MATCHED CENTRAL WELFARE SCHEMES (RULE ENGINE) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`w-4 h-4 ${eligibleCount > 0 ? "text-emerald-600" : "text-amber-600"}`} />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {t.dashboard.schemesTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {t.dashboard.schemesSub}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  eligibleCount > 0
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }`}>
                  {eligibleCount > 0 
                    ? `${eligibleCount} ${t.dashboard.eligiblePill}` 
                    : (lang === "hi" ? "0 पात्र • अहर्ता एवं दस्तावेज रुकावट" : "0 Schemes Ready • Action Required")}
                </span>
              </div>

              {/* Notice if 0 schemes are eligible */}
              {eligibleCount === 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      {lang === "hi" 
                        ? "अहर्ता एवं दस्तावेजों की कमी के कारण सीधी पात्रता अवरुद्ध है" 
                        : "Direct Scheme Approval Blocked: Missing Critical Prerequisites"}
                    </p>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {lang === "hi"
                        ? "नागरिक कई योजनाओं के लिए आंशिक रूप से योग्य है (40% - 70%), लेकिन आय प्रमाण पत्र नवीनीकरण या बैंक आधार (DBT) लिंक न होने के कारण फाइनल अप्रूवल रुका है। नीचे दी गई कमियों को निकटतम CSC केंद्र में ठीक करवाएं।"
                        : "The citizen partially meets criteria (40% - 70%), but missing critical verification proofs (e.g. Income Certificate renewal, DBT Bank Account Seeding) block immediate qualification. Resolve them at CSC to unlock."}
                    </p>
                  </div>
                </div>
              )}

              {/* Schemes Cards Grid */}
              <div className="space-y-4">
                {(schemeData?.schemes && schemeData.schemes.length > 0 ? schemeData.schemes : [
                  {
                    scheme_id: 1,
                    scheme_code: "PMAY-G",
                    name: "Pradhan Mantri Awas Yojana - Gramin",
                    category: "Housing",
                    match_percentage: 70,
                    is_eligible: false,
                    benefits_summary: lang === "hi" 
                      ? "पक्के आवास निर्माण हेतु ₹1,20,000 की प्रत्यक्ष आर्थिक सहायता"
                      : "Direct financial assistance of ₹1,20,000 for pucca house construction",
                    matched_criteria: [lang === "hi" ? "BPL परिवार" : "BPL Household", lang === "hi" ? "ग्रामीण निवासी" : "Rural Resident"],
                    unmatched_criteria: [lang === "hi" ? "आय प्रमाण पत्र नवीनीकरण अनिवार्य" : "Income Certificate renewal mandatory"],
                    required_documents: lang === "hi" 
                      ? ["आधार कार्ड", "बैंक पासबुक", "BPL राशन कार्ड", "भूमि स्वामित्व पत्र"]
                      : ["Aadhaar Card", "Bank Passbook", "BPL Ration Card", "Land Title Deed"]
                  },
                  {
                    scheme_id: 2,
                    scheme_code: "PM-KISAN",
                    name: "Pradhan Mantri Kisan Samman Nidhi",
                    category: "Agriculture",
                    match_percentage: 40,
                    is_eligible: false,
                    benefits_summary: lang === "hi"
                      ? "किसानों को प्रति वर्ष ₹6,000 तीन समान किस्तों में बैंक खाते में"
                      : "Direct income support of ₹6,000 per year in three equal installments",
                    matched_criteria: [lang === "hi" ? "उम्र पात्रता पास" : "Age Criteria Passed"],
                    unmatched_criteria: [lang === "hi" ? "सिर्फ किसानों के लिए (भूमि स्वामित्व आवश्यक)" : "Farmer profession required", lang === "hi" ? "बैंक खाता आधार DBT लिंक नहीं है" : "Bank account not Aadhaar DBT linked"],
                    required_documents: lang === "hi"
                      ? ["आधार कार्ड", "खतौनी नकल", "बैंक पासबुक"]
                      : ["Aadhaar Card", "Land Record (Khatauni)", "Bank Passbook"]
                  },
                  {
                    scheme_id: 4,
                    scheme_code: "PM-JAY",
                    name: "Ayushman Bharat PM Jan Arogya Yojana",
                    category: "Health",
                    match_percentage: 70,
                    is_eligible: false,
                    benefits_summary: lang === "hi"
                      ? "प्रति परिवार प्रति वर्ष ₹5,00,000 तक का निशुल्क कैशलेस इलाज"
                      : "Free cashless secondary and tertiary healthcare up to ₹5,00,000 per family per year",
                    matched_criteria: [lang === "hi" ? "BPL राशन कार्ड" : "BPL Card", lang === "hi" ? "उम्र सीमा के अंदर" : "Within Age Criteria"],
                    unmatched_criteria: [lang === "hi" ? "आय प्रमाण पत्र नवीनीकरण अनिवार्य" : "Income Certificate verification required"],
                    required_documents: lang === "hi"
                      ? ["राशन कार्ड", "आधार कार्ड"]
                      : ["Ration Card", "Aadhaar Card"]
                  }
                ]).map((scheme, idx) => {
                  const isEligible = scheme.is_eligible ?? (scheme.match_percentage === 100);
                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                        isEligible
                          ? "border-slate-200 hover:border-blue-400 bg-white shadow-2xs"
                          : "border-amber-200/90 bg-amber-50/20 hover:border-amber-300 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                            {scheme.scheme_code}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{scheme.category}</span>
                          
                          {/* Eligibility Badge */}
                          {isEligible ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{t.dashboard.eligiblePill}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{scheme.match_percentage}% {lang === "hi" ? "मानदंड पूर्ण • रुकावट" : "Match • Blocked"}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{scheme.name}</h3>
                        <p className="text-xs text-emerald-800 font-semibold">{scheme.benefits_summary}</p>

                        {/* Unmatched Criteria / Barriers Alert */}
                        {!isEligible && scheme.unmatched_criteria && scheme.unmatched_criteria.length > 0 && (
                          <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                            <span className="font-bold text-[11px] uppercase tracking-wide flex items-center gap-1 text-red-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              {lang === "hi" ? "पात्रता में रुकावटें (Unmatched Barriers):" : "Eligibility Barriers to Resolve:"}
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-800/90 font-medium pl-1">
                              {scheme.unmatched_criteria.map((crit, cIdx) => (
                                <li key={cIdx}>{crit}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Matched Criteria */}
                        {scheme.matched_criteria && scheme.matched_criteria.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {lang === "hi" ? "सत्यापित अहर्ता:" : "Passed:"}
                            </span>
                            {scheme.matched_criteria.map((crit, mIdx) => (
                              <span key={mIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                ✓ {crit}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Required Documents Checklist */}
                        {scheme.required_documents && scheme.required_documents.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {t.dashboard.requiredDocs}
                            </span>
                            {scheme.required_documents.map((doc, dIdx) => (
                              <span key={dIdx} className="text-[10px] bg-blue-50/70 text-blue-900 px-2 py-0.5 rounded border border-blue-100">
                                {doc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                        <Link
                          href="/map"
                          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors ${
                            isEligible
                              ? "bg-blue-800 hover:bg-blue-900 text-white"
                              : "bg-amber-700 hover:bg-amber-800 text-white"
                          }`}
                        >
                          <span>{isEligible ? t.dashboard.btnGetToken : (lang === "hi" ? "CSC में ठीक करें" : "Resolve at CSC")}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
