"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, ChevronRight, UserCheck, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function InterviewerDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/interviewer/assignments", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load assignments");
      setAssignments(json.assignments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "active":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Active Access</span>;
      case "upcoming":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Access Starts Later</span>;
      case "expired":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Access Expired</span>;
      case "revoked":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">Revoked</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{state}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">Interviewer Workspace</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Assigned Candidate Interviews</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Review approved candidate background details, preview resumes, join interview calls, and submit scorecard evaluations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Assigned Interviews ({assignments.length})</h2>
          <button
            onClick={fetchAssignments}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0075de] hover:underline cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center space-y-2">
            <Loader2 className="animate-spin text-[#0075de]" size={28} />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <UserCheck className="mx-auto text-slate-400" size={36} />
            <h3 className="text-base font-bold text-slate-800">No Interview Assignments Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You do not have any active or upcoming interview assignments. Use your invitation link provided by HR to access an assigned interview.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asgn) => {
              const inv = asgn.interviews || {};
              const startsAt = new Date(asgn.access_starts_at);
              const expiresAt = new Date(asgn.access_expires_at);
              const scheduledAt = inv.scheduled_at ? new Date(inv.scheduled_at) : null;

              return (
                <div
                  key={asgn.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#0075de] tracking-wider block">
                          {asgn.application_reference || "ASSIGNMENT"}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{asgn.candidate_name}</h3>
                        <p className="text-xs font-medium text-slate-600">{asgn.job_title}</p>
                      </div>

                      {getStatusBadge(asgn.access_state)}
                    </div>

                    {/* Interview Time Details */}
                    {scheduledAt && (
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center gap-2 font-semibold">
                          <Calendar size={14} className="text-[#0075de]" />
                          {scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <Clock size={13} />
                          {scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ({inv.duration_minutes || 30} mins)
                        </div>
                      </div>
                    )}

                    {/* Access Window */}
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <span className="font-semibold block text-slate-700">Access Window:</span>
                      <span>{startsAt.toLocaleString()} ➔ {expiresAt.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      href={`/interviewer/interviews/${asgn.interview_id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#0075de] hover:bg-[#005bab] text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Open Interviewer Workspace <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
