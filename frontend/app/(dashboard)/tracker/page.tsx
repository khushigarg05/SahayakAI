"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle,
  Building2,
  ArrowRight,
  QrCode,
  FileText,
  RotateCw,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Phone
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { fetchTrackingDetail, TrackingDetailData } from "@/lib/api";

interface TrackingStep {
  name: string;
  name_hi?: string;
  date: string;
  date_hi?: string;
  completed: boolean;
  current?: boolean;
  error?: string;
  error_hi?: string;
}

interface TrackingApp {
  id: string;
  schemeName: string;
  schemeName_hi?: string;
  type: string;
  type_hi?: string;
  status: string;
  status_hi?: string;
  kioskName: string;
  date: string;
  date_hi?: string;
  progress: number;
  qr_code_base64?: string;
  operator_phone?: string;
  isNew?: boolean;
  steps: TrackingStep[];
}

function TrackerContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialId);
  const [activeFilter, setActiveFilter] = useState<"all" | "tokens" | "apps" | "action">("all");
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [activeQrModal, setActiveQrModal] = useState<TrackingApp | null>(null);
  const [isRefreshingId, setIsRefreshingId] = useState<string | null>(null);

  // Baseline verified government registry items
  const baselineTracking: TrackingApp[] = [
    {
      id: "#SAH-89421",
      schemeName: "Pradhan Mantri Awas Yojana (PMAY-G)",
      schemeName_hi: "प्रधानमंत्री आवास योजना (ग्रामीण)",
      type: "CSC Priority Appointment Token",
      type_hi: "CSC प्राथमिकता टोकन पास",
      status: "Confirmed",
      status_hi: "सत्यापित",
      kioskName: "Rampur CSC Jan Seva Kendra",
      date: "Tomorrow, 10:00 AM - 11:00 AM",
      date_hi: "कल, प्रातः 10:00 - 11:00",
      progress: 75,
      operator_phone: "+91 98765 43210",
      steps: [
        { 
          name: "Token Generated Online", 
          name_hi: "टोकन ऑनलाइन जनरेट हुआ", 
          date: "Today", 
          date_hi: "आज", 
          completed: true 
        },
        { 
          name: "Slot Reserved at Kiosk", 
          name_hi: "केंद्र पर स्लॉट आरक्षित", 
          date: "Confirmed", 
          date_hi: "सत्यापित", 
          completed: true 
        },
        { 
          name: "Biometric e-KYC & Doc Scan", 
          name_hi: "बायोमेट्रिक e-KYC व दस्तावेज़ स्कैन", 
          date: "Upcoming", 
          date_hi: "आगामी", 
          completed: false, 
          current: true 
        },
        { 
          name: "Final Directorate Submission", 
          name_hi: "अंतिम निदेशालय स्वीकृति", 
          date: "Pending", 
          date_hi: "लंबित", 
          completed: false 
        },
      ]
    },
    {
      id: "APP-5510",
      schemeName: "Ayushman Bharat (PM-JAY)",
      schemeName_hi: "आयुष्मान भारत योजना (PM-JAY)",
      type: "Digital Application",
      type_hi: "डिजिटल आवेदन",
      status: "Action Required",
      status_hi: "कार्रवाई आवश्यक",
      kioskName: "Rohania Digital Seva Kendra",
      date: "Under Review",
      date_hi: "समीक्षाधीन",
      progress: 40,
      operator_phone: "+91 94500 12345",
      steps: [
        { 
          name: "Application Submitted", 
          name_hi: "आवेदन जमा किया गया", 
          date: "18 Oct", 
          date_hi: "18 अक्टूबर", 
          completed: true 
        },
        { 
          name: "Document Verification", 
          name_hi: "दस्तावेज़ सत्यापन", 
          date: "Action Needed", 
          date_hi: "कार्रवाई आवश्यक", 
          completed: false, 
          current: true, 
          error: "Income certificate copy needs re-attestation.",
          error_hi: "आय प्रमाण पत्र का पुनः सत्यापन आवश्यक है।" 
        },
        { 
          name: "Golden Card Issued", 
          name_hi: "गोल्डन कार्ड जारी होना", 
          date: "Pending", 
          date_hi: "लंबित", 
          completed: false 
        },
      ]
    },
    {
      id: "PMK-17-DBT",
      schemeName: "Pradhan Mantri Kisan Samman Nidhi",
      schemeName_hi: "प्रधानमंत्री किसान सम्मान निधि",
      type: "Direct Benefit Transfer Application",
      type_hi: "प्रत्यक्ष लाभ अंतरण (DBT) आवेदन",
      status: "Approved",
      status_hi: "स्वीकृत",
      kioskName: "Kashi e-Seva Kendra",
      date: "Direct Transfer Active",
      date_hi: "खाते में हस्तांतरण सक्रिय",
      progress: 100,
      operator_phone: "+91 97920 67890",
      steps: [
        { 
          name: "Land Records Verified (Khatauni)", 
          name_hi: "भू-अभिलेख सत्यापन (खतौनी)", 
          date: "Verified", 
          date_hi: "सत्यापित", 
          completed: true 
        },
        { 
          name: "Aadhaar NPCI DBT Seeded", 
          name_hi: "आधार NPCI बैंक खाता लिंक", 
          date: "Active", 
          date_hi: "सक्रिय", 
          completed: true 
        },
        { 
          name: "e-KYC Biometric Authentication", 
          name_hi: "बायोमेट्रिक e-KYC प्रमाणीकरण", 
          date: "Passed", 
          date_hi: "सफल", 
          completed: true 
        },
        { 
          name: "17th Installment Disbursed", 
          name_hi: "17वीं किस्त जारी", 
          date: "Disbursed ₹2,000", 
          date_hi: "₹2,000 हस्तांतरित", 
          completed: true 
        },
      ]
    }
  ];

  const [applications, setApplications] = useState<TrackingApp[]>(baselineTracking);

  // Dynamic Search Handler (Local + Live FastAPI Backend)
  const handleSearch = useCallback(async (searchTerm?: string) => {
    const q = (searchTerm || query).trim();
    if (!q) {
      setSearchNotFound(false);
      return;
    }

    // Check if already in list
    const foundLocal = applications.find(a => 
      a.id.toLowerCase() === q.toLowerCase() ||
      a.id.replace("#", "").toLowerCase() === q.replace("#", "").toLowerCase()
    );

    if (foundLocal) {
      setSearchNotFound(false);
      return;
    }

    // Query Live FastAPI Backend Endpoint
    setIsSearchingApi(true);
    setSearchNotFound(false);
    try {
      const data: TrackingDetailData = await fetchTrackingDetail(q);
      const convertedApp: TrackingApp = {
        id: data.id,
        schemeName: data.scheme_name,
        schemeName_hi: data.scheme_name_hi,
        type: data.type,
        type_hi: data.type_hi,
        status: data.status,
        status_hi: data.status_hi,
        kioskName: data.kiosk_name,
        date: data.date,
        date_hi: data.date_hi,
        progress: data.progress,
        qr_code_base64: data.qr_code_base64,
        operator_phone: data.operator_phone,
        isNew: true,
        steps: data.steps.map(s => ({
          name: s.name,
          name_hi: s.name_hi,
          date: s.date,
          date_hi: s.date_hi,
          completed: s.completed,
          current: s.current,
          error: s.error,
          error_hi: s.error_hi,
        })),
      };

      setApplications(prev => [convertedApp, ...prev.filter(x => x.id !== convertedApp.id)]);
      setSearchNotFound(false);
    } catch (err) {
      console.warn("Search lookup fallback:", err);
      // If truly not found in database or registry
      const localMatches = applications.filter(a => 
        a.schemeName.toLowerCase().includes(q.toLowerCase()) ||
        a.kioskName.toLowerCase().includes(q.toLowerCase())
      );
      if (localMatches.length === 0) {
        setSearchNotFound(true);
      }
    } finally {
      setIsSearchingApi(false);
    }
  }, [applications, query]);

  // Load dynamically booked tokens from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sahayak_booked_tokens");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            queueMicrotask(() => {
              setApplications((prev) => {
                const existingIds = new Set(prev.map(x => x.id));
                const novel = parsed.filter((p: { id?: string }) => p.id && !existingIds.has(p.id));
                return [...novel, ...prev];
              });
            });
          }
        }
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }
  }, []);

  // If URL has an ID (e.g. ?id=#SAH-98412), trigger search immediately
  useEffect(() => {
    if (initialId) {
      queueMicrotask(() => {
        handleSearch(initialId);
      });
    }
  }, [initialId, handleSearch]);

  // Refresh status simulation for a specific application
  const handleRefreshApp = async (appId: string) => {
    setIsRefreshingId(appId);
    try {
      await fetchTrackingDetail(appId);
    } catch {
      // simulated lag
    }
    setTimeout(() => {
      setIsRefreshingId(null);
    }, 600);
  };

  // Filter criteria
  const filteredApps = applications.filter(app => {
    // 1. Text Query Filter
    const matchesQuery = query.trim() === "" ||
      app.id.toLowerCase().includes(query.toLowerCase()) ||
      app.schemeName.toLowerCase().includes(query.toLowerCase()) ||
      (app.schemeName_hi && app.schemeName_hi.includes(query)) ||
      app.kioskName.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    // 2. Tab Filter
    if (activeFilter === "tokens") return app.id.startsWith("#SAH") || app.type.includes("Token");
    if (activeFilter === "apps") return !app.id.startsWith("#SAH");
    if (activeFilter === "action") return app.status === "Action Required" || app.status === t.tracker.statusReview;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ========================================================
            1. HEADER SEARCH BAR & MONITORING BANNER
            ======================================================== */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.tracker.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{t.tracker.subTag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {t.tracker.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {t.tracker.description}
              </p>
            </div>

            {/* Live Search Input Capsule */}
            <div className="relative w-full sm:w-80 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t.tracker.searchPlaceholder}
                className="w-full h-11 pl-10 pr-20 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearchingApi}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearchingApi ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  lang === "hi" ? "खोजें" : "Search"
                )}
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-blue-800 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {t.tracker.filterAll || "All Filings"} ({applications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("tokens")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  activeFilter === "tokens"
                    ? "bg-blue-800 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {t.tracker.filterTokens || "CSC Tokens"}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("apps")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  activeFilter === "apps"
                    ? "bg-blue-800 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {t.tracker.filterApps || "Digital Applications"}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("action")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  activeFilter === "action"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {t.tracker.filterAction || "Action Required"}
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.tracker.slaNotice || "Statutory SLA: Verification within 7 working days."}</span>
            </div>
          </div>
        </div>

        {/* Searching Indicator */}
        {isSearchingApi && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center space-x-2">
            <RotateCw className="w-4 h-4 animate-spin text-blue-700" />
            <span className="font-semibold">{t.tracker.searchingRegistry || "Searching official central registry..."}</span>
          </div>
        )}

        {/* No Results Fallback */}
        {searchNotFound && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{t.tracker.noResults || "No application found with this reference number."}</span>
            </div>
            <p className="text-amber-800">
              {t.tracker.tryAgainTip || "Try searching with #SAH-89421, APP-5510, PM-KISAN, or book a new token at CSC."}
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setQuery("#SAH-89421");
                  handleSearch("#SAH-89421");
                }}
                className="px-3 py-1 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                Try #SAH-89421
              </button>
              <button
                onClick={() => {
                  setQuery("APP-5510");
                  handleSearch("APP-5510");
                }}
                className="px-3 py-1 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                Try APP-5510
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            2. DYNAMIC TRACKING CARDS LIST
            ======================================================== */}
        <div className="space-y-6">
          {filteredApps.map((app) => {
            const isConfirmed = app.status === "Confirmed" || app.status === "सत्यापित";
            const isApproved = app.status === "Approved" || app.status === "स्वीकृत";
            const isActionNeeded = app.status === "Action Required" || app.status === "कार्रवाई आवश्यक";
            const isRefreshing = isRefreshingId === app.id;

            return (
              <div
                key={app.id}
                className={`bg-white border rounded-2xl p-5 sm:p-7 shadow-xs space-y-5 transition-all ${
                  app.isNew
                    ? "border-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-slate-200/90"
                }`}
              >
                {/* Card Top: ID + Status + Refresh + Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                        {app.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {lang === "hi" && app.type_hi ? app.type_hi : app.type}
                      </span>
                      {app.isNew && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          ✨ {t.tracker.justBooked || "Active Pass"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {lang === "hi" && app.schemeName_hi ? app.schemeName_hi : app.schemeName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.kioskName} • {lang === "hi" && app.date_hi ? app.date_hi : app.date}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isConfirmed || isApproved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : isActionNeeded
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}>
                      {lang === "hi" && app.status_hi ? app.status_hi : app.status}
                    </span>

                    {/* Refresh Live Status Icon */}
                    <button
                      type="button"
                      onClick={() => handleRefreshApp(app.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Refresh live status from Central Secretariat"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-700" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>{t.tracker.progressLabel}</span>
                    <span>{app.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isApproved
                          ? "bg-emerald-600"
                          : isActionNeeded
                          ? "bg-amber-500"
                          : "bg-blue-800"
                      }`}
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps Timeline Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {app.steps.map((step, sIdx) => {
                    const stepName = lang === "hi" && step.name_hi ? step.name_hi : step.name;
                    const stepDate = lang === "hi" && step.date_hi ? step.date_hi : step.date;
                    const stepError = lang === "hi" && step.error_hi ? step.error_hi : step.error;

                    return (
                      <div
                        key={sIdx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          step.completed
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : step.current
                            ? "bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-700/20"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-bold">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-700 flex-shrink-0" />
                          )}
                          <span>{t.tracker.stepLabel} {sIdx + 1}</span>
                        </div>
                        <div className="font-semibold text-slate-800 leading-snug">{stepName}</div>
                        <div className="text-[10px] text-slate-500">{stepDate}</div>

                        {stepError && (
                          <div className="mt-2 text-[10px] font-bold text-red-700 bg-red-100 p-2 rounded-lg leading-tight">
                            ⚠️ {stepError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons: View QR Pass, Re-upload Document, or File Grievance */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Left Action Buttons */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {/* View QR Pass Button for CSC Tokens */}
                    {(app.id.startsWith("#SAH") || app.type.includes("Token") || app.qr_code_base64) && (
                      <button
                        type="button"
                        onClick={() => setActiveQrModal(app)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-700" />
                        <span>{t.tracker.viewQrPass || "View QR Pass"}</span>
                      </button>
                    )}

                    {/* Action Needed Specific Buttons */}
                    {isActionNeeded && (
                      <>
                        <Link
                          href="/documents"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t.tracker.reuploadDoc || "Re-upload Document"}</span>
                        </Link>
                        <Link
                          href="/grievances"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold transition-colors"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>{t.tracker.fileGrievance || "File Grievance"}</span>
                        </Link>
                      </>
                    )}

                    {app.operator_phone && (
                      <span className="hidden sm:inline-flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{app.operator_phone}</span>
                      </span>
                    )}
                  </div>

                  {/* Right Link */}
                  <Link
                    href="/map"
                    className="font-bold text-blue-800 hover:text-blue-950 inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t.tracker.btnBookNew}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            3. QR PASS DISPLAY MODAL
            ======================================================== */}
        {activeQrModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === "hi" ? "जन सेवा केंद्र प्राथमिकता पास" : "CSC Priority Appointment Pass"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveQrModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scannable Token Box */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  VERIFIED TOKEN
                </span>
                <p className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                  {activeQrModal.id}
                </p>
                <p className="text-xs font-semibold text-slate-600">{activeQrModal.kioskName}</p>

                {/* Simulated Scannable QR Matrix */}
                <div className="w-36 h-36 mx-auto bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shadow-xs">
                  {activeQrModal.qr_code_base64 ? (
                    <img
                      src={activeQrModal.qr_code_base64}
                      alt="CSC Token QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2 text-center">
                      <QrCode className="w-12 h-12 text-amber-400" />
                      <span className="text-[9px] font-mono mt-1 font-bold">DIGITAL PASS</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  {lang === "hi" ? "VLE ऑपरेटर को यह QR कोड दिखाएं" : "Present this QR code to the VLE operator"}
                </p>
              </div>

              <div className="space-y-1.5 text-xs bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "योजना:" : "Scheme:"}</span>
                  <span className="font-bold text-slate-800">{activeQrModal.schemeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "अपॉइंटमेंट:" : "Appointment:"}</span>
                  <span className="font-bold text-slate-800">{activeQrModal.date}</span>
                </div>
                {activeQrModal.operator_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === "hi" ? "हेल्पलाइन:" : "Helpline:"}</span>
                    <span className="font-mono font-bold text-slate-800">{activeQrModal.operator_phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "पास प्रिंट करें" : "Print Pass"}</span>
                </button>
                <button
                  onClick={() => setActiveQrModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {lang === "hi" ? "बंद करें" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ApplicationTrackerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2 text-slate-600 text-sm font-semibold">
          <RotateCw className="w-4 h-4 animate-spin text-blue-700" />
          <span>Loading Application Tracker...</span>
        </div>
      </div>
    }>
      <TrackerContent />
    </Suspense>
  );
}
