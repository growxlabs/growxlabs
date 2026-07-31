"use client";

import {
  CheckCircle2,
  Circle,
  Loader2,
  SkipForward,
  XCircle,
  ShieldAlert,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanStepStatus, PlanView } from "./command-center.types";

const statusIcon: Record<PlanStepStatus, React.ReactNode> = {
  pending: <Circle size={14} className="text-slate-300" />,
  running: <Loader2 size={14} className="animate-spin text-blue-600" />,
  succeeded: <CheckCircle2 size={14} className="text-emerald-600" />,
  failed: <XCircle size={14} className="text-red-500" />,
  skipped: <SkipForward size={14} className="text-slate-400" />,
  waiting_approval: <ShieldAlert size={14} className="text-amber-500" />,
};

export function PlanBoard({
  plan,
  compact = false,
}: {
  plan: PlanView;
  compact?: boolean;
}) {
  const done = plan.steps.filter(
    (step) => step.status === "succeeded" || step.status === "skipped",
  ).length;
  const total = plan.steps.length || 1;
  const progress = Math.round((done / total) * 100);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 shadow-sm",
        compact && "rounded-xl",
      )}
      aria-label="Execution plan"
    >
      <header className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#0667b9]">
          <ListChecks size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {plan.title || "Execution plan"}
            </h3>
            {plan.agentName && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0667b9]">
                {plan.agentName}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {done}/{total} steps · {progress}% complete
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0877d1] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <ol className="divide-y divide-slate-100">
        {plan.steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-3 px-4 py-2.5 text-left transition",
              step.status === "running" && "bg-blue-50/50",
              step.status === "waiting_approval" && "bg-amber-50/60",
              step.status === "failed" && "bg-red-50/40",
            )}
          >
            <span className="mt-0.5 shrink-0">{statusIcon[step.status]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tabular-nums text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="truncate text-xs font-semibold text-slate-800">
                  {step.name}
                </p>
              </div>
              {(step.detail || step.type || step.toolId) && (
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {step.detail ||
                    [step.type, step.toolId].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                step.status === "succeeded" && "bg-emerald-50 text-emerald-700",
                step.status === "running" && "bg-blue-50 text-blue-700",
                step.status === "failed" && "bg-red-50 text-red-700",
                step.status === "waiting_approval" &&
                  "bg-amber-50 text-amber-800",
                step.status === "pending" && "bg-slate-50 text-slate-500",
                step.status === "skipped" && "bg-slate-50 text-slate-400",
              )}
            >
              {step.status.replace("_", " ")}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
