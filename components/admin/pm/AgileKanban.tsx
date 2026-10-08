"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  IconPlus,
  IconCalendar,
  IconUser,
  IconSearch,
  IconClose,
  IconFilter,
  IconPriority,
  IconIssueType,
  IconSubtasks
} from "./PMIcons";

export interface Task {
  id: string;
  key?: string;
  title: string;
  description?: string;
  story_points: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "BLOCKED" | "DONE";
  assignee?: { name: string; email?: string; avatar?: string };
  due_date?: string;
  type?: "task" | "story" | "bug" | "spike";
  milestone?: string;
  subtasks_completed?: number;
  subtasks_total?: number;
}

interface AgileKanbanProps {
  initialTasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  onTaskCreate?: (newTask: Partial<Task>) => Promise<void>;
}

const COLUMNS: {
  id: Task["status"];
  label: string;
  headerBg: string;
  headerBorder: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
}[] = [
  {
    id: "BACKLOG",
    label: "Backlog",
    headerBg: "bg-[#f1f5f9]",
    headerBorder: "border-[#e2e8f0]",
    textColor: "text-slate-800",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-700",
    dot: "bg-slate-400"
  },
  {
    id: "TODO",
    label: "To Do",
    headerBg: "bg-[#f1f5f9]",
    headerBorder: "border-[#e2e8f0]",
    textColor: "text-slate-800",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-700",
    dot: "bg-slate-500"
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    headerBg: "bg-[#e0f2fe]",
    headerBorder: "border-[#bae6fd]",
    textColor: "text-[#0369a1]",
    badgeBg: "bg-[#bae6fd]",
    badgeText: "text-[#0284c7]",
    dot: "bg-[#0284c7]"
  },
  {
    id: "REVIEW",
    label: "Review",
    headerBg: "bg-[#fef3c7]",
    headerBorder: "border-[#fde68a]",
    textColor: "text-[#92400e]",
    badgeBg: "bg-[#fde68a]",
    badgeText: "text-[#b45309]",
    dot: "bg-[#f59e0b]"
  },
  {
    id: "TESTING",
    label: "Testing",
    headerBg: "bg-[#f3e8ff]",
    headerBorder: "border-[#e9d5ff]",
    textColor: "text-[#6b21a8]",
    badgeBg: "bg-[#e9d5ff]",
    badgeText: "text-[#7e22ce]",
    dot: "bg-[#a855f7]"
  },
  {
    id: "BLOCKED",
    label: "Blocked",
    headerBg: "bg-[#fee2e2]",
    headerBorder: "border-[#fecaca]",
    textColor: "text-[#991b1b]",
    badgeBg: "bg-[#fecaca]",
    badgeText: "text-[#b91c1c]",
    dot: "bg-[#ef4444]"
  },
  {
    id: "DONE",
    label: "Done",
    headerBg: "bg-[#dcfce7]",
    headerBorder: "border-[#bbf7d0]",
    textColor: "text-[#15803d]",
    badgeBg: "bg-[#bbf7d0]",
    badgeText: "text-[#16a34a]",
    dot: "bg-[#22c55e]"
  }
];

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function AgileKanban({ initialTasks, onTaskMove, onTaskCreate }: AgileKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Task["status"] | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Inline Quick-Add state
  const [addingCol, setAddingCol] = useState<Task["status"] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("MEDIUM");
  const [newPoints, setNewPoints] = useState<number>(2);

  // Synchronize when initialTasks change
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: Task["status"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (colId: Task["status"]) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)));
      try {
        await onTaskMove(taskId, targetStatus);
      } catch (err) {
        console.error("Failed to update status:", err);
        setTasks(initialTasks);
      }
    }
    setDraggedId(null);
  };

  const handleQuickAdd = async (status: Task["status"]) => {
    if (!newTitle.trim()) return;

    const key = `TRX-${String(tasks.length + 1).padStart(2, "0")}`;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      key,
      title: newTitle.trim(),
      status,
      priority: newPriority,
      story_points: newPoints,
      type: "task",
      milestone: "Sprint Execution"
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle("");
    setAddingCol(null);

    if (onTaskCreate) {
      try {
        await onTaskCreate(newTask);
      } catch (e) {
        console.error("Failed to save new task:", e);
      }
    }
  };

  // Filtered task set
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.key && t.key.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.milestone && t.milestone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Overall Board Stats
  const totalPoints = useMemo(() => tasks.reduce((sum, t) => sum + (t.story_points || 0), 0), [tasks]);
  const completedPoints = useMemo(
    () => tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.story_points || 0), 0),
    [tasks]
  );

  return (
    <div className="space-y-4">
      {/* Enterprise Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#dce0e6] p-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1">
          {/* Real-time search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <IconSearch size={13} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by key, title, milestone..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#0075de] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <IconClose size={11} />
              </button>
            )}
          </div>

          {/* Priority filter pills */}
          <div className="hidden md:flex items-center gap-1 border-l border-neutral-200 pl-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1 flex items-center gap-1">
              <IconFilter size={10} /> Priority:
            </span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => {
              const isSelected = priorityFilter === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={cn(
                    "h-6 px-2 text-[10px] font-bold rounded uppercase transition-colors tracking-tight",
                    isSelected
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Velocity Pill */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500 self-end sm:self-auto">
          <span className="inline-flex items-center gap-1">
            <span className="font-bold text-neutral-900">{tasks.length}</span> cards
          </span>
          <span className="text-neutral-300">•</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-bold text-neutral-900">{totalPoints}</span> SP Total
          </span>
          {totalPoints > 0 && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                {Math.round((completedPoints / totalPoints) * 100)}% Done
              </span>
            </>
          )}
        </div>
      </div>

      {/* Kanban Columns Canvas */}
      <div className="flex gap-4 overflow-x-auto pb-4 select-none min-h-[580px] scrollbar-thin">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const colPoints = colTasks.reduce((acc, curr) => acc + (curr.story_points || 0), 0);
          const isDragOver = dragOverCol === col.id;
          const isAdding = addingCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                "flex-shrink-0 w-[295px] flex flex-col bg-[#f8fafc] border border-[#dce0e6] rounded-xl overflow-hidden shadow-2xs transition-all duration-150",
                isDragOver && "border-[#0075de] ring-2 ring-[#0075de]/30"
              )}
            >
              {/* Zoho-Style Column Header Banner */}
              <div className={cn("px-3.5 py-2.5 border-b transition-colors", col.headerBg, col.headerBorder)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", col.dot)} />
                    <h3 className={cn("text-xs font-bold tracking-tight", col.textColor)}>
                      {col.label}
                    </h3>
                    <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center", col.badgeBg, col.badgeText)}>
                      {colTasks.length}
                    </span>
                    {colPoints > 0 && (
                      <span className={cn("text-[10px] font-semibold opacity-75 font-mono", col.textColor)}>
                        • {colPoints} SP
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingCol(isAdding ? null : col.id);
                      setNewTitle("");
                    }}
                    className={cn(
                      "w-5 h-5 rounded hover:bg-black/5 flex items-center justify-center transition-colors",
                      col.textColor
                    )}
                    title={`Add task to ${col.label}`}
                  >
                    <IconPlus size={12} />
                  </button>
                </div>

                <div className={cn("text-[10px] font-medium opacity-80 mt-0.5", col.textColor)}>
                  {colTasks.length} {colTasks.length === 1 ? "task" : "tasks"} active
                </div>
              </div>

              {/* Inline Quick Add Form */}
              {isAdding && (
                <div className="m-2.5 bg-white border-2 border-[#0075de] rounded-lg p-2.5 shadow-md space-y-2">
                  <textarea
                    autoFocus
                    rows={2}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleQuickAdd(col.id);
                      } else if (e.key === "Escape") {
                        setAddingCol(null);
                      }
                    }}
                    placeholder="Task title or description..."
                    className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 resize-none outline-none focus:ring-0 leading-snug"
                  />
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-1">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
                        className="text-[9px] font-bold bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-700 outline-none"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        max={13}
                        value={newPoints}
                        onChange={(e) => setNewPoints(Number(e.target.value))}
                        className="w-10 text-[9px] font-mono font-bold bg-neutral-50 border border-neutral-200 rounded px-1 py-0.5 text-neutral-700 outline-none text-center"
                        title="Story Points"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAddingCol(null)}
                        className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-700 px-2 py-0.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleQuickAdd(col.id)}
                        className="text-[10px] font-bold bg-[#0075de] hover:bg-[#0075de]/90 text-white px-2.5 py-0.5 rounded transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto no-scrollbar min-h-[480px]">
                {colTasks.length === 0 ? (
                  /* Zoho CRM Clean Empty State */
                  <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xs font-medium text-neutral-400 mb-2">
                      No tasks found.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCol(col.id);
                        setNewTitle("");
                      }}
                      className="text-[11px] font-semibold text-[#0075de] hover:underline flex items-center gap-1"
                    >
                      <IconPlus size={11} /> Add task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task, idx) => {
                    const isDragged = draggedId === task.id;
                    const issueKey = task.key || `TRX-${String(idx + 1).padStart(2, "0")}`;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={cn(
                          "group relative bg-white border border-[#d6dadf] p-3.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150",
                          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#0075de]/60 hover:-translate-y-0.5",
                          isDragged && "opacity-40 scale-95 border-dashed border-[#0075de]"
                        )}
                      >
                        {/* Row 1: Key + Priority */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <IconIssueType type={task.type || "task"} size={12} />
                            <span className="font-mono text-[11px] font-bold text-[#0075de] hover:underline cursor-pointer">
                              {issueKey}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded tracking-tight uppercase border",
                                task.priority === "CRITICAL" && "bg-red-50 text-red-700 border-red-200",
                                task.priority === "HIGH" && "bg-amber-50 text-amber-700 border-amber-200",
                                task.priority === "MEDIUM" && "bg-blue-50 text-blue-700 border-blue-200",
                                task.priority === "LOW" && "bg-neutral-50 text-neutral-600 border-neutral-200"
                              )}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Title */}
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug tracking-tight mb-2 group-hover:text-[#0075de] transition-colors">
                          {task.title}
                        </h4>

                        {/* Row 3: Milestone Association */}
                        {task.milestone && (
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mb-2">
                            <span className="text-neutral-400 font-medium">Milestone:</span>
                            <span className="font-semibold text-neutral-700 truncate max-w-[190px]">
                              {task.milestone}
                            </span>
                          </div>
                        )}

                        {/* Row 4: Assignee with Name (Zoho-style) */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <div
                            className="w-5 h-5 rounded-full bg-blue-100 text-[#0075de] text-[9px] font-black flex items-center justify-center uppercase border border-blue-200 shrink-0"
                            title={task.assignee?.name || "Assignee"}
                          >
                            {getInitials(task.assignee?.name || "Alex Morgan")}
                          </div>
                          <span className="text-[11px] font-medium text-neutral-700 truncate">
                            {task.assignee?.name || "Alex Morgan (Lead)"}
                          </span>
                        </div>

                        {/* Row 5: Footer Divider & Metrics */}
                        <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                            <IconCalendar size={11} className="text-neutral-400" />
                            <span>{formatDate(task.due_date) || "Oct 18, 2026"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.subtasks_total ? (
                              <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                                <IconSubtasks size={10} />
                                {task.subtasks_completed || 0}/{task.subtasks_total}
                              </span>
                            ) : null}
                            <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                              {task.story_points || 0} SP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add footer button if tasks exist */}
              {colTasks.length > 0 && !isAdding && (
                <button
                  type="button"
                  onClick={() => {
                    setAddingCol(col.id);
                    setNewTitle("");
                  }}
                  className="w-full py-2 text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 border-t border-neutral-200/60 flex items-center justify-center gap-1 transition-colors"
                >
                  <IconPlus size={10} /> Add task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
