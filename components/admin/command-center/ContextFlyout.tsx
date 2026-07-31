"use client";

import { AlertCircle, Bell, Brain, CheckCircle2, Download, FileText, Loader2, ShieldCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ActivityItem, FlyoutMode, AgentCapability, ExecutionWidget, FlyoutModeExtended, TimelineStep } from "./command-center.types";
import { record, safeString } from "./sse";
import { useDialogFocus } from "./useDialogFocus";
import "./transitions.css";

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

export function ContextFlyout({ open, mode, activity, onClose, onMode, onUnreadChange, capabilities = [], executionWidgets = [], timeline = [] }: {
  open: boolean; mode: FlyoutModeExtended; activity: ActivityItem[]; onClose: () => void;
  onMode: (mode: FlyoutModeExtended) => void; onUnreadChange: (count: number) => void;
  capabilities?: AgentCapability[];
  executionWidgets?: ExecutionWidget[];
  timeline?: TimelineStep[];
}) {
  const [items, setItems] = useState<SafeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<SafeItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [preferences, setPreferences] = useState({ info: true, success: true, warning: true });
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    if (mode === "activity" || mode === "capabilities" || mode === "widgets" || mode === "reasoning" || mode === "metrics") return;
    setLoading(true);
    setError("");
    try {
      const source = config[mode as keyof typeof config];
      const response = await fetch(source.endpoint, { cache: "no-store" });
      if (!response.ok) {
        setItems([]);
        return;
      }
      const payload = record(await response.json());
      const rawValues = Array.isArray(payload[source.key]) ? (payload[source.key] as unknown[]) : [];
      const mapped = rawValues.map((value: unknown) => mapItem(mode, value)).filter((value: SafeItem | null): value is SafeItem => value !== null);
      setItems(mapped);
      if (mode === "notifications") {
        onUnreadChange(mapped.filter((item: SafeItem) => item.status === "unread" || item.status === "critical").length);
        const settings = record(payload.preferences);
        setPreferences({ info: settings.info !== false, success: settings.success !== false, warning: settings.warning !== false });
      }
    } catch (_cause) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode, onUnreadChange]);

  useEffect(() => { if (open) void load(); }, [open, load]);
  useDialogFocus(panelRef, open, onClose);
  if (!open) return null;

  async function act(item: SafeItem, action = item.action) {
    if (mode === "artifacts") {
      if (action === "Delete") {
        const deleted = await fetch(`/api/admin/command-center/artifacts?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
        if (!deleted.ok) { setError("This artifact cannot be deleted."); return; }
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
      if (!response.ok || !url) { setError("A signed download link could not be created."); return; }
      if (action === "Preview") setPreview({ name: item.title, url });
      else window.location.assign(url);
    } else if (mode === "memory") {
      if (action === "Correct") {
        setEditing(item);
        setEditValue(item.subtitle);
        return;
      }
      if (action === "Disable") {
        const response = await fetch("/api/admin/command-center/memory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, disabled: true }) });
        if (!response.ok) { setError("This preference cannot be disabled."); return; }
        await load();
        return;
      }
      const response = await fetch(`/api/admin/command-center/memory?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!response.ok) { setError("This memory cannot be deleted."); return; }
      await load();
    } else if (mode === "notifications") {
      if (action === "Clear all") {
        const response = await fetch("/api/admin/command-center/notifications?all=true", { method: "DELETE" });
        if (!response.ok) { setError("Notifications cannot be cleared."); return; }
        await load();
        return;
      }
      const response = await fetch(`/api/admin/command-center/notifications?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!response.ok) { setError("Notification cannot be dismissed."); return; }
      await load();
    }
  }

  return (
    <aside ref={panelRef} tabIndex={-1} className="relative z-30 flex h-full w-[330px] shrink-0 flex-col border-l border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950" aria-label="Command Center details panel">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5 dark:border-slate-800">
        <nav className="flex gap-1 overflow-x-auto py-1" aria-label="Details view tabs">
          {(["activity", "approvals", "artifacts", "memory", "notifications", "capabilities", "widgets", "reasoning", "metrics"] as const).map((tab) => (
            <button key={tab} onClick={() => onMode(tab as FlyoutModeExtended)} className={cn("rounded-lg px-2 py-1 text-[11px] font-bold capitalize transition whitespace-nowrap", mode === tab ? "bg-blue-50 text-[#0075de] dark:bg-slate-800 dark:text-blue-400 border border-blue-100" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900")}>
              {tab}
            </button>
          ))}
        </nav>
        <button onClick={onClose} title="Close Panel" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-slate-50 transition">
          <X size={15} />
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
        ) : mode === "capabilities" ? (
          <div className="space-y-3">
            {capabilities.map((cap) => (
               <div key={cap.id} className="cc-capability-row flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                     <span className={cn("size-2 rounded-full", cap.status === "complete" ? "bg-emerald-500" : cap.status === "running" ? "bg-blue-500 animate-pulse" : cap.status === "error" ? "bg-red-500" : "bg-amber-500")} />
                     <b className="text-xs font-bold text-slate-900 dark:text-white">{cap.name}</b>
                     {cap.durationMs !== undefined && <span className="cc-status-badge ml-auto text-[10px] text-slate-500">{cap.durationMs}ms</span>}
                  </div>
                  {cap.dependencies && cap.dependencies.length > 0 && (
                     <div className="text-[10px] text-slate-500">
                        Deps: {cap.dependencies.join(", ")}
                     </div>
                  )}
               </div>
            ))}
            {!capabilities.length && <p className="py-12 text-center text-xs text-slate-400">No capabilities available.</p>}
          </div>
        ) : mode === "widgets" ? (
          <div className="space-y-3">
             {executionWidgets.map((widget) => (
               <div key={widget.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                 <div className="flex items-center gap-2 mb-2">
                   <FileText size={14} className="text-slate-500" />
                   <b className="text-xs font-bold text-slate-900 dark:text-white">{widget.title}</b>
                   <span className="cc-status-badge ml-auto text-[10px] capitalize">{widget.status}</span>
                 </div>
                 <div className="text-[10px] text-slate-500 truncate">
                    {Object.keys(widget.data).length > 0 ? JSON.stringify(widget.data).slice(0, 100) + '…' : 'No data yet'}
                 </div>
               </div>
             ))}
             {!executionWidgets.length && <p className="py-12 text-center text-xs text-slate-400">No active widgets.</p>}
          </div>
        ) : mode === "reasoning" ? (
          <div className="space-y-4 text-xs">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1"><Brain size={14}/> Intent Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400">{timeline.find(t => t.label.toLowerCase().includes('planning'))?.detail || 'Intent analysis derived from user instruction.'}</p>
            </section>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1"><Loader2 size={14}/> Capability Routing</h3>
              <p className="text-slate-600 dark:text-slate-400">{timeline.filter(t => t.toolName).map(t => t.label).join(' → ') || 'No routing information available.'}</p>
            </section>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
               <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1"><CheckCircle2 size={14}/> Model Selection</h3>
               <p className="text-slate-600 dark:text-slate-400">{timeline.length > 0 ? `${timeline.filter(t => t.status === 'complete').length} of ${timeline.length} steps completed` : 'No model selection info.'}</p>
            </section>
          </div>
        ) : mode === "metrics" ? (
          <div className="space-y-4">
             {(() => {
               const toolCalls = timeline.filter(t => t.toolName);
               const successCount = toolCalls.filter(t => t.status === 'complete').length;
               const successRate = toolCalls.length ? Math.round((successCount / toolCalls.length) * 100) : 0;
               const times = toolCalls.map(t => t.durationMs || 0).filter(d => d > 0);
               const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
               return (
                 <>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                       <div className="text-[10px] text-slate-500 mb-1">Total Tools</div>
                       <div className="text-lg font-bold text-slate-900 dark:text-white">{toolCalls.length}</div>
                     </div>
                     <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                       <div className="text-[10px] text-slate-500 mb-1">Success Rate</div>
                       <div className="text-lg font-bold text-slate-900 dark:text-white">{successRate}%</div>
                     </div>
                     <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50 col-span-2">
                       <div className="text-[10px] text-slate-500 mb-1">Average Response Time</div>
                       <div className="text-lg font-bold text-slate-900 dark:text-white">{avgTime}ms</div>
                     </div>
                   </div>
                   {toolCalls.length > 0 && (
                     <div className="mt-4">
                       <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Tool Timing</h3>
                       <div className="space-y-2">
                         {toolCalls.map(t => (
                           <div key={t.id} className="flex items-center justify-between text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1">
                             <span className="text-slate-600 dark:text-slate-400">{t.label}</span>
                             <span className="font-mono text-slate-500">{t.durationMs || 0}ms</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </>
               )
             })()}
          </div>
        ) : mode === "activity" ? (
          <div className="space-y-3">
            {activity.map((act) => (
              <div key={act.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span className={cn("size-2 rounded-full", act.state === "complete" ? "bg-emerald-500" : "bg-blue-500")} />
                  {act.label}
                </div>
                {act.detail && <p className="mt-1 text-slate-500 dark:text-slate-400">{act.detail}</p>}
                <time className="mt-1 block text-[10px] text-slate-400">{act.timestamp}</time>
              </div>
            ))}
            {!activity.length && <p className="py-12 text-center text-xs text-slate-400">No agent activity logged yet.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <b className="font-bold text-slate-900 dark:text-white">{item.title}</b>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.status}</span>
                </div>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                {item.action && (
                  <button onClick={() => void act(item, item.action)} className="mt-2 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                    {item.action}
                  </button>
                )}
              </div>
            ))}
            {!items.length && !error && (
              <div className="py-16 text-center text-xs text-slate-400">
                No active {mode} records.
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function mapItem(mode: FlyoutModeExtended, raw: unknown): SafeItem | null {
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
