"use client";

import React from "react";
import {
  MousePointer,
  Hand,
  Type,
  ImageIcon,
  Smartphone,
  Grid,
  Plus,
  LayoutGrid,
} from "lucide-react";

interface StudioVerticalToolDockProps {
  activeTool: "select" | "hand";
  onSelectTool: (tool: "select" | "hand") => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onSelectTextElement: () => void;
  onSelectImageElement: () => void;
  onAddSlide: () => void;
  onOpenFormats?: () => void;
}

export const StudioVerticalToolDock: React.FC<StudioVerticalToolDockProps> = ({
  activeTool,
  onSelectTool,
  showSafeArea,
  onToggleSafeArea,
  showGrid,
  onToggleGrid,
  onSelectTextElement,
  onSelectImageElement,
  onAddSlide,
  onOpenFormats,
}) => {
  return (
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center bg-[#1c1d22]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.55)] gap-1 select-none"
      role="toolbar"
      aria-label="Studio Tools"
    >
      {/* 1. Selection / Pointer (V) */}
      <button
        type="button"
        onClick={() => onSelectTool("select")}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer ${
          activeTool === "select"
            ? "bg-[#282a36] text-[#38bdf8] shadow-sm border border-white/10"
            : "text-neutral-400 hover:text-white hover:bg-white/10"
        }`}
        title="Pointer (V)"
      >
        <MousePointer size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Select</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">V</kbd>
        </span>
      </button>

      {/* 2. Hand Tool / Pan (H) */}
      <button
        type="button"
        onClick={() => onSelectTool("hand")}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer ${
          activeTool === "hand"
            ? "bg-[#282a36] text-[#38bdf8] shadow-sm border border-white/10"
            : "text-neutral-400 hover:text-white hover:bg-white/10"
        }`}
        title="Hand / Pan (H)"
      >
        <Hand size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Hand</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">H</kbd>
        </span>
      </button>

      <div className="w-5 h-px bg-white/10 my-0.5" />

      {/* 3. Format / Frame (F) */}
      {onOpenFormats && (
        <button
          type="button"
          onClick={onOpenFormats}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer text-neutral-400 hover:text-white hover:bg-white/10"
          title="Frame / Format (F)"
        >
          <LayoutGrid size={15} />
          <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
            <span>Format</span>
            <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">F</kbd>
          </span>
        </button>
      )}

      {/* 4. Text Tool (T) */}
      <button
        type="button"
        onClick={onSelectTextElement}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer text-neutral-400 hover:text-white hover:bg-white/10"
        title="Text Layer (T)"
      >
        <Type size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Text</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">T</kbd>
        </span>
      </button>

      {/* 5. Image / Media Tool (I) */}
      <button
        type="button"
        onClick={onSelectImageElement}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer text-neutral-400 hover:text-white hover:bg-white/10"
        title="Image / Media (I)"
      >
        <ImageIcon size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Image</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">I</kbd>
        </span>
      </button>

      <div className="w-5 h-px bg-white/10 my-0.5" />

      {/* 6. Safe Area Grid (S) */}
      <button
        type="button"
        onClick={onToggleSafeArea}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer ${
          showSafeArea
            ? "bg-[#0d2238] text-[#38bdf8] border border-[#1687f8]/40"
            : "text-neutral-400 hover:text-white hover:bg-white/10"
        }`}
        title="Safe Margin Guides (S)"
      >
        <Smartphone size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Safe Margins</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">S</kbd>
        </span>
      </button>

      {/* 7. Grid Dots (G) */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer ${
          showGrid
            ? "bg-[#0d2238] text-[#38bdf8] border border-[#1687f8]/40"
            : "text-neutral-400 hover:text-white hover:bg-white/10"
        }`}
        title="Pixel Grid Dots (G)"
      >
        <Grid size={15} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Grid</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">G</kbd>
        </span>
      </button>

      <div className="w-5 h-px bg-white/10 my-0.5" />

      {/* 8. Add Slide (+) */}
      <button
        type="button"
        onClick={onAddSlide}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative cursor-pointer bg-[#18191d] hover:bg-[#1687f8] text-neutral-300 hover:text-white border border-white/10 hover:border-transparent"
        title="Add New Slide (+)"
      >
        <Plus size={16} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2 py-1 bg-[#121316] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
          <span>Add Slide</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">+</kbd>
        </span>
      </button>
    </div>
  );
};
