"use client";

import {
  Activity,
  CheckCircle2,
  CircleDot,
  Loader2,
  OctagonX,
  PauseCircle,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem, RunStatus, RunView } from "./command-center.types";
import { isTerminalRun } from "./agentic-utils";

const runMeta: Record<
  RunStatus,
  { label: string; tone: string; icon: React.ReactNode }
> = {
  queued: {
    label: "Queued",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <PauseCircle size={12} />,
  },
  running: {
    label: "Running",
    tone: "bg-blue-50 text-blue-800 border-blue-200",
    icon: <Loader2 size={12} className="animate-spin" />,
  },
  waiting: {
    label: "Waiting",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <PauseCircle size={12} />,
  },
  waiting_for_approval: {
    label: "Needs approval",
    tone: "bg-amber-50 text-amber-900 border-amber-200",
    icon: <ShieldAlert size={12} />,
  },
  succeeded: {
    label: "Succeeded",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 size={12} />,
  },
  failed: {
    label: "Failed",
    tone: "bg-red-50 text-red-800 border-red-200",
    icon: <OctagonX size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <OctagonX size={12} />,
  },
};

export function RunTimeline({
  run,
  activity,
  onCancel,
  cancelling,
}: {
  run: RunView;
  activity: ActivityItem[];
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const meta = runMeta[run.status];
  const related = activity
    .filter((item) => !item.runId || item.runId === run.id)
    .slice(-8)
    .reverse();

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-label="Run timeline"
    >
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white">
          <Activity size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {run.title || "Live run"}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                meta.tone,
              )}
            >
              {meta.icon}
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {run.id.slice(0, 8)}… · seq {run.lastSequence}
          </p>
        </div>
        {!isTerminalRun(run.status) && onCancel && (
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelling ? "Stopping…" : "Cancel run"}
          </button>
        )}
      </header>

      <ol className="max-h-56 space-y-0 overflow-y-auto p-2">
        {related.length === 0 ? (
          <li className="flex items-center gap-2 px-2 py-4 text-xs text-slate-400">
            <CircleDot size={14} className="text-blue-400" />
            Waiting for execution events…
          </li>
        ) : (
          related.map((item) => (
            <li
              key={item.id}
              className="flex gap-2.5 rounded-xl px-2 py-2 hover:bg-slate-50"
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  item.state === "complete" && "bg-emerald-500",
                  item.state === "failed" && "bg-red-500",
                  item.state === "blocked" && "bg-amber-500",
                  item.state === "working" || item.state === "thinking"
                    ? "bg-blue-500"
                    : item.state === "waiting"
                      ? "bg-amber-400"
                      : "bg-slate-300",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {item.label}
                </p>
                {item.detail && (
                  <p className="truncate text-[11px] text-slate-500">
                    {item.detail}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-[10px] tabular-nums text-slate-400">
                {formatClock(item.timestamp)}
              </time>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}

function formatClock(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
