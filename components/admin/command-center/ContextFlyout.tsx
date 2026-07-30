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
    setLoading(true); setError("");
    try {
      const source = config[mode];
      const response = await fetch(source.endpoint, { cache: "no-store" });
      const payload = record(await response.json());
      if (!response.ok) throw new Error(safeString(payload.error, "This view is unavailable."));
      const rawValues = Array.isArray(payload[source.key]) ? (payload[source.key] as unknown[]) : [];
      const mapped = rawValues.map((value: unknown) => mapItem(mode, value)).filter((value: SafeItem | null): value is SafeItem => value !== null);
      setItems(mapped);
      if (mode === "notifications") {
        onUnreadChange(mapped.filter((item: SafeItem) => item.status === "unread" || item.status === "critical").length);
        const settings = record(payload.preferences);
        setPreferences({ info: settings.info !== false, success: settings.success !== false, warning: settings.warning !== false });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This view is unavailable.");
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
      const response = await fetch("/api/admin/command-center/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: item.id, action: action === "Archive" ? "archive" : "read" }) });
      if (!response.ok) { setError("The notification could not be updated."); return; }
      await load();
    }
  }

  return (
    <>
      <button className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={onClose} aria-label="Close context panel" />
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-label="Command context" className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[390px] flex-col border-l border-slate-200 bg-white shadow-2xl lg:static lg:z-auto lg:w-[330px] lg:shadow-none">
        <div className="flex h-14 items-center border-b border-slate-200 px-3">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {(["activity", "approvals", "artifacts", "memory", "notifications"] as const).map((value) => (
              <button key={value} onClick={() => onMode(value)} className={cn("rounded-md px-2 py-1.5 text-[11px] capitalize", mode === value ? "bg-slate-900 font-semibold text-white" : "text-slate-500 hover:bg-slate-100")}>{value}</button>
            ))}
          </div>
          <button onClick={onClose} className="ml-2 grid size-8 shrink-0 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close context panel"><X size={16} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {mode === "artifacts" && preview && <div className="mb-3 overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2"><p className="truncate text-xs font-semibold">{preview.name}</p><button onClick={() => setPreview(null)} aria-label="Close artifact preview"><X size={14} /></button></div>
            <iframe src={preview.url} title={`Preview ${preview.name}`} sandbox="" className="h-72 w-full bg-slate-50" />
          </div>}
          {mode === "memory" && editing && <form className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3" onSubmit={async (event) => {
            event.preventDefault();
            const response = await fetch("/api/admin/command-center/memory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, content: editValue, disabled: false }) });
            if (!response.ok) { setError("This preference cannot be corrected."); return; }
            setEditing(null); await load();
          }}>
            <label className="text-xs font-semibold text-slate-700">Correct preference<textarea maxLength={4_000} required value={editValue} onChange={(event) => setEditValue(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-blue-200 bg-white p-2 text-xs outline-none focus:border-blue-500" /></label>
            <div className="mt-2 flex gap-2"><button className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Save correction</button><button type="button" onClick={() => setEditing(null)} className="rounded-md px-3 py-1.5 text-xs text-slate-500">Cancel</button></div>
          </form>}
          {mode === "notifications" && !loading && items.some((item) => item.status === "unread" || item.status === "critical") &&
            <button className="mb-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={async () => {
              await fetch("/api/admin/command-center/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read_all" }) });
              await load();
            }}>Mark all as read</button>}
          {mode === "notifications" && !loading && <details className="mb-3 rounded-lg border border-slate-200 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-slate-600">Notification preferences</summary>
            <div className="mt-3 space-y-2">
              {(["info", "success", "warning"] as const).map((severity) => <label key={severity} className="flex items-center justify-between text-xs capitalize text-slate-600">{severity}<input type="checkbox" checked={preferences[severity]} onChange={async (event) => {
                const next = { ...preferences, [severity]: event.target.checked };
                setPreferences(next);
                await fetch("/api/admin/command-center/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "preferences", preferences: next }) });
              }} /></label>)}
              <p className="text-[10px] leading-4 text-slate-400">Critical security notifications cannot be disabled.</p>
            </div>
          </details>}
          {mode === "activity" ? <ActivityList items={activity} /> : loading ? <State icon={<Loader2 className="animate-spin motion-reduce:animate-none" />} text="Loading securely…" /> :
            error ? <State icon={<AlertCircle />} text={error} error /> :
            items.length ? <div className="space-y-2">{items.map((item) => <ItemRow key={item.id} item={item} mode={mode} onAction={(action) => void act(item, action)} />)}</div> :
            <State icon={<CheckCircle2 />} text={`No ${mode} to show.`} />}
        </div>
      </aside>
    </>
  );
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  if (!items.length) return <State icon={<CheckCircle2 />} text="Agent activity will appear here." />;
  return <div className="space-y-1">{items.map((item) => (
    <details key={item.id} className="rounded-lg border border-slate-200 px-3 py-2" open={item === items.at(-1)}>
      <summary className="cursor-pointer list-none text-xs font-medium text-slate-700"><span className={cn("mr-2 inline-block size-2 rounded-full", item.state === "failed" ? "bg-red-500" : item.state === "blocked" ? "bg-amber-500" : item.state === "complete" ? "bg-emerald-500" : "bg-blue-500")} />{item.label}</summary>
      {item.detail && <p className="mt-2 pl-4 text-[11px] leading-5 text-slate-500">{item.detail}</p>}
    </details>
  ))}</div>;
}

function ItemRow({ item, mode, onAction }: { item: SafeItem; mode: FlyoutMode; onAction: (action: string) => void }) {
  const Icon = mode === "approvals" ? ShieldCheck : mode === "artifacts" ? FileText : mode === "memory" ? Brain : Bell;
  return <div className={cn("rounded-xl border p-3", item.status === "critical" ? "border-red-200 bg-red-50" : "border-slate-200")}>
    <div className="flex gap-2.5"><Icon size={15} className="mt-0.5 shrink-0 text-slate-500" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{item.title}</p><p className="mt-1 line-clamp-3 text-[11px] leading-5 text-slate-500">{item.subtitle}</p><p className="mt-2 text-[10px] text-slate-400">{item.meta}</p></div></div>
    {(item.action || item.secondaryAction || item.tertiaryAction) && <div className="mt-2 flex flex-wrap gap-2">
      {item.action && <button onClick={() => onAction(item.action!)} className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50">{mode === "artifacts" ? <Download size={12} /> : mode === "memory" ? <Trash2 size={12} /> : <CheckCircle2 size={12} />}{item.action}</button>}
      {item.secondaryAction && <button onClick={() => onAction(item.secondaryAction!)} className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50">{item.secondaryAction}</button>}
      {item.tertiaryAction && <button onClick={() => onAction(item.tertiaryAction!)} className="flex h-7 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50">{item.tertiaryAction}</button>}
    </div>}
  </div>;
}

function State({ icon, text, error = false }: { icon: React.ReactNode; text: string; error?: boolean }) {
  return <div className={cn("grid min-h-48 place-items-center rounded-xl border border-dashed p-6 text-center text-xs", error ? "border-red-200 text-red-600" : "border-slate-200 text-slate-400")}><div className="flex flex-col items-center gap-3">{icon}{text}</div></div>;
}

function mapItem(mode: Exclude<FlyoutMode, "activity">, value: unknown): SafeItem | null {
  const item = record(value);
  const id = safeString(item.id);
  if (!id) return null;
  if (mode === "approvals") return { id, title: safeString(item.title, "Approval request"), subtitle: safeString(item.safeSummary, "Sensitive details are hidden."), meta: `${safeString(item.riskLevel, "unknown")} risk · ${safeString(item.status)}`, status: safeString(item.status), action: undefined };
  if (mode === "artifacts") return { id, title: safeString(item.name, "Artifact"), subtitle: safeString(item.safeDescription, safeString(item.artifactType).toUpperCase()), meta: `${safeString(item.artifactType).toUpperCase()} · ${safeString(item.classification)} · ${safeString(item.status)}`, status: safeString(item.status), action: item.status === "available" ? "Preview" : undefined, secondaryAction: item.status === "available" ? "Download" : undefined, tertiaryAction: item.status === "available" ? "Delete" : undefined };
  if (mode === "memory") {
    const owner = safeString(item.ownerType);
    const editable = safeString(item.memoryType) === "user_preference" && owner === "user";
    return { id, title: safeString(item.title, safeString(item.memoryType, "Memory")), subtitle: safeString(item.content, "Protected memory"), meta: `${safeString(item.memoryType)} · ${safeString(item.classification)} · ${safeString(item.status)}`, status: safeString(item.status), action: editable ? "Correct" : undefined, secondaryAction: editable && item.status === "active" ? "Disable" : undefined, tertiaryAction: editable ? "Delete" : undefined };
  }
  return { id, title: safeString(item.title, "Notification"), subtitle: safeString(item.body), meta: `${safeString(item.severity)} · ${safeString(item.status)}`, status: safeString(item.status) === "unread" && safeString(item.severity) === "critical" ? "critical" : safeString(item.status), action: item.status === "unread" ? "Mark read" : undefined, secondaryAction: item.status !== "archived" ? "Archive" : undefined };
}
