"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", departmentID: "", managerID: "", positions: "1" });
  const requisitions = useQuery<{ items: Requisition[] }>({ queryKey: ["requisitions"], queryFn: () => request("/requisitions") });
  const jobs = useQuery<{ items: Job[] }>({ queryKey: ["recruitment-jobs"], queryFn: () => request("/jobs") });
  const pipelines = useQuery<{ items: Pipeline[] }>({ queryKey: ["recruitment-pipelines"], queryFn: () => request("/pipelines") });

  async function createDefaultPipeline() {
    await request("/pipelines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      name: "Standard Hiring", isDefault: true, stages: [
        { key: "applied", name: "Applied", category: "active" },
        { key: "screening", name: "Screening", category: "active" },
        { key: "interview", name: "Interview", category: "active" },
        { key: "offer", name: "Offer Preparation", category: "active" },
        { key: "hired", name: "Hired", category: "hired", isTerminal: true },
        { key: "rejected", name: "Rejected", category: "rejected", isTerminal: true },
      ],
    }) });
    await client.invalidateQueries({ queryKey: ["recruitment-pipelines"] });
  }

  async function createRequisition(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await request("/requisitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        departmentID: form.departmentID, hiringManagerEmployeeID: form.managerID, title: form.title,
        employmentType: "full_time", businessJustification: "Workforce plan", numberOfPositions: Number(form.positions),
      }) });
      setForm({ title: "", departmentID: "", managerID: "", positions: "1" });
      await client.invalidateQueries({ queryKey: ["requisitions"] });
      setMessage("Draft requisition created.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed"); }
  }

  async function action(path: string, body?: unknown) {
    setMessage("");
    try {
      await request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      await Promise.all([client.invalidateQueries({ queryKey: ["requisitions"] }), client.invalidateQueries({ queryKey: ["recruitment-jobs"] })]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed"); }
  }

  async function createJob(requisition: Requisition) {
    const pipeline = pipelines.data?.items?.find(item => item.isDefault) || pipelines.data?.items?.[0];
    if (!pipeline) { setMessage("Create a hiring pipeline first."); return; }
    const slug = `${requisition.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${requisition.id.slice(0, 6)}`;
    try {
      await request("/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        requisitionID: requisition.id, pipelineID: pipeline.id, title: requisition.title, slug,
        summary: `Join our team as ${requisition.title}.`, employmentType: "full_time",
        description: {}, responsibilities: [], requirements: [], benefits: [], skills: [], location: "", isRemote: false,
      }) });
      await client.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      setMessage("Job draft created. Edit its content through the Jobs API before publishing.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed"); }
  }

  return <div className="space-y-6">
    <header className="border-b border-[var(--border-subtle)] pb-6">
      <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#0075de]">Recruitment operations</div>
      <h1 className="mt-2 text-3xl font-extrabold">Requisitions and jobs</h1>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">Run approval-gated workforce requests and publish approved openings.</p>
    </header>
    {message && <p className="rounded-lg bg-blue-500/10 p-3 text-xs text-[#0075de]">{message}</p>}
    {!pipelines.isLoading && !pipelines.data?.items?.length && <button onClick={() => void createDefaultPipeline()} className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white">Create standard hiring pipeline</button>}
    <form onSubmit={createRequisition} className="grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 md:grid-cols-4">
      <input required placeholder="Role title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs" />
      <input required placeholder="Department UUID" value={form.departmentID} onChange={e => setForm({ ...form, departmentID: e.target.value })} className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs" />
      <input required placeholder="Hiring manager employee UUID" value={form.managerID} onChange={e => setForm({ ...form, managerID: e.target.value })} className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs" />
      <div className="flex gap-2"><input required min="1" type="number" value={form.positions} onChange={e => setForm({ ...form, positions: e.target.value })} className="w-20 rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs" /><button className="flex-1 rounded-lg bg-[#0075de] px-3 py-2 text-xs font-bold text-white">Create draft</button></div>
    </form>
    <section><h2 className="mb-3 text-sm font-extrabold">Requisitions</h2><div className="grid gap-3">{requisitions.data?.items?.map(item => <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4"><div className="flex-1"><b className="text-sm">{item.title}</b><p className="text-[10px] text-[var(--text-muted)]">{item.numberOfPositions} position(s) · {item.status}</p></div>{item.status === "draft" && <button onClick={() => void action(`/requisitions/${item.id}/submit`)} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Submit</button>}{item.status.startsWith("pending_") && <><button onClick={() => void action(`/requisitions/${item.id}/approve`, { decision: "approved", comment: "Approved" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white">Approve step</button><button onClick={() => void action(`/requisitions/${item.id}/approve`, { decision: "rejected", comment: "Rejected" })} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white">Reject</button></>}{item.status === "approved" && <button onClick={() => void createJob(item)} className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-bold text-white">Create job draft</button>}</article>)}</div></section>
    <section><h2 className="mb-3 text-sm font-extrabold">Job postings</h2><div className="grid gap-3">{jobs.data?.items?.map(item => <article key={item.id} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4"><div className="flex-1"><b className="text-sm">{item.title}</b><p className="text-[10px] text-[var(--text-muted)]">/{item.slug} · {item.status}</p></div>{item.status === "draft" && <button onClick={() => void action(`/jobs/${item.id}/publish`)} className="rounded-lg bg-[#0075de] px-3 py-2 text-[10px] font-bold text-white">Publish</button>}</article>)}</div></section>
  </div>;
}
