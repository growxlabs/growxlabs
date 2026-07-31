"use client";

import { GoalManagementConsole } from "@/components/performance/GoalManagementConsole";
import { AIPerformanceAssistant } from "@/components/performance/AIPerformanceAssistant";

export default function EmployeePerformancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold">[ ESS PERFORMANCE ]</span>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">My Goals & Career Development</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage individual OKRs, submit self-reviews, and track your development goals.
        </p>
      </div>

      <GoalManagementConsole />
      <AIPerformanceAssistant />
    </main>
  );
}
