"use client";

import React, { useState } from "react";
import {
  Copy,
  Trash2,
  Plus,
  LayoutGrid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  ImageIcon,
  Quote,
  MousePointer,
  FileText,
  Smartphone,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
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
}

const LAYER_ICONS: Record<string, React.ReactNode> = {
  category: <span className="font-mono text-[9px] font-bold text-neutral-400">TAG</span>,
  headline: <span className="font-serif font-bold text-[11px] text-[#38bdf8]">Aa</span>,
  featuredImage: <ImageIcon size={12} className="text-emerald-400" />,
  body: <Type size={12} className="text-neutral-400" />,
  bullets: <LayoutGrid size={12} className="text-neutral-400" />,
  quote: <Quote size={12} className="text-amber-400" />,
  cta: <MousePointer size={12} className="text-purple-400" />,
  logo: <ImageIcon size={12} className="text-neutral-400" />,
  divider: <div className="w-3 h-0.5 bg-neutral-400 rounded" />,
  author: <FileText size={12} className="text-neutral-400" />,
};

const LAYER_ORDER: ElementKey[] = [
  "headline",
  "category",
  "featuredImage",
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
  projectName = "Editorial Carousel",
}) => {
  const [tab, setTab] = useState<"slides" | "layers" | "formats" | "presets">("slides");
  const [expandedSlides, setExpandedSlides] = useState<Record<number, boolean>>({
    [activeIndex]: true,
  });

  const toggleSlideExpand = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSlides((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <aside className="w-[270px] min-w-[270px] h-full flex flex-col bg-[#121316] border-r border-white/[0.08] text-white text-[12px] font-sans select-none z-20 shrink-0 overflow-hidden">
      {/* 1. Paper.design Document Header Capsule */}
      <div className="h-[46px] px-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#15161a]">
        <div className="flex items-center gap-2 bg-[#1b1c22] border border-white/10 rounded-full px-2.5 py-1 max-w-[210px] shadow-sm">
          <div className="w-3.5 h-3.5 rounded bg-[#1687f8]/20 border border-[#1687f8]/40 flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full" />
          </div>
          <span className="text-[11px] font-medium text-neutral-200 truncate tracking-tight">
            {projectName}
          </span>
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0 ml-auto" />
        </div>

        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="h-7 w-7 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Collapse panel"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* 2. Paper.design Compact Segmented Control */}
      <div className="px-2.5 py-2 border-b border-white/[0.06] bg-[#141518]">
        <div className="flex bg-[#18191e] p-0.5 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setTab("slides")}
            className={`flex-1 h-6 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center ${
              tab === "slides"
                ? "bg-[#252834] text-white shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Slides
          </button>
          <button
            type="button"
            onClick={() => setTab("layers")}
            className={`flex-1 h-6 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center ${
              tab === "layers"
                ? "bg-[#252834] text-white shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Layers
          </button>
          <button
            type="button"
            onClick={() => setTab("formats")}
            className={`flex-1 h-6 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center ${
              tab === "formats"
                ? "bg-[#252834] text-white shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Size
          </button>
          <button
            type="button"
            onClick={() => setTab("presets")}
            className={`flex-1 h-6 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center ${
              tab === "presets"
                ? "bg-[#252834] text-white shadow-sm border border-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Styles
          </button>
        </div>
      </div>

      {/* 3. Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2.5 min-h-0 space-y-2">
        {/* ========================================================
            TAB 1: SLIDES LIST (Paper Artboard Cards)
            ======================================================== */}
        {tab === "slides" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Pages ({slides.length})
              </span>
              <button
                type="button"
                onClick={onAddSlide}
                className="flex items-center gap-1 text-[10px] font-medium text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
              >
                <Plus size={11} />
                <span>Add Page</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {slides.map((slide, sIdx) => {
                const isActive = activeIndex === sIdx;
                return (
                  <div
                    key={slide.id}
                    onClick={() => {
                      onSelectSlide(sIdx);
                      onSelectElement(null);
                      onSelectFooter(false);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer group flex flex-col ${
                      isActive
                        ? "bg-[#181a24] border-[#1687f8] shadow-[0_0_12px_rgba(22,135,248,0.25)] ring-1 ring-[#1687f8]/50"
                        : "bg-[#16171c] hover:bg-[#1c1e26] border-white/10"
                    }`}
                  >
                    {/* Visual Artboard Preview Thumbnail */}
                    <div
                      className="w-full h-14 rounded-lg relative overflow-hidden flex flex-col justify-between p-2 mb-1.5 border border-white/10 transition-colors shadow-inner"
                      style={{ backgroundColor: slide.backgroundColor || "#0d0e12" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="w-5 h-1 bg-[#1687f8] rounded-full" />
                        <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-black/40 text-neutral-300 border border-white/10">
                          0{sIdx + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-16 h-1 bg-neutral-400/40 rounded-full" />
                        <div className="w-10 h-0.5 bg-neutral-400/25 rounded-full" />
                      </div>
                      <div className="flex justify-between items-center text-[7px] text-neutral-400 font-mono">
                        <span className="truncate max-w-[80px]">{slide.footer.brandName || "GROWX"}</span>
                        <span>{activeFormat.aspectRatio}</span>
                      </div>
                    </div>

                    {/* Headline Title and Row Actions */}
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[11px] font-medium truncate flex-1 text-neutral-200 group-hover:text-white">
                        {slide.headline.text ? slide.headline.text.slice(0, 26) : `Slide ${sIdx + 1}`}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateSlide(sIdx);
                          }}
                          className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white"
                          title="Duplicate slide"
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
                            className="p-1 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                            title="Delete slide"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onAddSlide}
              className="w-full h-8 rounded-xl border border-dashed border-white/15 hover:border-[#1687f8] bg-[#16171c] hover:bg-[#1c1e26] text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-1.5 text-[10px] font-medium mt-1"
            >
              <Plus size={12} />
              <span>Add New Page</span>
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 2: PAPER NESTED LAYERS TREE
            ======================================================== */}
        {tab === "layers" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Layer Hierarchy
              </span>
              <span className="text-[9px] font-mono text-neutral-500">
                Slide {activeIndex + 1}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {slides.map((slide, sIdx) => {
                const isCurrentSlide = activeIndex === sIdx;
                const isExpanded = expandedSlides[sIdx] ?? isCurrentSlide;

                return (
                  <div key={slide.id} className="flex flex-col">
                    {/* Slide Group Header */}
                    <div
                      onClick={() => {
                        onSelectSlide(sIdx);
                        onSelectElement(null);
                        onSelectFooter(false);
                      }}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all border ${
                        isCurrentSlide
                          ? "bg-[#181a24] border-white/15 text-white font-semibold"
                          : "hover:bg-[#16171c] border-transparent text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => toggleSlideExpand(sIdx, e)}
                          className="p-0.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        <span className="text-[11px] truncate">
                          Slide {sIdx + 1}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono text-neutral-500 bg-[#121316] px-1.5 py-0.5 rounded border border-white/5">
                        {slide.headline.text ? slide.headline.text.slice(0, 12) + "..." : "Artboard"}
                      </span>
                    </div>

                    {/* Children Layers (Shown when expanded) */}
                    {isExpanded && (
                      <div className="pl-3 pr-0.5 py-0.5 flex flex-col gap-0.5 border-l border-white/[0.08] ml-3 mt-0.5">
                        {LAYER_ORDER.map((key) => {
                          const elem = slide[key];
                          if (!elem) return null;
                          const isSelected = isCurrentSlide && selectedElement === key;

                          return (
                            <div
                              key={key}
                              onClick={() => {
                                if (!isCurrentSlide) onSelectSlide(sIdx);
                                onSelectElement(key);
                                onSelectFooter(false);
                              }}
                              className={`group/layer flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-[#0d2238] border-[#1687f8] text-white shadow-sm"
                                  : "hover:bg-[#18191e] border-transparent text-neutral-300"
                              } ${!elem.visible ? "opacity-35" : ""}`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-4 flex items-center justify-center shrink-0">
                                  {LAYER_ICONS[key]}
                                </div>
                                <span className="text-[11px] truncate capitalize font-medium">
                                  {key === "featuredImage" ? "Image" : key}
                                </span>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover/layer:opacity-100 transition-opacity shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isCurrentSlide) onSelectSlide(sIdx);
                                    onToggleLock(key);
                                  }}
                                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                                  title={elem.locked ? "Unlock layer" : "Lock layer"}
                                >
                                  {elem.locked ? (
                                    <Lock size={11} className="text-amber-400" />
                                  ) : (
                                    <Unlock size={11} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isCurrentSlide) onSelectSlide(sIdx);
                                    onToggleVisibility(key);
                                  }}
                                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                                  title={elem.visible ? "Hide layer" : "Show layer"}
                                >
                                  {elem.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Footer & Brand Layer Row */}
                        <div
                          onClick={() => {
                            if (!isCurrentSlide) onSelectSlide(sIdx);
                            onSelectElement(null);
                            onSelectFooter(true);
                          }}
                          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-all border ${
                            isCurrentSlide && isFooterSelected
                              ? "bg-[#0d2238] border-[#1687f8] text-white shadow-sm"
                              : "hover:bg-[#18191e] border-transparent text-neutral-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-4 flex items-center justify-center shrink-0">
                              <FileText size={12} className="text-[#38bdf8]" />
                            </div>
                            <span className="text-[11px] font-medium truncate">Footer & Brand</span>
                          </div>
                          <span className="text-[8px] font-mono text-neutral-500">Lock</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FORMATS & SIZES
            ======================================================== */}
        {tab === "formats" && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block px-1 pb-1">
              Canvas Aspect Ratio
            </span>

            <div className="flex flex-col gap-1.5">
              {CANVAS_FORMAT_PRESETS.map((preset) => {
                const isActive = activeFormat.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onFormatChange(preset)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isActive
                        ? "bg-[#0d2238] border-[#1687f8] text-white shadow-[0_0_12px_rgba(22,135,248,0.25)] ring-1 ring-[#1687f8]/50"
                        : "bg-[#16171c] hover:bg-[#1c1e26] border-white/10 text-neutral-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#101114] border border-white/10 flex items-center justify-center shrink-0 text-[#38bdf8]">
                      <Smartphone size={15} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold truncate">{preset.name}</span>
                        <span className="text-[10px] font-mono font-bold text-neutral-400 bg-[#101114] px-1.5 py-0.5 rounded border border-white/5 shrink-0 ml-1">
                          {preset.aspectRatio}
                        </span>
                      </div>
                      <span className="text-[9px] text-neutral-400 truncate mt-0.5">{preset.badge}</span>
                      <span className="text-[8px] font-mono text-neutral-500">
                        {preset.width} × {preset.height} px
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: PRESETS & THEMES
            ======================================================== */}
        {tab === "presets" && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block px-1 pb-1">
              Editorial Layout Styles
            </span>

            <div className="flex flex-col gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#16171c] hover:bg-[#1c1e26] hover:border-[#1687f8]/50 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-200 group-hover:text-[#38bdf8] transition-colors">
                      {preset.name}
                    </span>
                    <Sparkles size={11} className="text-neutral-500 group-hover:text-[#38bdf8]" />
                  </div>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Status & Hotkey Helper */}
      <div className="h-[34px] px-3 border-t border-white/[0.08] flex items-center justify-between shrink-0 bg-[#141518] text-[9px] font-mono text-neutral-500">
        <span>V: Select • H: Hand</span>
        <span>Auto-saved</span>
      </div>
    </aside>
  );
};
