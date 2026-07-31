"use client";

import { useState } from "react";
import { Network, Webhook, Zap, CheckCircle2, ShieldCheck } from "lucide-react";

export function IntegrationHubConsole() {
  const [connectors] = useState([
    { id: "c1", provider: "SAP SuccessFactors / ERP", category: "ERP", status: "connected", lastSync: "12 mins ago" },
    { id: "c2", provider: "Salesforce CRM Sync", category: "CRM", status: "connected", lastSync: "1 hour ago" },
    { id: "c3", provider: "QuickBooks Accounting", category: "Finance", status: "active", lastSync: "3 hours ago" },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Enterprise Integration Platform & Webhooks
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Bi-directional API connectors for ERP, CRM, Payroll Providers, and event-driven webhook dispatchers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <div key={c.id} className="p-5 rounded-xl border border-border bg-card space-y-3">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                {c.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {c.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground">{c.provider}</h3>
            <p className="text-xs text-muted-foreground">Last synchronized {c.lastSync}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
