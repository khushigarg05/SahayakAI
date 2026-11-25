"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Building2, 
  ExternalLink, 
  FileText, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Tag
} from "lucide-react";
import Link from "next/link";
import { getAllSchemes, MatchedScheme } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function SchemeExplorerPage() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [schemes, setSchemes] = useState<MatchedScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live schemes catalog from FastAPI Backend
    getAllSchemes().then((data) => {
      setSchemes(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const categories = ["All", "Housing", "Agriculture", "Pension", "Health", "Energy"];

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const matchesSearch =
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.scheme_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.benefits_summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || scheme.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [schemes, searchQuery, selectedCategory]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP TITLE & SEARCH CARD */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.schemes.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{t.schemes.subTag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {t.schemes.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {t.schemes.description}
              </p>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-sm shadow-blue-800/20 transition-all flex-shrink-0"
            >
              <span>{t.schemes.btnCheck}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.schemes.searchPlaceholder}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-blue-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat === "All" ? t.schemes.allCategory : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SCHEMES CARDS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSchemes.map((scheme, sIdx) => (
            <div
              key={scheme.scheme_code || scheme.scheme_id || `scheme-${sIdx}`}
              className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded">
                    {scheme.scheme_code}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {scheme.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{scheme.name}</h3>
                <p className="text-xs text-emerald-800 font-semibold mt-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 leading-relaxed">
                  💰 {scheme.benefits_summary}
                </p>

                {/* Required Documents List */}
                {scheme.required_documents && scheme.required_documents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                      {t.schemes.mandatoryDocs}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scheme.required_documents.map((doc, idx) => (
                        <span
                          key={`${scheme.scheme_code || 'doc'}-${idx}-${doc}`}
                          className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {scheme.official_url ? (
                  <a
                    href={scheme.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>{t.schemes.officialLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Gazette Verified</span>
                )}

                <Link
                  href="/onboarding"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>{t.schemes.btnCheckMatch}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER GUARANTEE */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span className="font-semibold">
              {t.schemes.guarantee}
            </span>
          </div>
          <Link href="/map" className="font-bold underline text-blue-800 hover:text-blue-950 flex-shrink-0">
            {t.schemes.btnBookKiosk}
          </Link>
        </div>

      </div>
    </div>
  );
}
