"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, AlertTriangle, TrendingUp, ShieldCheck, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getRegionalStats } from "@/lib/api";

const DEFAULT_DISTRICT_DATA = [
  { name: "Varanasi", high: 420, medium: 950, low: 2400 },
  { name: "Prayagraj", high: 680, medium: 1100, low: 1900 },
  { name: "Gorakhpur", high: 390, medium: 820, low: 2100 },
  { name: "Lucknow", high: 280, medium: 650, low: 3200 },
  { name: "Patna", high: 640, medium: 1200, low: 1850 },
];

const DEFAULT_SCHEME_DATA = [
  { name: "PM-KISAN", value: 45 },
  { name: "Ayushman Bharat", value: 30 },
  { name: "PMAY-G Housing", value: 15 },
  { name: "Old Age Pension", value: 10 },
];

const COLORS = ["#1e40af", "#059669", "#d97706", "#7c3aed"];

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const [districtRiskData, setDistrictRiskData] = useState(DEFAULT_DISTRICT_DATA);
  const [schemeAdoptionData, setSchemeAdoptionData] = useState(DEFAULT_SCHEME_DATA);
  const [kpis, setKpis] = useState({
    citizens_audited: 14850,
    high_risk_cases: 2410,
    csc_tokens_dispatched: 9640,
    dbt_success_rate: 98.2,
  });
  const [isLiveData, setIsLiveData] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const data = await getRegionalStats();
        if (isMounted && data) {
          if (data.kpis) {
            setKpis(data.kpis);
          }
          if (data.district_risk_breakdown && data.district_risk_breakdown.length > 0) {
            setDistrictRiskData(
              data.district_risk_breakdown.map((d) => ({
                name: d.district,
                high: d.high_risk,
                medium: d.medium_risk,
                low: d.low_risk,
              }))
            );
          }
          if (data.scheme_adoption_share && data.scheme_adoption_share.length > 0) {
            setSchemeAdoptionData(
              data.scheme_adoption_share.map((s) => ({
                name: s.name,
                value: s.share_percentage,
              }))
            );
          }
          setIsLiveData(Boolean(data.is_live_data));
          setDemoNotice(data.demo_notice || null);
        }
      } catch (err) {
        console.warn("Using default baseline for regional stats:", err);
        if (isMounted) {
          setIsLiveData(false);
          setDemoNotice("OFFLINE MODE: Displaying local baseline projection. Backend database is unreachable.");
        }
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP TITLE HEADER */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.analytics.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{t.analytics.subTag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {t.analytics.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {t.analytics.description}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer flex-shrink-0"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{t.analytics.btnExport}</span>
            </button>
          </div>
        </div>

        {/* DATA INTEGRITY NOTICE (Explicitly separates real DB data from demo projections) */}
        {demoNotice && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 px-5 flex items-start sm:items-center gap-3 text-xs text-amber-900 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <span className="font-bold uppercase tracking-wide text-amber-800 mr-2">[Data Lineage Notice]</span>
              <span>{demoNotice}</span>
            </div>
          </div>
        )}

        {/* 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { title: t.analytics.kpiAudited, value: kpis.citizens_audited.toLocaleString("en-IN"), icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
            { title: t.analytics.kpiHighRisk, value: kpis.high_risk_cases.toLocaleString("en-IN"), icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50" },
            { title: t.analytics.kpiTokens, value: kpis.csc_tokens_dispatched.toLocaleString("en-IN"), icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
            { title: t.analytics.kpiDbtRate, value: `${kpis.dbt_success_rate}%`, icon: TrendingUp, color: "text-purple-700", bg: "bg-purple-50" },
          ].map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center space-x-4"
            >
              <div className={`p-3.5 rounded-xl ${kpi.bg} flex-shrink-0`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block leading-tight">{kpi.title}</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Bar Chart: District Risk Breakdown */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {t.analytics.chartRiskTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.analytics.chartRiskSub}</p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                isLiveData
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveData ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isLiveData ? "🟢 Live Database Metrics" : "⚠️ DEMO PROJECTION MODEL"}
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtRiskData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend />
                  <Bar dataKey="low" name={t.analytics.barLow} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medium" name={t.analytics.barMed} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="high" name={t.analytics.barHigh} fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Scheme Distribution */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {t.analytics.chartSchemeTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.analytics.chartSchemeSub}</p>
            </div>

            <div className="h-72 sm:h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemeAdoptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {schemeAdoptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
