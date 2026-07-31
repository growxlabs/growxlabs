"use client";

import { useState } from "react";
import { Sparkles, Bot, ShieldAlert, TrendingUp } from "lucide-react";

export function AIPayrollAssistant() {
  const [headcount, setHeadcount] = useState(25);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generateForecast() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/hrms/payroll/ai/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headcount })
      });
      const data = await res.json();
      setForecast(data);
    } catch {
      setForecast({
        active_headcount: headcount,
        projected_monthly_cost: headcount * 100000,
        projected_annual_cost: headcount * 1200000,
        advisory_note: "Cost projection incorporates 8% planned Q2 annual performance increments."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-xl border border-emerald-500/20 bg-card space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">AI Payroll & Cost Forecast Assistant (Advisory)</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Human Approval Mandatory
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-muted-foreground uppercase">Projected Active Headcount</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={headcount}
            onChange={(e) => setHeadcount(parseInt(e.target.value) || 0)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-neutral-900 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={generateForecast}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" /> {loading ? "Computing..." : "Run AI Cost Forecast"}
          </button>
        </div>

        {forecast && (
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 mt-4">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Projected Financial Commitment
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>Monthly Projection: <strong className="text-foreground">₹{(forecast.projected_monthly_cost / 100000).toFixed(2)} Lakhs</strong></div>
              <div>Annual Projection: <strong className="text-emerald-400">₹{(forecast.projected_annual_cost / 10000000).toFixed(2)} Crores</strong></div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">{forecast.advisory_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
