"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PhoneCall, Headphones, Globe2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GovBanner() {
  const { lang, setLang, t } = useLanguage();
  const [fontSize, setFontSize] = useState<"normal" | "sm" | "lg">("normal");

  const handleAudioNarration = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const msg = lang === "hi" 
        ? "सहायक AI राष्ट्रीय कल्याण पहुंच मंच में आपका स्वागत है।"
        : "Welcome to Sahayak AI, the National Welfare Access Platform.";
      const utterance = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFontSizeChange = (size: "normal" | "sm" | "lg") => {
    setFontSize(size);
    if (typeof document !== "undefined") {
      if (size === "sm") {
        document.documentElement.style.fontSize = "14px";
      } else if (size === "lg") {
        document.documentElement.style.fontSize = "18px";
      } else {
        document.documentElement.style.fontSize = "16px";
      }
    }
  };

  return (
    <aside 
      aria-label="Official Government of India Banner" 
      className="w-full bg-[#F9F0E2] text-slate-800 text-xs font-sans border-b border-[#E8DEC9] select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between gap-4">
        
        {/* Left Side: National Emblem + Government of India + Quick DPI Links */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/emblem.png"
              alt="State Emblem of India"
              width={22}
              height={24}
              className="h-5.5 sm:h-6 w-auto object-contain"
              priority
            />
          </div>

          <span className="font-bold text-slate-900 text-xs sm:text-[13.5px] tracking-tight whitespace-nowrap">
            {t.banner.gov}
          </span>

          <span className="text-slate-400 font-light hidden sm:inline text-sm">|</span>

          {/* Quick links to Digital India, MyGov, etc. */}
          <nav className="hidden lg:flex items-center space-x-2.5 text-xs text-slate-700 font-medium">
            {t.banner.links?.map((link, idx) => (
              <React.Fragment key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
                {idx < (t.banner.links?.length || 0) - 1 && (
                  <span className="text-slate-300">|</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Side: Helpline + Listen + Font Resizer + Language Selector */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs font-medium text-slate-700 flex-shrink-0">
          
          {/* Toll-Free Helpline */}
          <div className="flex items-center space-x-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline text-slate-600">{t.banner.tollFree}:</span>
            <a 
              href="tel:18001801551" 
              className="font-bold text-[#1A56DB] hover:underline whitespace-nowrap text-xs sm:text-[13px]"
            >
              1800-180-1551
            </a>
          </div>

          <span className="text-slate-300">|</span>

          {/* Listen / Screen Reader Audio */}
          <button 
            type="button" 
            onClick={handleAudioNarration}
            className="flex items-center space-x-1.5 hover:text-blue-900 transition-colors cursor-pointer"
            title="Listen to page intro"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline font-semibold text-slate-700">{t.banner.audio}</span>
          </button>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Font Resizer A- A A+ */}
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-700 font-bold text-xs" title="Adjust Text Size">
            <button 
              type="button" 
              onClick={() => handleFontSizeChange("sm")} 
              className={`hover:text-blue-900 px-1 py-0.5 rounded cursor-pointer ${fontSize === "sm" ? "text-blue-800 bg-amber-100" : ""}`}
            >
              A-
            </button>
            <button 
              type="button" 
              onClick={() => handleFontSizeChange("normal")} 
              className={`hover:text-blue-900 px-1 py-0.5 rounded cursor-pointer ${fontSize === "normal" ? "text-blue-800 bg-amber-100" : ""}`}
            >
              A
            </button>
            <button 
              type="button" 
              onClick={() => handleFontSizeChange("lg")} 
              className={`hover:text-blue-900 px-1 py-0.5 rounded cursor-pointer ${fontSize === "lg" ? "text-blue-800 bg-amber-100" : ""}`}
            >
              A+
            </button>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Quick Language Dropdown/Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center space-x-1 font-semibold text-slate-800 hover:text-blue-900 cursor-pointer text-xs sm:text-[13px]"
            title="Toggle Language"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-700" />
            <span>{lang === "en" ? "English ▾" : "हिन्दी ▾"}</span>
          </button>

        </div>

      </div>
    </aside>
  );
}
