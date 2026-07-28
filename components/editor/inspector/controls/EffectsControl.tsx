"use client";

import * as React from "react";
import * as Switch from "@radix-ui/react-switch";

interface EffectsControlProps {
  shadowEnabled?: boolean;
  brightness?: number;
  contrast?: number;
  onChange: (updates: any) => void;
}

export function EffectsControl({ shadowEnabled = false, brightness = 100, contrast = 100, onChange }: EffectsControlProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--inspector-text)]">Drop Shadow</span>
        <Switch.Root
          checked={shadowEnabled}
          onCheckedChange={(checked) => onChange({ shadowEnabled: checked })}
          className="w-9 h-5 bg-[var(--inspector-bg)] border border-[var(--inspector-border)] rounded-full relative data-[state=checked]:bg-[var(--inspector-brand)] data-[state=checked]:border-[var(--inspector-brand)] outline-none cursor-pointer transition-colors"
        >
          <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full transition-transform translate-x-[2px] data-[state=checked]:translate-x-[18px] shadow-sm" />
        </Switch.Root>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--inspector-text-secondary)]">Brightness</span>
          <span className="text-xs text-[var(--inspector-text-muted)]">{brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={brightness}
          onChange={(e) => onChange({ brightness: Number(e.target.value) })}
          className="w-full accent-[var(--inspector-brand)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--inspector-text-secondary)]">Contrast</span>
          <span className="text-xs text-[var(--inspector-text-muted)]">{contrast}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={contrast}
          onChange={(e) => onChange({ contrast: Number(e.target.value) })}
          className="w-full accent-[var(--inspector-brand)]"
        />
      </div>
    </div>
  );
}
