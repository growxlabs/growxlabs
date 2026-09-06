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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Approval Inbox</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Only requests requiring your role-based authorization are presented.
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-xs"
          onClick={() => void load()}
        >
          <Clock size={13} className="text-zinc-400" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 shadow-sm">
          <AlertTriangle size={15} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#27272a] bg-[#141416] shadow-xl">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => void openDetail(item)}
            className="flex w-full items-center gap-4 border-b border-[#27272a] p-4.5 text-left last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer group"
          >
            <span
              className={`size-2.5 rounded-full shrink-0 ${
                item.riskLevel === "critical"
                  ? "bg-red-500 ring-2 ring-red-500/20"
                  : item.riskLevel === "high"
                  ? "bg-amber-500 ring-2 ring-amber-500/20"
                  : "bg-blue-500 ring-2 ring-blue-500/20"
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                {item.title}
              </span>
              <span className="block truncate text-xs text-zinc-400 mt-0.5">
                {item.safeSummary}
              </span>
            </span>
            <span className="hidden text-xs capitalize text-zinc-400 sm:block">
              {item.riskLevel} risk
            </span>
            <span className="rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
              {item.status}
            </span>
          </button>
        ))}

        {!error && items.length === 0 && (
          <div className="grid min-h-64 place-items-center p-12 text-center">
            <div className="flex flex-col items-center max-w-sm">
              <div className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3.5 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-sm font-semibold text-white">All approvals up to date</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                There are no pending operational actions requiring human sign-off.
              </p>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Approval detail"
            className="h-full w-full max-w-lg overflow-y-auto bg-[#141416] border-l border-[#27272a] p-6 text-zinc-100 shadow-2xl custom-scrollbar"
          >
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Approval Request Detail
                </p>
                <h3 className="mt-1 text-lg font-bold text-white tracking-tight">
                  {selected.title}
                </h3>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelected(null)}
                aria-label="Close approval detail"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <Detail icon={<AlertTriangle size={14} className="text-amber-400" />} label="Risk" value={`${selected.riskLevel} · ${selected.operation}`} />
              <Detail icon={<Clock size={14} className="text-blue-400" />} label="Expiry" value={new Date(selected.expiresAt).toLocaleString()} />
              <Detail icon={<UserRound size={14} className="text-zinc-400" />} label="Requester" value={selected.requestedByUserId} />
              <Detail
                icon={<ShieldCheck size={14} className="text-emerald-400" />}
                label="Approvals"
                value={`${decisions.filter((item) => item.decision === "approved").length} of ${selected.minimumApprovals}`}
              />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-300">
              {selected.safeSummary}
            </div>

            {selected.prohibitSelfApproval && (
              <p className="mt-3 text-xs text-amber-400/90 flex items-center gap-1.5">
                <AlertTriangle size={13} className="shrink-0" />
                <span>Separation of duties is enforced. Requesters cannot approve their own operation.</span>
              </p>
            )}

            <h4 className="mt-6 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Audit Timeline
            </h4>
            <div className="mt-2 space-y-2">
              {decisions.length ? (
                decisions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
                    <p className="font-semibold text-white capitalize">{item.decision} · {item.approverUserId}</p>
                    <p className="mt-1 text-zinc-400">{item.reason || "No reason supplied"} · {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">No decisions recorded yet.</p>
              )}
            </div>

            {(selected.status === "pending" || selected.status === "partially_approved") && (
              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <label className="text-xs font-semibold text-zinc-200" htmlFor="approval-reason">
                  Decision Reason
                </label>
                <textarea
                  id="approval-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={1_000}
                  className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-[#1a1a1e] p-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
                  placeholder="Required for rejection; recommended for approval"
                />
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={busy}
                    onClick={() => void decide("approved")}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void decide("rejected")}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <span className="flex items-center gap-1.5 text-zinc-400 text-[11px]">{icon}{label}</span>
      <span className="mt-1 block truncate font-medium text-white text-xs" title={value}>{value}</span>
    </div>
  );
}
