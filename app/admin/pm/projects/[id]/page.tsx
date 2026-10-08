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

  const TABS = [
    { id: "board", label: "Taskboard", icon: IconCheckSquare, count: tasks?.length },
    { id: "milestones", label: "Milestones", icon: IconCalendar, count: milestones?.length },
    { id: "bugs", label: "Bug QA Tracker", icon: IconBug, count: bugs?.length },
    { id: "documents", label: "Documents", icon: IconFileText, count: documents?.length },
    { id: "activity", label: "Activity Logs", icon: IconZap }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-white border border-[#e6e6e6] p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link
            href="/admin/pm/projects"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0075de] hover:underline"
          >
            <IconArrowLeft size={11} /> Back to Registry
          </Link>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight leading-none">
            {project.name || project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span>{project.company?.name || "Global Client"}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span
              className={cn(
                "px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tight inline-flex items-center gap-1",
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
              {project.health?.replace("_", " ") || "ON TRACK"}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span className="text-neutral-400 font-mono">
              Budget: ₹{Number(project.budget || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Header KPI Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#e6e6e6] pt-4 md:pt-0 md:pl-6">
          <div className="text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
              Hours Logged
            </span>
            <h4 className="text-base font-black text-neutral-900 font-mono">
              {Number(project.actual_hours || 0).toFixed(1)} hrs
            </h4>
          </div>
          <div className="text-left min-w-24">
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
              Progress
            </span>
            <h4 className="text-base font-black text-neutral-900 font-mono">
              {project.progress || 0}%
            </h4>
          </div>
        </div>
      </div>

      {/* Modern Tabs Bar */}
      <div className="flex border-b border-[#e6e6e6] gap-6 pb-0.5 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider bg-transparent outline-none transition-colors border-b-2 cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-[#0075de] text-[#0075de]"
                  : "border-transparent text-neutral-400 hover:text-neutral-900"
              )}
            >
              <TabIcon size={13} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-blue-100 text-[#0075de]"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="min-h-[400px]">
        {activeTab === "board" && (
          <AgileKanban
            initialTasks={tasks || []}
            onTaskMove={handleTaskMove}
            onTaskCreate={handleTaskCreate}
          />
        )}

        {activeTab === "milestones" && (
          <Card className="p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3 mb-5">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-widest">
                  Milestone Progress Trajectory
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Delivery timeline targets and stage sign-offs.</p>
              </div>
              <span className="text-xs font-bold font-mono text-neutral-500">
                {milestones?.length || 0} Milestones
              </span>
            </div>
            <div className="space-y-3">
              {(milestones || []).map((m: any) => (
                <div
                  key={m.id}
                  className="border border-[#e6e6e6] p-4 rounded-lg flex items-center justify-between hover:border-[#0075de]/40 hover:shadow-2xs transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-900 leading-snug">{m.title}</h4>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <IconCalendar size={11} />
                      Target Date: {m.due_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0075de] font-mono">
                      {m.completion_percentage}% Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "bugs" && (
          <Card className="p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
            <div className="border-b border-[#e6e6e6] pb-3 mb-5">
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-widest">QA Bugs Registry</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Track verification defects and blocker issues.</p>
            </div>
            {!bugs || bugs.length === 0 ? (
              <div className="text-center py-16 text-xs text-neutral-400 font-semibold border border-dashed border-[#e6e6e6] rounded-lg">
                No active defect tickets logged.
              </div>
            ) : (
              <div className="space-y-3">
                {bugs.map((b: any) => (
                  <div
                    key={b.id}
                    className="border border-[#e6e6e6] p-4 rounded-lg flex items-center justify-between hover:border-red-200 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug">{b.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                        Severity: {b.severity} • Status: {b.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "documents" && (
          <Card className="p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
            <div className="border-b border-[#e6e6e6] pb-3 mb-5">
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-widest">
                Architecture & Scope Documents
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Specifications, blueprints, and SOW attachments.</p>
            </div>
            {!documents || documents.length === 0 ? (
              <div className="text-center py-16 text-xs text-neutral-400 font-semibold border border-dashed border-[#e6e6e6] rounded-lg">
                No uploaded delivery attachments found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="border border-[#e6e6e6] p-4 rounded-lg flex items-center gap-3.5 hover:border-[#0075de]/40 hover:shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="h-10 w-10 bg-neutral-50 rounded-md border border-[#e6e6e6] flex items-center justify-center text-neutral-400">
                      <IconFileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug">{doc.title}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 mt-1">
                        Category: {doc.type || doc.category || "Document"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="p-6 border border-[#e6e6e6] bg-white rounded-xl shadow-xs">
            <div className="border-b border-[#e6e6e6] pb-3 mb-6">
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-widest">
                Execution Audit Log
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Chronological pipeline delivery events.</p>
            </div>
            <div className="space-y-4 relative pl-6 border-l border-[#e6e6e6] ml-4">
              {(activityLogs || []).map((log: any) => (
                <div key={log.id} className="relative group text-xs font-medium">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border bg-white border-[#0075de] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0075de]" />
                  </div>
                  <div className="bg-white border border-[#e6e6e6] p-3.5 rounded-lg shadow-2xs">
                    <h4 className="font-bold text-neutral-900">{log.title}</h4>
                    {log.description && <p className="text-neutral-500 mt-1">{log.description}</p>}
                    <p className="text-[9px] font-mono text-neutral-400 mt-2">
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
      </div>
    </div>
  );
}
