"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail, CheckCircle, XCircle, Clock, RefreshCw, Send, Loader2,
  ChevronLeft, ChevronRight, Search, Filter, RotateCcw, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailLog {
  id: string;
  template_key: string | null;
  recipient_email: string;
  recipient_name: string | null;
  candidate_id: string | null;
  subject: string;
  status: string;
  message_id: string | null;
  error_message: string | null;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  todayCount: number;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: any }> = {
  sent: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle },
  pending: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: Clock },
  failed: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500 dark:text-red-400", icon: XCircle },
  bounced: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-500 dark:text-orange-400", icon: XCircle },
};

export default function RecruitmentEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, failed: 0, pending: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const limit = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/recruitment/emails?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);

      // Calculate stats from all logs
      const all = data.allLogs || data.logs || [];
      const today = new Date().toISOString().slice(0, 10);
      setStats({
        total: data.total || 0,
        sent: all.filter((l: EmailLog) => l.status === "sent").length,
        failed: all.filter((l: EmailLog) => l.status === "failed").length,
        pending: all.filter((l: EmailLog) => l.status === "pending").length,
        todayCount: all.filter((l: EmailLog) => l.created_at?.startsWith(today)).length,
      });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/recruitment/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", to: testEmail.trim() }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.success ? "Test email sent successfully!" : (data.error || "Failed to send test email") });
      if (data.success) fetchLogs();
    } catch {
      setTestResult({ success: false, message: "Network error" });
    } finally {
      setSendingTest(false);
    }
  };

  const handleRetry = async (emailId: string) => {
    setRetryingId(emailId);
    try {
      const res = await fetch(`/api/admin/recruitment/emails/${emailId}/retry`, { method: "POST" });
      await res.json();
      fetchLogs();
    } catch { /* swallow */ } finally {
      setRetryingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Email Status</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Monitor recruitment email delivery and manage notifications</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#0075de]/10 text-[#0075de] text-xs font-bold hover:bg-[#0075de]/20 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Provider", value: "Resend", icon: Zap, color: "text-[#0075de]", bg: "bg-[#0075de]/10" },
          { label: "Total Sent", value: String(stats.sent), icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Failed", value: String(stats.failed), icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Pending", value: String(stats.pending), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Today", value: String(stats.todayCount), icon: Mail, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] p-4 flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", s.bg)}>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
              <p className="text-lg font-black text-[var(--text-primary)]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Send Test Email */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Send className="h-4 w-4 text-[#0075de]" /> Send Test Email
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Recipient</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>
          <button
            onClick={handleSendTest}
            disabled={sendingTest || !testEmail.trim()}
            className="h-9 px-5 bg-[#0075de] text-white text-xs font-bold rounded-xl hover:bg-[#0063bd] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {sendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {sendingTest ? "Sending..." : "Send Test"}
          </button>
        </div>
        {testResult && (
          <div className={cn("mt-3 p-3 rounded-xl text-xs font-bold border", testResult.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-500")}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* Email Logs Table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#0075de]" /> Email Delivery Logs
          </h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search emails..."
                className="h-8 pl-9 pr-3 w-48 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
              />
            </div>
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--text-muted)]" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-8 pl-7 pr-6 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-1)]">
                {["Status", "Recipient", "Subject", "Template", "Sent At", "Message ID", "Actions"].map((h) => (
                  <th key={h} className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0075de] mx-auto mb-2" />
                    <p className="text-xs text-[var(--text-muted)]">Loading email logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Mail className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-30" />
                    <p className="text-xs text-[var(--text-muted)]">No email logs found</p>
                  </td>
                </tr>
              ) : logs.map((log) => {
                const badge = STATUS_BADGES[log.status] || STATUS_BADGES.pending;
                const BadgeIcon = badge.icon;
                return (
                  <tr key={log.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--surface-1)]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border", badge.bg, badge.text)}>
                        <BadgeIcon className="h-2.5 w-2.5" /> {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[180px]">{log.recipient_name || "—"}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">{log.recipient_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{log.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--surface-1)] px-2 py-0.5 rounded">
                        {log.template_key?.replace(/_/g, " ") || "ad-hoc"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[9px] text-[var(--text-muted)] font-mono truncate max-w-[120px]">{log.message_id || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {(log.status === "failed" || log.status === "bounced") && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="flex items-center gap-1 text-[9px] font-bold text-[#0075de] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {retryingId === log.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <p className="text-[10px] text-[var(--text-muted)]">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] px-2">{page}/{totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 w-7 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
