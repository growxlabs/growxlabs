"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, FileSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CandidateLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"otp" | "reference">("otp");

  // OTP Login State
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  // Reference Lookup State
  const [reference, setReference] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => { if (otpSent) otpInputRef.current?.focus(); const value = new URLSearchParams(window.location.search).get("redirect"); if (value?.startsWith("/careers/")) setRedirectTo(value); }, [otpSent]);

  const handleSendOtp = async (e: React.FormEvent, emailOverride?: string) => {
    e.preventDefault();
    const loginEmail = (emailOverride || email).trim().toLowerCase();
    if (!loginEmail || !loginEmail.includes("@")) return;

    try {
      setLoading(true);
      setMsg("");
      setIsError(false);

      const res = await fetch("/api/v1/candidate/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setEmail(loginEmail);
      setOtpSent(true);
      setMsg(`We sent a 6-digit code to ${loginEmail.replace(/^(.{2}).*(@.*)$/, "$1***$2")}.`);
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

      setMsg("Signed in successfully.");
      router.replace(redirectTo || "/careers/dashboard");
    } catch (err: any) {
      setIsError(true);
      setMsg(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reference.trim() && refEmail.trim()) {
      await handleSendOtp({ preventDefault: () => undefined } as React.FormEvent, refEmail.trim());
      setActiveTab("otp");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5 text-sm"><Link href="/careers" className="font-bold text-slate-900">GrowXLabs Careers</Link><div className="flex gap-5"><a href="mailto:recruitment@growxlabs.tech" className="text-slate-600 hover:text-slate-900">Help</a><Link href="/careers" className="font-semibold text-[#0075de]">Return to Careers</Link></div></header>
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
        <section className="hidden bg-slate-50 p-10 md:block"><p className="text-sm font-semibold text-[#0075de]">Welcome back</p><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Your candidate portal</h1><p className="mt-4 max-w-sm text-base leading-7 text-slate-600">Track applications, interviews, assessments, offers, and messages in one secure place.</p></section>
      <div className="w-full space-y-6 p-6 sm:p-10">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/careers" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-[#0075de] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">GrowXLabs</span>
          </Link>
          <p className="text-xs font-semibold text-[#0075de]">GrowXLabs Careers</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Sign in to your portal</h1>
          <p className="text-sm text-slate-500">Use the email address from your application.</p>
        </div>

        {/* Card */}
        <div className="space-y-6">
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
              Sign in with email
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
              Find an application
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
                        ref={otpInputRef}
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="6-digit verification code"
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono tracking-widest text-center font-bold text-slate-900 caret-[#0075de] focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-3.5 rounded-2xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Verify and continue
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
                  Application reference
                </label>
                <div className="relative">
                  <FileSearch size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="GXL-APP-2026-00002"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0075de]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email address
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
                Send secure login code <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div></div></div>
    </main>
  );
}
