import type { Metadata } from "next";
import { ReactNode } from "react";
import { ThemeProvider } from "./providers";
import GovBanner from "@/components/GovBanner";
import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import AIAssistantWidget from "../components/AIAssistantWidget";
import { LanguageProvider } from "@/context/LanguageContext";
import RefreshRedirect from "@/components/RefreshRedirect";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahayakAI - National Welfare Access Platform | भारत सरकार",
  description: "Bridging the Welfare Access Divide with Explainable AI & CSC Hubs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-800 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          <LanguageProvider>
            <RefreshRedirect />
            {/* Main App Shell Container */}
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <GovBanner />
              <Navbar />
              <TickerBar />
              <main className="flex-1">
                {children}
              </main>
              <AIAssistantWidget />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
