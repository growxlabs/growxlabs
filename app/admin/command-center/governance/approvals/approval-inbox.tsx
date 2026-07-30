"use client";

import { AlertTriangle, Check, Clock, ShieldCheck, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Approval {
  id: string; title: string; safeSummary: string; riskLevel: string; status: string;
  operation: string; expiresAt: string; requestedByUserId: string; requestedByAgentId?: string;
  minimumApprovals: number; prohibitSelfApproval: boolean;
}
interface Decision { id: string; approverUserId: string; decision: string; reason?: string; createdAt: string }

function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function text(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback; }
function number(value: unknown, fallback = 0) { return typeof value === "number" ? value : fallback; }
function approval(value: unknown): Approval | null {
  const item = object(value), id = text(item.id), title = text(item.title);
  if (!id || !title) return null;
  return { id, title, safeSummary: text(item.safeSummary), riskLevel: text(item.riskLevel), status: text(item.status), operation: text(item.operation),
    expiresAt: text(item.expiresAt), requestedByUserId: text(item.requestedByUserId), requestedByAgentId: text(item.requestedByAgentId) || undefined,
    minimumApprovals: number(item.minimumApprovals, 1), prohibitSelfApproval: item.prohibitSelfApproval === true };
}

export function ApprovalInbox() {
  const [items, setItems] = useState<Approval[]>([]);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/list?limit=100", { cache: "no-store" });
      const data = object(await response.json());
      if (!response.ok) throw new Error(text(data.error, "Approval inbox is unavailable."));
      const values: unknown[] = Array.isArray(data.items) ? data.items : [];
      setItems(values.map(approval).filter((item): item is Approval => item !== null));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Approval inbox is unavailable."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function openDetail(item: Approval) {
    setSelected(item); setDecisions([]); setReason("");
    try {
      const response = await fetch(`/api/admin/command-center/governance/approvals/get?id=${encodeURIComponent(item.id)}`, { cache: "no-store" });
      const payload = object(await response.json());
      const detailed = approval(payload.approval);
      if (detailed) setSelected(detailed);
      const values: unknown[] = Array.isArray(payload.decisions) ? payload.decisions : [];
      setDecisions(values.map((value) => {
        const row = object(value);
        return { id: text(row.id), approverUserId: text(row.approverUserId), decision: text(row.decision), reason: text(row.reason) || undefined, createdAt: text(row.createdAt) };
      }).filter((item) => item.id));
    } catch { setError("Approval detail could not be loaded."); }
  }

  async function decide(decision: "approved" | "rejected") {
    if (!selected || (decision === "rejected" && !reason.trim())) { setError("A reason is required when rejecting."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/decide", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId: selected.id, decision, reason: reason.trim(), idempotencyKey: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error("The server did not accept this decision.");
      setSelected(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The decision failed."); }
    finally { setBusy(false); }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Approval inbox</h2><p className="mt-1 text-sm text-slate-500">Only requests you are eligible to decide are shown.</p></div><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50" onClick={() => void load()}>Refresh</button></div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.map((item) => <button key={item.id} onClick={() => void openDetail(item)} className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left last:border-0 hover:bg-slate-50">
          <span className={`size-2.5 rounded-full ${item.riskLevel === "critical" ? "bg-red-500" : item.riskLevel === "high" ? "bg-amber-500" : "bg-blue-500"}`} />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span><span className="block truncate text-xs text-slate-500">{item.safeSummary}</span></span>
          <span className="hidden text-xs capitalize text-slate-400 sm:block">{item.riskLevel} risk</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase text-slate-500">{item.status}</span>
        </button>)}
        {!error && items.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center text-sm text-slate-400"><div><Check className="mx-auto mb-3" /><p>No eligible approval requests.</p></div></div>}
      </div>
      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <aside role="dialog" aria-modal="true" aria-label="Approval detail" className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approval detail</p><h3 className="mt-1 text-lg font-semibold">{selected.title}</h3></div><button className="grid size-9 place-items-center rounded-lg hover:bg-slate-100" onClick={() => setSelected(null)} aria-label="Close approval detail"><X size={17} /></button></div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <Detail icon={<AlertTriangle size={14} />} label="Risk" value={`${selected.riskLevel} · ${selected.operation}`} />
            <Detail icon={<Clock size={14} />} label="Expiry" value={new Date(selected.expiresAt).toLocaleString()} />
            <Detail icon={<UserRound size={14} />} label="Requester" value={selected.requestedByUserId} />
            <Detail icon={<ShieldCheck size={14} />} label="Approvals" value={`${decisions.filter((item) => item.decision === "approved").length} of ${selected.minimumApprovals}`} />
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">{selected.safeSummary}</div>
          {selected.prohibitSelfApproval && <p className="mt-3 text-xs text-amber-700">Separation of duties is enforced. Requesters cannot approve their own operation.</p>}
          <h4 className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Audit timeline</h4>
          <div className="mt-2 space-y-2">{decisions.length ? decisions.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-xs"><p className="font-semibold capitalize">{item.decision} · {item.approverUserId}</p><p className="mt-1 text-slate-500">{item.reason || "No reason supplied"} · {new Date(item.createdAt).toLocaleString()}</p></div>) : <p className="text-xs text-slate-400">No decisions recorded yet.</p>}</div>
          {(selected.status === "pending" || selected.status === "partially_approved") && <div className="mt-6 border-t border-slate-200 pt-4">
            <label className="text-xs font-semibold text-slate-700" htmlFor="approval-reason">Decision reason</label>
            <textarea id="approval-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1_000} className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" placeholder="Required for rejection; recommended for approval" />
            <div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => void decide("approved")} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busy} onClick={() => void decide("rejected")} className="flex-1 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Reject</button></div>
          </div>}
        </aside>
      </div>}
    </section>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 p-3"><span className="flex items-center gap-1.5 text-slate-400">{icon}{label}</span><span className="mt-1 block truncate font-medium text-slate-700" title={value}>{value}</span></div>;
}
