"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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
      // Redirect is handled by NextAuth redirect callback based on user role
      const requestedCallback = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("callbackUrl") : null;
      const callbackUrl = requestedCallback && requestedCallback.startsWith("/") ? requestedCallback : "/admin";
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl
      });

      if (result?.error) {
        throw new Error("Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#020202] text-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <button className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors bg-transparent border-0 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span>Back Home</span>
          </button>
        </Link>
      </div>

      {/* LEFT SIDE: Login Form (Dark Theme) */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 relative z-10 w-full max-w-xl mx-auto">
        <div className="w-full space-y-8">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start notranslate" translate="no">
            <Link href="/" className="flex items-center text-3xl font-serif text-white tracking-normal">
              GrowX<span className="text-[#C0F0FB] font-sans font-black">Labs</span>.tech
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Access your account
            </h1>
            <p className="text-neutral-400 text-xs font-mono tracking-widest uppercase">
              Secure Authentication Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="name@company.com" 
                  className="w-full h-13 rounded-lg bg-black border border-neutral-800 pl-11 pr-4 text-white text-sm focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB]/20 focus:outline-none transition-all placeholder:text-neutral-600"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••" 
                  className="w-full h-13 rounded-lg bg-black border border-neutral-800 pl-11 pr-4 text-white text-sm focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB]/20 focus:outline-none transition-all placeholder:text-neutral-600"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 flex items-start text-[12px] text-red-400 font-medium leading-tight">
                <AlertCircle className="h-4.5 w-4.5 mr-2 shrink-0 mt-0.5" /> 
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-13 rounded-lg font-black text-xs uppercase tracking-widest bg-[#C0F0FB] text-black hover:bg-[#a3e4f2] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer border-0"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AUTHENTICATING...
                </span>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <div className="text-center lg:text-left text-xs font-semibold tracking-wide text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#C0F0FB] hover:text-[#C0F0FB]/90 transition-colors underline">
              Create one here
            </Link>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Branding Handshake Image */}
      <div className="hidden lg:block relative overflow-hidden border-l border-neutral-900 h-full min-h-screen">
        <img 
          src="/images/handshake.jpg" 
          alt="GrowX Labs Partnership" 
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent pointer-events-none" />
        
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16 z-10 space-y-4 text-left">
          <h2 className="text-[36px] font-black text-white leading-tight font-serif tracking-tight">
            Go Agent-native With <span className="italic font-serif font-normal text-[#C0F0FB]">GrowXLabs</span>
          </h2>
          <p className="text-sm text-neutral-300 max-w-sm leading-relaxed font-sans font-normal">
            Partner with us to build advanced AI-native software, secure integrations, and production-grade workflow capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
