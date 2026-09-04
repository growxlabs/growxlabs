"use client";

import Link from "next/link";
import { 
  Bot, 
  Code2, 
  Download, 
  FolderKanban, 
  Layers, 
  MoreHorizontal, 
  PanelLeftClose, 
  Pin, 
  Plus, 
  Search, 
  Settings, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "./command-center.types";

interface Props {
  open: boolean;
  conversations: ConversationSummary[];
  activeId: string;
  unread: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function CommandSidebar({
  open,
  conversations,
  activeId,
  unread,
  onClose,
  onSelect,
  onNew,
}: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      {/* GrowX Labs AI Command Center Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#27272a] bg-[#141416] text-[#f4f4f5] transition-all duration-200 md:static md:z-auto shrink-0 select-none",
          open ? "translate-x-0 md:flex md:w-[260px]" : "-translate-x-full md:hidden md:w-0"
        )}
        aria-label="Agent Workspace navigation"
      >
        {/* Top Header: Brand Wordmark with GX Badge */}
        <div className="flex h-14 items-center justify-between border-b border-[#27272a] px-4">
          <Link href="/admin/command-center" className="flex items-center gap-2.5 group">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-xs font-bold text-white shadow-xs">
              GX
            </span>
            <span className="font-serif font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
              GrowX Labs
            </span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        {/* Action: + New Chat Button (Dark, sleek, high-visibility) */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="flex h-10 w-full items-center justify-start gap-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-3.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer group"
          >
            <Plus size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
            <span>New conversation</span>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 space-y-5 custom-scrollbar text-xs">
          
          {/* Main Workspace Navigation Items */}
          <div className="space-y-0.5">
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer">
              <FolderKanban size={15} className="text-zinc-400" />
              <span>Projects</span>
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer">
              <Layers size={15} className="text-zinc-400" />
              <span>Artifacts</span>
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer">
              <Code2 size={15} className="text-zinc-400" />
              <span>Code</span>
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer">
              <SlidersHorizontal size={15} className="text-zinc-400" />
              <span>Customize</span>
            </button>
          </div>

          {/* Section: Pinned */}
          <div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              <span>Pinned</span>
              <Plus size={12} className="cursor-pointer hover:text-zinc-300" />
            </div>
            <p className="px-2.5 py-1 text-[11px] text-zinc-500 italic flex items-center gap-1.5">
              <Pin size={11} className="rotate-45" />
              <span>Pin chats to keep them here</span>
            </p>
          </div>

          {/* Section: Chats and tasks */}
          <div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              <span>Chats and tasks</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {conversations.length > 0 ? (
                conversations.map((c) => {
                  const isActive = activeId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors group cursor-pointer",
                        isActive
                          ? "bg-white/[0.1] text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="truncate flex-1">{c.title}</span>
                      <MoreHorizontal size={13} className="text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity shrink-0 ml-1" />
                    </button>
                  );
                })
              ) : (
                <p className="px-2.5 py-1.5 text-[11px] text-zinc-500">
                  No active conversations
                </p>
              )}
            </div>
          </div>

          {/* Section: Specialized Agents */}
          <div>
            <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Specialized Agents
            </div>
            <div className="space-y-0.5 mt-1">
              {[
                { name: "Sales Agent", prompt: "Summarize today's lead pipeline and qualified opportunities" },
                { name: "CFO Agent", prompt: "Audit overdue client invoices and balance receivable" },
                { name: "Research Agent", prompt: "Compare top frontier model benchmarks for desktop computer use" },
                { name: "Engineering Agent", prompt: "Prepare an architecture and software deliverables review" },
              ].map((agent) => (
                <button
                  key={agent.name}
                  onClick={() => onSelect(`agent_${agent.name}`)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer group"
                >
                  <Bot size={14} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
                  <span className="truncate flex-1 font-medium">{agent.name}</span>
                  <span className="size-1.5 rounded-full bg-emerald-500" title="Active & Ready" />
                </button>
              ))}
            </div>
          </div>

          {/* Section: Governance */}
          <div>
            <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Governance
            </div>
            <div className="space-y-0.5 mt-1">
              <Link
                href="/admin/command-center/governance/approvals"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <ShieldCheck size={14} className="text-zinc-400" />
                <span>Security & Approvals</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3 border-t border-[#27272a] bg-[#141416] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-xs">
              V
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-white truncate leading-tight">Varshith</p>
              <p className="text-[10px] text-zinc-400 font-mono">Workspace Admin</p>
            </div>
          </div>

          <Link
            href="/admin/settings"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <Settings size={15} />
          </Link>
        </div>

      </aside>
    </>
  );
}
