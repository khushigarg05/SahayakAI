"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Landmark,
  BadgeCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  verifyDocumentWithApiSetu, 
  getApiSetuSamples, 
  ApiSetuDocResponse, 
  ApiSetuSampleItem 
} from "@/lib/api";

interface ApiSetuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVerification?: (data: {
    docType: string;
    docNumber: string;
    income?: number;
    bplStatus?: boolean;
    hasBank?: boolean;
    dbtActive?: boolean;
    caste?: string;
    metadata: Record<string, unknown>;
  }) => void;
}

export default function ApiSetuModal({ isOpen, onClose, onApplyVerification }: ApiSetuModalProps) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"income" | "ration" | "dbt" | "caste">("income");
  const [docNumber, setDocNumber] = useState<string>("UP/INC/2026/89412");
  const [selectedState, setSelectedState] = useState<string>("Uttar Pradesh");
  const [citizenName, setCitizenName] = useState<string>("Ramesh Kumar");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ApiSetuDocResponse | null>(null);
  const [samples, setSamples] = useState<ApiSetuSampleItem[]>([]);
  const [applied, setApplied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      getApiSetuSamples().then((res) => {
        setSamples(res.samples);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tab: "income" | "ration" | "dbt" | "caste") => {
    setActiveTab(tab);
    setResult(null);
    setApplied(false);
    setErrorMsg(null);
    
    // Set default matching sample for the tab
    if (tab === "income") setDocNumber("UP/INC/2026/89412");
    if (tab === "ration") setDocNumber("BR/RAT/BPL/99214");
    if (tab === "dbt") setDocNumber("DBT-ACTIVE-9102");
    if (tab === "caste") setDocNumber("UP/CST/2025/4412");
  };

  const handleSelectSample = (sample: ApiSetuSampleItem) => {
    if (sample.doc_type === "income" || sample.doc_type === "ration" || sample.doc_type === "dbt" || sample.doc_type === "caste") {
      setActiveTab(sample.doc_type);
    }
    setDocNumber(sample.doc_number);
    setResult(null);
    setApplied(false);
    setErrorMsg(null);
  };

  const handleVerify = async () => {
    if (!docNumber.trim()) {
      setErrorMsg("Please enter a certificate or account number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setApplied(false);

    try {
      const res = await verifyDocumentWithApiSetu({
        doc_type: activeTab,
        doc_number: docNumber.trim(),
        state: selectedState,
        citizen_name: citizenName.trim() || undefined
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "API Setu Gateway timed out. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !onApplyVerification) return;

    const meta = (result.metadata || {}) as {
      annual_income?: number;
      bpl_status?: boolean;
      dbt_active?: boolean;
      caste_category?: string;
      [key: string]: unknown;
    };

    onApplyVerification({
      docType: result.doc_type,
      docNumber: result.doc_number,
      income: typeof meta.annual_income === "number" ? meta.annual_income : undefined,
      bplStatus: typeof meta.bpl_status === "boolean" ? meta.bpl_status : (typeof meta.annual_income === "number" && meta.annual_income < 120000),
      hasBank: result.doc_type === "dbt" ? true : undefined,
      dbtActive: typeof meta.dbt_active === "boolean" ? meta.dbt_active : undefined,
      caste: typeof meta.caste_category === "string" ? meta.caste_category : undefined,
      metadata: result.metadata
    });

    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        
        {/* ================= MODAL HEADER ================= */}
        <div className="bg-[#FAF3E8] border-b border-[#E8DEC9] px-5 sm:px-7 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DEC9] p-1.5 flex items-center justify-center shadow-2xs">
              <Image
                src="/emblem.png"
                alt="Emblem of India"
                width={24}
                height={26}
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                  {t.apiSetu.modalTitle}
                </h3>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>SANDBOX LIVE</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                {t.apiSetu.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          
          {/* Document Type Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange("income")}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === "income"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.apiSetu.tabIncome}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ration")}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === "ration"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.apiSetu.tabRation}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("dbt")}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === "dbt"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.apiSetu.tabDbt}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("caste")}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === "caste"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.apiSetu.tabCaste}</span>
            </button>
          </div>

          {/* Quick 1-Click Developer Sandbox Sample Chips */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.apiSetu.sampleHeading}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button
                  key={s.doc_number}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 ${
                    docNumber === s.doc_number
                      ? "bg-blue-50 border-blue-300 text-blue-900 font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.expected_status === "verified" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span>{s.doc_number}</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    ({lang === "hi" ? s.label_hi : s.label})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Document Number Input & State Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {t.apiSetu.inputDocLabel}
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={t.apiSetu.inputDocPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 text-sm font-mono text-slate-900 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {t.apiSetu.stateLabel}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-700 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Central (All India)">Central (All India)</option>
              </select>
            </div>
          </div>

          {/* Action: Verify Button */}
          <div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#1A56DB] hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t.apiSetu.btnVerifying}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  <span>{t.apiSetu.btnVerify}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <XCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= VERIFICATION RESULT CARD ================= */}
          {result && (
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
              result.status === "verified"
                ? "bg-emerald-50/70 border-emerald-200"
                : result.status === "expired"
                ? "bg-amber-50/70 border-amber-200"
                : "bg-red-50/70 border-red-200"
            }`}>
              
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-3">
                <div className="flex items-center space-x-2">
                  {result.status === "verified" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : result.status === "expired" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className={`text-xs font-extrabold uppercase tracking-wide ${
                      result.status === "verified"
                        ? "text-emerald-800"
                        : result.status === "expired"
                        ? "text-amber-800"
                        : "text-red-800"
                    }`}>
                      {result.status === "verified" 
                        ? t.apiSetu.verifiedBadge
                        : result.status === "expired"
                        ? t.apiSetu.expiredBadge
                        : t.apiSetu.rejectedBadge}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      {lang === "hi" ? result.message_hi : result.message}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 flex-shrink-0">
                  {result.doc_number}
                </span>
              </div>

              {/* Document Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Citizen Name</span>
                  <p className="font-bold text-slate-900">{result.holder_name}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Authority</span>
                  <p className="font-semibold text-slate-800 truncate" title={result.authority}>
                    {result.authority}
                  </p>
                </div>

                {typeof result.metadata?.annual_income === "number" && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Verified Income</span>
                    <p className="font-black text-blue-900">
                      ₹{result.metadata.annual_income.toLocaleString()} / Year
                    </p>
                  </div>
                )}

                {result.expiry_date && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Validity / Expiry</span>
                    <p className="font-semibold text-slate-800">{result.expiry_date}</p>
                  </div>
                )}

                {result.metadata?.dbt_active !== undefined && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">NPCI DBT Status</span>
                    <p className={`font-bold ${result.metadata.dbt_active ? "text-emerald-700" : "text-red-600"}`}>
                      {result.metadata.dbt_active ? "ACTIVE (DBT Ready)" : "INACTIVE (Action Required)"}
                    </p>
                  </div>
                )}

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Digital Signature</span>
                  <p className="font-mono text-[10px] text-slate-600 truncate" title={result.signature_hash}>
                    {result.signature_hash}
                  </p>
                </div>
              </div>

              {/* Action: Auto-fill to Onboarding Form */}
              {result.status === "verified" && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    {applied ? `✓ ${t.apiSetu.appliedSuccess}` : "Apply verified values to your application profile:"}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applied}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 ${
                      applied
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-800 hover:bg-blue-900 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{applied ? "Applied!" : t.apiSetu.applyToForm}</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-7 py-3 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center space-x-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital India • MeitY National API Exchange Protocol</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
          >
            {t.apiSetu.close}
          </button>
        </div>

      </div>
    </div>
  );
}
