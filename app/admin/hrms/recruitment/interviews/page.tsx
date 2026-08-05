"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, RefreshCw, Calendar, Clock, Video, ShieldCheck, UserCheck, ChevronRight, ExternalLink, ShieldAlert, KeyRound } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await fetch("/api/admin/recruitment/interviews", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load interviews");
      setInterviews(data.interviews || []);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const getAccessBadge = (assignments: any[]) => {
    if (!assignments || assignments.length === 0) {
      return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Unassigned</span>;
    }

    const now = new Date();
    const active = assignments.find((a) => {
      if (a.status === "revoked" || a.revoked_at) return false;
      const start = new Date(a.access_starts_at);
      const expire = new Date(a.access_expires_at);
      return now >= start && now < expire;
    });

    if (active) {
      return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active Access</span>;
    }

    const revoked = assignments.find((a) => a.status === "revoked");
    if (revoked) {
      return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">Revoked</span>;
    }

    const expired = assignments.find((a) => new Date(a.access_expires_at) <= now);
    if (expired) {
      return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Expired</span>;
    }

    return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">Invited / Pending</span>;
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Interviews & Access Management</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#0075de]/10 text-[#0075de] text-[10px] font-bold uppercase tracking-wider">
              {interviews.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Configure time-bound interviewer access windows, control candidate visibility, and review scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInterviews}
            className="flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[var(--surface-1)]"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
          {loadError}
        </div>
      )}

      {/* Main Interviews List Table */}
      <Card className="overflow-hidden border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">All Scheduled Candidate Interviews</h2>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center space-y-2">
            <Loader2 className="animate-spin text-[#0075de]" size={24} />
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            No interviews scheduled yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-1)] text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Job Role</th>
                  <th className="px-5 py-3">Interview Date & Time</th>
                  <th className="px-5 py-3">Assigned Interviewers</th>
                  <th className="px-5 py-3">Access State</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {interviews.map((inv: any) => {
                  const assignments = inv.interview_assignments || [];
                  return (
                    <tr key={inv.id} className="hover:bg-[var(--surface-1)]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{inv.candidate_name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{inv.candidate_email}</div>
                        {inv.application_reference && (
                          <div className="text-[9px] font-mono text-[#0075de] mt-0.5">{inv.application_reference}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium">{inv.job_title}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                          <Calendar size={13} className="text-[#0075de]" />
                          {new Date(inv.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] mt-0.5">
                          <Clock size={11} />
                          {new Date(inv.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ({inv.duration_minutes || 30} mins)
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {assignments.length === 0 ? (
                          <span className="text-[10px] text-[var(--text-muted)] italic">No interviewer assigned</span>
                        ) : (
                          <div className="space-y-1">
                            {assignments.map((a: any) => (
                              <div key={a.id} className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-secondary)]">
                                <UserCheck size={12} className="text-violet-400" />
                                <span className="font-bold text-[var(--text-primary)]">{a.interviewer_name || a.interviewer_email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">{getAccessBadge(assignments)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/hrms/recruitment/interviews/${inv.id}/access`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <KeyRound size={12} /> Manage Access
                          </Link>
                          <Link
                            href={`/admin/hrms/recruitment/interviews/${inv.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--card)] transition-all"
                          >
                            Detail <ChevronRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
