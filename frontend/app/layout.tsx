import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import { ThemeProvider } from "./providers";
import AIAssistantWidget from "../components/AIAssistantWidget";
import VoiceAssistant from "./components/VoiceAssistant";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SahayakAI - Predictive Welfare Access",
  description: "Bridging the Welfare Access Gap with Predictive AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          {/* Main App Container */}
          <div className="relative flex min-h-screen flex-col">
            {/* Header placeholder - will add NavBar later */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                  <Link className="mr-6 flex items-center space-x-2" href="/">
                    <span className="hidden font-bold sm:inline-block">SahayakAI</span>
                  </Link>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <AIAssistantWidget />
            <VoiceAssistant />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
