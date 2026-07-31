"use client";

import { AlertTriangle, Bot, Check, Clipboard, FileText, User } from "lucide-react";
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
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", user ? "bg-slate-900 text-white" : "bg-[#e9f4ff] text-[#0667b9]")}>{user ? <User size={15} /> : <Bot size={16} />}</div>
      <div className={cn("min-w-0 max-w-[min(720px,88%)]", user && "text-right")}>
        <div className={cn("mb-1.5 flex items-center gap-2 text-[11px]", user && "justify-end")}><strong className="text-slate-700">{user ? "You" : "GXL Orchestrator"}</strong><time className="text-slate-400">{formatTime(message.timestamp)}</time></div>
        <div className={cn(
          "relative rounded-2xl px-4 py-3 text-left text-sm leading-6",
          user ? "rounded-tr-md bg-slate-900 text-white" :
          message.kind === "error" ? "rounded-tl-md border border-red-200 bg-red-50 text-red-800" :
          "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm",
        )}>
          {message.kind === "error" && <AlertTriangle size={15} className="mb-2" />}
          <p className="whitespace-pre-wrap break-words">{message.text || (streaming ? "Working…" : "")}</p>
          {streaming && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-blue-500 align-middle motion-reduce:animate-none" aria-label="Response streaming" />}
        </div>
        {message.toolCalls?.length ? <div className="mt-2 space-y-1">{message.toolCalls.map((tool) => (
          <details key={tool.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-slate-700"><FileText size={13} />{tool.summary}<span className="ml-auto text-[10px] uppercase text-slate-400">{tool.status}</span></summary>
            <p className="mt-2 border-t border-slate-200 pt-2 text-slate-500">Tool: {tool.name}. Sensitive inputs and raw payloads are hidden.</p>
          </details>
        ))}</div> : null}
        {!user && message.text && <button onClick={async () => { await navigator.clipboard.writeText(message.text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className="mt-1 flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-slate-400 opacity-0 hover:bg-slate-100 group-hover:opacity-100 focus:opacity-100">{copied ? <Check size={11} /> : <Clipboard size={11} />}{copied ? "Copied" : "Copy"}</button>}
      </div>
    </article>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
