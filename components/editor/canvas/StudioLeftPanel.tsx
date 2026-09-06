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
  Upload,
  Play,
  Video,
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
  uploadedAssets?: Array<{ id: string; name: string; url: string; type: "video" | "image" }>;
  onUploadAssets?: (files: FileList | File[]) => void;
  onSetVideoBackground?: (url: string) => void;
  onAddOverlayImage?: (url: string) => void;
  onApplyImageSizePreset?: (preset: "badge" | "card" | "hero" | "split") => void;
  onDeleteAsset?: (id: string) => void;
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
  uploadedAssets = [],
  onUploadAssets,
  onSetVideoBackground,
  onAddOverlayImage,
  onApplyImageSizePreset,
  onDeleteAsset,
}) => {
  const [tab, setTab] = useState<"design" | "theme" | "assets">("design");
  const [isPageExpanded, setIsPageExpanded] = useState(true);
  const [expandedSlides, setExpandedSlides] = useState<Record<number, boolean>>({
    0: true,
  });

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    if (isFileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFileMenuOpen]);

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
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Direct Return to Admin Button */}
          <Link
            href="/admin"
            className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft size={13} />
          </Link>

          {/* Paper Document Icon with Menu */}
          <div ref={fileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsFileMenuOpen((prev) => !prev)}
              className={`p-1 rounded-md hover:bg-white/10 ${isFileMenuOpen ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"} transition-colors flex items-center justify-center cursor-pointer`}
              title="File Menu • Database Projects & Actions"
            >
              <FolderOpen size={13} />
            </button>

            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#242426] border border-[#383838] rounded-xl shadow-2xl py-1.5 z-50 text-[11px] font-medium text-neutral-200 divide-y divide-white/5 animate-in fade-in duration-100">
                <div className="py-1">
                  {onOpenProjectsDrawer && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenProjectsDrawer();
                        setIsFileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <FolderOpen size={12} className="text-neutral-400" />
                      <span>Open Database Projects</span>
                    </button>
                  )}
                  {onCreateNewProject && (
                    <button
                      type="button"
                      onClick={() => {
                        onCreateNewProject();
                        setIsFileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus size={12} className="text-neutral-400" />
                      <span>New Carousel Project</span>
                    </button>
                  )}
                  {onSaveToDatabase && (
                    <button
                      type="button"
                      onClick={() => {
                        onSaveToDatabase();
                        setIsFileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <CloudUpload size={12} className="text-neutral-400" />
                      <span>Save to Database (Ctrl+S)</span>
                    </button>
                  )}
                </div>
                <div className="py-1">
                  <Link
                    href="/admin"
                    onClick={() => setIsFileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors font-semibold cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Return to Admin</span>
                  </Link>
                </div>
              </div>
            )}
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
          <button
            type="button"
            onClick={() => setTab("assets")}
            className={`flex-1 h-6 text-[11px] font-medium rounded-md transition-all flex items-center justify-center cursor-pointer ${
              tab === "assets"
                ? "bg-[#3f3f3f] text-white shadow-sm font-semibold"
                : "text-[#8e8e93] hover:text-white hover:bg-white/5"
            }`}
          >
            Assets
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

        {/* ========================================================
            TAB 3: REELS & MEDIA ASSETS (Video & Graphic Overlays)
            ======================================================== */}
        {tab === "assets" && (
          <div className="space-y-3.5 py-1">
            {/* Header & Quick Action */}
            <div className="px-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                  Reel & Slide Assets
                </span>
                <span className="text-[9px] font-mono text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded">
                  {uploadedAssets?.length || 0} Assets
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-snug">
                Drop your phone talking video or diagrams here, then drag onto the canvas.
              </p>
            </div>

            {/* Upload Dropzone */}
            <div className="px-1.5">
              <label className="border border-dashed border-[#444] hover:border-[#1687f8] bg-[#222224] hover:bg-[#252528] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all group">
                <input
                  type="file"
                  multiple
                  accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && onUploadAssets) {
                      onUploadAssets(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#1687f8]/10 text-neutral-400 group-hover:text-[#1687f8] flex items-center justify-center transition-colors">
                  <Upload size={14} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-200 block group-hover:text-white">
                    Upload Video or Images
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    .MP4, .MOV, .PNG, .JPG, .SVG
                  </span>
                </div>
              </label>
            </div>

            {/* Overlay Sizing Presets for Active Slide */}
            <div className="px-1.5 space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Overlay Card Sizing
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => onApplyImageSizePreset?.("badge")}
                  className="px-2 py-1.5 rounded-lg bg-[#222224] hover:bg-[#2c2c30] text-neutral-300 hover:text-white border border-[#353535] text-left transition-all cursor-pointer flex items-center justify-between"
                  title="30% Mini Badge in Corner"
                >
                  <span>30% Badge</span>
                  <span className="text-[9px] text-neutral-500 font-mono">Corner</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApplyImageSizePreset?.("card")}
                  className="px-2 py-1.5 rounded-lg bg-[#222224] hover:bg-[#2c2c30] text-[#1687f8] hover:text-white border border-[#353535] text-left transition-all cursor-pointer flex items-center justify-between font-semibold"
                  title="60% Modern Floating Card"
                >
                  <span>60% Card</span>
                  <span className="text-[9px] text-[#1687f8] font-mono">Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApplyImageSizePreset?.("hero")}
                  className="px-2 py-1.5 rounded-lg bg-[#222224] hover:bg-[#2c2c30] text-neutral-300 hover:text-white border border-[#353535] text-left transition-all cursor-pointer flex items-center justify-between"
                  title="85% Spotlight Hero"
                >
                  <span>85% Hero</span>
                  <span className="text-[9px] text-neutral-500 font-mono">Focus</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApplyImageSizePreset?.("split")}
                  className="px-2 py-1.5 rounded-lg bg-[#222224] hover:bg-[#2c2c30] text-neutral-300 hover:text-white border border-[#353535] text-left transition-all cursor-pointer flex items-center justify-between"
                  title="Upper 50% Split Frame"
                >
                  <span>Split Top</span>
                  <span className="text-[9px] text-neutral-500 font-mono">Half</span>
                </button>
              </div>
            </div>

            {/* Uploaded Assets List */}
            <div className="px-1.5 space-y-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Project Assets
              </span>

              {(!uploadedAssets || uploadedAssets.length === 0) ? (
                <div className="p-4 rounded-xl bg-[#222224]/60 border border-[#333] text-center space-y-1 text-neutral-500">
                  <span className="text-[11px] block font-medium">No media uploaded yet</span>
                  <span className="text-[9px] block">Upload your talking video or diagrams above to get started</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/growx-asset", JSON.stringify(asset));
                        e.dataTransfer.setData("text/plain", asset.url);
                      }}
                      className="p-2 rounded-xl bg-[#222224] border border-[#353535] hover:border-[#555] space-y-2 transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {asset.type === "video" ? (
                            <video
                              src={asset.url}
                              className="w-full h-full object-cover pointer-events-none"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-medium text-neutral-200 block truncate group-hover:text-white">
                            {asset.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-neutral-500 block">
                            {asset.type === "video" ? "Video (9:16 Reel)" : "Graphic Asset"}
                          </span>
                        </div>
                        {onDeleteAsset && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAsset(asset.id);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete Asset"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {/* Quick Apply Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {asset.type === "video" ? (
                          <button
                            type="button"
                            onClick={() => onSetVideoBackground?.(asset.url)}
                            className="flex-1 py-1 px-2 rounded-md bg-[#1687f8] hover:bg-[#1376dc] text-white text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Video size={11} />
                            <span>Set 9:16 Background</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddOverlayImage?.(asset.url)}
                            className="flex-1 py-1 px-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ImageIcon size={11} />
                            <span>Add as Overlay Card</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
