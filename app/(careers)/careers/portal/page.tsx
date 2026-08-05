"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar, ChevronRight, Briefcase, FileText, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CandidatePortalDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/candidate/portal", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load portal data");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load candidate applications");
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: string) => {
    switch (String(stage).toLowerCase()) {
      case "hired":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Hired 🎉</span>;
      case "offer":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">Offer Extended</span>;
      case "interview":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Interview Scheduled</span>;
      case "assessment":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Assessment Active</span>;
      case "screening":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">Under Screening</span>;
      case "rejected":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">Closed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">Applied</span>;
    }
  };

  if (loading) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0075de]" size={32} />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs font-medium">
          {error || "Session expired or application not found."}
        </div>
        <Link
          href="/careers/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0075de] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Candidate Login
        </Link>
      </main>
    );
  }

  const { candidate, allApplications = [] } = data;

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0075de]">Candidate Portal</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Welcome, {candidate.name}</h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Track real-time hiring stage progress, view interview meeting links, complete assessments, and accept offer letters.
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Your Job Applications ({allApplications.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allApplications.map((app: any) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0075de] tracking-wider block">
                      {app.reference}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{app.jobTitle}</h3>
                  </div>

                  {getStageBadge(app.stage)}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} />
                  <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/careers/application/${encodeURIComponent(app.reference)}?email=${encodeURIComponent(candidate.email)}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  View Application Workspace <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
