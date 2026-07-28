"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface PropertySelectProps {
  value: string;
  onValueChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export const PropertySelect: React.FC<PropertySelectProps> = ({ value, onValueChange, options, placeholder, disabled }) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        className={`flex items-center justify-between w-full h-8 px-2 rounded-lg text-xs font-medium outline-none transition-all
          bg-neutral-50 border border-neutral-200 text-neutral-900
          dark:bg-[rgba(255,255,255,0.045)] dark:border-[rgba(255,255,255,0.075)] dark:text-neutral-100
          focus:border-[#1687f8] focus:ring-1 focus:ring-[#1687f8]
          disabled:opacity-50 disabled:cursor-not-allowed data-[state=open]:border-[#1687f8]`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-[12px] bg-white border border-neutral-200 shadow-md
            dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-xl min-w-[var(--radix-select-trigger-width)]"
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={`relative flex items-center h-7 px-6 text-xs font-medium rounded-md select-none outline-none cursor-pointer
                  text-neutral-700 data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-900
                  dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-700 dark:data-[highlighted]:text-neutral-100`}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1687f8]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
