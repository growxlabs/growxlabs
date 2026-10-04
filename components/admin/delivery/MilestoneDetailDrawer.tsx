"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconClose,
  IconLayers,
  IconSpinner,
  IconUser,
} from "@/components/admin/GrowXIcons";

type Assignee = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type MilestoneDetail = {
  id: string;
  milestone_number: string;
  project_id: string;
  name: string;
  objective: string | null;
  description: string | null;
  status: string;
  planned_start: string | null;
  planned_completion: string | null;
  actual_start: string | null;
  actual_completion: string | null;
  owner_id: string | null;
  progress: number;
  tasks_count: number;
  created_at: string;
  owner: Assignee | null;
};

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  { value: "blocked", label: "Blocked", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900" },
  { value: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  { value: "not_started", label: "Not Started", color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700" },
];

export function MilestoneDetailDrawer({
  milestoneId,
  projectId,
  onClose,
  onSaved,
}: {
  milestoneId: string | null;
  projectId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const qc = useQueryClient();

  const query = useQuery<{ milestone: MilestoneDetail; assignees: Assignee[] }>({
    queryKey: ["admin", "milestone", milestoneId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/delivery/milestones/${milestoneId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load milestone.");
      return data;
    },
    enabled: Boolean(milestoneId),
  });

  const milestone = query.data?.milestone;
  const assignees = query.data?.assignees || [];

  const [status, setStatus] = useState<string>("planned");
  const [ownerId, setOwnerId] = useState<string>("");
  const [plannedStart, setPlannedStart] = useState<string>("");
  const [plannedCompletion, setPlannedCompletion] = useState<string>("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (milestone) {
      setStatus(milestone.status || "planned");
      setOwnerId(milestone.owner_id || "");
      setPlannedStart(milestone.planned_start ? milestone.planned_start.slice(0, 10) : "");
      setPlannedCompletion(
        milestone.planned_completion ? milestone.planned_completion.slice(0, 10) : ""
      );
      setDateError(null);
      setSaveSuccess(false);
    }
  }, [milestone]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      // Validate dates
      if (plannedStart && plannedCompletion) {
        if (new Date(plannedCompletion).getTime() < new Date(plannedStart).getTime()) {
          throw new Error("Due date must be on or after start date.");
        }
      }

      const res = await fetch(`/api/admin/delivery/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          ownerId: ownerId || null,
          plannedStart: plannedStart || null,
          plannedCompletion: plannedCompletion || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update milestone.");
      return json;
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setDateError(null);
      qc.invalidateQueries({ queryKey: ["admin", "milestones", projectId] });
      qc.invalidateQueries({ queryKey: ["admin", "milestone", milestoneId] });
      if (onSaved) onSaved();
      setTimeout(() => setSaveSuccess(false), 3500);
    },
    onError: (err: Error) => {
      setDateError(err.message);
    },
  });

  const handleStartDateChange = (val: string) => {
    setPlannedStart(val);
    if (val && plannedCompletion && new Date(plannedCompletion).getTime() < new Date(val).getTime()) {
      setDateError("Due date must be on or after start date.");
    } else {
      setDateError(null);
    }
  };

  const handleDueDateChange = (val: string) => {
    setPlannedCompletion(val);
    if (plannedStart && val && new Date(val).getTime() < new Date(plannedStart).getTime()) {
      setDateError("Due date must be on or after start date.");
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (plannedStart && plannedCompletion && new Date(plannedCompletion).getTime() < new Date(plannedStart).getTime()) {
      setDateError("Due date must be on or after start date.");
      return;
    }
    setDateError(null);
    updateMutation.mutate();
  };

  if (!milestoneId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#164d75] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded">
              {milestone?.milestone_number || "MILESTONE"}
            </span>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              <IconClose size={18} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {milestone?.name || "Milestone Details"}
          </h2>
          <p className="text-xs text-slate-500">
            Milestone Execution View · Update status, owner assignment, and scheduled timelines.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6">
          {query.isPending && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <IconSpinner size={24} className="animate-spin text-[#164d75]" />
              <p className="text-xs">Loading milestone details…</p>
            </div>
          )}

          {query.error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to load milestone</p>
                <p className="mt-0.5 opacity-90">{query.error.message}</p>
              </div>
            </div>
          )}

          {milestone && (
            <form id="milestone-execution-form" onSubmit={handleSubmit} className="space-y-5">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <IconCheckCircle size={16} className="shrink-0 text-emerald-600" />
                  <span>Milestone updated successfully!</span>
                </div>
              )}

              {dateError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                  <IconAlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{dateError}</span>
                </div>
              )}

              {/* Status Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Execution Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#164d75] focus:ring-1 focus:ring-[#164d75]/20 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Expected execution progression: Planned → In Progress → Completed
                </p>
              </div>

              {/* Owner Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <IconUser size={13} />
                  <span>Assigned Owner</span>
                </label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#164d75] focus:ring-1 focus:ring-[#164d75]/20 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Only verified internal team members and admins can be assigned.
                </p>
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <IconCalendar size={13} />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    value={plannedStart}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#164d75]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <IconCalendar size={13} />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    value={plannedCompletion}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#164d75]"
                  />
                </div>
              </div>

              {/* Traceability Metadata */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IconLayers size={14} className="text-[#164d75]" />
                  <span>Scope & Traceability</span>
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase font-semibold">Linked Tasks</dt>
                    <dd className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {milestone.tasks_count} {milestone.tasks_count === 1 ? "task" : "tasks"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase font-semibold">Completion</dt>
                    <dd className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {milestone.progress}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase font-semibold">Created Date</dt>
                    <dd className="mt-0.5 text-slate-700 dark:text-slate-300">
                      {new Date(milestone.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-500 uppercase font-semibold">Current State</dt>
                    <dd className="mt-0.5 capitalize text-slate-700 dark:text-slate-300">
                      {milestone.status.replaceAll("_", " ")}
                    </dd>
                  </div>
                </dl>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="milestone-execution-form"
            disabled={updateMutation.isPending || Boolean(dateError)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#164d75] hover:bg-[#113a58] rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {updateMutation.isPending && <IconSpinner size={13} className="animate-spin" />}
            <span>{updateMutation.isPending ? "Saving changes…" : "Save Changes"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
