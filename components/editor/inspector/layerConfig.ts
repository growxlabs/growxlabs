import { ElementKey, LayerConfig, LayerGroupConfig, PropertySectionId } from './inspectorTypes';

export const LAYER_CONFIGS: Record<ElementKey | "footer", LayerConfig> = {
  category: {
    key: "category",
    label: "Category Tag",
    group: "content",
    icon: "tag", // lucide icon name
    type: "text",
    sections: ["content", "typography", "position", "fill", "border", "effects"]
  },
  headline: {
    key: "headline",
    label: "Headline Title",
    group: "content",
    icon: "type",
    type: "text",
    sections: ["content", "typography", "alignment", "position", "color", "effects"]
  },
  featuredImage: {
    key: "featuredImage",
    label: "Featured Media",
    group: "media",
    icon: "image",
    type: "image",
    sections: ["image", "cropFit", "position", "appearance", "border", "effects"]
  },
  secondaryImage: {
    key: "secondaryImage",
    label: "Secondary Media",
    group: "media",
    icon: "image",
    type: "image",
    sections: ["image", "cropFit", "position", "appearance", "border", "effects"]
  },
  body: {
    key: "body",
    label: "Body Text",
    group: "content",
    icon: "align-left",
    type: "text",
    sections: ["content", "typography", "alignment", "position", "color"]
  },
  bullets: {
    key: "bullets",
    label: "Bullets List",
    group: "content",
    icon: "list",
    type: "text",
    sections: ["items", "bulletStyle", "typography", "position", "color"]
  },
  quote: {
    key: "quote",
    label: "Quote Box",
    group: "content",
    icon: "quote",
    type: "text",
    sections: ["quoteContent", "typography", "fill", "border", "radius", "position", "effects"]
  },
  cta: {
    key: "cta",
    label: "CTA Button",
    group: "actions",
    icon: "mouse-pointer-click",
    type: "button",
    sections: ["ctaSettings", "typography", "fill", "border", "radius", "position", "effects"]
  },
  logo: {
    key: "logo",
    label: "Logo Icon",
    group: "media",
    icon: "star", // Generic icon for logo
    type: "brand",
    sections: ["image", "cropFit", "position", "appearance", "effects"]
  },
  divider: {
    key: "divider",
    label: "Divider Line",
    group: "decoration",
    icon: "minus",
    type: "shape",
    sections: ["position", "stroke", "appearance"]
  },
  author: {
    key: "author",
    label: "Author Profile",
    group: "brand",
    icon: "user",
    type: "container",
    sections: ["content", "typography", "position", "appearance"]
  },
  footer: {
    key: "footer",
    label: "Footer / Brand",
    group: "brand",
    icon: "layout-bottombar",
    type: "container",
    sections: ["content", "typography", "color"]
  }
};

export const LAYER_GROUPS: LayerGroupConfig[] = [
  {
    id: "content",
    label: "Content",
    layers: ["category", "headline", "body", "bullets", "quote"]
  },
  {
    id: "media",
    label: "Media",
    layers: ["featuredImage", "logo"]
  },
  {
    id: "actions",
    label: "Actions",
    layers: ["cta"]
  },
  {
    id: "decoration",
    label: "Decoration",
    layers: ["divider"]
  },
  {
    id: "brand",
    label: "Brand",
    layers: ["author", "footer"]
  }
];

export const DEFAULT_OPEN_SECTIONS: Record<string, PropertySectionId[]> = {
  text: ["content", "typography"],
  image: ["image", "cropFit"],
  shape: ["stroke", "appearance"],
  button: ["ctaSettings", "fill"],
  container: ["content", "appearance"],
  brand: ["image", "appearance"]
};
