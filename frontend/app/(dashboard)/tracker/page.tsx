"use client";

import { useState } from "react";
import { 
  ListChecks, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Landmark as Bank, 
  FileSignature, 
  ArrowRight, 
  Search, 
  AlertCircle,
  Building2,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface TrackingStep {
  name: string;
  date: string;
  completed: boolean;
  current?: boolean;
  error?: string;
}

interface TrackingApp {
  id: string;
  schemeName: string;
  type: string;
  status: string;
  kioskName: string;
  date: string;
  progress: number;
  steps: TrackingStep[];
}

export default function ApplicationTrackerPage() {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");

  const sampleTracking: TrackingApp[] = [
    {
      id: "#SAH-89421",
      schemeName: lang === "hi" 
        ? "प्रधानमंत्री आवास योजना (ग्रामीण)" 
        : "Pradhan Mantri Awas Yojana (PMAY-G)",
      type: lang === "hi" ? "CSC प्राथमिकता टोकन पास" : "CSC Priority Appointment Token",
      status: t.tracker.statusConfirmed,
      kioskName: "Rampur CSC Jan Seva Kendra",
      date: lang === "hi" ? "कल, प्रातः 10:00 - 11:00" : "Tomorrow, 10:00 AM - 11:00 AM",
      progress: 75,
      steps: [
        { 
          name: lang === "hi" ? "टोकन ऑनलाइन जनरेट हुआ" : "Token Generated Online", 
          date: lang === "hi" ? "आज" : "Today", 
          completed: true 
        },
        { 
          name: lang === "hi" ? "केंद्र पर स्लॉट आरक्षित" : "Slot Reserved at Kiosk", 
          date: lang === "hi" ? "सत्यापित" : "Confirmed", 
          completed: true 
        },
        { 
          name: lang === "hi" ? "बायोमेट्रिक e-KYC व दस्तावेज़ स्कैन" : "Biometric e-KYC & Doc Scan", 
          date: lang === "hi" ? "आगामी" : "Upcoming", 
          completed: false, 
          current: true 
        },
        { 
          name: lang === "hi" ? "अंतिम निदेशालय स्वीकृति" : "Final Directorate Submission", 
          date: lang === "hi" ? "लंबित" : "Pending", 
          completed: false 
        },
      ]
    },
    {
      id: "APP-5510",
      schemeName: lang === "hi" ? "आयुष्मान भारत योजना (PM-JAY)" : "Ayushman Bharat (PM-JAY)",
      type: lang === "hi" ? "डिजिटल आवेदन" : "Digital Application",
      status: t.tracker.statusReview,
      kioskName: "Rohania Digital Seva Kendra",
      date: lang === "hi" ? "समीक्षाधीन" : "Under Review",
      progress: 40,
      steps: [
        { 
          name: lang === "hi" ? "आवेदन जमा किया गया" : "Application Submitted", 
          date: "18 Oct", 
          completed: true 
        },
        { 
          name: lang === "hi" ? "दस्तावेज़ सत्यापन" : "Document Verification", 
          date: lang === "hi" ? "कार्रवाई आवश्यक" : "Action Needed", 
          completed: false, 
          current: true, 
          error: lang === "hi" ? "आय प्रमाण पत्र का पुनः सत्यापन आवश्यक है।" : "Income certificate copy needs re-attestation." 
        },
        { 
          name: lang === "hi" ? "गोल्डन कार्ड जारी होना" : "Golden Card Issued", 
          date: lang === "hi" ? "लंबित" : "Pending", 
          completed: false 
        },
      ]
    }
  ];

  const filteredData = sampleTracking.filter(app => 
    app.id.toLowerCase().includes(query.toLowerCase()) ||
    app.schemeName.toLowerCase().includes(query.toLowerCase()) ||
    app.kioskName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER BAR */}
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

            <div className="relative w-full sm:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.tracker.searchPlaceholder}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* TRACKING CARDS */}
        <div className="space-y-6">
          {filteredData.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                      {app.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{app.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{app.schemeName}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.kioskName} • {app.date}</span>
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  app.status === t.tracker.statusConfirmed
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {app.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>{t.tracker.progressLabel}</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-blue-800 rounded-full transition-all duration-500"
                    style={{ width: `${app.progress}%` }}
                  />
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {app.steps.map((step, sIdx) => (
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
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-700" />
                      )}
                      <span>{t.tracker.stepLabel} {sIdx + 1}</span>
                    </div>
                    <div className="font-semibold text-slate-800">{step.name}</div>
                    <div className="text-[10px] text-slate-500">{step.date}</div>

                    {step.error && (
                      <div className="mt-2 text-[10px] font-bold text-red-700 bg-red-100 p-1.5 rounded-lg">
                        ⚠️ {step.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">{t.tracker.cscNotice}</span>
                <Link
                  href="/map"
                  className="font-bold text-blue-800 hover:text-blue-950 inline-flex items-center space-x-1"
                >
                  <span>{t.tracker.btnBookNew}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
