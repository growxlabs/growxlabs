"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InvitationAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [accepting, setAccepting] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      setAccepting(true);
      setError("");
      const res = await fetch(`/api/interviewer/invitations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invitation token");
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/interviewer/interviews/${data.interviewId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired invitation token.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
      {accepting ? (
        <div className="space-y-3">
          <Loader2 size={36} className="animate-spin text-[#0075de] mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Validating & Accepting Interview Invitation...</h2>
          <p className="text-xs text-slate-500 max-w-sm">Verifying your secure token and establishing temporary interviewer session.</p>
        </div>
      ) : success ? (
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invitation Accepted!</h2>
          <p className="text-xs text-slate-600">Redirecting to Interviewer Workspace...</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invitation Error</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <div className="pt-2">
            <Link
              href="/interviewer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0075de] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#005bab] transition-all"
            >
              Go to Interviewer Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
