"use client";

import { 
  AlertCircle, 
  Bell, 
  Brain, 
  Check, 
  CheckCircle2, 
  Clock, 
  Code2, 
  Download, 
  ExternalLink, 
  FileCode, 
  FileText, 
  Layers, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Trash2, 
  X,
  ChevronRight
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ActivityItem, FlyoutMode } from "./command-center.types";
import { record, safeString } from "./sse";
import { useDialogFocus } from "./useDialogFocus";

interface SafeItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  action?: string;
  secondaryAction?: string;
  tertiaryAction?: string;
}

const config: Record<Exclude<FlyoutMode, "activity">, { endpoint: string; key: string }> = {
  approvals: { endpoint: "/api/admin/command-center/governance/approvals/list?limit=50", key: "items" },
  artifacts: { endpoint: "/api/admin/command-center/artifacts", key: "artifacts" },
  memory: { endpoint: "/api/admin/command-center/memory", key: "memories" },
  notifications: { endpoint: "/api/admin/command-center/notifications", key: "notifications" },
};

export function ContextFlyout({
  open,
  mode,
  activity,
  onClose,
  onMode,
  onUnreadChange,
}: {
  open: boolean;
  mode: FlyoutMode;
  activity: ActivityItem[];
  onClose: () => void;
  onMode: (mode: FlyoutMode) => void;
  onUnreadChange: (count: number) => void;
}) {
  const [items, setItems] = useState<SafeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    if (mode === "activity") return;
    setLoading(true);
    setError("");
    try {
      const source = config[mode];
      const response = await fetch(source.endpoint, { cache: "no-store" });
      if (!response.ok) {
        setItems([]);
        return;
      }
      const payload = record(await response.json());
      const rawValues = Array.isArray(payload[source.key]) ? (payload[source.key] as unknown[]) : [];
      const mapped = rawValues
        .map((value: unknown) => mapItem(mode, value))
        .filter((value: SafeItem | null): value is SafeItem => value !== null);
      setItems(mapped);
      if (mode === "notifications") {
        onUnreadChange(mapped.filter((item: SafeItem) => item.status === "unread" || item.status === "critical").length);
      }
    } catch (_cause) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode, onUnreadChange]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useDialogFocus(panelRef, open, onClose);
  if (!open) return null;

  async function act(item: SafeItem, action = item.action) {
    if (mode === "artifacts") {
      if (action === "Delete") {
        const deleted = await fetch(`/api/admin/command-center/artifacts?id=${encodeURIComponent(item.id)}`, {
          method: "DELETE",
        });
        if (!deleted.ok) {
          setError("This artifact cannot be deleted.");
          return;
        }
        await load();
        return;
      }
      const response = await fetch("/api/admin/command-center/artifacts/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifactId: item.id }),
      });
      const payload = record(await response.json());
      const url = safeString(payload.signedUrl);
      if (!response.ok || !url) {
        setError("A signed download link could not be created.");
        return;
      }
      window.location.assign(url);
    } else if (mode === "notifications") {
      if (action === "Clear all") {
        await fetch("/api/admin/command-center/notifications?all=true", { method: "DELETE" });
        await load();
        return;
      }
      await fetch(`/api/admin/command-center/notifications?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      await load();
    }
  }

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      className="relative z-30 flex h-full w-[360px] shrink-0 flex-col border-l border-[#27272a] bg-[#141416] text-[#f4f4f5] shadow-2xl transition-all select-none"
      aria-label="Agent Workspace Timeline & Details"
    >
      {/* Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-[#27272a] px-4">
        <div className="flex items-center gap-2">
          {mode === "activity" && <Terminal size={16} className="text-blue-400" />}
          {mode === "artifacts" && <Layers size={16} className="text-emerald-400" />}
          {mode === "approvals" && <ShieldCheck size={16} className="text-amber-400" />}
          {mode === "notifications" && <Bell size={16} className="text-purple-400" />}
          <span className="font-semibold text-sm text-white capitalize">
            {mode === "activity" ? "Execution Timeline" : mode}
          </span>
        </div>
        
        <button
          onClick={onClose}
          title="Close Panel"
          className="size-8 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Segmented Tabs Control */}
      <div className="p-3 border-b border-[#27272a] bg-[#121214]">
        <nav className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5" aria-label="Details view tabs">
          {(["activity", "artifacts", "approvals", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onMode(tab)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-[11.5px] font-semibold transition-all cursor-pointer text-center",
                mode === tab
                  ? "bg-white/[0.12] text-white shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
              )}
            >
              {tab === "activity" ? "Timeline" : tab === "artifacts" ? "Artifacts" : tab === "approvals" ? "Approvals" : "Alerts"}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-zinc-500">
            <Loader2 size={22} className="animate-spin text-blue-400" />
          </div>
        ) : mode === "activity" ? (
          /* Execution Timeline Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Live Orchestrator Trace
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                {activity.length} Events
              </span>
            </div>

            {activity.length > 0 ? (
              <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {activity.map((act) => (
                  <div key={act.id} className="relative group">
                    <span
                      className={cn(
                        "absolute -left-4 top-1.5 size-2 rounded-full ring-4 ring-[#141416]",
                        act.state === "complete"
                          ? "bg-emerald-400"
                          : act.state === "failed"
                          ? "bg-red-400"
                          : "bg-blue-400 animate-pulse"
                      )}
                    />
                    <div className="rounded-xl border border-white/10 bg-[#1e1e22] p-3 text-xs space-y-1.5 shadow-xs hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{act.label}</span>
                        <time className="text-[10px] font-mono text-zinc-500">
                          {formatTimestamp(act.timestamp)}
                        </time>
                      </div>
                      {act.detail && (
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {act.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-zinc-500 space-y-2">
                <Clock size={24} className="mx-auto text-zinc-600 mb-1" />
                <p className="font-semibold text-zinc-300">No active trace recorded</p>
                <p className="text-[11px] max-w-[220px] mx-auto text-zinc-500">
                  Agent reasoning, tool calls, and execution steps will appear here in real time.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Other Tabs: Artifacts, Approvals, Alerts */
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-[#1e1e22] p-3.5 text-xs space-y-2.5 shadow-xs hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm text-zinc-100 leading-snug">
                    {item.title}
                  </div>
                  <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-zinc-300">
                    {item.status}
                  </span>
                </div>

                <p className="text-zinc-400 text-xs leading-relaxed">{item.subtitle}</p>

                {item.action && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => void act(item, item.action)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>{item.action}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!items.length && !error && (
              <div className="py-20 text-center text-xs text-zinc-500 space-y-2">
                <Layers size={24} className="mx-auto text-zinc-600 mb-1" />
                <p className="font-semibold text-zinc-300">No {mode} records</p>
                <p className="text-[11px] max-w-[220px] mx-auto text-zinc-500">
                  Deliverables, code artifacts, and governance logs will be captured here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function mapItem(mode: FlyoutMode, raw: unknown): SafeItem | null {
  const item = record(raw);
  if (!item) return null;
  return {
    id: safeString(item.id, crypto.randomUUID()),
    title: safeString(item.title || item.name || item.key, "Item"),
    subtitle: safeString(item.subtitle || item.description || item.value || item.message, "Details unavailable"),
    meta: safeString(item.createdAt || item.updatedAt || item.timestamp, ""),
    status: safeString(item.status || item.category, "active"),
    action: mode === "approvals" ? "Review" : mode === "artifacts" ? "Download" : undefined,
  };
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
