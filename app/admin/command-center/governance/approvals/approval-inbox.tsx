"use client";

import { AlertTriangle, Check, Clock, RefreshCw, ShieldCheck, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Approval {
  id: string;
  title: string;
  safeSummary: string;
  riskLevel: string;
  status: string;
  operation: string;
  expiresAt: string;
  requestedByUserId: string;
  requestedByAgentId?: string;
  minimumApprovals: number;
  prohibitSelfApproval: boolean;
}

interface Decision {
  id: string;
  approverUserId: string;
  decision: string;
  reason?: string;
  createdAt: string;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function approval(value: unknown): Approval | null {
  const item = object(value);
  const id = text(item.id);
  const title = text(item.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    safeSummary: text(item.safeSummary),
    riskLevel: text(item.riskLevel),
    status: text(item.status),
    operation: text(item.operation),
    expiresAt: text(item.expiresAt),
    requestedByUserId: text(item.requestedByUserId),
    requestedByAgentId: text(item.requestedByAgentId) || undefined,
    minimumApprovals: number(item.minimumApprovals, 1),
    prohibitSelfApproval: item.prohibitSelfApproval === true,
  };
}

export function ApprovalInbox() {
  const [items, setItems] = useState<Approval[]>([]);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/list?limit=100", {
        cache: "no-store",
      });
      const data = object(await response.json());
      if (!response.ok) throw new Error(text(data.error, "Approval inbox is unavailable."));
      const values: unknown[] = Array.isArray(data.items) ? data.items : [];
      setItems(values.map(approval).filter((item): item is Approval => item !== null));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Approval inbox service is unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(item: Approval) {
    setSelected(item);
    setDecisions([]);
    setReason("");
    try {
      const response = await fetch(
        `/api/admin/command-center/governance/approvals/get?id=${encodeURIComponent(item.id)}`,
        { cache: "no-store" }
      );
      const payload = object(await response.json());
      const detailed = approval(payload.approval);
      if (detailed) setSelected(detailed);
      const values: unknown[] = Array.isArray(payload.decisions) ? payload.decisions : [];
      setDecisions(
        values
          .map((value) => {
            const row = object(value);
            return {
              id: text(row.id),
              approverUserId: text(row.approverUserId),
              decision: text(row.decision),
              reason: text(row.reason) || undefined,
              createdAt: text(row.createdAt),
            };
          })
          .filter((item) => item.id)
      );
    } catch {
      setError("Approval detail could not be loaded.");
    }
  }

  async function decide(decision: "approved" | "rejected") {
    if (!selected || (decision === "rejected" && !reason.trim())) {
      setError("A reason is required when rejecting.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: selected.id,
          decision,
          reason: reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      if (!response.ok) throw new Error("The server did not accept this decision.");
      setSelected(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The decision failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pending Human Decisions</span>
              {items.length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                  {items.length} pending
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Operations requiring multi-signature or separation-of-duties clearance.
            </p>
          </div>
        </div>

        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-blue-400" : "text-zinc-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400 shadow-sm">
          <AlertTriangle size={15} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Approvals List */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl">
        {loading ? (
          <div className="grid min-h-[260px] place-items-center p-8 text-center">
            <div className="flex flex-col items-center gap-2.5">
              <RefreshCw size={22} className="animate-spin text-blue-400" />
              <p className="text-xs text-zinc-400 font-mono">Loading approval requests...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center p-12 text-center">
            <div className="flex flex-col items-center max-w-sm">
              <div className="grid size-12 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-3 shadow-sm">
                <Check size={22} />
              </div>
              <h3 className="text-sm font-semibold text-white">All Clear — Zero Pending Sign-Offs</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                There are no operations paused awaiting authorization. Critical operations requiring clearance will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => void openDetail(item)}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-zinc-900/50 transition-colors cursor-pointer group"
              >
                <span
                  className={`size-2.5 rounded-full shrink-0 ${
                    item.riskLevel === "critical"
                      ? "bg-rose-500 ring-4 ring-rose-500/20"
                      : item.riskLevel === "high"
                      ? "bg-amber-500 ring-4 ring-amber-500/20"
                      : "bg-blue-500 ring-4 ring-blue-500/20"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </span>
                    <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase">
                      {item.operation}
                    </span>
                  </div>
                  <p className="truncate text-xs text-zinc-400 mt-1">
                    {item.safeSummary}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-right">
                  <div className="text-[11px] text-zinc-500">
                    <span className="capitalize">{item.riskLevel} risk</span>
                    <span className="block font-mono text-[10px] text-zinc-600">
                      Req by: {item.requestedByUserId}
                    </span>
                  </div>
                  <span className="rounded-lg border border-zinc-700/60 bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                    {item.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decision Drawer Side-Over */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-all"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Approval detail drawer"
            className="h-full w-full max-w-lg overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl custom-scrollbar flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Authorization Request
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-white tracking-tight">
                    {selected.title}
                  </h3>
                </div>
                <button
                  className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  onClick={() => setSelected(null)}
                  aria-label="Close approval detail"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <Detail
                  icon={<AlertTriangle size={14} className="text-amber-400" />}
                  label="Risk & Op"
                  value={`${selected.riskLevel} · ${selected.operation}`}
                />
                <Detail
                  icon={<Clock size={14} className="text-blue-400" />}
                  label="Expires"
                  value={new Date(selected.expiresAt).toLocaleTimeString()}
                />
                <Detail
                  icon={<UserRound size={14} className="text-zinc-400" />}
                  label="Requester"
                  value={selected.requestedByUserId}
                />
                <Detail
                  icon={<ShieldCheck size={14} className="text-emerald-400" />}
                  label="Signatures"
                  value={`${decisions.filter((item) => item.decision === "approved").length} of ${selected.minimumApprovals}`}
                />
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs leading-relaxed text-zinc-300">
                {selected.safeSummary}
              </div>

              {selected.prohibitSelfApproval && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-300/90">
                  <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                  <span>Separation of duties enforced. Requesters cannot self-approve.</span>
                </div>
              )}

              <h4 className="mt-6 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Audit Timeline
              </h4>
              <div className="mt-2 space-y-2">
                {decisions.length ? (
                  decisions.map((item) => (
                    <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
                      <p className="font-semibold text-white capitalize">
                        {item.decision} · {item.approverUserId}
                      </p>
                      <p className="mt-1 text-zinc-400 text-[11px]">
                        {item.reason || "No reason supplied"} · {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">No previous decisions recorded.</p>
                )}
              </div>
            </div>

            {(selected.status === "pending" || selected.status === "partially_approved") && (
              <div className="mt-8 border-t border-zinc-800/80 pt-5">
                <label className="text-xs font-semibold text-zinc-200" htmlFor="approval-reason">
                  Decision Rationale
                </label>
                <textarea
                  id="approval-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={1000}
                  className="mt-2 min-h-20 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 transition-all"
                  placeholder="Required for rejection; recommended for approval"
                />
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={busy}
                    onClick={() => void decide("approved")}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {busy ? "Submitting..." : "Authorize Operation"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void decide("rejected")}
                    className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {busy ? "Submitting..." : "Reject"}
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <span className="flex items-center gap-1.5 text-zinc-400 text-[11px]">{icon}{label}</span>
      <span className="mt-1 block truncate font-medium text-white text-xs" title={value}>{value}</span>
    </div>
  );
}
