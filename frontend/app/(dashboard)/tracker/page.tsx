"use client";

import { motion } from "framer-motion";
import { ListChecks, CheckCircle2, Clock, UploadCloud, Landmark as Bank, FileSignature, ArrowRight, LucideIcon } from "lucide-react";

type TrackingStep = {
  name: string;
  date: string;
  completed: boolean;
  icon: LucideIcon;
  current?: boolean;
  error?: string;
};

type TrackingApp = {
  id: string;
  schemeName: string;
  status: string;
  progress: number;
  steps: TrackingStep[];
};

const TRACKING_DATA: TrackingApp[] = [
  {
    id: "APP-9823",
    schemeName: "PM Awas Yojana (PMAY)",
    status: "Processing",
    progress: 60,
    steps: [
      { name: "Application Submitted", date: "12 Oct 2024", completed: true, icon: FileSignature },
      { name: "Documents Verified", date: "15 Oct 2024", completed: true, icon: CheckCircle2 },
      { name: "Physical Verification", date: "In Progress", completed: false, icon: Clock, current: true },
      { name: "Fund Sanctioned", date: "Pending", completed: false, icon: Bank },
    ]
  },
  {
    id: "APP-5510",
    schemeName: "Ayushman Bharat PM-JAY",
    status: "Action Required",
    progress: 25,
    steps: [
      { name: "Application Submitted", date: "18 Oct 2024", completed: true, icon: FileSignature },
      { name: "Documents Verified", date: "Action Required", completed: false, icon: UploadCloud, current: true, error: "Income Certificate rejected due to blurriness." },
      { name: "Card Issued", date: "Pending", completed: false, icon: CheckCircle2 },
    ]
  }
];

export default function ApplicationTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center space-x-2">
          <ListChecks className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Application Tracker</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Track Your Progress</h1>
          <p className="text-muted-foreground">Monitor the real-time status of your welfare scheme applications.</p>
        </div>

        {TRACKING_DATA.map((application, appIndex) => (
          <motion.div 
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: appIndex * 0.1 }}
            className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{application.schemeName}</h2>
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                    application.status === "Action Required" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {application.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Application ID: {application.id}</p>
              </div>
              
              <div className="w-full md:w-48 text-right">
                <div className="flex justify-between text-xs mb-1">
                  <span>Overall Progress</span>
                  <span className="font-bold">{application.progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${application.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${application.status === "Action Required" ? "bg-red-500" : "bg-primary"}`}
                  />
                </div>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-4 md:pl-8 space-y-8">
              {/* Timeline Connector Line */}
              <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-px bg-primary/5" />

              {application.steps.map((step, stepIndex) => {
                const Icon = step.icon;
                return (
                  <div key={stepIndex} className="relative flex items-start group">
                    
                    {/* Status Node */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      step.completed 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : step.current
                          ? application.status === "Action Required"
                            ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                            : "bg-primary/20 border-primary text-primary animate-pulse"
                          : "bg-background border-primary/20 text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Step Details */}
                    <div className="ml-6 flex-1 pt-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <h4 className={`font-semibold ${step.current && application.status === "Action Required" ? "text-red-500" : step.completed || step.current ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.name}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1 md:mt-0 font-medium">
                          {step.date}
                        </span>
                      </div>
                      
                      {step.error && (
                        <div className="mt-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start justify-between">
                          <p className="text-sm text-red-500 pr-4">{step.error}</p>
                          <button className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors shrink-0">
                            Re-upload
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {application.status !== "Action Required" && (
              <div className="mt-8 pt-6 border-t border-primary/10 flex justify-end">
                 <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center">
                    View Submitted Application <ArrowRight className="w-4 h-4 ml-1" />
                 </button>
              </div>
            )}
          </motion.div>
        ))}

      </main>
    </div>
  );
}
