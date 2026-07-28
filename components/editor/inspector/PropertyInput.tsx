"use client";

import React from "react";

interface PropertyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (val: string) => void;
}

export const PropertyInput = React.forwardRef<HTMLInputElement, PropertyInputProps>(
  ({ value, onChange, placeholder, className = "", disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-8 w-full rounded-lg px-2 text-xs font-medium outline-none transition-all
          bg-neutral-50 border border-neutral-200 text-neutral-900
          dark:bg-[rgba(255,255,255,0.045)] dark:border-[rgba(255,255,255,0.075)] dark:text-neutral-100
          focus:border-[#1687f8] focus:ring-1 focus:ring-[#1687f8] dark:focus:border-[#1687f8]
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

PropertyInput.displayName = "PropertyInput";
