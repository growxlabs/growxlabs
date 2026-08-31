"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Agreement = { id: string; agreement_number: string; status: string; version: number; contractor_full_legal_name: string | null; contractor_email: string | null; project_name: string | null; total_fee: number; payment_method: string; pdf_status: string; updated_at: string };
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

export default function ContractorAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/contractor-agreements", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load contractor agreements.");
      setAgreements(body.agreements || []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load contractor agreements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createAgreement() {
    setCreating(true); setError("");
    try {
      const response = await fetch("/api/admin/contractor-agreements", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to create contractor agreement.");
      window.location.assign(`/admin/contractor-agreements/${body.agreement.agreement?.id || body.agreement.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create contractor agreement.");
      setCreating(false);
    }
  }

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">People and delivery agreements</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Contractor Agreements</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Prepare, review, sign, and track the GrowxLabs Independent Contractor Agreement and IP Assignment. Nothing is sent automatically.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => void load()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Refresh</button><button type="button" disabled={creating} onClick={() => void createAgreement()} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">{creating ? "Creating…" : "Create GXL-ICA-2026-000001"}</button></div>
    </header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">Agreement register</h2><p className="mt-1 text-xs text-slate-500">Contractor agreements are separate from the Trionyx client MSA.</p></div>{loading ? <p className="p-6 text-sm text-slate-500">Loading agreements…</p> : !agreements.length ? <div className="p-10 text-center"><p className="text-sm text-slate-500">No contractor agreement has been created.</p><button type="button" onClick={() => void createAgreement()} className="mt-4 rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white">Create draft</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Agreement</th><th className="px-5 py-3">Contractor</th><th className="px-5 py-3">Project</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Version</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{agreements.map((agreement) => <tr key={agreement.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/admin/contractor-agreements/${agreement.id}`} className="font-semibold text-blue-700 hover:underline">{agreement.agreement_number}</Link><p className="mt-1 text-xs text-slate-500">{agreement.pdf_status === "generated" ? "PDF generated" : "PDF pending"}</p></td><td className="px-5 py-4 text-slate-700">{agreement.contractor_full_legal_name || "Details required"}<p className="mt-1 text-xs text-slate-500">{agreement.contractor_email || "Email required"}</p></td><td className="px-5 py-4 text-slate-700">{agreement.project_name || "Not specified"}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{label(agreement.status)}</span></td><td className="px-5 py-4 text-slate-600">v{agreement.version}</td><td className="px-5 py-4 text-right"><Link href={`/admin/contractor-agreements/${agreement.id}`} className="font-semibold text-slate-700 hover:underline">Open</Link></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
