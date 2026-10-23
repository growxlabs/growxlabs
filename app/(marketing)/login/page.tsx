"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password. Please verify your credentials.");
        setLoading(false);
        return;
      }

      router.push(result?.url || callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please check your credentials.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#A2BECC] text-[#17252D] flex flex-col justify-between selection:bg-[#17252D] selection:text-[#FAFCFD]">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link 
          href="/"
          className="text-lg font-bold tracking-tight text-[#17252D] hover:text-[#55788D] transition-colors flex items-center gap-1.5 font-sans"
        >
          <span className="font-serif">GrowX</span>
          <span className="font-normal text-[#55788D]">Labs</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-[#55788D] hover:text-[#17252D] transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to website</span>
        </Link>
      </header>

      {/* Main Corporate Card */}
      <main className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#F4F8FA] border border-[#D5E2E9] rounded-2xl p-8 sm:p-10 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[#17252D] font-sans">
              Sign in to your account
            </h1>
            <p className="text-sm text-[#55788D] leading-normal font-sans">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-xs font-bold text-[#17252D] font-mono uppercase tracking-wider"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@company.com"
                className="w-full h-11 rounded-xl bg-[#FAFCFD] border border-[#D5E2E9] px-3.5 text-sm text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-all"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold text-[#17252D] font-mono uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full h-11 rounded-xl bg-[#FAFCFD] border border-[#D5E2E9] px-3.5 text-sm text-[#17252D] placeholder-[#55788D]/40 focus:outline-none focus:border-[#17252D] transition-all"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-10.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 7.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#A2BECC] text-[#17252D] text-sm font-bold hover:bg-[#17252D] hover:text-[#FAFCFD] transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer border border-[#55788D]/30 shadow-sm font-sans"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-[#17252D]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Quiet Support Info */}
          <div className="pt-4 border-t border-[#D5E2E9] text-center">
            <p className="text-xs text-[#55788D]">
              Need access? Contact{" "}
              <a 
                href="mailto:support@growxlabs.tech" 
                className="text-[#17252D] font-bold hover:underline transition-colors"
              >
                support@growxlabs.tech
              </a>
            </p>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-[#55788D] font-mono">
        <p>© {new Date().getFullYear()} GrowXLabs. All rights reserved.</p>
      </footer>
    </div>
  );
}
