"use client";

import * as React from "react";
import { PropertyNumberInput } from "../PropertyNumberInput";

interface PositionControlProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onChange: (updates: { x?: number; y?: number; width?: number; height?: number }) => void;
  disabled?: boolean;
}

export function PositionControl({ x, y, width, height, onChange, disabled }: PositionControlProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <PropertyNumberInput
        label="X"
        value={x}
        onChange={(val) => onChange({ x: val })}
        disabled={disabled}
      />
      <PropertyNumberInput
        label="Y"
        value={y}
        onChange={(val) => onChange({ y: val })}
        disabled={disabled}
      />
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
