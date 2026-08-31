"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ContractorAgreementSnapshot } from "@/lib/contractors/agreements";
import { ContractorAgreementDocument } from "@/components/contractors/ContractorAgreementDocument";

type SigningData = { agreementNumber: string; version: number; status: string; expiresAt: string; snapshot: ContractorAgreementSnapshot };

export function ContractorSigningPage({ agreementNumber, token }: { agreementNumber: string; token: string }) {
  const [data, setData] = useState<SigningData | null>(null);
  const [form, setForm] = useState({ fullLegalName: "", roleOrCapacity: "Independent Contractor", email: "", phone: "", address: "", panOrTaxId: "", signature: "", consentToElectronicExecution: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setError("This secure signing link is missing."); setLoading(false); return; }
    fetch(`/api/contractor-agreements/sign/${encodeURIComponent(agreementNumber)}?token=${encodeURIComponent(token)}`, { cache: "no-store" }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error || "This signing link is unavailable."); setData(body); setForm((current) => ({ ...current, fullLegalName: body.snapshot?.parties?.contractor?.fullLegalName || "", email: body.snapshot?.parties?.contractor?.email || "", phone: body.snapshot?.parties?.contractor?.phone || "", address: body.snapshot?.parties?.contractor?.address || "", panOrTaxId: body.snapshot?.parties?.contractor?.panOrTaxId || "" })); }).catch((cause) => setError(cause instanceof Error ? cause.message : "This signing link is unavailable.")).finally(() => setLoading(false));
  }, [agreementNumber, token]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const response = await fetch(`/api/contractor-agreements/sign/${encodeURIComponent(agreementNumber)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...form }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to record your signature.");
      setComplete(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to record your signature."); }
    finally { setSubmitting(false); }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 px-5 py-12 text-center text-sm text-slate-600">Loading secure agreement…</main>;
  if (error && !data) return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-red-700">Signing unavailable</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">This link cannot be used</h1><p className="mt-3 text-sm text-slate-600">{error}</p></div></main>;
  if (!data) return null;
  if (complete) return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Signature submitted</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">Thank you</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your signature for {data.agreementNumber} has been recorded. GrowxLabs will countersign the agreement and retain the final executed PDF.</p></div></main>;
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-6xl"><header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">GrowxLabs secure signing</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">{data.agreementNumber}</h1><p className="mt-2 text-sm text-slate-600">Version {data.version} · {data.snapshot.parties.contractor.role} · This agreement is between GrowxLabs and you as an Independent Contractor.</p></header><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"><ContractorAgreementDocument snapshot={data.snapshot} /><form onSubmit={submit} className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your signing details</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Confirm and sign</h2><p className="mt-2 text-sm leading-6 text-slate-600">Review the complete agreement before signing. The signature will be attached to this exact version.</p><div className="mt-5 space-y-4"><Input label="Full legal name" value={form.fullLegalName} onChange={(value) => update("fullLegalName", value)} required /><Input label="Role or capacity" value={form.roleOrCapacity} onChange={(value) => update("roleOrCapacity", value)} required /><Input label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required /><Input label="Phone" value={form.phone} onChange={(value) => update("phone", value)} required /><label className="block text-sm font-semibold text-slate-800">Address<textarea required rows={3} value={form.address} onChange={(event) => update("address", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><Input label="PAN or tax ID (where applicable)" value={form.panOrTaxId} onChange={(value) => update("panOrTaxId", value)} /><Input label="Electronic signature" value={form.signature} onChange={(value) => update("signature", value)} placeholder="Type your full legal name" required /></div><label className="mt-5 flex gap-3 text-sm leading-5 text-slate-700"><input type="checkbox" checked={form.consentToElectronicExecution} onChange={(event) => update("consentToElectronicExecution", event.target.checked)} />I consent to electronic execution and confirm that the details above are accurate.</label>{error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={submitting || !form.consentToElectronicExecution} className="mt-5 w-full rounded-lg bg-[#0075de] px-4 py-3 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">{submitting ? "Submitting signature…" : "Sign agreement"}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">This secure link is single-use and expires {new Date(data.expiresAt).toLocaleString("en-IN")}.</p></form></div></div></main>;
}

function Input({ label, value, onChange, type = "text", placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) { return <label className="block text-sm font-semibold text-slate-800">{label}<input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>; }
