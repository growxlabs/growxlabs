"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, FileText, Star, UserRound } from "lucide-react";

type Candidate = { id: string; name: string; email: string; applicationId: string; job: string; stage: string; matchScore?: number };
type Interview = { id: string; title: string; startsAt: string; feedbackSubmitted: boolean };

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1/hrms/recruitment${path}`, init);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.detail || body?.error || "Request failed");
  return body;
}

export default function HiringManagerWorkspace() {
  const client = useQueryClient();
  const { data, isLoading } = useQuery<{ items: Candidate[] }>({ queryKey: ["manager-candidates"], queryFn: () => api("/candidates") });

  async function resume(candidate: Candidate) {
    const body = await api(`/candidates/${candidate.id}/resume-url`, { method: "POST" });
    window.open(body.downloadUrl, "_blank", "noopener,noreferrer");
  }

  async function schedule(candidate: Candidate) {
    const interviewer = window.prompt("Interviewer user UUID");
    if (!interviewer) return;
    const starts = window.prompt("Start time (ISO 8601)", new Date(Date.now() + 86_400_000).toISOString());
    if (!starts) return;
    const startsAt = new Date(starts);
    await api("/interviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      applicationID: candidate.applicationId, title: `${candidate.job} interview`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + 3_600_000).toISOString(), location: "", meetingURL: "",
      interviewerUserIDs: [interviewer],
    }) });
    await client.invalidateQueries({ queryKey: ["candidate-interviews", candidate.applicationId] });
  }

  async function feedback(candidate: Candidate) {
    const result = await api(`/interviews?applicationId=${candidate.applicationId}`) as { items: Interview[] };
    const interview = result.items.find(item => !item.feedbackSubmitted);
    if (!interview) { window.alert("No interview awaiting your feedback."); return; }
    const comments = window.prompt(`Feedback for ${interview.title}`);
    if (comments === null) return;
    const recommendation = window.prompt("Recommendation: strong_yes, yes, neutral, no, strong_no", "yes") || "neutral";
    await api(`/interviews/${interview.id}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      ratings: { overall: 4 }, comments, recommendation,
    }) });
    window.alert("Structured feedback submitted.");
  }

  return <div className="space-y-6">
    <header className="border-b border-[var(--border-subtle)] pb-6"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">Hiring manager workspace</div><h1 className="text-3xl font-extrabold">Assigned candidates</h1><p className="mt-2 text-xs text-[var(--text-secondary)]">Review signed resumes, schedule interviews and submit immutable structured feedback.</p></header>
    <div className="grid gap-4 lg:grid-cols-2">{isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-[var(--surface-2)]" />) : data?.items?.map(candidate => <article key={candidate.applicationId} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5"><div className="flex items-start gap-3"><div className="rounded-lg bg-blue-500/10 p-2 text-[#0075de]"><UserRound size={16} /></div><div className="flex-1"><h2 className="text-sm font-extrabold">{candidate.name}</h2><p className="text-[10px] text-[var(--text-muted)]">{candidate.job} · {candidate.stage}</p></div><span className="flex items-center gap-1 text-xs font-bold"><Star size={12} className="fill-amber-400 text-amber-400" />{candidate.matchScore ?? "—"}</span></div><div className="mt-5 grid grid-cols-3 gap-2"><button onClick={() => void resume(candidate)} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] py-2 text-[9px] font-bold"><FileText size={12} />Resume</button><button onClick={() => void schedule(candidate)} className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] py-2 text-[9px] font-bold"><CalendarDays size={12} />Schedule</button><button onClick={() => void feedback(candidate)} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0075de] py-2 text-[9px] font-bold text-white"><BriefcaseBusiness size={12} />Feedback</button></div></article>)}</div>
  </div>;
}
