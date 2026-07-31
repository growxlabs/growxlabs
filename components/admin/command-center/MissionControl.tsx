"use client";

import { Bot, Radio, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState, MissionControlState } from "./command-center.types";
import { isTerminalRun } from "./agentic-utils";
import { PlanBoard } from "./PlanBoard";
import { RunTimeline } from "./RunTimeline";
import { ApprovalCard } from "./ApprovalCard";
import type { ActivityItem } from "./command-center.types";

const stateTone: Record<AgentState, string> = {
  idle: "bg-slate-100 text-slate-600",
  thinking: "bg-violet-50 text-violet-700",
  working: "bg-blue-50 text-blue-700",
  waiting: "bg-amber-50 text-amber-800",
  blocked: "bg-amber-100 text-amber-900",
  complete: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

export function MissionControl({
  mission,
  activity,
  onCancelRun,
  cancelling,
  onApprovalDecided,
  collapsed,
  onToggle,
}: {
  mission: MissionControlState;
  activity: ActivityItem[];
  onCancelRun?: () => void;
  cancelling?: boolean;
  onApprovalDecided?: (decision: "approved" | "rejected") => void;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const live =
    mission.state === "thinking" ||
    mission.state === "working" ||
    mission.state === "waiting" ||
    mission.state === "blocked" ||
    (mission.run != null && !isTerminalRun(mission.run.status));

  if (!mission.plan && !mission.run && !mission.approval && mission.state === "idle") {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-[#f8fafc]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/70"
        aria-expanded={!collapsed}
      >
        <div className="relative grid size-8 place-items-center rounded-lg bg-[#e9f4ff] text-[#0667b9]">
          <Bot size={15} />
          {live && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-blue-500 ring-2 ring-white motion-safe:animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-xs font-bold text-slate-900">
              {mission.agentName}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                stateTone[mission.state],
              )}
            >
              {mission.state}
            </span>
            {live && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                <Radio size={11} /> Live
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-slate-500">{mission.summary}</p>
        </div>
        <Sparkles size={14} className="shrink-0 text-slate-300" />
      </button>

      {!collapsed && (
        <div className="grid gap-3 px-3 pb-3 lg:grid-cols-2">
          {mission.plan && (
            <div className={cn(!mission.run && !mission.approval && "lg:col-span-2")}>
              <PlanBoard plan={mission.plan} />
            </div>
          )}
          {mission.run && (
            <RunTimeline
              run={mission.run}
              activity={activity}
              onCancel={onCancelRun}
              cancelling={cancelling}
            />
          )}
          {mission.approval && (
            <div className={cn(!mission.plan && !mission.run && "lg:col-span-2")}>
              <ApprovalCard
                approval={mission.approval}
                onDecided={onApprovalDecided}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
