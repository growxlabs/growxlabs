"use client";

import * as React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AlignLeft, AlignCenter, AlignRight } from "@/components/editor/icons/StudioIcons";

interface AlignmentControlProps {
  value: string;
  onChange: (val: string) => void;
}

export function AlignmentControl({ value, onChange }: AlignmentControlProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val);
      }}
      className="flex items-center inline-flex bg-[var(--inspector-bg)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] overflow-hidden"
    >
      <ToggleGroup.Item
        value="left"
        className="flex items-center justify-center w-8 h-[30px] text-[var(--inspector-text-secondary)] hover:bg-[var(--inspector-surface-hover)] data-[state=on]:bg-[var(--inspector-surface-active)] data-[state=on]:text-[var(--inspector-brand)] transition-colors border-r border-[var(--inspector-border)]"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="center"
        className="flex items-center justify-center w-8 h-[30px] text-[var(--inspector-text-secondary)] hover:bg-[var(--inspector-surface-hover)] data-[state=on]:bg-[var(--inspector-surface-active)] data-[state=on]:text-[var(--inspector-brand)] transition-colors border-r border-[var(--inspector-border)]"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="right"
        className="flex items-center justify-center w-8 h-[30px] text-[var(--inspector-text-secondary)] hover:bg-[var(--inspector-surface-hover)] data-[state=on]:bg-[var(--inspector-surface-active)] data-[state=on]:text-[var(--inspector-brand)] transition-colors"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
