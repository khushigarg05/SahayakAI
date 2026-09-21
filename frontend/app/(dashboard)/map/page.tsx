"use client";

import dynamic from "next/dynamic";
import { MapPin, Search, Navigation } from "lucide-react";
import { useState } from "react";

// DYNAMIC IMPORT: Lazy loading Leaflet to prevent SSR issues and reduce initial bundle size
const AssistanceMap = dynamic(() => import('@/components/map/DynamicMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-secondary/20 animate-pulse rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-muted-foreground">
      <MapPin className="w-10 h-10 mb-4 opacity-50 animate-bounce" />
      <p>Loading Map Resources...</p>
    </div>
  )
});

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Assistance Map</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: Search & List */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
          <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-5 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-4">Find Nearby Help</h2>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search CSC, Tehsil, Kiosks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nearest Centers</h3>
              
              {/* List items mimicking the map data */}
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-primary">CSC Center Rampur</h4>
                  <span className="text-[10px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">2.1 km</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Common Service Center</p>
                <div className="flex items-center text-xs text-foreground/80">
                  <Navigation className="w-3 h-3 mr-1" /> Est. Wait: 15 mins
                </div>
              </div>

              <div className="p-3 rounded-xl border border-primary/10 hover:border-primary/10 bg-background shadow-sm transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">Tehsil Office Janakpuri</h4>
                  <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">3.5 km</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Govt Office</p>
                <div className="flex items-center text-xs text-foreground/80">
                  <Navigation className="w-3 h-3 mr-1" /> Est. Wait: 45 mins
                </div>
              </div>

            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm">
            <h4 className="font-semibold text-amber-500 mb-1">Why visit a center?</h4>
            <p className="text-muted-foreground text-xs">
              Centers can help you print missing documents, fill out complex forms, and resolve biometric authentication issues.
            </p>
          </div>
        </div>

        {/* Right Content: The Map */}
        <div className="flex-1 min-h-[500px] bg-background shadow-sm rounded-2xl relative z-0">
          {/* We wrap it in a container so the dynamic map spans full height */}
          <AssistanceMap />
        </div>

      </main>
    </div>
  );
}
