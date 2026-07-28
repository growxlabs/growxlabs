"use client";

import * as React from "react";
import { PropertyNumberInput } from "../PropertyNumberInput";

interface RadiusControlProps {
  value: number;
  onChange: (val: number) => void;
}

export function RadiusControl({ value, onChange }: RadiusControlProps) {
  return (
    <div>
      <PropertyNumberInput
        label="R"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
