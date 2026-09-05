"use client";

import React, { useEffect, useRef } from "react";
import {
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  EyeOff,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface CanvasContextMenuProps {
  x: number;
  y: number;
  selectedKey: string | null;
  isLocked: boolean;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onToggleHide: () => void;
  onResetPosition: () => void;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  selectedKey,
  isLocked,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onToggleHide,
  onResetPosition,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Constrain menu inside window bounds
  const menuWidth = 220;
  const menuHeight = 280;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#16171a]/95 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl text-white text-[12px] font-sans flex flex-col gap-0.5 select-none animate-in fade-in zoom-in-95 duration-100 min-w-[210px]"
      style={{ left: `${clampedX}px`, top: `${clampedY}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {selectedKey && (
        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5 flex items-center justify-between">
          <span>Layer: {selectedKey}</span>
          <Sparkles size={10} className="text-[#1687f8]" />
        </div>
      )}

      {/* Duplicate */}
      <button
        type="button"
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1687f8] hover:text-white transition-colors group text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <Copy size={13} className="text-neutral-400 group-hover:text-white" />
          <span>Duplicate</span>
        </div>
        <span className="text-[10px] text-neutral-500 group-hover:text-white/80 font-mono">
          Ctrl+D
        </span>
      </button>

      <div className="h-px bg-white/5 my-1" />

      {/* Z-Index Controls */}
      <button
        type="button"
        onClick={() => {
          onBringForward();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <ArrowUp size={13} className="text-neutral-400" />
          <span>Bring Forward</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Ctrl+]</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onSendBackward();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <ArrowDown size={13} className="text-neutral-400" />
          <span>Send Backward</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Ctrl+[</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onBringToFront();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <ChevronsUp size={13} className="text-neutral-400" />
          <span>Bring to Front</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Ctrl+Shift+]</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onSendToBack();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <ChevronsDown size={13} className="text-neutral-400" />
          <span>Send to Back</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Ctrl+Shift+[</span>
      </button>

      <div className="h-px bg-white/5 my-1" />

      {/* Lock / Unlock */}
      <button
        type="button"
        onClick={() => {
          onToggleLock();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          {isLocked ? (
            <Unlock size={13} className="text-amber-400" />
          ) : (
            <Lock size={13} className="text-neutral-400" />
          )}
          <span>{isLocked ? "Unlock Layer" : "Lock Layer"}</span>
        </div>
      </button>

      {/* Hide */}
      <button
        type="button"
        onClick={() => {
          onToggleHide();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <EyeOff size={13} className="text-neutral-400" />
          <span>Hide Layer</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Del</span>
      </button>

      {/* Reset Position */}
      <button
        type="button"
        onClick={() => {
          onResetPosition();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200"
      >
        <div className="flex items-center gap-2">
          <RotateCcw size={13} className="text-neutral-400" />
          <span>Reset Layout</span>
        </div>
      </button>
    </div>
  );
};
