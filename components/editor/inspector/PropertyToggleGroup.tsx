"use client";

import React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

export interface ToggleItem {
  value: string;
  icon?: React.ReactNode;
  label?: string;
}

interface PropertyToggleGroupProps {
  value: string;
  onValueChange: (val: string) => void;
  items: ToggleItem[];
  type?: "single" | "multiple";
}

export const PropertyToggleGroup: React.FC<PropertyToggleGroupProps> = ({
  value,
  onValueChange,
  items,
  type = "single",
}) => {
  return (
    <ToggleGroup.Root
      type={type as any}
      value={value}
      onValueChange={onValueChange}
      className="flex items-center rounded-lg overflow-hidden border border-neutral-200 dark:border-[rgba(255,255,255,0.075)]"
    >
      {items.map((item) => (
        <ToggleGroup.Item
          key={item.value}
          value={item.value}
          title={item.label}
          className={`flex items-center justify-center h-[30px] w-[32px] bg-neutral-50 dark:bg-[rgba(255,255,255,0.045)]
            text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.1)]
            transition-colors border-l first:border-l-0 border-neutral-200 dark:border-[rgba(255,255,255,0.075)]
            data-[state=on]:bg-[#1687f8]/10 data-[state=on]:text-[#1687f8]
            dark:data-[state=on]:bg-[#1687f8]/20 dark:data-[state=on]:text-[#1687f8] outline-none
            focus-visible:ring-1 focus-visible:ring-[#1687f8] z-10 data-[state=on]:z-20`}
        >
          {item.icon ? item.icon : <span className="text-[11px] font-medium">{item.label}</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
};
