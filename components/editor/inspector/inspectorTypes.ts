// Re-export element types
export interface ElementStyle {
  x: number; y: number; width: number; height: number;
  visible: boolean; locked: boolean; opacity: number; rotation: number;
  align: "left" | "center" | "right";
  fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number;
  color: string; fontWeight: string; uppercase?: boolean; zIndex: number;
  padding?: number; margin?: number;
}

export interface ImageElementStyle extends ElementStyle {
  mediaUrl: string; objectFit: "cover" | "contain" | "fill";
  brightness: number; contrast: number; borderRadius: number;
  borderWidth: number; borderColor: string; shadowEnabled?: boolean;
}

export interface BulletElementStyle extends ElementStyle {
  bulletStyle: "check" | "dot" | "number"; spacing: number; items: string[];
}

export interface QuoteElementStyle extends ElementStyle {
  text: string; author: string; borderRadius: number;
  borderColor: string; backgroundColor: string;
}

export interface CtaElementStyle extends ElementStyle {
  text: string; link: string; backgroundColor: string;
  textColor: string; borderRadius: number;
}

export interface Slide {
  id: string;
  category: ElementStyle & { text: string };
  headline: ElementStyle & { text: string; maxLines: number; autoScale: boolean };
  featuredImage: ImageElementStyle;
  body: ElementStyle & { text: string; maxLines: number; autoScale: boolean };
  bullets: BulletElementStyle;
  quote: QuoteElementStyle;
  cta: CtaElementStyle;
  logo: ElementStyle & { logoUrl: string };
  divider: ElementStyle & { color: string; thickness: number };
  author: ElementStyle & { name: string; avatarUrl: string };
  footer: {
    brandName: string;
    logoEnabled: boolean;
    dividerEnabled: boolean;
    pageNumberEnabled: boolean;
    opacity: number;
    color: string;
    align: "left" | "center" | "right";
  };
}

export type ElementKey = "category" | "headline" | "featuredImage" | "body" | "bullets" | "quote" | "cta" | "logo" | "divider" | "author";

export type InspectorView = "document" | "layers" | "layer";

export type LayerGroupId = "content" | "media" | "actions" | "decoration" | "brand";

export interface LayerConfig {
  key: ElementKey | "footer";
  label: string;
  group: LayerGroupId;
  icon: string; // lucide icon name
  type: "text" | "image" | "shape" | "button" | "container" | "brand";
  sections: PropertySectionId[];
}

export type PropertySectionId = "content" | "typography" | "position" | "size" | "fill" | "appearance" | "border" | "radius" | "effects" | "image" | "cropFit" | "alignment" | "color" | "stroke" | "items" | "bulletStyle" | "quoteContent" | "ctaSettings" | "advanced";

export interface LayerGroupConfig {
  id: LayerGroupId;
  label: string;
  layers: (ElementKey | "footer")[];
}

export interface InspectorPanelProps {
  slides: Slide[];
  activeIndex: number;
  activeSlide: Slide;
  selectedElement: ElementKey | null;
  isFooterSelected: boolean;
  editorMode: "fixed" | "free";
  darkMode: boolean;
  setSelectedElement: (key: ElementKey | null) => void;
  setIsFooterSelected: (val: boolean) => void;
  updateSlideElement: (key: ElementKey, updates: any) => void;
  updateSlideFooter: (updates: Partial<Slide["footer"]>) => void;
  handleDownloadSlideRaster: (index: number, format: "png" | "jpeg") => void;
  handleDownloadSlideSvg: (index: number) => void;
  handleDownloadAllSlidesSvg: () => void;
  handleDownloadPdf: () => void;
  handleDownloadMp4: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
}
