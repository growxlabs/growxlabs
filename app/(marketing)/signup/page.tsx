"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    if (email) {
      router.push(role === "Admin" ? "/admin/leads" : "/dashboard");
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to initialize registration.");
      
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
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

      {/* LEFT SIDE: Signup Form (Dark Theme) */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 relative z-10 w-full max-w-xl mx-auto">
        <div className="w-full space-y-8">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start notranslate" translate="no">
            <Link href="/" className="flex items-center text-3xl font-serif text-white tracking-normal">
              GrowX<span className="text-[#355CFF] font-sans font-black">Labs</span>.tech
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Create your account
            </h1>
            <p className="text-neutral-400 text-xs font-mono tracking-widest uppercase">
              Partner Access Portal
            </p>
          </div>

          {success ? (
            <div className="text-center lg:text-left space-y-6 py-8">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto lg:mx-0">
                <CheckCircle2 className="h-8 w-8 text-[#C0F0FB]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white tracking-tight">Registration Initialized</h2>
                <p className="text-sm text-neutral-400">Check your inbox to verify your credentials. Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                    placeholder="John Doe" 
                    className="w-full h-13 rounded-lg bg-black border border-neutral-800 pl-11 pr-4 text-white text-sm focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB]/20 focus:outline-none transition-all placeholder:text-neutral-600"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 ml-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required 
                    placeholder="name@company.com" 
                    className="w-full h-13 rounded-lg bg-black border border-neutral-800 pl-11 pr-4 text-white text-sm focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB]/20 focus:outline-none transition-all placeholder:text-neutral-600"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 ml-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
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
                    CREATING ACCOUNT...
                  </span>
                ) : (
                  "CREATE ACCOUNT"
                )}
              </button>
            </form>
          )}

          <div className="text-center lg:text-left text-xs font-semibold tracking-wide text-neutral-400">
            Already an authorized partner?{" "}
            <Link href="/login" className="text-[#C0F0FB] hover:text-[#C0F0FB]/90 transition-colors underline">
              Sign In
            </Link>
          </div>

          {/* Social Proof Avatars */}
          <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex -space-x-2.5 overflow-hidden">
              {["Sai", "John", "Maria", "Alex", "Kate"].map((name, idx) => (
                <div 
                  key={idx} 
                  className="inline-block h-8.5 w-8.5 rounded-full ring-2 ring-[#020202] bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center text-[10px] font-black text-neutral-300 uppercase tracking-tighter"
                >
                  {name[0]}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-neutral-400 leading-relaxed max-w-[280px]">
              Join <span className="text-white font-bold">10,000+ developers</span> & founders partnering with us to build agentic pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Testimonial & Branding (Futuristic Dark Theme) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#050814] text-white p-12 lg:p-24 relative overflow-hidden select-none border-l border-neutral-900">
        {/* Futuristic Grid / Glow Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#355CFF]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Futuristic Sketch 1: Orbit Grid (Top Right) */}
        <svg className="absolute -top-10 -right-10 w-72 h-72 text-[#355CFF]/15 stroke-current fill-none pointer-events-none" viewBox="0 0 100 100" strokeWidth="0.5">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" strokeDasharray="4 4" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="20" y1="20" x2="80" y2="80" />
        </svg>

        {/* Futuristic Sketch 2: Digital Network Grid (Bottom Left) */}
        <svg className="absolute -bottom-10 -left-10 w-80 h-80 text-[#C0F0FB]/10 stroke-current fill-none pointer-events-none" viewBox="0 0 100 100" strokeWidth="0.5">
          <path d="M10,10 L30,40 L70,30 L90,80 L50,90 Z" />
          <line x1="30" y1="40" x2="50" y2="90" />
          <line x1="70" y1="30" x2="50" y2="90" />
          <circle cx="10" cy="10" r="2" fill="currentColor" />
          <circle cx="30" cy="40" r="2" fill="currentColor" />
          <circle cx="70" cy="30" r="2" fill="currentColor" />
          <circle cx="90" cy="80" r="2" fill="currentColor" />
          <circle cx="50" cy="90" r="2" fill="currentColor" />
        </svg>

        <div className="relative z-10 w-full max-w-md space-y-8 flex flex-col items-center">
          <h2 className="text-[38px] font-black text-white leading-tight text-center max-w-sm font-serif tracking-tight">
            Go Agent-native With <span className="italic font-serif font-normal text-[#355CFF]">GrowXLabs</span>
          </h2>

          {/* Testimonial Card */}
          <div className="w-full bg-[#0F0F12] text-white rounded-2xl p-7 shadow-2xl border border-white/5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#355CFF] to-[#C0F0FB] flex items-center justify-center font-bold text-xs text-black">
                  SJ
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-bold text-white">Sarah Jenkins</span>
                    {/* Verified check */}
                    <svg className="w-4 h-4 text-[#C0F0FB] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">@sarahj_ai</div>
                </div>
              </div>
              
              {/* Top right icon */}
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-neutral-600 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>

            <p className="text-[15px] leading-relaxed text-neutral-200 mb-6 font-normal">
              Using the workflow orchestration and custom CRM integrations from <span className="text-[#C0F0FB]">@growxlabs</span> helped our outreach team response time drop to under 2 minutes. Outstanding partner!
            </p>

            <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-2 border-t border-neutral-900 pt-4">
              <span>11:20 AM · Feb 18, 2026</span>
              <span>·</span>
              <span className="text-[#C0F0FB]">4.1K Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
