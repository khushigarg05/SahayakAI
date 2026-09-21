"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, MapPin, FileText, ChevronDown, Globe, Sparkles, Share2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Interactive Counter Component
function Counter({ end, suffix = "", title }: { end: number; suffix?: string; title: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 hover:-translate-y-2 transition-all duration-300">
      <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 mb-2 drop-shadow-sm">
        {count}
        {suffix}
      </div>
      <div className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest text-center">{title}</div>
    </div>
  );
}

const LANGUAGES = [
  { code: "hi", label: "हिन्दी (Hindi)", native: "हिन्दी" },
  { code: "en", label: "English", native: "English" },
  { code: "mr", label: "मराठी (Marathi)", native: "मराठी" },
  { code: "bn", label: "বাংলা (Bengali)", native: "বাংলা" },
];

const CONTENT = {
  en: {
    tag: "Next-Gen Citizen Portal",
    title: "SahayakAI: Your Digital Companion",
    titleHighlight: "Digital Companion",
    desc: "Availing government schemes is now effortless. Discover eligible schemes, analyze application risks, and prepare documents instantly with AI.",
    btn1: "Start Free Assessment",
    btn2: "Explore Schemes",
    quote: "Empowering every citizen with the right information at the right time. Your progress is the nation's progress.",
    quoteAuthor: "SahayakAI Vision",
    counters: ["Government Schemes", "Citizens Assisted", "AI Availability"],
    videoTitle: "How to use SahayakAI?",
    videoSub: "Watch this short 1-minute clip to understand how our AI can help you get your benefits without getting rejected.",
    featTitle: "Why Choose SahayakAI?",
    featSub: "Experience the power of artificial intelligence designed specifically to bridge the gap between citizens and government benefits.",
    features: [
      {
        title: "Risk Analysis (Rejection Check)",
        desc: "What is Risk? It means the chances of your form getting rejected. Our AI scans your profile and warns you beforehand about missing documents or eligibility issues so you don't fail.",
      },
      {
        title: "Smart Eligibility",
        desc: "Matches your profile with 100+ schemes instantly with pinpoint accuracy.",
      },
      {
        title: "Document AI",
        desc: "Scans and tells you exactly which documents are missing for a specific scheme.",
      },
      {
        title: "Local Connect",
        desc: "Finds the nearest verified CSC centers for physical assistance.",
      }
    ]
  },
  hi: {
    tag: "नेक्स्ट जनरेशन AI पोर्टल",
    title: "SahayakAI: आपका डिजिटल साथी",
    titleHighlight: "डिजिटल साथी",
    desc: "सरकारी योजनाओं का लाभ उठाना अब बिल्कुल आसान है। अपने लिए सही योजनाएं खोजें, फॉर्म रिजेक्ट होने का रिस्क चेक करें, और AI की मदद से तुरंत दस्तावेज़ तैयार करें।",
    btn1: "अभी मुफ्त जांच शुरू करें",
    btn2: "योजनाएं एक्सप्लोर करें",
    quote: "सही समय पर सही जानकारी के साथ हर नागरिक को सशक्त बनाना। आपकी प्रगति ही देश की प्रगति है।",
    quoteAuthor: "SahayakAI विज़न",
    counters: ["सरकारी योजनाएं", "लाभान्वित नागरिक", "AI उपलब्धता"],
    videoTitle: "SahayakAI का उपयोग कैसे करें?",
    videoSub: "यह 1 मिनट का छोटा क्लिप देखें और समझें कि हमारा AI बिना रिजेक्ट हुए आपको लाभ दिलाने में कैसे मदद कर सकता है।",
    featTitle: "SahayakAI क्यों चुनें?",
    featSub: "नागरिकों और सरकारी लाभों के बीच की दूरी को मिटाने के लिए विशेष रूप से डिज़ाइन की गई आर्टिफिशियल इंटेलिजेंस की ताकत का अनुभव करें।",
    features: [
      {
        title: "रिजेक्शन रिस्क चेक (Rejection Risk)",
        desc: "रिस्क क्या है? इसका मतलब है आपके फॉर्म के रिजेक्ट होने की संभावना। हमारा AI आपके प्रोफाइल को स्कैन करता है और फॉर्म रिजेक्ट होने से बचाने के लिए आपको पहले ही सावधान कर देता है।",
      },
      {
        title: "स्मार्ट एलिजिबिलिटी (Eligibility)",
        desc: "आपकी जानकारी को तुरंत 100+ योजनाओं के साथ बिल्कुल सटीकता से मैच करता है।",
      },
      {
        title: "डॉक्यूमेंट AI (Document AI)",
        desc: "स्कैन करके आपको बिल्कुल सही बताता है कि किसी योजना के लिए कौन से दस्तावेज़ गायब हैं।",
      },
      {
        title: "लोकल कनेक्ट (Local Connect)",
        desc: "यदि आपको मदद चाहिए तो आपके निकटतम CSC सेंटर को खोज कर आपको बताता है।",
      }
    ]
  },
  mr: {
    tag: "नेक्स्ट जनरेशन AI पोर्टल",
    title: "SahayakAI: तुमचा डिजिटल सोबती",
    titleHighlight: "डिजिटल सोबती",
    desc: "सरकारी योजनांचा लाभ घेणे आता सोपे झाले आहे. AI च्या मदतीने पात्र योजना शोधा, अर्जातील धोके तपासा आणि कागदपत्रे लगेच तयार करा.",
    btn1: "मोफत तपासणी सुरू करा",
    btn2: "योजना एक्सप्लोर करा",
    quote: "योग्य वेळी योग्य माहिती देऊन प्रत्येक नागरिकाला सक्षम करणे. तुमची प्रगती हीच देशाची प्रगती.",
    quoteAuthor: "SahayakAI Vision",
    counters: ["सरकारी योजना", "मदत केलेले नागरिक", "AI उपलब्धता"],
    videoTitle: "SahayakAI कसे वापरावे?",
    videoSub: "आमचा AI तुम्हाला नाकारले न जाता तुमचे फायदे मिळवण्यात कशी मदत करू शकतो हे समजून घेण्यासाठी हा 1-मिनिटाचा छोटा व्हिडिओ पहा.",
    featTitle: "SahayakAI का निवडावे?",
    featSub: "नागरिक आणि सरकारी फायदे यांमधील दरी कमी करण्यासाठी डिझाइन केलेल्या आर्टिफिशियल इंटेलिजन्सचा अनुभव घ्या.",
    features: [
      {
        title: "धोका विश्लेषण (Rejection Check)",
        desc: "धोका म्हणजे काय? याचा अर्थ तुमचा फॉर्म नाकारला जाण्याची शक्यता. आमचा AI तुमचा प्रोफाईल स्कॅन करतो आणि तुम्हाला हरवलेल्या कागदपत्रांबद्दल किंवा पात्रतेच्या समस्यांबद्दल आधीच चेतावणी देतो जेणेकरून तुम्ही अपयशी ठरणार नाही.",
      },
      {
        title: "स्मार्ट पात्रता (Smart Eligibility)",
        desc: "अचूकतेने तुमचा प्रोफाईल त्वरित 100+ योजनांशी जुळवतो.",
      },
      {
        title: "दस्तऐवज AI (Document AI)",
        desc: "विशिष्ट योजनेसाठी कोणते दस्तऐवज गहाळ आहेत हे স্কॅन करतो आणि तुम्हाला अचूक सांगतो.",
      },
      {
        title: "लोकल कनेक्ट (Local Connect)",
        desc: "जर तुम्हाला मदत हवी असेल तर तुम्हाला जवळचे CSC केंद्र शोधून सांगतो.",
      }
    ]
  },
  bn: {
    tag: "নেক্সট জেনারেশন এআই পোর্টাল",
    title: "SahayakAI: আপনার ডিজিটাল সঙ্গী",
    titleHighlight: "ডিজিটাল সঙ্গী",
    desc: "সরকারী স্কিমগুলির সুবিধা নেওয়া এখন সহজ। AI দিয়ে যোগ্য স্কিম খুঁজুন, আবেদনের ঝুঁকি বিশ্লেষণ করুন এবং অবিলম্বে নথি প্রস্তুত করুন।",
    btn1: "বিনামূল্যে মূল্যায়ন শুরু করুন",
    btn2: "স্কিম অন্বেষণ করুন",
    quote: "সঠিক সময়ে সঠিক তথ্য দিয়ে প্রতিটি নাগরিককে ক্ষমতায়ন করা। আপনার অগ্রগতিই জাতির অগ্রগতি।",
    quoteAuthor: "SahayakAI Vision",
    counters: ["সরকারী স্কিম", "সাহায্যপ্রাপ্ত নাগরিক", "AI উপলব্ধতা"],
    videoTitle: "SahayakAI কিভাবে ব্যবহার করবেন?",
    videoSub: "আমাদের AI কিভাবে আপনাকে প্রত্যাখ্যাত না হয়ে আপনার সুবিধা পেতে সাহায্য করতে পারে তা বুঝতে এই 1-মিনিটের ছোট ভিডিওটি দেখুন।",
    featTitle: "SahayakAI কেন বেছে নেবেন?",
    featSub: "নাগরিক এবং সরকারী সুবিধার মধ্যে ব্যবধান কমানোর জন্য বিশেষভাবে ডিজাইন করা কৃত্রিম বুদ্ধিমত্তার ক্ষমতার অভিজ্ঞতা নিন।",
    features: [
      {
        title: "ঝুঁকি বিশ্লেষণ (Rejection Check)",
        desc: "ঝুঁকি কি? এর মানে হল আপনার ফর্ম বাতিল হওয়ার সম্ভাবনা। আমাদের AI আপনার প্রোফাইল স্ক্যান করে এবং অনুপস্থিত নথি বা যোগ্যতার সমস্যা সম্পর্কে আপনাকে আগে থেকেই সতর্ক করে দেয় যাতে আপনি ব্যর্থ না হন।",
      },
      {
        title: "স্মার্ট যোগ্যতা (Smart Eligibility)",
        desc: "নিখুঁত নির্ভুলতার সাথে 100+ স্কিমের সাথে অবিলম্বে আপনার প্রোফাইল মেলে।",
      },
      {
        title: "নথি AI (Document AI)",
        desc: "একটি নির্দিষ্ট স্কিমের জন্য ঠিক কোন নথিগুলি অনুপস্থিত তা স্ক্যান করে এবং আপনাকে বলে৷",
      },
      {
        title: "লোকাল কানেক্ট (Local Connect)",
        desc: "আপনার সাহায্য প্রয়োজন হলে নিকটতম CSC কেন্দ্র খুঁজে আপনাকে জানায়।",
      }
    ]
  }
};

export default function LandingPage() {
  const [langCode, setLangCode] = useState<string>("hi");
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("sahayak_lang");
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
      setLangCode(savedLang);
    }
  }, []);

  const handleLangChange = (code: string) => {
    setLangCode(code);
    localStorage.setItem("sahayak_lang", code);
    setIsLangOpen(false);
  };

  const t = (CONTENT as any)[langCode] || CONTENT.en;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SahayakAI',
          text: 'Check out SahayakAI, your digital companion for government schemes!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert("Share feature is available on mobile devices!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* Colourful Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/50">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-indigo-400/30 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cyan-400/30 via-emerald-400/30 to-blue-400/30 blur-[120px] animate-pulse duration-[10000ms] delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-amber-300/30 via-orange-300/30 to-rose-300/30 blur-[100px] animate-pulse duration-[6000ms]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800 hidden sm:block">
                Sahayak<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-sm"
            >
              <Share2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:block">Share App</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 transition-all text-sm font-bold text-white border border-white/20"
              >
                <Globe className="w-4 h-4 text-white" />
                <span>{LANGUAGES.find(l => l.code === langCode)?.native}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
                  >
                    <div className="max-h-64 overflow-y-auto hide-scrollbar">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLangChange(lang.code)}
                          className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-sm transition-colors ${langCode === lang.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 container mx-auto px-4 md:px-6 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]">

          <motion.div
            variants={containerVariants} initial="hidden" animate="visible"
            className="flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-purple-200 text-purple-700 w-fit shadow-sm">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-bold tracking-wide uppercase">{t.tag}</span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-slate-800">
                {t.title.split(t.titleHighlight)[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 animate-pulse">
                  {t.titleHighlight}
                </span>
                {t.title.split(t.titleHighlight)[1]}
              </h1>
              <p className="mt-6 text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
                {t.desc}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/onboarding" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-bold text-lg hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                {t.btn1}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/onboarding" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-purple-100 text-purple-700 font-bold text-lg hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-center">
                {t.btn2}
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 border-t border-slate-200">
              <p className="italic text-slate-500">"{t.quote}"</p>
              <p className="mt-2 text-blue-600 font-bold uppercase tracking-wider text-sm">— {t.quoteAuthor}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="relative h-full flex flex-col justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300/40 to-purple-300/40 rounded-[40px] blur-3xl -z-10" />

            <div className="relative rounded-[40px] overflow-hidden border border-white shadow-2xl bg-white/50 backdrop-blur-xl p-2">
              <img
                src="/hero-image.jpg"
                alt="AI Dashboard Visualization"
                className="w-full h-[400px] object-cover rounded-[32px] opacity-90 transition-opacity"
              />
            </div>
          </motion.div>

        </div>
      </main>

      <section className="relative z-10 border-y border-slate-200 bg-white/40 backdrop-blur-md py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Counter end={120} suffix="+" title={t.counters[0]} />
            <Counter end={15} suffix="k+" title={t.counters[1]} />
            <Counter end={24} suffix="/7" title={t.counters[2]} />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-800">{t.featTitle}</h2>
          <p className="text-xl text-slate-600 font-medium">{t.featSub}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.map((feature: any, idx: number) => {
            const icons = [Activity, ShieldCheck, FileText, MapPin];
            const Icon = icons[idx];
            const gradients = [
              "from-pink-100 to-rose-100 text-pink-600",
              "from-blue-100 to-cyan-100 text-blue-600",
              "from-purple-100 to-fuchsia-100 text-purple-600",
              "from-amber-100 to-orange-100 text-amber-600"
            ];
            const hoverBorders = [
              "group-hover:border-pink-300",
              "group-hover:border-blue-300",
              "group-hover:border-purple-300",
              "group-hover:border-amber-300"
            ];
            return (
              <div key={idx} className={`bg-white/80 backdrop-blur-sm border border-white rounded-3xl p-8 hover:bg-white transition-all group shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 ${hoverBorders[idx]}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
