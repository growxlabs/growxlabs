"use client";

import React, { useState } from "react";
import { Loader2, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Subagent {
  id: string;
  name: string;
  focus: string;
  mission: string;
  status: "running" | "completed" | "error";
  logs: string[];
  result?: string;
}

export function SubagentCard({ agent }: { agent: Subagent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-lg border bg-white p-3.5 shadow-sm space-y-2.5 transition-all text-left",
      agent.status === "running" ? "border-[#0075de]/30 bg-[#0075de]/[0.01]" : "border-[#e6e6e6]"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {agent.status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 text-[#0075de] animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
            )}
            <h5 className="font-bold text-neutral-800 text-[13px] truncate">{agent.name}</h5>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">Focus: {agent.focus}</p>
        </div>
      </div>

      <div className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded border border-neutral-100 font-mono leading-relaxed">
        <p className="text-[10px] uppercase text-neutral-400 font-bold mb-1 tracking-wider">Mission</p>
        <p>{agent.mission}</p>
      </div>

      <div className="space-y-1.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-mono uppercase tracking-wider"
        >
          <span>Activity Log ({agent.logs.length})</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")} />
        </button>

        {expanded && (
          <div className="pl-1 pt-1.5 space-y-2 border-l border-neutral-200 ml-1.5">
            {agent.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-500 font-mono">
                <span className="w-1 h-1 rounded-full bg-neutral-400 mt-2 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
            {agent.result && (
              <div className="mt-2 text-xs text-neutral-800 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded">
                <p className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider mb-1">Result Summary</p>
                <p className="leading-relaxed font-mono">{agent.result}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
