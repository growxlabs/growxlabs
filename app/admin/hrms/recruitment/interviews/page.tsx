"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus, RefreshCw, Calendar, Clock, Video, ShieldCheck, UserCheck, ChevronRight, ExternalLink, ShieldAlert, KeyRound, Mail, X } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AdminInterviewsPage() {
  const searchParams = useSearchParams();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Schedule Interview Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [customMeetLink, setCustomMeetLink] = useState("");
  const [meetingProvider, setMeetingProvider] = useState("google_meet");
  const [zoomMeetingId, setZoomMeetingId] = useState("");
  const [zoomPasscode, setZoomPasscode] = useState("");
  const [meetingSdkEnabled, setMeetingSdkEnabled] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (searchParams.get("applicationId")) void openScheduleModal(searchParams.get("applicationId") || undefined);
  }, [searchParams]);

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
      setLoadError("We couldn’t load interviews. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = async (applicationId?: string) => {
    setShowScheduleModal(true);
    setScheduleMsg("");
    try {
      setLoadingApps(true);
      const res = await fetch("/api/hrms/recruitment", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.candidates) {
        setApplications(data.candidates);
        if (data.candidates.length > 0) {
          setSelectedAppId(applicationId && data.candidates.some((candidate: any) => candidate.id === applicationId) ? applicationId : data.candidates[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load candidate applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !scheduledAt) return;

    try {
      setScheduling(true);
      setScheduleMsg("");
      const res = await fetch("/api/admin/recruitment/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedAppId,
          scheduledAt,
          durationMinutes: Number(durationMinutes),
          interviewerEmail,
          interviewerName,
          meetingProvider,
          customMeetLink,
          zoomMeetingId,
          zoomPasscode,
          meetingSdkEnabled,
          instructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule interview");

      setScheduleMsg("Interview scheduled and invitation email dispatched!");
      setTimeout(() => {
        setShowScheduleModal(false);
        fetchInterviews();
      }, 1200);
    } catch (err: any) {
      setScheduleMsg("We couldn’t schedule this interview. Please review the details and try again.");
    } finally {
      setScheduling(false);
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
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Interview Management</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#0075de]/10 text-[#0075de] text-[10px] font-bold uppercase tracking-wider">
              {interviews.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Schedule interviews, assign the interview team, and keep every candidate’s interview details in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void openScheduleModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
          >
            <Plus size={15} /> Schedule New Interview
          </button>

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
          <div className="p-12 text-center space-y-3">
            <Calendar className="mx-auto text-[var(--text-muted)]" size={36} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No interviews scheduled yet.</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Schedule an interview and assign the people who will take part.
              </p>
            </div>
            <button
              onClick={openScheduleModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0075de] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} /> Schedule First Interview
            </button>
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Schedule Candidate Interview
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {scheduleMsg && (
              <div className={`p-3 rounded-lg text-xs font-medium ${scheduleMsg.startsWith("Error") ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {scheduleMsg}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* Select Candidate Application */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Select Candidate *</label>
                {loadingApps ? (
                  <div className="p-2.5 bg-[var(--surface-1)] rounded-lg text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#0075de]" /> Loading active candidates...
                  </div>
                ) : (
                  <select
                    required
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                  >
                    {applications.map((app: any) => (
                      <option key={app.id} value={app.id}>
                        {app.candidate_name || app.candidate_id} — {app.job_title} ({app.application_reference || "Ref"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Scheduled Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Interviewer Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Interviewer Email</label>
                  <input
                    type="email"
                    value={interviewerEmail}
                    onChange={(e) => setInterviewerEmail(e.target.value)}
                    placeholder="interviewer@company.com"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Meeting Link */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Meeting provider</label>
                <select value={meetingProvider} onChange={(e) => setMeetingProvider(e.target.value)} className="mb-3 w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"><option value="google_meet">Google Meet</option><option value="zoom">Zoom</option></select>
                <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">External meeting link (Optional)</label>
                <input
                  type="url"
                  value={customMeetLink}
                  onChange={(e) => setCustomMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/fau-nfbw-kfu"
                  className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
                />
                {meetingProvider === "zoom" && <div className="mt-3 grid grid-cols-2 gap-3"><input value={zoomMeetingId} onChange={(e) => setZoomMeetingId(e.target.value)} placeholder="Zoom meeting ID" className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)]" /><input value={zoomPasscode} onChange={(e) => setZoomPasscode(e.target.value)} placeholder="Zoom passcode" type="password" className="w-full p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)]" /><label className="col-span-2 flex items-center gap-2"><input type="checkbox" checked={meetingSdkEnabled} onChange={(e) => setMeetingSdkEnabled(e.target.checked)} /> Enable embedded Zoom SDK</label></div>}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 rounded-lg border border-[var(--border-subtle)] font-bold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={scheduling || !selectedAppId || !scheduledAt}
                  className="flex-1 py-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {scheduling ? <Loader2 className="animate-spin" size={14} /> : <Calendar size={14} />} Schedule & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
