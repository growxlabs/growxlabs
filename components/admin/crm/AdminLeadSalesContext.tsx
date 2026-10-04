"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesContextData {
  qualification?: {
    state?: string;
  };
  activities?: { id: string }[];
  followups?: { id: string; status: string }[];
  opportunity?: {
    stage?: string;
  };
  discovery?: {
    scheduled_start?: string;
  };
  handoff?: boolean;
  error?: string;
}

export function AdminLeadSalesContext({ leadId }: { leadId: string }) {
  const [data, setData] = useState<SalesContextData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/crm/leads/${leadId}/sales-context`)
      .then((r) => r.json())
      .then((json: SalesContextData) => setData(json))
      .catch(() => {});
  }, [leadId]);

  if (!data || data.error) return null;

  const rows = [
    {
      label: "Qualification",
      value: data.qualification?.state || "Not started",
      badge: true,
      color:
        data.qualification?.state === "qualified"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : data.qualification?.state === "unqualified"
          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
          : "bg-neutral-100 text-neutral-600 dark:bg-white/5 dark:text-neutral-400 border-neutral-200 dark:border-white/10",
    },
    {
      label: "Activities Logged",
      value: String(data.activities?.length || 0),
    },
    {
      label: "Open Follow-ups",
      value: String(data.followups?.filter((f) => f.status === "open").length || 0),
    },
    {
      label: "Opportunity Stage",
      value: data.opportunity?.stage ? data.opportunity.stage.replaceAll("_", " ") : "—",
    },
    {
      label: "Discovery Session",
      value: data.discovery?.scheduled_start
        ? new Date(data.discovery.scheduled_start).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    },
    {
      label: "Handoff Status",
      value: data.handoff ? "Completed" : "Pending",
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <BarChart3 size={14} className="text-[var(--text-secondary)]" /> Pipeline Metrics
        </h3>
      </div>
      <dl className="mt-3 space-y-2 text-xs divide-y divide-[var(--border-subtle)]/40">
        {rows.map((row, idx) => (
          <div key={row.label} className={cn("flex items-center justify-between", idx > 0 && "pt-2")}>
            <dt className="text-[var(--text-muted)] font-medium">{row.label}</dt>
            <dd className="font-semibold text-[var(--text-primary)]">
              {row.badge ? (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider",
                    row.color
                  )}
                >
                  {row.value}
                </span>
              ) : (
                <span className="capitalize">{row.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
