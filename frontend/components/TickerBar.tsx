"use client";

import React, { useState, useEffect } from "react";
import { Radio, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TickerBar() {
  const { t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  const announcements = t.ticker.announcements;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const item = announcements[currentIdx] || announcements[0];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800/80 text-xs py-1.5 px-4 font-sans text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Live Pulse Label */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold tracking-wider">
            <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
            <span>{t.ticker.label}</span>
          </span>
        </div>

        {/* Dynamic Announcement Ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 flex-shrink-0">
              {item.tag}
            </span>
            <span className="text-slate-200 font-medium text-[11px] truncate">
              {item.text}
            </span>
          </div>
        </div>

        {/* Quick Trust Stat */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px] font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{t.ticker.fastApi}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 font-semibold">{t.ticker.verifiedRecords}</span>
        </div>

      </div>
    </div>
  );
}
