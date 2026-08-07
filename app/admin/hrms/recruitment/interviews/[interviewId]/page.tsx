"use client";

import React, { useState, useEffect, use } from "react";
import { Loader2, ArrowLeft, Calendar, Clock, Video, KeyRound, ExternalLink, UserCheck, Star, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AdminInterviewDetailPage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playbook, setPlaybook] = useState<any>(null);
  const [playbookBusy, setPlaybookBusy] = useState(false);

  useEffect(() => {
    fetchDetail();
    fetch(`/api/admin/recruitment/interviews/${interviewId}/playbook`, { cache: "no-store" }).then((res) => res.json()).then((json) => setPlaybook(json.assignment || null)).catch(() => undefined);
  }, [interviewId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/recruitment/interviews/${interviewId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load interview detail");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load detail");
    } finally {
      setLoading(false);
    }
  };

  const sendPlaybook = async () => {
    setPlaybookBusy(true);
    try {
      const res = await fetch(`/api/admin/recruitment/interviews/${interviewId}/playbook`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to send playbook");
      setPlaybook(json.assignment);
    } catch (err: any) { window.alert(err.message); } finally { setPlaybookBusy(false); }
  };

  const withdrawPlaybook = async () => {
    if (!window.confirm("Withdraw this interview playbook from the candidate?")) return;
    setPlaybookBusy(true);
    try { await fetch(`/api/admin/recruitment/interviews/${interviewId}/playbook`, { method: "DELETE" }); setPlaybook(null); } finally { setPlaybookBusy(false); }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0075de]" size={28} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
        {error || "Interview record not found."}
      </div>
    );
  }

  const { interview, application, job } = data;
  const candidateName = application?.profile?.full_name || interview.candidate_id;
  const candidateEmail = application?.profile?.email || interview.candidate_id;
  const assignments = interview.interview_assignments || [];
  const feedbacks = interview.interview_feedback || [];

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/hrms/recruitment/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0075de] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Interviews
        </Link>

        <Link
          href={`/admin/hrms/recruitment/interviews/${interviewId}/access`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0075de] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#005bab] transition-all cursor-pointer"
        >
          <KeyRound size={14} /> Configure Access Control
        </Link>
      </div>

      {/* Main Info Card */}
      <Card className="p-6 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0075de]">
              {application?.application_reference || "INTERVIEW DETAIL"}
            </span>
            <h1 className="text-2xl font-extrabold mt-1">{candidateName}</h1>
            <p className="text-xs text-[var(--text-secondary)]">{job?.title || "Specialist Position"}</p>
          </div>

          <div className="flex items-center gap-3">
            {interview.meeting_join_url && (
              <a
                href={interview.meeting_join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <Video size={14} /> Join Meeting <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Scheduled Time</span>
            <span className="font-semibold text-[var(--text-primary)] block">
              {new Date(interview.scheduled_at).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Meeting Provider</span>
            <span className="font-semibold text-emerald-500 uppercase">{interview.meeting_provider || "Google Meet"}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Candidate Contact</span>
            <span className="font-semibold text-[var(--text-primary)] block">{candidateEmail}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-sm font-bold">Preparation material</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Business Development Executive Interview Playbook</p></div>
          {playbook ? <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">{playbook.openedAt ? "Opened" : "Not opened"}</span> : null}
        </div>
        {playbook ? <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]"><span>Sent {playbook.sentAt ? new Date(playbook.sentAt).toLocaleString() : "—"}</span>{playbook.lastViewedAt ? <span>Last viewed {new Date(playbook.lastViewedAt).toLocaleString()}</span> : null}<button onClick={() => void withdrawPlaybook()} disabled={playbookBusy} className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600">Withdraw</button></div> : <button onClick={() => void sendPlaybook()} disabled={playbookBusy} className="rounded-lg bg-[#0075de] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{playbookBusy ? "Sending…" : "Send Interview Playbook"}</button>}
      </Card>

      {/* Assigned Interviewers & Feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Assigned Interviewers</h2>
          {assignments.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No interviewers assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block text-[var(--text-primary)]">{a.interviewer_name || a.interviewer_email}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{a.interviewer_email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Submitted Interview Feedback</h2>
          {feedbacks.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No scorecard feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-500 uppercase">{fb.recommendation || "Evaluated"}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{fb.submitted_at ? new Date(fb.submitted_at).toLocaleDateString() : "Draft"}</span>
                  </div>
                  {fb.notes && <p className="text-[var(--text-secondary)] italic">"{fb.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
