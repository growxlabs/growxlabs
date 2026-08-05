"use client";

import React, { useState, useEffect, use } from "react";
import { Loader2, ArrowLeft, KeyRound, ShieldAlert, Clock, UserPlus, RefreshCw, Eye, Check, X, ShieldCheck, Mail, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AdminInterviewAccessPage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // New Interviewer Assignment Form
  const [newInterviewerEmail, setNewInterviewerEmail] = useState("");
  const [newInterviewerName, setNewInterviewerName] = useState("");
  const [accessStartsAt, setAccessStartsAt] = useState("");
  const [accessExpiresAt, setAccessExpiresAt] = useState("");

  useEffect(() => {
    fetchAccessData();
  }, [interviewId]);

  const fetchAccessData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/recruitment/interviews/${interviewId}/access`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load access settings");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load access details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      setActionLoading(true);
      setActionMsg("");
      const res = await fetch(`/api/admin/recruitment/interviews/${interviewId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerEmail: newInterviewerEmail,
          interviewerName: newInterviewerName,
          accessStartsAt: accessStartsAt ? new Date(accessStartsAt).toISOString() : undefined,
          accessExpiresAt: accessExpiresAt ? new Date(accessExpiresAt).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to assign interviewer");
      setNewInterviewerEmail("");
      setNewInterviewerName("");
      setActionMsg("Interviewer assigned successfully and invitation email dispatched.");
      fetchAccessData();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteAction = async (assignmentId: string, action: string, extraPayload = {}) => {
    try {
      setActionLoading(true);
      setActionMsg("");
      const res = await fetch(`/api/admin/recruitment/interviews/${interviewId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          action,
          ...extraPayload,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to execute action");
      setActionMsg(`Action '${action}' executed successfully.`);
      fetchAccessData();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0075de]" size={28} />
      </div>
    );
  }

  const assignments = data?.assignments || [];
  const auditEvents = data?.auditEvents || [];

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/hrms/recruitment/interviews/${interviewId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0075de] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Interview Detail
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <KeyRound className="text-[#0075de]" size={24} />
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Temporary Interviewer Access Control</h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Configure time-bound access windows, visibility rules, and access revocation for team interviewers.
        </p>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${actionMsg.startsWith("Error") ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"}`}>
          {actionMsg}
        </div>
      )}

      {/* Assign New Interviewer Form */}
      <Card className="p-6 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <UserPlus size={16} className="text-[#0075de]" /> Assign New Interviewer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">Interviewer Email *</label>
            <input
              type="email"
              value={newInterviewerEmail}
              onChange={(e) => setNewInterviewerEmail(e.target.value)}
              placeholder="interviewer@company.com"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#0075de]"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">Interviewer Name</label>
            <input
              type="text"
              value={newInterviewerName}
              onChange={(e) => setNewInterviewerName(e.target.value)}
              placeholder="Alex Smith"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#0075de]"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">Access Starts At (Optional)</label>
            <input
              type="datetime-local"
              value={accessStartsAt}
              onChange={(e) => setAccessStartsAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">Access Expires At (Optional)</label>
            <input
              type="datetime-local"
              value={accessExpiresAt}
              onChange={(e) => setAccessExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCreateAssignment}
          disabled={actionLoading || !newInterviewerEmail}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />} Create Assignment & Send Link
        </button>
      </Card>

      {/* Active Assignments & Access Controls */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Current Interviewer Assignments</h2>

        {assignments.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[var(--text-muted)] border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl">
            No interviewers assigned yet. Use the form above to assign an interviewer.
          </Card>
        ) : (
          assignments.map((asgn: any) => {
            const now = new Date();
            const start = new Date(asgn.access_starts_at);
            const expire = new Date(asgn.access_expires_at);

            const isRevoked = asgn.status === "revoked" || Boolean(asgn.revoked_at);
            const isExpired = now >= expire;
            const isUpcoming = now < start;
            const isActive = !isRevoked && !isExpired && !isUpcoming;

            const scope = asgn.visibility_scope || {};

            return (
              <Card key={asgn.id} className="p-6 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{asgn.interviewer_name || asgn.interviewer_email}</h3>
                      {isActive && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active Window</span>}
                      {isUpcoming && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">Access Starts Later</span>}
                      {isExpired && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Access Expired</span>}
                      {isRevoked && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">Revoked</span>}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{asgn.interviewer_email}</p>
                  </div>

                  {/* Window Times */}
                  <div className="text-xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Time Window (Server Time)</span>
                    <span className="font-medium text-[var(--text-secondary)] block">
                      {start.toLocaleString()} ➔ {expire.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Visibility Toggles */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Eye size={12} className="text-[#0075de]" /> Candidate Visibility Scope Toggles
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: "contact_details", label: "Phone & Contact Info" },
                      { key: "resume", label: "Resume File" },
                      { key: "portfolio", label: "Portfolio Link" },
                      { key: "application_answers", label: "Screening Answers" },
                      { key: "prior_feedback", label: "Prior Feedback" },
                      { key: "recruiter_notes", label: "Recruiter Notes" },
                      { key: "compensation_expectations", label: "Compensation" },
                    ].map((item) => {
                      const isEnabled = Boolean(scope[item.key]);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            const updated = { ...scope, [item.key]: !isEnabled };
                            handleExecuteAction(asgn.id, "update_visibility", { visibilityScope: updated });
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${isEnabled ? "bg-[#0075de]/10 border-[#0075de]/30 text-[#0075de]" : "bg-[var(--surface-1)] border-[var(--border-subtle)] text-[var(--text-muted)]"}`}
                        >
                          <span>{item.label}</span>
                          {isEnabled ? <Check size={12} /> : <X size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Management Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--border-subtle)] text-xs">
                  <button
                    onClick={() => handleExecuteAction(asgn.id, "extend", { extensionHours: 1 })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    +1 Hour
                  </button>

                  <button
                    onClick={() => handleExecuteAction(asgn.id, "extend", { extensionHours: 24 })}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    +1 Day
                  </button>

                  <button
                    onClick={() => handleExecuteAction(asgn.id, "resend_invitation")}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] font-bold text-[10px] uppercase tracking-wider hover:bg-[var(--card)] transition-all cursor-pointer"
                  >
                    Resend Link
                  </button>

                  {!isRevoked && (
                    <button
                      onClick={() => handleExecuteAction(asgn.id, "revoke", { reason: "Revoked by admin" })}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Revoke Access Now
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Access Audit Events */}
      <Card className="p-6 border border-[var(--border-subtle)] bg-[var(--card)] rounded-xl space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" /> Access Audit Trail
        </h2>

        {auditEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">No audit events recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-1)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">User / Email</th>
                  <th className="px-4 py-2">Event Action</th>
                  <th className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {auditEvents.map((evt: any) => (
                  <tr key={evt.id}>
                    <td className="px-4 py-2 text-[var(--text-muted)] font-mono text-[10px]">{new Date(evt.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 font-medium">{evt.user_email || "System"}</td>
                    <td className="px-4 py-2 font-bold uppercase tracking-wider text-[#0075de] text-[10px]">{evt.event_type}</td>
                    <td className="px-4 py-2 text-[10px] font-mono text-[var(--text-secondary)]">{JSON.stringify(evt.action_details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
