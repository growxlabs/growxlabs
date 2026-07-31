"use client";

import { useState } from "react";
import { GitFork, Plus, CheckCircle2, Shield, Clock } from "lucide-react";

export function WorkflowBuilderConsole() {
  const [workflows] = useState([
    { id: "wf1", name: "Promotion Approval Chain", trigger: "promotion_submitted", steps: ["Line Manager", "HR Director", "VP Finance"], status: "active" },
    { id: "wf2", name: "Executive Leave Approval (> 5 Days)", trigger: "leave_requested", steps: ["Department Head", "HR Ops"], status: "active" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-500" />
            No-Code Workflow & Multi-Stage Approval Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Build dynamic approval chains, SLA escalation rules, and event-driven automation for promotions, leaves, and expenses.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Create Workflow Rule
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400">
                  {wf.trigger.replace("_", " ")}
                </span>
                <h3 className="text-sm font-bold text-foreground">{wf.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {wf.steps.map((step, idx) => (
                  <div key={step} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-foreground font-medium">
                      {step}
                    </span>
                    {idx < wf.steps.length - 1 && <span>→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {wf.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
