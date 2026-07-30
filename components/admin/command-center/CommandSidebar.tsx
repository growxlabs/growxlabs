"use client";

import Link from "next/link";
import { Bell, Bot, ChevronDown, MessageSquare, Plus, Settings, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "./command-center.types";

export function CommandSidebar({
  open, conversations, activeId, unread, onClose, onSelect, onNew,
}: {
  open: boolean; conversations: ConversationSummary[]; activeId: string; unread: number;
  onClose: () => void; onSelect: (id: string) => void; onNew: () => void;
}) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 bg-[#f7f8fa] transition-transform md:static md:z-auto md:w-[248px] md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full md:hidden",
      )} aria-label="Command Center navigation">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-3">
          <button className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2 text-left hover:bg-white" aria-label="Switch workspace">
            <span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">GX</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">GrowX Labs</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <button className="grid size-9 place-items-center rounded-lg hover:bg-white md:hidden" onClick={onClose} aria-label="Close sidebar"><X size={17} /></button>
        </div>
        <div className="p-3">
          <button onClick={onNew} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#0877d1] text-xs font-semibold text-white hover:bg-[#0667b9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            <Plus size={15} /> New conversation
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <Section title="Conversations">
            {conversations.length ? conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => onSelect(conversation.id)} className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs",
                activeId === conversation.id ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70",
              )}>
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </button>
            )) : <p className="px-2 py-3 text-xs text-slate-400">No conversations yet</p>}
          </Section>
          <Section title="Agents">
            {["Sales Agent", "CFO Agent", "Research Agent"].map((name) => (
              <button key={name} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-600 hover:bg-white/70">
                <Bot size={14} /><span>{name}</span><span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
              </button>
            ))}
          </Section>
          <Section title="Workspace">
            <Link href="/admin/command-center/governance/approvals" className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-600 hover:bg-white/70"><ShieldCheck size={14} />Governance</Link>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-600 hover:bg-white/70"><Bell size={14} />Notifications{unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread}</span>}</button>
          </Section>
        </div>
        <Link href="/admin/settings" className="m-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-white"><Settings size={14} />Settings</Link>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-4"><h2 className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h2>{children}</section>;
}
