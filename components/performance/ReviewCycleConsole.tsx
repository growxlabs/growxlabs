"use client";

import { useState } from "react";
import { ClipboardList, ShieldCheck, UserCheck, CheckCircle, Clock } from "lucide-react";

export function ReviewCycleConsole() {
  const [reviews] = useState([
    { id: "r1", employee: "Rahul Sharma", cycle: "Q1 2026 Performance Review", stage: "manager_review", rating: 4.2, status: "In Progress" },
    { id: "r2", employee: "Ananya Iyer", cycle: "Probation Confirmation", stage: "hr_review", rating: 4.8, status: "Pending HR Approval" },
    { id: "r3", employee: "Vikram Mehta", cycle: "Annual Promotion Review", stage: "leadership_review", rating: 4.9, status: "Pending Leadership Approval" },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-500" />
          Performance Review Workflows & Multi-Tier Approvals
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configurable review cycles with immutable versioning and multi-stage approvals (Employee → Manager → HR → Leadership).
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{r.employee}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">
                  {r.cycle}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Stage: <span className="text-foreground font-semibold uppercase">{r.stage.replace("_", " ")}</span>
              </p>
            </div>

            {/* Workflow Pipeline Stepper */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div className="flex items-center gap-1 text-emerald-400"><UserCheck className="w-4 h-4" /> Self</div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 text-emerald-400"><UserCheck className="w-4 h-4" /> Manager</div>
              <span className="text-muted-foreground">→</span>
              <div className={`flex items-center gap-1 ${r.stage === "hr_review" || r.stage === "leadership_review" ? "text-amber-400 font-bold" : "text-muted-foreground"}`}>
                <ShieldCheck className="w-4 h-4" /> HR
              </div>
              <span className="text-muted-foreground">→</span>
              <div className={`flex items-center gap-1 ${r.stage === "leadership_review" ? "text-amber-400 font-bold" : "text-muted-foreground"}`}>
                <CheckCircle className="w-4 h-4" /> Leadership
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
