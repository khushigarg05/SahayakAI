"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TickerBar() {
  const { t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  const announcements = t.ticker.announcements;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const item = announcements[currentIdx] || announcements[0];
  const targetLink = "link" in item && typeof (item as { link?: string }).link === "string" 
    ? (item as { link: string }).link 
    : "/onboarding";

  return (
    <div className="relative w-full bg-gradient-to-r from-[#E5F1FE] via-[#EEF5FC] to-[#F4F8FE] border-y border-[#D6E5F5] h-[55px] min-h-[55px] font-sans overflow-hidden flex items-center select-none">
      
      {/* 1. ASHOKA CHAKRA WATERMARK & TRICOLOR WAVE BACKGROUND (RIGHT ALIGNED) */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-full max-w-2xl h-full overflow-hidden">
        <svg 
          viewBox="0 0 600 55" 
          className="w-full h-full" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="saffronGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0" />
              <stop offset="35%" stopColor="#FF9933" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F58220" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="whiteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#138808" stopOpacity="0" />
              <stop offset="35%" stopColor="#138808" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#138808" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Ashoka Chakra Watermark positioned in the right section */}
          <g transform="translate(300, 55)" opacity="0.18">
            <circle cx="0" cy="0" r="80" fill="none" stroke="#1D4ED8" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="14" fill="#1D4ED8" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x2 = 80 * Math.cos(angle);
              const y2 = -80 * Math.sin(angle);
              return (
                <line 
                  key={i} 
                  x1="0" 
                  y1="0" 
                  x2={x2.toFixed(1)} 
                  y2={y2.toFixed(1)} 
                  stroke="#1D4ED8" 
                  strokeWidth="1.5" 
                />
              );
            })}
          </g>

          {/* Elegant Indian Tricolor Wave Ribbons sweeping upwards to the top-right corner */}
          <g>
            {/* Saffron Ribbon (Top) */}
            <path 
              d="M 440 55 C 495 42, 550 22, 600 8 L 600 0 L 585 0 C 535 10, 485 32, 425 55 Z" 
              fill="url(#saffronGrad)" 
            />
            {/* White Ribbon (Middle) */}
            <path 
              d="M 460 55 C 510 44, 560 26, 600 18 L 600 8 C 550 22, 495 42, 440 55 Z" 
              fill="url(#whiteGrad)" 
            />
            {/* Green Ribbon (Bottom) */}
            <path 
              d="M 480 55 C 525 46, 570 32, 600 28 L 600 18 C 560 26, 510 44, 460 55 Z" 
              fill="url(#greenGrad)" 
            />
          </g>
        </svg>
      </div>

      {/* 2. TICKER CONTENT (ALIGNED EXACTLY WITH MAX-W-7XL PX-4 SM:PX-6 LG:PX-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 relative z-10 w-full">
        
        {/* Left: Deep Navy Latest Updates Pill + Announcement text */}
        <div className="flex items-center space-x-3.5 overflow-hidden flex-1 mr-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0B2545] text-white text-xs font-bold tracking-wide shadow-xs flex-shrink-0">
            <Megaphone className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.ticker.label}</span>
          </div>

          <span className="text-slate-400 font-light hidden sm:inline text-sm">|</span>

          {/* Announcement text */}
          <div className="overflow-hidden flex-1">
            <p className="text-slate-800 font-medium text-xs sm:text-[13.5px] truncate leading-normal">
              {item.text}
            </p>
          </div>
        </div>

        {/* Right: Know More -> Link */}
        <div className="flex-shrink-0 pl-2">
          <Link
            href={targetLink}
            className="inline-flex items-center space-x-1.5 text-[#1A56DB] hover:text-blue-900 font-bold text-xs sm:text-[13.5px] group cursor-pointer transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-100/40"
          >
            <span>{"knowMore" in t.ticker ? String((t.ticker as Record<string, unknown>).knowMore) : "Know More"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>

    </div>
  );
}
