"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

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
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link 
          href="/"
          className="text-lg font-semibold tracking-tight text-white hover:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <span className="font-serif">GrowX</span>
          <span className="font-sans font-normal text-neutral-400">Labs</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to website</span>
        </Link>
      </header>

      {/* Main Corporate Card */}
      <main className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#09090b] border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Healthcare Lead Portal
            </h1>
            <p className="text-sm text-neutral-400 leading-normal">
              {step === "email"
                ? "Enter your work email to receive a single-use verification code."
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Form */}
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-1.5">
                <label 
                  htmlFor="email" 
                  className="block text-xs font-medium text-neutral-300"
                >
                  Work email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="ramubollikonda999@gmail.com"
                  className="w-full h-11 rounded-lg bg-black border border-white/15 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all font-sans"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-300 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-10.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 7.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer border-0 shadow-sm font-sans"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending code...
                  </span>
                ) : (
                  "Send verification code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="code" 
                    className="block text-xs font-medium text-neutral-300"
                  >
                    6-digit verification code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                      setInfoMessage(null);
                      setCode("");
                    }}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Change email
                  </button>
                </div>
                <input
                  ref={codeInputRef}
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  placeholder="······"
                  className="w-full h-11 rounded-lg bg-black border border-white/15 px-3.5 text-center font-mono text-xl tracking-[0.35em] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
                  disabled={loading}
                />
              </div>

              {infoMessage && !error && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.78-8.72a.75.75 0 00-1.06-1.06L7.25 8.69 5.28 6.72a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
                  </svg>
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-300 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-10.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 7.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer border-0 shadow-sm font-sans"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Continue to workspace"
                )}
              </button>

              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <p className="text-xs text-neutral-500 font-mono">
                    Resend code in {cooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-2"
                  >
                    Resend verification code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Quiet Support Info */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-500">
              Healthcare Lead Manager access ·{" "}
              <a 
                href="mailto:support@growxlabs.tech" 
                className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                support@growxlabs.tech
              </a>
            </p>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-neutral-600">
        <p>© {new Date().getFullYear()} GrowXLabs. All rights reserved.</p>
      </footer>
    </div>
  );
}
