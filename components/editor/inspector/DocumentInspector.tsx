"use client";

import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Image as ImageIcon,
  FileImage,
  FileCode,
  Layers,
  FileText,
  Video
} from "lucide-react";
import { Slide } from "./inspectorTypes";

interface DocumentInspectorProps {
  activeSlide: Slide;
  slides: Slide[];
  onNavigateToLayers: () => void;
  handleDownloadSlideRaster: (index: number, format: "png" | "jpeg") => void;
  handleDownloadSlideSvg: (index: number) => void;
  handleDownloadAllSlidesSvg: () => void;
  handleDownloadPdf: () => void;
  handleDownloadMp4: () => void;
  activeIndex: number;
}

export function DocumentInspector({
  activeSlide,
  slides,
  onNavigateToLayers,
  handleDownloadSlideRaster,
  handleDownloadSlideSvg,
  handleDownloadAllSlidesSvg,
  handleDownloadPdf,
  handleDownloadMp4,
  activeIndex,
}: DocumentInspectorProps) {
  const [exportOpen, setExportOpen] = useState(false);

  // Derive active layers count from individual element keys
  const ELEMENT_KEYS = ["category", "headline", "featuredImage", "body", "bullets", "quote", "cta", "logo", "divider", "author"] as const;
  const activeLayersCount = ELEMENT_KEYS.filter(
    (k) => activeSlide[k]?.visible
  ).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--inspector-bg)] text-[var(--inspector-text)] text-sm">
      <div className="p-4 border-b border-[var(--inspector-border)]">
        <h2 className="font-semibold text-[var(--inspector-text)] mb-3">Document</h2>
        
        {/* Canvas dimensions display */}
        <div className="bg-[var(--inspector-surface)] rounded-[var(--radius-row)] p-3 mb-4">
          <div className="text-[var(--inspector-text-secondary)] text-xs mb-2">Dimensions</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Width</span>
              <span className="font-medium">1080</span>
            </div>
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Height</span>
              <span className="font-medium">1350</span>
            </div>
          </div>
        </div>

        {/* Safe margins summary */}
        <div className="bg-[var(--inspector-surface)] rounded-[var(--radius-row)] p-3 mb-4">
          <div className="text-[var(--inspector-text-secondary)] text-xs mb-2">Safe Margins</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Top</span>
              <span className="font-medium">60</span>
            </div>
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Bottom</span>
              <span className="font-medium">70</span>
            </div>
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Left</span>
              <span className="font-medium">72</span>
            </div>
            <div className="bg-[var(--inspector-bg)] rounded-[var(--radius-control)] py-1.5 border border-[var(--inspector-border)]">
              <span className="text-[var(--inspector-text-muted)] text-xs block">Right</span>
              <span className="font-medium">72</span>
            </div>
          </div>
        </div>

        {/* Active layers count section */}
        <button
          onClick={onNavigateToLayers}
          className="w-full flex items-center justify-between bg-[var(--inspector-surface)] hover:bg-[var(--inspector-surface-hover)] active:bg-[var(--inspector-surface-active)] transition-colors rounded-[var(--radius-row)] p-3 border border-[var(--inspector-border)]"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--inspector-brand)]" />
            <span className="font-medium">Active Layers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[var(--inspector-bg)] px-2 py-0.5 rounded-full text-xs font-semibold border border-[var(--inspector-border)]">
              {activeLayersCount}
            </span>
            <ChevronDown className="w-4 h-4 text-[var(--inspector-text-muted)] -rotate-90" />
          </div>
        </button>
      </div>

      <div className="p-4 flex-1">
        <Collapsible.Root
          open={exportOpen}
          onOpenChange={setExportOpen}
          className="bg-[var(--inspector-surface)] rounded-[var(--radius-row)] border border-[var(--inspector-border)] overflow-hidden"
        >
          <Collapsible.Trigger className="w-full flex items-center justify-between p-3 hover:bg-[var(--inspector-surface-hover)] transition-colors">
            <div className="flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" />
              Export
            </div>
            {exportOpen ? (
              <ChevronUp className="w-4 h-4 text-[var(--inspector-text-muted)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--inspector-text-muted)]" />
            )}
          </Collapsible.Trigger>
          <Collapsible.Content className="p-3 pt-0 flex flex-col gap-2">
            <button
              onClick={() => handleDownloadSlideRaster(activeIndex, 'png')}
              className="w-full flex items-center justify-center gap-2 bg-[var(--inspector-brand)] hover:opacity-90 text-white py-2 px-3 rounded-[var(--radius-control)] font-medium transition-opacity mt-1"
            >
              <ImageIcon className="w-4 h-4" />
              Download PNG (1080×1350)
            </button>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleDownloadSlideRaster(activeIndex, 'jpeg')}
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] transition-colors"
                title="Download JPEG"
              >
                <FileImage className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
                <span className="text-xs">JPEG</span>
              </button>
              <button
                onClick={() => handleDownloadSlideSvg(activeIndex)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] transition-colors"
                title="Download SVG"
              >
                <FileCode className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
                <span className="text-xs">SVG</span>
              </button>
              <button
                onClick={() => handleDownloadAllSlidesSvg()}
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] transition-colors"
                title="Download All SVG"
              >
                <Layers className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
                <span className="text-xs">All SVG</span>
              </button>
              <button
                onClick={() => handleDownloadPdf()}
                className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] transition-colors"
                title="Download PDF"
              >
                <FileText className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
                <span className="text-xs">PDF</span>
              </button>
            </div>
            <button
              onClick={() => handleDownloadMp4()}
              className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-[var(--inspector-bg)] hover:bg-[var(--inspector-surface-hover)] border border-[var(--inspector-border)] rounded-[var(--radius-control)] transition-colors"
            >
              <Video className="w-4 h-4 text-[var(--inspector-text-secondary)]" />
              <span className="text-xs font-medium">Download MP4</span>
            </button>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  );
}
