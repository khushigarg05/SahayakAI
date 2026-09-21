"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, User, MapPin, Briefcase, FileText, HelpCircle, Video, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HelpTooltip = ({ message }: { message: string }) => (
  <div className="group relative inline-flex items-center ml-2">
    <button type="button" className="text-blue-600 hover:text-blue-700 transition-colors bg-blue-100 p-1 rounded-full border border-blue-200">
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-50 w-56 p-3 mt-2 -ml-28 text-xs text-slate-800 bg-white rounded-xl shadow-xl border border-slate-200 transition-all duration-200">
      <div className="absolute -top-1.5 left-1/2 -mt-1 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45 -ml-1.5"></div>
      {message}
    </div>
  </div>
);

// Zod Schema for Validation
const formSchema = z.object({
  age: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  location: z.string().min(2, "Required"),
  distanceToCSC: z.string().min(1, "Required"),
  income: z.string().min(1, "Required"),
  bplStatus: z.string().min(1, "Required"),
  education: z.string().min(1, "Required"),
  digitalLiteracy: z.number().min(1).max(10),
  hasAadhaar: z.boolean(),
  hasPanCard: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const CONTENT = {
  en: {
    header: "Smart Profile Creation",
    desc: "We need a few details to accurately predict your scheme eligibility.",
    back: "Back",
    next: "Next",
    submit: "Check Eligibility",
    steps: [
      { id: "personal", title: "Personal Details", icon: User },
      { id: "location", title: "Location & Access", icon: MapPin },
      { id: "economic", title: "Economic Profile", icon: Briefcase },
      { id: "documents", title: "Documents & Skills", icon: FileText },
    ],
    fields: {
      age: "Age",
      agePlaceholder: "e.g. 35",
      gender: "Gender",
      genderSelect: "Select Gender",
      male: "Male", female: "Female", other: "Other",
      location: "State / District",
      locationTip: "Type your current residing state and district.",
      locPlaceholder: "e.g. Maharashtra, Pune",
      dist: "Distance to nearest CSC/Tehsil",
      distSelect: "Select Distance",
      d1: "Less than 5 km", d2: "5 - 15 km", d3: "More than 15 km",
      income: "Annual Household Income (₹)",
      incPlaceholder: "e.g. 150000",
      bpl: "BPL Status",
      bplTip: "Find your BPL Ration Card number on your ration card.",
      bplSelect: "Are you Below Poverty Line?",
      yes: "Yes", no: "No",
      edu: "Highest Education",
      eduSelect: "Select Education",
      e1: "No Formal Education", e2: "Primary", e3: "Secondary (10th/12th)", e4: "Graduate and above",
      digi: "Digital Literacy Score",
      digiTip: "Rate from 1 (Need Help) to 10 (Independent User)",
      dHelp: "Need Help", dIndep: "Independent User",
      docs: "Documents Available",
      aadhaar: "Aadhaar Card",
      pan: "PAN Card"
    }
  },
  hi: {
    header: "स्मार्ट प्रोफाइल बनाएं",
    desc: "हमें आपकी कुछ जानकारी चाहिए ताकि हम आपको सही योजनाएं बता सकें।",
    back: "पीछे जाएं",
    next: "आगे बढ़ें",
    submit: "योग्यता जांचें",
    steps: [
      { id: "personal", title: "व्यक्तिगत जानकारी", icon: User },
      { id: "location", title: "पता और पहुंच", icon: MapPin },
      { id: "economic", title: "आर्थिक स्थिति", icon: Briefcase },
      { id: "documents", title: "दस्तावेज़", icon: FileText },
    ],
    fields: {
      age: "आयु (Age)",
      agePlaceholder: "उदा. 35",
      gender: "लिंग (Gender)",
      genderSelect: "लिंग चुनें",
      male: "पुरुष", female: "महिला", other: "अन्य",
      location: "राज्य / जिला",
      locationTip: "अपना वर्तमान राज्य और जिला लिखें।",
      locPlaceholder: "उदा. Maharashtra, Pune",
      dist: "निकटतम CSC/तहसील की दूरी",
      distSelect: "दूरी चुनें",
      d1: "5 किमी से कम", d2: "5 - 15 किमी", d3: "15 किमी से अधिक",
      income: "वार्षिक घरेलू आय (₹)",
      incPlaceholder: "उदा. 150000",
      bpl: "BPL स्थिति (राशन कार्ड)",
      bplTip: "अपना BPL राशन कार्ड नंबर अपने राशन कार्ड पर खोजें।",
      bplSelect: "क्या आप गरीबी रेखा से नीचे हैं?",
      yes: "हाँ", no: "नहीं",
      edu: "उच्चतम शिक्षा",
      eduSelect: "शिक्षा चुनें",
      e1: "कोई औपचारिक शिक्षा नहीं", e2: "प्राथमिक", e3: "माध्यमिक (10वीं/12वीं)", e4: "स्नातक (Graduate)",
      digi: "डिजिटल साक्षरता स्कोर",
      digiTip: "1 (मदद चाहिए) से 10 (स्वतंत्र उपयोगकर्ता) तक रेट करें",
      dHelp: "मदद चाहिए", dIndep: "स्वतंत्र",
      docs: "उपलब्ध दस्तावेज़",
      aadhaar: "आधार कार्ड",
      pan: "पैन कार्ड"
    }
  },
  mr: {
    header: "स्मार्ट प्रोफाईल तयार करा",
    desc: "आम्हाला तुमची काही माहिती हवी आहे जेणेकरून आम्ही तुम्हाला योग्य योजना सांगू शकू.",
    back: "मागे",
    next: "पुढे जा",
    submit: "पात्रता तपासा",
    steps: [
      { id: "personal", title: "वैयक्तिक माहिती", icon: User },
      { id: "location", title: "पत्ता आणि प्रवेश", icon: MapPin },
      { id: "economic", title: "आर्थिक स्थिती", icon: Briefcase },
      { id: "documents", title: "कागदपत्रे", icon: FileText },
    ],
    fields: {
      age: "वय (Age)",
      agePlaceholder: "उदा. 35",
      gender: "लिंग (Gender)",
      genderSelect: "लिंग निवडा",
      male: "पुरुष", female: "स्त्री", other: "इतर",
      location: "राज्य / जिल्हा",
      locationTip: "तुमचे सध्याचे राज्य आणि जिल्हा लिहा.",
      locPlaceholder: "उदा. Maharashtra, Pune",
      dist: "जवळच्या CSC ची अंतर",
      distSelect: "अंतर निवडा",
      d1: "5 किमी पेक्षा कमी", d2: "5 - 15 किमी", d3: "15 किमी पेक्षा जास्त",
      income: "वार्षिक उत्पन्न (₹)",
      incPlaceholder: "उदा. 150000",
      bpl: "BPL स्थिती",
      bplTip: "तुमचा BPL रेशन कार्ड नंबर तुमच्या रेशन कार्डवर शोधा.",
      bplSelect: "तुम्ही दारिद्र्यरेषेखालील आहात का?",
      yes: "होय", no: "नाही",
      edu: "शिक्षण",
      eduSelect: "शिक्षण निवडा",
      e1: "औपचारिक शिक्षण नाही", e2: "प्राथमिक", e3: "माध्यमिक", e4: "पदवीधर",
      digi: "डिजिटल साक्षरता",
      digiTip: "1 (मदत हवी) ते 10 (स्वतंत्र) रेट करा",
      dHelp: "मदत हवी", dIndep: "स्वतंत्र",
      docs: "कागदपत्रे",
      aadhaar: "आधार कार्ड",
      pan: "पैन कार्ड"
    }
  },
  bn: {
    header: "স্মার্ট প্রোফাইল তৈরি",
    desc: "আপনার সঠিক স্কিমগুলি জানাতে আমাদের কিছু তথ্য প্রয়োজন।",
    back: "পেছনে",
    next: "এগিয়ে যান",
    submit: "যোগ্যতা চেক করুন",
    steps: [
      { id: "personal", title: "ব্যক্তিগত তথ্য", icon: User },
      { id: "location", title: "ঠিকানা", icon: MapPin },
      { id: "economic", title: "অর্থনৈতিক প্রোফাইল", icon: Briefcase },
      { id: "documents", title: "নথিপত্র", icon: FileText },
    ],
    fields: {
      age: "বয়স",
      agePlaceholder: "উদা. 35",
      gender: "লিঙ্গ",
      genderSelect: "লিঙ্গ নির্বাচন করুন",
      male: "পুরুষ", female: "মহিলা", other: "অন্যান্য",
      location: "রাজ্য / জেলা",
      locationTip: "আপনার বর্তমান রাজ্য এবং জেলা লিখুন।",
      locPlaceholder: "উদা. West Bengal, Kolkata",
      dist: "নিকটতম CSC এর দূরত্ব",
      distSelect: "দূরত্ব নির্বাচন করুন",
      d1: "5 কিমি এর কম", d2: "5 - 15 কিমি", d3: "15 কিমি এর বেশি",
      income: "বার্ষিক আয় (₹)",
      incPlaceholder: "উদা. 150000",
      bpl: "BPL অবস্থা",
      bplTip: "আপনার রেশন কার্ডে BPL কার্ড নম্বর খুঁজুন।",
      bplSelect: "আপনি কি দারিদ্র্য সীমার নিচে?",
      yes: "হ্যাঁ", no: "না",
      edu: "শিক্ষা",
      eduSelect: "শিক্ষা নির্বাচন করুন",
      e1: "কোন আনুষ্ঠানিক শিক্ষা নেই", e2: "প্রাথমিক", e3: "মাধ্যমিক", e4: "স্নাতক",
      digi: "ডিজিটাল সাক্ষরতা",
      digiTip: "1 (সাহায্য প্রয়োজন) থেকে 10 (স্বাধীন)",
      dHelp: "সাহায্য প্রয়োজন", dIndep: "স্বাধীন",
      docs: "উপলব্ধ নথিপত্র",
      aadhaar: "আধার কার্ড",
      pan: "প্যান কার্ড"
    }
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [langCode, setLangCode] = useState<string>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("sahayak_lang");
    if (savedLang && (CONTENT as any)[savedLang]) {
      setLangCode(savedLang);
    }
  }, []);

  const t = (CONTENT as any)[langCode] || CONTENT.en;
  const STEPS = t.steps;

  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      digitalLiteracy: 5,
      hasAadhaar: false,
      hasPanCard: false,
    }
  });

  const processData = (data: FormValues) => {
    const profileData = {
        age: parseInt(data.age) || 30,
        income: parseInt(data.income) || 0,
        distance_to_csc: data.distanceToCSC === "<5km" ? 2 : data.distanceToCSC === "5-15km" ? 10 : 20,
        documents_missing: (!data.hasAadhaar ? 1 : 0) + (!data.hasPanCard ? 1 : 0),
        literacy_level: data.education === "none" ? 0 : data.education === "primary" ? 1 : data.education === "secondary" ? 2 : 3,
        has_internet: data.digitalLiteracy > 3 ? 1 : 0,
        caste_category: "General", 
        location_type: data.location.toLowerCase().includes("rural") ? "Rural" : "Urban"
    };
    
    if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_profile", JSON.stringify(profileData));
    }
    
    router.push("/dashboard");
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid && currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0: return ["age", "gender"];
      case 1: return ["location", "distanceToCSC"];
      case 2: return ["income", "bplStatus", "education"];
      case 3: return ["digitalLiteracy", "hasAadhaar", "hasPanCard"];
      default: return [];
    }
  };

  const slideVariants: any = {
    hidden: (direction: number) => ({ x: direction > 0 ? '10%' : '-10%', opacity: 0 }),
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (direction: number) => ({ x: direction < 0 ? '10%' : '-10%', opacity: 0, transition: { duration: 0.2 } })
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
      
      {/* Light Colorful Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-indigo-400/30 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cyan-400/30 via-emerald-400/30 to-blue-400/30 blur-[120px] animate-pulse duration-[10000ms] delay-1000" />
      </div>

      <header className="relative z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Sahayak<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">AI</span>
            </span>
          </Link>
          {currentStep > 0 && (
            <button type="button" onClick={prevStep} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 hover:bg-slate-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </button>
          )}
        </div>
      </header>

      <div className="container max-w-3xl px-4 md:px-6 mx-auto flex-1 flex flex-col py-10 relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">{t.header}</h1>
          <p className="text-slate-600 max-w-lg mx-auto font-medium">{t.desc}</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-purple-100 -translate-y-1/2 rounded-full z-0" />
          <div className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
          <div className="relative z-10 flex justify-between">
            {STEPS.map((step: any, idx: number) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-lg ${idx <= currentStep ? "bg-white border-purple-500 text-purple-600 shadow-purple-500/30" : "bg-white border-slate-200 text-slate-400 shadow-sm"}`}>
                    {idx < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-3 font-bold text-center max-w-[80px] leading-tight transition-colors ${idx <= currentStep ? "text-slate-800" : "text-slate-500"}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 bg-white/80 border border-white/50 rounded-[32px] p-6 md:p-10 backdrop-blur-xl shadow-2xl relative ring-1 ring-slate-900/5">
          <form onSubmit={handleSubmit(processData)} className="flex flex-col min-h-[350px]">
            
            <div className="flex-1">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div key={currentStep} custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                  
                  {/* STEP 1: Personal */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-8 text-slate-800">{STEPS[0].title}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">{t.fields.age}</label>
                          <input type="number" {...register("age")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400" placeholder={t.fields.agePlaceholder} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">{t.fields.gender}</label>
                          <select {...register("gender")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer">
                            <option value="">{t.fields.genderSelect}</option>
                            <option value="male">{t.fields.male}</option>
                            <option value="female">{t.fields.female}</option>
                            <option value="other">{t.fields.other}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Location */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-8 text-slate-800">{STEPS[1].title}</h2>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center">
                            {t.fields.location} <HelpTooltip message={t.fields.locationTip} />
                          </label>
                          <input type="text" {...register("location")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400" placeholder={t.fields.locPlaceholder} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">{t.fields.dist}</label>
                          <select {...register("distanceToCSC")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer">
                            <option value="">{t.fields.distSelect}</option>
                            <option value="<5km">{t.fields.d1}</option>
                            <option value="5-15km">{t.fields.d2}</option>
                            <option value=">15km">{t.fields.d3}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Economic */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-8 text-slate-800">{STEPS[2].title}</h2>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t.fields.income}</label>
                            <input type="number" {...register("income")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400" placeholder={t.fields.incPlaceholder} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                              {t.fields.bpl} <HelpTooltip message={t.fields.bplTip} />
                            </label>
                            <select {...register("bplStatus")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer">
                              <option value="">{t.fields.bplSelect}</option>
                              <option value="yes">{t.fields.yes}</option>
                              <option value="no">{t.fields.no}</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">{t.fields.edu}</label>
                          <select {...register("education")} className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer">
                            <option value="">{t.fields.eduSelect}</option>
                            <option value="none">{t.fields.e1}</option>
                            <option value="primary">{t.fields.e2}</option>
                            <option value="secondary">{t.fields.e3}</option>
                            <option value="graduate">{t.fields.e4}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Documents */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-8 text-slate-800">{STEPS[3].title}</h2>
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-sm font-semibold text-slate-700 flex justify-between">
                            <span className="flex items-center">
                              {t.fields.digi} <HelpTooltip message={t.fields.digiTip} />
                            </span>
                            <span className="text-blue-700 font-bold bg-blue-100 px-3 py-1 rounded-full">{watch("digitalLiteracy")}/10</span>
                          </label>
                          <input type="range" min="1" max="10" {...register("digitalLiteracy", { valueAsNumber: true })} className="w-full accent-blue-600 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                          <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <span>{t.fields.dHelp}</span>
                            <span>{t.fields.dIndep}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                          <h3 className="text-sm font-semibold text-slate-700">{t.fields.docs}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              <input type="checkbox" {...register("hasAadhaar")} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm font-bold text-slate-700">{t.fields.aadhaar}</span>
                            </label>
                            <label className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              <input type="checkbox" {...register("hasPanCard")} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm font-bold text-slate-700">{t.fields.pan}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-8 mt-8 flex justify-end border-t border-slate-100 w-full relative z-10">
              {currentStep < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 h-12 px-8 w-full md:w-auto hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                  {t.next}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 h-12 px-8 w-full md:w-auto hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                  {t.submit}
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
