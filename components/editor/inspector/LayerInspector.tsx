"use client";

import React, { useMemo } from "react";
import { Plus, Trash2 } from "@/components/editor/icons/StudioIcons";
import { PropertySectionRoot, PropertySection } from "./PropertySection";
import { DEFAULT_OPEN_SECTIONS, LAYER_CONFIGS } from "./layerConfig";
import { PropertyRow } from "./PropertyRow";
import { PropertyInput } from "./PropertyInput";
import { PropertyNumberInput } from "./PropertyNumberInput";
import { PropertySelect } from "./PropertySelect";
import { FontPicker } from "./controls/FontPicker";
import { AlignmentControl } from "./controls/AlignmentControl";
import { PositionControl } from "./controls/PositionControl";
import { ImageControl } from "./controls/ImageControl";
import { ColourPicker } from "./controls/ColourPicker";
import { OpacityControl } from "./controls/OpacityControl";
import { EffectsControl } from "./controls/EffectsControl";
import { RadiusControl } from "./controls/RadiusControl";
import type { Slide, ElementKey, PropertySectionId } from "./inspectorTypes";

interface LayerInspectorProps {
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  editorMode: "fixed" | "free";
  updateSlideElement: (key: ElementKey, updates: any) => void;
  updateSlideFooter: (updates: Partial<Slide["footer"]>) => void;
  onBack: () => void;
}

export function LayerInspector({
  activeSlide,
  selectedElement,
  isFooterSelected,
  editorMode,
  updateSlideElement,
  updateSlideFooter,
  onBack,
}: LayerInspectorProps) {

  // Get layer data with proper access
  const layerData: any = isFooterSelected
    ? activeSlide.footer
    : (selectedElement ? activeSlide[selectedElement] : null);

  const config = selectedElement ? LAYER_CONFIGS[selectedElement] : (isFooterSelected ? LAYER_CONFIGS["footer"] : null);

  const sections: PropertySectionId[] = useMemo(() => {
    if (isFooterSelected) return ["content", "typography", "color"] as PropertySectionId[];
    if (config) return config.sections || [];
    return [];
  }, [config, isFooterSelected]);

  const handleUpdate = (updates: any) => {
    if (isFooterSelected) {
      updateSlideFooter(updates);
    } else if (selectedElement) {
      updateSlideElement(selectedElement, updates);
    }
  };

  const title = isFooterSelected
    ? "Footer / Brand"
    : (config?.label || selectedElement || "Properties");

  // Only open the most important 1-2 sections to reduce clutter
  const defaultOpenSections: string[] = useMemo(() => {
    if (isFooterSelected) return ["content"];
    const layerType = config?.type || "text";
    const defaults = DEFAULT_OPEN_SECTIONS[layerType];
    // Only open first 2 sections max
    return defaults ? defaults.slice(0, 2) : ["content"];
  }, [config, isFooterSelected]);

  if (!layerData) return null;

  return (
    <div className="flex flex-col">
      {/* Property sections */}
      <PropertySectionRoot defaultValue={defaultOpenSections}>

        {/* CONTENT SECTION — text layers */}
        {sections.includes("content") && !isFooterSelected && (
          <PropertySection value="content" title="Content" summary={layerData.text ? `${String(layerData.text).slice(0, 20)}…` : undefined}>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full bg-neutral-50 dark:bg-[rgba(255,255,255,0.045)] border border-neutral-200 dark:border-[rgba(255,255,255,0.075)]
                  rounded-lg p-2.5 text-[12px] font-medium min-h-[48px] max-h-[140px]
                  focus:border-[#1687f8] focus:ring-1 focus:ring-[#1687f8]/20 focus:outline-none resize-y
                  text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
                value={layerData.text || layerData.name || ""}
                onChange={(e) => handleUpdate(layerData.text !== undefined ? { text: e.target.value } : { name: e.target.value })}
                placeholder="Enter content…"
              />
              <div className="text-right text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                {(layerData.text || layerData.name || "").length} characters
              </div>
            </div>
          </PropertySection>
        )}

        {/* CONTENT SECTION — footer */}
        {isFooterSelected && (
          <PropertySection value="content" title="Brand" summary={layerData.brandName || undefined}>
            <div className="flex flex-col gap-3">
              <PropertyRow label="Brand Name">
                <PropertyInput
                  value={layerData.brandName || ""}
                  onChange={(brandName: string) => handleUpdate({ brandName })}
                />
              </PropertyRow>
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100 dark:border-[var(--inspector-border)]">
                <label className="flex items-center justify-between text-[12px] cursor-pointer select-none">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">Show Divider</span>
                  <input
                    type="checkbox"
                    checked={layerData.dividerEnabled !== false}
                    onChange={(e) => handleUpdate({ dividerEnabled: e.target.checked })}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-[#1687f8] accent-[#1687f8]"
                  />
                </label>
                <label className="flex items-center justify-between text-[12px] cursor-pointer select-none">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">Page Numbers</span>
                  <input
                    type="checkbox"
                    checked={layerData.pageNumberEnabled !== false}
                    onChange={(e) => handleUpdate({ pageNumberEnabled: e.target.checked })}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-[#1687f8] accent-[#1687f8]"
                  />
                </label>
              </div>
            </div>
          </PropertySection>
        )}

        {/* TYPOGRAPHY SECTION */}
        {sections.includes("typography") && (
          <PropertySection value="typography" title="Typography" summary={`${layerData.fontFamily || "Inter"} · ${layerData.fontSize || 16}`}>
            <div className="flex flex-col gap-3">
              <PropertyRow label="Font">
                <FontPicker
                  value={layerData.fontFamily || "Inter"}
                  onChange={(fontFamily: string) => handleUpdate({ fontFamily })}
                />
              </PropertyRow>
              <div className="grid grid-cols-2 gap-2">
                <PropertySelect
                  options={[
                    { value: "100", label: "Thin" },
                    { value: "300", label: "Light" },
                    { value: "400", label: "Regular" },
                    { value: "500", label: "Medium" },
                    { value: "600", label: "Semi Bold" },
                    { value: "700", label: "Bold" },
                    { value: "800", label: "Extra Bold" },
                    { value: "900", label: "Black" },
                  ]}
                  value={layerData.fontWeight || "400"}
                  onValueChange={(fontWeight: string) => handleUpdate({ fontWeight })}
                />
                <PropertyNumberInput
                  value={layerData.fontSize || 16}
                  onChange={(fontSize: number) => handleUpdate({ fontSize })}
                  suffix="px"
                  min={8}
                  max={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PropertyNumberInput
                  prefix="LH"
                  value={layerData.lineHeight || 1.2}
                  onChange={(lineHeight: number) => handleUpdate({ lineHeight })}
                  step={0.1}
                  min={0.5}
                  max={3}
                />
                <PropertyNumberInput
                  prefix="LS"
                  value={layerData.letterSpacing || 0}
                  onChange={(letterSpacing: number) => handleUpdate({ letterSpacing })}
                  step={0.5}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <AlignmentControl
                  value={layerData.align || "left"}
                  onChange={(align: string) => handleUpdate({ align })}
                />
                <label className="flex items-center gap-2 text-[11px] cursor-pointer select-none text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={layerData.uppercase || false}
                    onChange={(e) => handleUpdate({ uppercase: e.target.checked })}
                    className="rounded accent-[#1687f8]"
                  />
                  AA
                </label>
              </div>
            </div>
          </PropertySection>
        )}

        {/* POSITION SECTION */}
        {sections.includes("position") && (
          <PropertySection value="position" title="Position & Size" summary={editorMode === "free" ? `${Math.round(layerData.x || 0)}, ${Math.round(layerData.y || 0)}` : "Fixed layout"}>
            <PositionControl
              x={layerData.x || 0}
              y={layerData.y || 0}
              width={layerData.width || 0}
              height={layerData.height || 0}
              onChange={(pos: any) => handleUpdate(pos)}
              disabled={editorMode === "fixed"}
            />
          </PropertySection>
        )}

        {/* IMAGE SECTION */}
        {sections.includes("image") && (
          <PropertySection value="image" title="Image Source">
            <ImageControl
              mediaUrl={layerData.mediaUrl || layerData.logoUrl || ""}
              objectFit={layerData.objectFit || "cover"}
              onUrlChange={(url: string) => handleUpdate(layerData.mediaUrl !== undefined ? { mediaUrl: url } : { logoUrl: url })}
              onFitChange={(fit: string) => handleUpdate({ objectFit: fit })}
            />
          </PropertySection>
        )}

        {/* CROP & FIT SECTION */}
        {sections.includes("cropFit") && (
          <PropertySection value="cropFit" title="Crop & Fit" summary={layerData.objectFit || "cover"}>
            <PropertyRow label="Fit">
              <PropertySelect
                options={[
                  { value: "cover", label: "Cover" },
                  { value: "contain", label: "Contain" },
                  { value: "fill", label: "Fill" },
                ]}
                value={layerData.objectFit || "cover"}
                onValueChange={(objectFit: string) => handleUpdate({ objectFit })}
              />
            </PropertyRow>
          </PropertySection>
        )}

        {/* APPEARANCE / COLOR SECTION */}
        {(sections.includes("appearance") || sections.includes("color") || sections.includes("fill")) && (
          <PropertySection
            value="appearance"
            title={sections.includes("fill") ? "Fill" : "Appearance"}
            summary={layerData.color || layerData.backgroundColor || undefined}
          >
            <div className="flex flex-col gap-3">
              <PropertyRow label="Color">
                <ColourPicker
                  color={layerData.color || layerData.backgroundColor || "#000000"}
                  onChange={(color: string) => handleUpdate(layerData.backgroundColor !== undefined ? { backgroundColor: color } : { color })}
                />
              </PropertyRow>
              {!isFooterSelected && (
                <PropertyRow label="Opacity">
                  <OpacityControl
                    value={typeof layerData.opacity === "number" ? layerData.opacity * 100 : 100}
                    onChange={(opacity: number) => handleUpdate({ opacity: opacity / 100 })}
                  />
                </PropertyRow>
              )}
            </div>
          </PropertySection>
        )}

        {/* BORDER SECTION */}
        {sections.includes("border") && (
          <PropertySection value="border" title="Border">
            <div className="flex flex-col gap-3">
              {layerData.borderColor !== undefined && (
                <PropertyRow label="Color">
                  <ColourPicker
                    color={layerData.borderColor || "#e2e8f0"}
                    onChange={(borderColor: string) => handleUpdate({ borderColor })}
                  />
                </PropertyRow>
              )}
              {layerData.borderWidth !== undefined && (
                <PropertyRow label="Width">
                  <PropertyNumberInput
                    value={layerData.borderWidth || 0}
                    onChange={(borderWidth: number) => handleUpdate({ borderWidth })}
                    suffix="px"
                    min={0}
                    max={20}
                  />
                </PropertyRow>
              )}
            </div>
          </PropertySection>
        )}

        {/* RADIUS SECTION */}
        {sections.includes("radius") && (
          <PropertySection value="radius" title="Corner Radius" summary={`${layerData.borderRadius || 0}px`}>
            <RadiusControl
              value={layerData.borderRadius || 0}
              onChange={(borderRadius: number) => handleUpdate({ borderRadius })}
            />
          </PropertySection>
        )}

        {/* EFFECTS SECTION */}
        {sections.includes("effects") && (
          <PropertySection value="effects" title="Effects" summary={layerData.shadowEnabled ? "Shadow" : "None"}>
            <EffectsControl
              brightness={layerData.brightness ?? 100}
              contrast={layerData.contrast ?? 100}
              shadowEnabled={layerData.shadowEnabled}
              onChange={(updates: any) => handleUpdate(updates)}
            />
          </PropertySection>
        )}

        {/* STROKE SECTION — divider */}
        {sections.includes("stroke") && (
          <PropertySection value="stroke" title="Stroke" summary={`${layerData.thickness || 1}px`}>
            <div className="flex flex-col gap-3">
              <PropertyRow label="Thickness">
                <PropertyNumberInput
                  value={layerData.thickness || 1}
                  onChange={(thickness: number) => handleUpdate({ thickness })}
                  suffix="px"
                  min={1}
                  max={20}
                />
              </PropertyRow>
              <PropertyRow label="Color">
                <ColourPicker
                  color={layerData.color || "#e2e8f0"}
                  onChange={(color: string) => handleUpdate({ color })}
                />
              </PropertyRow>
            </div>
          </PropertySection>
        )}

        {/* CTA SETTINGS SECTION */}
        {sections.includes("ctaSettings") && (
          <PropertySection value="ctaSettings" title="Button Settings">
            <div className="flex flex-col gap-3">
              <PropertyRow label="Label">
                <PropertyInput
                  value={layerData.text || ""}
                  onChange={(text: string) => handleUpdate({ text })}
                />
              </PropertyRow>
              <PropertyRow label="Link URL">
                <PropertyInput
                  value={layerData.link || ""}
                  onChange={(link: string) => handleUpdate({ link })}
                  placeholder="https://"
                />
              </PropertyRow>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Background</span>
                  <ColourPicker
                    color={layerData.backgroundColor || "#1687f8"}
                    onChange={(backgroundColor: string) => handleUpdate({ backgroundColor })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Text</span>
                  <ColourPicker
                    color={layerData.textColor || "#ffffff"}
                    onChange={(textColor: string) => handleUpdate({ textColor })}
                  />
                </div>
              </div>
              <PropertyRow label="Radius">
                <RadiusControl
                  value={layerData.borderRadius || 0}
                  onChange={(borderRadius: number) => handleUpdate({ borderRadius })}
                />
              </PropertyRow>
            </div>
          </PropertySection>
        )}

        {/* QUOTE CONTENT SECTION */}
        {sections.includes("quoteContent") && (
          <PropertySection value="quoteContent" title="Quote">
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full bg-neutral-50 dark:bg-[rgba(255,255,255,0.045)] border border-neutral-200 dark:border-[rgba(255,255,255,0.075)]
                  rounded-lg p-2.5 text-[12px] font-medium min-h-[60px] max-h-[140px]
                  focus:border-[#1687f8] focus:ring-1 focus:ring-[#1687f8]/20 focus:outline-none resize-y
                  text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
                value={layerData.text || ""}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                placeholder="Quote text…"
              />
              <PropertyRow label="Author">
                <PropertyInput
                  value={layerData.author || ""}
                  onChange={(author: string) => handleUpdate({ author })}
                />
              </PropertyRow>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Background</span>
                  <ColourPicker
                    color={layerData.backgroundColor || "#ffffff"}
                    onChange={(backgroundColor: string) => handleUpdate({ backgroundColor })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Border</span>
                  <ColourPicker
                    color={layerData.borderColor || "#e2e8f0"}
                    onChange={(borderColor: string) => handleUpdate({ borderColor })}
                  />
                </div>
              </div>
            </div>
          </PropertySection>
        )}

        {/* ITEMS SECTION — bullets */}
        {sections.includes("items") && (
          <PropertySection value="items" title="List Items" summary={`${(layerData.items || []).length} items`}>
            <div className="flex flex-col gap-2">
              {(layerData.items || []).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <PropertyInput
                    value={item}
                    onChange={(newVal: string) => {
                      const newItems = [...(layerData.items || [])];
                      newItems[idx] = newVal;
                      handleUpdate({ items: newItems });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newItems = [...(layerData.items || [])];
                      newItems.splice(idx, 1);
                      handleUpdate({ items: newItems });
                    }}
                    className="p-1.5 text-red-500 hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.06)] rounded-md opacity-60 hover:opacity-100 transition-all cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleUpdate({ items: [...(layerData.items || []), "New item"] })}
                className="flex items-center justify-center gap-1.5 py-2 mt-1 text-[11px] font-medium
                  text-[#1687f8] border border-dashed border-neutral-200 dark:border-[rgba(255,255,255,0.08)]
                  rounded-lg hover:bg-neutral-50 dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer bg-transparent"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>
          </PropertySection>
        )}

        {/* BULLET STYLE SECTION */}
        {sections.includes("bulletStyle") && (
          <PropertySection value="bulletStyle" title="Bullet Style" summary={layerData.bulletStyle || "check"}>
            <PropertyRow label="Style">
              <PropertySelect
                options={[
                  { value: "check", label: "Checkmarks" },
                  { value: "dot", label: "Dots" },
                  { value: "number", label: "Numbers" },
                ]}
                value={layerData.bulletStyle || "check"}
                onValueChange={(bulletStyle: string) => handleUpdate({ bulletStyle })}
              />
            </PropertyRow>
            <PropertyRow label="Spacing">
              <PropertyNumberInput
                value={layerData.spacing || 8}
                onChange={(spacing: number) => handleUpdate({ spacing })}
                suffix="px"
                min={0}
                max={40}
              />
            </PropertyRow>
          </PropertySection>
        )}

      </PropertySectionRoot>
    </div>
  );
}
