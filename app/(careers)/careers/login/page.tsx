"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, FileSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CandidateLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"otp" | "reference">("otp");

  // OTP Login State
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  // Reference Lookup State
  const [reference, setReference] = useState("");
  const [refEmail, setRefEmail] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    try {
      setLoading(true);
      setMsg("");
      setIsError(false);

      const res = await fetch("/api/v1/candidate/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setOtpSent(true);
      setMsg("Verification code sent! Check your inbox.");
    } catch (err: any) {
      setIsError(true);
      setMsg(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return;

    try {
      setLoading(true);
      setMsg("");
      setIsError(false);

      const res = await fetch("/api/v1/candidate/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setMsg("Login successful! Redirecting to portal...");
      setTimeout(() => {
        router.push("/careers/portal");
      }, 1000);
    } catch (err: any) {
      setIsError(true);
      setMsg(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reference.trim() && refEmail.trim()) {
      router.push(`/careers/application/${encodeURIComponent(reference.trim())}?email=${encodeURIComponent(refEmail.trim())}`);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-[#f8fafc]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/careers" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-[#0075de] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">GrowXLabs</span>
          </Link>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#0075de]">Candidate Portal Auth</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Track Your Hiring Progress</h1>
          <p className="text-xs text-slate-500">Log in to view interview schedules, assessments, offer letters, and messages.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("otp");
                setMsg("");
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "otp" ? "bg-white text-[#0075de] shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Email + OTP Login
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("reference");
                setMsg("");
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "reference" ? "bg-white text-[#0075de] shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Reference Lookup
            </button>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium border flex items-center gap-2 ${
                isError ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              {isError ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
              <span>{msg}</span>
            </div>
          )}

          {/* TAB 1: OTP Login Form */}
          {activeTab === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Applicant Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Enter the email you used when submitting your job application.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3.5 rounded-2xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />} Send Login Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[10px] font-bold text-[#0075de] hover:underline cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        required
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-3.5 rounded-2xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Verify & Access Portal
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Reference Lookup Form */}
          {activeTab === "reference" && (
            <form onSubmit={handleReferenceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Application Reference Number *
                </label>
                <div className="relative">
                  <FileSearch size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. APP-2026-89412"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Applicant Email Address *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={refEmail}
                    onChange={(e) => setRefEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!reference.trim() || !refEmail.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                View Application Status <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
