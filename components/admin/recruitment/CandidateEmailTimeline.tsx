"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, XCircle, Clock, Loader2, RotateCcw, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailLogEntry {
  id: string;
  template_key: string | null;
  recipient_email: string;
  subject: string;
  status: string;
  message_id: string | null;
  error_message: string | null;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
}

interface CandidateEmailTimelineProps {
  candidateId?: string;
  applicationId?: string;
  candidateEmail?: string;
  candidateName?: string;
  jobTitle?: string;
  onSendEmail?: () => void;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  sent: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500", label: "Sent" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500", label: "Pending" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500", label: "Failed" },
  bounced: { icon: XCircle, color: "text-orange-500", bg: "bg-orange-500", label: "Bounced" },
};

const TEMPLATE_NAMES: Record<string, string> = {
  application_received: "Application Confirmation",
  interview_invite: "Interview Invitation",
  assessment_invite: "Assessment Invitation",
  offer_extended: "Offer Letter",
  rejection: "Rejection Notice",
  stage_update: "Stage Update",
  general: "General Email",
  test: "Test Email",
};

export function CandidateEmailTimeline({
  candidateId,
  applicationId,
  candidateEmail,
  candidateName,
  jobTitle,
  onSendEmail,
}: CandidateEmailTimelineProps) {
  const [emails, setEmails] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [candidateId, applicationId]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (candidateId) params.set("candidateId", candidateId);
      if (applicationId) params.set("applicationId", applicationId);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/recruitment/emails?${params}`);
      const data = await res.json();
      setEmails(data.logs || []);
    } catch { setEmails([]); } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (emailId: string) => {
    setRetryingId(emailId);
    try {
      await fetch(`/api/admin/recruitment/emails/${emailId}/retry`, { method: "POST" });
      fetchEmails();
    } catch { /* swallow */ } finally {
      setRetryingId(null);
    }
  };

  const handleSendEmail = async () => {
    if (!candidateEmail || !composeSubject.trim() || !composeBody.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/recruitment/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: candidateEmail,
          subject: composeSubject,
          body: composeBody,
          candidateId,
          applicationId,
        }),
      });
      setShowCompose(false);
      setComposeSubject("");
      setComposeBody("");
      fetchEmails();
      onSendEmail?.();
    } catch { /* swallow */ } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#0075de] mx-auto mb-2" />
        <p className="text-[10px] text-[var(--text-muted)]">Loading email history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#0075de]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">Email History</span>
          <span className="text-[9px] bg-[var(--surface-1)] px-1.5 py-0.5 rounded font-bold text-[var(--text-muted)]">{emails.length}</span>
        </div>
        {candidateEmail && (
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[#0075de]/10 text-[#0075de] text-[10px] font-bold hover:bg-[#0075de]/20 transition-all cursor-pointer"
          >
            <Send className="h-3 w-3" /> Send Email
          </button>
        )}
      </div>

      {/* Quick Compose */}
      {showCompose && (
        <div className="bg-[var(--surface-1)] rounded-xl border border-[var(--border-subtle)] p-4 space-y-3">
          <input
            type="text"
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full h-8 px-3 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
          />
          <textarea
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            placeholder="Email body (plain text)..."
            rows={4}
            className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCompose(false)}
              className="h-7 px-3 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || !composeSubject.trim() || !composeBody.trim()}
              className="flex items-center gap-1.5 h-7 px-4 bg-[#0075de] text-white text-[10px] font-bold rounded-lg disabled:opacity-50 cursor-pointer hover:bg-[#0063bd] transition-all"
            >
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {emails.length === 0 ? (
        <div className="py-8 text-center">
          <Mail className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-20" />
          <p className="text-xs text-[var(--text-muted)]">No emails sent to this candidate yet</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />

          {emails.map((email) => {
            const status = STATUS_CONFIG[email.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <div key={email.id} className="relative group">
                {/* Dot */}
                <div className={cn("absolute -left-6 top-1 h-[18px] w-[18px] rounded-full border-2 border-[var(--card)] flex items-center justify-center", status.bg)}>
                  <StatusIcon className="h-2.5 w-2.5 text-white" />
                </div>

                {/* Content */}
                <div className="bg-[var(--card)] border border-[var(--border-subtle)] rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{email.subject}</p>
                      <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                        {TEMPLATE_NAMES[email.template_key || ""] || "Ad-hoc Email"} · {email.recipient_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", `${status.bg}/10`, status.color)}>
                        {status.label}
                      </span>
                      {(email.status === "failed" || email.status === "bounced") && (
                        <button
                          onClick={() => handleRetry(email.id)}
                          disabled={retryingId === email.id}
                          className="text-[8px] font-bold text-[#0075de] hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          {retryingId === email.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <RotateCcw className="h-2.5 w-2.5" />}
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[8px] text-[var(--text-muted)]">
                    <span>{email.sent_at ? new Date(email.sent_at).toLocaleString() : new Date(email.created_at).toLocaleString()}</span>
                    {email.message_id && <span className="font-mono truncate max-w-[100px]">ID: {email.message_id}</span>}
                    {email.retry_count > 0 && <span>Retries: {email.retry_count}</span>}
                  </div>

                  {email.error_message && (
                    <p className="text-[9px] text-red-400 mt-1 bg-red-500/5 px-2 py-1 rounded">{email.error_message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
