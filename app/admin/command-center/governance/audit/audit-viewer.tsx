"use client";

import { Check, Copy, History, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AuditItem {
  id: string;
  eventType: string;
  category: string;
  action: string;
  outcome: string;
  occurredAt: string;
  eventHash: string;
  actor: string;
  runId: string;
  requestId: string;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function audit(value: unknown): AuditItem | null {
  const item = object(value);
  const id = text(item.id);
  if (!id) return null;
  const actor = object(item.actor);
  return {
    id,
    eventType: text(item.eventType),
    category: text(item.category),
    action: text(item.action),
    outcome: text(item.outcome),
    occurredAt: text(item.occurredAt),
    eventHash: text(item.eventHash),
    actor: text(actor.id),
    runId: text(item.runId),
    requestId: text(item.requestId),
  };
}

export function AuditViewer() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const defaultFrom = useMemo(() => new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10), []);
  const defaultTo = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams({
        limit: "100",
        from: new Date(`${from}T00:00:00Z`).toISOString(),
        to: new Date(`${to}T23:59:59Z`).toISOString(),
      });
      const response = await fetch(`/api/admin/command-center/governance/audit/query?${params}`, {
        cache: "no-store",
      });
      const data = object(await response.json());
      if (!response.ok) {
        throw new Error(text(data.error) || "Audit history service returned an unexpected status.");
      }
      const values: unknown[] = Array.isArray(data.items) ? data.items : [];
      const events = values.map(audit).filter((item): item is AuditItem => item !== null);
      setItems(events);
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Audit history is currently unavailable.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesOutcome = !outcome || item.outcome.toLowerCase() === outcome.toLowerCase();
      const matchesQuery =
        !needle ||
        [item.eventType, item.category, item.actor, item.runId, item.requestId, item.action].some((val) =>
          val.toLowerCase().includes(needle)
        );
      return matchesOutcome && matchesQuery;
    });
  }, [items, outcome, query]);

  const hasActiveFilters = query.length > 0 || outcome.length > 0 || from !== defaultFrom || to !== defaultTo;

  const resetFilters = () => {
    setQuery("");
    setOutcome("");
    setFrom(defaultFrom);
    setTo(defaultTo);
  };

  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-xl backdrop-blur-md">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_auto_auto_auto]">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-zinc-500 pointer-events-none" size={15} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event, actor, request ID, tool..."
              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9.5 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-3 text-zinc-500 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Outcome Filter */}
          <select
            aria-label="Filter by outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 text-xs text-zinc-200 outline-none transition-all focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="">All Outcomes</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="denied">Denied</option>
          </select>

          {/* Date From */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">From</span>
            <input
              aria-label="From date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">To</span>
            <input
              aria-label="To date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer"
            />
          </div>

          {/* Refresh Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh ledger stream"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-blue-400" : "text-zinc-400"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Display Area */}
      {loading ? (
        <div className="grid min-h-[320px] place-items-center rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Querying Cryptographic Ledger</h3>
              <p className="mt-1 text-xs text-zinc-500 font-mono">Verifying SHA-256 hash chains across tenant stream...</p>
            </div>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
          <div className="flex flex-col items-center max-w-md">
            <div className="grid size-12 place-items-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 mb-3 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">Audit Stream Inactive</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              {errorMessage}
            </p>
            <p className="mt-2 text-[11px] text-zinc-500">
              Audit logging is active when backend governance microservices are connected. Read-only inspection mode is engaged.
            </p>
            <button
              onClick={() => void load()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
          <div className="flex flex-col items-center max-w-md">
            <div className="grid size-12 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-3 shadow-sm">
              <History size={22} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {items.length === 0 ? "No Audit Events Recorded" : "No Matches for Current Filter"}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              {items.length === 0
                ? "There are no recorded governance events in this date range. Every policy evaluation, tool invocation, and human approval will appear in this ledger."
                : "No audit events match your search query or outcome selection. Try adjusting or clearing your filters."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl">
          {/* Table Header */}
          <div className="hidden border-b border-zinc-800/80 bg-zinc-900/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 md:grid md:grid-cols-[1.4fr_1.2fr_0.8fr_1.2fr]">
            <span>Event & Action</span>
            <span>Actor & Correlation</span>
            <span>Outcome</span>
            <span>Timestamp & Hash</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-zinc-800/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 p-4.5 text-xs transition-colors hover:bg-zinc-900/40 md:grid-cols-[1.4fr_1.2fr_0.8fr_1.2fr] md:items-center"
              >
                {/* Event & Action */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">{item.eventType}</span>
                    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 font-mono truncate">{item.action}</p>
                </div>

                {/* Actor & Correlation */}
                <div>
                  <p className="font-medium text-zinc-200">{item.actor || "system-kernel"}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-500" title={item.requestId || item.runId}>
                    ID: {item.requestId || item.runId || "—"}
                  </p>
                </div>

                {/* Outcome */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      item.outcome === "success"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : item.outcome === "failure"
                        ? "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                        : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.outcome === "success"
                          ? "bg-emerald-400"
                          : item.outcome === "failure"
                          ? "bg-rose-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <span>{item.outcome}</span>
                  </span>
                </div>

                {/* Timestamp & Hash */}
                <div className="space-y-1">
                  <time className="block text-[11px] text-zinc-400">
                    {new Date(item.occurredAt).toLocaleString()}
                  </time>
                  <div className="flex items-center gap-1.5">
                    <code
                      className="truncate text-[10px] font-mono text-blue-400/80 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10 max-w-[180px]"
                      title={item.eventHash}
                    >
                      {item.eventHash}
                    </code>
                    <button
                      onClick={() => void copyToClipboard(item.eventHash)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Copy full cryptographic SHA-256 hash"
                    >
                      {copiedHash === item.eventHash ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
