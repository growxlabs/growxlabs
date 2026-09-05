"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "@/components/editor/icons/StudioIcons";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  fontFamily?: string;
  description?: string;
}

export interface StudioDropdownProps {
  value: string;
  onValueChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  prefix?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  triggerHeight?: "h-[24px]" | "h-[26px]" | "h-[28px]";
  fullWidth?: boolean;
  align?: "start" | "end" | "center";
}

export const StudioDropdown: React.FC<StudioDropdownProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  prefix,
  disabled = false,
  className = "",
  triggerHeight = "h-[26px]",
  fullWidth = true,
  align = "start",
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        className={`group flex items-center justify-between ${triggerHeight} ${
          fullWidth ? "w-full" : "w-auto"
        } bg-[#373737] hover:bg-[#3d3d3d] border border-[#48484a]/30 focus:border-[#1687f8] focus:ring-1 focus:ring-[#1687f8] data-[state=open]:border-[#1687f8] data-[state=open]:ring-1 data-[state=open]:ring-[#1687f8] rounded-md px-2 text-[11px] font-medium text-[#ececec] outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${className}`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden truncate">
          {prefix && <span className="text-[#8e8e93] text-[10px] shrink-0 select-none">{prefix}</span>}
          {selectedOption?.icon && (
            <span className="text-[#8e8e93] shrink-0 select-none">{selectedOption.icon}</span>
          )}
          <span
            className="truncate text-[#ececec]"
            style={selectedOption?.fontFamily ? { fontFamily: selectedOption.fontFamily } : undefined}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <Select.Icon asChild>
          <ChevronDown
            size={11}
            className="text-[#8e8e93] group-hover:text-[#b4b4b8] group-data-[state=open]:rotate-180 transition-transform duration-150 shrink-0 ml-1.5"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          align={align}
          className="z-[99999] overflow-hidden rounded-lg bg-[#242426] border border-[#383838] shadow-[0_12px_32px_rgba(0,0,0,0.65)] min-w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto p-1 text-[#ececec]"
        >
          <Select.Viewport className="p-0.5 space-y-0.5">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center justify-between h-7 px-2.5 text-[11px] font-medium rounded-md select-none outline-none cursor-pointer text-[#d4d4d8] data-[highlighted]:bg-white/10 data-[highlighted]:text-white data-[state=checked]:text-[#1687f8] data-[state=checked]:bg-[#1687f8]/10 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {option.icon && (
                    <span className="text-[#8e8e93] shrink-0 select-none">{option.icon}</span>
                  )}
                  <Select.ItemText>
                    <span
                      style={option.fontFamily ? { fontFamily: option.fontFamily } : undefined}
                      className="truncate"
                    >
                      {option.label}
                    </span>
                  </Select.ItemText>
                </div>

                <Select.ItemIndicator className="shrink-0 text-[#1687f8]">
                  <Check size={11} strokeWidth={2.5} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
