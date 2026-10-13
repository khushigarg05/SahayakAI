"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  MapPin, 
  FileCheck2, 
  LayoutDashboard, 
  BookOpen, 
  AlertCircle, 
  ChevronDown, 
  Menu, 
  X, 
  Clock, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  LogOut
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking");
  const [latency, setLatency] = useState<number>(2);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserMobile(localStorage.getItem("sahayak_user_mobile"));
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sahayak_token");
      localStorage.removeItem("sahayak_user_mobile");
      localStorage.removeItem("sahayak_user_role");
      setUserMobile(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const start = performance.now();
    checkBackendHealth().then((res) => {
      const ping = Math.round(performance.now() - start);
      setLatency(ping > 0 ? ping : 2);
      setBackendStatus(res.status === "healthy" ? "online" : "offline");
    }).catch(() => {
      setBackendStatus("offline");
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary desktop navigation tabs
  const primaryNavItems = [
    { href: "/", label: t.nav.home },
    { href: "/onboarding", label: t.nav.eligibility },
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/map", label: t.nav.map },
    { href: "/schemes", label: t.nav.schemes },
  ];

  // Secondary services dropdown items
  const secondaryServiceItems = [
    { 
      href: "/tracker", 
      label: t.nav.tracker, 
      icon: Clock 
    },
    { 
      href: "/grievances", 
      label: t.nav.grievances, 
      icon: AlertCircle 
    },
    { 
      href: "/documents", 
      label: t.nav.documents, 
      icon: FileText 
    },
    { 
      href: "/analytics", 
      label: t.nav.analytics, 
      icon: BarChart3 
    },
    { 
      href: "/settings", 
      label: t.nav.settings, 
      icon: Settings 
    },
  ];

  const isServicesActive = secondaryServiceItems.some(item => pathname === item.href);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 font-sans shadow-xs">
      
      {/* 3px National Tricolor Top Stripe */}
      <div className="h-[3px] w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-17 gap-4">

          {/* 1. CLEAN & SIMPLE LOGO */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            {/* Simple Official Shield Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#1e3a8a" stroke="#ffffff" />
                <path d="M12 8v8M8 12h8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Typography Lockup (NO DPI PORTAL BADGE) */}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                Sahayak<span className="text-blue-800">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                {lang === "hi" ? "राष्ट्रीय लोक कल्याण मंच" : "National Welfare Access Portal"}
              </span>
            </div>
          </Link>

          {/* 2. SIMPLE, FLAT HORIZONTAL NAVIGATION (NO BOXES, NO WRAPPING) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center px-4">
            {primaryNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors rounded-lg ${
                    isActive
                      ? "text-blue-900 font-bold bg-blue-50/70"
                      : "text-slate-700 hover:text-blue-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* "Services / सेवाएं" Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors rounded-lg cursor-pointer ${
                  isServicesActive || servicesDropdownOpen
                    ? "text-blue-900 font-bold bg-blue-50/70"
                    : "text-slate-700 hover:text-blue-900 hover:bg-slate-50"
                }`}
              >
                <span>{t.nav.services}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? "rotate-180 text-blue-900" : "text-slate-400"}`} />
              </button>

              {/* Dropdown Menu */}
              {servicesDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {secondaryServiceItems.map((sItem) => {
                    const SIcon = sItem.icon;
                    const isItemActive = pathname === sItem.href;

                    return (
                      <Link
                        key={sItem.href}
                        href={sItem.href}
                        onClick={() => setServicesDropdownOpen(false)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isItemActive ? "bg-blue-50 text-blue-900 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <SIcon className={`w-4 h-4 ${isItemActive ? "text-blue-700" : "text-slate-400"}`} />
                        <span>{sItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. SIMPLE RIGHT TOOLS */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            
            {/* Subtle Online Status Dot */}
            <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
              <span className={`w-2 h-2 rounded-full ${backendStatus === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
              <span className="hidden xl:inline">{backendStatus === "online" ? "Online" : "Connecting"}</span>
            </div>

            {/* Clean Segmented Language Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "en" 
                    ? "bg-white text-blue-900 font-bold shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "hi" 
                    ? "bg-white text-blue-900 font-bold shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Citizen Session / Login Button */}
            {userMobile ? (
              <div className="flex items-center space-x-2">
                <span className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 {userMobile.slice(0, 5)}...</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.nav.citizenLogin}</span>
              </Link>
            )}

          </div>

          {/* 4. MOBILE HAMBURGER CONTROLS */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {lang === "hi" ? "ENG" : "हिन्दी"}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 5. CLEAN MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-blue-50 text-blue-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {t.nav.services}
            </div>
            {secondaryServiceItems.map((sItem) => {
              const SIcon = sItem.icon;
              const isActive = pathname === sItem.href;

              return (
                <Link
                  key={sItem.href}
                  href={sItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive ? "bg-blue-50 text-blue-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <SIcon className="w-4 h-4 text-slate-400" />
                  <span>{sItem.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>{t.nav.citizenLogin}</span>
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
}
