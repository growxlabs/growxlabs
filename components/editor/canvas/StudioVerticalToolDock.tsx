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
} from "@/components/editor/icons/StudioIcons";

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
  isLeftSidebarCollapsed?: boolean;
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
  isLeftSidebarCollapsed,
}) => {
  return (
    <div
      className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center bg-[#242426] border border-[#383838] rounded-2xl p-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)] gap-0.5 select-none transition-all duration-200"
      role="toolbar"
      aria-label="Studio Tools"
    >
      {/* 1. Selection / Pointer (V) */}
      <button
        type="button"
        onClick={() => onSelectTool("select")}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
          activeTool === "select"
            ? "bg-[#444444] text-white shadow-sm"
            : "text-[#9a9a9a] hover:text-white hover:bg-white/5"
        }`}
        title="Pointer (V)"
      >
        <MousePointer size={13} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Select</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">V</kbd>
        </span>
      </button>

      {/* 2. Hand Tool / Pan (H) */}
      <button
        type="button"
        onClick={() => onSelectTool("hand")}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
          activeTool === "hand"
            ? "bg-[#444444] text-white shadow-sm"
            : "text-[#9a9a9a] hover:text-white hover:bg-white/5"
        }`}
        title="Hand / Pan (H)"
      >
        <Hand size={13} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Hand</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">H</kbd>
        </span>
      </button>

      <div className="w-4 h-px bg-[#353535] my-0.5" />

      {/* 3. Format / Frame (F) */}
      {onOpenFormats && (
        <button
          type="button"
          onClick={onOpenFormats}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer text-[#9a9a9a] hover:text-white hover:bg-white/5"
          title="Frame / Format (F)"
        >
          <LayoutGrid size={13} />
          <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
            <span>Format</span>
            <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">F</kbd>
          </span>
        </button>
      )}

      {/* 4. Text Tool (T) */}
      <button
        type="button"
        onClick={onSelectTextElement}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer text-[#9a9a9a] hover:text-white hover:bg-white/5"
        title="Text Layer (T)"
      >
        <span className="text-[12px] font-sans font-semibold">Aa</span>
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Text</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">T</kbd>
        </span>
      </button>

      {/* 5. Image / Media Tool (I) */}
      <button
        type="button"
        onClick={onSelectImageElement}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer text-[#9a9a9a] hover:text-white hover:bg-white/5"
        title="Image / Media (I)"
      >
        <ImageIcon size={13} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Image</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">I</kbd>
        </span>
      </button>

      <div className="w-4 h-px bg-[#353535] my-0.5" />

      {/* 6. Safe Area Grid (S) */}
      <button
        type="button"
        onClick={onToggleSafeArea}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
          showSafeArea
            ? "bg-[#444444] text-white shadow-sm"
            : "text-[#9a9a9a] hover:text-white hover:bg-white/5"
        }`}
        title="Safe Margin Guides (S)"
      >
        <Smartphone size={13} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Safe Margins</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">S</kbd>
        </span>
      </button>

      {/* 7. Grid Dots (G) */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
          showGrid
            ? "bg-[#444444] text-white shadow-sm"
            : "text-[#9a9a9a] hover:text-white hover:bg-white/5"
        }`}
        title="Pixel Grid Dots (G)"
      >
        <Grid size={13} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Grid</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">G</kbd>
        </span>
      </button>

      <div className="w-4 h-px bg-[#353535] my-0.5" />

      {/* 8. Add Slide (+) */}
      <button
        type="button"
        onClick={onAddSlide}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer text-[#9a9a9a] hover:text-white hover:bg-white/5"
        title="Add New Slide (+)"
      >
        <Plus size={14} />
        <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
          <span>Add Artboard</span>
          <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">+</kbd>
        </span>
      </button>
    </div>
  );
};
