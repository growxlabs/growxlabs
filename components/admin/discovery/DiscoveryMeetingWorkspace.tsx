"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Building2,
  FileText,
  Clock,
  Video,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Shield,
  Send
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Meeting = {
  id: string;
  meeting_number: string;
  title: string;
  status: string;
  meeting_type: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  timezone: string | null;
  platform: string | null;
  meeting_url: string | null;
  location: string | null;
  agenda: Array<{ order: number; title: string; draft?: boolean }>;
  client_assessments?: { assessment_number: string | null; assessment_answers?: Array<{ question_key: string; value: unknown }> } | null;
  companies?: { name: string } | null;
  discovery_meeting_notes?: Array<{ id: string; section_key: string; content: Record<string, unknown> }>;
  discovery_findings?: Array<{ id: string; finding_number: string; title: string; priority: string }>;
  discovery_requirements?: Array<{ id: string; requirement_number: string; title: string; status: string }>;
  discovery_action_items?: Array<{ id: string; action: string; status: string }>;
};

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" },
  scheduled: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  confirmed: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  information_required: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  follow_up_required: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  closed: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" }
};

export function DiscoveryMeetingWorkspace({ meetingId }: { meetingId: string }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [risks, setRisks] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [nextAction, setNextAction] = useState("");

  const query = useQuery<{ meeting: Meeting }>({
    queryKey: ["discovery-meeting", meetingId],
    queryFn: async () => {
      const r = await fetch(`/api/admin/discovery-meetings/${meetingId}`);
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || "Unable to load meeting.");
      return b;
    }
  });

  const update = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await fetch(`/api/admin/discovery-meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error || "Unable to update meeting.");
      return b;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discovery-meeting", meetingId] })
  });

  if (query.isPending) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-[#141416] rounded-xl border border-[#27272a]" />
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <div className="h-96 bg-[#141416] rounded-xl border border-[#27272a]" />
          <div className="h-96 bg-[#141416] rounded-xl border border-[#27272a]" />
          <div className="h-96 bg-[#141416] rounded-xl border border-[#27272a]" />
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
        {query.error.message}
      </div>
    );
  }

  const m = query.data.meeting;
  const statusBadge = STATUS_CONFIG[m.status] || STATUS_CONFIG.draft;

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* --- Breadcrumb & Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#27272a] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/admin/discovery-meetings" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} />
              Discovery Meetings
            </Link>
            <span>/</span>
            <span className="font-mono text-zinc-300 font-semibold">{m.meeting_number}</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">{m.title}</h1>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
              {label(m.status)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#141416] border border-[#27272a] rounded-lg px-3 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Status:</span>
            <select
              aria-label="Meeting status"
              value={m.status}
              onChange={(e) => update.mutate({ status: e.target.value })}
              className="bg-transparent border-0 text-white font-bold text-xs uppercase tracking-wide focus:outline-none cursor-pointer"
            >
              {[
                "draft",
                "scheduled",
                "confirmed",
                "in_progress",
                "completed",
                "information_required",
                "follow_up_required",
                "closed",
                "cancelled"
              ].map((s) => (
                <option key={s} value={s} className="bg-neutral-950 text-white">
                  {label(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- 3-Column Workspace --- */}
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* ══ COLUMN 1: MEETING CONTEXT ══ */}
        <aside className="space-y-4">
          <Card className="p-5 bg-[#141416] border-[#27272a] rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Meeting Context</span>
              <span className="font-mono text-xs font-bold text-emerald-400">{m.meeting_number}</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5">
                  <Building2 size={12} className="text-zinc-400" />
                  Client / Company
                </dt>
                <dd className="font-semibold text-white">{m.companies?.name || "Company not linked"}</dd>
              </div>

              <div className="border-t border-[#27272a]/60 pt-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5">
                  <FileText size={12} className="text-zinc-400" />
                  Linked Assessment
                </dt>
                <dd className="font-mono text-zinc-300">{m.client_assessments?.assessment_number || "—"}</dd>
              </div>

              <div className="border-t border-[#27272a]/60 pt-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-zinc-400" />
                  Scheduled Time
                </dt>
                <dd className="font-semibold text-zinc-200">
                  {m.scheduled_start ? new Date(m.scheduled_start).toLocaleString() : "Not scheduled"}
                </dd>
              </div>

              <div className="border-t border-[#27272a]/60 pt-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5">
                  <Video size={12} className="text-zinc-400" />
                  Meeting Platform
                </dt>
                <dd className="font-semibold text-zinc-200">{m.platform || "Not selected"}</dd>
              </div>
            </div>
          </Card>
        </aside>

        {/* ══ COLUMN 2: WORKSPACE (AGENDA & DISCUSSION NOTES) ══ */}
        <main className="space-y-6">
          {/* Agenda Section */}
          <Card className="p-6 bg-[#141416] border-[#27272a] rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#27272a] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Meeting Agenda</h3>
                <p className="text-xs text-zinc-400">Structured discovery topics and client review sequence.</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Draft — Review
              </span>
            </div>

            <div className="space-y-2.5">
              {m.agenda.map((item) => (
                <div
                  key={item.order}
                  className="p-3.5 bg-black/40 border border-[#27272a] rounded-xl flex items-center gap-3 text-xs text-zinc-200 hover:border-[#3f3f46] transition-all"
                >
                  <span className="w-6 h-6 rounded-md bg-[#0075de]/10 border border-[#0075de]/20 text-[#0075de] font-bold flex items-center justify-center text-xs shrink-0">
                    {item.order}
                  </span>
                  <span className="font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Discussion Notes Section */}
          <Card className="p-6 bg-[#141416] border-[#27272a] rounded-xl shadow-sm space-y-4">
            <div className="border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-white text-base">Discussion Notes</h3>
              <p className="text-xs text-zinc-400">Internal consultant notes are confidential and never shown to clients.</p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={7}
              placeholder="Record the discussion points, requirements, and key takeaways by topic…"
              className="w-full bg-black/40 border border-[#27272a] focus:border-[#0075de] text-zinc-200 rounded-xl p-4 text-xs leading-relaxed focus:outline-none placeholder:text-zinc-600"
            />

            <div className="flex justify-end">
              <Button
                onClick={() => update.mutate({ status: "in_progress" })}
                className="h-9 px-4 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2"
              >
                <Save size={14} /> Save Notes
              </Button>
            </div>
          </Card>
        </main>

        {/* ══ COLUMN 3: INTERNAL CONSULTING ══ */}
        <aside className="space-y-4">
          <Card className="p-5 bg-[#141416] border-[#27272a] rounded-xl space-y-4 shadow-sm">
            <div className="border-b border-[#27272a] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Internal Consulting</span>
              <p className="text-[11px] text-zinc-500 mt-0.5">Strategic consultant assessments</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Business Risks (Internal Only)
                </label>
                <textarea
                  rows={3}
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  placeholder="Identify technical or timeline risks…"
                  className="w-full bg-black/40 border border-[#27272a] focus:border-[#0075de] text-zinc-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  AI & Automation Opportunities
                </label>
                <textarea
                  rows={3}
                  value={opportunities}
                  onChange={(e) => setOpportunities(e.target.value)}
                  placeholder="Draft high-leverage AI opportunities…"
                  className="w-full bg-black/40 border border-[#27272a] focus:border-[#0075de] text-zinc-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Recommended Next Action
                </label>
                <textarea
                  rows={3}
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Consultant next step recommendation…"
                  className="w-full bg-black/40 border border-[#27272a] focus:border-[#0075de] text-zinc-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
