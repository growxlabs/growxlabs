"use client";

import { Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AuditItem {
  id: string; eventType: string; category: string; action: string; outcome: string;
  occurredAt: string; eventHash: string; actor: string; runId: string; requestId: string;
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function audit(value: unknown): AuditItem | null {
  const item = object(value), id = text(item.id);
  if (!id) return null;
  const actor = object(item.actor);
  return { id, eventType: text(item.eventType), category: text(item.category), action: text(item.action), outcome: text(item.outcome),
    occurredAt: text(item.occurredAt), eventHash: text(item.eventHash), actor: text(actor.id), runId: text(item.runId), requestId: text(item.requestId) };
}

export function AuditViewer() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [message, setMessage] = useState("Loading audit history…");
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("");
  const [from, setFrom] = useState(() => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const load = useCallback(async () => {
    setMessage("Loading audit history…");
    try {
      const params = new URLSearchParams({ limit: "100", from: new Date(`${from}T00:00:00Z`).toISOString(), to: new Date(`${to}T23:59:59Z`).toISOString() });
      const response = await fetch(`/api/admin/command-center/governance/audit/query?${params}`, { cache: "no-store" });
      const data = object(await response.json());
      if (!response.ok) throw new Error(text(data.error) || "Audit history is unavailable.");
      const values: unknown[] = Array.isArray(data.items) ? data.items : [];
      const events = values.map(audit).filter((item): item is AuditItem => item !== null);
      setItems(events); setMessage(events.length ? "" : "No audit events in this date range.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Audit history is unavailable."); }
  }, [from, to]);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => (!outcome || item.outcome === outcome) && (!needle || [item.eventType, item.category, item.actor, item.runId, item.requestId, item.action].some((value) => value.toLowerCase().includes(needle))));
  }, [items, outcome, query]);

  return (
    <section>
      <div className="mb-5"><h2 className="text-xl font-semibold">Audit history</h2><p className="mt-1 text-sm text-slate-500">Read-only, tenant-scoped, and hash-chain protected.</p></div>
      <div className="mb-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={15} /><span className="sr-only">Search audit events</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Actor, event, run, request, or tool" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-blue-500" /></label>
        <select aria-label="Outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="">All outcomes</option><option value="success">Success</option><option value="failure">Failure</option><option value="denied">Denied</option></select>
        <input aria-label="From date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs" />
        <input aria-label="To date" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs" />
      </div>
      {message && <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400"><div><ShieldCheck className="mx-auto mb-3" />{message}</div></div>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.map((item) => <div key={item.id} className="grid gap-2 border-b border-slate-100 p-4 text-xs last:border-0 md:grid-cols-[1.2fr_1fr_0.7fr_1fr]">
          <div><p className="font-semibold text-slate-800">{item.eventType}</p><p className="mt-1 text-slate-400">{item.category} · {item.action}</p></div>
          <div><p className="text-slate-600">{item.actor || "system"}</p><p className="mt-1 truncate text-slate-400">{item.requestId || item.runId}</p></div>
          <div><span className="rounded-full bg-slate-100 px-2 py-1 capitalize text-slate-600">{item.outcome}</span></div>
          <div><time className="text-slate-500">{new Date(item.occurredAt).toLocaleString()}</time><code className="mt-1 block truncate text-[10px] text-blue-600" title={item.eventHash}>{item.eventHash}</code></div>
        </div>)}
      </div>
    </section>
  );
}
