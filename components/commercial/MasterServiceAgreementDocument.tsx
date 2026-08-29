"use client";

import type { MsaSnapshot } from "@/lib/commercial/msa";

function date(value: unknown) {
  if (!value) return "Not specified";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function money(value: unknown, currency: string) {
  const amount = Number(value);
  return `${currency} ${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function value(inputValue: unknown): string {
  if (inputValue === undefined || inputValue === null || inputValue === "") return "";
  if (typeof inputValue === "string" || typeof inputValue === "number" || typeof inputValue === "boolean") return String(inputValue);
  if (Array.isArray(inputValue)) return inputValue.map(value).filter(Boolean).join("; ");
  if (typeof inputValue === "object") {
    const record = inputValue as Record<string, unknown>;
    for (const key of ["content", "description", "text", "value", "title", "name", "label"]) if (record[key] !== undefined) return value(record[key]);
  }
  return "";
}

function Metadata({ label, content }: { label: string; content: unknown }) {
  return <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-900">{value(content) || "Not specified"}</dd></div>;
}

export function MasterServiceAgreementDocument({ snapshot, showInternal = false }: { snapshot: MsaSnapshot; showInternal?: boolean }) {
  const client = snapshot.parties.client as Record<string, unknown>;
  const growx = snapshot.parties.growxlabs as Record<string, unknown>;
  const totals = snapshot.commercial.totals as Record<string, unknown>;
  const currency = value(totals.currency) || "INR";
  return <article className="mx-auto max-w-5xl overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm print:shadow-none">
    <header className="border-b-2 border-slate-900 px-7 py-8 md:px-12">
      <div className="flex items-start justify-between gap-5"><div><div className="text-xl font-extrabold">GrowX<span className="text-[#1d5f8d]">Labs.tech</span></div><p className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">AI-Native Software Company</p></div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-red-800">Confidential</span></div>
      <p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#1d5f8d]">Commercial and Legal Document</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">{snapshot.document.title}</h1>
      <p className="mt-3 text-sm text-slate-600">Prepared from an immutable accepted commercial proposal and approved Scope of Work.</p>
      <dl className="mt-7 grid gap-x-8 gap-y-5 border-t border-slate-200 pt-5 sm:grid-cols-2 md:grid-cols-3">
        <Metadata label="Agreement number" content={snapshot.document.agreementNumber} /><Metadata label="Version" content={`Version ${snapshot.document.version}`} /><Metadata label="Client" content={client.legalName} />
        <Metadata label="Accepted proposal" content={`${snapshot.sourceReferences.proposalNumber} · Version ${snapshot.sourceReferences.proposalVersion}`} /><Metadata label="Scope of Work" content={snapshot.sourceReferences.scopeNumber} /><Metadata label="Proposal approval" content={snapshot.sourceReferences.proposalApprovalNumber} />
        <Metadata label="Issue date" content={date(snapshot.document.issuedAt)} /><Metadata label="Effective date" content={date(snapshot.document.effectiveAt)} /><Metadata label="Status" content={snapshot.document.status.replaceAll("_", " ")} />
      </dl>
    </header>
    {showInternal && snapshot.legalReviewFields.some((field) => field.status === "unresolved") && <section className="mx-7 mt-7 rounded border border-amber-300 bg-amber-50 p-5 md:mx-12"><h2 className="font-semibold text-amber-950">Internal review required</h2><p className="mt-1 text-sm text-amber-900">This draft is not ready to send. Resolve the following fields before client review.</p><ul className="mt-4 space-y-2 text-sm text-amber-900">{snapshot.legalReviewFields.filter((field) => field.status === "unresolved").map((field) => <li key={field.key}><strong>{field.label}:</strong> {field.reason}</li>)}</ul></section>}
    <section className="grid gap-5 border-b border-slate-200 px-7 py-8 md:grid-cols-2 md:px-12"><div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Client</h2><p className="mt-2 text-lg font-semibold">{value(client.legalName) || "Not specified"}</p><p className="mt-1 text-sm text-slate-600">{value(client.registeredAddress) || "Registered address not specified"}</p><p className="text-sm text-slate-600">{value(client.contactName) || "Contact not specified"}{client.contactDesignation ? ` · ${value(client.contactDesignation)}` : ""}</p></div><div><h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">GrowxLabs</h2><p className="mt-2 text-lg font-semibold">{value(growx.legalName) || "Legal entity to be confirmed"}</p><p className="mt-1 text-sm text-slate-600">{value(growx.registeredAddress) || "Registered address not specified"}</p><p className="text-sm text-slate-600">{value(growx.noticeEmail) || "Notice email not specified"}</p></div></section>
    <div className="px-7 md:px-12">{snapshot.sections.map((item) => <section key={item.key} className="border-b border-slate-200 py-9"><div className="mb-5 flex gap-4"><span className="font-serif text-xl text-[#1d5f8d]">{String(item.number).padStart(2, "0")}</span><h2 className="font-serif text-2xl">{item.title}</h2></div><div className="space-y-4 md:pl-11">{item.body.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{paragraph}</p>)}{item.items?.length ? <ul className="space-y-3">{item.items.map((entry, index) => <li key={index} className="flex gap-3 text-sm leading-7 text-slate-700"><span className="font-semibold text-[#1d5f8d]">•</span><span>{entry}</span></li>)}</ul> : null}{item.fields?.length ? <dl className="divide-y divide-slate-100 border-y border-slate-200">{item.fields.map((field, index) => <div key={index} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_2fr]"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}</dt><dd className={field.value ? "text-sm text-slate-800" : "text-sm italic text-amber-700"}>{field.value || "Internal review required"}</dd></div>)}</dl> : null}</div></section>)}</div>
    <section className="border-t-2 border-slate-900 px-7 py-8 md:px-12"><h2 className="font-serif text-2xl">Commercial summary</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4"><Metadata label="Engagement value" content={money(totals.grand_total, currency)} /><Metadata label="Taxable amount" content={money(totals.taxable_subtotal, currency)} /><Metadata label="Tax" content={money(totals.tax_amount, currency)} /><Metadata label="Currency" content={currency} /></dl></section>
    <footer className="flex justify-between gap-4 border-t-2 border-slate-900 px-7 py-6 text-xs text-slate-500 md:px-12"><span>{snapshot.document.agreementNumber} · Version {snapshot.document.version}</span><span>GrowxLabs · Confidential</span></footer>
  </article>;
}
