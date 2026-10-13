"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, AlertTriangle, TrendingUp, ShieldCheck, Building2, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const districtRiskData = [
  { name: "Varanasi", high: 450, medium: 800, low: 1200 },
  { name: "Prayagraj", high: 600, medium: 500, low: 800 },
  { name: "Gorakhpur", high: 300, medium: 600, low: 900 },
  { name: "Lucknow", high: 400, medium: 700, low: 1100 },
  { name: "Patna", high: 700, medium: 400, low: 500 },
];

const schemeAdoptionData = [
  { name: "PM-KISAN", value: 45 },
  { name: "Ayushman Bharat", value: 30 },
  { name: "PMAY-G Housing", value: 15 },
  { name: "Old Age Pension", value: 10 },
];

const COLORS = ["#1e40af", "#059669", "#d97706", "#7c3aed"];

export default function AnalyticsDashboard() {
  const { lang, t } = useLanguage();

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

        {/* 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { title: t.analytics.kpiAudited, value: "14,850", icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
            { title: t.analytics.kpiHighRisk, value: "2,410", icon: AlertTriangle, color: "text-red-700", bg: "bg-red-50" },
            { title: t.analytics.kpiTokens, value: "9,640", icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
            { title: t.analytics.kpiDbtRate, value: "98.2%", icon: TrendingUp, color: "text-purple-700", bg: "bg-purple-50" },
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
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {t.analytics.liveBadge}
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
