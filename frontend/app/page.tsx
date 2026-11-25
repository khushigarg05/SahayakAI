"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  FileCheck2, 
  FileCheck, 
  MapPin, 
  Building2, 
  Users, 
  Zap, 
  BarChart3, 
  Lightbulb, 
  BrainCircuit,
  Lock,
  Globe,
  Scale,
  Sparkles,
  QrCode
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* =========================================================================
          1. HERO SECTION: BALANCED TWO-COLUMN GOVTECH ARCHITECTURE
         ========================================================================= */}
      <section className="relative w-full bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] border-b border-slate-200/80 py-12 sm:py-16 lg:py-20 overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 w-80 h-80 rounded-full bg-emerald-100/30 blur-3xl" />

        {/* Unified 1280px Grid aligned with GovBanner, Navbar & TickerBar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          
          {/* ----------------- LEFT COLUMN: MISSION, HEADLINE & CTAS ----------------- */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            
            {/* Tagline / Sub-badge with accent line */}
            <div className="inline-flex items-center space-x-2 text-blue-700 font-bold text-xs sm:text-[13px] tracking-wider uppercase">
              <span className="p-1 rounded-md bg-blue-100/70 border border-blue-200 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
              </span>
              <span>{t.home.tag}</span>
              <span className="w-6 h-[1.5px] bg-blue-600 inline-block ml-1" />
            </div>

            {/* Main Authoritative Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 tracking-tight leading-[1.14]">
              {t.home.heroTitle1} <br />
              <span className="text-[#1A56DB]">{t.home.heroTitle2}</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              {t.home.heroDesc}
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all text-center cursor-pointer group"
              >
                <FileCheck2 className="w-4 h-4 text-blue-100" />
                <span>{t.home.btnCheck}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/map"
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t.home.btnLocate}</span>
              </Link>
            </div>

            {/* Row of 3 Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-5 sm:gap-7 text-xs sm:text-[13px] text-slate-600 font-medium">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.home.guarantee1}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{t.home.guarantee2}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.home.guarantee3}</span>
              </div>
            </div>

          </div>

          {/* ----------------- RIGHT COLUMN: SYSTEM BENCHMARKS CARD ----------------- */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
              
              {/* Header: Benchmarks Title + Pulsing Green Live Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    {t.home.metricsTitle}
                  </span>
                </div>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t.home.testedLive}</span>
                </span>
              </div>

              {/* 2x2 Grid of Key Indicators */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4 mt-5">
                
                {/* 1. Schemes */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                      {t.home.metricSchemes}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                      {t.home.metricSchemesDesc}
                    </p>
                  </div>
                </div>

                {/* 2. Profiles */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                      {t.home.metricTrained}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                      {t.home.metricTrainedDesc}
                    </p>
                  </div>
                </div>

                {/* 3. Latency */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                      {t.home.metricLatency}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                      {t.home.metricLatencyDesc}
                    </p>
                  </div>
                </div>

                {/* 4. Zero Rejection */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 hover:border-amber-200 transition-colors">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                      {t.home.metricZeroRejection}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                      {t.home.metricZeroRejectionDesc}
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom Core Innovation Callout */}
              <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-[13px] text-blue-950 leading-relaxed font-normal">
                  <strong className="font-bold text-blue-900">{t.home.coreInnovationTitle} </strong>
                  {t.home.coreInnovationText}
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. 4-STAGE ARCHITECTURE WORKFLOW SECTION
         ========================================================================= */}
      <section className="w-full py-14 sm:py-20">
        
        {/* Unified 1280px Grid aligned with all sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Section Header with Centered Pill & Accent Bar */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-widest">
              {t.home.pillarsTag}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {t.home.pillarsTitle}
            </h2>
            <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-3" />
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            
            {/* Stage 1: Deterministic Matching */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    01
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {t.home.p1Title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {t.home.p1Desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-blue-700 flex items-center space-x-1">
                <span>Gazette Criteria Verification</span>
              </div>
            </div>

            {/* Stage 2: ML Risk Prediction */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                    02
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {t.home.p2Title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {t.home.p2Desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-amber-700 flex items-center space-x-1">
                <span>14 Socioeconomic Risk Factors</span>
              </div>
            </div>

            {/* Stage 3: Explainable Remedies */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                    03
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {t.home.p3Title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {t.home.p3Desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-purple-700 flex items-center space-x-1">
                <span>SHAP Contribution Breakdown</span>
              </div>
            </div>

            {/* Stage 4: CSC Digital Pass */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    04
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {t.home.p4Title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {t.home.p4Desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <span>Zero-Wait Token Generation</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CIVIC FOOTER
         ========================================================================= */}
      <footer className="w-full mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <span className="font-extrabold text-white text-sm tracking-wide">SahayakAI</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-300 font-medium">{t.home.footerText}</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            National Welfare Access Portal • Digital India
          </div>
        </div>
      </footer>

    </div>
  );
}
