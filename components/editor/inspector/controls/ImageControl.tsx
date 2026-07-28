"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { Upload, ChevronDown, Check } from "lucide-react";

interface ImageControlProps {
  mediaUrl: string;
  objectFit: string;
  onUrlChange: (url: string) => void;
  onFitChange: (fit: string) => void;
}

export function ImageControl({ mediaUrl, objectFit, onUrlChange, onFitChange }: ImageControlProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUrlChange(url);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Image URL"
          className="flex-1 h-8 px-2 text-sm bg-[var(--inspector-bg)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] text-[var(--inspector-text)] focus:outline-none focus:border-[var(--inspector-brand)]"
        />
        <button
          onClick={handleUploadClick}
          className="w-8 h-8 flex items-center justify-center bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] text-[var(--inspector-text-secondary)] transition-colors"
          title="Upload Image"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Select.Root value={objectFit} onValueChange={onFitChange}>
        <Select.Trigger className="flex items-center justify-between w-full h-8 px-2 text-sm bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] text-[var(--inspector-text)]">
          <Select.Value placeholder="Object Fit" />
          <Select.Icon>
            <ChevronDown className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-[var(--inspector-surface)] border border-[var(--inspector-border)] rounded-[var(--radius-popover)] shadow-xl z-50">
            <Select.Viewport className="p-1">
              {["cover", "contain", "fill"].map((fit) => (
                <Select.Item
                  key={fit}
                  value={fit}
                  className="flex items-center justify-between px-6 py-1.5 text-sm rounded outline-none hover:bg-[var(--inspector-surface-hover)] text-[var(--inspector-text)] cursor-pointer select-none data-[highlighted]:bg-[var(--inspector-surface-active)]"
                >
                  <Select.ItemText className="capitalize">{fit}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="w-4 h-4 text-[var(--inspector-brand)]" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
