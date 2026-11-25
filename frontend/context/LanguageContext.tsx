"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations["en"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  setLang: () => {},
  t: translations.hi,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("hi");

  useEffect(() => {
    // Initial read from localStorage deferred via microtask to avoid cascading render
    const saved = localStorage.getItem("sahayak_lang");
    if (saved === "en" || saved === "hi") {
      queueMicrotask(() => {
        setLangState(saved);
      });
    }

    // Sync across window events
    const handleStorageChange = () => {
      const current = localStorage.getItem("sahayak_lang");
      if (current === "en" || current === "hi") {
        setLangState(current);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("sahayak_lang", newLang);
    window.dispatchEvent(new Event("storage"));
  };

  const t = translations[lang] || translations.hi;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
