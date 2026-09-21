"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Smartphone, Shield, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"standard" | "otp">("standard");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side - Info/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 border-r border-primary/10 flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-md"
        >
          <div className="inline-flex items-center space-x-2 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SahayakAI</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Welcome Back to Your Digital Sahayak</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Access your personalized dashboard, track your welfare applications, and discover new eligibility gaps safely and securely.
          </p>
          
          <div className="space-y-4">
            {[
              "100% Privacy-Preserving On-Device OCR",
              "Automated Application Tracking",
              "Real-time Grievance Analytics"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-sm text-foreground/80">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 relative">
        <Link href="/" className="absolute top-8 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-muted-foreground">Choose how you would like to continue</p>
          </div>

          <div className="flex space-x-2 mb-8 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod("standard")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                loginMethod === "standard" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard Login
            </button>
            <button
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                loginMethod === "otp" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mobile OTP
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {loginMethod === "standard" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email Address / Aadhaar ID</label>
                  <input
                    id="email"
                    type="text"
                    placeholder="Enter your email or ID"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="password">Password</label>
                    <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    +91
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    className="flex h-12 w-full rounded-md border border-input bg-background pl-12 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  An OTP will be sent to this number for verification.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 mt-6"
            >
              {loginMethod === "standard" ? (
                <>Sign In <LogIn className="ml-2 h-4 w-4" /></>
              ) : (
                <>Send OTP <Smartphone className="ml-2 h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
