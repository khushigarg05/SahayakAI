"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, CheckCircle, Navigation, FileSearch, HelpCircle, MapPin, Search } from "lucide-react";
import Link from "next/link";

// 1. Radar Scanning Component
function RadarScanner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      <div className="relative w-48 h-48 rounded-full border border-primary/20 bg-primary/5 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.1)]">
        {/* Radar sweeping line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-10 origin-center"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, rgba(var(--primary), 0.5) 100%)",
          }}
        />
        {/* Pulse rings */}
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-24 h-24 bg-primary/30 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute w-24 h-24 border border-primary/50 rounded-full"
        />
        <div className="z-20 text-primary">
          <Search className="w-8 h-8" />
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse text-center max-w-sm">
        AI Core analyzing 12+ citizen factors & predicting welfare access risk...
      </p>
    </div>
  );
}

// 2. Risk Score Speedometer Gauge (Recharts)
function RiskSpeedometer({ score }: { score: number }) {
  const data = [
    { name: "Risk", value: score },
    { name: "Remaining", value: 100 - score }
  ];
  
  // Color based on risk level
  const getColor = (s: number) => {
    if (s < 30) return "#22c55e"; // green-500
    if (s < 60) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const color = getColor(score);
  const statusText = score >= 70 ? "HIGH RISK" : score >= 40 ? "MEDIUM RISK" : "LOW RISK";

  return (
    <div className="relative h-64 w-full flex flex-col items-center justify-end overflow-hidden pb-4">
      <div className="absolute inset-0 w-full h-[150%] -top-1/4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="90%"
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute bottom-6 flex flex-col items-center">
        <span className="text-5xl font-bold tracking-tighter" style={{ color }}>{score}%</span>
        <span className="text-sm font-semibold tracking-wider text-muted-foreground mt-1">{statusText}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [riskData, setRiskData] = useState<any>(null);
  const [schemesData, setSchemesData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedProfileStr = localStorage.getItem("sahayak_profile");
        
        let currentProfile;
        if (storedProfileStr) {
          currentProfile = JSON.parse(storedProfileStr);
        } else {
          // Default mock profile if direct access
          currentProfile = {
            age: 35,
            income: 120000,
            distance_to_csc: 15,
            documents_missing: 1,
            literacy_level: 1,
            has_internet: 1,
            caste_category: "General",
            location_type: "Rural"
          };
        }
        setProfile(currentProfile);

        const mockRisk = {
          risk_score: 45,
          risk_level: "Medium",
          top_barriers: [
            { feature: "Distance to CSC (>10km)", impact_score: 40 },
            { feature: "Documents Missing", impact_score: 35 },
            { feature: "Internet Access", impact_score: 25 }
          ]
        };

        const mockSchemes = {
          total_matches: 2,
          schemes: [
            { name: "PM Kisan Samman Nidhi", benefit: "₹6000/year direct transfer", difficulty: "Low" },
            { name: "Ayushman Bharat", benefit: "Up to ₹5 Lakh health insurance", difficulty: "Medium" }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setRiskData(mockRisk);
        setSchemesData(mockSchemes);
      } catch (error) {
        console.error("Failed to load mock data:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 5. Dashboard Top Summary Bar & Quick Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg hidden sm:block">SahayakAI Dashboard</span>
            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
            <div className="flex items-center space-x-4 text-sm font-medium">
              <span className="flex items-center text-green-500">
                <CheckCircle className="w-4 h-4 mr-1" /> {schemesData?.total_matches || 0} Schemes Matched
              </span>
              <span className="flex items-center text-amber-500">
                <AlertTriangle className="w-4 h-4 mr-1" /> {profile?.documents_missing || 0} Docs Missing
              </span>
            </div>
          </div>
          
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <Link href="/schemes" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <FileSearch className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Schemes</span>
            </Link>
            <Link href="/documents" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <HelpCircle className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Docs</span>
            </Link>
            <Link href="/map" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <MapPin className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Map</span>
            </Link>
            <Link href="/grievances" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <AlertTriangle className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Grievances</span>
            </Link>
            <Link href="/tracker" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <CheckCircle className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Tracker</span>
            </Link>
            <Link href="/analytics" className="px-2 sm:px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center whitespace-nowrap">
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <RadarScanner />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Gauge & Summary */}
              <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 transition-colors ${riskData?.risk_level === 'High' ? 'bg-red-500/10 group-hover:bg-red-500/20' : riskData?.risk_level === 'Medium' ? 'bg-yellow-500/10 group-hover:bg-yellow-500/20' : 'bg-green-500/10 group-hover:bg-green-500/20'}`} />
                  <h3 className="text-lg font-bold mb-2">Access Risk Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">Probability of facing barriers during application.</p>
                  
                  <RiskSpeedometer score={riskData?.risk_score || 0} />
                  
                  {riskData?.risk_level !== 'Low' && (
                    <div className={`mt-6 p-4 border-l-4 rounded-lg shadow-sm ${riskData?.risk_level === 'High' ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'}`}>
                      <h4 className={`${riskData?.risk_level === 'High' ? 'text-red-700' : 'text-yellow-700'} font-bold flex items-center mb-1`}>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Dhyan Dein (Warning)
                      </h4>
                      <p className={`text-sm ${riskData?.risk_level === 'High' ? 'text-red-600' : 'text-yellow-700'} font-medium leading-relaxed`}>
                        Aapka application risk {riskData?.risk_level} hai. Kripya niche diye gaye barriers ko pehle theek karein taaki form reject na ho.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors py-2.5 rounded-lg text-sm font-medium flex items-center justify-center">
                      <FileSearch className="w-4 h-4 mr-2" /> View Matched Schemes
                    </button>
                    <button className="w-full bg-secondary/30 hover:bg-secondary/50 border border-border transition-colors py-2.5 rounded-lg text-sm font-medium flex items-center justify-center">
                      <Navigation className="w-4 h-4 mr-2" /> Find Nearest CSC
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: SHAP Breakdown & Recommendations */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                {/* 3. SHAP Barrier Decomposition Breakdown */}
                <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-1">Barrier Decomposition</h3>
                  <p className="text-sm text-muted-foreground mb-6">AI analysis of primary factors contributing to your risk score.</p>
                  
                  <div className="space-y-5">
                    {riskData?.top_barriers?.map((factor: any, idx: number) => {
                      // Map icons and colors dynamically
                      let icon = "⚠️";
                      let color = "bg-orange-500";
                      if (factor.feature.includes("Document")) { icon = "❌"; color = "bg-red-500"; }
                      if (factor.feature.includes("Distance")) { icon = "📍"; color = "bg-yellow-500"; }
                      if (factor.feature.includes("Internet")) { icon = "🌐"; color = "bg-blue-500"; }

                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium flex items-center">
                              <span className="mr-2 text-base">{icon}</span> {factor.feature}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground">{factor.impact_score}% impact</span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${factor.impact_score * 2}%` }} // exaggerated visually
                              transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                              className={`h-full ${color} rounded-full`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Eligible Schemes Display */}
                <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <span className="text-xl mr-2">🎯</span> Eligible Schemes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {schemesData?.schemes?.length > 0 ? (
                      schemesData.schemes.map((scheme: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5 text-primary"><FileSearch className="w-5 h-5" /></div>
                            <div>
                              <h4 className="font-semibold text-sm mb-1">{scheme.name}</h4>
                              <p className="text-xs text-muted-foreground mb-1">{scheme.benefit}</p>
                              <div className="flex items-center justify-between mt-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${scheme.difficulty === 'Low' ? 'bg-green-100 text-green-700' : scheme.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {scheme.difficulty} Difficulty
                                </span>
                                <button className="text-xs font-bold text-primary hover:underline">Apply Now &rarr;</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No matching schemes found based on your profile.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
