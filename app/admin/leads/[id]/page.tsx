"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, Mail, Phone, Globe, MapPin, 
  Star, MessageSquare, Save, CheckCircle2, 
  XCircle, RefreshCw, Edit3, ExternalLink, 
  Copy, Check, ChevronRight, 
  User, Clock, Send, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lead } from "@/types";
import { AdminLeadAssignment } from "@/components/admin/crm/AdminLeadAssignment";
import { AdminLeadSalesContext } from "@/components/admin/crm/AdminLeadSalesContext";

const PIPELINE_STAGES: { key: Lead["status"]; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "engaged", label: "Engaged" },
  { key: "qualified", label: "Qualified" },
  { key: "disqualified", label: "Disqualified" },
];

export default function LeadDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeOutreachTab, setActiveOutreachTab] = useState<"email" | "whatsapp" | "call">("email");

  // Dynamic Email Outreach States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [senderName, setSenderName] = useState("GrowX Labs");
  const [senderEmail, setSenderEmail] = useState("hello@growxlabs.tech");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to load lead record");
      }

      setLead(data);
      setNotes(data.notes || "");
      setEditValues({
        business_name: data.business_name || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        website_url: data.website_url || "",
        city: data.city || "",
        status: data.status || "new",
      });
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load lead record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      void fetchLead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateLead = async (updates: Partial<Lead>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      if (!res.ok || updated.error) {
        throw new Error(updated.error || "Failed to update record");
      }
      setLead(updated);
      setEditValues({
        business_name: updated.business_name || "",
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        website_url: updated.website_url || "",
        city: updated.city || "",
        status: updated.status || "new",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    await updateLead({ notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateOutreach = async () => {
    if (!lead?.id) return;
    setSaving(true);
    try {
      const res = await fetch("/api/leads/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchLead();
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to generate outreach");
    } finally {
      setSaving(false);
    }
  };

  const handleSendDynamicEmail = async () => {
    if (!lead?.email) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/send-email/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          toEmail: lead.email,
          fromName: senderName,
          fromEmail: senderEmail,
          subject: emailSubject,
          body: emailBody,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Email dispatch failed");
      }
      setShowEmailModal(false);
      await fetchLead();
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to dispatch email");
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[65vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
          <RefreshCw size={14} className="animate-spin text-[#0075de]" />
          Loading record...
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="h-[65vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-6 bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl text-center max-w-sm shadow-sm">
          <XCircle className="text-red-500 h-8 w-8 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Record Unavailable</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">{error || "The specified lead record was not found."}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/leads")} className="text-xs">
              Back to Leads
            </Button>
            <Button size="sm" onClick={fetchLead} className="text-xs bg-[#0075de] text-white">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === lead.status);

  return (
    <div className="space-y-6 pb-20">
      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/leads")}
            className="h-8 px-2.5 text-xs text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"
          >
            <ArrowLeft size={13} className="mr-1" /> Back
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span>CRM</span>
            <ChevronRight size={12} className="opacity-40" />
            <span>Leads</span>
            <ChevronRight size={12} className="opacity-40" />
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-xs">
              {lead.business_name || lead.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] font-medium"
          >
            <Edit3 size={13} className="mr-1.5 text-[var(--text-muted)]" /> Edit Record
          </Button>

          {lead.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://wa.me/${lead.phone?.replace(/\D/g, "")}`, "_blank")}
              className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] font-medium"
            >
              <Phone size={13} className="mr-1.5 text-emerald-600 dark:text-emerald-400" /> WhatsApp
            </Button>
          )}

          {lead.email && (
            <Button
              size="sm"
              onClick={() => {
                setSenderName("GrowX Labs");
                setSenderEmail("hello@growxlabs.tech");
                setEmailSubject(`Inquiry — ${lead.business_name || lead.name}`);
                setEmailBody(lead.outreach_content?.email || "");
                setShowEmailModal(true);
              }}
              className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
            >
              <Mail size={13} className="mr-1.5" /> Compose Email
            </Button>
          )}
        </div>
      </div>

      {/* PIPELINE LIFECYCLE STEPPER */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = stage.key === lead.status;
            const isCompleted = currentStageIndex > -1 && idx < currentStageIndex;

            return (
              <button
                key={stage.key}
                type="button"
                disabled={saving}
                onClick={() => updateLead({ status: stage.key })}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border text-center",
                  isActive
                    ? "bg-[#0075de] text-white border-[#0075de] shadow-sm"
                    : isCompleted
                    ? "bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]"
                    : "bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                )}
              >
                {isCompleted && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />}
                <span className="truncate">{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACCOUNT PROFILE & LOGS */}
        <div className="lg:col-span-8 space-y-6">
          {/* ACCOUNT PROFILE MATRIX */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {lead.business_name || lead.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    ID: {lead.id?.slice(0, 8)}
                  </span>
                  <span className="text-[var(--border-subtle)]">•</span>
                  <span className="text-[11px] text-[var(--text-muted)] capitalize">
                    Source: {lead.source || "System"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {lead.status}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Score: {Number(lead.lead_score || 0).toFixed(1)}
                </span>
              </div>
            </div>

            {/* DENSE KEY-VALUE MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Contact Person */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Contact Person
                </span>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <User size={13} className="text-[var(--text-muted)] shrink-0" />
                  {lead.name || "—"}
                </p>
              </div>

              {/* Direct Email */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Work Email
                  </span>
                  {lead.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.email!, "email")}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      title="Copy email"
                    >
                      {copiedKey === "email" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <Mail size={13} className="text-[var(--text-muted)] shrink-0" />
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="hover:underline truncate">
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {/* Direct Phone */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Direct Phone
                  </span>
                  {lead.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.phone!, "phone")}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedKey === "phone" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <Phone size={13} className="text-[var(--text-muted)] shrink-0" />
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="hover:underline truncate">
                      {lead.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {/* Website */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Website
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      lead.has_website ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {lead.has_website ? "Active" : "Missing"}
                  </span>
                </div>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <Globe size={13} className="text-[var(--text-muted)] shrink-0" />
                  {lead.website_url ? (
                    <a
                      href={lead.website_url.startsWith("http") ? lead.website_url : `https://${lead.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 truncate text-[#0075de]"
                    >
                      {lead.website_url.replace(/^https?:\/\//, "")}
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {/* Territory / City */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Territory / City
                </span>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--text-muted)] shrink-0" />
                  {lead.city || "—"}
                </p>
              </div>

              {/* Rating & Reviews */}
              <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Google Reviews
                </span>
                <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                  {lead.google_rating ? `${lead.google_rating} (${lead.reviews_count || 0} reviews)` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* INTERNAL NOTES */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <MessageSquare size={14} className="text-[var(--text-secondary)]" /> Account Notes
              </h2>
              <div className="flex items-center gap-3">
                {notesSaved && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={12} /> Saved
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={saving || notes === (lead.notes || "")}
                  className="h-7 px-3 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
                >
                  <Save size={12} className="mr-1" /> Save
                </Button>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record client requirements, call outcomes, or account details..."
              rows={4}
              className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#0075de] transition-colors resize-y leading-relaxed font-sans"
            />
          </div>

          {/* OUTBOUND COMMUNICATIONS & DISPATCH */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Send size={14} className="text-[var(--text-secondary)]" /> Outbound Communications
              </h2>

              {lead.outreach_generated ? (
                <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
                  {(["email", "whatsapp", "call"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveOutreachTab(tab)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer",
                        activeOutreachTab === tab
                          ? "bg-[var(--card)] text-[var(--text-primary)] shadow-xs"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerateOutreach}
                  disabled={saving}
                  className="h-7 px-3 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
                >
                  <RefreshCw size={12} className={cn("mr-1", saving && "animate-spin")} /> Generate Copy
                </Button>
              )}
            </div>

            {lead.outreach_generated && lead.outreach_content ? (
              <div className="space-y-4">
                <div className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-xs font-mono text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          activeOutreachTab === "email"
                            ? lead.outreach_content?.email || ""
                            : activeOutreachTab === "whatsapp"
                            ? lead.outreach_content?.whatsapp || ""
                            : lead.outreach_content?.call || "",
                          "outreach"
                        )
                      }
                      className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedKey === "outreach" ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                  {activeOutreachTab === "email" && lead.outreach_content.email}
                  {activeOutreachTab === "whatsapp" && lead.outreach_content.whatsapp}
                  {activeOutreachTab === "call" && lead.outreach_content.call}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {activeOutreachTab === "email" && lead.email && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSenderName("GrowX Labs");
                          setSenderEmail("hello@growxlabs.tech");
                          setEmailSubject(`Inquiry — ${lead.business_name || lead.name}`);
                          setEmailBody(lead.outreach_content?.email || "");
                          setShowEmailModal(true);
                        }}
                        className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
                      >
                        <Mail size={13} className="mr-1.5" /> Dispatch via Server
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `mailto:${lead.email}?subject=${encodeURIComponent(
                              `Inquiry — ${lead.business_name || lead.name}`
                            )}&body=${encodeURIComponent(lead.outreach_content?.email || "")}`
                          )
                        }
                        className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-primary)]"
                      >
                        Open Mail Client
                      </Button>
                    </>
                  )}

                  {activeOutreachTab === "whatsapp" && lead.phone && (
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${lead.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                            lead.outreach_content?.whatsapp || ""
                          )}`,
                          "_blank"
                        )
                      }
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      <Phone size={13} className="mr-1.5" /> Open WhatsApp Web
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateOutreach}
                    disabled={saving}
                    className="h-8 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-auto"
                  >
                    <RefreshCw size={12} className={cn("mr-1.5", saving && "animate-spin")} /> Regenerate Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Button
                  size="sm"
                  onClick={handleGenerateOutreach}
                  disabled={saving}
                  className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
                >
                  <RefreshCw size={12} className={cn("mr-1.5", saving && "animate-spin")} /> Generate Outreach Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: OWNERSHIP, PIPELINE CONTEXT & AUDIT */}
        <div className="lg:col-span-4 space-y-6">
          {/* ASSIGNMENT */}
          <AdminLeadAssignment leadId={id} />

          {/* PIPELINE EXECUTION CONTEXT */}
          <AdminLeadSalesContext leadId={id} />

          {/* AUDIT & ACTIVITY TIMELINE */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <Clock size={14} className="text-[var(--text-secondary)]" /> Audit Trail
            </h3>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-md bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={12} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Record Ingested</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {lead.created_at ? new Date(lead.created_at).toLocaleString() : "Date unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-md bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Current Stage</p>
                  <p className="text-[11px] text-[var(--text-muted)] capitalize">
                    {lead.status}
                  </p>
                </div>
              </div>

              {lead.outreach_generated && (
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                    <Send size={12} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Outreach Strategy</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Generated & ready</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT RECORD MODAL */}
      <AnimatePresence>
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-xl bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Edit3 size={15} className="text-[#0075de]" /> Edit Account Record
                </h3>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Account / Company Name</span>
                  <input
                    value={String(editValues.business_name || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, business_name: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Contact Person</span>
                  <input
                    value={String(editValues.name || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Work Email</span>
                  <input
                    value={String(editValues.email || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Direct Phone</span>
                  <input
                    value={String(editValues.phone || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Website URL</span>
                  <input
                    value={String(editValues.website_url || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, website_url: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)]">
                  <span>Territory / City</span>
                  <input
                    value={String(editValues.city || "")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  />
                </label>

                <label className="space-y-1 font-semibold text-[var(--text-secondary)] sm:col-span-2">
                  <span>Operational Stage</span>
                  <select
                    value={String(editValues.status || "new")}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, status: e.target.value as Lead["status"] }))}
                    className="w-full h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(false)}
                  className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={async () => {
                    await updateLead(editValues);
                    setEditOpen(false);
                  }}
                  className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC EMAIL DISPATCH MODAL */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-xl bg-[var(--card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Mail className="text-[#0075de]" size={16} /> Compose Outreach Email
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-8 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-md px-2.5 text-[var(--text-primary)] text-xs outline-none focus:border-[#0075de] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Sender Email
                    </label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full h-8 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-md px-2.5 text-[var(--text-primary)] text-xs outline-none focus:border-[#0075de] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Recipient
                  </label>
                  <input
                    type="text"
                    value={lead?.email || ""}
                    disabled
                    className="w-full h-8 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-md px-2.5 text-[var(--text-muted)] text-xs cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-8 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-md px-2.5 text-[var(--text-primary)] text-xs outline-none focus:border-[#0075de] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Message Body
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={7}
                    className="w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-md p-3 text-[var(--text-primary)] text-xs outline-none focus:border-[#0075de] transition-colors resize-none leading-relaxed font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailModal(false)}
                  className="h-8 text-xs border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendDynamicEmail}
                  disabled={emailSending}
                  className="h-8 text-xs bg-[#0075de] hover:bg-[#005bab] text-white font-medium px-4"
                >
                  {emailSending ? "Sending..." : "Dispatch Email"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
