'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Loader2, Clock, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import type { TimelineStep, TimelineStepStatus, ToolActivity } from './command-center.types';
import './transitions.css';

interface ExecutionTimelineProps {
  toolCalls: ToolActivity[];
  collapsed?: boolean;
}

function safeToolLabel(name: string): string {
  const labels: Record<string, string> = {
    query_leads: "Querying lead database",
    search_web: "Searching web sources",
    generate_proposal: "Generating proposal",
    get_company_stats: "Reviewing company metrics",
    get_admin_invoices: "Reviewing invoices",
    get_blog_posts_stats: "Querying content database",
    get_admin_agreements: "Reviewing agreements",
    get_admin_projects: "Reviewing projects",
    spawn_subagent: "Delegating research",
    send_blog_to_subscribers: "Dispatching newsletter",
    get_admin_users: "Reviewing admin users",
    create_lead: "Creating lead record",
    batch_create_leads: "Creating lead batch",
    create_admin_invoice: "Creating invoice",
    create_admin_project: "Creating project",
    send_admin_invoice: "Sending invoice",
    query_wish_game_data: "Retrieving game telemetry",
  };
  return labels[name] ?? `Executing ${name.replace(/_/g, " ")}`;
}

/** Map ToolActivity.status to TimelineStepStatus */
function mapToolStatus(status: ToolActivity["status"]): TimelineStepStatus {
  if (status === "calling") return "running";
  if (status === "complete") return "complete";
  if (status === "error") return "failed";
  return "pending";
}

export function ExecutionTimeline({ toolCalls, collapsed: initialCollapsed = false }: ExecutionTimelineProps) {
  const [collapsed, setCollapsed] = React.useState(initialCollapsed);

  const steps: TimelineStep[] = React.useMemo(() => {
    const areAllComplete = toolCalls.every((tc) => tc.status === 'complete');

    const result: TimelineStep[] = [];

    // Planning step
    result.push({
      id: 'step-planning',
      label: 'Planning',
      status: toolCalls.length > 0 ? 'complete' : 'running',
    });

    // Tool steps
    toolCalls.forEach((tc) => {
      result.push({
        id: tc.id,
        label: safeToolLabel(tc.name),
        status: mapToolStatus(tc.status),
        toolName: tc.name,
      });
    });

    // Summarizing step
    if (toolCalls.length > 0) {
      const hasFailed = toolCalls.some((tc) => tc.status === 'error');
      const hasCalling = toolCalls.some((tc) => tc.status === 'calling');
      result.push({
        id: 'step-summarizing',
        label: 'Summarizing',
        status: areAllComplete ? 'complete' : (hasCalling ? 'pending' : (hasFailed ? 'failed' : 'pending')),
      });
    }

    return result;
  }, [toolCalls]);

  const completedCount = steps.filter((s) => s.status === 'complete').length;

  if (collapsed) {
    return (
      <div
        className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs cursor-pointer hover:bg-slate-100/80 transition-colors"
        onClick={() => setCollapsed(false)}
      >
        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={13} />
          <span className="font-semibold">{completedCount} of {steps.length} steps completed</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative mt-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
      <button
        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors hover:bg-slate-100"
        onClick={() => setCollapsed(true)}
        aria-label="Collapse timeline"
      >
        <ChevronUp size={14} />
      </button>

      <div className="space-y-0.5 py-0.5 pl-1">
        {steps.map((step, index) => (
          <div key={step.id} className="cc-timeline-step relative flex items-start" style={{ minHeight: 36 }}>
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute top-5 left-[7px] w-px bg-slate-200" style={{ height: 'calc(100% - 4px)' }} />
            )}

            <div className="relative z-10 flex h-4 w-4 items-center justify-center shrink-0 mt-1 bg-white">
              {step.status === 'complete' && <Check size={14} className="text-emerald-500" />}
              {step.status === 'running' && <Loader2 size={14} className="text-blue-500 animate-spin" />}
              {step.status === 'failed' && <X size={14} className="text-red-500" />}
              {step.status === 'pending' && <Circle size={11} className="text-slate-300" />}
              {step.status === 'waiting' && <Clock size={11} className="text-amber-400" />}
            </div>

            <div className="ml-2.5 flex flex-1 items-center justify-between pr-6 py-1.5">
              <span className={cn(
                "font-semibold",
                step.status === 'pending' || step.status === 'waiting' ? "text-slate-400" :
                step.status === 'failed' ? "text-red-700" : "text-slate-800"
              )}>
                {step.label}
              </span>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                {step.durationMs != null && step.durationMs > 0 && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">{(step.durationMs / 1000).toFixed(1)}s</span>
                )}
                {step.startedAt && (
                  <span>{new Date(step.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
