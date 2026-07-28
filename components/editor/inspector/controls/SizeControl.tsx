"use client";

import * as React from "react";
import { PropertyNumberInput } from "../PropertyNumberInput";

interface SizeControlProps {
  width: number;
  height: number;
  onChange: (updates: { width?: number; height?: number }) => void;
  disabled?: boolean;
}

export function SizeControl({ width, height, onChange, disabled }: SizeControlProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <PropertyNumberInput
        label="W"
        value={width}
        onChange={(val) => onChange({ width: val })}
        disabled={disabled}
      />
      <PropertyNumberInput
        label="H"
        value={height}
        onChange={(val) => onChange({ height: val })}
        disabled={disabled}
      />
    </div>
  );
}
