"use client";

import React, { useState, useCallback, useEffect } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { InspectorHeader } from "./InspectorHeader";
import { DocumentInspector } from "./DocumentInspector";
import { LayersInspector } from "./LayersInspector";
import { LayerInspector } from "./LayerInspector";
import { InspectorEmptyState } from "./InspectorEmptyState";
import type { InspectorPanelProps, InspectorView, ElementKey } from "./inspectorTypes";

export function InspectorPanel({
  slides,
  activeIndex,
  activeSlide,
  selectedElement,
  isFooterSelected,
  editorMode,
  darkMode,
  setSelectedElement,
  setIsFooterSelected,
  updateSlideElement,
  updateSlideFooter,
  handleDownloadSlideRaster,
  handleDownloadSlideSvg,
  handleDownloadAllSlidesSvg,
  handleDownloadPdf,
  handleDownloadMp4,
  handleUndo,
  handleRedo,
}: InspectorPanelProps) {
  // Determine which inspector view to show
  const getView = (): InspectorView => {
    if (selectedElement || isFooterSelected) return "layer";
    return "document";
  };

  const [explicitLayersView, setExplicitLayersView] = useState(false);

  const currentView: InspectorView = explicitLayersView
    ? "layers"
    : getView();

  // When a layer is selected externally (e.g., canvas click), switch to layer view
  useEffect(() => {
    if (selectedElement || isFooterSelected) {
      setExplicitLayersView(false);
    }
  }, [selectedElement, isFooterSelected]);

  const handleSelectLayer = useCallback(
    (key: ElementKey | null, isFooter?: boolean) => {
      if (isFooter) {
        setSelectedElement(null);
        setIsFooterSelected(true);
      } else if (key) {
        setSelectedElement(key);
        setIsFooterSelected(false);
      }
      setExplicitLayersView(false);
    },
    [setSelectedElement, setIsFooterSelected]
  );

  const handleNavigateToLayers = useCallback(() => {
    setExplicitLayersView(true);
  }, []);

  const handleBack = useCallback(() => {
    // Going back from layer view → layers list (keep canvas selection)
    setExplicitLayersView(true);
  }, []);

  const handleBackToDocument = useCallback(() => {
    setSelectedElement(null);
    setIsFooterSelected(false);
    setExplicitLayersView(false);
  }, [setSelectedElement, setIsFooterSelected]);

  const handleToggleVisibility = useCallback(
    (key: ElementKey | "footer") => {
      if (key === "footer") {
        updateSlideFooter({ opacity: activeSlide.footer.opacity > 0 ? 0 : 1 });
      } else {
        updateSlideElement(key, { visible: !activeSlide[key].visible });
      }
    },
    [activeSlide, updateSlideElement, updateSlideFooter]
  );

  const handleToggleLock = useCallback(
    (key: ElementKey) => {
      updateSlideElement(key, { locked: !activeSlide[key].locked });
    },
    [activeSlide, updateSlideElement]
  );

  const handleHeaderToggleVisibility = useCallback(() => {
    const key = isFooterSelected ? "footer" : selectedElement;
    if (key) handleToggleVisibility(key as ElementKey | "footer");
  }, [selectedElement, isFooterSelected, handleToggleVisibility]);

  const handleHeaderToggleLock = useCallback(() => {
    if (selectedElement) handleToggleLock(selectedElement);
  }, [selectedElement, handleToggleLock]);

  // Empty state
  if (!slides.length || !activeSlide) {
    return (
      <aside
        className="w-[var(--inspector-width)] min-w-[var(--inspector-width)] h-full flex flex-col
          border-l border-neutral-200 dark:border-[var(--inspector-border)]
          bg-white dark:bg-[var(--inspector-bg)] shrink-0 z-10 select-none"
      >
        <InspectorHeader
          view="document"
          selectedElement={null}
          isFooterSelected={false}
          activeSlide={activeSlide}
          onBack={handleBackToDocument}
        />
        <InspectorEmptyState />
      </aside>
    );
  }

  return (
    <aside
      className="w-[var(--inspector-width)] min-w-[var(--inspector-width)] h-full min-h-0
        flex flex-col
        border-l border-neutral-200 dark:border-[var(--inspector-border)]
        bg-white dark:bg-[var(--inspector-bg)] shrink-0 z-10 select-none"
    >
      {/* Sticky header */}
      <InspectorHeader
        view={currentView}
        selectedElement={selectedElement}
        isFooterSelected={isFooterSelected}
        activeSlide={activeSlide}
        onBack={currentView === "layers" ? handleBackToDocument : handleBack}
        onToggleVisibility={handleHeaderToggleVisibility}
        onToggleLock={handleHeaderToggleLock}
      />

      {/* Scrollable content */}
      <ScrollArea.Root className="flex-1 min-h-0">
        <ScrollArea.Viewport className="h-full w-full">
          <div className="relative">
            {/* Document Inspector */}
            {currentView === "document" && (
              <div className="animate-in fade-in duration-150">
                <DocumentInspector
                  activeSlide={activeSlide}
                  slides={slides}
                  onNavigateToLayers={handleNavigateToLayers}
                  handleDownloadSlideRaster={handleDownloadSlideRaster}
                  handleDownloadSlideSvg={handleDownloadSlideSvg}
                  handleDownloadAllSlidesSvg={handleDownloadAllSlidesSvg}
                  handleDownloadPdf={handleDownloadPdf}
                  handleDownloadMp4={handleDownloadMp4}
                  activeIndex={activeIndex}
                />
              </div>
            )}

            {/* Layers List */}
            {currentView === "layers" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-150">
                <LayersInspector
                  activeSlide={activeSlide}
                  selectedElement={selectedElement}
                  isFooterSelected={isFooterSelected}
                  onSelectLayer={handleSelectLayer}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                />
              </div>
            )}

            {/* Layer Properties */}
            {currentView === "layer" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-150">
                <LayerInspector
                  activeSlide={activeSlide}
                  selectedElement={selectedElement}
                  isFooterSelected={isFooterSelected}
                  editorMode={editorMode}
                  updateSlideElement={updateSlideElement}
                  updateSlideFooter={updateSlideFooter}
                  onBack={handleBack}
                />
              </div>
            )}
          </div>
        </ScrollArea.Viewport>

        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex select-none touch-none p-0.5 transition-colors
            w-2 hover:w-2.5 hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.04)]"
        >
          <ScrollArea.Thumb
            className="flex-1 rounded-full relative
              bg-neutral-300 dark:bg-neutral-600
              hover:bg-neutral-400 dark:hover:bg-neutral-500
              before:content-[''] before:absolute before:top-1/2 before:left-1/2
              before:-translate-x-1/2 before:-translate-y-1/2
              before:w-full before:h-full before:min-w-[20px] before:min-h-[20px]"
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  );
}
