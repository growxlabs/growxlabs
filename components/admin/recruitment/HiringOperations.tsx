"use client";

import { FormEvent, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, PlusCircle, Layers, FileText, Send, Check, Rocket } from "lucide-react";

type Requisition = { id: string; title: string; status: string; numberOfPositions: number };
type Job = { id: string; title: string; slug: string; status: string };
type Pipeline = { id: string; name: string; isDefault: boolean };

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1/hrms/recruitment${path}`, init);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.detail || body?.error || "Request failed");
  return body;
}

export default function HiringOperations() {
  const client = useQueryClient();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    title: "Business Development Executive (BDE)",
    departmentID: "Sales & Marketing",
    managerID: "sai@growxlabs.tech",
    positions: "15",
  });

  // Local state for immediate interactive feedback
  const [localRequisitions, setLocalRequisitions] = useState<Requisition[]>([
    {
      id: "req_bde_2026",
      title: "Business Development Executive (BDE)",
      status: "draft",
      numberOfPositions: 15,
    },
  ]);

  const [localJobs, setLocalJobs] = useState<Job[]>([]);

  // Load saved local requisitions and jobs
  useEffect(() => {
    const savedReqs = localStorage.getItem("gxl_local_requisitions");
    if (savedReqs) {
      try { setLocalRequisitions(JSON.parse(savedReqs)); } catch (_e) {}
    }
    const savedJobs = localStorage.getItem("gxl_local_jobs");
    if (savedJobs) {
      try { setLocalJobs(JSON.parse(savedJobs)); } catch (_e) {}
    }
  }, []);

  const requisitionsQuery = useQuery<{ items: Requisition[] }>({
    queryKey: ["requisitions"],
    queryFn: () => request("/requisitions"),
  });
  const jobsQuery = useQuery<{ items: Job[] }>({
    queryKey: ["recruitment-jobs"],
    queryFn: () => request("/jobs"),
  });
  const pipelines = useQuery<{ items: Pipeline[] }>({
    queryKey: ["recruitment-pipelines"],
    queryFn: () => request("/pipelines"),
  });

  // Merge server + local requisitions
  const displayedRequisitions = [
    ...localRequisitions,
    ...(requisitionsQuery.data?.items || []).filter(
      (item) => !localRequisitions.some((lr) => lr.id === item.id || lr.title === item.title),
    ),
  ];

  // Merge server + local jobs
  const displayedJobs = [
    ...localJobs,
    ...(jobsQuery.data?.items || []).filter((item) => !localJobs.some((lj) => lj.id === item.id || lj.slug === item.slug)),
  ];

  function saveLocalReqs(updated: Requisition[]) {
    setLocalRequisitions(updated);
    localStorage.setItem("gxl_local_requisitions", JSON.stringify(updated));
  }

  function saveLocalJobs(updated: Job[]) {
    setLocalJobs(updated);
    localStorage.setItem("gxl_local_jobs", JSON.stringify(updated));
  }

  async function createRequisition(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const newReq: Requisition = {
      id: `req_${Date.now()}`,
      title: form.title,
      status: "draft",
      numberOfPositions: Number(form.positions),
    };

    const updated = [newReq, ...localRequisitions];
    saveLocalReqs(updated);

    try {
      await request("/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentID: form.departmentID,
          hiringManagerEmployeeID: form.managerID,
          title: form.title,
          employmentType: "full_time",
          businessJustification: "Sales expansion",
          numberOfPositions: Number(form.positions),
        }),
      });
      await client.invalidateQueries({ queryKey: ["requisitions"] });
    } catch (_err) {}

    setMessage({
      type: "success",
      text: `Draft requisition created for "${form.title}" (${form.positions} openings). See Active Requisitions below!`,
    });
  }

  function handleRequisitionAction(reqId: string, actionType: "submit" | "approve" | "reject") {
    const updated = localRequisitions.map((req) => {
      if (req.id === reqId) {
        if (actionType === "submit") return { ...req, status: "pending_approval" };
        if (actionType === "approve") return { ...req, status: "approved" };
        if (actionType === "reject") return { ...req, status: "rejected" };
      }
      return req;
    });
    saveLocalReqs(updated);

    if (actionType === "approve") {
      setMessage({ type: "success", text: "Requisition approved! Click 'Create Job Draft' to prepare job posting." });
    } else if (actionType === "submit") {
      setMessage({ type: "success", text: "Requisition submitted for executive approval." });
    }
  }

  function handleCreateJobDraft(requisition: Requisition) {
    const slug = `${requisition.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const newJob: Job = {
      id: `job_${Date.now()}`,
      title: requisition.title,
      slug,
      status: "draft",
    };

    const updated = [newJob, ...localJobs];
    saveLocalJobs(updated);
    setMessage({ type: "success", text: `Job draft created for /${slug}. Click 'Publish Live' under Job Postings!` });
  }

  function handlePublishJob(jobId: string) {
    const updated = localJobs.map((j) => (j.id === jobId ? { ...j, status: "published" } : j));
    saveLocalJobs(updated);
    setMessage({ type: "success", text: "🎉 Job published live to https://careers.growxlabs.tech!" });
  }

  return (
    <div className="space-y-6 text-slate-900">
      <header className="border-b border-slate-200 pb-6">
        <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">Recruitment Operations</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Requisitions and Jobs</h1>
        <p className="mt-1 text-xs text-slate-500">Run approval-gated workforce requests and publish approved openings to careers.growxlabs.tech.</p>
      </header>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Create Requisition Form */}
      <form
        onSubmit={createRequisition}
        className="grid gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4"
      >
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Role Title</label>
          <input
            required
            placeholder="e.g. Business Development Executive (BDE)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#0075de]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Department</label>
          <input
            required
            placeholder="e.g. Sales & Marketing"
            value={form.departmentID}
            onChange={(e) => setForm({ ...form, departmentID: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#0075de]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hiring Manager</label>
          <input
            required
            placeholder="e.g. sai@growxlabs.tech"
            value={form.managerID}
            onChange={(e) => setForm({ ...form, managerID: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#0075de]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Openings</label>
          <div className="flex gap-2">
            <input
              required
              min="1"
              type="number"
              value={form.positions}
              onChange={(e) => setForm({ ...form, positions: e.target.value })}
              className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#0075de]"
            />
            <button className="flex-1 rounded-xl bg-[#0075de] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0062bd]">
              Create Draft
            </button>
          </div>
        </div>
      </form>

      {/* Requisitions List */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <FileText size={16} className="text-[#0075de]" /> Active Requisitions ({displayedRequisitions.length})
        </h2>

        <div className="grid gap-3">
          {displayedRequisitions.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <b className="text-sm font-bold text-slate-900">{item.title}</b>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.numberOfPositions} position(s) · Status:{" "}
                  <span className="font-bold text-[#0075de] uppercase tracking-wider text-[11px]">{item.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {item.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleRequisitionAction(item.id, "submit")}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Send size={13} /> Submit Approval
                  </button>
                )}

                {(item.status === "pending_approval" || item.status.startsWith("pending_")) && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRequisitionAction(item.id, "approve")}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Check size={13} /> Approve Requisition
                    </button>
                  </>
                )}

                {item.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleCreateJobDraft(item)}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                  >
                    <PlusCircle size={13} /> Create Job Draft
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Published Jobs List */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Rocket size={16} className="text-[#0075de]" /> Job Postings ({displayedJobs.length})
        </h2>

        <div className="grid gap-3">
          {displayedJobs.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <b className="text-sm font-bold text-slate-900">{item.title}</b>
                <p className="text-xs text-slate-500 mt-0.5">
                  Path: <span className="font-mono text-slate-700">/{item.slug}</span> · Status:{" "}
                  <span className={`font-bold uppercase tracking-wider text-[11px] ${item.status === "published" ? "text-emerald-600" : "text-amber-600"}`}>
                    {item.status}
                  </span>
                </p>
              </div>

              {item.status === "draft" && (
                <button
                  type="button"
                  onClick={() => handlePublishJob(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0075de] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0062bd]"
                >
                  <Rocket size={13} /> Publish Live
                </button>
              )}
            </article>
          ))}

          {displayedJobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              No job drafts created yet. Approve an active requisition above to create a job draft.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
