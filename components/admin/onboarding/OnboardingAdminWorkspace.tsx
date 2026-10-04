"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, ClipboardList, FileText, KeyRound, Users, Send, ShieldCheck } from "lucide-react";
import styles from "./OnboardingAdminWorkspace.module.css";
import type { ClientOnboarding } from "@/types/onboarding";

type ListRow = {
  id: string;
  onboarding_number: string;
  status: string;
  completion_percentage: number;
  updated_at: string;
  companies?: { name?: string } | null;
};

type EligibleClient = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  agreementNumber: string | null;
  agreementStatus: string | null;
};

export function OnboardingAdminList() {
  const q = useQuery({
    queryKey: ["admin", "onboarding"],
    queryFn: async () => {
      const r = await fetch("/api/admin/onboarding");
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      return b as { onboardings: ListRow[]; clients?: EligibleClient[] };
    },
  });

  const [clientId, setClientId] = useState("");
  const [notice, setNotice] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          requirementKeys: [
            "company_details",
            "billing_legal",
            "project_contacts",
            "brand_assets",
            "digital_properties",
            "final_confirmation",
          ],
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      return b;
    },
    onSuccess: (b) => {
      location.href = `/admin/onboarding/${b.onboarding.id}`;
    },
    onError: (e) => setNotice(e.message),
  });

  const clients = q.data?.clients || [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Create Onboarding</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select an official client partner or enter an Agreement Reference (e.g. GXL-MSA-2026-000001) to initialize their onboarding workspace.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {clients.length > 0 && (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="min-h-11 min-w-[320px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="">Select official client partner...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.agreementNumber || c.id}>
                  {c.companyName} {c.agreementNumber ? `· ${c.agreementNumber}` : `(${c.name})`}
                </option>
              ))}
            </select>
          )}

          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Or enter Agreement / Invoice # (e.g. GXL-MSA-2026-000001)..."
            className="min-h-11 flex-1 min-w-[280px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0075de] transition-colors"
          />

          <button
            disabled={!clientId.trim() || create.isPending}
            onClick={() => create.mutate()}
            className="min-h-11 rounded-lg bg-[#0075de] hover:bg-[#005bab] px-6 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {create.isPending ? "Creating…" : "Create Onboarding"}
          </button>
        </div>

        {notice && <p className="mt-3 text-sm text-red-600">{notice}</p>}
      </section>

      {q.isPending ? (
        <p className="text-sm text-slate-500">Loading onboarding records…</p>
      ) : q.error ? (
        <p className="text-sm text-red-600">{q.error.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Onboarding Reference</th>
                <th className="p-3.5">Company Partner</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Completion</th>
                <th className="p-3.5">Last Updated</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {q.data?.onboardings.map((x) => (
                <tr key={x.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">{x.onboarding_number}</td>
                  <td className="p-3.5 text-slate-700">{x.companies?.name || "Linked client"}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize bg-blue-50 text-blue-700">
                      {x.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{x.completion_percentage}%</td>
                  <td className="p-3.5 text-slate-500 text-xs">{new Date(x.updated_at).toLocaleString()}</td>
                  <td className="p-3.5">
                    <Link href={`/admin/onboarding/${x.id}`} className="font-semibold text-[#0075de] hover:underline">
                      Open Workspace
                    </Link>
                  </td>
                </tr>
              ))}
              {!q.data?.onboardings.length && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 text-sm">
                    No active onboarding records. Select a client partner above to initialize onboarding.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function OnboardingAdminDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "onboarding", id],
    queryFn: async () => {
      const r = await fetch(`/api/admin/onboarding/${id}`);
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      return b.onboarding as ClientOnboarding;
    },
  });

  const [notice, setNotice] = useState("");
  const [reason, setReason] = useState("");

  const action = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await fetch(`/api/admin/onboarding/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      return b;
    },
    onSuccess: () => {
      setNotice("Onboarding updated.");
      qc.invalidateQueries({ queryKey: ["admin", "onboarding", id] });
    },
    onError: (e) => setNotice(e.message),
  });

  if (q.isPending) return <p className="text-sm text-slate-500">Loading onboarding…</p>;
  if (q.error || !q.data) return <p className="text-sm text-red-600">{q.error?.message || "Not found"}</p>;

  const o = q.data;
  const openRequest = o.informationRequests.find((x) => x.status === "open");
  const company = asRecord(o.formData.company_details);
  const contacts = Array.isArray(o.formData.project_contacts) ? o.formData.project_contacts.map(asRecord) : [];
  const outstanding = o.requirements.filter((x) => !["complete", "verified"].includes(x.status));
  const complete = o.requirements.length - outstanding.length;
  const progress = Math.min(100, Math.max(0, o.completionPercentage));
  const ready = o.readinessChecks.filter((x) => x.complete).length;
  const nextStep = o.status === "not_started" ? "Send the client their onboarding invitation" : ["submitted", "resubmitted"].includes(o.status) ? "Review the client's submission" : o.status === "under_review" ? "Complete readiness checks before kickoff" : ["ready_for_kickoff", "completed"].includes(o.status) ? "Onboarding is ready for project delivery" : "Waiting for the client to complete onboarding";

  return (
    <div className={styles.workspace}>
      <Link href="/admin/onboarding" className={styles.back}><ArrowLeft size={15} /> All onboardings</Link>
      <header className={styles.header}>
        <div className={styles.headingRow}>
          <div><p className={styles.eyebrow}>{o.onboardingNumber}</p><h1>Client onboarding</h1><p className={styles.subtitle}>Collect client information and prepare the engagement for kickoff.</p></div>
          <Status value={o.status} />
        </div>
        <div className={styles.identity}>
          <div><span>Company</span><strong>{textValue(company.company_name) || "Company details pending"}</strong></div>
          <div><span>Primary contact</span><strong>{textValue(company.primary_contact) || "Not provided yet"}</strong>{textValue(company.email) && <small>{textValue(company.email)}</small>}</div>
          <div><span>Last updated</span><strong>{new Date(o.updatedAt).toLocaleDateString("en-IN", {day: "numeric", month: "short", year: "numeric"})}</strong></div>
          <div><span>Invitation</span><strong>{o.invitedAt ? `Sent ${new Date(o.invitedAt).toLocaleDateString("en-IN")}` : "Not sent yet"}</strong></div>
        </div>
        <div className={styles.progressRow}><span>Client completion</span><strong>{progress}%</strong></div>
        <div className={styles.progress} role="progressbar" aria-label="Client completion" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div style={{width: `${progress}%`}} /></div>
      </header>
      {notice && <div role={action.isError ? "alert" : "status"} className={styles.notice}><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification">Dismiss</button></div>}
      <div className={styles.columns}>
        <div className={styles.stack}>
          <Panel title="Onboarding requirements" icon={<ClipboardList size={18} />} detail={`${complete} of ${o.requirements.length} complete`}>
            <p className={styles.helper}>Information the client needs to provide. Expand a requirement to view submitted details.</p>
            {o.requirements.map((x, i) => <details key={x.id} className={styles.requirement}>
              <summary><span className={styles.number}>{["complete", "verified"].includes(x.status) ? <Check size={15} /> : String(i + 1).padStart(2, "0")}</span><span className={styles.requirementTitle}><strong>{x.name}</strong><small>{x.required ? "Required" : "Optional"}</small></span><Status value={x.status} /></summary>
              <div className={styles.requirementBody}><p>{x.description}</p><FieldDetails value={o.formData[x.sectionKey] ?? o.formData[x.requirementKey]} />{x.adminNotes && <p>Internal note: {x.adminNotes}</p>}</div>
            </details>)}
            {!o.requirements.length && <Empty message="No requirements configured for this onboarding." />}
          </Panel>
          <Panel title="Internal readiness" icon={<ShieldCheck size={18} />} detail={`${ready} / ${o.readinessChecks.length} checked`}>
            <p className={styles.helper}>Confirm these checks before approving the engagement for kickoff.</p>
            {o.readinessChecks.map((x) => <label key={x.id} className={styles.checkRow}><input type="checkbox" checked={x.complete} disabled={action.isPending} onChange={(e) => action.mutate({action: "readiness", checkId: x.id, complete: e.target.checked})} /><span>{x.label}{x.note && <small>{x.note}</small>}</span></label>)}
          </Panel>
        </div>
        <aside className={styles.stack}>
          <Panel title="Next step" icon={<Send size={18} />}>
            <h3 className={styles.nextTitle}>{nextStep}</h3>
            <p className={styles.helper}>{o.status === "not_started" ? "The client will receive an invitation to complete the configured requirements." : `${outstanding.length} requirements remain outstanding. Review the information and follow up where needed.`}</p>
            {o.status === "not_started" && <button disabled={action.isPending} onClick={() => action.mutate({action: "invite"})} className={styles.primary}>{action.isPending ? "Sending…" : "Send onboarding invitation"}<ArrowUpRight size={16} /></button>}
            {["submitted", "resubmitted"].includes(o.status) && <button disabled={action.isPending} onClick={() => action.mutate({action: "review"})} className={styles.primary}>Review submission<ArrowUpRight size={16} /></button>}
            {o.status === "under_review" && <button disabled={action.isPending} onClick={() => action.mutate({action: "approve"})} className={styles.primary}>Approve for kickoff<ArrowUpRight size={16} /></button>}
            {o.assessmentId && <Link href={`/admin/assessments/${o.assessmentId}`} className={styles.secondary}>View linked assessment<ArrowUpRight size={15} /></Link>}
          </Panel>
          <Panel title="Access requests" icon={<KeyRound size={18} />} detail={String(o.accessRequests.length)}>
            {o.accessRequests.length ? o.accessRequests.map(x => <div className={styles.item} key={x.id}><strong>{x.serviceName}</strong><Status value={x.status} />{x.reason && <p>{x.reason}</p>}{x.instructions && <p>{x.instructions}</p>}</div>) : <Empty message="No access requests configured for this engagement." />}
          </Panel>
          <Panel title="Client documents" icon={<FileText size={18} />} detail={String(o.documents.length)}>
            {o.documents.length ? o.documents.map(x => <div className={styles.item} key={x.id}><strong>{x.fileName}</strong><Status value={x.verificationStatus} /><p>{label(x.category)} · Version {x.version}</p></div>) : <Empty message="No documents uploaded yet. Submitted files will appear here." />}
          </Panel>
          <Panel title="Project contacts" icon={<Users size={18} />} detail={String(contacts.length)}>
            {contacts.length ? contacts.map((x, i) => <div className={styles.item} key={i}><FieldDetails value={x} /></div>) : <Empty message="The client has not added project contacts yet." />}
          </Panel>
        </aside>
      </div>
      <Panel title="Request missing information" icon={<ClipboardList size={18} />}>
        <p className={styles.helper}>Send a follow-up for the {outstanding.length} outstanding requirements. Completed information stays locked.</p>
        <label className={styles.fieldLabel} htmlFor="onboarding-reason">Message to the client</label>
        <textarea id="onboarding-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain what is missing and what the client should provide…" rows={3} className={styles.textarea} />
        <button disabled={!reason.trim() || !outstanding.length || action.isPending} onClick={() => action.mutate({action: "request_information", reason, requestedItems: outstanding.map(x => ({type: "requirement", id: x.id, key: x.requirementKey}))})} className={styles.secondary}>Request outstanding information<ArrowUpRight size={15} /></button>
        {openRequest && <div className={styles.notice}><span><strong>Open information request</strong><br />{openRequest.reason}</span></div>}
      </Panel>
    </div>
  );
}

function label(value: string) { return value.replaceAll("_", " "); }
function textValue(value: unknown): string { return typeof value === "string" || typeof value === "number" ? String(value) : ""; }
function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function Status({ value }: {value: string}) { return <span className={styles.status} data-complete={["complete", "verified", "completed", "ready_for_kickoff"].includes(value)}>{label(value)}</span>; }
function Panel({title, icon, detail, children}: {title: string; icon: React.ReactNode; detail?: string; children: React.ReactNode}) { return <section className={styles.panel}><div className={styles.panelHeading}><span>{icon}<h2>{title}</h2></span>{detail && <small>{detail}</small>}</div><div className={styles.panelBody}>{children}</div></section>; }
function Empty({message}: {message: string}) { return <p className={styles.empty}>{message}</p>; }
function FieldDetails({value}: {value: unknown}) {
  if (Array.isArray(value)) return value.length ? <div>{value.map((item, i) => <FieldDetails key={i} value={item} />)}</div> : <Empty message="No information provided yet." />;
  if (value && typeof value === "object") {
    const entries = Object.entries(asRecord(value)).filter(([, v]) => v !== null && v !== undefined && v !== "");
    return entries.length ? <dl className={styles.fields}>{entries.map(([key, v]) => <div key={key}><dt>{label(key)}</dt><dd>{typeof v === "object" ? <FieldDetails value={v} /> : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}</dd></div>)}</dl> : <Empty message="No information provided yet." />;
  }
  return textValue(value) ? <p>{textValue(value)}</p> : <Empty message="No information provided yet." />;
}
