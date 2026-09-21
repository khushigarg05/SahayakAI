"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";

// Mock Data for Analytics
const districtRiskData = [
  { name: "Patna", high: 450, medium: 800, low: 1200 },
  { name: "Gaya", high: 600, medium: 500, low: 800 },
  { name: "Bhagalpur", high: 300, medium: 600, low: 900 },
  { name: "Muzaffarpur", high: 400, medium: 700, low: 1100 },
  { name: "Purnia", high: 700, medium: 400, low: 500 },
];

const schemeAdoptionData = [
  { name: "PM Kisan", value: 45 },
  { name: "Ayushman", value: 30 },
  { name: "Awas Yojana", value: 15 },
  { name: "Other", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

export default function AnalyticsDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Institutional Analytics</h1>
          <p className="text-slate-400 mt-1">Real-time welfare scheme access & risk distribution</p>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Applications", value: "12,450", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { title: "High Risk Profiles", value: "2,450", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
          { title: "Schemes Disbursed", value: "8,920", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { title: "M-o-M Growth", value: "+14.5%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center space-x-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: District Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-6">District-wise Access Risk Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="high" name="High Risk" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="#eab308" />
                <Bar dataKey="low" name="Low Risk" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Scheme Adoption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Scheme Adoption Rate</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={schemeAdoptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {schemeAdoptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
