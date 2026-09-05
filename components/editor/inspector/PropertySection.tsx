"use client";

import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "@/components/editor/icons/StudioIcons";

interface PropertySectionProps {
  value: string;
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function PropertySection({ value, title, summary, children }: PropertySectionProps) {
  return (
    <Accordion.Item
      value={value}
      className="border-b border-[var(--inspector-border)]"
    >
      <Accordion.Header className="flex">
        <Accordion.Trigger
          className="group flex items-center justify-between w-full h-[42px] px-3.5 text-left
            text-[12px] font-semibold cursor-pointer select-none
            text-neutral-800 dark:text-neutral-200
            hover:bg-neutral-50 dark:hover:bg-[rgba(255,255,255,0.03)]
            transition-colors duration-140 outline-none
            focus-visible:ring-2 focus-visible:ring-[var(--inspector-brand)] focus-visible:ring-inset"
        >
          <span>{title}</span>
          <div className="flex items-center gap-2">
            {summary && (
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 truncate max-w-[120px] group-data-[state=open]:hidden">
                {summary}
              </span>
            )}
            <ChevronDown
              size={14}
              className="text-neutral-400 dark:text-neutral-500 shrink-0
                transition-transform duration-200
                group-data-[state=open]:rotate-180"
            />
          </div>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content
        className="overflow-hidden
          data-[state=open]:animate-accordion-down
          data-[state=closed]:animate-accordion-up"
      >
        <div className="px-3.5 pb-3.5 pt-0.5 space-y-2">
          {children}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export function PropertySectionRoot({
  children,
  defaultValue,
  className = "",
}: {
  children: React.ReactNode;
  defaultValue?: string[];
  className?: string;
}) {
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={defaultValue}
      className={className}
    >
      {children}
    </Accordion.Root>
  );
}
