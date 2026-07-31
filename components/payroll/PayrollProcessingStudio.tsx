"use client";

import { useState } from "react";
import { DollarSign, Play, CheckCircle2, Lock, FileText, AlertCircle } from "lucide-react";

export function PayrollProcessingStudio() {
  const [cycle] = useState({ name: "January 2026 Monthly Payroll", status: "processing", headcount: 42, grossTotal: "₹42,50,000", netTotal: "₹36,12,500" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Payroll Run & Calculation Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Execute deterministic payroll runs with automated PF, ESI, Income Tax, and Loan EMI deductions.
          </p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <Play className="w-4 h-4" /> Run Payroll Calculation
        </button>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">{cycle.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{cycle.headcount} active employees queued for payout</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {cycle.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Gross Pay</span>
            <div className="text-2xl font-black text-foreground mt-1">{cycle.grossTotal}</div>
          </div>
          <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Deductions (PF/ESI/Tax)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">₹6,37,500</div>
          </div>
          <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Net Payable</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{cycle.netTotal}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 border border-border hover:bg-neutral-800 text-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <FileText className="w-4 h-4" /> Download Payroll Summary PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Approve & Lock Payroll Batch
          </button>
        </div>
      </div>
    </div>
  );
}
