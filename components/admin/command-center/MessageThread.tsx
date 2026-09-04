"use client";

import { 
  Check, 
  Copy, 
  ChevronDown, 
  Terminal, 
  Sparkles, 
  RotateCcw,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CommandMessage, ToolActivity } from "./command-center.types";
import { StructuredResponseFormatter } from "./StructuredResponseFormatter";

interface Props {
  messages: CommandMessage[];
  busy: boolean;
  onSuggestion: (text: string) => void;
  onRetry?: () => void;
}

export function MessageThread({ messages, busy, onSuggestion, onRetry }: Props) {
  // Empty State: GrowX Labs Command Center Design (Matches Image 1 with dark cards)
  if (!messages.length) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-4 py-12 text-center select-none">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-md">
          <Sparkles size={24} />
        </div>
        
        <h2 className="text-2xl font-serif font-bold tracking-tight text-[#f4f4f5]">
          What should we move forward?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400 font-sans">
          The GXL Orchestrator coordinates your specialized agents and software tools across your business operations.
        </p>

        {/* 4 Dark Quick Action Cards (Never white, immune to light theme) */}
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {[
            { tag: "SALES", text: "Summarize today's lead pipeline and qualified opportunities" },
            { tag: "RESEARCH", text: "Compare top frontier model benchmarks for desktop computer use" },
            { tag: "FINANCE", text: "Audit overdue client invoices and balance receivable" },
            { tag: "OPERATIONS", text: "Prepare an executive briefing on ongoing software deliverables" },
          ].map((item) => (
            <button
              key={item.tag}
              onClick={() => onSuggestion(item.text)}
              className="group rounded-xl border border-white/10 bg-[#1e1e22] hover:bg-[#26262b] hover:border-white/20 p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-2.5 text-left"
            >
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
                {item.tag}
              </span>
              <span className="text-xs font-medium text-zinc-300 group-hover:text-white leading-relaxed">
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      {messages.map((message, idx) => (
        <MessageItem
          key={message.id || idx}
          message={message}
          streaming={busy && message === messages[messages.length - 1]}
          onSuggestion={busy ? undefined : onSuggestion}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

function MessageItem({ 
  message, 
  streaming, 
  onSuggestion,
  onRetry 
}: { 
  message: CommandMessage; 
  streaming: boolean; 
  onSuggestion?: (text: string) => void;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const user = message.sender === "user";

  if (user) {
    return (
      <div className="flex justify-end w-full">
        <div className="rounded-2xl bg-[#27272a] border border-white/10 px-4 py-2.5 text-[14.5px] text-[#f4f4f5] max-w-[80%] leading-relaxed select-text shadow-xs">
          {message.text}
        </div>
      </div>
    );
  }

  // Assistant response
  return (
    <div className="flex flex-col items-start w-full space-y-3 select-text">
      
      {/* Real Tool Calling Activity Widget */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <AgentToolCallingTimeline toolCalls={message.toolCalls} />
      )}

      {/* Main Streamed Response Text (Structured & Clean without raw symbols) */}
      {message.text && (
        <div className="w-full">
          <StructuredResponseFormatter 
            content={message.text} 
            onSuggestion={onSuggestion}
          />
        </div>
      )}

      {/* Streaming spinner while generating */}
      {streaming && !message.text && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
          <Loader2 size={14} className="animate-spin text-blue-400" />
          <span>Orchestrator is processing your request...</span>
        </div>
      )}

      {/* Error state alert if real error occurred */}
      {message.kind === "error" && (
        <div className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <span>{message.text || "Execution could not be completed safely."}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Copy Response Action */}
      {message.text && !streaming && (
        <div className="pt-1 flex items-center gap-2 text-zinc-500">
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 text-[11px] hover:text-zinc-300 transition-colors cursor-pointer"
            title="Copy response"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}

    </div>
  );
}

/**
 * Senior Collapsible Tool Calling Activity Widget
 */
function AgentToolCallingTimeline({ toolCalls }: { toolCalls: ToolActivity[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#1e1e22] p-3 text-xs text-[#f4f4f5] shadow-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left cursor-pointer hover:opacity-90"
      >
        <div className="flex items-center gap-2 font-medium">
          <Terminal size={14} className="text-blue-400" />
          <span>Executed {toolCalls.length} tool {toolCalls.length === 1 ? "action" : "actions"}</span>
        </div>
        <ChevronDown size={14} className={cn("text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-2.5 space-y-2 pt-2 border-t border-white/10">
          {toolCalls.map((t) => (
            <div key={t.id} className="rounded-lg bg-[#141416] p-2.5 font-mono text-[11px] border border-white/5">
              <div className="flex items-center justify-between text-zinc-200 font-semibold mb-1">
                <span className="text-blue-400">{t.name}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                  t.status === "complete" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : "bg-amber-950 text-amber-400 border border-amber-800/40"
                )}>
                  {t.status}
                </span>
              </div>
              {t.result ? (
                <pre className="text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-32 custom-scrollbar">
                  {typeof t.result === "string" ? t.result : JSON.stringify(t.result, null, 2)}
                </pre>
              ) : t.args ? (
                <pre className="text-[10px] text-zinc-500 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(t.args, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
