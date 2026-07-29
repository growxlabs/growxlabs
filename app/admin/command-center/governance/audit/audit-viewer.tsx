"use client";

import { useEffect, useState } from "react";

interface AuditItem {
  id: string;
  eventType: string;
  action: string;
  outcome: string;
  occurredAt: string;
  eventHash: string;
}

function isAuditItem(value: unknown): value is AuditItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "eventType", "action", "outcome", "occurredAt", "eventHash"].every((key) => typeof item[key] === "string");
}

export function AuditViewer() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [message, setMessage] = useState("Loading audit history…");
  useEffect(() => {
    void fetch("/api/admin/command-center/governance/audit/query?limit=100", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { items?: unknown[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Audit history is unavailable.");
        const events = (data.items ?? []).filter(isAuditItem);
        setItems(events);
        setMessage(events.length ? "" : "No audit events in the current window.");
      })
      .catch((cause: unknown) => setMessage(cause instanceof Error ? cause.message : "Audit history is unavailable."));
  }, []);
  return (
    <section>
      <h2 className="mb-5 text-xl font-semibold">Audit history</h2>
      {message && <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">{message}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        {items.map((item) => (
          <div key={item.id} className="grid gap-2 border-b border-slate-800 bg-slate-900 p-4 text-sm last:border-0 md:grid-cols-[1.2fr_1fr_0.7fr_1fr]">
            <div><p className="font-medium">{item.eventType}</p><p className="text-xs text-slate-500">{item.action}</p></div>
            <span className="text-slate-300">{item.outcome}</span>
            <time className="text-slate-400">{new Date(item.occurredAt).toLocaleString()}</time>
            <code className="truncate text-xs text-cyan-400" title={item.eventHash}>{item.eventHash}</code>
          </div>
        ))}
      </div>
    </section>
  );
}
