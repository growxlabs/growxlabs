"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailSettings {
  id?: string;
  provider: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  enabled: boolean;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    provider: "resend",
    from_name: "GrowXLabs",
    from_email: "noreply@growxlabs.tech",
    reply_to: "hr@growxlabs.tech",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/recruitment/email-settings");
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } catch { /* use defaults */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/recruitment/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch { /* swallow */ } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Email Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Configure recruitment email delivery settings</p>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0075de]/10 rounded-lg">
              <Settings className="h-4 w-4 text-[#0075de]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Email Configuration</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Provider: {settings.provider.toUpperCase()}</p>
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
            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Email Provider</label>
            <div className="flex items-center gap-2 h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl">
              <Mail className="h-3.5 w-3.5 text-[#0075de]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">Resend</span>
              <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">Connected</span>
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
              value={settings.reply_to}
              onChange={(e) => setSettings((s) => ({ ...s, reply_to: e.target.value }))}
              placeholder="hr@growxlabs.tech"
              className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
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
