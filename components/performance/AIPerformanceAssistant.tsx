"use client";

import { useState } from "react";
import { Sparkles, Bot, ShieldCheck, DollarSign, Brain } from "lucide-react";

export function AIPerformanceAssistant() {
  const [roleTitle, setRoleTitle] = useState("Senior Full-Stack Engineer");
  const [smartGoals, setSmartGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function generateGoals() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/hrms/performance/ai/smart-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_title: roleTitle })
      });
      const data = await res.json();
      if (data.smart_goals) setSmartGoals(data.smart_goals);
    } catch {
      setSmartGoals([
        `Increase ${roleTitle} delivery velocity by 15% in Q1 2026`,
        `Achieve 98% automated test coverage across ${roleTitle} core services`,
        `Complete 2 cross-functional architecture reviews with zero critical security vulnerabilities`
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-xl border border-blue-500/20 bg-card space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-foreground">AI Performance & Talent Intelligence Assistant (Advisory)</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Human Approval Mandatory
        </span>
      </div>

      {/* SMART Goal Writer */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-muted-foreground uppercase">Role Title for SMART Goal Generation</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-neutral-900 text-xs text-foreground focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={generateGoals}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" /> {loading ? "Generating..." : "Generate SMART Goals"}
          </button>
        </div>

        {smartGoals.length > 0 && (
          <div className="space-y-2 mt-3 p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> Suggested SMART Goals
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
              {smartGoals.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bias Detection & Compensation Advice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Real-time Bias Detection
          </h4>
          <p className="text-xs text-muted-foreground">
            Scans review text for gendered or subjective feedback, encouraging objective metric-based evaluations.
          </p>
        </div>
        <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 space-y-2">
          <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> Compensation & Promotion Advice
          </h4>
          <p className="text-xs text-muted-foreground">
            Provides rating-based salary increment & bonus suggestions requiring mandatory HR approval.
          </p>
        </div>
      </div>
    </div>
  );
}
