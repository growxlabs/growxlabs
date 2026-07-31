"use client";

import { useState } from "react";
import { PayrollProcessingStudio } from "@/components/payroll/PayrollProcessingStudio";
import { ReimbursementConsole } from "@/components/payroll/ReimbursementConsole";
import { AIPayrollAssistant } from "@/components/payroll/AIPayrollAssistant";

export default function HRMSPayrollAdminPage() {
  const [activeTab, setActiveTab] = useState<"runs" | "reimbursements" | "ai">("runs");

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">[ HRMS RELEASE 08 ]</span>
          <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">Payroll, Compensation & Benefits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deterministic payroll calculation, statutory compliance (PF, ESI, IT), reimbursements, and cost forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
          {[
            { id: "runs", label: "Payroll Runs" },
            { id: "reimbursements", label: "Reimbursements" },
            { id: "ai", label: "AI Forecast" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "runs" && <PayrollProcessingStudio />}
      {activeTab === "reimbursements" && <ReimbursementConsole />}
      {activeTab === "ai" && <AIPayrollAssistant />}
    </main>
  );
}
