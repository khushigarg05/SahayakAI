"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Search, Loader2 } from "lucide-react";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export default function DocumentAssistantPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanProgress, setScanProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setScanStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const simulateScan = () => {
    setScanStatus("scanning");
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus("success");
          return 100;
        }
        return prev + 5;
      });
    }, 150); // Takes about 3 seconds to complete
  };

  const removeFile = () => {
    setFile(null);
    setScanStatus("idle");
    setScanProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Document Assistant</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">100% On-Device Processing</span>
            <span className="font-medium sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Upload Area */}
          <div className="space-y-6">
            <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2">Upload Document</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your Aadhaar, PAN, or Income Certificate. Our AI will automatically extract details and check for missing information.
              </p>

              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-background shadow-sm"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                    <FileUp className="h-8 w-8" />
                  </div>
                  <p className="font-medium mb-1">Drag & drop your file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse from your device</p>
                  <p className="text-xs text-muted-foreground mt-4">Supports JPG, PNG, PDF up to 5MB</p>
                </div>
              ) : (
                <div className="border border-border rounded-xl p-6 bg-background shadow-sm relative overflow-hidden">
                  {/* File preview stub */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded bg-primary/20 flex items-center justify-center text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {scanStatus === "idle" && (
                      <button 
                        onClick={removeFile}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Scanning Progress */}
                  {scanStatus === "scanning" && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-primary">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting details...
                        </span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Scan Button */}
                  {scanStatus === "idle" && (
                    <button
                      onClick={simulateScan}
                      className="w-full mt-6 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                    >
                      <Search className="w-4 h-4 mr-2" /> Start OCR Scan
                    </button>
                  )}

                  {/* Scanning Overlay Effect */}
                  <AnimatePresence>
                    {scanStatus === "scanning" && (
                      <motion.div
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-8 bg-gradient-to-b from-transparent via-primary/30 to-transparent pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Privacy Badge */}
            <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-500">Privacy by Design</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Files are processed completely on your device. No images are uploaded to our servers, and extracted data is auto-purged after session ends.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Analysis */}
          <div className="space-y-6">
            <div className="bg-background shadow-sm border border-primary/10 rounded-2xl p-6 backdrop-blur-sm min-h-[400px] flex flex-col">
              <h2 className="text-xl font-bold mb-6">Extraction Results</h2>
              
              {scanStatus === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Upload and scan a document to see extracted details here.</p>
                </div>
              )}

              {scanStatus === "scanning" && (
                <div className="flex-1 flex flex-col items-center justify-center text-primary text-center">
                  <Search className="w-12 h-12 mb-4 opacity-50 animate-pulse" />
                  <p className="animate-pulse">Analyzing text patterns...</p>
                </div>
              )}

              {scanStatus === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-green-500">Document Verified: Aadhaar Card</h4>
                      <p className="text-xs text-muted-foreground mt-1">Confidence score: 98%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Extracted Information</span>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-primary/10">
                          <span className="text-sm text-foreground/80">Name</span>
                          <span className="text-sm font-medium">Ram Kumar</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-primary/10">
                          <span className="text-sm text-foreground/80">DOB</span>
                          <span className="text-sm font-medium">12-05-1980</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-primary/10">
                          <span className="text-sm text-foreground/80">Aadhaar No. (Masked)</span>
                          <span className="text-sm font-medium tracking-widest text-primary">XXXX-XXXX-4589</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" /> Missing Information
                      </span>
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-500">
                          Fathers Name could not be read clearly due to poor lighting. This might cause issues in dependent scheme applications.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Save Details to Profile
                  </button>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
