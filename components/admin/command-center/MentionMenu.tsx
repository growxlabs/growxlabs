"use client";

import { Bot, Box, Cpu, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MentionOption } from "./command-center.types";

export function MentionMenu({ options, activeIndex, onSelect }: { options: MentionOption[]; activeIndex: number; onSelect: (option: MentionOption) => void }) {
  if (!options.length) return null;
  return (
    <div role="listbox" aria-label="Command suggestions" className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      {options.map((option, index) => {
        const Icon = option.kind === "agent" ? Bot : option.kind === "project" ? Box : option.kind === "model" ? Cpu : Slash;
        return (
          <button key={option.id} role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(option)}
            className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", index === activeIndex ? "bg-blue-50" : "hover:bg-slate-50")}>
            <Icon size={15} className="text-slate-500" />
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{option.label}</span><span className="block truncate text-[11px] text-slate-500">{option.description}</span></span>
            <code className="text-[10px] text-slate-400">{option.token}</code>
          </button>
        );
      })}
    </div>
  );
}
