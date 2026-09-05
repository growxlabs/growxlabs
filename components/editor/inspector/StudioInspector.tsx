"use client";

import React, { useState, useEffect } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Play,
  Type,
  ImageIcon,
  Check,
  FileText,
  Smartphone,
  ChevronDown,
  Link2,
  Sliders,
  Sparkles,
  Undo,
  Redo,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import type { Slide, ElementKey } from "./inspectorTypes";
import { toast } from "sonner";
import { StudioDropdown } from "./StudioDropdown";

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
  projectName?: string;
  onUpdateProjectName?: (name: string) => void;
  documentKind?: "editorial" | "product";
  onSwitchDocumentKind?: (kind: "editorial" | "product") => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onShare?: () => void;
  zoomScale?: number;
  onSetZoomScale?: (zoom: number) => void;
  onZoomFit?: () => void;
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
  projectName,
  onUpdateProjectName,
  documentKind,
  onSwitchDocumentKind,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShare,
  zoomScale = 0.45,
  onSetZoomScale,
  onZoomFit,
}) => {
  const [fillMode, setFillMode] = useState<"solid" | "gradient" | "image">("solid");
  const [aspectLocked, setAspectLocked] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName || "");
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showAlignMore, setShowAlignMore] = useState(false);
  const [flexExpanded, setFlexExpanded] = useState(true);
  const [outlineActive, setOutlineActive] = useState(false);
  const [activeConstraintH, setActiveConstraintH] = useState<"left" | "center" | "right">("left");
  const [activeConstraintV, setActiveConstraintV] = useState<"top" | "center" | "bottom">("top");
  const [blendMode, setBlendMode] = useState<string>("normal");
  const [outlinePosition, setOutlinePosition] = useState<string>("inside");
  const [activeFlexPos, setActiveFlexPos] = useState<[number, number]>([1, 1]); // [row, col] center default

  useEffect(() => {
    setTempName(projectName || "");
  }, [projectName]);

  // Global Ctrl+L shortcut to copy link
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        handleCopyLink();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyLink = () => {
    if (onShare) {
      onShare();
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Project link copied to clipboard!");
    }
  };

  const currentElement = selectedElement ? activeSlide[selectedElement] : null;
  const isTextType =
    selectedElement && ["headline", "category", "body", "quote", "cta", "author"].includes(selectedElement);
  const isImageType = selectedElement === "featuredImage";

  // 1:1 Paper Alignment Handlers
  const handleAlign = (type: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => {
    if (!selectedElement || !currentElement) return;
    const canvasW = activeFormat.width;
    const canvasH = activeFormat.height;

    switch (type) {
      case "left":
        onUpdateElement(selectedElement, { x: 72 });
        break;
      case "hcenter":
        onUpdateElement(selectedElement, { x: Math.round((canvasW - currentElement.width) / 2) });
        break;
      case "right":
        onUpdateElement(selectedElement, { x: canvasW - 72 - currentElement.width });
        break;
      case "top":
        onUpdateElement(selectedElement, { y: 60 });
        break;
      case "vcenter":
        onUpdateElement(selectedElement, { y: Math.round((canvasH - currentElement.height) / 2) });
        break;
      case "bottom":
        onUpdateElement(selectedElement, { y: canvasH - 70 - currentElement.height });
        break;
    }
  };

  // Matrix positioning handler for 3x3 Flex Grid
  const handleFlexMatrixClick = (row: number, col: number) => {
    if (!selectedElement || !currentElement) return;
    setActiveFlexPos([row, col]);
    const canvasW = activeFormat.width;
    const canvasH = activeFormat.height;

    let targetX = currentElement.x;
    let targetY = currentElement.y;

    if (col === 0) targetX = 72;
    else if (col === 1) targetX = Math.round((canvasW - currentElement.width) / 2);
    else if (col === 2) targetX = canvasW - 72 - currentElement.width;

    if (row === 0) targetY = 60;
    else if (row === 1) targetY = Math.round((canvasH - currentElement.height) / 2);
    else if (row === 2) targetY = canvasH - 70 - currentElement.height;

    onUpdateElement(selectedElement, { x: targetX, y: targetY });
  };

  return (
    <aside className="w-[280px] min-w-[280px] h-full flex flex-col bg-[#2a2a2a] border-l border-[#353535] text-white text-[11px] font-sans select-none z-20 shrink-0 overflow-hidden">
      {/* ----------------------------------------------------
          1. PAPER.DESIGN TOP BAR (42px)
          Avatar • Document Name • Zoom % • Collapse Toggle
          ---------------------------------------------------- */}
      <div className="h-[42px] px-3 border-b border-[#353535] flex items-center justify-between shrink-0 bg-[#2a2a2a] gap-1.5">
        {/* Left: User Avatar & Live Indicator & Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Avatar Circle with Initial */}
          <div
            className="w-5 h-5 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm"
            title="GrowXLabs Workspace"
          >
            S
          </div>

          {/* Project Title Capsule */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (onUpdateProjectName && tempName.trim()) {
                    onUpdateProjectName(tempName.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                    if (onUpdateProjectName && tempName.trim()) {
                      onUpdateProjectName(tempName.trim());
                    }
                  }
                }}
                autoFocus
                className="bg-[#373737] border border-[#1687f8] rounded px-1.5 py-0.5 text-[11px] font-medium text-white focus:outline-none w-full"
              />
            ) : (
              <span
                onDoubleClick={() => setIsEditingName(true)}
                className="font-medium text-[11px] text-[#ececec] truncate tracking-tight hover:text-white cursor-pointer"
                title="Double click to rename project"
              >
                {projectName || "Untitled"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Zoom Level % and Panel Collapse */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Zoom % Pill with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-[11px] font-medium text-[#ececec] hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
              title="Canvas Zoom Options"
            >
              <span>{Math.round(zoomScale * 100)}%</span>
            </button>

            {showZoomMenu && (
              <div
                className="absolute top-full right-0 mt-1 w-28 bg-[#242426] border border-[#383838] rounded-lg shadow-2xl py-1 z-50 text-[11px] font-medium text-neutral-200"
                onMouseLeave={() => setShowZoomMenu(false)}
              >
                {onZoomFit && (
                  <button
                    type="button"
                    onClick={() => {
                      onZoomFit();
                      setShowZoomMenu(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Zoom to Fit</span>
                    <span className="text-[9px] text-neutral-400 font-mono">Fit</span>
                  </button>
                )}
                <div className="h-px bg-white/5 my-1" />
                {[
                  { label: "50%", val: 0.5 },
                  { label: "100%", val: 1.0 },
                  { label: "200%", val: 2.0 },
                ].map((z) => (
                  <button
                    key={z.label}
                    type="button"
                    onClick={() => {
                      if (onSetZoomScale) onSetZoomScale(z.val);
                      setShowZoomMenu(false);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{z.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paper.design Right Sidebar Collapse Icon [ |] */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Collapse inspector panel"
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
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M11 2v12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          2. ACTION ROW: "Copy link Ctrl + L" & Mode Pill
          ---------------------------------------------------- */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#353535] space-y-2 shrink-0 bg-[#2a2a2a]">
        {/* Paper Full-Width Action Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="h-[30px] w-full bg-[#373737] hover:bg-[#404040] active:bg-[#323232] text-[#ececec] text-[11px] font-medium rounded-lg flex items-center justify-center gap-1.5 border border-[#48484a]/40 cursor-pointer shadow-sm transition-all select-none"
          title="Copy Link (Ctrl + L)"
        >
          <span>Copy link</span>
          <span className="text-[10px] text-[#8e8e93] font-mono ml-0.5">Ctrl + L</span>
        </button>

        {/* Secondary Template / Mode Segmented Pill */}
        {onSwitchDocumentKind && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex bg-[#1f1f21] p-0.5 rounded-lg border border-[#383838] flex-1">
              <button
                type="button"
                onClick={() => onSwitchDocumentKind("editorial")}
                className={`flex-1 h-5 text-[9px] font-medium tracking-wide rounded transition-all flex items-center justify-center cursor-pointer ${
                  documentKind === "editorial"
                    ? "bg-[#3a3a3c] text-white shadow-sm font-semibold"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                Daily News
              </button>
              <button
                type="button"
                onClick={() => onSwitchDocumentKind("product")}
                className={`flex-1 h-5 text-[9px] font-medium tracking-wide rounded transition-all flex items-center justify-center cursor-pointer ${
                  documentKind === "product"
                    ? "bg-[#3a3a3c] text-[#38bdf8] shadow-sm font-semibold"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                Product
              </button>
            </div>

            {/* Selection Tag Pill */}
            <span className="text-[9px] font-mono text-[#8e8e93] uppercase bg-[#1f1f21] px-2 py-0.5 rounded border border-[#383838] shrink-0">
              {isFooterSelected
                ? "Footer"
                : selectedElement
                  ? selectedElement
                  : `Slide ${activeIndex + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          3. SCROLLABLE INSPECTOR BODY
          ---------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#353535] text-[11px]">
        {/* ========================================================
            CASE A: CANVAS ELEMENT SELECTED (Paper Layout & Style)
            ======================================================== */}
        {selectedElement && currentElement && (
          <>
            {/* SECTION 1: LAYOUT (Paper Header + Align Icons + X/Y/∠/W/H/Constraints) */}
            <div className="p-3 space-y-2.5">
              {/* Layout Header with Align Icons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-medium text-[#ececec] hover:text-white transition-colors cursor-default"
                >
                  <span>Layout</span>
                  <ChevronDown size={11} className="text-[#8e8e93]" />
                </button>

                {/* Paper 6 Align Icons */}
                <div className="flex items-center gap-0.5 text-[#8e8e93]">
                  {/* Align Left */}
                  <button
                    type="button"
                    onClick={() => handleAlign("left")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Left"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 2v12" />
                      <rect x="5" y="5" width="9" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* Align Horizontal Center */}
                  <button
                    type="button"
                    onClick={() => handleAlign("hcenter")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Horizontal Center"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M8 1v14" strokeDasharray="2 2" />
                      <rect x="3.5" y="5" width="9" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* Align Right */}
                  <button
                    type="button"
                    onClick={() => handleAlign("right")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Right"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M14 2v12" />
                      <rect x="2" y="5" width="9" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* Align Top */}
                  <button
                    type="button"
                    onClick={() => handleAlign("top")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Top"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 2h12" />
                      <rect x="5" y="5" width="6" height="9" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* Align Vertical Center */}
                  <button
                    type="button"
                    onClick={() => handleAlign("vcenter")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Vertical Center"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M1 8h14" strokeDasharray="2 2" />
                      <rect x="5" y="3.5" width="6" height="9" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* Align Bottom */}
                  <button
                    type="button"
                    onClick={() => handleAlign("bottom")}
                    className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="Align Bottom"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 14h12" />
                      <rect x="5" y="2" width="6" height="9" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </button>

                  {/* More Options (...) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAlignMore(!showAlignMore)}
                      className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-[#8e8e93]"
                      title="More alignment options"
                    >
                      <span className="text-[11px] leading-none font-bold tracking-widest">...</span>
                    </button>
                    {showAlignMore && (
                      <div
                        className="absolute top-full right-0 mt-1 w-36 bg-[#242426] border border-[#383838] rounded-lg shadow-xl py-1 z-50 text-[11px] text-neutral-200"
                        onMouseLeave={() => setShowAlignMore(false)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleAlign("hcenter");
                            handleAlign("vcenter");
                            setShowAlignMore(false);
                          }}
                          className="w-full px-3 py-1 text-left hover:bg-white/10 hover:text-white cursor-pointer"
                        >
                          Center Both Axes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 1: X, Y, ∠ (Angle) 3-col inputs */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* X */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center gap-1.5 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] font-mono select-none">X</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.x)}
                    onChange={(e) => onUpdateElement(selectedElement, { x: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                </div>

                {/* Y */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center gap-1.5 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] font-mono select-none">Y</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.y)}
                    onChange={(e) => onUpdateElement(selectedElement, { y: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                </div>

                {/* Angle ∠ */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center gap-1 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] font-mono select-none">∠</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.rotation || 0)}
                    onChange={(e) => onUpdateElement(selectedElement, { rotation: Number(e.target.value) })}
                    className="w-full bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8e8e93] select-none">°</span>
                </div>
              </div>

              {/* Row 2: W, H, Lock & Transform icons */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* W */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] font-mono select-none">W</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.width)}
                    onChange={(e) => {
                      const newW = Math.max(40, Number(e.target.value));
                      if (aspectLocked && currentElement.width > 0) {
                        const ratio = currentElement.height / currentElement.width;
                        onUpdateElement(selectedElement, {
                          width: newW,
                          height: Math.max(20, Math.round(newW * ratio)),
                        });
                      } else {
                        onUpdateElement(selectedElement, { width: newW });
                      }
                    }}
                    className="w-12 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                  <ChevronDown size={9} className="text-[#8e8e93] ml-0.5" />
                </div>

                {/* H */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] font-mono select-none">H</span>
                  <input
                    type="number"
                    value={Math.round(currentElement.height)}
                    onChange={(e) => {
                      const newH = Math.max(20, Number(e.target.value));
                      if (aspectLocked && currentElement.height > 0) {
                        const ratio = currentElement.width / currentElement.height;
                        onUpdateElement(selectedElement, {
                          height: newH,
                          width: Math.max(40, Math.round(newH * ratio)),
                        });
                      } else {
                        onUpdateElement(selectedElement, { height: newH });
                      }
                    }}
                    className="w-12 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                  <ChevronDown size={9} className="text-[#8e8e93] ml-0.5" />
                </div>

                {/* Aspect Lock, Flip H, Flip V */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-1 flex items-center justify-around">
                  <button
                    type="button"
                    onClick={() => setAspectLocked(!aspectLocked)}
                    className={`p-0.5 rounded transition-colors cursor-pointer ${
                      aspectLocked ? "text-[#38bdf8]" : "text-[#8e8e93] hover:text-white"
                    }`}
                    title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  >
                    <Link2 size={11} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { flipH: !(currentElement as any).flipH })}
                    className={`p-0.5 rounded transition-colors cursor-pointer ${
                      (currentElement as any).flipH ? "text-[#38bdf8]" : "text-[#8e8e93] hover:text-white"
                    }`}
                    title="Flip horizontally"
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2v12M3 5l4 3-4 3V5zM13 5l-4 3 4 3V5z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { flipV: !(currentElement as any).flipV })}
                    className={`p-0.5 rounded transition-colors cursor-pointer ${
                      (currentElement as any).flipV ? "text-[#38bdf8]" : "text-[#8e8e93] hover:text-white"
                    }`}
                    title="Flip vertically"
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 8h12M5 3l3 4 3-4H5zM5 13l3-4 3 4H5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Row 3: Constraints Selectors & Interactive 2D Cross Box */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex-1 space-y-1.5">
                  {/* Constraint Horizontal (Paper Custom Dropdown) */}
                  <StudioDropdown
                    value={activeConstraintH}
                    onValueChange={(val) => setActiveConstraintH(val as any)}
                    prefix="|-|"
                    triggerHeight="h-[24px]"
                    options={[
                      { value: "left", label: "Left" },
                      { value: "center", label: "Center" },
                      { value: "right", label: "Right" },
                    ]}
                  />

                  {/* Constraint Vertical (Paper Custom Dropdown) */}
                  <StudioDropdown
                    value={activeConstraintV}
                    onValueChange={(val) => setActiveConstraintV(val as any)}
                    prefix="T"
                    triggerHeight="h-[24px]"
                    options={[
                      { value: "top", label: "Top" },
                      { value: "center", label: "Center" },
                      { value: "bottom", label: "Bottom" },
                    ]}
                  />
                </div>

                {/* Paper Interactive Constraints 2D Cross Widget */}
                <div
                  className="w-[52px] h-[52px] bg-[#373737] border border-[#48484a]/40 rounded-md relative flex items-center justify-center cursor-pointer group/cross shadow-inner"
                  title="Click constraints to toggle pin edges"
                >
                  <div className="w-7 h-7 border border-white/20 rounded-sm relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  </div>

                  {/* Top Bar (Active Blue if Top) */}
                  <button
                    type="button"
                    onClick={() => setActiveConstraintV(activeConstraintV === "top" ? "center" : "top")}
                    className={`absolute top-1 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-full transition-colors cursor-pointer ${
                      activeConstraintV === "top" ? "bg-[#1687f8] shadow-[0_0_6px_#1687f8]" : "bg-white/10 hover:bg-white/30"
                    }`}
                  />

                  {/* Bottom Bar (Active Blue if Bottom) */}
                  <button
                    type="button"
                    onClick={() => setActiveConstraintV(activeConstraintV === "bottom" ? "center" : "bottom")}
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-full transition-colors cursor-pointer ${
                      activeConstraintV === "bottom" ? "bg-[#1687f8] shadow-[0_0_6px_#1687f8]" : "bg-white/10 hover:bg-white/30"
                    }`}
                  />

                  {/* Left Bar (Active Blue if Left) */}
                  <button
                    type="button"
                    onClick={() => setActiveConstraintH(activeConstraintH === "left" ? "center" : "left")}
                    className={`absolute left-1 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full transition-colors cursor-pointer ${
                      activeConstraintH === "left" ? "bg-[#1687f8] shadow-[0_0_6px_#1687f8]" : "bg-white/10 hover:bg-white/30"
                    }`}
                  />

                  {/* Right Bar (Active Blue if Right) */}
                  <button
                    type="button"
                    onClick={() => setActiveConstraintH(activeConstraintH === "right" ? "center" : "right")}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full transition-colors cursor-pointer ${
                      activeConstraintH === "right" ? "bg-[#1687f8] shadow-[0_0_6px_#1687f8]" : "bg-white/10 hover:bg-white/30"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: FLEX / AUTO-LAYOUT (3x3 Matrix, Direction, Gap, Padding) */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Flex</span>
                <button
                  type="button"
                  onClick={() => setFlexExpanded(!flexExpanded)}
                  className="p-1 text-[#8e8e93] hover:text-white cursor-pointer"
                >
                  <Minus size={11} />
                </button>
              </div>

              {flexExpanded && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    {/* 3x3 Alignment Matrix Box */}
                    <div className="w-[68px] h-[68px] bg-[#373737] border border-[#48484a]/40 rounded-md grid grid-cols-3 grid-rows-3 p-1 gap-1 shrink-0 shadow-inner">
                      {[
                        [0, 0], [0, 1], [0, 2],
                        [1, 0], [1, 1], [1, 2],
                        [2, 0], [2, 1], [2, 2],
                      ].map(([r, c]) => {
                        const isActive = activeFlexPos[0] === r && activeFlexPos[1] === c;
                        return (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            onClick={() => handleFlexMatrixClick(r, c)}
                            className="w-full h-full rounded flex items-center justify-center transition-all hover:bg-white/10 cursor-pointer"
                            title={`Align Matrix [${r}, ${c}]`}
                          >
                            {isActive ? (
                              <div className="flex items-center gap-[1px]">
                                <div className="w-[2px] h-3 bg-[#38bdf8] rounded-full shadow-[0_0_4px_#38bdf8]" />
                                <div className="w-[2px] h-3 bg-[#38bdf8] rounded-full shadow-[0_0_4px_#38bdf8]" />
                                <div className="w-[2px] h-3 bg-[#38bdf8] rounded-full shadow-[0_0_4px_#38bdf8]" />
                              </div>
                            ) : (
                              <div className="w-1 h-1 bg-[#8e8e93] rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Direction Buttons & Gap Input */}
                    <div className="flex-1 space-y-1.5">
                      {/* Direction: Down, Right, Wrap */}
                      <div className="flex bg-[#373737] border border-[#48484a]/30 rounded-md p-0.5 gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleAlign("top")}
                          className="flex-1 h-[22px] rounded hover:bg-white/10 flex items-center justify-center text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                          title="Column Direction (Down)"
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M8 3v10M4 9l4 4 4-4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAlign("left")}
                          className="flex-1 h-[22px] rounded bg-[#48484a] text-white flex items-center justify-center shadow-sm cursor-pointer"
                          title="Row Direction (Right)"
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M3 8h10M9 4l4 4-4 4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-1 text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                          title="Wrap Toggle"
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M13 5H6a3 3 0 0 0-3 3v0a3 3 0 0 3 3h4M10 8l3 3-3 3" />
                          </svg>
                        </button>
                      </div>

                      {/* Gap Input */}
                      <div className="h-[24px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between text-[#ececec]">
                        <span className="text-[10px] text-[#8e8e93] font-mono select-none">|||</span>
                        <input
                          type="number"
                          defaultValue={16}
                          className="w-12 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                        />
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[#8e8e93]">
                          <path d="M3 4h10M3 12h10M8 1v14" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Padding Row */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Horizontal Padding */}
                    <div className="h-[24px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between text-[#ececec]">
                      <span className="text-[9px] text-[#8e8e93] font-mono">[ ]</span>
                      <input
                        type="number"
                        defaultValue={24}
                        className="w-12 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                      />
                    </div>

                    {/* Vertical Padding */}
                    <div className="h-[24px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between text-[#ececec]">
                      <span className="text-[9px] text-[#8e8e93] font-mono">[=]</span>
                      <input
                        type="number"
                        defaultValue={24}
                        className="w-12 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Clip Content Checkbox */}
                  <label className="flex items-center gap-2 text-[11px] text-[#8e8e93] hover:text-[#ececec] cursor-pointer pt-0.5 select-none">
                    <input type="checkbox" className="rounded accent-[#1687f8] bg-[#373737] border-[#48484a]" />
                    <span>Clip content</span>
                    <span className="text-[10px] text-[#8e8e93] font-mono ml-auto">Alt + C</span>
                  </label>
                </div>
              )}
            </div>

            {/* SECTION 3: RADIUS (Slider + Numeric Box) */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Radius</span>
                <button
                  type="button"
                  className="p-1 text-[#8e8e93] hover:text-white cursor-pointer"
                  title="Independent corner radii"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 6V3a1 1 0 0 1 1-1h3M14 6V3a1 1 0 0 0-1-1h-3M2 10v3a1 1 0 0 0 1 1h3M14 10v3a1 1 0 0 1-1 1h-3" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Paper Slider */}
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={(currentElement as any).borderRadius ?? 18}
                  onChange={(e) => onUpdateElement(selectedElement, { borderRadius: Number(e.target.value) })}
                  className="w-full accent-white h-1 bg-[#373737] rounded-full cursor-pointer"
                />

                {/* Numeric Input */}
                <div className="h-[26px] w-14 bg-[#373737] border border-[#48484a]/30 rounded-md px-1.5 flex items-center justify-center focus-within:border-[#1687f8] shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={(currentElement as any).borderRadius ?? 18}
                    onChange={(e) => onUpdateElement(selectedElement, { borderRadius: Number(e.target.value) })}
                    className="w-full bg-transparent text-center font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: BLENDING (Opacity & Blend Mode) */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Blending</span>
                <button
                  type="button"
                  onClick={() => onUpdateElement(selectedElement, { visible: !currentElement.visible })}
                  className={`p-1 transition-colors cursor-pointer ${
                    !currentElement.visible ? "text-neutral-500" : "text-[#8e8e93] hover:text-white"
                  }`}
                  title="Toggle visibility"
                >
                  <Eye size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Opacity */}
                <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center gap-1.5 focus-within:border-[#1687f8]">
                  <span className="text-[10px] text-[#8e8e93] select-none">░</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round((currentElement.opacity ?? 1) * 100)}
                    onChange={(e) => onUpdateElement(selectedElement, { opacity: Number(e.target.value) / 100 })}
                    className="w-full bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8e8e93] select-none">%</span>
                </div>

                {/* Blend Mode (Paper Custom Dropdown) */}
                <StudioDropdown
                  value={blendMode}
                  onValueChange={(val) => setBlendMode(val)}
                  prefix="💧"
                  triggerHeight="h-[26px]"
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "multiply", label: "Multiply" },
                    { value: "screen", label: "Screen" },
                    { value: "overlay", label: "Overlay" },
                    { value: "soft-light", label: "Soft Light" },
                  ]}
                />
              </div>
            </div>

            {/* SECTION 5: FILL (Solid/Gradient/Image Pill & Hex Input) */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Fill</span>
                <button
                  type="button"
                  className="p-1 text-[#8e8e93] hover:text-white cursor-pointer"
                  title="Add fill layer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Segmented Pill & Controls */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex bg-[#1f1f21] p-0.5 rounded-lg border border-[#383838] flex-1">
                  <button
                    type="button"
                    onClick={() => setFillMode("solid")}
                    className={`flex-1 h-[22px] text-[10px] font-medium rounded transition-all flex items-center justify-center cursor-pointer ${
                      fillMode === "solid"
                        ? "bg-[#3a3a3c] text-white shadow-sm font-semibold"
                        : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    type="button"
                    onClick={() => setFillMode("gradient")}
                    className={`flex-1 h-[22px] text-[10px] font-medium rounded transition-all flex items-center justify-center cursor-pointer ${
                      fillMode === "gradient"
                        ? "bg-[#3a3a3c] text-white shadow-sm font-semibold"
                        : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    Gradient
                  </button>
                  <button
                    type="button"
                    onClick={() => setFillMode("image")}
                    className={`flex-1 h-[22px] text-[10px] font-medium rounded transition-all flex items-center justify-center cursor-pointer ${
                      fillMode === "image"
                        ? "bg-[#3a3a3c] text-white shadow-sm font-semibold"
                        : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    Image
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[#8e8e93]">
                  <button type="button" className="p-1 hover:text-white cursor-pointer" title="Hide fill">
                    <Eye size={12} />
                  </button>
                  <button type="button" className="p-1 hover:text-white cursor-pointer" title="Remove fill">
                    <Minus size={12} />
                  </button>
                </div>
              </div>

              {/* Color Box Row (Swatch + Hex + Opacity) */}
              <div className="flex items-center gap-1.5">
                {/* Native Picker Swatch */}
                <label
                  className="w-7 h-7 rounded border border-white/20 cursor-pointer shrink-0 transition-transform hover:scale-105 relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: currentElement.color || "#FAFAFA" }}
                  title="Pick custom color"
                >
                  <input
                    type="color"
                    value={currentElement.color?.startsWith("#") ? currentElement.color : "#ffffff"}
                    onChange={(e) => onUpdateElement(selectedElement, { color: e.target.value })}
                    className="sr-only"
                  />
                </label>

                {/* Hex Code Input */}
                <div className="flex-1 h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center gap-1 focus-within:border-[#1687f8]">
                  <input
                    type="text"
                    value={(currentElement.color || "FAFAFA").replace("#", "")}
                    onChange={(e) => onUpdateElement(selectedElement, { color: `#${e.target.value}` })}
                    className="w-full bg-transparent font-mono text-[11px] text-[#ececec] uppercase focus:outline-none font-medium"
                  />
                </div>

                {/* Opacity % */}
                <div className="w-16 h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-1.5 flex items-center justify-between text-[#ececec]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round((currentElement.opacity ?? 1) * 100)}
                    onChange={(e) => onUpdateElement(selectedElement, { opacity: Number(e.target.value) / 100 })}
                    className="w-full bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8e8e93] ml-0.5">%</span>
                </div>
              </div>

              {/* Quick Palette Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { color: hex })}
                    className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform relative cursor-pointer"
                    style={{ backgroundColor: hex }}
                  >
                    {currentElement.color?.toLowerCase() === hex.toLowerCase() && (
                      <Check size={9} className={hex === "#ffffff" ? "text-black mx-auto" : "text-white mx-auto"} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 6: OUTLINE (Border) */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Outline</span>
                <button
                  type="button"
                  onClick={() => setOutlineActive(!outlineActive)}
                  className="p-1 text-[#8e8e93] hover:text-white cursor-pointer"
                  title="Add outline/border"
                >
                  <Plus size={12} />
                </button>
              </div>

              {outlineActive && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-[#1687f8] border border-white/20 shrink-0" />
                  <div className="flex-1 h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#8e8e93]">Width</span>
                    <input
                      type="number"
                      defaultValue={1}
                      className="w-10 bg-transparent text-right font-mono text-[11px] text-[#ececec] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#8e8e93] ml-0.5">px</span>
                  </div>
                  <div className="w-24">
                    <StudioDropdown
                      value={outlinePosition}
                      onValueChange={(val) => setOutlinePosition(val)}
                      triggerHeight="h-[26px]"
                      options={[
                        { value: "inside", label: "Inside" },
                        { value: "center", label: "Center" },
                        { value: "outside", label: "Outside" },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 7: TYPOGRAPHY (When Text Layer Selected) */}
            {isTextType && (
              <div className="p-3 space-y-2.5">
                <span className="text-[11px] font-medium text-[#ececec] block">Typography</span>

                {/* Direct Text Editor Input */}
                {(currentElement as any).text !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8e8e93]">Content</label>
                    <textarea
                      rows={3}
                      value={(currentElement as any).text}
                      onChange={(e) => onUpdateElement(selectedElement, { text: e.target.value })}
                      className="w-full bg-[#373737] border border-[#48484a]/30 rounded-lg p-2 text-[11px] font-medium text-[#ececec] focus:outline-none focus:border-[#1687f8] resize-none"
                    />
                  </div>
                )}

                {/* Font Selector (Paper Custom Dropdown with live typography preview) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8e8e93]">Font Family</label>
                  <StudioDropdown
                    value={
                      STUDIO_FONTS.find((f) => f.value === currentElement.fontFamily)?.value ||
                      STUDIO_FONTS[0].value
                    }
                    onValueChange={(val) => onUpdateElement(selectedElement, { fontFamily: val })}
                    triggerHeight="h-[28px]"
                    options={STUDIO_FONTS.map((f) => ({
                      value: f.value,
                      label: f.name,
                      fontFamily: f.value,
                    }))}
                  />
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8e8e93]">Size</label>
                    <div className="h-[26px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 flex items-center focus-within:border-[#1687f8]">
                      <input
                        type="number"
                        value={currentElement.fontSize}
                        onChange={(e) => onUpdateElement(selectedElement, { fontSize: Number(e.target.value) })}
                        className="w-full bg-transparent font-mono text-[11px] text-[#ececec] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8e8e93]">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8e8e93]">Weight</label>
                    <StudioDropdown
                      value={String(currentElement.fontWeight || "400")}
                      onValueChange={(val) => onUpdateElement(selectedElement, { fontWeight: val })}
                      triggerHeight="h-[26px]"
                      options={[
                        { value: "400", label: "Regular (400)" },
                        { value: "500", label: "Medium (500)" },
                        { value: "600", label: "SemiBold (600)" },
                        { value: "700", label: "Bold (700)" },
                        { value: "900", label: "Black (900)" },
                      ]}
                    />
                  </div>
                </div>

                {/* Alignment & Uppercase */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex bg-[#1f1f21] border border-[#383838] rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "left" })}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        currentElement.align === "left"
                          ? "bg-[#3a3a3c] text-white shadow-sm"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "center" })}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        currentElement.align === "center"
                          ? "bg-[#3a3a3c] text-white shadow-sm"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateElement(selectedElement, { align: "right" })}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        currentElement.align === "right"
                          ? "bg-[#3a3a3c] text-white shadow-sm"
                          : "text-[#8e8e93] hover:text-white"
                      }`}
                      title="Align Right"
                    >
                      <AlignRight size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement, { uppercase: !currentElement.uppercase })}
                    className={`px-2 py-1 rounded border text-[10px] font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      currentElement.uppercase
                        ? "bg-[#0d2238] border-[#1687f8] text-[#38bdf8]"
                        : "bg-[#373737] hover:bg-[#404040] border-[#48484a]/30 text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    AA Uppercase
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 8: MEDIA FRAMING (When Image Layer Selected) */}
            {isImageType && (
              <div className="p-3 space-y-2.5">
                <span className="text-[11px] font-medium text-[#ececec] block">Media Framing</span>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8e8e93]">Media URL</label>
                  <input
                    type="text"
                    value={(currentElement as any).mediaUrl || ""}
                    onChange={(e) => onUpdateElement(selectedElement, { mediaUrl: e.target.value })}
                    placeholder="https://... image or video URL"
                    className="w-full h-[28px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 text-[11px] font-mono text-[#ececec] focus:outline-none focus:border-[#1687f8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8e8e93]">Object Fit</label>
                  <StudioDropdown
                    value={(currentElement as any).objectFit || "cover"}
                    onValueChange={(val) => onUpdateElement(selectedElement, { objectFit: val as any })}
                    triggerHeight="h-[28px]"
                    options={[
                      { value: "cover", label: "Cover" },
                      { value: "contain", label: "Contain" },
                      { value: "fill", label: "Fill" },
                    ]}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================
            CASE B: FOOTER & BRANDING SELECTED
            ======================================================== */}
        {isFooterSelected && (
          <div className="p-3 space-y-3">
            <span className="text-[11px] font-medium text-[#ececec] block">Branding & Footer</span>

            <div className="space-y-1">
              <label className="text-[10px] text-[#8e8e93]">Brand Tag</label>
              <input
                type="text"
                value={activeSlide.footer.brandName}
                onChange={(e) => onUpdateFooter({ brandName: e.target.value })}
                placeholder="e.g. GROWXLABS"
                className="w-full h-[28px] bg-[#373737] border border-[#48484a]/30 rounded-md px-2 text-[11px] font-bold uppercase text-[#ececec] focus:outline-none focus:border-[#1687f8]"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-center justify-between p-2 rounded-md bg-[#373737] border border-[#48484a]/30 cursor-pointer hover:bg-[#3f3f3f] transition-colors">
                <span className="text-[11px] text-[#ececec]">Top Divider Line</span>
                <input
                  type="checkbox"
                  checked={activeSlide.footer.dividerEnabled !== false}
                  onChange={(e) => onUpdateFooter({ dividerEnabled: e.target.checked })}
                  className="rounded accent-[#1687f8]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-md bg-[#373737] border border-[#48484a]/30 cursor-pointer hover:bg-[#3f3f3f] transition-colors">
                <span className="text-[11px] text-[#ececec]">Page Number Indicator</span>
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
            CASE C: PAGE SETTINGS (NO ELEMENT SELECTED)
            ======================================================== */}
        {!selectedElement && !isFooterSelected && (
          <div className="p-3 space-y-3.5">
            {/* Target Format Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-[#ececec] block">Target Aspect Ratio</span>

              <div className="grid grid-cols-1 gap-1.5">
                {CANVAS_FORMAT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onFormatChange(preset)}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeFormat.id === preset.id
                        ? "bg-[#3a3a3c] border-[#1687f8] text-white shadow-sm ring-1 ring-[#1687f8]/40"
                        : "bg-[#373737] hover:bg-[#3f3f3f] border-[#48484a]/30 text-[#ececec]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold">{preset.name}</span>
                      <span className="text-[9px] text-[#8e8e93]">{preset.badge}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8e8e93] font-medium bg-[#242426] px-1.5 py-0.5 rounded border border-[#383838]">
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Canvas Background Color */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#ececec]">Canvas Background</span>
                <span className="text-[10px] font-mono text-[#8e8e93] uppercase">
                  {activeSlide.backgroundColor || "#ffffff"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {["#ffffff", "#000000", "#0a0a0c", "#18181b", "#0f172a", "#f8fafc", "#fdfbf7"].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateBackground(hex)}
                    className="w-6 h-6 rounded-md border border-white/20 hover:scale-105 transition-transform relative cursor-pointer"
                    style={{ backgroundColor: hex }}
                  >
                    {activeSlide.backgroundColor?.toLowerCase() === hex.toLowerCase() && (
                      <Check
                        size={10}
                        className={
                          hex === "#ffffff" || hex === "#f8fafc" || hex === "#fdfbf7"
                            ? "text-black mx-auto"
                            : "text-white mx-auto"
                        }
                      />
                    )}
                  </button>
                ))}

                {/* Native Picker Swatch */}
                <label
                  className="w-6 h-6 rounded-md border border-white/20 bg-[#373737] hover:bg-[#3f3f3f] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 relative"
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

            {/* One-Click Exports */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-medium text-[#ececec] block">One-Click Exports</span>

              <button
                type="button"
                onClick={onDownloadPng}
                className="w-full h-8 bg-[#1687f8] hover:bg-[#1374d6] text-white rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download size={13} />
                <span>Download Current Slide (PNG)</span>
              </button>

              <button
                type="button"
                onClick={onDownloadPdf}
                className="w-full h-8 bg-[#373737] hover:bg-[#404040] border border-[#48484a]/30 text-[#ececec] rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={13} />
                <span>Export Full PDF ({slidesCount} Slides)</span>
              </button>

              <button
                type="button"
                onClick={onDownloadMp4}
                className="w-full h-8 bg-[#373737] hover:bg-[#404040] border border-[#48484a]/30 text-[#ececec] rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={13} />
                <span>Render MP4 Video Reel</span>
              </button>

              <button
                type="button"
                onClick={onDownloadAllSvg}
                className="w-full h-7 bg-transparent hover:bg-white/5 border border-white/5 text-[#8e8e93] hover:text-white rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
