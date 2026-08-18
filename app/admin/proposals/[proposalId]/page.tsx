"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProposalDocument } from "@/components/proposal/ProposalDocument";
const split = (v: any) =>
  Array.isArray(v)
    ? v.map((x) => (typeof x === "string" ? x : x?.content || x?.title || x?.name || "")).join("\n")
    : v?.content || v || "";
const list = (v: string) =>
  v
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
const previewCommercials = (form: any) => {
  const pricing = form.pricing.map((line: any) => {
    const quantity = Number(line.quantity || 0), unitPrice = Number(line.unitPrice || 0), discount = Number(line.discount || 0), gross = quantity * unitPrice;
    return { description: line.description, quantity, unit: line.unit, unit_price: unitPrice, discount, subtotal: Math.max(0, gross - discount) };
  });
  const subtotal = pricing.reduce((sum: number, line: any) => sum + line.quantity * line.unit_price, 0), discount = pricing.reduce((sum: number, line: any) => sum + line.discount, 0), taxable = Math.max(0, subtotal - discount), taxAmount = taxable * Number(form.taxRate || 0) / 100;
  return { pricing, totals: { currency: form.currency, subtotal, discount, taxable_subtotal: taxable, tax_type: form.taxType, tax_rate: Number(form.taxRate || 0), tax_amount: taxAmount, grand_total: taxable + taxAmount } };
};
export default function AdminProposalWorkspace() {
  const { proposalId } = useParams<{ proposalId: string }>(),
    q = useQuery({
      queryKey: ["admin", "proposal", proposalId],
      queryFn: async () => {
        const r = await fetch(`/api/admin/proposals/${proposalId}`, {
            cache: "no-store",
          }),
          b = await r.json();
        if (!r.ok) throw new Error(b.error);
        return b;
      },
    }),
    [form, setForm] = useState<any>(null),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    draftKey = `growxlabs:proposal-draft:${proposalId}`;
  useEffect(() => {
    const p = q.data?.proposal;
    if (p && !form) {
      const serverForm = {
        executiveSummary: split(p.client_content?.executiveSummary),
        scope: split(p.client_content?.scope),
        deliverables: split(p.client_content?.deliverables),
        timeline: split(p.client_content?.timeline),
        assumptions: split(p.client_content?.assumptions),
        exclusions: split(p.client_content?.exclusions),
        terms: split(p.client_content?.terms),
        nextSteps: split(p.client_content?.nextSteps),
        pricing: (p.pricing || []).map((x: any) => ({
          description: x.description,
          quantity: x.quantity,
          unit: x.unit,
          unitPrice: x.unit_price,
          discount: x.discount,
        })),
        paymentMilestones: p.payment_schedule || [],
        currency: p.commercial_totals?.currency || "INR",
        taxType: p.commercial_totals?.tax_type || "GST",
        taxRate: p.commercial_totals?.tax_rate || 0,
        validUntil: p.valid_until || "",
        internalNotes: p.internal_notes || "",
      };
      try { const recovered = localStorage.getItem(draftKey); setForm(recovered ? { ...serverForm, ...JSON.parse(recovered) } : serverForm); }
      catch { setForm(serverForm); }
    }
  }, [q.data, form, draftKey]);
  useEffect(() => { if (form) localStorage.setItem(draftKey, JSON.stringify(form)); }, [form, draftKey]);
  async function action(action: string, extra: any = {}) {
    setBusy(true);
    setMessage("");
    const proposal =
      action === "save"
        ? {
            clientContent: {
              executiveSummary: form.executiveSummary,
              scope: list(form.scope),
              deliverables: list(form.deliverables),
              timeline: list(form.timeline),
              milestones: list(form.timeline),
              assumptions: list(form.assumptions),
              exclusions: list(form.exclusions),
              terms: list(form.terms),
              nextSteps: list(form.nextSteps),
            },
            pricing: form.pricing,
            tax: { type: form.taxType, rate: Number(form.taxRate) },
            currency: form.currency,
            paymentMilestones: form.paymentMilestones,
            validUntil: form.validUntil,
            internalNotes: form.internalNotes,
          }
        : undefined;
    const r = await fetch(`/api/admin/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, proposal, ...extra }),
      }),
      b = await r.json();
    setBusy(false);
    if (!r.ok) return setMessage(b.error || "Action failed.");
    setMessage("Proposal updated.");
    localStorage.removeItem(draftKey);
    setForm(null);
    await q.refetch();
  }
  if (q.isPending || !form) return <p>Loading proposal workspace…</p>;
  if (q.error) return <p className="text-red-700">{q.error.message}</p>;
  const liveCommercials = previewCommercials(form),
    p = q.data.proposal,
    refs = q.data.references || {},
    editable = ["draft", "changes_required"].includes(p.status),
    snapshot = {
      proposal: {
        id: p.id,
        number: p.proposal_number,
        version: p.version,
        issuedAt: p.sent_at || new Date().toISOString(),
      },
      preparedFor: { name: refs.client, company: refs.company },
      clientContent: {
        executiveSummary: form.executiveSummary,
        scope: list(form.scope),
        deliverables: list(form.deliverables),
        timeline: list(form.timeline),
        assumptions: list(form.assumptions),
        exclusions: list(form.exclusions),
        terms: list(form.terms),
        nextSteps: list(form.nextSteps),
      },
      pricing: liveCommercials.pricing,
      commercialTotals: liveCommercials.totals,
      paymentSchedule: form.paymentMilestones,
      validUntil: form.validUntil,
    };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-700">Commercial Proposal</p>
          <h1 className="mt-2 text-3xl font-bold">{p.proposal_number}</h1>
          <p className="mt-2 capitalize text-slate-600">
            Version {p.version} · {p.status.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPreview(!preview)} className="rounded border px-4 py-2">
            {preview ? "Edit" : "Preview as Client"}
          </button>
          {p.status === "draft" && (
            <button
              disabled={busy}
              onClick={() => action("submit_review")}
              className="rounded bg-slate-900 px-4 py-2 text-white"
            >
              Submit for Internal Review
            </button>
          )}
          {p.status === "internal_review" && (
            <>
              <button
                disabled={busy}
                onClick={() =>
                  action("return", {
                    comment: prompt("Required return reason") || "",
                  })
                }
                className="rounded border px-4 py-2"
              >
                Return for Changes
              </button>
              <button
                disabled={busy}
                onClick={() => action("approve")}
                className="rounded bg-emerald-700 px-4 py-2 text-white"
              >
                Approve
              </button>
            </>
          )}
          {p.status === "ready_for_client" && (
            <button
              disabled={busy}
              onClick={() =>
                confirm(`Send ${p.proposal_number} to the linked client?`) && action("send")
              }
              className="rounded bg-blue-700 px-4 py-2 text-white"
            >
              Send Proposal
            </button>
          )}
          {p.status === "request_changes" && (
            <button
              disabled={busy}
              onClick={() => action("create_revision")}
              className="rounded bg-blue-700 px-4 py-2 text-white"
            >
              Create Revision
            </button>
          )}
        </div>
      </header>
      {message && <p className="rounded border bg-white p-3 text-sm">{message}</p>}
      {editable && !preview && <p className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Changes are automatically preserved in this browser. Use Save Draft to validate and save them permanently.</p>}
      {preview ? (
        <ProposalDocument snapshot={snapshot} status={p.status} />
      ) : (
        <>
          <section className="grid gap-3 rounded border bg-white p-5 md:grid-cols-4">
            <Meta l="Client" v={refs.client} />
            <Meta l="Company" v={refs.company} />
            <Meta l="Assessment" v={refs.assessment} />
            <Meta l="Deal" v={refs.deal} />
            <Meta l="Solution Architecture" v={refs.architecture} />
            <Meta l="Scope of Work" v={refs.scope} />
            <Meta l="Created" v={new Date(p.created_at).toLocaleString()} />
            <Meta l="Last Updated" v={new Date(p.updated_at).toLocaleString()} />
          </section>
          <section className="space-y-5 rounded border bg-white p-6">
            {[
              ["01 Executive Summary", "executiveSummary"],
              ["02 Scope", "scope"],
              ["03 Deliverables", "deliverables"],
              ["04 Timeline & Milestones", "timeline"],
              ["05 Assumptions", "assumptions"],
              ["06 Exclusions", "exclusions"],
              ["10 Terms & Conditions", "terms"],
              ["12 Client Notes / Next Steps", "nextSteps"],
            ].map(([label, key]) => (
              <label key={key} className="block text-sm font-bold">
                {label}
                <textarea
                  disabled={!editable}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-2 min-h-28 w-full rounded border p-3 font-normal disabled:bg-slate-50"
                />
              </label>
            ))}
            <h2 className="text-lg font-bold">07 Commercial Pricing</h2>
            <p className="text-sm text-slate-600">Enter the agreed price. Discount is a currency amount, not the final total.</p>
            {form.pricing.map((x: any, i: number) => (
              <div key={i} className="grid gap-2 md:grid-cols-6">
                <FieldInput label="Description" span value={x.description}
                  onChange={(e) => {
                    const a = [...form.pricing];
                    a[i] = { ...x, description: e.target.value };
                    setForm({ ...form, pricing: a });
                  }}
                />
                <FieldInput label="Quantity" type="number"
                  value={x.quantity}
                  onChange={(e) => {
                    const a = [...form.pricing];
                    a[i] = { ...x, quantity: Number(e.target.value) };
                    setForm({ ...form, pricing: a });
                  }}
                />
                <FieldInput label="Unit"
                  value={x.unit}
                  onChange={(e) => {
                    const a = [...form.pricing];
                    a[i] = { ...x, unit: e.target.value };
                    setForm({ ...form, pricing: a });
                  }}
                />
                <FieldInput label="Unit Price" type="number"
                  value={x.unitPrice}
                  onChange={(e) => {
                    const a = [...form.pricing];
                    a[i] = { ...x, unitPrice: Number(e.target.value) };
                    setForm({ ...form, pricing: a });
                  }}
                />
                <FieldInput label="Discount Amount" type="number"
                  value={x.discount}
                  onChange={(e) => {
                    const a = [...form.pricing];
                    a[i] = { ...x, discount: Number(e.target.value) };
                    setForm({ ...form, pricing: a });
                  }}
                />
              </div>
            ))}
            {editable && (
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    pricing: [
                      ...form.pricing,
                      {
                        description: "",
                        quantity: 1,
                        unit: "item",
                        unitPrice: 0,
                        discount: 0,
                      },
                    ],
                  })
                }
                className="rounded border px-3 py-2"
              >
                Add pricing item
              </button>
            )}
            <div className="grid gap-4 md:grid-cols-4">
              <Field
                label="Currency"
                value={form.currency}
                set={(v: any) => setForm({ ...form, currency: v })}
              />
              <Field
                label="Tax Type"
                value={form.taxType}
                set={(v: any) => setForm({ ...form, taxType: v })}
              />
              <Field
                label="Tax Rate %"
                value={form.taxRate}
                set={(v: any) => setForm({ ...form, taxRate: Number(v) })}
                type="number"
              />
              <Field
                label="11 Valid Until"
                value={form.validUntil}
                set={(v: any) => setForm({ ...form, validUntil: v })}
                type="date"
              />
            </div>
            <h2 className="text-lg font-bold">09 Payment Schedule</h2>
            <p className="text-sm text-slate-600">Use percentages only; all payment percentages must total 100%. Payment amounts are calculated from the grand total.</p>
            {form.paymentMilestones.map((x: any, i: number) => (
              <div key={i} className="grid gap-2 md:grid-cols-3">
                <FieldInput label="Milestone Name"
                  value={x.name}
                  onChange={(e) => {
                    const a = [...form.paymentMilestones];
                    a[i] = { ...x, name: e.target.value };
                    setForm({ ...form, paymentMilestones: a });
                  }}
                />
                <FieldInput label="Percentage" type="number"
                  value={x.percentage}
                  onChange={(e) => {
                    const a = [...form.paymentMilestones];
                    a[i] = { ...x, percentage: Number(e.target.value) };
                    setForm({ ...form, paymentMilestones: a });
                  }}
                />
                <FieldInput label="Payment Trigger"
                  value={x.trigger}
                  onChange={(e) => {
                    const a = [...form.paymentMilestones];
                    a[i] = { ...x, trigger: e.target.value };
                    setForm({ ...form, paymentMilestones: a });
                  }}
                />
              </div>
            ))}
            {editable && (
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    paymentMilestones: [
                      ...form.paymentMilestones,
                      { name: "", percentage: 0, trigger: "" },
                    ],
                  })
                }
                className="rounded border px-3 py-2"
              >
                Add payment milestone
              </button>
            )}
            <label className="block border-t pt-5 text-sm font-bold text-amber-900">
              Internal Notes — never client visible
              <textarea
                disabled={!editable}
                value={form.internalNotes}
                onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                className="mt-2 min-h-24 w-full rounded border border-amber-300 bg-amber-50 p-3 font-normal"
              />
            </label>
            {editable && (
              <button
                disabled={busy}
                onClick={() => action("save")}
                className="rounded bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                Save Draft
              </button>
            )}
          </section>
        </>
      )}
      {q.data.changeRequests?.length > 0 && (
        <section className="rounded border bg-white p-6">
          <h2 className="text-xl font-bold">Client Feedback</h2>
          {q.data.changeRequests.map((x: any) => (
            <div key={x.id} className="mt-4 border-t pt-4">
              <strong>{x.category} · Version reference</strong>
              <p className="mt-2">{x.feedback}</p>
              <small>
                {x.requested_by_name} · {new Date(x.requested_at).toLocaleString()}
              </small>
            </div>
          ))}
        </section>
      )}
      <section className="rounded border bg-white p-6">
        <h2 className="text-xl font-bold">Activity</h2>
        <div className="mt-4 divide-y">
          {q.data.activity.map((x: any) => (
            <div key={x.id} className="py-3 text-sm">
              <strong>{x.event_type.replaceAll("_", " ")}</strong>
              <span className="ml-3 text-slate-500">
                {new Date(x.created_at).toLocaleString()} · {x.actor_type} · Version{" "}
                {x.proposal_version_id ? "recorded" : "working"}
              </span>
            </div>
          ))}
        </div>
      </section>
      {p.status === "accepted" && (
        <p className="rounded border border-emerald-300 bg-emerald-50 p-5 font-bold text-emerald-800">
          Ready for Agreement — agreement generation is intentionally not started.
        </p>
      )}
    </div>
  );
}
function Meta({ l, v }: { l: string; v: any }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-slate-500">{l}</div>
      <div className="mt-1 break-all text-sm">{v || "—"}</div>
    </div>
  );
}
function FieldInput({label,value,onChange,type="text",span=false}:{label:string;value:any;onChange:(event:React.ChangeEvent<HTMLInputElement>)=>void;type?:string;span?:boolean}){return <label className={`text-xs font-bold text-slate-600 ${span?"md:col-span-2":""}`}>{label}<input type={type} value={value} onChange={onChange} className="mt-1 w-full rounded border p-2 text-base font-normal text-slate-900"/></label>}
function Field({
  label,
  value,
  set,
  type = "text",
}: {
  label: string;
  value: any;
  set: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-2 w-full rounded border p-2 font-normal"
      />
    </label>
  );
}
