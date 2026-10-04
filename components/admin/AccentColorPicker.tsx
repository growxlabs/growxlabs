"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccentColor, ACCENT_OPTIONS, type AccentColor } from "@/components/providers/AccentColorProvider";
import { useTheme } from "next-themes";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccentColorPickerProps {
  variant?: "dropdown" | "swatches" | "card";
  className?: string;
  showLabel?: boolean;
}

export function AccentColorPicker({
  variant = "dropdown",
  className,
  showLabel = true,
}: AccentColorPickerProps) {
  const { accentColor, setAccentColor, accentOptions } = useAccentColor();
  const { theme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = resolvedTheme || theme || "dark";
  const selectedOption =
    accentOptions.find((opt) => opt.id === accentColor) || accentOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSwatchColor = (opt: (typeof accentOptions)[0]) => {
    if (opt.id === "white") {
      return currentTheme === "dark" ? "#ffffff" : "#18181b";
    }
    return opt.colorHex;
  };

  // Swatches-only variant (compact row for sidebar profile menus)
  if (variant === "swatches") {
    return (
      <div className={cn("space-y-1.5", className)}>
        {showLabel && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              Accent Color
            </span>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-neutral-300">
              {selectedOption.name}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 dark:bg-neutral-950 rounded-xl border border-slate-200/60 dark:border-neutral-800">
          {accentOptions.map((opt) => {
            const isSelected = accentColor === opt.id;
            const bg = getSwatchColor(opt);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccentColor(opt.id)}
                title={`${opt.name} (${opt.label})`}
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer relative",
                  isSelected
                    ? "ring-2 ring-offset-1 ring-slate-900 dark:ring-white dark:ring-offset-neutral-950 scale-110 shadow-sm"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: bg }}
              >
                {isSelected && (
                  <Check
                    size={10}
                    className={
                      opt.id === "yellow" ||
                      (opt.id === "white" && currentTheme === "dark")
                        ? "text-black"
                        : "text-white"
                    }
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Sleek executive row variant (for Settings -> Appearance page)
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-4 rounded-xl bg-[#141416] border border-[#27272a] hover:border-[#3f3f46] transition-all",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-100">
                Accent Color
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20">
                {selectedOption.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Personalize primary buttons, active tabs, and focus rings.
            </p>
          </div>
        </div>

        {/* Compact 1-line swatch strip */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0e0e10] border border-[#27272a] rounded-xl shrink-0 self-start sm:self-auto">
          {accentOptions.map((opt) => {
            const isSelected = accentColor === opt.id;
            const bg = getSwatchColor(opt);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccentColor(opt.id)}
                title={`${opt.name} (${opt.label})`}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer relative",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-[#0e0e10] scale-110 shadow-sm"
                    : "hover:scale-105 opacity-75 hover:opacity-100"
                )}
                style={{ backgroundColor: bg }}
              >
                {isSelected && (
                  <Check
                    size={12}
                    className={
                      opt.id === "yellow" ||
                      (opt.id === "white" && currentTheme === "dark")
                        ? "text-black"
                        : "text-white"
                    }
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ChatGPT-style Dropdown variant
  return (
    <div ref={dropdownRef} className={cn("relative inline-block w-full max-w-xs", className)}>
      {showLabel && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
          Accent color
        </label>
      )}

      {/* ChatGPT-style Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm font-medium hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: getSwatchColor(selectedOption) }}
          />
          <span className="text-sm font-medium">
            {selectedOption.name} {selectedOption.id === "blue" ? "(Default)" : ""}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 dark:text-neutral-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-0.5">
          {accentOptions.map((opt) => {
            const isSelected = accentColor === opt.id;
            const bg = getSwatchColor(opt);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setAccentColor(opt.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                    style={{ backgroundColor: bg }}
                  />
                  <span>
                    {opt.name} {opt.id === "blue" ? "(Default)" : ""}
                  </span>
                </div>
                {isSelected && (
                  <Check
                    size={14}
                    className="text-slate-900 dark:text-white"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
