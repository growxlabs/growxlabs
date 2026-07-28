"use client";

import * as React from "react";
import { PropertyNumberInput } from "../PropertyNumberInput";
import { ColourPicker } from "./ColourPicker";

interface BorderControlProps {
  width: number;
  color: string;
  radius: number;
  onChange: (updates: { borderWidth?: number; borderColor?: string; borderRadius?: number }) => void;
}

export function BorderControl({ width, color, radius, onChange }: BorderControlProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <PropertyNumberInput
          label="W"
          value={width}
          onChange={(val) => onChange({ borderWidth: val })}
        />
        <PropertyNumberInput
          label="R"
          value={radius}
          onChange={(val) => onChange({ borderRadius: val })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--inspector-text-secondary)] mb-1">
          Color
        </label>
        <ColourPicker
          color={color}
          onChange={(c) => onChange({ borderColor: c })}
        />
      </div>
    </div>
  );
}
