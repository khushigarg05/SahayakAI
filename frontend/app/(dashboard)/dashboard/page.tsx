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
import { AssessRiskResponse, SchemeMatchResponse, MatchedScheme, SHAPBarrier, ActionStep } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [schemeData, setSchemeData] = useState<SchemeMatchResponse | null>(null);
  const [riskData, setRiskData] = useState<AssessRiskResponse | null>(null);
  const [citizenProfile, setCitizenProfile] = useState<any>(null);

  useEffect(() => {
    try {
      const storedSchemes = localStorage.getItem("sahayak_scheme_matches");
      const storedRisk = localStorage.getItem("sahayak_risk_assessment");
      const storedProfile = localStorage.getItem("sahayak_citizen_profile");

      if (storedSchemes) setSchemeData(JSON.parse(storedSchemes));
      if (storedRisk) setRiskData(JSON.parse(storedRisk));
      if (storedProfile) setCitizenProfile(JSON.parse(storedProfile));
    } catch (e) {
      console.error("Failed to parse stored backend data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const riskLevel = riskData?.risk_level || "MEDIUM";
  const riskScore = riskData?.risk_score ? Math.round(riskData.risk_score * 100) : 42;
  const eligibleCount = schemeData?.total_eligible ?? 3;

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-0">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP OFFICIAL BANNER & CITIZEN PROFILE BAR */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  {t.dashboard.tag}
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
              <div className="text-lg font-black text-blue-800 mt-0.5">
                {eligibleCount} {t.dashboard.schemesUnit}
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
                {citizenProfile?.bpl_status === "yes" ? t.dashboard.bplVerified : t.dashboard.bplStandard}
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
                <span className="text-slate-500">{t.dashboard.paramAnnualIncome}:</span>
                <span className="font-bold text-slate-800">
                  ₹{(citizenProfile?.annual_income || 60000).toLocaleString("en-IN")} {t.dashboard.perYearUnit}
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

            {/* 1. SHAP EXPLAINABLE AI BARRIER CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {t.dashboard.shapTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {t.dashboard.shapSub}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                  XAI Core
                </span>
              </div>

              {/* Real SHAP Barriers Breakdown */}
              <div className="space-y-4">
                {(riskData?.top_barriers && riskData.top_barriers.length > 0 
                  ? riskData.top_barriers 
                  : t.dashboard.fallbackBarriers
                ).map((barrier, bIdx) => (
                  <div key={bIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-900">{barrier.factor}</span>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-red-800 bg-red-100 px-2.5 py-0.5 rounded border border-red-200">
                        {barrier.impact_percentage} {t.dashboard.impactLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium pl-4">{barrier.description}</p>

                    <div className="mt-2 ml-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900 flex items-start space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>{t.dashboard.remedyTitle}</strong> {barrier.remedy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. MATCHED CENTRAL WELFARE SCHEMES (RULE ENGINE) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {t.dashboard.schemesTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {t.dashboard.schemesSub}
                  </p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  {eligibleCount} {t.dashboard.eligiblePill}
                </span>
              </div>

              {/* Schemes Cards Grid */}
              <div className="space-y-4">
                {(schemeData?.schemes && schemeData.schemes.length > 0 ? schemeData.schemes : [
                  {
                    scheme_id: 1,
                    scheme_code: "PMAY-G",
                    name: "Pradhan Mantri Awas Yojana - Gramin",
                    category: "Housing",
                    benefits_summary: lang === "hi" 
                      ? "पक्के आवास निर्माण हेतु ₹1,20,000 की प्रत्यक्ष आर्थिक सहायता"
                      : "Direct financial assistance of ₹1,20,000 for pucca house construction",
                    matched_criteria: [lang === "hi" ? "BPL परिवार" : "BPL Household", lang === "hi" ? "वार्षिक आय < ₹1,20,000" : "Annual Income < ₹1.2L"],
                    unmatched_criteria: [],
                    required_documents: lang === "hi" 
                      ? ["आधार कार्ड", "बैंक पासबुक", "BPL राशन कार्ड", "भूमि स्वामित्व पत्र"]
                      : ["Aadhaar Card", "Bank Passbook", "BPL Ration Card", "Land Title Deed"]
                  },
                  {
                    scheme_id: 2,
                    scheme_code: "PM-KISAN",
                    name: "Pradhan Mantri Kisan Samman Nidhi",
                    category: "Agriculture",
                    benefits_summary: lang === "hi"
                      ? "किसानों को प्रति वर्ष ₹6,000 तीन समान किस्तों में बैंक खाते में"
                      : "Direct income support of ₹6,000 per year in three equal installments",
                    matched_criteria: [lang === "hi" ? "भूस्वामी किसान" : "Landholder Farmer", lang === "hi" ? "सक्रिय बैंक खाता" : "Active Bank Account"],
                    unmatched_criteria: [],
                    required_documents: lang === "hi"
                      ? ["आधार कार्ड", "खतौनी नकल", "बैंक पासबुक"]
                      : ["Aadhaar Card", "Land Record (Khatauni)", "Bank Passbook"]
                  },
                  {
                    scheme_id: 4,
                    scheme_code: "PM-JAY",
                    name: "Ayushman Bharat PM Jan Arogya Yojana",
                    category: "Health",
                    benefits_summary: lang === "hi"
                      ? "प्रति परिवार प्रति वर्ष ₹5,00,000 तक का निशुल्क कैशलेस इलाज"
                      : "Free cashless secondary and tertiary healthcare up to ₹5,00,000 per family per year",
                    matched_criteria: [lang === "hi" ? "SECC 2011 सूची" : "SECC 2011 Deprivation Criteria", lang === "hi" ? "BPL राशन कार्ड" : "BPL Card"],
                    unmatched_criteria: [],
                    required_documents: lang === "hi"
                      ? ["राशन कार्ड", "आधार कार्ड"]
                      : ["Ration Card", "Aadhaar Card"]
                  }
                ]).map((scheme, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                          {scheme.scheme_code}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{scheme.category}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {t.dashboard.eligiblePill}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{scheme.name}</h3>
                      <p className="text-xs text-emerald-800 font-semibold">{scheme.benefits_summary}</p>

                      {/* Required Documents Checklist */}
                      {scheme.required_documents && scheme.required_documents.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1">
                          {scheme.required_documents.map((doc, dIdx) => (
                            <span key={dIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {doc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Link
                        href="/map"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>{t.dashboard.btnGetToken}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
