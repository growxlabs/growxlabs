"use client";

import { AlertTriangle, Bot, Check, CheckCircle2, Clipboard, FileText, Loader2, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CommandMessage } from "./command-center.types";

export function MessageThread({ messages, busy, onSuggestion }: { messages: CommandMessage[]; busy: boolean; onSuggestion: (text: string) => void }) {
  if (!messages.length) return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-5 py-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e9f4ff] text-[#0667b9]"><Bot size={23} /></div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">What should we move forward?</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Start naturally. The Command Center selects workspace-aware defaults when you do not name a project, agent, or model.</p>
      <div className="mt-7 grid gap-2 text-left sm:grid-cols-2">
        {["@agent:sales Summarise today’s lead pipeline", "@agent:research Compare our top three competitors", "Prepare a weekly operating brief", "@agent:cfo Review overdue invoices"].map((item) => (
          <button key={item} onClick={() => onSuggestion(item)} className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 shadow-sm hover:border-blue-300 hover:bg-blue-50/40">{item}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {messages.map((message) => <MessageItem key={message.id} message={message} streaming={busy && message === messages.at(-1)} />)}
    </div>
  );
}

function MessageItem({ message, streaming }: { message: CommandMessage; streaming: boolean }) {
  const [copied, setCopied] = useState(false);
  const user = message.sender === "user";

  return (
    <article className={cn("group mb-7 flex gap-3", user && "flex-row-reverse")} aria-label={`${user ? "Your" : "Agent"} message`}>
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg shadow-sm", user ? "bg-slate-900 text-white" : "bg-[#e9f4ff] text-[#0667b9]")}>
        {user ? <User size={15} /> : <Bot size={16} />}
      </div>
      <div className={cn("min-w-0 max-w-[min(760px,92%)]", user && "text-right")}>
        <div className={cn("mb-1.5 flex items-center gap-2 text-[11px]", user && "justify-end")}>
          <strong className="text-slate-700 font-bold">{user ? "You" : "GXL Orchestrator"}</strong>
          <time className="text-slate-400 font-medium">{formatTime(message.timestamp)}</time>
        </div>

        <div className={cn(
          "relative rounded-2xl px-5 py-4 text-left text-sm leading-6 shadow-sm border",
          user ? "rounded-tr-md bg-slate-900 text-white border-slate-800" :
          message.kind === "error" ? "rounded-tl-md border-red-200 bg-red-50 text-red-800" :
          "rounded-tl-md border-slate-200 bg-white text-slate-800",
        )}>
          {message.kind === "error" && <AlertTriangle size={15} className="mb-2 text-red-500" />}
          
          {/* Formatted Clean Content */}
          <div className="space-y-2.5">
            {renderMarkdown(message.text || (streaming ? "Working…" : ""))}
          </div>

          {streaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-blue-500 align-middle motion-reduce:animate-none" aria-label="Response streaming" />
          )}
        </div>

        {/* Real Agent Activity Widget */}
        <ToolCallActivityWidget toolCalls={message.toolCalls} />

        {!user && message.text && (
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(message.text);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-1 flex items-center gap-1 rounded px-2 py-1 text-[10px] text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 focus:opacity-100"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Clipboard size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </article>
  );
}

function getToolTitle(toolName: string, summary?: string): string {
  if (summary && summary !== toolName) return summary;
  switch (toolName) {
    case "get_company_stats": return "Reviewing company metrics";
    case "query_leads": return "Querying lead database";
    case "generate_proposal": return "Generating client proposal SOW";
    case "get_blog_posts_stats": return "Analyzing blog and newsletter telemetry";
    case "query_wish_game_data": return "Retrieving game telemetry statistics";
    case "search_web": return "Researching web & live market data";
    default: return toolName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Clean Markdown Renderer:
 * Parses headers (##, ###, ####), bold text, bullet lists (* and -), inline code/tool calls, and HTML tables without raw asterisks or slashes.
 */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Markdown Table block
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      return;
    }

    if (inTable && !trimmed.startsWith("|")) {
      elements.push(renderTableBlock(tableBuffer, `table_${index}`));
      tableBuffer = [];
      inTable = false;
    }

    // Headers
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={index} className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-700">
          {formatInlineMarkdown(trimmed.replace("#### ", ""))}
        </h4>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="mt-3 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1">
          {formatInlineMarkdown(trimmed.replace("### ", ""))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="mt-4 text-base font-extrabold text-slate-900 border-b border-slate-200 pb-1.5">
          {formatInlineMarkdown(trimmed.replace("## ", ""))}
        </h2>
      );
    } 
    // Bullets starting with * or -
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\*\s+/.test(trimmed)) {
      const cleanText = trimmed.replace(/^[\*\-]\s+/, "");
      elements.push(
        <li key={index} className="ml-4 list-disc text-slate-700 font-medium my-0.5">
          {formatInlineMarkdown(cleanText)}
        </li>
      );
    } 
    // Regular paragraphs
    else if (trimmed) {
      elements.push(
        <p key={index} className="leading-relaxed">
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  if (inTable && tableBuffer.length > 0) {
    elements.push(renderTableBlock(tableBuffer, "table_end"));
  }

  return elements;
}

function renderTableBlock(rows: string[], key: string) {
  if (rows.length < 2) return null;

  const contentRows = rows.filter(row => !/^\|[\s\-:|]+\|$/.test(row));
  const headerRow = contentRows[0];
  const bodyRows = contentRows.slice(1);

  const parseCells = (rowStr: string) =>
    rowStr.split("|").slice(1, -1).map(cell => cell.trim());

  const headers = parseCells(headerRow);

  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5 font-bold border-r border-slate-200 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bodyRows.map((row, rIdx) => {
            const cells = parseCells(row);
            return (
              <tr key={rIdx} className="hover:bg-slate-50/60 transition">
                {cells.map((c, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2.5 text-slate-700 font-medium border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                    {formatInlineMarkdown(c)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatInlineMarkdown(text: string): React.ReactNode {
  let processed = text.replace(/^\/\/\s*/, "");

  // Match bold **text**, code `code`, or quoted tool names ('tool_name')
  const regex = /(\*\*.*?\*\*|`.*?`|\('[a-zA-Z0-9_]+'\))/g;
  const parts = processed.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <b key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</b>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-blue-700 border border-blue-100">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("('") && part.endsWith("')")) {
      return (
        <code key={idx} className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 border border-slate-200">
          {part.slice(2, -2)}
        </code>
      );
    }
    return part;
  });
}

function ToolCallActivityWidget({ toolCalls }: { toolCalls?: CommandMessage["toolCalls"] }) {
  const [open, setOpen] = useState(false);
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-medium text-[#475569] hover:bg-[#f1f5f9]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#0877d1]">⚙</span>
          <span>Real Agent Activity ({toolCalls.length})</span>
        </div>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-[#e2e8f0] p-3 space-y-3">
          {toolCalls.map((tc, idx) => {
            const formatArgs = () => {
              if (!tc.args || Object.keys(tc.args).length === 0) return null;
              return (
                <pre className="mt-1 overflow-x-auto rounded bg-[#0f172a] p-2 text-[11px] text-[#f8fafc]">
                  {JSON.stringify(tc.args, null, 2)}
                </pre>
              );
            };

            const formatResult = () => {
              if (!tc.result) return null;
              return (
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-[#0f172a] p-2 text-[11px] text-[#38bdf8]">
                  {typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result, null, 2)}
                </pre>
              );
            };

            return (
              <div key={tc.id || idx} className="rounded border border-[#e2e8f0] bg-white p-2.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-[#0f172a]">
                    ✓ {tc.name}
                  </span>
                  <span className="text-[#64748b]">
                    {tc.status === "calling" ? "Running..." : "Finished"}
                  </span>
                </div>
                {formatArgs()}
                {formatResult()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

