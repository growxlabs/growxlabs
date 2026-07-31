"use client";

import { useState } from "react";
import { LifeBuoy, Plus, Clock, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";

export function HelpdeskPortalConsole() {
  const [tickets] = useState([
    { id: "t1", category: "IT Support", subject: "Requesting VPN Credentials", priority: "high", status: "open", agent: "Tech Support Queue", created: "10 mins ago" },
    { id: "t2", category: "HR Operations", subject: "PF Deduction Clarification", priority: "medium", status: "in_progress", agent: "Priya Nair", created: "2 hours ago" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-500" />
            Employee Helpdesk & SLA Service Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Multi-category service tickets (IT, HR, Finance, Facilities) with SLA escalation and agent resolution queues.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Create Support Ticket
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.id} className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                  {t.category}
                </span>
                <h3 className="text-sm font-bold text-foreground">{t.subject}</h3>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5" /> Assigned: <span className="font-semibold text-foreground">{t.agent}</span> • Created {t.created}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                t.priority === "high" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {t.priority} Priority
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
