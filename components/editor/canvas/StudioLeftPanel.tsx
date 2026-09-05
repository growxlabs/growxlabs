"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Trash2,
  Plus,
  LayoutGrid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ImageIcon,
  Quote,
  MousePointer,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  CloudCheck,
  CloudUpload,
  CloudAlert,
} from "@/components/editor/icons/StudioIcons";
import type { Slide, ElementKey } from "../inspector/inspectorTypes";
import { CANVAS_FORMAT_PRESETS, CanvasPreset } from "../inspector/StudioInspector";

interface StudioLeftPanelProps {
  slides: Slide[];
  activeIndex: number;
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  activeFormat: CanvasPreset;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onSelectElement: (key: ElementKey | null) => void;
  onSelectFooter: (selected: boolean) => void;
  onToggleVisibility: (key: ElementKey) => void;
  onToggleLock: (key: ElementKey) => void;
  onApplyPreset: (presetId: string) => void;
  onFormatChange: (preset: CanvasPreset) => void;
  presets: { id: string; name: string; desc: string }[];
  onCollapse?: () => void;
  projectName?: string;
  cloudSaveStatus?: "saved" | "saving" | "unsaved" | "error";
  onOpenProjectsDrawer?: () => void;
  onCreateNewProject?: () => void;
  onSaveToDatabase?: () => void;
}

const LAYER_ORDER: ElementKey[] = [
  "headline",
  "category",
  "featuredImage",
  "secondaryImage",
  "body",
  "bullets",
  "quote",
  "cta",
  "author",
  "logo",
  "divider",
];

export const StudioLeftPanel: React.FC<StudioLeftPanelProps> = ({
  slides,
  activeIndex,
  activeSlide,
  selectedElement,
  isFooterSelected,
  activeFormat,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onSelectElement,
  onSelectFooter,
  onToggleVisibility,
  onToggleLock,
  onApplyPreset,
  onFormatChange,
  presets,
  onCollapse,
  projectName = "GrowXLabs Editorial Post",
  cloudSaveStatus = "saved",
  onOpenProjectsDrawer,
  onCreateNewProject,
  onSaveToDatabase,
}) => {
  const [tab, setTab] = useState<"design" | "theme">("design");
  const [isPageExpanded, setIsPageExpanded] = useState(true);
  const [expandedSlides, setExpandedSlides] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleSlideExpand = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSlides((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <aside
      className="w-[240px] bg-[#2a2a2a] border-r border-[#353535] flex flex-col h-full select-none shrink-0 z-20 text-[#ececec]"
      role="complementary"
      aria-label="Studio Layers and Assets Panel"
    >
      {/* 1. Paper.design Header Bar */}
      <div className="h-[42px] px-2.5 border-b border-[#353535] flex items-center justify-between shrink-0 bg-[#2a2a2a] gap-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Paper Document Icon with Menu */}
          <div className="relative group/menu">
            <button
              type="button"
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              title="File Menu • Database Projects"
            >
              <FolderOpen size={14} />
            </button>
            <div className="hidden group-hover/menu:block absolute top-full left-0 mt-1 w-48 bg-[#242426] border border-[#383838] rounded-lg shadow-xl py-1 z-50 text-[11px] font-medium text-neutral-200 divide-y divide-white/5">
              {onOpenProjectsDrawer && (
                <button
                  type="button"
                  onClick={onOpenProjectsDrawer}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <FolderOpen size={12} />
                  <span>Open Database Projects</span>
                </button>
              )}
              {onCreateNewProject && (
                <button
                  type="button"
                  onClick={onCreateNewProject}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  <span>New Carousel Project</span>
                </button>
              )}
              {onSaveToDatabase && (
                <button
                  type="button"
                  onClick={onSaveToDatabase}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <CloudUpload size={12} />
                  <span>Save to Database (Ctrl+S)</span>
                </button>
              )}
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft size={12} />
                <span>Return to Admin</span>
              </Link>
            </div>
          </div>

          {/* Document Title (Clickable to open projects) */}
          <span
            onClick={onOpenProjectsDrawer}
            className="text-[12px] font-medium text-[#ececec] truncate tracking-tight cursor-pointer hover:text-white hover:underline transition-colors"
            title="Click to view all saved projects"
          >
            {projectName}
          </span>
        </div>

        {/* Cloud Sync Status Pill */}
        <div className="flex items-center gap-1 shrink-0">
          {cloudSaveStatus === "saved" && (
            <span
              className="flex items-center gap-1 text-[10px] text-[#34d399] font-mono px-1.5 py-0.5 rounded bg-[#34d399]/10 border border-[#34d399]/20"
              title="All changes saved to database"
            >
              <CloudCheck size={11} />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          {cloudSaveStatus === "saving" && (
            <span
              className="flex items-center gap-1 text-[10px] text-[#38bdf8] font-mono px-1.5 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20"
              title="Saving changes to database..."
            >
              <CloudUpload size={11} className="animate-pulse" />
              <span className="hidden sm:inline">Saving</span>
            </span>
          )}
          {cloudSaveStatus === "unsaved" && (
            <span
              className="flex items-center gap-1 text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20"
              title="Unsaved changes pending auto-save"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Unsaved</span>
            </span>
          )}
          {cloudSaveStatus === "error" && onSaveToDatabase && (
            <button
              type="button"
              onClick={onSaveToDatabase}
              className="flex items-center gap-1 text-[10px] text-rose-400 font-mono px-1.5 py-0.5 rounded bg-rose-400/10 border border-rose-400/20 cursor-pointer hover:bg-rose-400/20"
              title="Save failed. Click to retry"
            >
              <CloudAlert size={11} />
              <span>Retry</span>
            </button>
          )}

          {/* Paper Sidebar Collapse Icon Button */}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer ml-1"
              title="Collapse sidebar"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="12" height="10" rx="1.5" />
                <line x1="6" y1="3" x2="6" y2="13" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Paper.design Exact Segmented Control: [ Design | Theme ] */}
      <div className="px-2.5 py-2 border-b border-[#353535] bg-[#2a2a2a]">
        <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-[#38383a]">
          <button
            type="button"
            onClick={() => setTab("design")}
            className={`flex-1 h-6 text-[11px] font-medium rounded-md transition-all flex items-center justify-center cursor-pointer ${
              tab === "design"
                ? "bg-[#3f3f3f] text-white shadow-sm font-semibold"
                : "text-[#8e8e93] hover:text-white hover:bg-white/5"
            }`}
          >
            Design
          </button>
          <button
            type="button"
            onClick={() => setTab("theme")}
            className={`flex-1 h-6 text-[11px] font-medium rounded-md transition-all flex items-center justify-center cursor-pointer ${
              tab === "theme"
                ? "bg-[#3f3f3f] text-white shadow-sm font-semibold"
                : "text-[#8e8e93] hover:text-white hover:bg-white/5"
            }`}
          >
            Theme
          </button>
        </div>
      </div>

      {/* 3. Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0 space-y-1">
        {/* ========================================================
            TAB 1: DESIGN (Paper Exact Layer & Artboard Tree)
            ======================================================== */}
        {tab === "design" && (
          <div className="space-y-1">
            {/* Page 1 Header Row */}
            <div
              onClick={() => setIsPageExpanded(!isPageExpanded)}
              className="flex items-center justify-between px-1.5 py-1 text-neutral-400 hover:text-white cursor-pointer group rounded"
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="p-0.5 text-neutral-400 group-hover:text-white"
                >
                  {isPageExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
                <span className="text-[11px] font-semibold text-[#ececec]">
                  Page 1
                </span>
                <span className="text-[9px] text-[#8e8e93] font-mono">
                  ({slides.length})
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSlide();
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-opacity"
                title="Add Artboard"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Artboard Rows under Page 1 */}
            {isPageExpanded && (
              <div className="flex flex-col gap-0.5">
                {slides.map((slide, sIdx) => {
                  const isCurrentSlide = activeIndex === sIdx;
                  const isExpanded = expandedSlides[sIdx] ?? true;

                  return (
                    <div key={slide.id} className="flex flex-col">
                      {/* Artboard Header Row: v [ ] 1 */}
                      <div
                        onClick={() => {
                          onSelectSlide(sIdx);
                          onSelectElement(null);
                          onSelectFooter(false);
                        }}
                        className={`flex items-center justify-between px-1.5 py-1 rounded cursor-pointer transition-colors group ${
                          isCurrentSlide && !selectedElement && !isFooterSelected
                            ? "bg-[#3a3a3c] text-white font-medium"
                            : "hover:bg-white/5 text-[#d1d1d6]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <button
                            type="button"
                            onClick={(e) => toggleSlideExpand(sIdx, e)}
                            className="p-0.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown size={11} />
                            ) : (
                              <ChevronRight size={11} />
                            )}
                          </button>

                          {/* Paper Frame Icon: [ ] */}
                          <span className="text-neutral-400 shrink-0">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect
                                x="2"
                                y="2"
                                width="12"
                                height="12"
                                rx="1.5"
                                strokeDasharray="3 2"
                              />
                            </svg>
                          </span>

                          <span className="text-[11px] font-semibold text-neutral-200">
                            {sIdx + 1}
                          </span>

                          <span className="text-[10px] text-[#8e8e93] font-normal truncate max-w-[95px] ml-1">
                            {slide.headline.text
                              ? slide.headline.text.slice(0, 16)
                              : `Slide ${sIdx + 1}`}
                          </span>
                        </div>

                        {/* Hover Actions: Duplicate, Delete */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateSlide(sIdx);
                            }}
                            className="p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                            title="Duplicate artboard"
                          >
                            <Copy size={11} />
                          </button>
                          {slides.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSlide(sIdx);
                              }}
                              className="p-0.5 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                              title="Delete artboard"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Indented Child Layers (Matches Paper hierarchy) */}
                      {isExpanded && (
                        <div className="pl-4 pr-0.5 py-0.5 flex flex-col gap-0.5">
                          {/* 1. Background Layer */}
                          <div
                            onClick={() => {
                              if (!isCurrentSlide) onSelectSlide(sIdx);
                              onSelectElement(null);
                              onSelectFooter(false);
                            }}
                            className="flex items-center justify-between px-2 py-1 rounded text-[11px] text-neutral-300 hover:bg-white/5 cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-neutral-400 shrink-0">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <rect x="2" y="2" width="12" height="12" rx="1.5" />
                                </svg>
                              </span>
                              <span className="truncate">Background</span>
                            </div>
                            <Lock size={10} className="text-neutral-500 shrink-0" />
                          </div>

                          {/* 2. Slide Layers */}
                          {LAYER_ORDER.map((key) => {
                            const elem = slide[key];
                            if (!elem) return null;
                            const isSelected =
                              isCurrentSlide && selectedElement === key;

                            return (
                              <div
                                key={key}
                                onClick={() => {
                                  if (!isCurrentSlide) onSelectSlide(sIdx);
                                  onSelectElement(key);
                                  onSelectFooter(false);
                                }}
                                className={`group/layer flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[#3a3a3c] text-white font-medium"
                                    : "text-neutral-300 hover:bg-white/5"
                                } ${!elem.visible ? "opacity-35" : ""}`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {/* Paper Layer Icons */}
                                  {key === "headline" ||
                                  key === "body" ||
                                  key === "quote" ||
                                  key === "category" ? (
                                    <span className="text-[11px] font-sans font-medium text-neutral-400 w-3.5 text-center shrink-0">
                                      Aa
                                    </span>
                                  ) : key === "featuredImage" || key === "secondaryImage" ? (
                                    <ImageIcon
                                      size={12}
                                      className="text-neutral-400 shrink-0"
                                    />
                                  ) : key === "bullets" ? (
                                    <LayoutGrid
                                      size={12}
                                      className="text-neutral-400 shrink-0"
                                    />
                                  ) : key === "cta" ? (
                                    <MousePointer
                                      size={12}
                                      className="text-neutral-400 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-3 h-3 border border-neutral-400 rounded-sm shrink-0" />
                                  )}

                                  <span className="truncate">
                                    {key === "headline"
                                      ? "Title"
                                      : key === "featuredImage"
                                        ? "Image"
                                        : key === "secondaryImage"
                                          ? "Image 2"
                                        : key === "body"
                                          ? "Text"
                                          : key === "category"
                                            ? "Category"
                                            : key === "quote"
                                              ? "Quote"
                                              : key === "bullets"
                                                ? "Bullets"
                                                : key === "cta"
                                                  ? "Button"
                                                  : key}
                                  </span>
                                </div>

                                {/* Hover Lock & Eye toggles */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/layer:opacity-100 transition-opacity shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isCurrentSlide) onSelectSlide(sIdx);
                                      onToggleLock(key);
                                    }}
                                    className="p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                                    title={elem.locked ? "Unlock layer" : "Lock layer"}
                                  >
                                    {elem.locked ? (
                                      <Lock size={10} className="text-amber-400" />
                                    ) : (
                                      <Unlock size={10} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isCurrentSlide) onSelectSlide(sIdx);
                                      onToggleVisibility(key);
                                    }}
                                    className="p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                                    title={elem.visible ? "Hide layer" : "Show layer"}
                                  >
                                    {elem.visible ? (
                                      <Eye size={10} />
                                    ) : (
                                      <EyeOff size={10} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* 3. Footer Layer */}
                          <div
                            onClick={() => {
                              if (!isCurrentSlide) onSelectSlide(sIdx);
                              onSelectElement(null);
                              onSelectFooter(true);
                            }}
                            className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                              isCurrentSlide && isFooterSelected
                                ? "bg-[#3a3a3c] text-white font-medium"
                                : "text-neutral-300 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[11px] font-sans text-neutral-400 w-3.5 text-center shrink-0">
                                —
                              </span>
                              <span className="truncate">Footer & Brand</span>
                            </div>
                            <Lock size={10} className="text-neutral-500 shrink-0" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paper + Add Page Button */}
            <button
              type="button"
              onClick={onAddSlide}
              className="w-full h-7 rounded-md border border-dashed border-[#3d3d3d] hover:border-neutral-400 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white transition-all flex items-center justify-center gap-1.5 text-[11px] font-medium mt-2 cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Artboard</span>
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 2: THEME (Presets, Formats, and Styles)
            ======================================================== */}
        {tab === "theme" && (
          <div className="space-y-3 px-1">
            {/* Aspect Ratio Format Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8e8e93] block">
                Format Aspect Ratio
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CANVAS_FORMAT_PRESETS.map((preset) => {
                  const isActive = activeFormat.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onFormatChange(preset)}
                      className={`p-2 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#3a3a3c] border-[#555] text-white"
                          : "bg-[#222224] hover:bg-[#28282b] border-[#353535] text-neutral-300"
                      }`}
                    >
                      <span className="text-[10px] font-semibold truncate">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-[#8e8e93] font-mono mt-0.5">
                        {preset.aspectRatio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editorial Layout Templates */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8e8e93] block">
                Editorial Layout Styles
              </span>

              <div className="flex flex-col gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset.id)}
                    className="w-full p-2.5 rounded-lg border border-[#353535] bg-[#222224] hover:bg-[#28282b] hover:border-[#555] text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-neutral-200 group-hover:text-white transition-colors">
                        {preset.name}
                      </span>
                      <Sparkles
                        size={11}
                        className="text-neutral-500 group-hover:text-white"
                      />
                    </div>
                    <span className="text-[9px] text-[#8e8e93] block mt-0.5">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Paper.design Bottom Footer */}
      <div className="h-8 px-3 border-t border-[#353535] bg-[#2a2a2a] flex items-center justify-between text-[11px] text-[#8e8e93] shrink-0">
        <span className="hover:text-white cursor-pointer transition-colors">
          What's new • Feedback
        </span>
        <span className="text-[10px] font-mono text-[#636366]">v2.4</span>
      </div>
    </aside>
  );
};
