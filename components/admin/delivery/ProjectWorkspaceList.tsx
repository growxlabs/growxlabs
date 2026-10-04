"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";

type Workspace = {
  id: string;
  project_id: string;
  status: string;
  health: string;
  summary: Record<string, unknown>;
  created_at: string;
  consulting_projects: { project_number: string } | null;
};

type AvailableProject = {
  id: string;
  projectNumber: string;
  companyName: string;
};

type WorkspaceResponse = {
  workspaces: Workspace[];
  availableProjects?: AvailableProject[];
};

const fetchWorkspaces = async () => {
  const response = await fetch("/api/admin/delivery/workspaces", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Unable to load project workspaces.");
  return body as WorkspaceResponse;
};

export function ProjectWorkspaceList() {
  const qc = useQueryClient();
  const [projectId, setProjectId] = useState("");

  const query = useQuery({
    queryKey: ["admin", "project-workspaces"],
    queryFn: fetchWorkspaces,
  });

  const activate = useMutation({
    mutationFn: async (targetId?: string) => {
      const idToActivate = targetId || projectId;
      const response = await fetch("/api/admin/delivery/workspaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: idToActivate }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Workspace activation failed.");
      return body;
    },
    onSuccess: () => {
      setProjectId("");
      qc.invalidateQueries({ queryKey: ["admin", "project-workspaces"] });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (projectId.trim()) activate.mutate();
  };

  const availableProjects = query.data?.availableProjects || [];

  return (
    <div className="space-y-6">
      {/* Quick-Activate Banner for unactivated projects */}
      {availableProjects.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
            <Sparkles size={14} className="text-[#0075de]" />
            <span>Ready for Workspace Activation ({availableProjects.length})</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableProjects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {p.companyName}
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-[#0075de] mt-0.5">
                    {p.projectNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => activate.mutate(p.id)}
                  disabled={activate.isPending}
                  className="shrink-0 px-3 py-1.5 rounded-md bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{activate.isPending ? "Activating…" : "1-Click Activate"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Input Form */}
      <form
        className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:flex-row"
        onSubmit={submit}
      >
        <label className="grid flex-1 gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Activated consulting project ID or Official Number
          </span>
          <input
            className="min-h-11 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            placeholder="Paste GXL-PRJ-2026-000001 or project UUID"
          />
        </label>
        <button
          className="min-h-11 self-end rounded-md bg-[#164d75] hover:bg-[#113a58] px-5 font-semibold text-white text-xs disabled:opacity-50 transition-colors cursor-pointer"
          disabled={activate.isPending || !projectId.trim()}
        >
          {activate.isPending ? "Activating…" : "Activate workspace"}
        </button>
        {activate.error && (
          <p role="alert" className="self-center text-sm text-red-700">
            {activate.error.message}
          </p>
        )}
      </form>

      {/* Workspaces Grid */}
      {query.isPending ? (
        <p className="text-xs text-slate-500">Loading projects…</p>
      ) : query.error ? (
        <p role="alert" className="text-red-700 text-xs">
          {query.error.message}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.workspaces.map((workspace) => (
            <a
              key={workspace.id}
              href={`/admin/projects/${workspace.id}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-[#164d75]"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                {workspace.consulting_projects?.project_number || "Project workspace"}
              </p>
              <h2 className="mt-3 text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                {workspace.status.replaceAll("_", " ")}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Health: {workspace.health.replaceAll("_", " ")}
              </p>
            </a>
          ))}
          {!query.data?.workspaces.length && (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-slate-500 text-xs">
              No activated project workspaces.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
