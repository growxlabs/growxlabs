import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "./command-center.types";

const labels: Record<AgentState, string> = {
  idle: "Ready", thinking: "Planning", working: "Working", waiting: "Waiting",
  blocked: "Approval needed", complete: "Completed", failed: "Failed",
};

export function AgentPresence({ name, state, summary }: { name: string; state: AgentState; summary?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-[#e9f4ff] text-[#0667b9]">
        <Bot size={16} aria-hidden="true" />
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white",
          state === "failed" ? "bg-red-500" : state === "blocked" || state === "waiting" ? "bg-amber-500" :
          state === "complete" ? "bg-emerald-500" : state === "idle" ? "bg-slate-400" : "bg-blue-500 motion-safe:animate-pulse",
        )} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
        <p className="truncate text-[11px] text-slate-500">{summary || labels[state]}</p>
      </div>
      <span className="sr-only" role="status">{name}: {labels[state]}</span>
    </div>
  );
}
