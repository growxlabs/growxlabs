"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";

const request = async (url: string, body?: Record<string, unknown>) => {
  const response = await fetch(
    url,
    body
      ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
      : { cache: "no-store" }
  );
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Request failed.");
  return json;
};

export function ProjectWorkspaceDetail({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [milestone, setMilestone] = useState("");
  const [task, setTask] = useState("");

  const milestones = useQuery({
    queryKey: ["admin", "milestones", projectId],
    queryFn: () => request(`/api/admin/delivery/milestones?projectId=${projectId}`),
  });

  const tasks = useQuery({
    queryKey: ["admin", "tasks", projectId],
    queryFn: () => request(`/api/admin/delivery/tasks?projectId=${projectId}`),
  });

  const addMilestone = useMutation({
    mutationFn: () => request("/api/admin/delivery/milestones", { projectId, name: milestone }),
    onSuccess: () => {
      setMilestone("");
      qc.invalidateQueries({ queryKey: ["admin", "milestones", projectId] });
    },
  });

  const addTask = useMutation({
    mutationFn: () => request("/api/admin/delivery/tasks", { projectId, title: task }),
    onSuccess: () => {
      setTask("");
      qc.invalidateQueries({ queryKey: ["admin", "tasks", projectId] });
    },
  });

  const submit = (event: FormEvent, kind: "milestone" | "task") => {
    event.preventDefault();
    if (kind === "milestone") {
      if (milestone.trim()) addMilestone.mutate();
    } else {
      if (task.trim()) addTask.mutate();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Milestones Section ── */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Milestones</h2>
          <span className="text-xs font-mono font-medium text-slate-500">
            {milestones.data?.milestones?.length || 0} active
          </span>
        </div>

        <form className="flex gap-2" onSubmit={(e) => submit(e, "milestone")}>
          <input
            className="min-h-11 flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#164d75] focus:ring-1 focus:ring-[#164d75]/20"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="e.g. Discovery & Project Initiation"
            disabled={addMilestone.isPending}
          />
          <button
            type="submit"
            disabled={addMilestone.isPending || !milestone.trim()}
            className="shrink-0 rounded-md bg-[#164d75] hover:bg-[#113a58] px-4 text-xs font-semibold text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>{addMilestone.isPending ? "Adding…" : "Add"}</span>
          </button>
        </form>

        {addMilestone.error && (
          <div role="alert" className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-md flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Unable to add milestone</p>
              <p className="mt-0.5 text-[11px] opacity-90">{addMilestone.error.message}</p>
            </div>
          </div>
        )}

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {(milestones.data?.milestones || []).map(
            (item: { id: string; milestone_number: string; name: string; status: string }) => (
              <div className="py-3 flex items-start justify-between gap-3" key={item.id}>
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-500">{item.milestone_number}</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.name}</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 capitalize">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
            )
          )}
          {!milestones.data?.milestones?.length && !milestones.isPending && (
            <p className="py-6 text-center text-xs text-slate-400">No milestones created yet.</p>
          )}
        </div>
      </section>

      {/* ── Tasks Section ── */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Tasks</h2>
          <span className="text-xs font-mono font-medium text-slate-500">
            {tasks.data?.tasks?.length || 0} tasks
          </span>
        </div>

        <form className="flex gap-2" onSubmit={(e) => submit(e, "task")}>
          <input
            className="min-h-11 flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#164d75] focus:ring-1 focus:ring-[#164d75]/20"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Website development with lead capture"
            disabled={addTask.isPending}
          />
          <button
            type="submit"
            disabled={addTask.isPending || !task.trim()}
            className="shrink-0 rounded-md bg-[#164d75] hover:bg-[#113a58] px-4 text-xs font-semibold text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>{addTask.isPending ? "Adding…" : "Add"}</span>
          </button>
        </form>

        {addTask.error && (
          <div role="alert" className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-md flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Unable to add task</p>
              <p className="mt-0.5 text-[11px] opacity-90">{addTask.error.message}</p>
            </div>
          </div>
        )}

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {(tasks.data?.tasks || []).map(
            (item: { id: string; task_number: string; title: string; status: string }) => (
              <div className="py-3 flex items-start justify-between gap-3" key={item.id}>
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-500">{item.task_number}</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.title}</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
            )
          )}
          {!tasks.data?.tasks?.length && !tasks.isPending && (
            <p className="py-6 text-center text-xs text-slate-400">No tasks created yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
