"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Agreement = { id: string; agreementNumber: string; status: string; version: number; clientName: string | null; companyName: string | null; proposalNumber: string | null; scopeNumber: string | null; issuedAt: string | null; updatedAt: string; pdfStatus: string };
type EligibleProposal = { proposalNumber: string; version: number; clientName: string | null; companyName: string | null };

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

export default function AdminAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [proposals, setProposals] = useState<EligibleProposal[]>([]);
  const [proposalNumber, setProposalNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/agreements", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load Master Service Agreements.");
      setAgreements(body.agreements || []);
      setProposals(body.eligibleProposals || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load agreements."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function compile(event: React.FormEvent) {
    event.preventDefault();
    if (!proposalNumber) return;
    setCreating(true); setError("");
    try {
      const response = await fetch("/api/admin/agreements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proposalNumber }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to compile agreement.");
      window.location.assign(`/admin/agreements/${body.agreement.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to compile agreement."); setCreating(false); }
  }

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Active commercial and legal architecture</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Master Service Agreements</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Compile accepted commercial sources into structured agreements for internal review. Nothing is sent automatically.</p></div><button type="button" onClick={() => void load()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Refresh</button></header>
    <form onSubmit={compile} className="rounded-xl border border-blue-200 bg-blue-50 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium text-slate-800">Accepted proposal to compile<select value={proposalNumber} onChange={(event) => setProposalNumber(event.target.value)} required className="mt-2 h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-slate-900"><option value="">Select an accepted proposal…</option>{proposals.map((proposal) => <option key={proposal.proposalNumber} value={proposal.proposalNumber}>{proposal.proposalNumber} · Version {proposal.version} · {proposal.companyName || proposal.clientName || "Client"}</option>)}</select></label><button type="submit" disabled={creating || !proposalNumber} className="h-11 rounded-lg bg-[#0075de] px-5 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">{creating ? "Compiling draft…" : "Compile draft"}</button></div><p className="mt-3 text-xs text-blue-900">The compiler reads the accepted immutable proposal snapshot and approved Scope of Work, creates Version 1, renders the dedicated PDF, and leaves the agreement in Draft.</p></form>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">Agreement register</h2><p className="mt-1 text-xs text-slate-500">Client-visible status begins only after explicit internal approval and sending.</p></div>{loading ? <p className="p-6 text-sm text-slate-500">Loading agreements…</p> : !agreements.length ? <p className="p-8 text-center text-sm text-slate-500">No active Master Service Agreements have been compiled.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Agreement</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Version</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{agreements.map((agreement) => <tr key={agreement.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/admin/agreements/${agreement.id}`} className="font-semibold text-blue-700 hover:underline">{agreement.agreementNumber}</Link><p className="mt-1 text-xs text-slate-500">{agreement.pdfStatus === "generated" ? "PDF generated" : "PDF pending"}</p></td><td className="px-5 py-4 text-slate-700">{agreement.companyName || agreement.clientName || "Not specified"}</td><td className="px-5 py-4 text-xs text-slate-500">{agreement.proposalNumber || "—"}<br />{agreement.scopeNumber || "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{label(agreement.status)}</span></td><td className="px-5 py-4 text-slate-600">v{agreement.version}</td><td className="px-5 py-4 text-right"><Link href={`/admin/agreements/${agreement.id}`} className="font-semibold text-slate-700 hover:underline">Review</Link></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
