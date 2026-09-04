"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestedCallback = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("callbackUrl") : null;
      const callbackUrl = requestedCallback && requestedCallback.startsWith("/") ? requestedCallback : "/admin";
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
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
              Sign in to your account
            </h1>
            <p className="text-sm text-neutral-400 leading-normal">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-xs font-medium text-neutral-300"
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
                className="w-full h-11 rounded-lg bg-black border border-white/15 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-medium text-neutral-300"
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
                className="w-full h-11 rounded-lg bg-black border border-white/15 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
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
              disabled={loading}
              className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer border-0 shadow-sm font-sans"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
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
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-500">
              Need access? Contact{" "}
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
