"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronRight, CheckCircle2, XCircle, FileText, Download, AlertTriangle } from "lucide-react";

// Mock Data
const SCHEMES = [
  {
    id: 1,
    title: "PM Awas Yojana (PMAY)",
    category: "Housing",
    matchPercentage: 92,
    status: "Eligible",
    description: "Financial assistance for building a pucca house in rural and urban areas.",
    missingDocs: [],
  },
  {
    id: 2,
    title: "Ayushman Bharat PM-JAY",
    category: "Healthcare",
    matchPercentage: 85,
    status: "Action Required",
    description: "Health insurance cover of up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.",
    missingDocs: ["Updated Ration Card", "Aadhaar Card Linked Mobile"],
  },
  {
    id: 3,
    title: "PM Kisan Samman Nidhi",
    category: "Agriculture",
    matchPercentage: 45,
    status: "Not Eligible",
    description: "Income support of ₹6000 per year to all landholding farmer families.",
    missingDocs: ["Land Ownership Proof (Khatauni)", "Bank Account linked with Aadhaar"],
  },
  {
    id: 4,
    title: "National Social Assistance Programme",
    category: "Pension",
    matchPercentage: 98,
    status: "Eligible",
    description: "Financial assistance to the elderly, widows, and persons with disabilities in the form of social pensions.",
    missingDocs: [],
  }
];

export default function SchemeExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedScheme, setSelectedScheme] = useState<typeof SCHEMES[0] | null>(null);

  const categories = ["All", "Housing", "Healthcare", "Agriculture", "Pension"];

  const filteredSchemes = useMemo(() => {
    return SCHEMES.filter(scheme => {
      const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Scheme Explorer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background shadow-sm border-border hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSchemes.map((scheme, idx) => (
              <motion.div
                key={scheme.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="bg-background shadow-sm border border-primary/10 rounded-2xl overflow-hidden hover:bg-primary/5 transition-colors cursor-pointer group flex flex-col"
                onClick={() => setSelectedScheme(scheme)}
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                      {scheme.category}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-bold ${
                        scheme.matchPercentage >= 80 ? "text-green-500" : 
                        scheme.matchPercentage >= 50 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {scheme.matchPercentage}%
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">Match</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {scheme.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {scheme.description}
                  </p>
                </div>
                
                <div className="px-5 py-3 border-t border-primary/10 bg-secondary/10 flex justify-between items-center">
                  <span className={`text-xs font-medium flex items-center ${
                    scheme.status === "Eligible" ? "text-green-500" :
                    scheme.status === "Not Eligible" ? "text-red-500" : "text-amber-500"
                  }`}>
                    {scheme.status === "Eligible" ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                     scheme.status === "Not Eligible" ? <XCircle className="w-3 h-3 mr-1" /> :
                     <AlertTriangle className="w-3 h-3 mr-1" />}
                    {scheme.status}
                  </span>
                  <span className="text-primary text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No schemes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>

      {/* Scheme Detail Modal (Simulated overlay) */}
      <AnimatePresence>
        {selectedScheme && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedScheme(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-semibold uppercase tracking-wider mb-2 inline-block">
                    {selectedScheme.category}
                  </span>
                  <h2 className="text-2xl font-bold">{selectedScheme.title}</h2>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
                  selectedScheme.matchPercentage >= 80 ? "border-green-500/30 text-green-500 bg-green-500/10" : 
                  selectedScheme.matchPercentage >= 50 ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : 
                  "border-red-500/30 text-red-500 bg-red-500/10"
                }`}>
                  {selectedScheme.matchPercentage}% Match
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground text-sm mb-6">{selectedScheme.description}</p>
                
                {/* Actionable Eligibility Gap Banner */}
                {selectedScheme.missingDocs.length > 0 ? (
                  <div className="mb-6 border border-amber-500/30 bg-amber-500/5 rounded-xl p-4">
                    <h4 className="font-bold text-amber-500 flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Action Required for Eligibility
                    </h4>
                    <p className="text-sm text-foreground/80 mb-4">
                      You are missing the following mandatory documents to successfully apply for this scheme:
                    </p>
                    <ul className="space-y-3 mb-4">
                      {selectedScheme.missingDocs.map((doc, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2">
                      <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Download Blank Form
                      </button>
                      <button className="flex-1 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <FileText className="w-4 h-4 mr-2" /> View Requirements
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 border border-green-500/30 bg-green-500/5 rounded-xl p-4 flex items-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mr-4 shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-500 mb-1">Ready to Apply</h4>
                      <p className="text-sm text-foreground/80">You have all required documents based on your profile.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  Close
                </button>
                <button 
                  disabled={selectedScheme.missingDocs.length > 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
