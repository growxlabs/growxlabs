"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Bot, Sparkles, TrendingUp } from "lucide-react";

import { hrmsApi } from "@/lib/hrms/query/api-client";

type Forecast = {
  active_headcount: number;
  projected_monthly_cost: number;
  projected_annual_cost: number;
  advisory_note: string;
};

export function AIPayrollAssistant() {
  const forecastMutation = useMutation({
    mutationFn: (headcount: number) =>
      hrmsApi<Forecast>("payroll/ai/forecast", {
        method: "POST",
        body: JSON.stringify({ headcount }),
      }),
  });
  const form = useForm({
    defaultValues: { headcount: 25 },
    onSubmit: async ({ value }) => {
      await forecastMutation.mutateAsync(value.headcount);
    },
  });
  const forecast = forecastMutation.data;

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

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <label className="block text-xs font-bold text-muted-foreground uppercase">Projected Active Headcount</label>
        <div className="flex gap-2">
          <form.Field
            name="headcount"
            validators={{
              onChange: ({ value }) => value < 1 || value > 1_000_000 ? "Headcount must be between 1 and 1,000,000." : undefined,
            }}
          >
            {(field) => (
              <div className="flex-1">
                <input
                  aria-label="Projected active headcount"
                  aria-invalid={field.state.meta.errors.length > 0}
                  type="number"
                  min={1}
                  max={1_000_000}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(Number(event.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-neutral-900 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
                {field.state.meta.errors.length ? (
                  <p role="alert" className="mt-1 text-xs text-red-400">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>
          <button
            type="submit"
            disabled={forecastMutation.isPending || !form.state.canSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Bot className="w-4 h-4" /> {forecastMutation.isPending ? "Computing..." : "Run AI Cost Forecast"}
          </button>
        </div>

        {forecastMutation.isError ? (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
            The advisory forecast is unavailable. Payroll values were not estimated locally.
          </p>
        ) : null}
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
      </form>
    </div>
  );
}
