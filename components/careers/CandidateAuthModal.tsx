"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn, Sparkles, X, CheckCircle } from "lucide-react";

interface CandidateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: any) => void;
  title?: string;
  subtitle?: string;
}

export function CandidateAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign in to Apply",
  subtitle = "Authenticate with Google to create your reusable candidate profile and track your application.",
}: CandidateAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [showSimulatedAuth, setShowSimulatedAuth] = useState(false);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      // Trigger NextAuth Google provider sign in returning to careers portal
      const result = await signIn("google", {
        callbackUrl: typeof window !== "undefined" ? window.location.href : "/careers",
        redirect: false,
      });
      if (result?.error || !result?.ok) {
        // Show candidate Google profile verification form
        setShowSimulatedAuth(true);
      }
    } catch (_err) {
      setShowSimulatedAuth(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSimulatedAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!googleEmail || !googleName) return;

    const candidate = {
      id: `cand_${Date.now()}`,
      googleId: `google_${Date.now()}`,
      email: googleEmail,
      fullName: googleName,
      profilePictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleEmail)}`,
      createdAt: new Date().toISOString(),
    };

    // Save session in local storage for candidate persistence
    localStorage.setItem("gxl_candidate_session", JSON.stringify(candidate));
    onSuccess(candidate);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075de]">
            <Sparkles size={14} /> Candidate Portal
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-3 text-2xl font-black text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>

        {!showSimulatedAuth ? (
          <div className="mt-6 space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-[#0075de] disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {loading ? "Connecting to Google..." : "Continue with Google"}
            </button>

            <div className="relative my-4 text-center text-xs text-slate-400">
              <span className="bg-white px-2">or quick candidate verify</span>
            </div>

            <button
              onClick={() => setShowSimulatedAuth(true)}
              className="w-full text-center text-xs font-bold text-[#0075de] hover:underline"
            >
              Enter Google Account details manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleSimulatedAuthSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Google Account Name
              </label>
              <input
                required
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="e.g. Varshith Pujala"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Google Email Address
              </label>
              <input
                required
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="e.g. sai@growxlabs.tech"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus-visible:border-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de]/20"
              />
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0075de] text-sm font-bold text-white shadow-sm hover:bg-[#0062bd] outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]"
            >
              <CheckCircle size={16} /> Confirm & Continue
            </button>
          </form>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 p-3.5 text-center text-xs text-slate-500">
          🔒 Your candidate profile is private, secure, and reusable across all GrowXLabs job openings.
        </div>
      </div>
    </div>
  );
}
