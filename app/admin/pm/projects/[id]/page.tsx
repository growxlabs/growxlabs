"use client";

import React, { useState, useEffect } from "react";
import { AgileKanban } from "@/components/admin/pm/AgileKanban";
import {
  IconArrowLeft,
  IconCalendar,
  IconFileText,
  IconCheckSquare,
  IconZap,
  IconBug,
  IconSpinner
} from "@/components/admin/pm/PMIcons";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"board" | "milestones" | "bugs" | "documents" | "activity">("board");

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pm/projects/${id}`);
      const resData = await res.json();
      setData(resData);
    } catch (e) {
      console.error("Failed to load project details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/pm/tasks?id=${taskId}&project_id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const detailsRes = await fetch(`/api/pm/projects/${id}`);
        const detailsData = await detailsRes.json();
        setData(detailsData);
      }
    } catch (e) {
      console.error("Failed to move task:", e);
    }
  };

  const handleTaskCreate = async (newTask: any) => {
    try {
      const res = await fetch(`/api/pm/tasks?project_id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          project_id: id
        })
      });
      if (res.ok) {
        const detailsRes = await fetch(`/api/pm/projects/${id}`);
        const detailsData = await detailsRes.json();
        setData(detailsData);
      }
    } catch (e) {
      console.error("Failed to create task:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2">
        <IconSpinner size={24} className="text-[#0075de]" />
        <span className="text-xs font-semibold text-neutral-400">Loading delivery project...</span>
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-sm font-bold text-neutral-700">Project delivery details not found.</p>
        <Link
          href="/admin/pm/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0075de] hover:underline uppercase tracking-wider"
        >
          <IconArrowLeft size={12} /> Back to Projects Registry
        </Link>
      </div>
    );
  }

  const { project, milestones, tasks, bugs, documents, activityLogs } = data;

  const NAV_ITEMS = [
    { id: "board", label: "Task Board", icon: IconCheckSquare, count: tasks?.length },
    { id: "milestones", label: "Milestones", icon: IconCalendar, count: milestones?.length },
    { id: "bugs", label: "Issues", icon: IconBug, count: bugs?.length },
    { id: "documents", label: "Documents", icon: IconFileText, count: documents?.length },
    { id: "activity", label: "Activity", icon: IconZap }
  ] as const;

  return (
    <div className="space-y-5">
      {/* Executive Header */}
      <div className="bg-white border border-[#e6e6e6] p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link
            href="/admin/pm/projects"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-[#0075de] transition-colors"
          >
            <IconArrowLeft size={12} /> Back to Projects
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight leading-tight">
            {project.name || project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">{project.company?.name || "Client Account"}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold tracking-tight inline-flex items-center gap-1.5 border",
                project.health === "ON_TRACK"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  project.health === "ON_TRACK" ? "bg-emerald-500" : "bg-red-500"
                )}
              />
              {project.health === "ON_TRACK" ? "On Track" : project.health?.replace("_", " ") || "Active"}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="font-mono text-neutral-600">
              Budget: ₹{Number(project.budget || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Executive Metrics */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#e6e6e6] pt-4 md:pt-0 md:pl-6">
          <div className="text-left">
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">
              Logged Time
            </span>
            <h4 className="text-base font-bold text-neutral-900 font-mono">
              {Number(project.actual_hours || 0).toFixed(1)} hrs
            </h4>
          </div>
          <div className="text-left min-w-28">
            <div className="flex items-center justify-between text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
              <span>Progress</span>
              <span className="font-mono font-bold text-neutral-800">{project.progress || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0075de] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* Inner Left Navigation Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 bg-white border border-[#e6e6e6] rounded-xl p-3 shadow-xs space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2.5 py-1 mb-1">
              Views
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left cursor-pointer",
                      isActive
                        ? "bg-[#0075de] text-white font-semibold shadow-xs"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={isActive ? "text-white" : "text-neutral-400"} />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.count === "number" && (
                      <span
                        className={cn(
                          "text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md min-w-5 text-center",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Summary Pill */}
          <div className="border-t border-[#e6e6e6] pt-3 px-1 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block px-1.5">
              Project Details
            </span>
            <div className="bg-neutral-50 border border-[#e6e6e6] rounded-lg p-2.5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Total Tasks</span>
                <span className="font-mono font-semibold text-neutral-800">{tasks?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Milestones</span>
                <span className="font-mono font-semibold text-neutral-800">{milestones?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Open Issues</span>
                <span className="font-mono font-semibold text-neutral-800">{bugs?.length || 0}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === "board" && (
            <AgileKanban
              initialTasks={tasks || []}
              onTaskMove={handleTaskMove}
              onTaskCreate={handleTaskCreate}
            />
          )}

          {activeTab === "milestones" && (
            <Card className="p-5 sm:p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3.5 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">Milestones</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Key delivery targets and completion status.</p>
                </div>
                <span className="text-xs font-medium font-mono text-neutral-500">
                  {milestones?.length || 0} Total
                </span>
              </div>
              <div className="space-y-2.5">
                {(milestones || []).map((m: any) => (
                  <div
                    key={m.id}
                    className="border border-[#e6e6e6] p-4 rounded-lg flex items-center justify-between hover:border-[#0075de]/40 hover:shadow-2xs transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-neutral-900 leading-snug">{m.title}</h4>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                        <IconCalendar size={11} className="text-neutral-400" />
                        Target: {m.due_date || "Not set"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#0075de] font-mono">
                        {m.completion_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "bugs" && (
            <Card className="p-5 sm:p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
              <div className="border-b border-[#e6e6e6] pb-3.5 mb-5">
                <h3 className="text-sm font-bold text-neutral-950">Issues</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Track reported defects and resolution progress.</p>
              </div>
              {!bugs || bugs.length === 0 ? (
                <div className="text-center py-16 text-xs text-neutral-400 font-medium border border-dashed border-[#e6e6e6] rounded-lg">
                  No open issues reported.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bugs.map((b: any) => (
                    <div
                      key={b.id}
                      className="border border-[#e6e6e6] p-4 rounded-lg flex items-center justify-between hover:border-neutral-300 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-900 leading-snug">{b.title}</h4>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Severity: <span className="font-medium text-neutral-700">{b.severity}</span> • Status: <span className="font-medium text-neutral-700">{b.status}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === "documents" && (
            <Card className="p-5 sm:p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
              <div className="border-b border-[#e6e6e6] pb-3.5 mb-5">
                <h3 className="text-sm font-bold text-neutral-950">Documents</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Project files, specifications, and reference assets.</p>
              </div>
              {!documents || documents.length === 0 ? (
                <div className="text-center py-16 text-xs text-neutral-400 font-medium border border-dashed border-[#e6e6e6] rounded-lg">
                  No documents uploaded.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3.5">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="border border-[#e6e6e6] p-3.5 rounded-lg flex items-center gap-3 hover:border-[#0075de]/40 hover:shadow-2xs transition-all cursor-pointer"
                    >
                      <div className="h-9 w-9 bg-neutral-50 rounded-md border border-[#e6e6e6] flex items-center justify-center text-neutral-500">
                        <IconFileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate leading-snug">{doc.title}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {doc.type || doc.category || "File"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === "activity" && (
            <Card className="p-5 sm:p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
              <div className="border-b border-[#e6e6e6] pb-3.5 mb-6">
                <h3 className="text-sm font-bold text-neutral-950">Activity</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Chronological record of project updates.</p>
              </div>
              <div className="space-y-3.5 relative pl-5 border-l border-[#e6e6e6] ml-3">
                {(activityLogs || []).map((log: any) => (
                  <div key={log.id} className="relative group text-xs">
                    <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border bg-white border-[#0075de] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0075de]" />
                    </div>
                    <div className="bg-neutral-50/50 border border-[#e6e6e6] p-3 rounded-lg">
                      <h4 className="font-semibold text-neutral-900">{log.title}</h4>
                      {log.description && <p className="text-neutral-500 mt-0.5 text-[11px]">{log.description}</p>}
                      <p className="text-[10px] font-mono text-neutral-400 mt-1.5">
                        {new Date(log.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
