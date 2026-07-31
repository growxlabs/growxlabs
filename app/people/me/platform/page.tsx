"use client";

import { WorkflowBuilderConsole } from "@/components/platform/WorkflowBuilderConsole";

export default function EmployeePlatformPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">[ ESS WORKSPACE & APPROVALS ]</span>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">My Workflows & Approvals Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track active promotion requests, leave approvals, expense reimbursements, and asset assignments.
        </p>
      </div>

      <WorkflowBuilderConsole />
    </main>
  );
}
