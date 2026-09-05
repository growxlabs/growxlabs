"use client";

import React, { useState } from "react";
import {
  Layers,
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
}

const LAYER_ICONS: Record<string, React.ReactNode> = {
  category: <Type size={12} className="text-neutral-400" />,
  headline: <Type size={12} className="text-[#1687f8]" />,
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
}) => {
  const [tab, setTab] = useState<"slides" | "layers" | "formats" | "presets">("slides");

  return (
    <aside className="w-[260px] min-w-[260px] h-full flex flex-col bg-[#121316] border-r border-white/[0.08] text-white text-[12px] font-sans select-none z-20 shrink-0 overflow-hidden">
      {/* 1. Top Tabs Bar */}
      <div className="h-[42px] px-2 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#141518]">
        <div className="flex bg-[#18191d] p-0.5 rounded-md border border-white/10 flex-1 mr-1.5">
          <button
            type="button"
            onClick={() => setTab("slides")}
            className={`flex-1 h-6 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center ${
              tab === "slides"
                ? "bg-[#1687f8] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Slides
          </button>
          <button
            type="button"
            onClick={() => setTab("layers")}
            className={`flex-1 h-6 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center ${
              tab === "layers"
                ? "bg-[#1687f8] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Layers
          </button>
          <button
            type="button"
            onClick={() => setTab("formats")}
            className={`flex-1 h-6 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center ${
              tab === "formats"
                ? "bg-[#1687f8] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Size
          </button>
          <button
            type="button"
            onClick={() => setTab("presets")}
            className={`flex-1 h-6 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center ${
              tab === "presets"
                ? "bg-[#1687f8] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Styles
          </button>
        </div>

        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="h-6 w-6 rounded hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Collapse left panel"
          >
            <ChevronLeft size={13} />
          </button>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 min-h-0 space-y-2">
        {/* ========================================================
            TAB 1: SLIDES LIST
            ======================================================== */}
        {tab === "slides" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Deck ({slides.length} Slides)
              </span>
              <button
                type="button"
                onClick={onAddSlide}
                className="flex items-center gap-1 text-[10px] font-bold text-[#1687f8] hover:text-[#38bdf8] transition-colors"
              >
                <Plus size={11} />
                <span>Add Slide</span>
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
                    className={`p-2 rounded-lg border transition-all cursor-pointer group flex flex-col ${
                      isActive
                        ? "bg-[#0d2238] border-[#1687f8] shadow-sm shadow-[#1687f8]/20"
                        : "bg-[#18191d] hover:bg-[#202128] border-white/10"
                    }`}
                  >
                    {/* Mini Visual Preview Card */}
                    <div
                      className="w-full h-12 rounded relative overflow-hidden flex flex-col justify-between p-1.5 mb-1.5 border border-white/10 transition-colors"
                      style={{ backgroundColor: slide.backgroundColor || "#0a0b0d" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="w-4 h-0.5 bg-[#1687f8] rounded-full" />
                        <span className="text-[8px] font-mono font-bold text-neutral-400">
                          {sIdx + 1}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="w-12 h-0.5 bg-neutral-400/30 rounded-full" />
                        <div className="w-8 h-0.5 bg-neutral-400/20 rounded-full" />
                      </div>
                      <div className="flex justify-between items-center text-[7px] text-neutral-400 font-mono">
                        <span>{slide.footer.brandName || "GROWX"}</span>
                        <span>0{sIdx + 1}</span>
                      </div>
                    </div>

                    {/* Headline and Quick Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold truncate flex-1 text-neutral-200 group-hover:text-white">
                        {slide.headline.text ? slide.headline.text.slice(0, 28) : `Slide ${sIdx + 1}`}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateSlide(sIdx);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
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
                            className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
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
              className="w-full h-8 rounded-lg border border-dashed border-white/15 hover:border-[#1687f8] bg-[#18191d] hover:bg-[#202128] text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold"
            >
              <Plus size={12} />
              <span>Add New Slide</span>
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 2: LAYERS TREE
            ======================================================== */}
        {tab === "layers" && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b border-white/[0.06]">
              Active Slide Layers
            </span>

            <div className="flex flex-col gap-1">
              {LAYER_ORDER.map((key) => {
                const elem = activeSlide[key];
                if (!elem) return null;
                const isSelected = selectedElement === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      onSelectElement(key);
                      onSelectFooter(false);
                    }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#0d2238] border-[#1687f8] text-white"
                        : "bg-[#18191d] hover:bg-[#202128] border-transparent text-neutral-300"
                    } ${!elem.visible ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {LAYER_ICONS[key]}
                      <span className="text-[11px] font-medium truncate capitalize">
                        {key === "featuredImage" ? "Featured Image" : key}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(key);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                      >
                        {elem.locked ? <Lock size={11} className="text-amber-400" /> : <Unlock size={11} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(key);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                      >
                        {elem.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Footer Layer Row */}
              <div
                onClick={() => {
                  onSelectElement(null);
                  onSelectFooter(true);
                }}
                className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-all border ${
                  isFooterSelected
                    ? "bg-[#0d2238] border-[#1687f8] text-white"
                    : "bg-[#18191d] hover:bg-[#202128] border-transparent text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText size={12} className="text-[#38bdf8]" />
                  <span className="text-[11px] font-medium truncate">Footer / Brand</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-500">Locked</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FORMATS & SIZES (Clean Dark Cards, No Light Parts)
            ======================================================== */}
        {tab === "formats" && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b border-white/[0.06]">
              Mobile & Social Presets
            </span>

            <div className="flex flex-col gap-1.5">
              {CANVAS_FORMAT_PRESETS.map((preset) => {
                const isActive = activeFormat.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onFormatChange(preset)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      isActive
                        ? "bg-[#0d2238] border-[#1687f8] text-white shadow-sm shadow-[#1687f8]/20"
                        : "bg-[#18191d] hover:bg-[#202128] border-white/10 text-neutral-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-md bg-[#101114] border border-white/10 flex items-center justify-center shrink-0 text-[#1687f8]">
                      <Smartphone size={15} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate">{preset.name}</span>
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
            TAB 4: PRESETS GALLERY
            ======================================================== */}
        {tab === "presets" && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b border-white/[0.06]">
              Slide Layout Styles
            </span>

            <div className="flex flex-col gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className="w-full p-2 rounded-lg border border-white/10 bg-[#18191d] hover:bg-[#202128] hover:border-[#1687f8]/50 text-left transition-all group"
                >
                  <span className="text-[11px] font-bold text-neutral-200 group-hover:text-[#1687f8] block">
                    {preset.name}
                  </span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
