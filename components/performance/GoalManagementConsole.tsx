"use client";

import { useState } from "react";
import { Target, Plus, CheckCircle2, AlertTriangle, TrendingUp, Filter } from "lucide-react";

export function GoalManagementConsole() {
  const [goalType, setGoalType] = useState<string>("all");
  const [goals, setGoals] = useState([
    { id: "g1", title: "Scale AI Agent Throughput", type: "okr", owner: "Engineering", progress: 75, status: "on_track", weightage: 25 },
    { id: "g2", title: "Achieve 99.9% Uptime for Gateway", type: "kpi", owner: "DevOps", progress: 90, status: "completed", weightage: 20 },
    { id: "g3", title: "Reduce Onboarding Time to 2 Days", type: "department", owner: "HR Operations", progress: 40, status: "at_risk", weightage: 15 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Enterprise Goal Management (OKRs, KPIs & KRAs)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track organisation, department, team, and individual goals across quarterly and annual cycles.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "okr", "kpi", "kra", "department", "business", "project", "personal"].map((type) => (
          <button
            key={type}
            onClick={() => setGoalType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              goalType === type ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => (
          <div key={g.id} className="p-5 rounded-xl border border-border bg-card hover:border-neutral-700 transition-colors space-y-4">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400">
                {g.type}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                g.status === "on_track" ? "bg-emerald-500/10 text-emerald-400" :
                g.status === "completed" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {g.status.replace("_", " ")}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{g.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">Owner: {g.owner}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-foreground">{g.progress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${g.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
