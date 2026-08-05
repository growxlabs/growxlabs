"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText, Save, Eye, Loader2, CheckCircle, ChevronRight, Code, Type, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_LABELS: Record<string, { label: string; color: string }> = {
  application_received: { label: "Application Received", color: "bg-emerald-500" },
  interview_invite: { label: "Interview Invitation", color: "bg-amber-500" },
  assessment_invite: { label: "Assessment Invitation", color: "bg-orange-500" },
  offer_extended: { label: "Offer Extended", color: "bg-violet-500" },
  rejection: { label: "Rejection Notice", color: "bg-red-500" },
  stage_update: { label: "Stage Update", color: "bg-blue-500" },
  general: { label: "General Communication", color: "bg-slate-500" },
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recruitment/email-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
      if (!selected && data.templates?.length > 0) {
        selectTemplate(data.templates[0]);
      }
    } catch { /* swallow */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const selectTemplate = (t: EmailTemplate) => {
    setSelected(t);
    setEditSubject(t.subject);
    setEditHtml(t.html_body);
    setPreviewMode(false);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/recruitment/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, subject: editSubject, html_body: editHtml }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) => prev.map((t) => (t.id === data.template.id ? data.template : t)));
        setSelected(data.template);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch { /* swallow */ } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const res = await fetch("/api/admin/recruitment/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id, is_active: !template.is_active }),
      });
      const data = await res.json();
      if (data.template) {
        setTemplates((prev) => prev.map((t) => (t.id === data.template.id ? data.template : t)));
        if (selected?.id === data.template.id) setSelected(data.template);
      }
    } catch { /* swallow */ }
  };

  // Replace variables with sample data for preview
  const previewHtml = editHtml
    .replace(/\{\{candidateName\}\}/g, "Alex Johnson")
    .replace(/\{\{jobTitle\}\}/g, "Senior Full-Stack Developer")
    .replace(/\{\{companyName\}\}/g, "GrowXLabs")
    .replace(/\{\{applicationRef\}\}/g, "GXL-APP-2026-00042")
    .replace(/\{\{interviewDate\}\}/g, "August 15, 2026")
    .replace(/\{\{interviewTime\}\}/g, "2:00 PM IST")
    .replace(/\{\{interviewLink\}\}/g, "https://meet.google.com/abc-defg-hij")
    .replace(/\{\{interviewType\}\}/g, "Video Call")
    .replace(/\{\{assessmentLink\}\}/g, "https://assessment.growxlabs.tech/test-123")
    .replace(/\{\{assessmentDeadline\}\}/g, "August 20, 2026")
    .replace(/\{\{currentStage\}\}/g, "SCREENING")
    .replace(/\{\{newStage\}\}/g, "INTERVIEW")
    .replace(/\{\{portalLink\}\}/g, "https://growxlabs.tech/careers");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Email Templates</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Customize recruitment email templates sent to candidates</p>
      </div>

      <div className="flex gap-4 min-h-[600px]">
        {/* Template List Sidebar */}
        <div className="w-72 shrink-0 bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Templates</h2>
          </div>
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#0075de] mx-auto" />
              </div>
            ) : templates.map((t) => {
              const meta = TEMPLATE_LABELS[t.template_key] || { label: t.name, color: "bg-slate-500" };
              const isSelected = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group",
                    isSelected
                      ? "bg-[#0075de]/10 border border-[#0075de]/20"
                      : "hover:bg-[var(--surface-1)] border border-transparent"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0", meta.color, !t.is_active && "opacity-30")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-bold truncate", isSelected ? "text-[#0075de]" : "text-[var(--text-primary)]")}>
                      {meta.label}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] truncate">{t.subject}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!t.is_active && (
                      <span className="text-[8px] font-bold uppercase text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">OFF</span>
                    )}
                    <ChevronRight className={cn("h-3 w-3 text-[var(--text-muted)]", isSelected && "text-[#0075de]")} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
                <p className="text-sm text-[var(--text-muted)]">Select a template to edit</p>
              </div>
            </div>
          ) : (
            <>
              {/* Editor Header */}
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    {TEMPLATE_LABELS[selected.template_key]?.label || selected.name}
                  </h2>
                  <button
                    onClick={() => handleToggleActive(selected)}
                    className={cn("flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-1 rounded-full cursor-pointer transition-all", selected.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500")}
                  >
                    {selected.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                    {selected.is_active ? "Active" : "Disabled"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={cn("flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border", previewMode ? "bg-[#0075de]/10 text-[#0075de] border-[#0075de]/20" : "text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-1)]")}
                  >
                    {previewMode ? <Code className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#0075de] text-white text-xs font-bold hover:bg-[#0063bd] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveSuccess ? <CheckCircle className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Variables Bar */}
              {selected.variables?.length > 0 && (
                <div className="px-5 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] mr-2">Variables:</span>
                  {selected.variables.map((v: string) => (
                    <button
                      key={v}
                      onClick={() => {
                        const tag = `{{${v}}}`;
                        setEditHtml((prev) => prev + tag);
                      }}
                      className="inline-flex items-center text-[9px] font-mono font-bold text-[#0075de] bg-[#0075de]/5 px-1.5 py-0.5 rounded mr-1 mb-1 hover:bg-[#0075de]/10 cursor-pointer transition-all"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Subject Line */}
              <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
                <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                  <Type className="h-3 w-3 inline mr-1" /> Subject Line
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#0075de]/40"
                />
              </div>

              {/* Body Editor / Preview */}
              <div className="flex-1 overflow-auto">
                {previewMode ? (
                  <div className="p-6">
                    <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    className="w-full h-full min-h-[400px] p-5 bg-transparent text-xs font-mono text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter HTML email body..."
                    spellCheck={false}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
