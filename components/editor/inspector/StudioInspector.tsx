"use client";

import React from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Download,
  Play,
  RotateCcw,
  Type,
  ImageIcon,
  Layers,
  ChevronDown,
  Plus,
  Minus,
  Check,
  LayoutGrid,
  FileText,
} from "lucide-react";
import type { Slide, ElementKey } from "./inspectorTypes";

export interface CanvasPreset {
  id: "carousel" | "mobile" | "square" | "landscape";
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  badge: string;
}

export const CANVAS_FORMAT_PRESETS: CanvasPreset[] = [
  { id: "carousel", name: "4:5 Portrait", width: 1080, height: 1350, aspectRatio: "4:5", badge: "LinkedIn & IG Carousel" },
  { id: "mobile", name: "9:16 Mobile", width: 1080, height: 1920, aspectRatio: "9:16", badge: "Story, Reel & TikTok" },
  { id: "square", name: "1:1 Square", width: 1080, height: 1080, aspectRatio: "1:1", badge: "Standard Feed Post" },
  { id: "landscape", name: "16:9 Banner", width: 1200, height: 675, aspectRatio: "16:9", badge: "Twitter & Web Banner" },
];

const STUDIO_FONTS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Outfit", value: "'Outfit', sans-serif" },
  { name: "SF Mono", value: "'SF Mono', monospace" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Neue Haas", value: "'Neue Haas Grotesk', sans-serif" },
];

const COLOR_SWATCHES = [
  "#ffffff",
  "#000000",
  "#1687f8",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

interface StudioInspectorProps {
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  activeFormat: CanvasPreset;
  slidesCount: number;
  activeIndex: number;
  onSelectElement: (key: ElementKey | null) => void;
  onSelectFooter: (selected: boolean) => void;
  onUpdateElement: (key: ElementKey, updates: any) => void;
  onUpdateFooter: (updates: Partial<Slide["footer"]>) => void;
  onUpdateBackground: (color: string) => void;
  onFormatChange: (preset: CanvasPreset) => void;
  onDownloadPng: () => void;
  onDownloadPdf: () => void;
  onDownloadMp4: () => void;
  onDownloadAllSvg: () => void;
  onClose?: () => void;
}

export const StudioInspector: React.FC<StudioInspectorProps> = ({
  activeSlide,
  selectedElement,
  isFooterSelected,
  activeFormat,
  slidesCount,
  activeIndex,
  onSelectElement,
  onSelectFooter,
  onUpdateElement,
  onUpdateFooter,
  onUpdateBackground,
  onFormatChange,
  onDownloadPng,
  onDownloadPdf,
  onDownloadMp4,
  onDownloadAllSvg,
  onClose,
}) => {
  const currentElement = selectedElement ? activeSlide[selectedElement] : null;
  const isTextType = selectedElement && ["headline", "category", "body", "quote", "cta", "author"].includes(selectedElement);
  const isImageType = selectedElement === "featuredImage";

  // Alignment helpers
  const handleAlign = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (!selectedElement || !currentElement) return;
    const canvasW = activeFormat.width;
    const canvasH = activeFormat.height;

    switch (type) {
      case "left":
        onUpdateElement(selectedElement, { x: 72 });
        break;
      case "center":
        onUpdateElement(selectedElement, { x: Math.round((canvasW - currentElement.width) / 2) });
        break;
      case "right":
        onUpdateElement(selectedElement, { x: canvasW - 72 - currentElement.width });
        break;
      case "top":
        onUpdateElement(selectedElement, { y: 60 });
        break;
      case "middle":
        onUpdateElement(selectedElement, { y: Math.round((canvasH - currentElement.height) / 2) });
        break;
      case "bottom":
        onUpdateElement(selectedElement, { y: canvasH - 70 - currentElement.height });
        break;
    }
  };

  return (
    <aside className="w-[320px] min-w-[320px] h-full flex flex-col bg-[#111214] border-l border-white/[0.08] text-white text-[12px] font-sans select-none z-20 shrink-0 overflow-hidden">
      {/* 1. Header Bar */}
      <div className="h-[42px] px-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#141518]">
        <div className="flex items-center gap-2 truncate">
          <div className="w-2 h-2 rounded-full bg-[#1687f8]" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-200 truncate">
            {isFooterSelected
              ? "Footer & Branding"
              : selectedElement
                ? `Layer: ${selectedElement}`
                : `Slide ${activeIndex + 1} Settings`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedElement && currentElement && (
            <>
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement, { locked: !currentElement.locked })}
                className={`p-1 rounded-md hover:bg-[#202128] transition-colors ${currentElement.locked ? "text-amber-400" : "text-neutral-400"}`}
                title={currentElement.locked ? "Unlock layer" : "Lock layer"}
              >
                {currentElement.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement, { visible: !currentElement.visible })}
                className={`p-1 rounded-md hover:bg-[#202128] transition-colors ${!currentElement.visible ? "text-neutral-500" : "text-neutral-400"}`}
                title="Toggle visibility"
              >
                {currentElement.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[#202128] text-neutral-400 hover:text-white transition-colors"
              title="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06] p-3 space-y-3">
        {/* ========================================================
            SCENARIO A: AN ELEMENT IS SELECTED ON CANVAS
            ======================================================== */}
        {selectedElement && currentElement && (
          <>
            {/* Transform & Geometry */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                Position & Size
              </span>

              {/* 2x2 X, Y, W, H grid */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 font-mono w-4">X</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.x)}
                    onChange={(e) => onUpdateElement(selectedElement, { x: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                </div>
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 font-mono w-4">Y</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.y)}
                    onChange={(e) => onUpdateElement(selectedElement, { y: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                </div>
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 font-mono w-4">W</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.width)}
                    onChange={(e) => onUpdateElement(selectedElement, { width: Math.max(40, Number(e.target.value)) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                </div>
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 font-mono w-4">H</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.height)}
                    onChange={(e) => onUpdateElement(selectedElement, { height: Math.max(20, Number(e.target.value)) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                </div>
              </div>

              {/* Rotation & Align Strip */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8] flex-1">
                  <span className="text-[10px] text-neutral-500 font-mono">∠</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.rotation || 0)}
                    onChange={(e) => onUpdateElement(selectedElement, { rotation: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500 ml-0.5">°</span>
                </div>

                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => handleAlign("left")}
                    className="p-1 hover:bg-[#202128] rounded text-neutral-400 hover:text-white transition-colors"
                    title="Align Left"
                  >
                    ⇤
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign("center")}
                    className="p-1 hover:bg-[#202128] rounded text-neutral-400 hover:text-white transition-colors"
                    title="Align Center"
                  >
                    ⬌
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign("right")}
                    className="p-1 hover:bg-[#202128] rounded text-neutral-400 hover:text-white transition-colors"
                    title="Align Right"
                  >
                    ⇥
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign("middle")}
                    className="p-1 hover:bg-[#202128] rounded text-neutral-400 hover:text-white transition-colors"
                    title="Align Middle"
                  >
                    ⬍
                  </button>
                </div>
              </div>
            </div>

            {/* Typography Section (If Text Layer) */}
            {isTextType && (
              <div className="pt-3 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Typography & Style
                </span>

                {/* Direct Text Editor Input */}
                {(currentElement as any).text !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400">Content</label>
                    <textarea
                      rows={3}
                      value={(currentElement as any).text}
                      onChange={(e) => onUpdateElement(selectedElement, { text: e.target.value })}
                      className="w-full bg-[#18191d] border border-white/10 rounded-md p-2 text-[11px] font-medium text-neutral-200 focus:outline-none focus:border-[#1687f8] resize-none"
                    />
                  </div>
                )}

                {/* Font Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Font Family</label>
                  <select
                    value={currentElement.fontFamily}
                    onChange={(e) => onUpdateElement(selectedElement, { fontFamily: e.target.value })}
                    className="w-full bg-[#18191d] border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-200 focus:outline-none focus:border-[#1687f8]"
                  >
                    {STUDIO_FONTS.map((f) => (
                      <option key={f.name} value={f.value} className="bg-neutral-900 text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400">Size</label>
                    <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1">
                      <input
                        type="number"
                        value={currentElement.fontSize}
                        onChange={(e) => onUpdateElement(selectedElement, { fontSize: Number(e.target.value) })}
                        className="w-full bg-transparent font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                      />
                      <span className="text-[10px] text-neutral-500">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400">Weight</label>
                    <select
                      value={currentElement.fontWeight}
                      onChange={(e) => onUpdateElement(selectedElement, { fontWeight: e.target.value })}
                      className="w-full bg-[#18191d] border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-200 focus:outline-none"
                    >
                      <option value="400" className="bg-neutral-900">Regular (400)</option>
                      <option value="600" className="bg-neutral-900">Medium (600)</option>
                      <option value="700" className="bg-neutral-900">Bold (700)</option>
                      <option value="900" className="bg-neutral-900">Black (900)</option>
                    </select>
                  </div>
                </div>

                {/* Alignment & Uppercase */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex bg-[#18191d] border border-white/10 rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "left" })}
                      className={`p-1.5 rounded transition-colors ${currentElement.align === "left" ? "bg-[#22242c] text-white" : "text-neutral-400 hover:text-white"}`}
                      title="Align Left"
                    >
                      <AlignLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "center" })}
                      className={`p-1.5 rounded transition-colors ${currentElement.align === "center" ? "bg-[#22242c] text-white" : "text-neutral-400 hover:text-white"}`}
                      title="Align Center"
                    >
                      <AlignCenter size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "right" })}
                      className={`p-1.5 rounded transition-colors ${currentElement.align === "right" ? "bg-[#22242c] text-white" : "text-neutral-400 hover:text-white"}`}
                      title="Align Right"
                    >
                      <AlignRight size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { uppercase: !currentElement.uppercase })}
                    className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      currentElement.uppercase
                        ? "bg-[#0d2238] border-[#1687f8] text-[#1687f8]"
                        : "bg-[#18191d] hover:bg-[#202128] border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    AA Uppercase
                  </button>
                </div>
              </div>
            )}

            {/* Image Section (If Image Layer) */}
            {isImageType && (
              <div className="pt-3 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Media & Framing
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Media URL</label>
                  <input
                    type="text"
                    value={(currentElement as any).mediaUrl || ""}
                    onChange={(e) => onUpdateElement(selectedElement, { mediaUrl: e.target.value })}
                    placeholder="https://... image or video URL"
                    className="w-full bg-[#18191d] border border-white/10 rounded-md p-2 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-[#1687f8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400">Fit Mode</label>
                    <select
                      value={(currentElement as any).objectFit || "cover"}
                      onChange={(e) => onUpdateElement(selectedElement, { objectFit: e.target.value })}
                      className="w-full bg-[#18191d] border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-200 focus:outline-none"
                    >
                      <option value="cover" className="bg-neutral-900">Cover</option>
                      <option value="contain" className="bg-neutral-900">Contain</option>
                      <option value="fill" className="bg-neutral-900">Fill</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400">Corner Radius</label>
                    <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1">
                      <input
                        type="number"
                        value={(currentElement as any).borderRadius || 0}
                        onChange={(e) => onUpdateElement(selectedElement, { borderRadius: Number(e.target.value) })}
                        className="w-full bg-transparent font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                      />
                      <span className="text-[10px] text-neutral-500">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Colors & Appearance Section */}
            <div className="pt-3 space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                Color & Appearance
              </span>

              {/* Swatch chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { color: hex })}
                    className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition-transform relative"
                    style={{ backgroundColor: hex }}
                  >
                    {currentElement.color?.toLowerCase() === hex.toLowerCase() && (
                      <Check size={10} className={hex === "#ffffff" ? "text-black mx-auto" : "text-white mx-auto"} />
                    )}
                  </button>
                ))}
              </div>

              {/* Hex and Opacity */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 mr-1 font-mono">#</span>
                  <input
                    type="text"
                    value={(currentElement.color || "#000000").replace("#", "")}
                    onChange={(e) => onUpdateElement(selectedElement, { color: `#${e.target.value}` })}
                    className="w-full bg-transparent font-mono text-[11px] font-bold focus:outline-none uppercase text-neutral-200"
                  />
                </div>

                <div className="flex items-center bg-[#18191d] border border-white/10 rounded-md px-2 py-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-neutral-500 mr-1">Opacity</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round((currentElement.opacity ?? 1) * 100)}
                    onChange={(e) => onUpdateElement(selectedElement, { opacity: Number(e.target.value) / 100 })}
                    className="w-full bg-transparent text-right font-mono text-[11px] font-bold focus:outline-none text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500 ml-0.5">%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================
            SCENARIO B: FOOTER IS SELECTED
            ======================================================== */}
        {isFooterSelected && (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
              Branding & Frame Line
            </span>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Brand Tag</label>
              <input
                type="text"
                value={activeSlide.footer.brandName}
                onChange={(e) => onUpdateFooter({ brandName: e.target.value })}
                placeholder="e.g. GROWXLABS"
                className="w-full bg-[#18191d] border border-white/10 rounded-md p-2 text-[11px] font-bold uppercase text-neutral-200 focus:outline-none focus:border-[#1687f8]"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-center justify-between p-2 rounded-md bg-[#18191d] border border-white/10 cursor-pointer hover:bg-[#202128] transition-colors">
                <span className="text-[11px] text-neutral-300">Top Divider Line</span>
                <input
                  type="checkbox"
                  checked={activeSlide.footer.dividerEnabled !== false}
                  onChange={(e) => onUpdateFooter({ dividerEnabled: e.target.checked })}
                  className="rounded accent-[#1687f8]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-md bg-[#18191d] border border-white/10 cursor-pointer hover:bg-[#202128] transition-colors">
                <span className="text-[11px] text-neutral-300">Page Number Indicator</span>
                <input
                  type="checkbox"
                  checked={activeSlide.footer.pageNumberEnabled !== false}
                  onChange={(e) => onUpdateFooter({ pageNumberEnabled: e.target.checked })}
                  className="rounded accent-[#1687f8]"
                />
              </label>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENARIO C: DOCUMENT VIEW (NO ELEMENT SELECTED)
            ======================================================== */}
        {!selectedElement && !isFooterSelected && (
          <div className="space-y-4">
            {/* Post Format Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                Post Target Format
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                {CANVAS_FORMAT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onFormatChange(preset)}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      activeFormat.id === preset.id
                        ? "bg-[#0d2238] border-[#1687f8] text-white shadow-sm"
                        : "bg-[#18191d] hover:bg-[#202128] border-white/10 text-neutral-300"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">{preset.name}</span>
                      <span className="text-[9px] text-neutral-400">{preset.badge}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 font-semibold bg-[#101114] px-1.5 py-0.5 rounded border border-white/5">
                      {preset.width}x{preset.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Canvas Background Color */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Canvas Background
                </span>
                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                  {activeSlide.backgroundColor || "#ffffff"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {["#ffffff", "#000000", "#0a0a0c", "#18181b", "#0f172a", "#f8fafc", "#fdfbf7"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateBackground(hex)}
                    className="w-6 h-6 rounded-md border border-white/20 hover:scale-105 transition-transform relative"
                    style={{ backgroundColor: hex }}
                  >
                    {activeSlide.backgroundColor?.toLowerCase() === hex.toLowerCase() && (
                      <Check size={11} className={hex === "#ffffff" || hex === "#f8fafc" || hex === "#fdfbf7" ? "text-black mx-auto" : "text-white mx-auto"} />
                    )}
                  </button>
                ))}

                {/* Custom Native Color Picker */}
                <label
                  className="w-6 h-6 rounded-md border border-white/20 bg-[#18191d] hover:bg-[#202128] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 relative"
                  title="Pick custom canvas background"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 shadow-sm" />
                  <input
                    type="color"
                    value={activeSlide.backgroundColor?.startsWith("#") ? activeSlide.backgroundColor : "#ffffff"}
                    onChange={(e) => onUpdateBackground(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* High-Resolution Exports */}
            <div className="pt-3 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                One-Click Exports
              </span>

              <button
                type="button"
                onClick={onDownloadPng}
                className="w-full h-8 bg-[#1687f8] hover:bg-[#1374d6] text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={13} />
                <span>Download Current Slide (PNG)</span>
              </button>

              <button
                type="button"
                onClick={onDownloadPdf}
                className="w-full h-8 bg-[#18191d] hover:bg-[#202128] border border-white/10 text-neutral-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-2"
              >
                <FileText size={13} />
                <span>Export Full PDF ({slidesCount} Slides)</span>
              </button>

              <button
                type="button"
                onClick={onDownloadMp4}
                className="w-full h-8 bg-[#18191d] hover:bg-[#202128] border border-white/10 text-neutral-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Play size={13} />
                <span>Render MP4 Video Reel</span>
              </button>

              <button
                type="button"
                onClick={onDownloadAllSvg}
                className="w-full h-7 bg-transparent hover:bg-white/5 border border-white/5 text-neutral-400 hover:text-white rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>Export All Vector SVGs</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

