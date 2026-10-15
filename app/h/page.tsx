"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  RefreshCw, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from "lucide-react";

export default function HealthcareAccessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // If already authenticated and session is active, route to /workspace/h
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.replace("/workspace/h");
    }
  }, [status, session, router]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus code input when transitioning to code step
  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRef.current?.focus(), 80);
    }
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/h/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownSeconds) {
          setCooldown(data.cooldownSeconds);
        }
        throw new Error(data.error || "Unable to send verification code. Please try again.");
      }

      setStep("code");
      setInfoMessage(`A single-use verification code was sent to ${cleanEmail}.`);
      setCooldown(data.cooldownSeconds || 60);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        code: cleanCode,
        type: "healthcare_otp",
        redirect: false,
        callbackUrl: "/workspace/h",
      });

      if (!res || res.error) {
        throw new Error(res?.error || "Invalid or expired verification code. Please try again.");
      }

      // Successful authentication -> navigate directly to Healthcare Workspace
      router.replace("/workspace/h");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check your code and try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    await handleSendCode({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200 font-sans relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-sky-500/10 via-emerald-500/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-emerald-500/5 blur-[140px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/5 blur-[160px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-7 flex items-center justify-between">
        <Link 
          href="/"
          className="group flex items-center gap-1.5 transition-opacity hover:opacity-90"
        >
          <span className="font-serif text-xl tracking-tight text-white font-medium">GrowX</span>
          <span className="font-sans text-xl font-normal text-neutral-400">Labs</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium tracking-wide">Healthcare Lead Portal</span>
          </div>
          
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to site</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto px-5 py-8 flex-1 flex flex-col justify-center">
        <div className="relative">
          {/* Card outer soft glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent rounded-2xl blur-xl opacity-60" />

          {/* Main Card */}
          <div className="relative bg-[#0A0E17]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 sm:p-9 shadow-2xl space-y-6 overflow-hidden">
            
            {/* Top accent gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500" />

            {/* Header info */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Passwordless Access</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Lead Manager Access
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {step === "email"
                    ? "Enter your registered GrowX email to receive an instant single-use sign-in code."
                    : "Enter the 6-digit authentication code sent to your email inbox."}
                </p>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-normal">{error}</div>
              </div>
            )}

            {infoMessage && !error && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-normal">{infoMessage}</div>
              </div>
            )}

            {/* Step 1: Email Form */}
            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="work-email" 
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Authorized Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="work-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@growxlabs.tech"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111724] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-sm shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send single-use code</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-neutral-950" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verification Code Form */
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="otp-code" 
                      className="block text-xs font-medium text-neutral-300"
                    >
                      6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setError(null);
                        setInfoMessage(null);
                        setCode("");
                      }}
                      className="text-xs text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      ref={codeInputRef}
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setCode(val);
                      }}
                      placeholder="······"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#111724] border border-white/15 text-white text-center font-mono text-2xl tracking-[0.45em] placeholder-neutral-600 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.trim().length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-sm shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Access Workspace</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-neutral-950" />
                    </>
                  )}
                </button>

                {/* Resend Action */}
                <div className="text-center pt-1">
                  {cooldown > 0 ? (
                    <span className="text-xs text-neutral-500 font-mono">
                      Resend available in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend code</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Single-use OTP · 10-minute expiry · Rate-limited</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          <span>© {new Date().getFullYear()} GrowX Labs · Healthcare Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Employee OS</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
