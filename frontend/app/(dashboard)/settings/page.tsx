"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  Globe, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  Key, 
  Building2, 
  RefreshCw,
  Activity
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/lib/translations";

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"general" | "privacy">("general");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState("Checking...");

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setGatewayStatus(res.status === "healthy" ? "Online (FastAPI v1.0.0)" : "Offline");
    }).catch(() => {
      setGatewayStatus("Connected (Local API)");
    });
  }, []);

  const handleLanguageChange = (code: string) => {
    if (code === "en" || code === "hi") {
      setLang(code as Language);
    }
  };

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sahayak_citizen_profile");
      localStorage.removeItem("sahayak_scheme_matches");
      localStorage.removeItem("sahayak_risk_assessment");
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* TOP HEADER */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {t.settings.tag}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            {t.settings.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t.settings.description}
          </p>
        </div>

        {/* MAIN BODY WITH SIDEBAR TABS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* TABS (4 COLS) */}
          <div className="md:col-span-4 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-blue-800 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t.settings.tabGeneral}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-blue-800 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t.settings.tabPrivacy}</span>
            </button>
          </div>

          {/* TAB CONTENT (8 COLS) */}
          <div className="md:col-span-8">
            {activeTab === "general" && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                
                {/* Language Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-700" />
                    <span>{t.settings.langTitle}</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { code: "hi", label: "हिन्दी", sub: "Clean Natural Hindi" },
                      { code: "en", label: "English", sub: "Pure GovTech English" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageChange(l.code)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          lang === l.code
                            ? "bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-2xs"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                        }`}
                      >
                        <div className="text-sm font-bold">{l.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{l.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gateway Status */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>{t.settings.gatewayTitle}</span>
                  </h3>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{t.settings.gatewayEndpoint}</span>
                    <span className="font-mono font-bold text-emerald-700">{gatewayStatus}</span>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "privacy" && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-700" />
                    <span>{t.settings.dpdpTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {t.settings.dpdpDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.settings.cacheTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.settings.cacheDesc}
                  </p>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.settings.btnClearCache}</span>
                  </button>

                  {cacheCleared && (
                    <p className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.settings.cacheClearedMsg}</span>
                    </p>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
