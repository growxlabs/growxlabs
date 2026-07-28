"use client";

import * as React from "react";

interface OpacityControlProps {
  value: number;
  onChange: (val: number) => void;
}

export function OpacityControl({ value, onChange }: OpacityControlProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--inspector-brand)]"
      />
      <div className="relative w-16">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-8 pl-2 pr-6 text-sm bg-[var(--inspector-bg)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] text-[var(--inspector-text)] focus:outline-none focus:border-[var(--inspector-brand)]"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--inspector-text-secondary)] pointer-events-none">
          %
        </span>
      </div>
    </div>
  );
}
