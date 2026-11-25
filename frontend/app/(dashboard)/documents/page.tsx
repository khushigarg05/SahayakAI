"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  FileUp, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Trash2,
  Lock,
  User,
  Calendar,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { verifyUploadedDocument, DocumentAuditResult } from "@/lib/api";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export default function DocumentAssistantPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [docType, setDocType] = useState<string>("Aadhaar Card");
  const [auditResult, setAuditResult] = useState<DocumentAuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setScanStatus("idle");
      setAuditResult(null);
      setErrorMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleScanDocument = async () => {
    if (!file) return;

    setScanStatus("scanning");
    setScanProgress(15);
    setErrorMessage(null);

    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 80) return prev + 15;
        return prev;
      });
    }, 180);

    try {
      const mappedDocType = docType.toLowerCase().includes("aadhaar")
        ? "aadhaar"
        : docType.toLowerCase().includes("income")
        ? "income"
        : docType.toLowerCase().includes("ration")
        ? "ration"
        : docType.toLowerCase().includes("caste")
        ? "caste"
        : "bank";

      // Real in-memory OCR & audit via FastAPI
      const result = await verifyUploadedDocument(file, mappedDocType);

      clearInterval(progressTimer);
      setScanProgress(100);
      setAuditResult(result);
      setScanStatus("success");

      // Save verified credentials to localStorage for auto-filling onboarding
      try {
        if (typeof window !== "undefined" && result.is_valid) {
          localStorage.setItem("sahayak_verified_identity", JSON.stringify({
            documentType: result.document_type,
            maskedIdentifier: result.masked_identifier,
            rawIdentifier: result.raw_identifier,
            detectedName: result.detected_name,
            detectedDob: result.detected_dob,
            detectedAge: result.detected_age,
            detectedGender: result.detected_gender,
            confidenceScore: result.confidence_score,
            verifiedAt: new Date().toISOString()
          }));
        }
      } catch (storageErr) {
        console.warn("Storage sync error:", storageErr);
      }
    } catch (err: unknown) {
      clearInterval(progressTimer);
      console.error("Document audit error:", err);
      const msg = err instanceof Error ? err.message : "Failed to audit document";
      setErrorMessage(msg);
      setScanStatus("error");
    }
  };

  const removeFile = () => {
    setFile(null);
    setScanStatus("idle");
    setScanProgress(0);
    setAuditResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* TOP TITLE HEADER */}
        <div className="bg-white border-t-4 border-t-blue-800 border-x border-b border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.documents.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{t.documents.subTag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {t.documents.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {t.documents.description}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* UPLOAD & VERIFY (7 COLS) */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              
              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.documents.selectType}
                </label>
                <select
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value);
                    setScanStatus("idle");
                    setAuditResult(null);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white cursor-pointer"
                >
                  <option value="Aadhaar Card">{t.documents.typeAadhaar}</option>
                  <option value="Income Certificate">{t.documents.typeIncome}</option>
                  <option value="BPL Ration Card">{t.documents.typeRation}</option>
                  <option value="Bank Passbook">{t.documents.typeBank}</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-700 bg-blue-50/50"
                    : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-700">
                  {isDragActive ? t.documents.dropActive : t.documents.dropIdle}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{t.documents.fileSpecs}</p>
              </div>

              {/* Uploaded File Bar */}
              {file && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {scanStatus === "idle" && (
                      <button
                        type="button"
                        onClick={handleScanDocument}
                        className="px-4 py-2 rounded-xl bg-blue-800 text-white font-bold text-xs shadow-xs hover:bg-blue-900 active:bg-blue-950 transition-all cursor-pointer"
                      >
                        {t.documents.btnVerify}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning Progress */}
              {scanStatus === "scanning" && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-blue-800">
                    <span className="flex items-center space-x-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                      <span>{t.documents.scanningNotice}</span>
                    </span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-800 transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {scanStatus === "error" && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{t.documents.scanErrorTitle || "Verification Warning"}</span>
                  </div>
                  <p className="text-[11px] text-red-700">
                    {errorMessage || t.documents.scanErrorDesc}
                  </p>
                </div>
              )}

            </div>

            {/* Privacy Compliance Note */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-xs text-blue-900 flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t.documents.privacyTitle}</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed font-medium">
                  {t.documents.privacyDesc}
                </p>
              </div>
            </div>
          </div>

          {/* VERIFICATION REPORT (5 COLS) */}
          <div className="md:col-span-5">
            {scanStatus === "success" && auditResult ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  {auditResult.is_valid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-sm text-slate-900">{t.documents.verifiedTitle}</h3>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-sm text-amber-900">Document Review Required</h3>
                    </>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Document Type */}
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">{t.documents.docLabel}</span>
                    <span className="font-bold text-slate-800">{auditResult.document_type}</span>
                  </div>

                  {/* REAL EXTRACTED IDENTIFIER (e.g. XXXX-XXXX-2134) */}
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">{t.documents.idLabel}</span>
                    {auditResult.masked_identifier ? (
                      <span className="font-mono font-bold text-blue-900 text-[13px] bg-blue-50 px-2 py-0.5 rounded">
                        {auditResult.masked_identifier}
                      </span>
                    ) : (
                      <span className="font-mono text-amber-700 text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                        Not Detected
                      </span>
                    )}
                  </div>

                  {/* Citizen Name (if detected via OCR) */}
                  {auditResult.detected_name && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">{t.documents.nameLabel || "Citizen Name:"}</span>
                      <span className="font-bold text-slate-900 flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-blue-700" />
                        <span>{auditResult.detected_name}</span>
                      </span>
                    </div>
                  )}

                  {/* Date of Birth (if detected via OCR) */}
                  {auditResult.detected_dob && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">{t.documents.dobLabel || "Date of Birth:"}</span>
                      <span className="font-bold text-slate-800 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {auditResult.detected_dob}
                          {auditResult.detected_age ? ` (${auditResult.detected_age} yrs)` : ""}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Gender (if detected) */}
                  {auditResult.detected_gender && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">{t.documents.genderLabel || "Gender:"}</span>
                      <span className="font-bold text-slate-800">{auditResult.detected_gender}</span>
                    </div>
                  )}

                  {/* Clarity Score */}
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">{t.documents.clarityLabel}</span>
                    <span className={`font-bold ${auditResult.confidence_score >= 80 ? "text-emerald-700" : "text-amber-700"}`}>
                      {auditResult.confidence_score}% ({auditResult.clarity_rating})
                    </span>
                  </div>

                  {/* Official Seal / QR Barcode */}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{t.documents.sealLabel}</span>
                    <span className={`font-bold flex items-center space-x-1 ${auditResult.hologram_or_seal_detected ? "text-emerald-700" : "text-amber-700"}`}>
                      {auditResult.hologram_or_seal_detected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.documents.sealVerified}</span>
                        </>
                      ) : (
                        <span>Needs Clearer Photo</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Audit Findings Bullet Points */}
                {auditResult.findings && auditResult.findings.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">
                      {t.documents.findingsLabel || "Statutory Audit Findings:"}
                    </p>
                    {auditResult.findings.map((f, idx) => (
                      <p key={idx} className="flex items-start space-x-1.5 leading-snug">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Recommendation Notice */}
                <div className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${
                  auditResult.is_valid 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}>
                  {auditResult.is_valid ? "✅ " : "⚠️ "}
                  {auditResult.recommendation || t.documents.validNotice}
                </div>

                {/* Direct Action Link */}
                {auditResult.is_valid ? (
                  <Link
                    href="/onboarding"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors block text-center"
                  >
                    <span>{t.documents.btnCheckEligibility}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="w-full py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Upload Clearer Photo</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2 h-full flex flex-col items-center justify-center text-slate-400 text-xs min-h-[220px]">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">{t.documents.emptyTitle}</p>
                <p>{t.documents.emptyDesc}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
