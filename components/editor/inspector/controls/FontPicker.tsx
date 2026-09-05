"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Search, Type } from "@/components/editor/icons/StudioIcons";

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

const FONTS = [
  "Inter", "Geist", "Satoshi", "Manrope", "Roboto", "Poppins", 
  "Montserrat", "Lato", "Playfair Display", "Merriweather", 
  "Source Code Pro", "Space Grotesk", "DM Sans", "Outfit", "Plus Jakarta Sans"
];

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [search, setSearch] = React.useState("");

  const filteredFonts = FONTS.filter((f) => f.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center justify-between w-full h-8 px-2 text-sm bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Type className="w-3.5 h-3.5 text-[var(--inspector-text-secondary)]" />
            <span className="text-[var(--inspector-text)] truncate" style={{ fontFamily: value }}>
              {value || "Select Font"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--inspector-text-secondary)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="left"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          className="w-[240px] max-h-[380px] flex flex-col bg-white dark:bg-[#1a1b1e] border border-neutral-200 dark:border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-[9999] overflow-hidden"
        >
          <div className="p-2 border-b border-[var(--inspector-border)] flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--inspector-text)] placeholder:text-[var(--inspector-text-muted)]"
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredFonts.map((font) => (
              <button
                key={font}
                onClick={() => onChange(font)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-[var(--inspector-surface-hover)] text-[var(--inspector-text)]"
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-[var(--inspector-text-muted)]">
                No fonts found.
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
