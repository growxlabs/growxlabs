"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Sparkles } from "lucide-react";

import { hrmsApi } from "@/lib/hrms/query/api-client";
import { hrmsCachePolicy, hrmsQueryKeys } from "@/lib/hrms/query/keys";

type ExecutiveSummary = {
  org_health_score: number;
  attrition_forecast: string;
  hiring_velocity: string;
  payroll_cost_delta: string;
  productivity_trend: string;
  executive_rec: string;
};

export function ExecutiveCommandCenter() {
  const summaryQuery = useQuery({
    queryKey: hrmsQueryKeys.platform.detail("executive-summary"),
    queryFn: ({ signal }) => hrmsApi<ExecutiveSummary>("platform/ai/executive-summary", {}, signal),
    staleTime: hrmsCachePolicy.medium,
  });
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Executive Command Center & AI Workforce Intelligence
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time organization health index, predictive attrition risk, hiring velocity, and advisory executive decision intelligence.
        </p>
      </div>

      {summaryQuery.isPending ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading Executive Intelligence Summary...</div>
      ) : summaryQuery.isError ? (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-xs text-red-300">
          Executive intelligence is temporarily unavailable. No synthetic summary has been substituted.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border border-emerald-500/20 bg-card space-y-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Organization Health Score</span>
            <div className="text-3xl font-black text-emerald-400">{summary?.org_health_score}/100</div>
            <p className="text-xs text-muted-foreground">Optimal operational performance</p>
          </div>

          <div className="p-6 rounded-xl border border-blue-500/20 bg-card space-y-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Attrition Risk Forecast</span>
            <div className="text-lg font-bold text-foreground">{summary?.attrition_forecast}</div>
            <p className="text-xs text-emerald-400">Below industry benchmark</p>
          </div>

          <div className="p-6 rounded-xl border border-indigo-500/20 bg-card space-y-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Productivity Trend</span>
            <div className="text-lg font-bold text-foreground">{summary?.productivity_trend}</div>
            <p className="text-xs text-indigo-400">YoY output expansion</p>
          </div>

          <div className="md:col-span-3 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> AI Advisory Recommendation for Executive Board
            </h4>
            <p className="text-sm font-semibold text-foreground">{summary?.executive_rec}</p>
          </div>
        </div>
      )}
    </div>
  );
}
