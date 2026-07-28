import { LayerType } from "@/types/editorContracts";
import {
  TextLayerPropertiesSchema,
  ImageLayerPropertiesSchema,
  BulletLayerPropertiesSchema,
  QuoteLayerPropertiesSchema,
  CtaLayerPropertiesSchema,
  LayerPropertiesSchema
} from "../schemas/editorSchemas";

export interface LayerDefinition {
  type: LayerType;
  label: string;
  group: "content" | "media" | "actions" | "decoration" | "brand";
  defaultProperties: Record<string, any>;
  propertySchema: any;
  sections: string[];
}

export const LAYER_REGISTRY: Record<LayerType, LayerDefinition> = {
  category: {
    type: "category",
    label: "Category Tag",
    group: "content",
    defaultProperties: {
      text: "AI NEWS",
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: "700",
      color: "#888888",
      uppercase: true,
      align: "left"
    },
    propertySchema: TextLayerPropertiesSchema,
    sections: ["content", "typography", "position", "appearance"]
  },
  headline: {
    type: "headline",
    label: "Headline Title",
    group: "content",
    defaultProperties: {
      text: "Moonshot built the world's largest open model",
      fontFamily: "Inter",
      fontSize: 32,
      fontWeight: "800",
      lineHeight: 1.1,
      color: "#000000",
      align: "left"
    },
    propertySchema: TextLayerPropertiesSchema,
    sections: ["content", "typography", "position", "appearance"]
  },
  featuredImage: {
    type: "featuredImage",
    label: "Featured Media",
    group: "media",
    defaultProperties: {
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      objectFit: "cover",
      borderRadius: 12,
      borderWidth: 0,
      borderColor: "#e2e8f0",
      brightness: 100,
      contrast: 100,
      shadowEnabled: false
    },
    propertySchema: ImageLayerPropertiesSchema,
    sections: ["image", "cropFit", "position", "border", "effects"]
  },
  body: {
    type: "body",
    label: "Body Text",
    group: "content",
    defaultProperties: {
      text: "Kimi k2 is a 1 trillion parameter Mixture-of-Experts model.",
      fontFamily: "Inter",
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 1.4,
      color: "#333333",
      align: "left"
    },
    propertySchema: TextLayerPropertiesSchema,
    sections: ["content", "typography", "position", "appearance"]
  },
  bullets: {
    type: "bullets",
    label: "Bullets List",
    group: "content",
    defaultProperties: {
      bulletStyle: "check",
      spacing: 12,
      items: ["1 Trillion Parameters", "Mixture of Experts Architecture", "State of the art reasoning"]
    },
    propertySchema: BulletLayerPropertiesSchema,
    sections: ["items", "bulletStyle", "typography", "position"]
  },
  quote: {
    type: "quote",
    label: "Quote Box",
    group: "content",
    defaultProperties: {
      text: "This is a massive leap forward for open source AI.",
      author: "Tech Crunch",
      backgroundColor: "#f8fafc",
      borderColor: "#e2e8f0",
      borderRadius: 12
    },
    propertySchema: QuoteLayerPropertiesSchema,
    sections: ["quoteContent", "typography", "appearance", "border", "radius"]
  },
  cta: {
    type: "cta",
    label: "CTA Button",
    group: "actions",
    defaultProperties: {
      text: "Read Full Article →",
      link: "https://growxlabs.com",
      backgroundColor: "#1687f8",
      textColor: "#ffffff",
      borderRadius: 8
    },
    propertySchema: CtaLayerPropertiesSchema,
    sections: ["ctaSettings", "typography", "appearance", "radius"]
  },
  logo: {
    type: "logo",
    label: "Logo Icon",
    group: "media",
    defaultProperties: {
      logoUrl: "/logo.png",
      objectFit: "contain"
    },
    propertySchema: ImageLayerPropertiesSchema,
    sections: ["image", "position", "appearance"]
  },
  divider: {
    type: "divider",
    label: "Divider Line",
    group: "decoration",
    defaultProperties: {
      color: "#e2e8f0",
      thickness: 1
    },
    propertySchema: LayerPropertiesSchema,
    sections: ["stroke", "position"]
  },
  author: {
    type: "author",
    label: "Author Profile",
    group: "brand",
    defaultProperties: {
      name: "GrowXLabs Editorial",
      avatarUrl: ""
    },
    propertySchema: LayerPropertiesSchema,
    sections: ["content", "typography"]
  },
  footer: {
    type: "footer",
    label: "Footer / Brand",
    group: "brand",
    defaultProperties: {
      brandName: "GROWXLABS",
      dividerEnabled: true,
      pageNumberEnabled: true,
      opacity: 1,
      color: "#000000"
    },
    propertySchema: LayerPropertiesSchema,
    sections: ["content", "typography", "appearance"]
  }
};
