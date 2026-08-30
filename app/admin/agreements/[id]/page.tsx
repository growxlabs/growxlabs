"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MasterServiceAgreementDocument } from "@/components/commercial/MasterServiceAgreementDocument";
import type { MsaSnapshot } from "@/lib/commercial/msa";

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

type AgreementData = {
  agreement: { agreementNumber: string; status: string; version: number; issuedAt: string | null; pdfStatus: string; proposalNumber: string | null; scopeNumber: string | null; clientName: string | null; companyName: string | null };
  snapshot: MsaSnapshot;
  activity: Array<{ event_type: string; created_at: string; metadata?: Record<string, unknown> | null }>;
  reviews: Array<{ id: string; decision: string; comment: string | null; unresolved_fields: string[]; decided_at: string; created_at: string }>;
  changeRequests: Array<{ id: string; requested_by_name: string; requested_change: string; reason: string; scope_impact: string; timeline_impact: string; commercial_impact: string; growxlabs_approval: Record<string, unknown>; client_approval: Record<string, unknown>; status: string; requested_at: string; resolved_at: string | null }>;
};

type GrowxSignature = { fullLegalName: string; designation: string; company: string; email: string; signature: string; consentToElectronicExecution: boolean };

export default function AdminAgreementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [growxSignature, setGrowxSignature] = useState<GrowxSignature>({ fullLegalName: "", designation: "", company: "GrowxLabs", email: "", signature: "", consentToElectronicExecution: false });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/agreements/${id}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load agreement.");
      setData(body);
      const existing = body.snapshot?.signatories?.find((signatory: { party: string }) => signatory.party === "growxlabs");
      if (existing) setGrowxSignature((current) => ({ ...current, fullLegalName: current.fullLegalName || existing.fullLegalName || "", designation: current.designation || existing.designation || "", company: current.company || existing.company || "GrowxLabs", email: current.email || existing.email || "" }));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to load agreement."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function action(name: string) {
    setBusy(true); setMessage("");
    try {
      const comment = name === "request_changes"
        ? window.prompt("Reason for changes") || ""
        : name === "resolve_changes"
          ? window.prompt("What did you update to resolve these changes?") || ""
          : undefined;
      const response = await fetch(`/api/admin/agreements/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name, comment }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Agreement action failed.");
      setMessage(name === "submit_review" ? "Draft submitted for internal review." : name === "resolve_changes" ? "Changes resolved. The agreement is back in Draft for editing and resubmission." : `Agreement ${label(name).toLowerCase()} recorded.`);
      setData(body);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Agreement action failed."); }
    finally { setBusy(false); }
  }

  async function saveLegalReview(values: Record<string, string>) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/agreements/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_legal_review", legalFields: values }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save legal review fields.");
      setData(body);
      setMessage("Legal review saved as a new Draft version. Submit it for internal review again.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to save legal review fields."); }
    finally { setBusy(false); }
  }

  async function signAsGrowxLabs() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/agreements/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sign", party: "growxlabs", signature: growxSignature }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to record GrowxLabs signature.");
      setData(body);
      setMessage("GrowxLabs signature recorded. The agreement is now fully executed.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to record GrowxLabs signature."); }
    finally { setBusy(false); }
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading Master Service Agreement…</p>;
  if (!data) return <p className="p-6 text-sm text-red-700">{message || "Agreement not found."}</p>;
  const agreement = data.agreement;
  const canSubmit = agreement.status === "draft";
  const canResolve = agreement.status === "changes_required";
  const canReview = agreement.status === "internal_review";
  const canReady = agreement.status === "approved_internal";
  const canSend = agreement.status === "ready_for_client";
  const canEditLegalReview = ["draft", "changes_required", "approved_internal"].includes(agreement.status);
  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/admin/agreements" className="text-xs font-semibold uppercase tracking-wider text-blue-700 hover:underline">← Master Service Agreements</Link><h1 className="mt-2 text-3xl font-semibold text-slate-950">{agreement.agreementNumber}</h1><p className="mt-2 text-sm text-slate-500">Version {agreement.version} · {label(agreement.status)} · Client: {agreement.companyName || agreement.clientName || "Not specified"}</p></div><div className="flex flex-wrap gap-2"><a href={`/api/admin/agreements/${id}/pdf`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">PDF preview</a>{canSubmit && <button type="button" disabled={busy} onClick={() => void action("submit_review")} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">Submit for internal review</button>}{canResolve && <button type="button" disabled={busy} onClick={() => void action("resolve_changes")} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">Resolve changes & return to draft</button>}{canReview && <><button type="button" disabled={busy} onClick={() => void action("request_changes")} className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">Request changes</button><button type="button" disabled={busy} onClick={() => void action("approve")} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">Approve internally</button></>}{canReady && <button type="button" disabled={busy} onClick={() => void action("mark_ready")} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">Mark ready for client</button>}{canSend && <button type="button" disabled={busy} onClick={() => void action("send")} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">Send agreement</button>}</div></header>
    {message && <p role="status" className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}
    {canEditLegalReview && data.snapshot.legalReviewFields.some((field) => field.status === "unresolved") && <LegalReviewEditor key={`${agreement.version}-${agreement.status}`} snapshot={data.snapshot} busy={busy} onSave={saveLegalReview} />}
    {["sent", "viewed", "signing"].includes(agreement.status) && !data.snapshot.execution && <GrowxSignatureEditor value={growxSignature} busy={busy} onChange={setGrowxSignature} onSubmit={signAsGrowxLabs} />}
    <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 md:grid-cols-4"><Meta label="Proposal" value={agreement.proposalNumber} /><Meta label="Scope of Work" value={agreement.scopeNumber} /><Meta label="Issue date" value={agreement.issuedAt ? new Date(agreement.issuedAt).toLocaleDateString("en-IN") : "Not specified"} /><Meta label="PDF status" value={label(agreement.pdfStatus)} /></section>
    <MasterServiceAgreementDocument snapshot={data.snapshot} showInternal />
    {agreement.status === "changes_required" && <ReviewRequests reviews={data.reviews} changeRequests={data.changeRequests} />}
    <section className="grid gap-6 md:grid-cols-2"><Review title="Unresolved legal fields" items={data.snapshot.legalReviewFields.filter((field) => field.status === "unresolved").map((field) => `${field.label}: ${field.reason}`)} empty="No unresolved legal fields." /><Review title="Lifecycle activity" items={data.activity.map((item) => `${label(item.event_type)} · ${new Date(item.created_at).toLocaleString("en-IN")}`)} empty="No activity recorded." /></section>
  </div>;
}

function Meta({ label, value }: { label: string; value: string | null }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-900">{value || "—"}</p></div>; }
function Review({ title, items, empty }: { title: string; items: string[]; empty: string }) { return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">{title}</h2>{items.length ? <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">{items.map((item, index) => <li key={index} className="border-l-2 border-slate-200 pl-3">{item}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>}</section>; }
function GrowxSignatureEditor({ value, busy, onChange, onSubmit }: { value: GrowxSignature; busy: boolean; onChange: (value: GrowxSignature) => void; onSubmit: () => Promise<void> }) {
  const update = (key: keyof GrowxSignature, next: string | boolean) => onChange({ ...value, [key]: next });
  return <section className="rounded-xl border border-blue-300 bg-blue-50 p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">GrowxLabs execution</p><h2 className="mt-1 text-lg font-semibold text-slate-950">Sign this agreement as GrowxLabs</h2><p className="mt-1 text-sm text-slate-700">The client signature is recorded. Complete the GrowxLabs authorised signatory record to execute the agreement.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold text-slate-800">Full legal name<input value={value.fullLegalName} onChange={(event) => update("fullLegalName", event.target.value)} className="mt-2 w-full rounded border border-blue-200 bg-white p-3 font-normal" /></label><label className="text-sm font-semibold text-slate-800">Designation<input value={value.designation} onChange={(event) => update("designation", event.target.value)} className="mt-2 w-full rounded border border-blue-200 bg-white p-3 font-normal" /></label><label className="text-sm font-semibold text-slate-800">Company<input value={value.company} onChange={(event) => update("company", event.target.value)} className="mt-2 w-full rounded border border-blue-200 bg-white p-3 font-normal" /></label><label className="text-sm font-semibold text-slate-800">Email<input type="email" value={value.email} onChange={(event) => update("email", event.target.value)} className="mt-2 w-full rounded border border-blue-200 bg-white p-3 font-normal" /></label><label className="text-sm font-semibold text-slate-800 md:col-span-2">Signature<input value={value.signature} onChange={(event) => update("signature", event.target.value)} placeholder="Type the authorised signatory name" className="mt-2 w-full rounded border border-blue-200 bg-white p-3 font-normal" /></label></div><label className="mt-5 flex gap-3 text-sm text-slate-800"><input type="checkbox" checked={value.consentToElectronicExecution} onChange={(event) => update("consentToElectronicExecution", event.target.checked)} />I consent to electronic execution of this Service Agreement.</label><button type="button" disabled={busy || !value.fullLegalName || !value.designation || !value.company || !value.email || !value.signature || !value.consentToElectronicExecution} onClick={() => void onSubmit()} className="mt-5 rounded-lg bg-[#0075de] px-5 py-3 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">{busy ? "Recording signature…" : "Sign as GrowxLabs"}</button></section>;
}
function LegalReviewEditor({ snapshot, busy, onSave }: { snapshot: MsaSnapshot; busy: boolean; onSave: (values: Record<string, string>) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(snapshot.legalReviewFields.map((field) => [field.key, field.value || ""])));
  const unresolved = snapshot.legalReviewFields.filter((field) => field.status === "unresolved");
  return <form onSubmit={(event) => { event.preventDefault(); void onSave(values); }} className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm"><div><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Legal review editor</p><h2 className="mt-1 text-lg font-semibold text-amber-950">Complete the {unresolved.length} required legal fields</h2><p className="mt-1 text-sm text-amber-900">Enter approved legal terms. Saving creates a new immutable draft version and resets internal approval so it can be reviewed again.</p></div><div className="mt-5 grid gap-4 md:grid-cols-2">{snapshot.legalReviewFields.map((field) => { const isDate = field.key === "effectiveDate"; return <label key={field.key} className="block text-sm font-semibold text-slate-900">{field.label}<span className="mt-1 block text-xs font-normal leading-5 text-amber-900">{field.reason}</span>{isDate ? <input required type="date" value={(values[field.key] || "").slice(0, 10)} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /> : <textarea required value={values[field.key] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} rows={3} placeholder={field.key.endsWith("Signatory") ? "Full legal name | designation | email" : "Enter the approved legal wording"} className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />}</label>; })}</div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" disabled={busy} className="rounded-lg bg-[#0075de] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005bab] disabled:opacity-50">{busy ? "Saving legal review…" : "Save legal review & create draft"}</button><p className="text-xs text-amber-900">All fields are required before client release.</p></div></form>;
}
function ReviewRequests({ reviews, changeRequests }: { reviews: AgreementData["reviews"]; changeRequests: AgreementData["changeRequests"] }) {
  const requestedReviews = reviews.filter((review) => review.decision === "changes_required");
  const openRequests = changeRequests.filter((request) => request.status === "open");
  return <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Action required</p><h2 className="mt-1 text-lg font-semibold text-amber-950">Review and resolve requested changes</h2><p className="mt-1 text-sm text-amber-900">Make the required updates, then use “Resolve changes & return to draft” above to resubmit this agreement.</p></div><span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">{openRequests.length || requestedReviews.length} open</span></div>{openRequests.length ? <div className="mt-4 space-y-3">{openRequests.map((request) => <article key={request.id} className="rounded-lg border border-amber-200 bg-white p-4"><p className="text-sm font-semibold text-slate-900">{request.requested_change}</p><p className="mt-1 text-sm text-slate-700">{request.reason}</p><p className="mt-2 text-xs text-slate-500">Requested by {request.requested_by_name} · {new Date(request.requested_at).toLocaleString("en-IN")}</p></article>)}</div> : requestedReviews.length ? <div className="mt-4 space-y-3">{requestedReviews.map((review) => <article key={review.id} className="rounded-lg border border-amber-200 bg-white p-4"><p className="text-sm font-semibold text-slate-900">{review.comment || "Changes were requested during internal review."}</p><p className="mt-2 text-xs text-slate-500">Recorded {new Date(review.decided_at || review.created_at).toLocaleString("en-IN")}</p></article>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-amber-300 bg-white/60 p-4 text-sm text-amber-900">No written request was attached. Review the unresolved legal fields below before resolving.</p>}</section>;
}
