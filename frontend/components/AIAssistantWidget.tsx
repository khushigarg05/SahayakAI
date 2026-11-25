"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Minus,
  Paperclip,
  RotateCw,
  Home,
  Sprout,
  Users,
  PlusCircle,
  ChevronRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Volume2,
  Square,
} from "lucide-react";
import { sendChatMessage, verifyUploadedDocument, DocumentAuditResult, fetchSpeechAudio } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  scheme?: string;
  gazette?: string;
  attachedFile?: { name: string; size: string };
  audit?: DocumentAuditResult;
  ocrError?: {
    message: string;
    file?: File;
  };
}

export default function AIAssistantWidget() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [suggestionSetIndex, setSuggestionSetIndex] = useState(0);
  const [isRotatingSuggestions, setIsRotatingSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech-to-Text & Text-to-Speech State
  const [isListening, setIsListening] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioLoadingIndex, setAudioLoadingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<string>("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSendRef = useRef<((queryText?: string, isVoice?: boolean) => Promise<void>) | null>(null);
  const isTTSLoadingRef = useRef<boolean>(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "hi-IN";

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setInput(currentTranscript);
            transcriptRef.current = currentTranscript.trim();

            // Clear previous silence timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            // Auto-send after 1.3 seconds of silence!
            silenceTimerRef.current = setTimeout(() => {
              const textToSend = transcriptRef.current;
              if (textToSend.length >= 2) {
                transcriptRef.current = "";
                setIsListening(false);
                try {
                  recognition.stop();
                } catch (e) {}
                if (handleSendRef.current) {
                  handleSendRef.current(textToSend, true);
                }
              }
            }, 1300);
          }
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          const textToSend = transcriptRef.current;
          if (textToSend && textToSend.length >= 2) {
            transcriptRef.current = "";
            if (handleSendRef.current) {
              handleSendRef.current(textToSend, true);
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === "hi" ? "Aapka browser voice recognition support nahi karta." : "Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      const textToSend = transcriptRef.current;
      if (textToSend && textToSend.length >= 2) {
        transcriptRef.current = "";
        if (handleSendRef.current) {
          handleSendRef.current(textToSend, true);
        }
      }
    } else {
      try {
        transcriptRef.current = "";
        setInput("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Failed to start voice recognition:", e);
        setIsListening(false);
      }
    }
  };

  const handleSpeakMessage = async (index: number, text: string) => {
    // If already playing this message, stop it
    if (playingIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingIndex(null);
      return;
    }

    // Stop any previous playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Prevent concurrent TTS requests from overlapping
    if (isTTSLoadingRef.current) {
      return;
    }
    isTTSLoadingRef.current = true;

    setAudioLoadingIndex(index);
    setPlayingIndex(null);

    try {
      // 1. Fetch ElevenLabs HD Voice from backend
      const audioBlob = await fetchSpeechAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingIndex(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        fallbackBrowserSpeech(text, index);
      };

      await audio.play();
      setAudioLoadingIndex(null);
      setPlayingIndex(index);
    } catch (err) {
      console.warn("ElevenLabs TTS request failed, falling back to browser speech engine:", err);
      fallbackBrowserSpeech(text, index);
    } finally {
      isTTSLoadingRef.current = false;
    }
  };

  const fallbackBrowserSpeech = (text: string, index: number) => {
    setAudioLoadingIndex(null);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPlayingIndex(null);
      return;
    }

    const cleanText = text.replace(/[*_#`~]/g, "").slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => {
      setPlayingIndex(null);
    };
    utterance.onerror = () => {
      setPlayingIndex(null);
    };

    setPlayingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Suggested questions sets for English and Hindi
  const suggestionSets = {
    en: [
      ["PMAY Gramin eligibility?", "Check PM-Kisan status", "Required documents?"],
      ["Ayushman Bharat ₹5 Lakh cover?", "Old age pension monthly amount?", "Ration card DBT link?"],
      ["PM Mudra Loan process?", "Kisan Credit Card (KCC) limit?", "Ujjwala LPG subsidy rules?"],
    ],
    hi: [
      ["PMAY ग्रामीण पात्रता क्या है?", "PM-किसान स्थिति कैसे देखें?", "आवेदन हेतु आवश्यक दस्तावेज?"],
      ["आयुष्मान ₹5 लाख इलाज नियम?", "वृद्धावस्था पेंशन कितनी मिलती है?", "राशन कार्ड में नाम कैसे जोड़ें?"],
      ["मुद्रा लोन योजना के नियम?", "किसान क्रेडिट कार्ड ब्याज दर?", "उज्ज्वला मुफ्त गैस कनेक्शन पात्रता?"],
    ],
  };

  const currentSuggestions =
    suggestionSets[lang === "hi" ? "hi" : "en"][suggestionSetIndex % 3];

  // Rotate through suggestion sets
  const handleRotateSuggestions = () => {
    setIsRotatingSuggestions(true);
    setSuggestionSetIndex((prev) => (prev + 1) % 3);
    setTimeout(() => setIsRotatingSuggestions(false), 400);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handle file selection from paperclip
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert(
          lang === "hi"
            ? "फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए।"
            : "File size exceeds 5MB limit. Please upload a smaller document."
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  // Retry OCR verification when network/backend returns
  const handleRetryOCR = async (msgIndex: number) => {
    const targetMsg = messages[msgIndex];
    if (!targetMsg || !targetMsg.ocrError?.file) return;
    const file = targetMsg.ocrError.file;
    setIsTyping(true);
    try {
      const docTypeGuess = file.name.toLowerCase().includes("income")
        ? "income"
        : file.name.toLowerCase().includes("aadhaar")
        ? "aadhaar"
        : file.name.toLowerCase().includes("caste")
        ? "caste"
        : "ration";
      const result = await verifyUploadedDocument(file, docTypeGuess);
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === msgIndex
            ? { ...m, audit: result, ocrError: undefined }
            : m
        )
      );
    } catch (err) {
      console.warn("Retry OCR verification failed:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Send: Supports plain text, popular topics, chips, voice auto-send, or file audit!
  const handleSend = async (queryText?: string, isVoice: boolean = false) => {
    const query = (queryText || input).trim();
    const hasFile = selectedFile !== null;

    if (!query && !hasFile) return;
    if (isTyping) return;

    const fileToUpload = selectedFile;
    const userMessageText = query || (
      lang === "hi"
        ? `कृपया मेरे संलग्न दस्तावेज़ (${fileToUpload?.name}) की जांच कर सरकारी योजना पात्रता बताएं।`
        : `Please audit my attached document (${fileToUpload?.name}) and check my scheme eligibility.`
    );

    // 1. Add User Message to UI
    const newUserMsg: ChatMessage = {
      role: "user",
      text: userMessageText,
      ...(hasFile && fileToUpload
        ? {
            attachedFile: {
              name: fileToUpload.name,
              size: `${(fileToUpload.size / 1024).toFixed(0)} KB`,
            },
          }
        : {}),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsTyping(true);

    let ocrError: { message: string; file?: File } | undefined = undefined;

    try {
      let auditResult: DocumentAuditResult | undefined = undefined;

      // 2. If a file was attached, perform real OCR / statutory rules audit via FastAPI
      if (hasFile && fileToUpload) {
        try {
          const docTypeGuess = fileToUpload.name.toLowerCase().includes("income")
            ? "income"
            : fileToUpload.name.toLowerCase().includes("aadhaar")
            ? "aadhaar"
            : fileToUpload.name.toLowerCase().includes("caste")
            ? "caste"
            : "ration";

          auditResult = await verifyUploadedDocument(fileToUpload, docTypeGuess);
        } catch (auditErr) {
          console.warn("Direct document audit unreachable or offline:", auditErr);
          // Never synthesize fake validation scores or fabricated validity
          auditResult = undefined;
          ocrError = {
            message:
              lang === "hi"
                ? "OCR सेवा उपलब्ध नहीं है – दस्तावेज़ का सत्यापन नहीं हुआ।"
                : "OCR Service Offline – Document Not Verified.",
            file: fileToUpload,
          };
        }
      }

      // 3. Call RAG AI Chatbot Endpoint
      const enrichedQuery = auditResult
        ? `${userMessageText} [Audited Document: ${auditResult.document_type}, Status: ${auditResult.is_valid ? "Valid" : "Invalid"}]`
        : hasFile && fileToUpload
        ? `${userMessageText} [Attached File: ${fileToUpload.name} (OCR verification pending/offline)]`
        : userMessageText;

      const chatRes = await sendChatMessage(enrichedQuery, lang);
      const textToDisplay = chatRes.answer || chatRes.response || t.chat.fallbackAnswer;

      // 4. Add AI reply
      const aiReply: ChatMessage = {
        role: "ai" as const,
        text: textToDisplay,
        scheme: chatRes.matched_scheme || (auditResult ? "PMAY & PM-Kisan Welfare Guidelines" : undefined),
        gazette: chatRes.source_gazette,
        audit: auditResult,
        ocrError: ocrError,
      };

      setMessages((prev) => [...prev, aiReply]);

      // If sent via voice, automatically play voice speech! (Outside state updater so strictly runs once)
      if (isVoice) {
        setTimeout(() => {
          handleSpeakMessage(messagesRef.current.length - 1, textToDisplay);
        }, 300);
      }
    } catch (err) {
      console.warn("FastAPI chat fallback, using verified response:", err);
      const fallbackReply: ChatMessage = {
        role: "ai" as const,
        text: t.chat.fallbackAnswer,
        scheme: t.chat.gazetteGuidelines,
        ocrError: ocrError,
      };
      setMessages((prev) => [...prev, fallbackReply]);
      if (isVoice) {
        setTimeout(() => {
          handleSpeakMessage(messagesRef.current.length - 1, t.chat.fallbackAnswer);
        }, 300);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Keep handleSendRef updated
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  // Popular Topics Click Handler
  const handleTopicClick = (topicKey: "pmay" | "pmkisan" | "pension" | "ayushman") => {
    const prompts = {
      pmay:
        lang === "hi"
          ? "PMAY आवास योजना की पात्रता और आवश्यक दस्तावेज क्या हैं?"
          : "What is PMAY Housing eligibility and required documents?",
      pmkisan:
        lang === "hi"
          ? "PM-किसान सम्मान निधि की पात्रता और किस्त स्थिति कैसे चेक करें?"
          : "Tell me about PM-Kisan eligibility and installment status check.",
      pension:
        lang === "hi"
          ? "वृद्धावस्था पेंशन के लाभ और आवेदन प्रक्रिया क्या है?"
          : "What are the benefits and application process for Old Age Pension?",
      ayushman:
        lang === "hi"
          ? "आयुष्मान भारत ₹5 लाख स्वास्थ्य कवर की पात्रता और अस्पताल सूची क्या है?"
          : "What is Ayushman Bharat ₹5 Lakh health cover eligibility and empaneled hospitals?",
    };
    handleSend(prompts[topicKey]);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-20 sm:bottom-22 right-0 w-[calc(100vw-1.5rem)] sm:w-[440px] md:w-[460px] max-w-[460px] bg-white border border-slate-200/90 shadow-2xl shadow-blue-950/25 rounded-3xl overflow-hidden flex flex-col h-[580px] sm:h-[640px] max-h-[86vh]"
          >
            {/* ========================================================
                1. HEADER: Deep Navy with Ashoka Chakra + Tricolor Wave
                ======================================================== */}
            <div className="relative bg-[#081945] text-white px-4 py-3.5 flex items-center justify-between select-none overflow-hidden rounded-t-3xl border-b-2 border-[#FF9933]">
              {/* Ashoka Chakra Watermark on Right */}
              <svg
                viewBox="0 0 100 100"
                className="absolute right-14 -top-3 w-28 h-28 opacity-[0.08] text-white pointer-events-none fill-none stroke-current"
                strokeWidth="1.5"
              >
                <circle cx="50" cy="50" r="46" />
                <circle cx="50" cy="50" r="10" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 46 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 46 * Math.sin((i * 15 * Math.PI) / 180)}
                  />
                ))}
              </svg>

              {/* Bottom Right Indian Tricolor Wave Accent */}
              <div className="absolute right-0 bottom-0 pointer-events-none h-3 w-44 opacity-90 overflow-hidden">
                <svg
                  viewBox="0 0 160 12"
                  className="w-full h-full preserve-3d"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,6 C40,0 80,12 120,4 C140,0 160,2 160,2 L160,12 L0,12 Z"
                    fill="#138808"
                  />
                  <path
                    d="M0,4 C40,0 80,8 120,2 C140,0 160,1 160,1 L160,6 L0,6 Z"
                    fill="#FFFFFF"
                    opacity="0.9"
                  />
                  <path
                    d="M0,2 C40,-1 80,5 120,1 C140,-1 160,0 160,0 L160,3 L0,3 Z"
                    fill="#FF9933"
                  />
                </svg>
              </div>

              {/* Header Left: Bot Mascot + Titles */}
              <div className="flex items-center space-x-3 z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/10 border-2 border-white/80 p-0.5 flex-shrink-0 shadow-md">
                  <img
                    src="/bot_avatar.png"
                    alt="Sahayak Mascot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-[17px] text-white leading-tight tracking-wide">
                    Sahayak <span className="text-sky-400 font-extrabold">AI</span> Assistant
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-normal leading-tight mt-0.5">
                    {t.chat.headerSub}
                  </p>
                </div>
              </div>

              {/* Header Right: Online Badge + Minimize + Close */}
              <div className="flex items-center space-x-2 z-10">
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-200">
                    {t.chat.onlineStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ========================================================
                2. CHAT BODY: Scrollable Welcome, Topics, Suggestions, & Thread
                ======================================================== */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 bg-gradient-to-b from-[#F8FAFC] to-white text-xs">
              {/* Date Pill */}
              <div className="w-fit mx-auto px-3 py-0.5 bg-blue-50/80 text-slate-500 border border-blue-100/70 text-[11px] font-semibold rounded-full select-none shadow-xs">
                {t.chat.todayPill}
              </div>

              {/* Initial Companion Welcome Message */}
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full border border-blue-200 bg-white p-0.5 flex-shrink-0 shadow-xs overflow-hidden mt-0.5">
                  <img
                    src="/bot_avatar.png"
                    alt="Sahayak Mascot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 bg-[#F0F6FF] border border-blue-100 rounded-2xl rounded-tl-xs p-3.5 text-slate-800 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[13px] mb-1">
                    <span>👋</span>
                    <span>
                      {t.chat.welcomeMsg1}{" "}
                      <span className="text-blue-700 font-extrabold">
                        {t.chat.welcomeMsgHighlight}
                      </span>
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {t.chat.welcomeMsg2}
                  </p>
                </div>
              </div>

              {/* Explore Popular Topics (2x2 Grid) */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] mb-2 select-none">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>{t.chat.exploreTopicsTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Card 1: PMAY Housing */}
                  <button
                    type="button"
                    onClick={() => handleTopicClick("pmay")}
                    className="p-2.5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {t.chat.topics.pmay.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {t.chat.topics.pmay.sub}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                  </button>

                  {/* Card 2: PM-Kisan */}
                  <button
                    type="button"
                    onClick={() => handleTopicClick("pmkisan")}
                    className="p-2.5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {t.chat.topics.pmkisan.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {t.chat.topics.pmkisan.sub}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                  </button>

                  {/* Card 3: Old Age Pension */}
                  <button
                    type="button"
                    onClick={() => handleTopicClick("pension")}
                    className="p-2.5 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                          {t.chat.topics.pension.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {t.chat.topics.pension.sub}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                  </button>

                  {/* Card 4: Ayushman Bharat */}
                  <button
                    type="button"
                    onClick={() => handleTopicClick("ayushman")}
                    className="p-2.5 rounded-2xl border border-slate-200/90 bg-white hover:border-red-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors truncate">
                          {t.chat.topics.ayushman.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {t.chat.topics.ayushman.sub}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                  </button>
                </div>
              </div>

              {/* Suggested Questions Section */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5 select-none">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.chat.suggestedQuestionsTitle}</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  {currentSuggestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="px-3 py-1.5 rounded-full bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/70 text-blue-950 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleRotateSuggestions}
                    className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all cursor-pointer flex-shrink-0 shadow-2xs"
                    title="Rotate suggestions"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isRotatingSuggestions ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dynamic Conversation History Thread */}
              {messages.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Attached File Chip in User Message */}
                      {msg.role === "user" && msg.attachedFile && (
                        <div className="mb-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                          <Paperclip className="w-3 h-3 text-blue-600" />
                          <span className="font-semibold">{msg.attachedFile.name}</span>
                          <span className="text-slate-500 text-[10px]">
                            ({msg.attachedFile.size})
                          </span>
                        </div>
                      )}

                      {/* Main Message Bubble */}
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white font-medium rounded-tr-xs shadow-sm text-xs"
                            : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs text-xs"
                        }`}
                      >
                        {/* Live Attached Document DPDP Audit Card in AI Reply */}
                        {msg.role === "ai" && msg.audit && (
                          <div className="mb-2 p-2.5 rounded-xl border bg-emerald-50/90 border-emerald-200 text-emerald-950">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.chat.docAuditPassed}</span>
                            </div>
                            <div className="text-[11px] space-y-0.5 text-emerald-900/90">
                              <p>
                                <strong>ID:</strong> {msg.audit.masked_identifier} •{" "}
                                <strong>Clarity:</strong> {msg.audit.clarity_rating}
                              </p>
                              <p className="text-[10.5px] text-emerald-800">
                                {msg.audit.recommendation}
                              </p>
                              <p className="text-[9.5px] text-emerald-700/80 italic pt-1 border-t border-emerald-200/60 mt-1">
                                {lang === "hi"
                                  ? "* प्रारंभिक स्पष्टता जांच। अंतिम सत्यापन विभाग के पोर्टल / e-KYC से होता है।"
                                  : "* Preliminary clarity pre-screening only. Official verification occurs via departmental e-KYC."}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* OCR Service Offline / Error Banner (Honest error, zero fake scores) */}
                        {msg.role === "ai" && msg.ocrError && (
                          <div className="mb-2 p-2.5 rounded-xl border bg-amber-50/90 border-amber-200 text-amber-950">
                            <div className="flex items-center justify-between gap-2 font-bold text-xs text-amber-900 mb-1">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                <span>{msg.ocrError.message}</span>
                              </div>
                              {msg.ocrError.file && (
                                <button
                                  onClick={() => handleRetryOCR(i)}
                                  disabled={isTyping}
                                  className="text-[10.5px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer flex-shrink-0"
                                >
                                  {lang === "hi" ? "पुनः प्रयास करें" : "Retry"}
                                </button>
                              )}
                            </div>
                            <p className="text-[10.5px] text-amber-800/90">
                              {lang === "hi"
                                ? "दस्तावेज़ सत्यापन बैकएंड अनुपलब्ध है। कोई फर्जी परिणाम नहीं दिखाया गया है। कृपया बैकएंड चालू होने पर पुनः प्रयास करें।"
                                : "Document verification backend is unreachable. No fabricated results are generated. Please retry when connection is restored."}
                            </p>
                          </div>
                        )}

                        {/* Text Content */}
                        <div>{msg.text}</div>

                        {/* Matched Scheme & ElevenLabs Voice Player Bar */}
                        {msg.role === "ai" && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            {msg.scheme ? (
                              <div className="flex items-center space-x-1.5 text-[10.5px] text-blue-700 font-bold truncate">
                                <BookOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                <span className="truncate">{msg.scheme}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                                <span>ElevenLabs HD</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSpeakMessage(i, msg.text)}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                                playingIndex === i
                                  ? "bg-blue-600 text-white shadow-xs animate-pulse"
                                  : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200"
                              }`}
                              title="ElevenLabs HD Voice me sunein"
                            >
                              {audioLoadingIndex === i ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                  <span>Loading...</span>
                                </>
                              ) : playingIndex === i ? (
                                <>
                                  <Square className="w-2.5 h-2.5 fill-current" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-blue-600" />
                                  <span>Sunein</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Typing Loader */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-500 p-2.5 bg-white rounded-xl border border-slate-200 w-fit text-[11px] shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  <span>{t.chat.searching}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ========================================================
                3. INPUT AREA: File Attachment + Text Field + Send Button
                ======================================================== */}
            <div className="bg-white border-t border-slate-100 px-3.5 py-2.5 space-y-2 select-none">
              {/* Selected File Preview Badge (if chosen via paperclip) */}
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200/80 text-blue-900 rounded-xl px-2.5 py-1.5 text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500">
                      ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">
                      DPDP Ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Voice Listening Active Indicator Banner */}
              {isListening && (
                <div className="bg-red-50 border border-red-200/90 text-red-900 rounded-xl px-3 py-1.5 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <span className="font-bold text-[11px] text-red-800">
                      {lang === "hi" ? "🎙️ बोलिए... बोलते ही अपने आप सेंड हो जाएगा!" : "🎙️ Speak now... Will auto-send when you pause!"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className="text-[10px] font-bold text-red-700 hover:text-red-900 bg-red-100 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Send Now
                  </button>
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-2">
                {/* Input Capsule */}
                <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-2.5 py-1 shadow-xs focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="hidden"
                  />

                  {/* Paperclip Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedFile
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                    }`}
                    title={t.chat.attachTooltip}
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45" />
                  </button>

                  {/* Microphone Button (Speech-to-Text) */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-300"
                        : "text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                    }`}
                    title={isListening ? "Sun raha hoon... Click karke band karein" : "Boliye (Hindi / English)"}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={t.chat.inputPlaceholder}
                    className="flex-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent px-2 py-1.5 focus:outline-none"
                  />
                </div>

                {/* Send Button: Vibrant Blue Rounded Square */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedFile) || isTyping}
                  className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer flex-shrink-0"
                  aria-label="Send query"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                </button>
              </div>

              {/* Footer Trust Badge */}
              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 pt-0.5 select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{t.chat.footerTrust}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          4. FLOATING TRIGGER: Speech Bubble + Circular Mascot Button
          ======================================================== */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 select-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 20, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(true)}
              className="text-left bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl hover:shadow-2xl px-3.5 sm:px-4 py-2.5 relative group cursor-pointer transition-all duration-200 hover:-translate-x-0.5 max-w-[210px] sm:max-w-[280px]"
            >
              <p className="text-xs sm:text-sm font-extrabold text-[#0B2545] tracking-tight leading-snug group-hover:text-blue-700 transition-colors">
                {t.chat.bubbleTitle}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                {t.chat.bubbleSubtitle}
              </p>
              {/* Pointer triangle pointing towards avatar */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-white drop-shadow-sm pointer-events-none" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Circular Mascot Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Chat" : t.chat.bubbleTitle}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-blue-500/20 group flex-shrink-0"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0A3D91] relative flex items-center justify-center border-2 border-white shadow-inner">
            <img
              src="/bot_avatar.png"
              alt="Sahayak AI Mascot"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {isOpen && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center transition-opacity">
                <X className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Active Status Badge (Green Dot) */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-4 w-4 sm:h-4.5 sm:w-4.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 sm:h-4.5 sm:w-4.5 bg-emerald-500 border-2 border-white shadow-xs" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
