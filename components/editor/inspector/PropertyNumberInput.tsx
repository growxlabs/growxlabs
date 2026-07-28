"use client";

import React, { useState, useEffect } from "react";

interface PropertyNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  label?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const PropertyNumberInput = React.forwardRef<HTMLInputElement, PropertyNumberInputProps>(
  ({ value, onChange, prefix: prefixProp, label, suffix, min = -Infinity, max = Infinity, step = 1, disabled, className = "" }, ref) => {
    const prefix = prefixProp || label;
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
      setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
      let num = parseFloat(localValue);
      if (isNaN(num)) {
        setLocalValue(value.toString());
        return;
      }
      if (num < min) num = min;
      if (num > max) num = max;
      setLocalValue(num.toString());
      onChange(num);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const increment = e.shiftKey ? step * 10 : step;
        let num = parseFloat(localValue) || 0;
        num += increment;
        if (num > max) num = max;
        setLocalValue(num.toString());
        onChange(num);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const decrement = e.shiftKey ? step * 10 : step;
        let num = parseFloat(localValue) || 0;
        num -= decrement;
        if (num < min) num = min;
        setLocalValue(num.toString());
        onChange(num);
      }
    };

    return (
      <div className={`relative flex items-center h-8 w-full rounded-lg overflow-hidden transition-all
          bg-neutral-50 border border-neutral-200 
          dark:bg-[rgba(255,255,255,0.045)] dark:border-[rgba(255,255,255,0.075)]
          focus-within:border-[#1687f8] focus-within:ring-1 focus-within:ring-[#1687f8] dark:focus-within:border-[#1687f8]
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        {prefix && (
          <span className="absolute left-2 text-[11px] font-medium text-neutral-400 select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full h-full bg-transparent outline-none text-xs font-medium text-neutral-900 dark:text-neutral-100
            ${prefix ? "pl-6" : "pl-2"} ${suffix ? "pr-6" : "pr-2"}`}
        />
        {suffix && (
          <span className="absolute right-2 text-[11px] font-medium text-neutral-400 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

PropertyNumberInput.displayName = "PropertyNumberInput";
