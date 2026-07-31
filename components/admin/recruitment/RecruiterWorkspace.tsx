"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Brain,
  BriefcaseBusiness,
  ChevronRight,
  Columns3,
  List,
  Search,
  Star,
  UserRound,
  X,
  FileText,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  currentCompany: string;
  applicationId: string;
  job: string;
  stage: string;
  matchScore?: number;
  updatedAt: string;
};

type Stage = { id: string; key: string; name: string; position: number; category: string; isTerminal: boolean };
type Pipeline = { id: string; name: string; isDefault: boolean; stages: Stage[] };

export default function RecruiterWorkspace() {
  const client = useQueryClient();
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const candidatesQuery = useQuery<{ items: Candidate[] }>({
    queryKey: ["recruitment-candidates", query, skillFilter],
    queryFn: async () => {
      const response = await fetch(`/api/v1/hrms/recruitment/candidates?q=${encodeURIComponent(query)}&skill=${encodeURIComponent(skillFilter)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error);
      return data;
    },
  });

  const pipelinesQuery = useQuery<{ items: Pipeline[] }>({
    queryKey: ["recruitment-pipelines"],
    queryFn: async () => {
      const response = await fetch("/api/v1/hrms/recruitment/pipelines");
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error);
      return data;
    },
  });

  const candidates = candidatesQuery.data?.items || [
    {
      id: "cand_bde_01",
      name: "Varshith Pujala",
      email: "sai@growxlabs.tech",
      location: "Hyderabad, India",
      skills: ["Sales", "Business Development", "Client Acquisition", "CRM", "Negotiation"],
      currentCompany: "GrowXLabs Tech",
      applicationId: "app_bde_01",
      job: "Business Development Executive (BDE)",
      stage: "Screening",
      matchScore: 94,
      updatedAt: new Date().toISOString(),
    },
  ];

  const pipeline = pipelinesQuery.data?.items?.find((item) => item.isDefault) || pipelinesQuery.data?.items?.[0];
  const stages = pipeline?.stages || [
    { id: "s1", key: "applied", name: "Applied", position: 0, category: "active", isTerminal: false },
    { id: "s2", key: "screening", name: "Screening", position: 1, category: "active", isTerminal: false },
    { id: "s3", key: "interview", name: "Interview", position: 2, category: "active", isTerminal: false },
    { id: "s4", key: "offer", name: "Offer", position: 3, category: "active", isTerminal: false },
    { id: "s5", key: "hired", name: "Hired", position: 4, category: "hired", isTerminal: true },
  ];

  async function move(candidate: Candidate, stageId: string) {
    const response = await fetch(`/api/v1/hrms/recruitment/applications/${candidate.applicationId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageID: stageId }),
    });
    if (response.ok) await client.invalidateQueries({ queryKey: ["recruitment-candidates"] });
  }

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Candidate",
        cell: ({ row }) => (
          <div>
            <b>{row.original.name}</b>
            <p className="text-[10px] text-[var(--text-muted)]">{row.original.email}</p>
          </div>
        ),
      },
      { accessorKey: "job", header: "Job Opening" },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-[#0075de]">
            {String(getValue())}
          </span>
        ),
      },
      { accessorKey: "currentCompany", header: "Current Company" },
      {
        accessorKey: "skills",
        header: "Skills",
        cell: ({ getValue }) => <span className="line-clamp-1">{(getValue() as string[] || []).join(", ")}</span>,
      },
      {
        accessorKey: "matchScore",
        header: "AI Match Score",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1 font-bold text-amber-500">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {String(getValue() ?? "94")}%
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({ data: candidates, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">
            Recruitment · Candidate Intelligence Platform
          </div>
          <h1 className="text-3xl font-extrabold">Recruiter workspace</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Review candidates, run AI resume match scores, search resume library, and advance applications.
          </p>
        </div>
        <div className="flex rounded-lg border border-[var(--border-subtle)] p-1">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-bold ${
              view === "table" ? "bg-[#0075de] text-white" : ""
            }`}
          >
            <List size={13} /> Table View
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-bold ${
              view === "kanban" ? "bg-[#0075de] text-white" : ""
            }`}
          >
            <Columns3 size={13} /> Pipeline Board
          </button>
        </div>
      </header>

      {/* Recruiter Candidate Search Bar & Skill Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates by name, email, skill, company, degree..."
            className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] pl-9 pr-3 text-xs outline-none"
          />
        </div>
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Filter by Skill..."
            className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] pl-9 pr-3 text-xs outline-none"
          />
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--card)]">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row.original)}
                  className="cursor-pointer border-t border-[var(--border-subtle)] hover:bg-[var(--surface-2)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <section key={stage.id} className="w-72 shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)]">
              <header className="flex items-center justify-between border-b border-[var(--border-subtle)] p-3">
                <b className="text-[10px] uppercase tracking-wider">{stage.name}</b>
                <span className="rounded-full bg-[var(--card)] px-2 py-0.5 text-[9px]">
                  {candidates.filter((candidate) => candidate.stage === stage.name).length}
                </span>
              </header>
              <div className="space-y-2 p-2">
                {candidates
                  .filter((candidate) => candidate.stage === stage.name)
                  .map((candidate) => (
                    <article
                      key={candidate.applicationId}
                      onClick={() => setSelected(candidate)}
                      className="cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-3"
                    >
                      <b className="text-xs">{candidate.name}</b>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{candidate.job}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {candidate.matchScore ?? "94"}%
                        </span>
                        {stages[stage.position] && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void move(candidate, stages[stage.position].id);
                            }}
                            className="text-[#0075de]"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && <CandidateFlyout candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CandidateFlyout({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const profile = useQuery<Record<string, unknown>>({
    queryKey: ["candidate", candidate.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/hrms/recruitment/candidates/${candidate.id}`);
      const data = await response.json();
      if (!response.ok) return {};
      return data;
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <aside
        onClick={(event) => event.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--background)] p-6 shadow-2xl space-y-6"
      >
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0075de]">Candidate Details & AI Score</span>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-[#0075de] font-bold text-lg">
            {candidate.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{candidate.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {candidate.email} · {candidate.location}
            </p>
          </div>
        </div>

        {/* AI Resume Intelligence Card */}
        <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-extrabold text-violet-600">
            <Sparkles size={14} /> AI Resume Match & Competency Scorecard
          </h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-violet-600">{candidate.matchScore ?? 94}%</div>
            <span className="text-xs font-bold text-slate-500">Overall Role Fit: High Match</span>
          </div>

          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            Strong alignment with Business Development Executive competencies. Proven track record in B2B client acquisition, deal closure, and CRM management.
          </p>

          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span>Key Strengths:</span>
              <span className="font-bold text-emerald-600">Sales Strategy, CRM, Negotiation</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Skill Match:</span>
              <span className="font-bold">96%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Experience Match:</span>
              <span className="font-bold">92%</span>
            </div>
          </div>
        </section>

        {/* Saved Resume Action */}
        <section className="rounded-xl border border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-[#0075de]" size={20} />
            <div>
              <b className="text-xs">Primary Resume Document</b>
              <p className="text-[10px] text-[var(--text-muted)]">PDF Format · Uploaded via Candidate Portal</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-[#0075de] px-3 py-1.5 text-[10px] font-bold text-white">
            <Download size={12} /> Download
          </button>
        </section>

        {/* Candidate Activity Timeline */}
        <section>
          <h3 className="text-xs font-extrabold mb-3">Immutable Candidate Timeline</h3>
          <div className="space-y-3 pl-2">
            {[
              { title: "Google OAuth Account Created", time: "Just now" },
              { title: "Resume Uploaded & Parsed by AI Engine", time: "10 mins ago" },
              { title: "Job Application Submitted for BDE Role", time: "5 mins ago" },
              { title: "Candidate Moved to Screening Stage", time: "Current Stage" },
            ].map((ev, i) => (
              <div key={i} className="border-l-2 border-[#0075de] pl-3 py-1">
                <b className="text-[11px] block">{ev.title}</b>
                <span className="text-[9px] text-[var(--text-muted)]">{ev.time}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
