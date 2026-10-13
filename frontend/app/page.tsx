"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  FileCheck, 
  MapPin, 
  Building2, 
  Activity, 
  BrainCircuit,
  Scale,
  QrCode
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Mission & Pitch */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.home.tag}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t.home.heroTitle1} <br />
              <span className="text-blue-800">{t.home.heroTitle2}</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              {t.home.heroDesc}
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-sm font-bold shadow-md transition-all text-center cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                <span>{t.home.btnCheck}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/map"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 text-sm font-bold shadow-xs transition-all text-center cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{t.home.btnLocate}</span>
              </Link>
            </div>

            {/* Guarantees */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.home.guarantee1}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <span>{t.home.guarantee2}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Benchmarks Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-blue-800" />
                  <span>{t.home.metricsTitle}</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  TESTED LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xl sm:text-2xl font-black text-blue-800">{t.home.metricSchemes}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.home.metricSchemesDesc}</p>
                </div>

                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">{t.home.metricTrained}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.home.metricTrainedDesc}</p>
                </div>

                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xl sm:text-2xl font-black text-purple-700">{t.home.metricLatency}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.home.metricLatencyDesc}</p>
                </div>

                <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xl sm:text-2xl font-black text-amber-600">{t.home.metricZeroRejection}</span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.home.metricZeroRejectionDesc}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-100/50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                💡 {t.home.innovationTip}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 CORE ARCHITECTURAL PILLARS */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            {t.home.pillarsTag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {t.home.pillarsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t.home.p1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.home.p1Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t.home.p2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.home.p2Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t.home.p3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.home.p3Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t.home.p4Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.home.p4Desc}</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">SahayakAI</span>
            <span>•</span>
            <span>{t.home.footerText}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
