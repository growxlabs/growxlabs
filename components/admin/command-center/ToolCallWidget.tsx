"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, Check, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  status: "calling" | "complete" | "error";
  result?: any;
  duration?: number;
}

export function ToolCallWidget({ toolCalls }: { toolCalls?: ToolCall[] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-4 rounded-lg border border-[#e6e6e6] bg-[#f6f5f4]/50 overflow-hidden text-[13px] shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f6f5f4] hover:bg-neutral-100 transition-colors font-semibold text-neutral-700 select-none"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0075de] animate-pulse" />
          <span>Real Agent Activity ({toolCalls.length})</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="divide-y divide-[#e6e6e6] bg-white">
          {toolCalls.map((tc) => {
            const formatArgs = () => {
              if (!tc.args || Object.keys(tc.args).length === 0) return null;
              return (
                <pre className="mt-1 text-[10px] font-mono text-neutral-500 bg-neutral-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(tc.args, null, 2)}
                </pre>
              );
            };

            const formatResult = () => {
              if (!tc.result) return null;
              if (tc.name === "get_company_stats") {
                return (
                  <div className="mt-1.5 text-xs text-neutral-600 space-y-0.5 font-mono">
                    <p>Total Leads: {tc.result.totalLeads}</p>
                    <p>Average Score: {tc.result.averageLeadScore}</p>
                  </div>
                );
              }
              if (tc.name === "query_leads") {
                const count = Array.isArray(tc.result) ? tc.result.length : 0;
                return (
                  <p className="mt-1.5 text-xs text-neutral-600 font-mono">
                    → Found {count} lead(s) matching query
                  </p>
                );
              }
              if (tc.name === "create_lead") {
                return (
                  <p className="mt-1.5 text-xs text-emerald-600 font-mono">
                    → Created lead: {tc.result.business_name} ({tc.result.city})
                  </p>
                );
              }
              if (tc.name === "generate_proposal") {
                return (
                  <p className="mt-1.5 text-xs text-emerald-600 font-mono">
                    → Generated proposal ID: {tc.result.proposalId}
                  </p>
                );
              }
              return (
                <pre className="mt-1.5 text-[10px] font-mono text-neutral-500 bg-neutral-50 p-2 rounded overflow-x-auto max-h-24">
                  {typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result, null, 2)}
                </pre>
              );
            };

            return (
              <div key={tc.id} className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tc.status === "calling" ? (
                      <Loader2 className="w-4 h-4 text-[#0075de] animate-spin" />
                    ) : tc.status === "complete" ? (
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-mono font-bold text-neutral-800">{tc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {tc.status === "calling" ? "Running..." : "Finished"}
                  </span>
                </div>
                {formatArgs()}
                {formatResult()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
