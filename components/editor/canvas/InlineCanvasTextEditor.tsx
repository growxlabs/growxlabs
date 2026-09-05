"use client";

import React, { useState, useEffect, useRef } from "react";

interface InlineCanvasTextEditorProps {
  initialText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  align?: "left" | "center" | "right";
  uppercase?: boolean;
  zoomScale: number;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export const InlineCanvasTextEditor: React.FC<InlineCanvasTextEditorProps> = ({
  initialText,
  x,
  y,
  width,
  height,
  rotation = 0,
  fontFamily = "'Inter', sans-serif",
  fontSize = 24,
  fontWeight = "700",
  lineHeight = 1.2,
  letterSpacing = 0,
  color = "#ffffff",
  align = "left",
  uppercase = false,
  zoomScale,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation so global canvas shortcuts don't fire
    e.stopPropagation();

    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      onSave(text);
    }
  };

  const handleBlur = () => {
    onSave(text);
  };

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={Math.max(1, text.split("\n").length)}
        className="w-full bg-black/40 backdrop-blur-sm border-2 border-[#1687f8] rounded-md p-1 outline-none resize-none shadow-2xl transition-all"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight,
          lineHeight,
          letterSpacing: `${letterSpacing}px`,
          color,
          textAlign: align,
          textTransform: uppercase ? "uppercase" : "none",
          minHeight: `${height}px`,
          boxSizing: "border-box",
        }}
        placeholder="Type text…"
      />
      <div
        className="absolute -bottom-6 left-0 bg-[#1687f8] text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-md flex items-center gap-1.5 pointer-events-none"
        style={{
          transform: `scale(${1 / Math.max(0.1, zoomScale)})`,
          transformOrigin: "top left",
        }}
      >
        <span>Press ESC to cancel • Ctrl+Enter to save</span>
      </div>
    </div>
  );
};
