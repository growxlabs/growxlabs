"use client";

import React, { useState, useMemo } from "react";
import { Search } from "@/components/editor/icons/StudioIcons";
import { LayerGroup } from "./LayerGroup";
import { LayerRow } from "./LayerRow";
import type { Slide, ElementKey } from "./inspectorTypes";
import { LAYER_GROUPS, LAYER_CONFIGS } from "./layerConfig";

interface LayerListProps {
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  onSelectLayer: (key: ElementKey | null, isFooter?: boolean) => void;
  onToggleVisibility: (key: ElementKey | "footer") => void;
  onToggleLock: (key: ElementKey) => void;
}

export function LayerList({
  activeSlide,
  selectedElement,
  isFooterSelected,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
}: LayerListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!LAYER_GROUPS) return [];

    return LAYER_GROUPS.map((group) => {
      const filteredLayers = group.layers.filter((layerKey: ElementKey | "footer") => {
        const config = LAYER_CONFIGS[layerKey];
        if (!config) return false;
        return config.label.toLowerCase().includes(searchQuery.toLowerCase());
      });
      return {
        ...group,
        layers: filteredLayers,
      };
    }).filter((group) => group.layers.length > 0);
  }, [searchQuery]);

  return (
    <div className="flex flex-col w-full">
      {/* Search */}
      <div className="px-3 py-2 border-b border-neutral-100 dark:border-[var(--inspector-border)] shrink-0">
        <div className="relative flex items-center w-full h-[34px] bg-neutral-50 dark:bg-[rgba(255,255,255,0.04)] border border-neutral-200 dark:border-[rgba(255,255,255,0.06)] focus-within:border-[#1687f8] rounded-[9px] transition-colors">
          <Search size={14} className="absolute left-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search layers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-8 pr-3 text-xs bg-transparent outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Layer groups */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {filteredGroups.map((group) => {
          // Separate footer from regular layers
          const regularLayers = group.layers.filter((k: ElementKey | "footer") => k !== "footer");
          const hasFooter = group.layers.includes("footer");

          return (
            <LayerGroup
              key={group.id}
              label={group.label}
              count={regularLayers.length + (hasFooter ? 1 : 0)}
              defaultOpen
            >
              {regularLayers.map((layerKey: ElementKey | "footer") => {
                const elementKey = layerKey as ElementKey;
                const element = activeSlide[elementKey];
                const config = LAYER_CONFIGS[layerKey];
                if (!element || !config) return null;

                return (
                  <LayerRow
                    key={layerKey}
                    layerKey={layerKey}
                    label={config.label}
                    type={config.type}
                    isSelected={selectedElement === elementKey}
                    isVisible={element.visible}
                    isLocked={element.locked}
                    onClick={() => onSelectLayer(elementKey, false)}
                    onToggleVisibility={() => onToggleVisibility(elementKey)}
                    onToggleLock={() => onToggleLock(elementKey)}
                  />
                );
              })}

              {hasFooter && activeSlide.footer && (
                <LayerRow
                  layerKey="footer"
                  label="Footer / Brand"
                  type="container"
                  isSelected={isFooterSelected}
                  isVisible={activeSlide.footer.opacity > 0}
                  isLocked={false}
                  onClick={() => onSelectLayer(null, true)}
                  onToggleVisibility={() => onToggleVisibility("footer")}
                  onToggleLock={() => {}}
                />
              )}
            </LayerGroup>
          );
        })}
      </div>
    </div>
  );
}
