"use client";

import { useEffect, useState } from "react";
import { UserCheck, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLeadAssignment({ leadId }: { leadId: string }) {
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/crm/leads/${leadId}/assignment`)
      .then((r) => r.json())
      .then((b) => {
        setEmployees(b.employees || []);
        if (b.currentEmployeeId) setValue(b.currentEmployeeId);
      })
      .catch(() => {});
  }, [leadId]);

  async function assign() {
    if (!value) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const r = await fetch(`/api/admin/crm/leads/${leadId}/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: value }),
      });
      const b = await r.json();
      if (r.ok) {
        setStatusMessage({ type: "success", text: "Owner saved" });
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage({ type: "error", text: b.error || "Assignment failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <UserCheck size={14} className="text-[var(--text-secondary)]" /> Lead Owner
        </h3>
        {statusMessage && (
          <span
            className={cn(
              "text-[11px] font-medium",
              statusMessage.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {statusMessage.text}
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 min-w-0 flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[#0075de] transition-colors"
        >
          <option value="">Unassigned</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button
          disabled={!value || saving}
          onClick={() => void assign()}
          className="h-8 rounded-md bg-[#0075de] hover:bg-[#005bab] px-3 text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save
        </button>
      </div>
    </div>
  );
}
