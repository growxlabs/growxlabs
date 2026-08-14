"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, AlertCircle } from "lucide-react";

export default function TeamLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Fetch active terms on mount
  useEffect(() => {
    fetch("/api/team/terms")
      .then(res => res.json())
      .then(data => {
        if (data.terms) {
          setTermsText(data.terms.content);
        } else {
          setTermsText("Terms and conditions not found.");
        }
      })
      .catch(err => console.error("Failed to load terms"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/team/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setSessionUser(data.user);

      if (!data.user.accepted_terms) {
        setShowTerms(true);
      } else {
        router.push("/team/crm");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!termsAccepted) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/team/terms", { method: "POST" });
      if (res.ok) {
        setShowTerms(false);
        router.push("/team/crm");
      } else {
        throw new Error("Failed to accept terms");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0A0A0A] relative">
      <div className="w-full max-w-md bg-[#111111] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Team Portal</h1>
          <p className="text-sm text-gray-400">Secure access for GrowxLabs Tech agents</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
              disabled={loading || showTerms}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
              disabled={loading || showTerms}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold text-sm transition-all"
            disabled={loading || showTerms}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Terms and Conditions</h2>
              <p className="text-sm text-gray-400 mt-1">You must read and accept the terms to proceed.</p>
            </div>
            
            <div className="p-6 overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap leading-relaxed custom-scrollbar flex-1 min-h-[300px]">
              {termsText || `TEAM MEMBER TERMS AND CONDITIONS
GrowxLabs Tech

1. CONFIDENTIALITY
All lead data, client information, and business data you access is strictly confidential. You cannot share, copy, screenshot, or export any data from this system.

2. DATA USAGE
Lead data is property of GrowxLabs Tech. You are given access to perform outreach duties only. Any misuse will result in immediate termination and legal action.

3. OUTREACH CONDUCT
All outreach must be professional and honest. You represent GrowxLabs Tech. Spam, misleading claims, or pressure tactics are strictly prohibited.

4. WORKING HOURS
All activity in this system is logged including login time, logout time, and all actions performed.

5. COMMISSION AND PAYMENT
Commission is paid only on verified closed deals. Disputes must be raised within 7 days of commission date.

6. TERMINATION
GrowxLabs Tech reserves the right to terminate access immediately without notice for any violation of these terms.`}
            </div>

            <div className="p-6 border-t border-white/10 flex-shrink-0 bg-[#0A0A0A] rounded-b-2xl">
              <label className="flex items-start gap-3 cursor-pointer group mb-6">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <div className="w-5 h-5 border-2 border-gray-500 rounded transition-colors group-hover:border-white peer-checked:bg-white peer-checked:border-white"></div>
                  <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 select-none">
                  I have read, understood, and agree to the Terms and Conditions
                </span>
              </label>
              
              <Button 
                onClick={handleAcceptTerms}
                disabled={!termsAccepted || loading}
                className="w-full h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept and Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
