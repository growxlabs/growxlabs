"use client";

import { useCallback, useEffect, useState } from "react";

interface Approval {
  id: string;
  title: string;
  safeSummary: string;
  riskLevel: string;
  status: string;
  operation: string;
  expiresAt: string;
}

function isApproval(value: unknown): value is Approval {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "title", "safeSummary", "riskLevel", "status", "operation", "expiresAt"]
    .every((key) => typeof item[key] === "string");
}

export function ApprovalInbox() {
  const [items, setItems] = useState<Approval[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/list?limit=100", { cache: "no-store" });
      const data = await response.json() as { items?: unknown[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Approval inbox is unavailable.");
      setItems((data.items ?? []).filter(isApproval));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Approval inbox is unavailable.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusy(id);
    try {
      const response = await fetch("/api/admin/command-center/governance/approvals/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId: id, decision, reason: "", idempotencyKey: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error("The decision was not accepted.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The decision failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Approval inbox</h2>
        <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700" onClick={() => void load()}>Refresh</button>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-700/60 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>}
      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex gap-2 text-xs uppercase tracking-wide">
                  <span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-300">{item.riskLevel}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{item.status}</span>
                </div>
                <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                <p className="mt-1 max-w-3xl text-sm text-slate-400">{item.safeSummary}</p>
                <p className="mt-3 text-xs text-slate-500">{item.operation} · expires {new Date(item.expiresAt).toLocaleString()}</p>
              </div>
              {item.status === "pending" || item.status === "partially_approved" ? (
                <div className="flex gap-2">
                  <button disabled={busy === item.id} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm disabled:opacity-50" onClick={() => void decide(item.id, "approved")}>Approve</button>
                  <button disabled={busy === item.id} className="rounded-lg bg-red-700 px-4 py-2 text-sm disabled:opacity-50" onClick={() => void decide(item.id, "rejected")}>Reject</button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
        {!error && items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">No eligible approval requests.</div>}
      </div>
    </section>
  );
}
