"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Wallet, 
  FileCheck2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  CreditCard,
  FileText,
  BadgeCheck,
  Smartphone,
  Check,
  Sparkles
} from "lucide-react";
import { matchSchemes, assessRisk } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const formSchema = z.object({
  age: z.number().min(18, "Age must be at least 18").max(100, "Please enter a valid age"),
  gender: z.string().min(1, "Please select gender"),
  caste_category: z.string().min(1, "Please select category"),
  annual_income: z.number().min(0, "Income cannot be negative"),
  bpl_status: z.string().min(1, "Please select BPL status"),
  state: z.string().min(2, "Please enter state"),
  district: z.string().min(2, "Please enter district"),
  distance_to_csc_km: z.number().min(0.1, "Please enter valid distance"),
  digital_literacy: z.enum(["Low", "Medium", "High"]),
  has_income_certificate: z.boolean(),
  bank_account_aadhaar_linked: z.boolean(),
  has_caste_certificate: z.boolean(),
  has_bpl_ration_card: z.boolean(),
  prior_rejections_count: z.number().min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 45,
      gender: "Male",
      caste_category: "OBC",
      annual_income: 60000,
      bpl_status: "yes",
      state: "Uttar Pradesh",
      district: "Varanasi",
      distance_to_csc_km: 12.5,
      digital_literacy: "Low",
      has_income_certificate: true,
      bank_account_aadhaar_linked: true,
      has_caste_certificate: true,
      has_bpl_ration_card: true,
      prior_rejections_count: 0,
    },
  });

  const watchedIncome = watch("annual_income");
  const watchedDistance = watch("distance_to_csc_km");
  const watchedDigital = watch("digital_literacy");
  const watchedBank = watch("bank_account_aadhaar_linked");
  const watchedIncomeCert = watch("has_income_certificate");
  const watchedBplCard = watch("has_bpl_ration_card");
  const watchedCasteCert = watch("has_caste_certificate");

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) fieldsToValidate = ["age", "gender", "caste_category"];
    if (step === 2) fieldsToValidate = ["annual_income", "bpl_status", "state", "district", "distance_to_csc_km"];

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const isBpl = data.bpl_status === "yes";

      // 1. Match Schemes against central gazettes
      const matchPayload = {
        age: data.age,
        annual_income: data.annual_income,
        bpl_status: isBpl,
        gender: data.gender,
        caste_category: data.caste_category,
        state: data.state,
        district: data.district,
      };

      const matchResponse = await matchSchemes(matchPayload);
      const targetSchemeId = matchResponse.schemes.length > 0 ? matchResponse.schemes[0].scheme_id : 1;

      // 2. Assess Access Risk using XGBoost & SHAP
      const riskPayload = {
        scheme_id: targetSchemeId,
        age: data.age,
        annual_income: data.annual_income,
        bpl_status: isBpl,
        gender: data.gender,
        caste_category: data.caste_category,
        distance_to_csc_km: data.distance_to_csc_km,
        digital_literacy: data.digital_literacy,
        has_income_certificate: data.has_income_certificate,
        bank_account_aadhaar_linked: data.bank_account_aadhaar_linked,
        has_caste_certificate: data.has_caste_certificate,
        prior_rejections_count: data.prior_rejections_count,
      };

      const riskResponse = await assessRisk(riskPayload);

      if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_citizen_profile", JSON.stringify(data));
        localStorage.setItem("sahayak_scheme_matches", JSON.stringify(matchResponse));
        localStorage.setItem("sahayak_risk_assessment", JSON.stringify(riskResponse));
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Backend assessment failed:", err);
      setErrorMsg(
        lang === "hi"
          ? "बैकएंड सर्वर से कनेक्ट करने में समस्या हुई। कृपया सुनिश्चित करें कि FastAPI बैकएंड (localhost:8000) चालू है।"
          : "Could not reach FastAPI backend. Please ensure the server is running on http://127.0.0.1:8000"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* HEADER TITLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                {t.form.headerTag}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {t.form.headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                {t.form.headerDesc}
              </p>
            </div>

            {/* Step Progress Percentage */}
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex-shrink-0 self-start sm:self-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-800 text-white font-mono font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                {step === 1 ? "33%" : step === 2 ? "66%" : "100%"}
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Step {step}/3</div>
                <div className="text-xs font-bold text-slate-800">
                  {step === 1 ? t.form.step1 : step === 2 ? t.form.step2 : t.form.step3}
                </div>
              </div>
            </div>
          </div>

          {/* STEPPER PROGRESS TABS */}
          <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { num: 1, title: t.form.step1, icon: User },
              { num: 2, title: t.form.step2, icon: Wallet },
              { num: 3, title: t.form.step3, icon: FileCheck2 },
            ].map((s) => {
              const Icon = s.icon;
              const isDone = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div
                  key={s.num}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center space-x-2 sm:space-x-2.5 transition-all duration-200 ${
                    isCurrent
                      ? "bg-blue-800 text-white border-blue-800 shadow-xs"
                      : isDone
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0 ${
                      isCurrent ? "bg-white text-blue-800" : isDone ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold truncate">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Notice</p>
              <p className="mt-0.5 font-medium">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            
            {/* ================= STEP 1: PERSONAL DETAILS ================= */}
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-700" />
                    <span>{t.form.step1}</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">1 / 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.ageLabel}
                    </label>
                    <input
                      type="number"
                      {...register("age", { valueAsNumber: true })}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder={t.form.agePlaceholder}
                    />
                    <p className="text-[11px] text-slate-500">{t.form.ageTip}</p>
                    {errors.age && <p className="text-xs text-red-600 font-semibold">{errors.age.message}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.genderLabel}
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Male">{t.form.genderMale}</option>
                      <option value="Female">{t.form.genderFemale}</option>
                      <option value="Other">{t.form.genderOther}</option>
                    </select>
                  </div>

                  {/* Caste Category */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.casteLabel}
                    </label>
                    <select
                      {...register("caste_category")}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      <option value="General">{t.form.casteGeneral}</option>
                      <option value="OBC">{t.form.casteObc}</option>
                      <option value="SC">{t.form.casteSc}</option>
                      <option value="ST">{t.form.casteSt}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: SOCIO-ECONOMIC ================= */}
            {step === 2 && (
              <div className="space-y-5 sm:space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-700" />
                    <span>{t.form.step2}</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">2 / 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Annual Income */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {t.form.incomeLabel}
                      </label>
                      {watchedIncome <= 120000 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {t.form.bplEligibleBadge}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      {...register("annual_income", { valueAsNumber: true })}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder={t.form.incomePlaceholder}
                    />
                  </div>

                  {/* BPL Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.bplLabel}
                    </label>
                    <select
                      {...register("bpl_status")}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      <option value="yes">{t.form.bplYes}</option>
                      <option value="no">{t.form.bplNo}</option>
                    </select>
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.stateLabel}
                    </label>
                    <input
                      type="text"
                      {...register("state")}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder={t.form.statePlaceholder}
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.form.districtLabel}
                    </label>
                    <input
                      type="text"
                      {...register("district")}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder={t.form.districtPlaceholder}
                    />
                  </div>

                  {/* Distance to CSC Kiosk */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {t.form.distanceLabel}
                      </label>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        ~{Math.round(watchedDistance * 2.5)} mins {t.form.travelEstimate}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      {...register("distance_to_csc_km", { valueAsNumber: true })}
                      className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder={t.form.distancePlaceholder}
                    />
                    <p className="text-[11px] text-slate-500">{t.form.distanceTip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: DOCUMENTS & DIGITAL ================= */}
            {step === 3 && (
              <div className="space-y-5 sm:space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <FileCheck2 className="w-5 h-5 text-blue-700" />
                    <span>{t.form.step3}</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">3 / 3</span>
                </div>

                {/* Digital Literacy Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.form.digitalLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { val: "Low", label: t.form.digitalLow, desc: t.form.digitalLowDesc, icon: User },
                      { val: "Medium", label: t.form.digitalMedium, desc: t.form.digitalMediumDesc, icon: Smartphone },
                      { val: "High", label: t.form.digitalHigh, desc: t.form.digitalHighDesc, icon: Sparkles },
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => setValue("digital_literacy", d.val as any)}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          watchedDigital === d.val
                            ? "border-blue-700 bg-blue-50/60 ring-2 ring-blue-700/20 shadow-2xs"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${watchedDigital === d.val ? "text-blue-800" : "text-slate-800"}`}>
                            {d.label}
                          </span>
                          {watchedDigital === d.val && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{d.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Document Checklist Cards */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.form.docsTitle}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Bank Account */}
                    <div
                      onClick={() => setValue("bank_account_aadhaar_linked", !watchedBank)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        watchedBank ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className={`w-5 h-5 ${watchedBank ? "text-emerald-700" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.form.docBank}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.form.docBankSub}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded ${watchedBank ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>
                        {watchedBank ? t.form.docAvailable : t.form.docMissing}
                      </span>
                    </div>

                    {/* Income Certificate */}
                    <div
                      onClick={() => setValue("has_income_certificate", !watchedIncomeCert)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        watchedIncomeCert ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className={`w-5 h-5 ${watchedIncomeCert ? "text-emerald-700" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.form.docIncome}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.form.docIncomeSub}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded ${watchedIncomeCert ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>
                        {watchedIncomeCert ? t.form.docAvailable : t.form.docMissing}
                      </span>
                    </div>

                    {/* BPL Ration Card */}
                    <div
                      onClick={() => setValue("has_bpl_ration_card", !watchedBplCard)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        watchedBplCard ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <BadgeCheck className={`w-5 h-5 ${watchedBplCard ? "text-emerald-700" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.form.docBpl}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.form.docBplSub}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded ${watchedBplCard ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>
                        {watchedBplCard ? t.form.docAvailable : t.form.docMissing}
                      </span>
                    </div>

                    {/* Caste Certificate */}
                    <div
                      onClick={() => setValue("has_caste_certificate", !watchedCasteCert)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        watchedCasteCert ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileCheck2 className={`w-5 h-5 ${watchedCasteCert ? "text-emerald-700" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.form.docCaste}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.form.docCasteSub}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded ${watchedCasteCert ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>
                        {watchedCasteCert ? t.form.docAvailable : t.form.docMissing}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Prior Rejections */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.form.priorLabel}
                  </label>
                  <select
                    {...register("prior_rejections_count", { valueAsNumber: true })}
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                  >
                    <option value="0">{t.form.prior0}</option>
                    <option value="1">{t.form.prior1}</option>
                    <option value="2">{t.form.prior2}</option>
                    <option value="3">{t.form.prior3}</option>
                  </select>
                </div>

              </div>
            )}

            {/* ================= BUTTONS NAVIGATION ================= */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.form.btnBack}</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <span>{t.form.btnNext}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-700/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.form.btnLoading}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{t.form.btnSubmit}</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>

        {/* COMPLIANCE FOOTER */}
        <div className="text-center text-xs text-slate-500 font-medium flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>{t.form.compliance}</span>
        </div>

      </div>
    </div>
  );
}
