"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle, Mail, ToggleLeft, ToggleRight, AlertCircle, Send, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailSettings {
  id?: string;
  provider: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  enabled: boolean;
  internal_audit_enabled?: boolean;
  internal_audit_recipients?: string[];
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    provider: "resend",
    from_name: "GrowXLabs",
    from_email: "noreply@growxlabs.tech",
    reply_to: "hr@growxlabs.tech",
    enabled: true,
    internal_audit_enabled: true,
    internal_audit_recipients: ["sai@growxlabs.tech"],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/recruitment/email-settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load email settings.");
        if (data.settings) {
          setSettings((current) => ({
            ...current,
            ...data.settings,
            provider: data.settings.provider || "resend",
            reply_to: data.settings.reply_to || "",
          }));
        }
        setConfigured(Boolean(data.connection?.configured));
        setSetupRequired(Boolean(data.connection?.setupRequired));
        if (data.connection?.message) setError(data.connection.message);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load email settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/recruitment/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save email settings.");
      if (data.settings) setSettings((current) => ({ ...current, ...data.settings, reply_to: data.settings.reply_to || "" }));
      setSaveSuccess(true);
      setNotice("Sender settings saved. New recruitment emails will use these details.");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save email settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/recruitment/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Test email could not be sent.");
      setNotice(`Test email sent to ${testTo}. Message ID: ${data.messageId}`);
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Test email could not be sent.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0075de]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Email Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Control the sender candidates see and confirm delivery before using recruitment emails.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <GuideCard icon={<Settings className="h-4 w-4" />} title="1. Set up delivery" description="Choose the sender name, sender address, reply-to address, and whether sending is enabled." />
        <GuideCard icon={<FileText className="h-4 w-4" />} title="2. Edit templates" description="Use Email Templates to change the wording used for invitations, offers, and updates." />
        <GuideCard icon={<History className="h-4 w-4" />} title="3. Check delivery" description="Use Email Status to see sent, failed, bounced, and retried emails for every candidate." />
      </div>

      {error && (
        <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0075de]/10 rounded-lg">
              <Settings className="h-4 w-4 text-[#0075de]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Email Configuration</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Manage the details shown on every recruitment email.</p>
            </div>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border",
              settings.enabled
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {settings.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {settings.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-5">
          {/* Provider */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Email Delivery Service</label>
            <div className="flex items-center gap-2 h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl">
              <Mail className="h-3.5 w-3.5 text-[#0075de]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">Resend</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold", configured ? "text-emerald-600 bg-emerald-500/10" : "text-amber-700 bg-amber-500/10")}>
                {configured ? "Ready to send" : "Needs attention"}
              </span>
            </div>
          </div>

          {/* From Name */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Sender Name</label>
            <input
              type="text"
              value={settings.from_name}
              onChange={(e) => setSettings((s) => ({ ...s, from_name: e.target.value }))}
              placeholder="GrowXLabs"
              className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>

          {/* From Email */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Sender Email</label>
            <input
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings((s) => ({ ...s, from_email: e.target.value }))}
              placeholder="noreply@growxlabs.tech"
              className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>

          {/* Reply To */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Reply-To Email</label>
            <input
              type="email"
              value={settings.reply_to || ""}
              onChange={(e) => setSettings((s) => ({ ...s, reply_to: e.target.value }))}
              placeholder="hr@growxlabs.tech"
              className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Internal recruitment copies</h3>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">Send an internal audit copy of every candidate email. Candidates never see these recipients.</p>
              </div>
              <button type="button" onClick={() => setSettings((s) => ({ ...s, internal_audit_enabled: !s.internal_audit_enabled }))} className="shrink-0 text-xs font-bold text-[#0075de]">
                {settings.internal_audit_enabled !== false ? "Enabled" : "Disabled"}
              </button>
            </div>
            <label className="mt-3 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">Audit recipients</label>
            <input
              type="text"
              value={(settings.internal_audit_recipients || ["sai@growxlabs.tech"]).join(", ")}
              onChange={(e) => setSettings((s) => ({ ...s, internal_audit_recipients: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
              placeholder="sai@growxlabs.tech, hr@growxlabs.tech"
              className="mt-1.5 w-full h-9 px-3 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>
        </div>

        <div className="mx-6 mb-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
          <div className="flex items-start gap-3">
            <Send className="mt-0.5 h-4 w-4 text-[#0075de]" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Send a test email</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Send a test to confirm candidates will receive recruitment emails correctly.</p>
              {setupRequired && <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">Saving is temporarily unavailable. Please contact your system administrator to complete the email service setup.</p>}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@company.com" className="h-9 min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40" />
                <button onClick={handleTest} disabled={testing || !testTo || !configured} className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[#0075de]/30 px-4 text-xs font-bold text-[#0075de] disabled:cursor-not-allowed disabled:opacity-50">
                  {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Send Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || setupRequired}
            className="flex items-center gap-2 h-9 px-6 bg-[#0075de] text-white text-xs font-bold rounded-xl hover:bg-[#0063bd] transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveSuccess ? <CheckCircle className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4">
      <div className="mb-2 text-[#0075de]">{icon}</div>
      <h2 className="text-xs font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
