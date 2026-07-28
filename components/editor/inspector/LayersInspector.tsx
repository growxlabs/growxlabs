"use client";

import React from "react";
import { LayerList } from "./LayerList";
import type { Slide, ElementKey } from "./inspectorTypes";

interface LayersInspectorProps {
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  onSelectLayer: (key: ElementKey | null, isFooter?: boolean) => void;
  onToggleVisibility: (key: ElementKey | "footer") => void;
  onToggleLock: (key: ElementKey) => void;
}

export function LayersInspector({
  activeSlide,
  selectedElement,
  isFooterSelected,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
}: LayersInspectorProps) {
  return (
    <div className="flex flex-col">
      <LayerList
        activeSlide={activeSlide}
        selectedElement={selectedElement}
        isFooterSelected={isFooterSelected}
        onSelectLayer={onSelectLayer}
        onToggleVisibility={onToggleVisibility}
        onToggleLock={onToggleLock}
      />
    </div>
  );
}
