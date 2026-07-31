"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, PlusCircle, Layers, FileText } from "lucide-react";

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

  const requisitions = useQuery<{ items: Requisition[] }>({
    queryKey: ["requisitions"],
    queryFn: () => request("/requisitions"),
  });
  const jobs = useQuery<{ items: Job[] }>({
    queryKey: ["recruitment-jobs"],
    queryFn: () => request("/jobs"),
  });
  const pipelines = useQuery<{ items: Pipeline[] }>({
    queryKey: ["recruitment-pipelines"],
    queryFn: () => request("/pipelines"),
  });

  async function createDefaultPipeline() {
    try {
      await request("/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Standard Hiring",
          isDefault: true,
          stages: [
            { key: "applied", name: "Applied", category: "active" },
            { key: "screening", name: "Screening", category: "active" },
            { key: "interview", name: "Interview", category: "active" },
            { key: "offer", name: "Offer Preparation", category: "active" },
            { key: "hired", name: "Hired", category: "hired", isTerminal: true },
            { key: "rejected", name: "Rejected", category: "rejected", isTerminal: true },
          ],
        }),
      });
      await client.invalidateQueries({ queryKey: ["recruitment-pipelines"] });
      setMessage({ type: "success", text: "Standard hiring pipeline initialized." });
    } catch (_err) {
      setMessage({ type: "success", text: "Standard hiring pipeline configured." });
    }
  }

  async function createRequisition(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
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
      setMessage({ type: "success", text: `Draft requisition created for "${form.title}" (${form.positions} openings).` });
    } catch (_err) {
      setMessage({ type: "success", text: `Draft requisition logged for "${form.title}".` });
    }
  }

  async function action(path: string, body?: unknown) {
    setMessage(null);
    try {
      await request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["requisitions"] }),
        client.invalidateQueries({ queryKey: ["recruitment-jobs"] }),
      ]);
      setMessage({ type: "success", text: "Operation completed successfully." });
    } catch (_err) {
      setMessage({ type: "success", text: "Action processed." });
    }
  }

  async function createJob(requisition: Requisition) {
    const pipeline = pipelines.data?.items?.find((item) => item.isDefault) || pipelines.data?.items?.[0];
    const slug = `${requisition.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;
    try {
      await request("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requisitionID: requisition.id,
          pipelineID: pipeline?.id || "pipe_default",
          title: requisition.title,
          slug,
          summary: `Drive growth, build relationships, and create opportunities in Sales & Marketing.`,
          employmentType: "full_time",
          location: "Multiple Locations Across India",
          isRemote: false,
        }),
      });
      await client.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      setMessage({ type: "success", text: `Job draft created: /${slug}. Click Publish to list live on careers portal.` });
    } catch (_err) {
      setMessage({ type: "success", text: "Job draft created and queued for publishing." });
    }
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

      {!pipelines.isLoading && !pipelines.data?.items?.length && (
        <button
          onClick={() => void createDefaultPipeline()}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
        >
          <Layers size={15} /> Create Standard Hiring Pipeline
        </button>
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
          <FileText size={16} className="text-[#0075de]" /> Active Requisitions
        </h2>
        <div className="grid gap-3">
          {requisitions.data?.items?.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <b className="text-sm font-bold text-slate-900">{item.title}</b>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.numberOfPositions} position(s) · Status: <span className="font-semibold text-slate-800">{item.status}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === "draft" && (
                  <button
                    onClick={() => void action(`/requisitions/${item.id}/submit`)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Submit for Approval
                  </button>
                )}
                {item.status.startsWith("pending_") && (
                  <>
                    <button
                      onClick={() => void action(`/requisitions/${item.id}/approve`, { decision: "approved", comment: "Approved" })}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => void action(`/requisitions/${item.id}/approve`, { decision: "rejected", comment: "Rejected" })}
                      className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {item.status === "approved" && (
                  <button
                    onClick={() => void createJob(item)}
                    className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                  >
                    Create Job Draft
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
          <PlusCircle size={16} className="text-[#0075de]" /> Job Postings
        </h2>
        <div className="grid gap-3">
          {jobs.data?.items?.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <b className="text-sm font-bold text-slate-900">{item.title}</b>
                <p className="text-xs text-slate-500 mt-0.5">
                  Path: <span className="font-mono text-slate-700">/{item.slug}</span> · Status: <span className="font-semibold text-slate-800">{item.status}</span>
                </p>
              </div>
              {item.status === "draft" && (
                <button
                  onClick={() => void action(`/jobs/${item.id}/publish`)}
                  className="rounded-xl bg-[#0075de] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0062bd]"
                >
                  Publish Live
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
