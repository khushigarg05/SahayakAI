"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  LogIn, 
  Phone, 
  Lock, 
  AlertCircle, 
  Loader2, 
  KeyRound,
  CheckCircle2, 
  ShieldCheck,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { loginUser, sendOTP, verifyOTP } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  // Mode: "otp" or "password"
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");

  // Form State
  const [mobile, setMobile] = useState("9876543210");
  const [password, setPassword] = useState("SahayakPass@123");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown Countdown Timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- SEND OTP HANDLER ---
  const handleSendOTP = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setErrorMsg("Kripya 10 anko ka valid Indian Mobile Number dalein.");
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendOTP(cleanMobile);
      setOtpSent(true);
      setDemoOtp(res.demo_otp || null);
      if (res.demo_otp) {
        setOtp(res.demo_otp); // Pre-fill for instant seamless testing
      }
      setCountdown(res.resend_available_in_seconds || 60);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || "OTP dispatch service me samasya aayi. Dobara koshish karein.");
    } finally {
      setOtpSending(false);
    }
  };

  // --- OTP LOGIN HANDLER ---
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (otp.trim().length !== 6) {
      setErrorMsg("Kripya 6 anko ka OTP darj karein.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(mobile, otp);
      if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_token", res.access_token);
        localStorage.setItem("sahayak_user_mobile", res.mobile);
        localStorage.setItem("sahayak_user_role", res.role);
      }
      setSuccessMsg(res.message || "OTP satyapit ho gaya! Dashboard khul raha hai...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- PASSWORD LOGIN HANDLER ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginUser(mobile, password);
      if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_token", res.access_token);
        localStorage.setItem("sahayak_user_mobile", mobile);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Password login error:", err);
      setErrorMsg(err.message || "Mobile number ya password galat hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-800 text-white flex items-center justify-center mx-auto shadow-sm shadow-blue-800/20">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.auth.loginTitle}</h1>
          <p className="text-xs text-slate-500 font-medium">
            {t.auth.loginSub}
          </p>
        </div>

        {/* Dual Mode Switcher (GovTech Tabs) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === "otp"
                ? "bg-white text-blue-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-700" />
            <span>{t.auth.tabOtp || "OTP Login"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === "password"
                ? "bg-white text-blue-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-700" />
            <span>{t.auth.tabPassword || "Password Login"}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Live Demo SMS Dispatch Banner */}
        {authMode === "otp" && otpSent && demoOtp && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{t.auth.demoOtpBadge || "GOV-OTP Code:"}</span>
              <span className="font-mono text-sm px-2 py-0.5 bg-white rounded border border-amber-400 font-black tracking-widest text-slate-900">
                {demoOtp}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              Valid for 5 mins • Auto-filled for instant evaluation.
            </p>
          </div>
        )}

        {/* --- FORM 1: OTP AUTHENTICATION --- */}
        {authMode === "otp" ? (
          <form onSubmit={handleOTPLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.auth.mobileLabel}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder={t.auth.mobilePlaceholder}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending || countdown > 0}
                  className="px-3.5 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer flex-shrink-0"
                >
                  {otpSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : countdown > 0 ? (
                    <span>{countdown}s</span>
                  ) : (
                    <span>{otpSent ? (t.auth.btnResendOtp || "Resend") : (t.auth.btnGetOtp || "Get OTP")}</span>
                  )}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.auth.otpLabel || "6-Digit Verification Code *"}
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {t.auth.otpValidTip || "Valid for 5 mins"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder={t.auth.otpPlaceholder || "Enter 6-digit OTP"}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-sm font-black tracking-widest text-center focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !otpSent || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs shadow-md shadow-blue-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.auth.verifyingOtp || "Verifying..."}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.auth.verifyAndLogin || "Verify OTP & Sign In"}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* --- FORM 2: PASSWORD AUTHENTICATION --- */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.auth.mobileLabel}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t.auth.mobilePlaceholder}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.auth.passwordLabel}
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs shadow-md shadow-blue-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.auth.loggingIn}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.auth.btnLogin}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-bold text-blue-800 hover:underline">
              {t.auth.linkRegister}
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center space-x-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.auth.securityStandard || "Digital India Security Standard"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
