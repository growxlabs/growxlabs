"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Search, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Meeting = {
  id: string;
  meeting_number: string;
  title: string;
  status: string;
  scheduled_start: string | null;
  client_assessments?: { assessment_number: string | null } | null;
  companies?: { name: string } | null;
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

export function DiscoveryMeetingsClient() {
  const [q, setQ] = useState("");

  const query = useQuery<{ meetings: Meeting[] }>({
    queryKey: ["discovery-meetings", q],
    queryFn: async () => {
      const response = await fetch(`/api/admin/discovery-meetings${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load meetings.");
      return body;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3.5 top-3 text-zinc-400" />
          <input
            aria-label="Search discovery meetings"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search meeting, client or assessment…"
            className="w-full h-10 pl-9 pr-4 bg-[#141416] border border-[#27272a] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0075de]"
          />
        </div>

        <Link href="/admin/discovery-meetings/new">
          <Button className="h-10 px-4 bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2">
            <Plus size={14} /> Schedule Discovery Meeting
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      {query.isPending ? (
        <div className="h-64 bg-[#141416] border border-[#27272a] rounded-xl animate-pulse" />
      ) : query.error ? (
        <p role="alert" className="text-sm text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          {query.error.message}
        </p>
      ) : (
        <Card className="overflow-hidden bg-[#141416] border border-[#27272a] rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-black/40 border-b border-[#27272a] text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5">Meeting</th>
                  <th className="px-5 py-3.5">Client / Company</th>
                  <th className="px-5 py-3.5">Assessment</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] bg-transparent text-zinc-300">
                {query.data?.meetings.map((m) => {
                  const statusBadge = STATUS_CONFIG[m.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/discovery-meetings/${m.id}`}
                          className="font-mono font-bold text-white hover:text-[#0075de] transition-colors flex items-center gap-1.5"
                        >
                          {m.meeting_number}
                          <ExternalLink size={11} className="text-zinc-500" />
                        </Link>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{m.title}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-white">{m.companies?.name || "—"}</td>
                      <td className="px-5 py-4 font-mono text-zinc-400">
                        {m.client_assessments?.assessment_number || "—"}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {m.scheduled_start ? new Date(m.scheduled_start).toLocaleString() : "Not scheduled"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {label(m.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!query.data?.meetings.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                      No discovery meetings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
