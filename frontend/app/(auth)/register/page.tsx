"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  UserPlus, 
  Phone, 
  Lock, 
  User, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import { registerUser } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic Language Translation Helper for Errors
  const getLocalizedErrorMessage = (msg: string | null): string => {
    if (!msg) return "";
    const lower = msg.toLowerCase();

    // Already registered / duplicate mobile
    if (lower.includes("already registered") || lower.includes("pehle se registered") || lower.includes("already exists")) {
      const mobileMatch = msg.match(/\d{10}/);
      const num = mobileMatch ? mobileMatch[0] : (mobile || "");
      return lang === "hi"
        ? `मोबाइल नंबर ${num ? num + " " : ""}पहले से पंजीकृत है। कृपया लॉगिन करें।`
        : `Mobile number ${num ? num + " " : ""}is already registered. Please log in.`;
    }

    // Duplicate email
    if (lower.includes("email") && (lower.includes("already") || lower.includes("pehle se"))) {
      return lang === "hi"
        ? "यह ईमेल आईडी पहले से पंजीकृत है।"
        : "This email address is already registered.";
    }

    // Weak password
    if (lower.includes("weak password") || lower.includes("password kamzor") || lower.includes("minimum 8")) {
      return lang === "hi"
        ? "पासवर्ड कमजोर है: कम से कम 8 अक्षर, बड़ा अक्षर, छोटा अक्षर, संख्या और विशेष चिन्ह अनिवार्य हैं।"
        : "Weak password: Must be at least 8 characters with uppercase, lowercase, number, and special symbol.";
    }

    // Password mismatch
    if (lower.includes("match") || lower.includes("mismatch")) {
      return lang === "hi"
        ? "पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।"
        : "Passwords do not match. Please verify both fields.";
    }

    // Invalid mobile
    if (lower.includes("invalid mobile") || lower.includes("10-digit") || lower.includes("amanaya")) {
      return lang === "hi"
        ? "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।"
        : "Please enter a valid 10-digit Indian Mobile Number.";
    }

    // Deactivated account
    if (lower.includes("deactivate") || lower.includes("inactive")) {
      return lang === "hi"
        ? "आपका खाता निष्क्रिय है। कृपया सहायता केंद्र से संपर्क करें।"
        : "Your account is deactivated. Please contact support.";
    }

    return msg;
  };

  const getLocalizedSuccessMessage = (msg: string | null): string => {
    if (!msg) return "";
    if (msg.toLowerCase().includes("safalta") || msg.toLowerCase().includes("success") || msg.toLowerCase().includes("ban gaya")) {
      return lang === "hi"
        ? "खाता सफलतापूर्वक बन गया है! लॉगिन पृष्ठ पर भेजा जा रहा है..."
        : "Account created successfully! Redirecting to login...";
    }
    return msg;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setErrorMsg(
        lang === "hi"
          ? "पासवर्ड कमजोर है: कम से कम 8 अक्षर होने चाहिए।"
          : "Weak password: Must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mobile: mobile.replace(/\D/g, ""),
        password,
        confirm_password: confirmPassword,
        full_name: fullName,
        role: "citizen",
      };

      const res = await registerUser(payload);
      setSuccessMsg(typeof res.message === "string" ? res.message : String(t.auth.accountCreated || "Account created successfully"));
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setErrorMsg(
        (err instanceof Error ? err.message : null) || (
          lang === "hi"
            ? "पंजीकरण विफल रहा। कृपया दर्ज की गई जानकारी जांचें।"
            : "Registration failed. Please verify your details."
        )
      );
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
            <UserPlus className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.auth.registerTitle}</h1>
          <p className="text-xs text-slate-500 font-medium">
            {t.auth.registerSub}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-medium">{getLocalizedErrorMessage(errorMsg)}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{getLocalizedSuccessMessage(successMsg)}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.auth.nameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.auth.confirmPasswordLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.auth.confirmPasswordPlaceholder}
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
                <span>{t.auth.registering}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.auth.btnRegister}</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-bold text-blue-800 hover:underline">
              {t.auth.linkLogin}
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center space-x-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.auth.securityStandard}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
