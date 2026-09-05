"use client";

import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight } from "@/components/editor/icons/StudioIcons";

interface LayerGroupProps {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function LayerGroup({
  label,
  count,
  defaultOpen = true,
  children,
}: LayerGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col mb-1"
    >
      <Collapsible.Trigger className="flex items-center justify-between h-[30px] px-[6px] text-[10px] font-semibold tracking-[0.06em] uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors group">
        <div className="flex items-center gap-1">
          <ChevronRight
            size={12}
            className={`transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
          <span>{label}</span>
        </div>
        <div className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[9px] leading-none">
          {count}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-gray-200 dark:border-gray-800 ml-3">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
