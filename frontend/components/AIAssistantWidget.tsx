"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Shield, Loader2, BookOpen } from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  scheme?: string;
  gazette?: string;
}

export default function AIAssistantWidget() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial welcome message based on language
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: t.chat.welcome,
        scheme: lang === "hi" ? "सभी केंद्रीय योजनाएं" : "All Central Schemes",
      },
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || isTyping) return;

    // 1. Add user message
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setIsTyping(true);

    try {
      // 2. Call REAL FastAPI RAG Chatbot
      const res = await sendChatMessage(query, lang);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.answer,
          scheme: res.matched_scheme,
          gazette: res.source_gazette,
        },
      ]);
    } catch (err) {
      console.warn("FastAPI chat fallback, using verified response:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t.chat.fallbackAnswer,
          scheme: t.chat.gazetteGuidelines,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white border border-slate-300 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[480px] sm:h-[500px]"
          >
            {/* Header: Official Gov Style */}
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center border border-blue-500 flex-shrink-0">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{t.chat.headerTitle}</h3>
                  <p className="text-[10px] text-slate-300 font-medium">{t.chat.headerSub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-800 text-white font-medium rounded-br-none shadow-sm"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}

                    {/* Matched Scheme Pill for AI replies */}
                    {msg.role === "ai" && msg.scheme && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center space-x-1 text-[10px] text-blue-700 font-bold">
                        <BookOpen className="w-3 h-3" />
                        <span className="truncate">{msg.scheme}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-500 p-2 bg-white rounded-lg border border-slate-200 w-fit text-[11px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  <span>{t.chat.searching}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex space-x-1.5 overflow-x-auto text-[10px] hide-scrollbar">
              <button
                onClick={() => handleSend(t.chat.chip1)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer"
              >
                🏠 {t.chat.chip1}
              </button>
              <button
                onClick={() => handleSend(t.chat.chip2)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer"
              >
                👴 {t.chat.chip2}
              </button>
              <button
                onClick={() => handleSend(t.chat.chip3)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer"
              >
                🌾 {t.chat.chip3}
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-slate-200">
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t.chat.inputPlaceholder}
                  className="flex-1 h-9 px-3 text-xs bg-slate-100 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="h-9 w-9 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl border-2 border-amber-400 transition-transform active:scale-95 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        <span className="text-xs font-bold tracking-wide">{t.chat.toggleBtn}</span>
      </button>
    </div>
  );
}
