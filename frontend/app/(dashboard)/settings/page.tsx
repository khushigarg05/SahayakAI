"use client";

import { useState } from "react";
import { Settings, Shield, Globe, Bell, Trash2, CheckCircle2, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "privacy">("general");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Settings & Privacy</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
              activeTab === "general" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "hover:bg-background shadow-sm text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4 mr-3" /> General Preferences
          </button>
          
          <button 
            onClick={() => setActiveTab("privacy")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
              activeTab === "privacy" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "hover:bg-background shadow-sm text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4 mr-3" /> Security & Data Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "general" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Globe className="w-5 h-5 mr-2 text-primary" /> Language & Localization</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-2 block">App Language</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>English</option>
                      <option>Hindi (हिंदी)</option>
                      <option>Marathi (मराठी)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">Changing the language will reload the application.</p>
                  </div>
                </div>
              </div>

              <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Bell className="w-5 h-5 mr-2 text-primary" /> Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Scheme Deadlines</p>
                      <p className="text-xs text-muted-foreground">Get alerted when an eligible scheme is closing.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div>
                      <p className="font-medium text-sm">Application Status Updates</p>
                      <p className="text-xs text-muted-foreground">Receive SMS when your application status changes.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start space-x-3 mb-6">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-500 text-sm">Privacy by Design Architecture</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    SahayakAI uses Federated Learning and on-device NLP processing. Your personal identifying information (PII) never leaves your device without explicit consent.
                  </p>
                </div>
              </div>

              <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Key className="w-5 h-5 mr-2 text-primary" /> Data Access Control</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Allow AI Model Training</p>
                      <p className="text-xs text-muted-foreground max-w-md">Anonymized usage data helps us improve the scheme matching algorithms. No PII is shared.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-red-500 flex items-center"><Trash2 className="w-5 h-5 mr-2" /> Danger Zone</h2>
                <p className="text-sm text-foreground/80 mb-4">Permanently delete all your local cached documents, profile data, and OCR scans.</p>
                
                <button className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" /> Erase All Local Data
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
