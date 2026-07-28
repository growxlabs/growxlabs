"use client";

import React from "react";
import { ChevronLeft, Eye, EyeOff, Lock, Unlock, MoreHorizontal } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { LayerActionsMenu } from "./LayerActionsMenu";
import { LAYER_CONFIGS } from "./layerConfig";
import type { ElementKey, Slide } from "./inspectorTypes";

interface InspectorHeaderProps {
  view: "document" | "layers" | "layer";
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  activeSlide: Slide;
  onBack: () => void;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function InspectorHeader({
  view,
  selectedElement,
  isFooterSelected,
  activeSlide,
  onBack,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDelete,
}: InspectorHeaderProps) {
  if (view === "document" || view === "layers") {
    return (
      <div
        className="min-h-[56px] px-3.5 py-3 border-b flex items-center justify-between select-none shrink-0
          border-neutral-200 dark:border-[var(--inspector-border)]
          bg-white dark:bg-[var(--inspector-bg)]"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
            {view === "document" ? "Inspector" : "Layers"}
          </span>
          {view === "document" && (
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              Document
            </span>
          )}
        </div>
      </div>
    );
  }

  // Layer view header
  const layerKey = isFooterSelected ? "footer" : selectedElement;
  const config = layerKey ? LAYER_CONFIGS[layerKey] : null;
  const layerLabel = config?.label ?? "Layer";
  const layerType = config?.type ?? "layer";

  const isVisible = layerKey
    ? layerKey === "footer"
      ? activeSlide.footer.opacity > 0
      : activeSlide[layerKey as ElementKey]?.visible
    : true;

  const isLocked = layerKey && layerKey !== "footer"
    ? activeSlide[layerKey as ElementKey]?.locked
    : false;

  return (
    <div
      className="min-h-[64px] px-3.5 py-2.5 border-b flex flex-col gap-1 select-none shrink-0
        border-neutral-200 dark:border-[var(--inspector-border)]
        bg-white dark:bg-[var(--inspector-bg)]"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500
          hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors
          cursor-pointer bg-transparent border-none p-0 -ml-0.5"
      >
        <ChevronLeft size={14} />
        <span>Layers</span>
      </button>

      {/* Layer info + actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-100 truncate">
            {layerLabel}
          </span>
          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 capitalize">
            {layerType} layer
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <Tooltip.Provider delayDuration={400}>
            {/* Visibility toggle */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={onToggleVisibility}
                  className="w-7 h-7 flex items-center justify-center rounded-md
                    text-neutral-400 dark:text-neutral-500
                    hover:text-neutral-700 dark:hover:text-neutral-300
                    hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)]
                    transition-all cursor-pointer bg-transparent border-none"
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} className="text-red-500" />}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={4}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-md
                    bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900
                    shadow-lg z-[9999]"
                >
                  {isVisible ? "Hide layer" : "Show layer"}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Lock toggle */}
            {layerKey !== "footer" && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={onToggleLock}
                    className="w-7 h-7 flex items-center justify-center rounded-md
                      text-neutral-400 dark:text-neutral-500
                      hover:text-neutral-700 dark:hover:text-neutral-300
                      hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)]
                      transition-all cursor-pointer bg-transparent border-none"
                  >
                    {isLocked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} />}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={4}
                    className="px-2.5 py-1.5 text-[11px] font-medium rounded-md
                      bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900
                      shadow-lg z-[9999]"
                  >
                    {isLocked ? "Unlock layer" : "Lock layer"}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}

            {/* More actions */}
            <LayerActionsMenu
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            >
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-md
                      text-neutral-400 dark:text-neutral-500
                      hover:text-neutral-700 dark:hover:text-neutral-300
                      hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)]
                      transition-all cursor-pointer bg-transparent border-none"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={4}
                    className="px-2.5 py-1.5 text-[11px] font-medium rounded-md
                      bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900
                      shadow-lg z-[9999]"
                  >
                    More actions
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </LayerActionsMenu>
          </Tooltip.Provider>
        </div>
      </div>
    </div>
  );
}
