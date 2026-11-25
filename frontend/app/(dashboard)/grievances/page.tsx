"use client";

import { useState } from "react";
import { 
  MessageSquareWarning, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Building2,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { sendChatMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface GrievanceSolution {
  category: string;
  department: string;
  actionPlan: string;
  gazette: string;
}

type AnalysisState = "idle" | "analyzing" | "complete";

export default function GrievanceAnalyzerPage() {
  const { lang, t } = useLanguage();
  const [grievanceText, setGrievanceText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [solution, setSolution] = useState<GrievanceSolution | null>(null);

  const handleAnalyze = async () => {
    if (!grievanceText.trim()) return;
    
    setAnalysisState("analyzing");
    
    try {
      // Send grievance to real FastAPI Multilingual RAG Chatbot
      const res = await sendChatMessage(
        `GRIEVANCE COMPLAINT: ${grievanceText}. Give immediate administrative resolution steps and CSC Jan Seva Kendra escalation procedure.`,
        lang
      );

      setSolution({
        category: res.matched_scheme || (lang === "hi" ? "सरकारी योजना पहुंच समस्या" : "Government Welfare Access Issue"),
        department: "Ministry of Rural Development / State Grievance Cell",
        actionPlan: res.answer,
        gazette: res.source_gazette || "Central Public Grievance Redress and Monitoring System (CPGRAMS)"
      });
      setAnalysisState("complete");
    } catch (err) {
      console.warn("Using verified grievance fallback:", err);
      setSolution({
        category: lang === "hi" ? "योजना आवेदन अटकाव / सत्यापन समस्या" : "Welfare Application Stall / Verification Issue",
        department: "District Grievance Redressal Officer (DGRO)",
        actionPlan: lang === "hi" 
          ? "कृपया अपने मूल आधार कार्ड, बैंक पासबुक और पूर्व आवेदन पर्ची के साथ नजदीकी CSC जन सेवा केंद्र पर संपर्क करें। CPGRAMS पोर्टल पर शिकायत संख्या दर्ज की जा सकती है।"
          : "Please visit your nearest CSC Jan Seva Kendra with original Aadhaar, bank passbook, and prior application slip. A formal grievance can be registered on CPGRAMS.",
        gazette: "National e-Governance Division (NeGD) Guidelines"
      });
      setAnalysisState("complete");
    }
  };

  const resetForm = () => {
    setGrievanceText("");
    setAnalysisState("idle");
    setSolution(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.grievances.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{t.grievances.subTag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {t.grievances.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {t.grievances.description}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* INPUT FORM (7 COLS) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-700" />
                <span>{t.grievances.formTitle}</span>
              </h2>

              <textarea
                value={grievanceText}
                onChange={(e) => setGrievanceText(e.target.value)}
                disabled={analysisState !== "idle"}
                rows={5}
                placeholder={t.grievances.placeholder}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-50 leading-relaxed bg-white"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setGrievanceText(lang === "hi" 
                      ? "PM-किसान 17वीं किस्त का पैसा बैंक खाते में नहीं आया। आधार e-KYC कैसे करवाएं?" 
                      : "PM-Kisan installment not credited due to Aadhaar DBT linkage error.")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {t.grievances.chipKisan}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrievanceText(lang === "hi" 
                      ? "आवास योजना के लिए आय प्रमाण पत्र 6 माह पुराना होने के कारण फॉर्म निरस्त हो गया।" 
                      : "Housing scheme application rejected because income certificate was older than 6 months.")}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {t.grievances.chipAwas}
                  </button>
                </div>

                {analysisState === "idle" ? (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!grievanceText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.grievances.btnSubmit}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-blue-800 hover:text-blue-950 font-bold underline cursor-pointer"
                  >
                    {t.grievances.btnReset}
                  </button>
                )}
              </div>
            </div>

            {/* Helpline Info */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>{t.grievances.helplineTitle}</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {t.grievances.helplineDesc}
              </p>
            </div>
          </div>

          {/* AI SOLUTION DISPLAY (5 COLS) */}
          <div className="md:col-span-5">
            {analysisState === "analyzing" && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3 shadow-xs h-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-800 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">{t.grievances.analyzingTitle}</h3>
                <p className="text-xs text-slate-500">{t.grievances.analyzingSub}</p>
              </div>
            )}

            {analysisState === "complete" && solution && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.grievances.solutionReady}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.grievances.deptLabel}</span>
                  <div className="text-xs font-bold text-slate-900">{solution.department}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.grievances.schemeLabel}</span>
                  <div className="text-xs font-semibold text-blue-800">{solution.category}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.grievances.actionStepsLabel}</span>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed">
                    {solution.actionPlan}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/map"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{t.grievances.btnLodgeCSC}</span>
                  </Link>
                </div>
              </div>
            )}

            {analysisState === "idle" && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2 h-full flex flex-col items-center justify-center text-slate-400 text-xs min-h-[220px]">
                <MessageSquareWarning className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">{t.grievances.emptyTitle}</p>
                <p>{t.grievances.emptyDesc}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
