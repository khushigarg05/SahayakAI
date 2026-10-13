"use client";

import React from "react";
import { ShieldCheck, PhoneCall, Volume2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GovBanner() {
  const { lang, t } = useLanguage();

  const handleAudioNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const msg = lang === "hi" 
        ? "सहायक AI राष्ट्रीय कल्याण पहुंच मंच में आपका स्वागत है।"
        : "Welcome to Sahayak AI, the National Welfare Access Platform.";
      const utterance = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <aside aria-label="Official Government Banner" className="w-full bg-slate-950 text-slate-300 text-[11px] font-sans border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
        
        {/* Left: National Identity */}
        <div className="flex items-center space-x-2.5">
          {/* Tricolor Ribbon */}
          <div className="flex flex-col w-3.5 h-2.5 rounded-[1px] overflow-hidden shadow-xs border border-white/20" title="National Flag of India">
            <div className="h-1/3 bg-[#FF9933]" />
            <div className="h-1/3 bg-white flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
            </div>
            <div className="h-1/3 bg-[#138808]" />
          </div>

          <div className="flex items-center space-x-1.5 font-medium tracking-tight">
            <span className="text-slate-100 font-semibold">{t.banner.gov}</span>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <span className="text-slate-400 hidden xs:inline">{t.banner.dpi}</span>
          </div>
        </div>

        {/* Right: Helpline & Accessibility */}
        <div className="flex items-center space-x-3 sm:space-x-4 font-mono text-[10px]">
          <div className="flex items-center space-x-1 text-slate-400">
            <PhoneCall className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">{t.banner.tollFree}: </span>
            <strong className="text-slate-200">1800-180-1551</strong>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <button 
            type="button" 
            className="hidden md:flex items-center space-x-1 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            onClick={handleAudioNarration}
            title="Read out page"
          >
            <Volume2 className="w-3 h-3 text-slate-400" />
            <span>{t.banner.audio}</span>
          </button>

          <div className="h-3 w-px bg-slate-800 hidden md:block" />

          <div className="hidden sm:flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold tracking-wider">{t.banner.secure}</span>
          </div>
        </div>

      </div>
    </aside>
  );
}
