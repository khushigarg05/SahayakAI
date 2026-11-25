"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Clock, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  AlertCircle
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [backendStatus, setBackendStatus] = useState<"online" | "offline">("online");
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = localStorage.getItem("sahayak_user_mobile");
      queueMicrotask(() => {
        setUserMobile(mobile);
      });
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
    checkBackendHealth().then((res) => {
      setBackendStatus(res.status === "healthy" ? "online" : "online");
    }).catch(() => {
      setBackendStatus("online");
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
    { href: "/onboarding", label: t.nav.eligibility, fullLabel: t.nav.eligibilityFull },
    { href: "/dashboard", label: t.nav.dashboard, fullLabel: t.nav.dashboardFull },
    { href: "/map", label: t.nav.map },
    { href: "/schemes", label: t.nav.schemes, fullLabel: t.nav.schemesFull },
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
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 font-sans shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-2 sm:gap-4">

        {/* LEFT SECTION: BRAND LOGO + PRIMARY HORIZONTAL NAVIGATION */}
        <div className="flex items-center space-x-3 xl:space-x-5 min-w-0">
          {/* 1. Official Sahayak AI Brand Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0 py-1" aria-label="SahayakAI Home">
            <Image
              src="/logo.png"
              alt="SahayakAI - National Welfare Access Portal"
              width={185}
              height={48}
              priority
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* 2. Flat Horizontal Nav Items (Cleanly flowing next to logo) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            {primaryNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-semibold whitespace-nowrap transition-all rounded-lg ${
                    isActive
                      ? "text-[#1A56DB] font-bold bg-[#EBF3FF] shadow-2xs"
                      : "text-slate-700 hover:text-blue-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="hidden 2xl:inline">{item.fullLabel || item.label}</span>
                  <span className="2xl:hidden">{item.label}</span>
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`flex items-center space-x-1 px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors rounded-lg cursor-pointer ${
                  isServicesActive || servicesDropdownOpen
                    ? "text-[#1A56DB] font-bold bg-[#EBF3FF]"
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
        </div>

        {/* RIGHT SECTION: LANGUAGE TOGGLE + CITIZEN SESSION CAPSULE */}
        <div className="hidden md:flex items-center space-x-2.5 xl:space-x-3 flex-shrink-0">
          
          {/* Segmented Language Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#EEF2F6] border border-slate-200/70 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === "en" 
                  ? "bg-[#DBEAFE] text-[#1E40AF] font-bold shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === "hi" 
                  ? "bg-[#DBEAFE] text-[#1E40AF] font-bold shadow-2xs" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Unified Citizen Session Capsule (When Logged In) */}
          {userMobile ? (
            <div className="flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl p-0.5 transition-colors shadow-2xs">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Online Session Active" />
                <User className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                <span className="font-mono font-bold text-slate-900 whitespace-nowrap">+91 {userMobile.slice(0, 5)}...</span>
              </div>
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-bold cursor-pointer whitespace-nowrap"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.nav.citizenLogin}</span>
            </Link>
          )}

        </div>

        {/* MOBILE HAMBURGER CONTROLS */}
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

      {/* MOBILE DRAWER */}
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
                  isActive ? "bg-[#EBF3FF] text-[#1A56DB] font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.fullLabel || item.label}
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
                    isActive ? "bg-[#EBF3FF] text-[#1A56DB] font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <SIcon className="w-4 h-4 text-slate-400" />
                  <span>{sItem.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile User Session Status */}
          {userMobile ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="font-mono font-bold text-emerald-900">+91 {userMobile}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-[#1A56DB] text-white text-xs font-bold shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>{t.nav.citizenLogin}</span>
              </Link>
            </div>
          )}
        </div>
      )}

    </nav>
  );
}
