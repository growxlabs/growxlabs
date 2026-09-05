"use client";

import React from "react";
import { Lock, RotateCw } from "lucide-react";

export type TransformHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface FigmaTransformGizmoProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zoomScale: number;
  locked?: boolean;
  label?: string;
  isDragging?: boolean;
  isResizing?: boolean;
  isRotating?: boolean;
  onResizeStart: (e: React.MouseEvent, handle: TransformHandle) => void;
  onRotateStart: (e: React.MouseEvent) => void;
}

export const FigmaTransformGizmo: React.FC<FigmaTransformGizmoProps> = ({
  x,
  y,
  width,
  height,
  rotation = 0,
  zoomScale,
  locked = false,
  label,
  isDragging = false,
  isResizing = false,
  isRotating = false,
  onResizeStart,
  onRotateStart,
}) => {
  const invZoom = 1 / Math.max(0.1, zoomScale);
  const handleSize = Math.max(7, Math.round(9 * invZoom));
  const stemHeight = Math.max(16, Math.round(22 * invZoom));

  const handles: { key: TransformHandle; style: React.CSSProperties; cursor: string }[] = [
    { key: "nw", style: { top: 0, left: 0 }, cursor: "nwse-resize" },
    { key: "n", style: { top: 0, left: "50%" }, cursor: "ns-resize" },
    { key: "ne", style: { top: 0, left: "100%" }, cursor: "nesw-resize" },
    { key: "e", style: { top: "50%", left: "100%" }, cursor: "ew-resize" },
    { key: "se", style: { top: "100%", left: "100%" }, cursor: "nwse-resize" },
    { key: "s", style: { top: "100%", left: "50%" }, cursor: "ns-resize" },
    { key: "sw", style: { top: "100%", left: 0 }, cursor: "nesw-resize" },
    { key: "w", style: { top: "50%", left: 0 }, cursor: "ew-resize" },
  ];

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      {/* 1. Bounding Outline (Figma Electric Blue #1687f8) */}
      <div
        className="absolute inset-0 border border-[#1687f8] pointer-events-none"
        style={{
          boxShadow: "0 0 0 1px rgba(22, 135, 248, 0.2)",
          borderRadius: "2px",
        }}
      />

      {/* 2. Top Rotation Stem & Handle */}
      {!locked && (
        <div
          className="absolute flex flex-col items-center pointer-events-auto"
          style={{
            top: `-${stemHeight}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Rotation Handle Knob */}
          <div
            onMouseDown={onRotateStart}
            title="Rotate layer (hold Shift for 15° steps)"
            className="rounded-full bg-white border-2 border-[#1687f8] hover:bg-[#1687f8] hover:border-white transition-all shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center group"
            style={{
              width: `${Math.max(11, Math.round(13 * invZoom))}px`,
              height: `${Math.max(11, Math.round(13 * invZoom))}px`,
            }}
          >
            <RotateCw
              size={Math.max(7, Math.round(8 * invZoom))}
              className="text-[#1687f8] group-hover:text-white transition-colors"
            />
          </div>
          {/* Connecting Stem Line */}
          <div
            className="w-[1.5px] bg-[#1687f8]"
            style={{ height: `${stemHeight - Math.max(11, Math.round(13 * invZoom))}px` }}
          />
        </div>
      )}

      {/* 3. 8-Point Transform Handles */}
      {!locked &&
        handles.map((h) => (
          <div
            key={h.key}
            onMouseDown={(e) => onResizeStart(e, h.key)}
            className="absolute bg-white border border-[#1687f8] rounded-sm shadow-sm pointer-events-auto hover:scale-125 hover:bg-[#1687f8] transition-transform"
            style={{
              ...h.style,
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              transform: "translate(-50%, -50%)",
              cursor: h.cursor,
            }}
          />
        ))}

      {/* 4. Locked Indicator Badge */}
      {locked && (
        <div
          className="absolute bg-neutral-900/90 text-neutral-300 border border-neutral-700/60 rounded px-1.5 py-0.5 shadow-md flex items-center gap-1 pointer-events-none"
          style={{
            top: `${4 * invZoom}px`,
            right: `${4 * invZoom}px`,
            transform: `scale(${invZoom})`,
            transformOrigin: "top right",
          }}
        >
          <Lock size={10} className="text-amber-400" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Locked</span>
        </div>
      )}

      {/* 5. Live Figma HUD Dimensions Pill */}
      {(isDragging || isResizing || isRotating) && (
        <div
          className="absolute bg-[#111214]/95 text-white border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-mono tracking-tight shadow-xl flex items-center gap-2 pointer-events-none whitespace-nowrap z-50"
          style={{
            bottom: `-${28 * invZoom}px`,
            left: "50%",
            transform: `translateX(-50%) scale(${invZoom})`,
            transformOrigin: "center top",
          }}
        >
          {isRotating ? (
            <span className="text-[#38bdf8] font-semibold">{Math.round(rotation)}°</span>
          ) : (
            <>
              <span className="text-neutral-400">
                W: <span className="text-white font-semibold">{Math.round(width)}</span>
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400">
                H: <span className="text-white font-semibold">{Math.round(height)}</span>
              </span>
              {isDragging && (
                <>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">
                    X: <span className="text-neutral-200">{Math.round(x)}</span>
                  </span>
                  <span className="text-neutral-400">
                    Y: <span className="text-neutral-200">{Math.round(y)}</span>
                  </span>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 6. Subtle Layer Label Pill (top-left) */}
      {label && !isDragging && !isResizing && !isRotating && (
        <div
          className="absolute bg-[#1687f8] text-white rounded-t px-1.5 py-0.2 text-[9px] font-bold tracking-wide pointer-events-none select-none uppercase truncate max-w-[140px]"
          style={{
            top: `-${15 * invZoom}px`,
            left: 0,
            transform: `scale(${invZoom})`,
            transformOrigin: "bottom left",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
