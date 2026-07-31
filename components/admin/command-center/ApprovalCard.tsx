"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalView, RiskLevel } from "./command-center.types";
import { riskTone } from "./agentic-utils";

export function ApprovalCard({
  approval,
  onDecided,
  compact,
}: {
  approval: ApprovalView;
  onDecided?: (decision: "approved" | "rejected") => void;
  compact?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [local, setLocal] = useState(approval);

  if (local.status !== "pending") {
    return (
      <div
        className={cn(
          "rounded-2xl border px-4 py-3 text-sm",
          local.status === "approved"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-slate-200 bg-slate-50 text-slate-700",
        )}
      >
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck size={16} />
          {local.status === "approved" ? "Approved" : "Rejected"}: {local.title}
        </div>
        <p className="mt-1 text-xs opacity-80">{local.summary}</p>
      </div>
    );
  }

  async function decide(decision: "approved" | "rejected") {
    if (decision === "rejected" && !reason.trim()) {
      setError("A reason is required when rejecting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/command-center/governance/approvals/decide",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalId: local.id,
            decision,
            reason: reason.trim(),
            idempotencyKey: crypto.randomUUID(),
          }),
        },
      );
      if (!response.ok) throw new Error("The server did not accept this decision.");
      setLocal({ ...local, status: decision === "approved" ? "approved" : "rejected" });
      onDecided?.(decision);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The decision could not be submitted.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm",
        compact && "rounded-xl",
      )}
      role="region"
      aria-label="Approval required"
    >
      <header className="flex items-start gap-3 border-b border-amber-100 px-4 py-3">
        <div className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-800">
          <ShieldAlert size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{local.title}</h3>
            <RiskBadge risk={local.riskLevel} />
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{local.summary}</p>
          {(local.operation || local.expiresAt) && (
            <p className="mt-1 text-[11px] text-slate-500">
              {[local.operation, local.expiresAt ? `Expires ${formatExpiry(local.expiresAt)}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </header>

      <div className="space-y-3 p-4">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Decision note
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            placeholder="Optional for approve · required for reject"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </label>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => void decide("approved")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            Approve & continue
          </button>
          <button
            disabled={busy}
            onClick={() => void decide("rejected")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      </div>
    </section>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        riskTone(risk),
      )}
    >
      {risk} risk
    </span>
  );
}

function formatExpiry(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}
