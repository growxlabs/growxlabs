"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";

interface ColourPickerProps {
  color: string;
  opacity?: number;
  onChange: (color: string) => void;
  onOpacityChange?: (opacity: number) => void;
}

export function ColourPicker({
  color,
  opacity = 100,
  onChange,
  onOpacityChange,
}: ColourPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center w-full h-8 px-2 text-sm bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)]">
          <div
            className="w-4 h-4 rounded border border-[var(--inspector-border-strong)] mr-2"
            style={{ backgroundColor: color, opacity: opacity / 100 }}
          />
          <span className="text-[var(--inspector-text)] flex-1 text-left uppercase font-mono">{color}</span>
          <span className="text-[var(--inspector-text-secondary)]">{opacity}%</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="left"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          className="w-[260px] p-4 bg-white dark:bg-[#1a1b1e] border border-neutral-200 dark:border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl backdrop-blur-md z-[9999] text-neutral-800 dark:text-neutral-200"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Color</span>
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--inspector-text-secondary)] w-8">Hex</span>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 h-8 px-2 text-sm bg-[var(--inspector-bg)] border border-[var(--inspector-border)] rounded uppercase font-mono"
              />
            </div>
            {onOpacityChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--inspector-text-secondary)] w-8">Opac</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  className="flex-1 accent-[var(--inspector-brand)]"
                />
                <span className="text-xs text-[var(--inspector-text-secondary)] w-8 text-right">{opacity}%</span>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
