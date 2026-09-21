"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning, Send, AlertCircle, CheckCircle2, Clock, ShieldAlert, ArrowRight } from "lucide-react";

type AnalysisState = "idle" | "analyzing" | "complete";

export default function GrievanceAnalyzerPage() {
  const [grievanceText, setGrievanceText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");

  const handleAnalyze = () => {
    if (!grievanceText.trim()) return;
    
    setAnalysisState("analyzing");
    
    // Simulate AI API call
    setTimeout(() => {
      setAnalysisState("complete");
    }, 2500);
  };

  const resetForm = () => {
    setGrievanceText("");
    setAnalysisState("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquareWarning className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">AI Grievance Analyzer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Facing an issue accessing benefits?</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe your problem in plain language. Our AI will classify the issue, assess its severity, and route it to the correct department with an actionable solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <h2 className="font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary" /> Describe Your Problem
              </h2>
              
              <textarea 
                value={grievanceText}
                onChange={(e) => setGrievanceText(e.target.value)}
                disabled={analysisState !== "idle"}
                placeholder="Example: I visited the Tehsil office yesterday but the official refused to accept my application saying my digital signature is invalid..."
                className="w-full h-40 p-4 bg-background border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Supported Languages: English, Hindi, Hinglish</span>
                
                {analysisState === "idle" ? (
                  <button 
                    onClick={handleAnalyze}
                    disabled={!grievanceText.trim()}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze Issue <Send className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button 
                    onClick={resetForm}
                    className="border border-input bg-transparent px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-background shadow-sm transition-colors"
                  >
                    Start New
                  </button>
                )}
              </div>

              {/* Scanning Overlay */}
              <AnimatePresence>
                {analysisState === "analyzing" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="font-medium text-primary animate-pulse">Running NLP classification...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Quick Tips */}
            <div className="flex gap-4 p-4 bg-secondary/30 rounded-xl border border-secondary">
              <ShieldAlert className="w-6 h-6 text-secondary-foreground shrink-0" />
              <p className="text-sm text-secondary-foreground/80">
                <strong className="text-secondary-foreground">Confidentiality Assured:</strong> Your personal identity is masked before being sent to the AI analysis engine to protect your privacy.
              </p>
            </div>
          </div>

          {/* Analysis Results Section */}
          <div className="md:col-span-5">
            <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm h-full min-h-[400px] flex flex-col">
              <h2 className="font-semibold mb-6 border-b border-primary/10 pb-4">AI Analysis Report</h2>
              
              {analysisState === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center">
                  <MessageSquareWarning className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm max-w-[200px]">Submit a grievance on the left to see the AI breakdown here.</p>
                </div>
              )}

              {analysisState === "analyzing" && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="space-y-4 w-full">
                    <div className="h-4 bg-primary/5 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-primary/5 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-primary/5 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              )}

              {analysisState === "complete" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Severity Level</span>
                      <p className="font-bold text-lg text-foreground mt-1 flex items-center">High <AlertCircle className="w-4 h-4 ml-1 text-red-500" /></p>
                    </div>
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Category</span>
                      <p className="font-bold text-sm text-foreground mt-1">Staff Behavior / Refusal</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Root Cause Analysis</span>
                    <p className="text-sm bg-secondary/10 p-3 rounded-lg border border-primary/10">
                      The official wrongly rejected the digital signature. Digital signatures are legally valid under the IT Act for Aadhaar-based e-KYC verifications.
                    </p>
                  </div>

                  <div className="flex-1" />

                  <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-4">
                    <h4 className="font-bold text-green-500 mb-3 flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Suggested Next Action
                    </h4>
                    <p className="text-sm text-foreground/90 mb-4">
                      File a formal escalation to the District Nodal Officer attached with the IT Act reference generated by AI.
                    </p>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
                      Auto-Generate Draft <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
