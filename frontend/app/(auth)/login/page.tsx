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
  Sparkles
} from "lucide-react";
import { loginUser, sendOTP, verifyOTP, firebaseLogin } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  // Mode: "otp" or "password"
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");

  // Form State
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isFirebaseOTP, setIsFirebaseOTP] = useState(false);

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

  // Clean up Recaptcha on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        try {
          (window.recaptchaVerifier as { clear: () => void }).clear();
        } catch {
          // ignore cleanup errors
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // Initialize or get invisible RecaptchaVerifier
  const getRecaptchaVerifier = () => {
    if (typeof window === "undefined") return null;
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            if (window.recaptchaVerifier) {
              try {
                (window.recaptchaVerifier as { clear: () => void }).clear();
              } catch {
                // ignore cleanup errors
              }
              window.recaptchaVerifier = undefined;
            }
          }
        });
      }
      return window.recaptchaVerifier;
    } catch (err) {
      console.warn("RecaptchaVerifier init error:", err);
      return null;
    }
  };

  // Dynamic Language Translation Helper for Errors
  const getLocalizedErrorMessage = (msg: string | null): string => {
    if (!msg) return "";

    // Match Cooldown regex for remaining seconds
    const cooldownMatch = msg.match(/(\d+)\s*(?:seconds|सेकंड)/i);
    const seconds = cooldownMatch ? cooldownMatch[1] : (countdown > 0 ? String(countdown) : "30");

    if (
      msg.toLowerCase().includes("already registered") || 
      msg.includes("pehle se registered") ||
      msg.toLowerCase().includes("already exists")
    ) {
      return lang === "hi"
        ? "यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।"
        : "This mobile number is already registered. Please sign in.";
    }

    if (
      msg.includes("pehle hi bheja") || 
      msg.toLowerCase().includes("already sent") || 
      msg.toLowerCase().includes("cooldown") ||
      msg.toLowerCase().includes("retry after")
    ) {
      return lang === "hi"
        ? `ओटीपी पहले ही भेजा जा चुका है। कृपया ${seconds} सेकंड बाद दोबारा प्रयास करें।`
        : `OTP has already been sent. Please retry after ${seconds} seconds.`;
    }

    if (
      msg.includes("10 anko") || 
      msg.toLowerCase().includes("10-digit") || 
      msg.toLowerCase().includes("valid indian mobile")
    ) {
      return lang === "hi"
        ? "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।"
        : "Please enter a valid 10-digit Indian Mobile Number.";
    }

    if (
      msg.includes("6 anko") || 
      msg.toLowerCase().includes("6-digit") || 
      msg.toLowerCase().includes("6 digits")
    ) {
      return lang === "hi"
        ? "कृपया 6 अंकों का ओटीपी कोड दर्ज करें।"
        : "Please enter a valid 6-digit OTP code.";
    }

    if (
      msg.toLowerCase().includes("invalid otp") || 
      msg.includes("galat otp") ||
      msg.toLowerCase().includes("incorrect otp")
    ) {
      return lang === "hi"
        ? "गलत ओटीपी कोड दर्ज किया गया है। कृपया पुनः प्रयास करें।"
        : "Invalid OTP code entered. Please try again.";
    }

    if (
      msg.toLowerCase().includes("password") || 
      msg.includes("galat hai") ||
      msg.toLowerCase().includes("credentials")
    ) {
      return lang === "hi"
        ? "मोबाइल नंबर या पासवर्ड गलत है।"
        : "Incorrect mobile number or password.";
    }

    if (msg.toLowerCase().includes("expire")) {
      return lang === "hi"
        ? "यह ओटीपी समाप्त (expire) हो चुका है। कृपया नया ओटीपी प्राप्त करें।"
        : "This OTP has expired. Please request a new OTP.";
    }

    if (msg.toLowerCase().includes("block")) {
      return lang === "hi"
        ? "अधिक गलत प्रयासों के कारण यह ओटीपी ब्लॉक हो गया है। कृपया नया ओटीपी मंगवाएं।"
        : "This OTP is blocked due to excessive incorrect attempts. Please request a new OTP.";
    }

    return msg;
  };

  const getLocalizedSuccessMessage = (msg: string | null): string => {
    if (!msg) return "";
    if (msg.includes("satyapit") || msg.toLowerCase().includes("verified") || msg.toLowerCase().includes("dashboard")) {
      return lang === "hi"
        ? "ओटीपी सफलतापूर्वक सत्यापित हो गया! डैशबोर्ड खुल रहा है..."
        : "OTP verified successfully! Redirecting to Dashboard...";
    }
    if (msg.includes("dispatch") || msg.toLowerCase().includes("sent")) {
      const cleanMobile = mobile.replace(/\D/g, "");
      return lang === "hi"
        ? `ओटीपी सफलतापूर्वक +91 ${cleanMobile.slice(0, 5)}-XXXXX पर भेज दिया गया है।`
        : `OTP dispatched successfully to +91 ${cleanMobile.slice(0, 5)}-XXXXX.`;
    }
    return msg;
  };

  // --- SEND OTP HANDLER ---
  const handleSendOTP = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoOtp(null);

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }

    setOtpSending(true);

    // Step 1: Real SMS OTP via Firebase Phone Auth
    try {
      const verifier = getRecaptchaVerifier();
      if (verifier) {
        const fullPhone = `+91${cleanMobile}`;
        const confirmation = await signInWithPhoneNumber(auth, fullPhone, verifier);
        setConfirmationResult(confirmation);
        window.confirmationResult = confirmation;
        setIsFirebaseOTP(true);
        setOtpSent(true);
        setCountdown(60);
        setSuccessMsg(
          lang === "hi"
            ? `असली SMS OTP आपके मोबाइल +91 ${cleanMobile.slice(0, 5)}-XXXXX पर भेज दिया गया है!`
            : `Real SMS OTP sent to +91 ${cleanMobile.slice(0, 5)}-XXXXX via Firebase!`
        );
        setOtpSending(false);
        return;
      }
    } catch (fbErr: unknown) {
      console.warn("Firebase Phone Auth attempt error:", fbErr);
      // Clean up verifier on error so subsequent attempts get a fresh instance
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // ignore cleanup error
        }
        window.recaptchaVerifier = undefined;
      }
      setIsFirebaseOTP(false);
    }

    // Step 2: Fallback to SahayakAI Backend OTP Service
    try {
      const res = await sendOTP(cleanMobile);
      setOtpSent(true);
      setIsFirebaseOTP(false);
      setConfirmationResult(null);
      setDemoOtp(res.demo_otp || null);
      if (res.demo_otp) {
        setOtp(res.demo_otp); // Pre-fill for instant seamless testing
      }
      setCountdown(res.resend_available_in_seconds || 60);
      setSuccessMsg(res.message);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "OTP dispatch service encountered an error. Please retry.");
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
      setErrorMsg("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);
    const cleanMobile = mobile.replace(/\D/g, "");

    // Path A: Firebase Phone Auth Verification
    const activeConfirmation = confirmationResult || window.confirmationResult;
    if (isFirebaseOTP && activeConfirmation) {
      try {
        const userCredential = await activeConfirmation.confirm(otp.trim());
        const idToken = await userCredential.user.getIdToken();

        // Register/Login in SahayakAI Backend to issue official JWT
        const res = await firebaseLogin(cleanMobile, idToken);
        if (typeof window !== "undefined") {
          localStorage.setItem("sahayak_token", res.access_token);
          localStorage.setItem("sahayak_user_mobile", res.mobile);
          localStorage.setItem("sahayak_user_role", res.role);
        }
        setSuccessMsg(
          lang === "hi"
            ? "ओटीपी सफलतापूर्वक सत्यापित हो गया! डैशबोर्ड खुल रहा है..."
            : "OTP verified successfully via Firebase! Redirecting to Dashboard..."
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      } catch (fbErr: unknown) {
        console.warn("Firebase OTP confirmation error:", fbErr);
        const fbErrObj = fbErr as { code?: string; message?: string } | null;
        if (fbErrObj?.code === "auth/invalid-verification-code") {
          setErrorMsg(
            lang === "hi"
              ? "गलत ओटीपी कोड दर्ज किया गया है। कृपया पुनः प्रयास करें।"
              : "Invalid OTP code entered. Please try again."
          );
        } else if (fbErrObj?.code === "auth/code-expired") {
          setErrorMsg(
            lang === "hi"
              ? "यह ओटीपी समाप्त (expire) हो चुका है। कृपया नया ओटीपी प्राप्त करें।"
              : "This OTP has expired. Please request a new OTP."
          );
        } else {
          setErrorMsg(fbErrObj?.message || "Firebase OTP verification failed.");
        }
        setLoading(false);
        return;
      }
    }

    // Path B: Standard SahayakAI Backend OTP Verification
    try {
      const res = await verifyOTP(cleanMobile, otp.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_token", res.access_token);
        localStorage.setItem("sahayak_user_mobile", res.mobile);
        localStorage.setItem("sahayak_user_role", res.role);
      }
      setSuccessMsg("OTP verified successfully! Redirecting to Dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid OTP code. Please try again.");
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
    } catch (err: unknown) {
      console.warn("Password login error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Incorrect mobile number or password.");
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
            <span className="font-medium">{getLocalizedErrorMessage(errorMsg)}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{getLocalizedSuccessMessage(successMsg)}</span>
          </div>
        )}

        {/* Firebase Real SMS Dispatch Banner */}
        {authMode === "otp" && otpSent && isFirebaseOTP && (
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{lang === "hi" ? "Firebase Live SMS भेजा गया:" : "Firebase Live SMS Dispatched:"}</span>
            </div>
            <p className="text-[11px] text-blue-700 font-medium">
              {lang === "hi" 
                ? "आपके मोबाइल नंबर पर असली 6-अंकों का SMS OTP भेज दिया गया है। कृपया इनबॉक्स चेक करें।" 
                : "Real 6-digit SMS OTP delivered to your phone. Please check your SMS inbox."}
            </p>
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
              {lang === "hi" 
                ? "5 मिनट के लिए मान्य • त्वरित मूल्यांकन हेतु स्वतः भरा गया।" 
                : "Valid for 5 mins • Auto-filled for instant evaluation."}
            </p>
          </div>
        )}

        {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

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
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder={t.auth.mobilePlaceholder || "e.g. 9876543210"}
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
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.auth.mobilePlaceholder || "e.g. 9876543210"}
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
