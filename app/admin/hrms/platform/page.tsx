"use client";

import { useState } from "react";
import { WorkflowBuilderConsole } from "@/components/platform/WorkflowBuilderConsole";
import { IntegrationHubConsole } from "@/components/platform/IntegrationHubConsole";
import { ExecutiveCommandCenter } from "@/components/platform/ExecutiveCommandCenter";

export default function HRMSPlatformAdminPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "integrations" | "executive">("executive");

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">[ HRMS RELEASE 10 — FINAL ]</span>
          <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">AI Workforce Operating System</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise administration, no-code workflow automation, integration platform, executive decision intelligence, and observability.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
          {[
            { id: "executive", label: "Executive Command Center" },
            { id: "workflows", label: "Workflow Automation" },
            { id: "integrations", label: "Integration Platform" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "executive" && <ExecutiveCommandCenter />}
      {activeTab === "workflows" && <WorkflowBuilderConsole />}
      {activeTab === "integrations" && <IntegrationHubConsole />}
    </main>
  );
}
