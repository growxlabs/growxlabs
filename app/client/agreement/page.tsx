"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

type ClientAgreementSummary = { agreementNumber: string; version: number; status: string; issuedAt: string | null };

export default function ClientAgreementsPage() {
  const query = useQuery({ queryKey: ["client", "agreements"], queryFn: async () => { const response = await fetch("/api/client/agreements", { cache: "no-store" }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to load contracts."); return body.agreements as ClientAgreementSummary[]; } });
  return <div className="mx-auto max-w-6xl space-y-7"><header><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Client Suite · Contracts</p><h1 className="mt-2 font-serif text-4xl text-slate-950">Service Agreements</h1><p className="mt-2 text-sm text-slate-600">Review agreements sent by GrowxLabs. Drafts and internal review records are not exposed here.</p></header><section className="overflow-hidden rounded-xl border border-slate-200 bg-white">{query.isPending ? <p className="p-6 text-sm text-slate-500">Loading contracts…</p> : query.error ? <p className="p-6 text-sm text-red-700">{query.error.message}</p> : !query.data?.length ? <p className="p-8 text-center text-sm text-slate-500">No service agreements are ready for your account.</p> : <div className="divide-y divide-slate-100">{query.data.map((agreement) => <Link key={agreement.agreementNumber} href={`/client/agreement/${encodeURIComponent(agreement.agreementNumber)}`} className="grid gap-3 p-5 hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center"><div><strong className="text-slate-950">{agreement.agreementNumber}</strong><p className="mt-1 text-xs text-slate-500">Version {agreement.version}</p></div><span className="text-sm text-slate-600">Issued {agreement.issuedAt ? new Date(agreement.issuedAt).toLocaleDateString("en-IN") : "—"}</span><span className="text-sm text-slate-600">{label(agreement.status)}</span><span className="font-semibold text-blue-700">Review Agreement →</span></Link>)}</div>}</section></div>;
}
