"use client";

import { AlertCircle, Bell, Brain, CheckCircle2, Download, FileText, Loader2, ShieldCheck, Trash2, X } from "lucide-react";
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

export function ContextFlyout({ open, mode, activity, onClose, onMode, onUnreadChange }: {
  open: boolean; mode: FlyoutMode; activity: ActivityItem[]; onClose: () => void;
  onMode: (mode: FlyoutMode) => void; onUnreadChange: (count: number) => void;
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
    <aside ref={panelRef} tabIndex={-1} className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 sm:w-96" aria-label="Command Center details panel">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <nav className="flex gap-1" aria-label="Details view tabs">
          {(["activity", "approvals", "artifacts", "memory", "notifications"] as const).map((tab) => (
            <button key={tab} onClick={() => onMode(tab)} className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition", mode === tab ? "bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900")}>
              {tab}
            </button>
          ))}
        </nav>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><X size={16} /></button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
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
