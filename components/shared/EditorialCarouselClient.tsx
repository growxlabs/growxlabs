"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Settings, 
  Palette, 
  Edit3, 
  RefreshCw, 
  Check, 
  Info, 
  Type, 
  LayoutGrid, 
  Upload, 
  Layers as LayersIcon, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Grid, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  CheckSquare,
  Quote as QuoteIcon,
  Play,
  Share2,
  ChevronDown,
  RotateCcw,
  Undo,
  Redo,
  Sliders,
  Sparkles,
  Smartphone,
  Eye as ViewIcon,
  MousePointer
} from "lucide-react";
import { toast } from "sonner";

const isVideo = (url?: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) !== null || url.startsWith("data:video/");
};

const stripHtmlTags = (str?: string) => {
  if (!str) return "";
  return str.replace(/<\/?[^>]+(>|$)/g, "");
};

const renderFormattedText = (text?: string) => {
  if (!text) return "";
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

// ==========================================
// INTERFACES & SCHEMAS
// ==========================================

interface ElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  rotation: number;
  align: "left" | "center" | "right";
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  fontWeight: string;
  uppercase?: boolean;
  zIndex: number;
  padding?: number;
  margin?: number;
}

interface ImageElementStyle extends ElementStyle {
  mediaUrl: string;
  objectFit: "cover" | "contain" | "fill";
  brightness: number;
  contrast: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowEnabled?: boolean;
}

interface BulletElementStyle extends ElementStyle {
  bulletStyle: "check" | "dot" | "number";
  spacing: number;
  items: string[];
}

interface QuoteElementStyle extends ElementStyle {
  text: string;
  author: string;
  borderRadius: number;
  borderColor: string;
  backgroundColor: string;
}

interface CtaElementStyle extends ElementStyle {
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
}

interface Slide {
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

type ElementKey = "category" | "headline" | "featuredImage" | "body" | "bullets" | "quote" | "cta" | "logo" | "divider" | "author";

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Safe Area margins
const SAFE_TOP = 60;
const SAFE_BOTTOM = 70;
const SAFE_LEFT = 72;
const SAFE_RIGHT = 72;
const SAFE_WIDTH = CANVAS_WIDTH - SAFE_LEFT - SAFE_RIGHT; // 936px

const DEFAULT_FONTS = [
  { name: "Inter", value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  { name: "Outfit", value: "'Outfit', sans-serif" },
  { name: "SF Mono", value: "'SF Mono', 'Fira Code', monospace" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Neue Haas Grotesk", value: "'Neue Haas Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }
];

const DEFAULT_SLIDE = (index: number): Slide => ({
  id: `slide-${Date.now()}-${Math.random()}`,
  category: {
    text: "AI NEWS",
    x: SAFE_LEFT,
    y: SAFE_TOP,
    width: SAFE_WIDTH,
    height: 30,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
    letterSpacing: 2,
    color: "#888888",
    fontWeight: "800",
    uppercase: true,
    zIndex: 10
  },
  headline: {
    text: "Moonshot built the world's largest open model",
    x: SAFE_LEFT,
    y: 110,
    width: SAFE_WIDTH,
    height: 150,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 44,
    lineHeight: 1.08,
    letterSpacing: -1.2,
    color: "#000000",
    fontWeight: "900",
    maxLines: 3,
    autoScale: true,
    zIndex: 11
  },
  featuredImage: {
    mediaUrl: "",
    objectFit: "contain",
    brightness: 100,
    contrast: 100,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowEnabled: true,
    x: SAFE_LEFT,
    y: 292,
    width: SAFE_WIDTH,
    height: 470,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "center",
    fontFamily: "inherit",
    fontSize: 14,
    lineHeight: 1.2,
    letterSpacing: 0,
    color: "#000000",
    fontWeight: "normal",
    zIndex: 5
  },
  body: {
    text: `Kimi K3 is a 2.8 trillion parameter Mixture-of-Experts model, the largest open-weight AI system ever released. It runs a 1M token context, handles text and images, and lands close to the Western frontier.`,
    x: SAFE_LEFT,
    y: 802,
    width: SAFE_WIDTH,
    height: 180,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 22,
    lineHeight: 1.5,
    letterSpacing: -0.2,
    color: "#111827",
    fontWeight: "400",
    maxLines: 6,
    autoScale: true,
    zIndex: 12
  },
  bullets: {
    bulletStyle: "check",
    spacing: 12,
    items: [
      "2.8 Trillion parameters Mixture-of-Experts",
      "Native 1 Million token context window",
      "Multi-modal: supports text and image inputs"
    ],
    x: SAFE_LEFT,
    y: 990,
    width: SAFE_WIDTH,
    height: 120,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    lineHeight: 1.5,
    letterSpacing: 0,
    color: "#111827",
    fontWeight: "500",
    zIndex: 13
  },
  quote: {
    text: "This model marks a turning point in open-source AI capabilities.",
    author: "GrowXLabs Research Team",
    borderRadius: 16,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    x: SAFE_LEFT,
    y: 802,
    width: SAFE_WIDTH,
    height: 160,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 22,
    lineHeight: 1.4,
    letterSpacing: -0.5,
    color: "#000000",
    fontWeight: "700",
    zIndex: 14,
    padding: 24
  },
  cta: {
    text: "Read the Full Report",
    link: "https://growxlabs.tech/blog",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    borderRadius: 12,
    x: SAFE_LEFT,
    y: 1100,
    width: 320,
    height: 56,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "center",
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 1.2,
    letterSpacing: 1,
    color: "#ffffff",
    fontWeight: "700",
    zIndex: 15,
    padding: 16
  },
  logo: {
    logoUrl: "",
    x: SAFE_LEFT,
    y: SAFE_TOP,
    width: 48,
    height: 48,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "inherit",
    fontSize: 12,
    lineHeight: 1,
    letterSpacing: 0,
    color: "#000000",
    fontWeight: "normal",
    zIndex: 8
  },
  divider: {
    color: "#e5e7eb",
    thickness: 2,
    x: SAFE_LEFT,
    y: 275,
    width: SAFE_WIDTH,
    height: 2,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "center",
    fontFamily: "inherit",
    fontSize: 12,
    lineHeight: 1,
    letterSpacing: 0,
    fontWeight: "normal",
    zIndex: 4
  },
  author: {
    name: "Sai Varshith Naidu",
    avatarUrl: "",
    x: SAFE_LEFT,
    y: 740,
    width: 250,
    height: 40,
    visible: false,
    locked: false,
    opacity: 1,
    rotation: 0,
    align: "left",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
    letterSpacing: 0,
    color: "#374151",
    fontWeight: "600",
    zIndex: 9
  },
  footer: {
    brandName: "GrowxLabs",
    logoEnabled: true,
    dividerEnabled: true,
    pageNumberEnabled: true,
    opacity: 1,
    color: "#000000",
    align: "left"
  }
});

// ==========================================
// TEMPLATE PRESETS
// ==========================================

const TEMPLATE_PRESETS = [
  {
    id: "ai-news",
    name: "AI News Feed",
    category: "News",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "AI NEWS", visible: true },
      headline: { ...slide.headline, text: "Moonshot built the world's largest open model", visible: true },
      featuredImage: { ...slide.featuredImage, visible: true },
      body: { ...slide.body, text: "Kimi K3 is a 2.8 trillion parameter Mixture-of-Experts model, the largest open-weight AI system ever released.", visible: true },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: false },
      author: { ...slide.author, visible: false },
      divider: { ...slide.divider, visible: false }
    })
  },
  {
    id: "research",
    name: "Research Insights",
    category: "Academic",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "RESEARCH STUDY", visible: true },
      headline: { ...slide.headline, text: "Decentralized Training Runs Over Heterogeneous Networks", visible: true },
      featuredImage: { ...slide.featuredImage, visible: false },
      body: { ...slide.body, text: "Our empirical study shows decentralized networks can achieve up to 84% baseline efficiency under model compression pipelines.", visible: true },
      bullets: { ...slide.bullets, visible: true },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: false }
    })
  },
  {
    id: "services",
    name: "Product & Services",
    category: "Marketing",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "CORE SERVICES", visible: true },
      headline: { ...slide.headline, text: "End-to-End AI Engineering & Agent Orchestration", visible: true },
      featuredImage: { ...slide.featuredImage, visible: true, height: 350 },
      body: { ...slide.body, text: "We configure multi-agent networks, clean pipeline nodes, and build high-performance search infrastructures tailored to your CRM workflow.", visible: true },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: true }
    })
  },
  {
    id: "quote",
    name: "Editorial Quote",
    category: "Social",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "EDITORIAL QUOTE", visible: true },
      headline: { ...slide.headline, text: "What our team says about pipeline safety:", visible: true },
      featuredImage: { ...slide.featuredImage, visible: false },
      body: { ...slide.body, visible: false },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: true },
      cta: { ...slide.cta, visible: false }
    })
  }
];

export function EditorialCarouselClient() {
  const [slides, setSlides] = useState<Slide[]>([DEFAULT_SLIDE(0)]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(null);
  const [isFooterSelected, setIsFooterSelected] = useState(false);
  const [editorMode, setEditorMode] = useState<"fixed" | "free">("fixed");
  
  // Viewport Control
  const [zoomScale, setZoomScale] = useState(0.48);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Left panel collapse settings
  const [leftTab, setLeftTab] = useState<"slides" | "templates" | "brand">("slides");
  
  // App states
  const [projectName, setProjectName] = useState("GrowXLabs Editorial Post");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [history, setHistory] = useState<Slide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Canvas interaction refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; elemX: number; elemY: number } | null>(null);
  const resizeStartRef = useRef<{ startX: number; startY: number; elemW: number; elemH: number } | null>(null);

  const activeSlide = slides[activeIndex] || DEFAULT_SLIDE(0);

  // Push new state to history stack
  const saveHistory = (newSlides: Slide[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(newSlides))]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      toast.success("Undo successful");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let localUrl = "";
    try {
      // 1. Create a local preview immediately for instant UI feedback
      localUrl = URL.createObjectURL(file);
      updateSlideElement("featuredImage", { mediaUrl: localUrl });
    } catch (err) {
      console.error("Local preview failed:", err);
    }

    const uploadToast = toast.loading("Saving media asset to database...");

    try {
      // 2. Upload file to server-side API
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Server responded with error status");
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("No URL returned from server");
      }

      // 3. Update the slide element with the persistent public URL from Supabase
      updateSlideElement("featuredImage", { mediaUrl: data.url });
      
      // Clean up the local blob preview URL since we now have the permanent link
      if (localUrl) {
        try {
          URL.revokeObjectURL(localUrl);
        } catch (e) {
          // Ignore revoke error
        }
      }

      toast.success("Asset saved to database successfully!", { id: uploadToast });
    } catch (err) {
      console.error("Database upload failed:", err);
      toast.error("Failed to store media in database, using local session preview.", { id: uploadToast });
    }
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(slides))]);
      setHistoryIndex(0);
    }
  }, []);

  // Load Google Fonts stylesheet dynamically on webpage
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Update layout positions when activeSlide changes or when layout mode toggles
  useEffect(() => {
    if (editorMode === "fixed") {
      const updated = { ...activeSlide };
      
      // Strict Grid Offsets
      updated.category.x = SAFE_LEFT;
      updated.category.y = SAFE_TOP;
      updated.category.width = SAFE_WIDTH;

      updated.headline.x = SAFE_LEFT;
      updated.headline.y = SAFE_TOP + updated.category.height + 20;
      updated.headline.width = SAFE_WIDTH;

      updated.featuredImage.x = SAFE_LEFT;
      updated.featuredImage.y = 292;
      updated.featuredImage.width = SAFE_WIDTH;
      updated.featuredImage.height = 470;

      updated.body.x = SAFE_LEFT;
      updated.body.y = updated.featuredImage.y + updated.featuredImage.height + 40;
      updated.body.width = SAFE_WIDTH;

      updated.quote.x = SAFE_LEFT;
      updated.quote.y = updated.featuredImage.y + updated.featuredImage.height + 40;
      updated.quote.width = SAFE_WIDTH;

      updated.bullets.x = SAFE_LEFT;
      updated.bullets.y = updated.body.y + (updated.body.visible ? updated.body.height + 20 : 0);
      updated.bullets.width = SAFE_WIDTH;

      updated.cta.x = SAFE_LEFT;
      updated.cta.y = updated.bullets.y + (updated.bullets.visible ? updated.bullets.height + 20 : 40);

      updated.logo.x = SAFE_LEFT;
      updated.logo.y = SAFE_TOP;

      updated.divider.x = SAFE_LEFT;
      updated.divider.y = 275;
      updated.divider.width = SAFE_WIDTH;

      updated.author.x = SAFE_LEFT;
      updated.author.y = 770;

      setSlides(prev => prev.map((s, i) => i === activeIndex ? updated : s));
    }
  }, [
    activeSlide.category.height, 
    activeSlide.category.visible,
    activeSlide.headline.height, 
    activeSlide.headline.visible,
    activeSlide.featuredImage.height,
    activeSlide.featuredImage.visible,
    activeSlide.body.height,
    activeSlide.body.visible,
    activeSlide.bullets.height,
    activeSlide.bullets.visible,
    editorMode, 
    activeIndex
  ]);

  // ==========================================
  // STATE MANAGEMENT HELPERS
  // ==========================================

  const updateSlideElement = (key: ElementKey, updates: any) => {
    const newSlides = slides.map((s, idx) => {
      if (idx !== activeIndex) return s;
      return {
        ...s,
        [key]: {
          ...s[key],
          ...updates
        }
      };
    });
    setSlides(newSlides);
    saveHistory(newSlides);
  };

  const updateSlideFooter = (updates: Partial<Slide["footer"]>) => {
    const newSlides = slides.map((s, idx) => {
      if (idx !== activeIndex) return s;
      return {
        ...s,
        footer: {
          ...s.footer,
          ...updates
        }
      };
    });
    setSlides(newSlides);
    saveHistory(newSlides);
  };

  const addSlide = () => {
    const newSlides = [...slides, DEFAULT_SLIDE(slides.length)];
    setSlides(newSlides);
    setActiveIndex(newSlides.length - 1);
    saveHistory(newSlides);
    toast.success("Added new slide");
  };

  const duplicateSlide = (idx: number) => {
    const clone = JSON.parse(JSON.stringify(slides[idx]));
    clone.id = `slide-${Date.now()}-${Math.random()}`;
    const newSlides = [...slides];
    newSlides.splice(idx + 1, 0, clone);
    setSlides(newSlides);
    setActiveIndex(idx + 1);
    saveHistory(newSlides);
    toast.success("Duplicated slide");
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      toast.error("Cannot delete the only remaining slide.");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    setActiveIndex(Math.max(0, idx - 1));
    saveHistory(newSlides);
    toast.success("Deleted slide");
  };

  const applyPreset = (presetId: string) => {
    const preset = TEMPLATE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const newSlides = slides.map((s, i) => i === activeIndex ? preset.setup(s) : s);
    setSlides(newSlides);
    saveHistory(newSlides);
    toast.success(`Applied ${preset.name} template layout`);
  };

  // ==========================================
  // ELEMENT POINTER HANDLERS (DRAG & RESIZE)
  // ==========================================

  const handleElementMouseDown = (e: React.MouseEvent, key: ElementKey) => {
    if (e.button !== 0) return;
    setSelectedElement(key);
    setIsFooterSelected(false);
    
    if (editorMode === "fixed") return;
    
    const elem = activeSlide[key];
    if (elem.locked) return;

    e.stopPropagation();
    
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: elem.x,
      elemY: elem.y
    };

    document.addEventListener("mousemove", handleElementMouseMove);
    document.addEventListener("mouseup", handleElementMouseUp);
  };

  const handleElementMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !selectedElement) return;

    const dx = (e.clientX - dragStartRef.current.startX) / zoomScale;
    const dy = (e.clientY - dragStartRef.current.startY) / zoomScale;
    
    let newX = Math.round(dragStartRef.current.elemX + dx);
    let newY = Math.round(dragStartRef.current.elemY + dy);

    if (showGuides) {
      if (Math.abs(newX - SAFE_LEFT) < 10) newX = SAFE_LEFT;
      if (Math.abs((newX + activeSlide[selectedElement].width) - (CANVAS_WIDTH - SAFE_RIGHT)) < 10) {
        newX = CANVAS_WIDTH - SAFE_RIGHT - activeSlide[selectedElement].width;
      }
    }

    updateSlideElement(selectedElement, { x: newX, y: newY });
  };

  const handleElementMouseUp = () => {
    dragStartRef.current = null;
    document.removeEventListener("mousemove", handleElementMouseMove);
    document.removeEventListener("mouseup", handleElementMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, key: ElementKey) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedElement(key);
    setIsFooterSelected(false);

    if (editorMode === "fixed") return;
    
    const elem = activeSlide[key];
    if (elem.locked) return;

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemW: elem.width,
      elemH: elem.height
    };

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizeStartRef.current || !selectedElement) return;

    const dx = (e.clientX - resizeStartRef.current.startX) / zoomScale;
    const dy = (e.clientY - resizeStartRef.current.startY) / zoomScale;

    const newW = Math.max(50, Math.round(resizeStartRef.current.elemW + dx));
    const newH = Math.max(20, Math.round(resizeStartRef.current.elemH + dy));

    updateSlideElement(selectedElement, { width: newW, height: newH });
  };

  const handleResizeMouseUp = () => {
    resizeStartRef.current = null;
    document.removeEventListener("mousemove", handleResizeMouseMove);
    document.removeEventListener("mouseup", handleResizeMouseUp);
  };

  // ==========================================
  // EXPORT ENGINE
  // ==========================================

  const buildSvgString = (slide: Slide, index: number, includeFonts = true, videoFrameUrl?: string) => {
    const fontsMarkup = includeFonts ? DEFAULT_FONTS.map(f => 
      `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;600;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');`
    ).join("\n") : "";

    const renderTextMarkup = (el: ElementStyle & { text: string }) => {
      if (!el.visible) return "";
      const textTransform = el.uppercase ? "uppercase" : "none";
      const alignClass = el.align === "center" ? "text-center justify-center" : el.align === "right" ? "text-right justify-end" : "text-left justify-start";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          display: flex;
          align-items: flex-start;
          text-align: ${el.align};
          font-family: ${el.fontFamily};
          font-size: ${el.fontSize}px;
          font-weight: ${el.fontWeight};
          line-height: ${el.lineHeight};
          letter-spacing: ${el.letterSpacing}px;
          color: ${el.color};
          text-transform: ${textTransform};
          opacity: ${el.opacity};
          transform: rotate(${el.rotation}deg);
          box-sizing: border-box;
          overflow: hidden;
          z-index: ${el.zIndex || 1};
        " class="${alignClass}">
          ${el.text}
        </div>
      `;
    };

    const renderImageMarkup = (el: ImageElementStyle) => {
      if (!el.visible) return "";
      const borderStyle = el.borderWidth > 0 ? `border: ${el.borderWidth}px solid ${el.borderColor};` : "";
      const shadowStyle = el.shadowEnabled ? "box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);" : "";
      
      const isVideoAsset = isVideo(el.mediaUrl);
      const bgColor = el.color || "transparent";

      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          border-radius: ${el.borderRadius}px;
          opacity: ${el.opacity};
          transform: rotate(${el.rotation}deg);
          box-sizing: border-box;
          overflow: hidden;
          background: ${bgColor};
          z-index: ${el.zIndex || 1};
          ${borderStyle}
          ${shadowStyle}
        ">
          ${el.mediaUrl ? (
            isVideoAsset ? `
              <img src="${videoFrameUrl || el.mediaUrl}" style="width: 100%; height: 100%; object-fit: ${el.objectFit}; filter: brightness(${el.brightness}%) contrast(${el.contrast}%);" />
            ` : `
              <img src="${el.mediaUrl}" style="width: 100%; height: 100%; object-fit: ${el.objectFit}; filter: brightness(${el.brightness}%) contrast(${el.contrast}%);" />
            `
          ) : `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #e2e8f0, #cbd5e1); display: flex; align-items: center; justify-content: center; color: #475569; font-family: sans-serif; font-weight: bold; font-size: 24px;">
              Featured Asset
            </div>
          `}
        </div>
      `;
    };

    const renderBulletsMarkup = (el: BulletElementStyle) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          opacity: ${el.opacity};
          font-family: ${el.fontFamily};
          font-size: ${el.fontSize}px;
          color: ${el.color};
          line-height: ${el.lineHeight};
          box-sizing: border-box;
          overflow: hidden;
          z-index: ${el.zIndex || 1};
        ">
          <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: ${el.spacing}px;">
            ${el.items.map((item, idx) => `
              <li style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="color: #000000; font-weight: bold;">${el.bulletStyle === "check" ? "✔" : el.bulletStyle === "number" ? `${idx + 1}.` : "•"}</span>
                <span>${item}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    };

    const renderQuoteMarkup = (el: QuoteElementStyle) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          opacity: ${el.opacity};
          font-family: ${el.fontFamily};
          box-sizing: border-box;
          overflow: hidden;
          background: ${el.backgroundColor};
          border-left: 5px solid ${el.borderColor};
          border-radius: ${el.borderRadius}px;
          padding: ${el.padding || 24}px;
          z-index: ${el.zIndex || 1};
        ">
          <p style="margin: 0 0 10px 0; font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; line-height: ${el.lineHeight}; color: ${el.color};">
            "${el.text}"
          </p>
          <span style="font-size: ${el.fontSize - 4}px; font-weight: 600; color: #6b7280;">
            — ${el.author}
          </span>
        </div>
      `;
    };

    const renderCtaMarkup = (el: CtaElementStyle) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          opacity: ${el.opacity};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${el.backgroundColor};
          color: ${el.textColor};
          font-family: ${el.fontFamily};
          font-size: ${el.fontSize}px;
          font-weight: ${el.fontWeight};
          border-radius: ${el.borderRadius}px;
          padding: ${el.padding || 16}px;
          box-sizing: border-box;
          text-align: center;
          z-index: ${el.zIndex || 1};
        ">
          ${el.text}
        </div>
      `;
    };

    const renderLogoMarkup = (el: ElementStyle & { logoUrl: string }) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          opacity: ${el.opacity};
          z-index: ${el.zIndex || 1};
        ">
          ${el.logoUrl ? `
            <img src="${el.logoUrl}" style="width:100%; height:100%; object-fit:contain;" />
          ` : `
            <div style="width:100%; height:100%; border-radius:50%; background:#0075de; color:white; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-weight:bold; font-size:12px;">GX</div>
          `}
        </div>
      `;
    };

    const renderDividerMarkup = (el: ElementStyle & { color: string; thickness: number }) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.thickness}px;
          background: ${el.color};
          opacity: ${el.opacity};
          z-index: ${el.zIndex || 1};
        " />
      `;
    };

    const renderAuthorMarkup = (el: ElementStyle & { name: string; avatarUrl: string }) => {
      if (!el.visible) return "";
      return `
        <div style="
          position: absolute;
          left: ${el.x}px;
          top: ${el.y}px;
          width: ${el.width}px;
          height: ${el.height}px;
          opacity: ${el.opacity};
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: ${el.fontFamily};
          color: ${el.color};
          font-size: ${el.fontSize}px;
          font-weight: ${el.fontWeight};
          z-index: ${el.zIndex || 1};
        ">
          <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: #cbd5e1;">
            ${el.avatarUrl ? `<img src="${el.avatarUrl}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; background:#0075de;"/>`}
          </div>
          <span>${el.name}</span>
        </div>
      `;
    };

    const renderFooterMarkup = () => {
      const pageNumStr = String(index + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
      return `
        <div style="
          position: absolute;
          bottom: ${SAFE_BOTTOM}px;
          left: ${SAFE_LEFT}px;
          right: ${SAFE_RIGHT}px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: ${slide.footer.dividerEnabled ? `1px solid ${slide.footer.color}20` : "none"};
          font-family: 'SF Mono', 'Fira Code', monospace;
          opacity: ${slide.footer.opacity};
          color: ${slide.footer.color};
          box-sizing: border-box;
        ">
          <span style="font-weight: 800; font-size: 16px;">
            ${slide.footer.brandName ? `[${slide.footer.brandName}]` : ""}
          </span>
          ${slide.footer.pageNumberEnabled ? `
            <span style="font-weight: 500; font-size: 16px; opacity: 0.6;">
              ${pageNumStr}
            </span>
          ` : ""}
        </div>
      `;
    };

    return `
      <svg 
        viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" 
        width="${CANVAS_WIDTH}" 
        height="${CANVAS_HEIGHT}" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            ${fontsMarkup}
          </style>
        </defs>
        <foreignObject x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${CANVAS_WIDTH}px;
            height: ${CANVAS_HEIGHT}px;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          ">
            ${renderLogoMarkup(slide.logo)}
            ${renderDividerMarkup(slide.divider)}
            ${renderTextMarkup(slide.category)}
            ${renderTextMarkup(slide.headline)}
            ${renderImageMarkup(slide.featuredImage)}
            ${renderTextMarkup(slide.body)}
            ${renderBulletsMarkup(slide.bullets)}
            ${renderQuoteMarkup(slide.quote)}
            ${renderCtaMarkup(slide.cta)}
            ${renderAuthorMarkup(slide.author)}
            ${renderFooterMarkup()}
          </div>
        </foreignObject>
      </svg>
    `;
  };

  const toDataUrl = async (url: string): Promise<string> => {
    if (!url) return "";
    if (url.startsWith("data:")) return url; // already data URL
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to convert URL to data URL:", url, e);
      return url; // fallback
    }
  };

  const prepareSlideForExport = async (slide: Slide, idx: number): Promise<{ slide: Slide; videoFrameUrl?: string }> => {
    const cloned = JSON.parse(JSON.stringify(slide)) as Slide;
    
    // 1. Get and convert video frame if video
    let videoFrameDataUrl = "";
    if (cloned.featuredImage.visible && cloned.featuredImage.mediaUrl && isVideo(cloned.featuredImage.mediaUrl)) {
      const frameUrl = await getSlideVideoFrame(cloned, idx);
      if (frameUrl) {
        videoFrameDataUrl = await toDataUrl(frameUrl);
      }
    } else if (cloned.featuredImage.visible && cloned.featuredImage.mediaUrl) {
      // Convert normal image to data URL
      cloned.featuredImage.mediaUrl = await toDataUrl(cloned.featuredImage.mediaUrl);
    }

    // 2. Convert logo to data URL
    if (cloned.logo.visible && cloned.logo.logoUrl) {
      cloned.logo.logoUrl = await toDataUrl(cloned.logo.logoUrl);
    }

    // 3. Convert author avatar to data URL
    if (cloned.author.visible && cloned.author.avatarUrl) {
      cloned.author.avatarUrl = await toDataUrl(cloned.author.avatarUrl);
    }

    return { slide: cloned, videoFrameUrl: videoFrameDataUrl };
  };

  const getSlideVideoFrame = async (slide: Slide, idx: number): Promise<string> => {
    if (!slide.featuredImage.visible || !slide.featuredImage.mediaUrl || !isVideo(slide.featuredImage.mediaUrl)) {
      return "";
    }
    
    // 1. Try to capture from the live video element in the DOM if this is the active slide
    if (idx === activeIndex) {
      try {
        const liveVideo = canvasRef.current?.querySelector("video") as HTMLVideoElement;
        if (liveVideo) {
          const canvas = document.createElement("canvas");
          canvas.width = liveVideo.videoWidth || 1080;
          canvas.height = liveVideo.videoHeight || 1350;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(liveVideo, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL("image/png");
          }
        }
      } catch (err) {
        console.warn("Failed to capture live DOM video frame, falling back to background loading:", err);
      }
    }

    // 2. Otherwise load in background and extract the frame
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.style.position = "absolute";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      video.style.width = "1px";
      video.style.height = "1px";
      document.body.appendChild(video);

      if (slide.featuredImage.mediaUrl.startsWith("http")) {
        video.crossOrigin = "anonymous";
      }
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.5, video.duration || 0);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1080;
          canvas.height = video.videoHeight || 1350;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/png");
            try { document.body.removeChild(video); } catch (e) {}
            resolve(dataUrl);
            return;
          }
        } catch (err) {
          console.error("Error drawing background video frame:", err);
        }
        try { document.body.removeChild(video); } catch (e) {}
        resolve("");
      };

      video.onerror = () => {
        console.error("Error loading video in background for frame capture:", slide.featuredImage.mediaUrl);
        try { document.body.removeChild(video); } catch (e) {}
        resolve("");
      };

      video.src = slide.featuredImage.mediaUrl;
      video.load();

      // Set timeout of 4 seconds so we don't hang the export forever if the video fails to load
      setTimeout(() => {
        try { document.body.removeChild(video); } catch (e) {}
        resolve("");
      }, 4000);
    });
  };

  const convertSvgToRaster = async (svgString: string, type: "png" | "jpeg"): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const base64Svg = window.btoa(unescape(encodeURIComponent(svgString)));
        const dataURL = `data:image/svg+xml;base64,${base64Svg}`;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = CANVAS_WIDTH;
          canvas.height = CANVAS_HEIGHT;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (type === "jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
            ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            const dataUrl = canvas.toDataURL(`image/${type}`, 0.95);
            resolve(dataUrl);
          } else {
            reject(new Error("Canvas context error"));
          }
        };
        img.onerror = (e) => {
          console.error("Raster image decode error event:", e);
          reject(new Error("Image decoding failed"));
        };
        img.src = dataURL;
      } catch (err) {
        console.error("Base64 string convert error:", err);
        reject(err);
      }
    });
  };

  const handleDownloadSlideSvg = async (idx: number) => {
    try {
      const { slide, videoFrameUrl } = await prepareSlideForExport(slides[idx], idx);
      const svgStr = buildSvgString(slide, idx, true, videoFrameUrl); // Keep font styles inside SVG vector files
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-slide-${idx + 1}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported Slide ${idx + 1} as clean vector SVG!`);
    } catch (e) {
      toast.error("SVG generation failed");
    }
  };

  const handleDownloadSlideRaster = async (idx: number, type: "png" | "jpeg") => {
    try {
      const { slide, videoFrameUrl } = await prepareSlideForExport(slides[idx], idx);
      const svgStr = buildSvgString(slide, idx, false, videoFrameUrl); // Bypass CORS security policies by excluding @imports
      const dataUrl = await convertSvgToRaster(svgStr, type);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-slide-${idx + 1}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported Slide ${idx + 1} as ${type.toUpperCase()}!`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export slide as ${type.toUpperCase()}`);
    }
  };

  const handleDownloadPdf = async () => {
    const downloadToast = toast.loading("Generating full carousel PDF...");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [CANVAS_WIDTH, CANVAS_HEIGHT]
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) doc.addPage();
        const { slide, videoFrameUrl } = await prepareSlideForExport(slides[i], i);
        const svgStr = buildSvgString(slide, i, false, videoFrameUrl); // Bypass CORS security policies
        const dataUrl = await convertSvgToRaster(svgStr, "png");
        doc.addImage(dataUrl, "PNG", 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      doc.save(`${projectName.toLowerCase().replace(/\s+/g, "-")}-carousel.pdf`);
      toast.success("Exported full carousel as PDF!", { id: downloadToast });
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF file", { id: downloadToast });
    }
  };

  const handleDownloadMp4 = async () => {
    const videoToast = toast.loading("Compiling carousel deck into an MP4/WebM video...");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not initialize canvas recording context");
      }

      // Check supported MIME types for MediaRecorder
      let options = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/mp4" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "" };
      }

      const stream = canvas.captureStream(30); // 30 FPS
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordedPromise = new Promise<Blob>((resolveRecorded, rejectRecorded) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || "video/mp4" });
          resolveRecorded(blob);
        };
        recorder.onerror = (e) => {
          rejectRecorded(e);
        };
      });

      recorder.start();

      // Loop through slides
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const isVideoAsset = slide.featuredImage.visible && slide.featuredImage.mediaUrl && isVideo(slide.featuredImage.mediaUrl);
        
        toast.loading(`Processing slide ${i + 1}/${slides.length}...`, { id: videoToast });

        if (isVideoAsset) {
          // 1. Video Slide processing
          // First, create and load a hidden video element
          const video = document.createElement("video");
          video.src = slide.featuredImage.mediaUrl;
          video.muted = true;
          video.playsInline = true;
          if (slide.featuredImage.mediaUrl.startsWith("http")) {
            video.crossOrigin = "anonymous";
          }

          await new Promise<void>((resLoad) => {
            video.onloadedmetadata = () => resLoad();
            video.onerror = () => resLoad();
            video.load();
          });

          // Rasterize static slide background (everything except the featured image)
          const slideBg = JSON.parse(JSON.stringify(slide)) as Slide;
          slideBg.featuredImage.visible = false; // hide featured image on background raster
          const bgSvg = buildSvgString(slideBg, i, false);
          const bgUrl = await convertSvgToRaster(bgSvg, "png");
          const bgImg = new Image();
          await new Promise((resBg) => { bgImg.onload = resBg; bgImg.src = bgUrl; });

          // Determine playback duration
          const duration = video.duration || 5; // default to 5 seconds
          const totalFrames = Math.ceil(duration * 30);
          
          // Seek and play
          video.currentTime = 0;
          await video.play().catch(() => {});

          // Draw frame-by-frame
          for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw background slide elements
            ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw video frame with clipping and filters
            ctx.save();
            if (slide.featuredImage.brightness !== 100 || slide.featuredImage.contrast !== 100) {
              ctx.filter = `brightness(${slide.featuredImage.brightness}%) contrast(${slide.featuredImage.contrast}%)`;
            }

            ctx.beginPath();
            const fx = slide.featuredImage.x;
            const fy = slide.featuredImage.y;
            const fw = slide.featuredImage.width;
            const fh = slide.featuredImage.height;
            const r = slide.featuredImage.borderRadius;

            try {
              ctx.roundRect(fx, fy, fw, fh, r);
            } catch (err) {
              ctx.rect(fx, fy, fw, fh);
            }
            ctx.clip();

            // Draw video element directly
            ctx.drawImage(video, fx, fy, fw, fh);
            ctx.restore();
            ctx.filter = "none";

            // Draw border if enabled
            if (slide.featuredImage.borderWidth > 0) {
              ctx.save();
              ctx.strokeStyle = slide.featuredImage.borderColor;
              ctx.lineWidth = slide.featuredImage.borderWidth;
              ctx.beginPath();
              try {
                ctx.roundRect(fx, fy, fw, fh, r);
              } catch (err) {
                ctx.rect(fx, fy, fw, fh);
              }
              ctx.stroke();
              ctx.restore();
            }

            // Sync frame delay (30 FPS -> 33ms)
            await new Promise(r => setTimeout(r, 33));
          }

          video.pause();
          video.src = ""; // clean up memory
        } else {
          // 2. Static Slide processing
          // Rasterize full slide SVG (including image or empty placeholder)
          const svgStr = buildSvgString(slide, i, false);
          const dataUrl = await convertSvgToRaster(svgStr, "png");
          const img = new Image();
          await new Promise((resImg) => { img.onload = resImg; img.src = dataUrl; });

          // Render static frame for 3.5 seconds (105 frames at 30 FPS)
          const staticFrames = 105;
          for (let frameIndex = 0; frameIndex < staticFrames; frameIndex++) {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            await new Promise(r => setTimeout(r, 33));
          }
        }
      }

      // Stop recording
      recorder.stop();
      toast.loading("Packaging video track...", { id: videoToast });

      const finalBlob = await recordedPromise;
      const downloadUrl = URL.createObjectURL(finalBlob);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-video.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success("Successfully exported carousel video!", { id: videoToast });
    } catch (e: any) {
      console.error("Video compile error:", e);
      toast.error(`Video generation failed: ${e.message || "Unknown error"}`, { id: videoToast });
    }
  };

  const handleDownloadAllSlidesSvg = async () => {
    toast.success(`Exporting all ${slides.length} slides...`);
    for (let idx = 0; idx < slides.length; idx++) {
      await handleDownloadSlideSvg(idx);
    }
  };

  // ==========================================
  // VIEW RENDER PARTS
  // ==========================================

  const renderCanvasElement = (key: ElementKey, children: React.ReactNode) => {
    const elem = activeSlide[key];
    if (!elem.visible) return null;

    const isSelected = selectedElement === key;
    const scaleFactor = zoomScale;

    const containerStyle: React.CSSProperties = {
      position: "absolute",
      left: `${elem.x * scaleFactor}px`,
      top: `${elem.y * scaleFactor}px`,
      width: `${elem.width * scaleFactor}px`,
      height: `${elem.height * scaleFactor}px`,
      opacity: elem.opacity,
      transform: `rotate(${elem.rotation}deg)`,
      cursor: editorMode === "free" && !elem.locked ? "move" : "default",
      boxSizing: "border-box",
      userSelect: "none",
      zIndex: elem.zIndex || 1
    };

    return (
      <div 
        style={containerStyle}
        onMouseDown={(e) => handleElementMouseDown(e, key)}
        className={`group relative ${isSelected ? "ring-1.5 ring-neutral-900 ring-offset-1" : "hover:outline hover:outline-dashed hover:outline-neutral-300"}`}
      >
        {children}
        
        {/* Bounding Resize handle */}
        {isSelected && editorMode === "free" && !elem.locked && (
          <div 
            onMouseDown={(e) => handleResizeMouseDown(e, key)}
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white border border-neutral-900 rounded-full translate-x-1 translate-y-1 cursor-se-resize z-50 shadow-sm"
          />
        )}

        {/* Locked status */}
        {elem.locked && isSelected && (
          <div className="absolute top-1 right-1 bg-white/95 border border-neutral-200 rounded px-1 py-0.5 shadow-sm flex items-center gap-0.5 z-50">
            <Lock size={8} className="text-neutral-500" />
            <span className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest">Locked</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full min-h-screen flex flex-col bg-[#F5F5F7] text-neutral-900 font-sans transition-colors duration-200 ${darkMode ? "dark bg-neutral-950 text-white" : ""}`}>
      
      {/* ==========================================
          TOP BAR (Figma/Canva inspired)
          ========================================== */}
      <header className="h-14 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50 dark:bg-neutral-900/90 dark:border-neutral-800">
        
        {/* Left: Project title & status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            {isEditingProjectName ? (
              <input
                type="text"
                value={projectName}
                onBlur={() => setIsEditingProjectName(false)}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingProjectName(false)}
                autoFocus
                className="bg-transparent border-b border-neutral-900 text-sm font-bold focus:outline-none dark:border-white"
              />
            ) : (
              <h1 
                onDoubleClick={() => setIsEditingProjectName(true)}
                className="text-sm font-bold text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded cursor-pointer transition-all dark:text-white dark:hover:bg-neutral-800"
              >
                {projectName}
              </h1>
            )}
          </div>
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Auto Saved
          </span>
        </div>

        {/* Center: Main App Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-30 dark:hover:bg-neutral-800"
            title="Undo"
          >
            <Undo size={14} />
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-30 dark:hover:bg-neutral-800"
            title="Redo"
          >
            <Redo size={14} />
          </button>
          <div className="h-4 w-px bg-neutral-200 mx-2 dark:bg-neutral-800" />
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all dark:hover:bg-neutral-800"
            title="Toggle Dark Mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Project URL copied to clipboard!");
            }}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <Share2 size={12} /> Share
          </button>

          <button 
            onClick={handleDownloadPdf}
            className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <FileText size={12} /> Export PDF
          </button>

          <button 
            onClick={handleDownloadMp4}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 cursor-pointer"
          >
            <Play size={12} /> Export Video (MP4)
          </button>
        </div>

      </header>

      {/* ==========================================
          MAIN THREE-COLUMN WORKSPACE
          ========================================== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ------------------------------------------
            LEFT SIDEBAR (300px)
            ------------------------------------------ */}
        <aside className="w-[300px] border-r border-neutral-200/60 bg-white flex flex-col overflow-y-auto px-4 py-6 space-y-6 shrink-0 z-10 dark:bg-neutral-900 dark:border-neutral-800">
          
          {/* Logo & Section Selector */}
          <div className="flex bg-neutral-100 p-1 rounded-xl dark:bg-neutral-800">
            {[
              { id: "slides", label: "Slides", icon: <LayersIcon size={12} /> },
              { id: "templates", label: "Presets", icon: <LayoutGrid size={12} /> },
              { id: "brand", label: "Brand Kit", icon: <Palette size={12} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as any)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                  leftTab === tab.id 
                    ? "bg-white text-black shadow-sm dark:bg-neutral-700 dark:text-white" 
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Slides List view */}
          {leftTab === "slides" && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block pb-1 border-b">Slide Deck</span>
              
              <div className="flex flex-col gap-3">
                {slides.map((slide, sIdx) => (
                  <div 
                    key={slide.id}
                    onClick={() => {
                      setActiveIndex(sIdx);
                      setSelectedElement(null);
                      setIsFooterSelected(false);
                    }}
                    className={`relative p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      activeIndex === sIdx 
                        ? "bg-neutral-50 border-neutral-900 shadow-sm dark:bg-neutral-800 dark:border-white" 
                        : "bg-white border-neutral-200/60 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded-full dark:bg-neutral-800 text-neutral-500">
                        Slide {sIdx + 1}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateSlide(sIdx); }}
                          className="p-1 hover:bg-neutral-200 rounded text-neutral-500 dark:hover:bg-neutral-700"
                          title="Duplicate"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSlide(sIdx); }}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-neutral-500 dark:hover:bg-red-950"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs font-bold text-neutral-800 line-clamp-2 dark:text-neutral-200">
                      {slide.headline.text ? stripHtmlTags(slide.headline.text) : "Empty headline text"}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                onClick={addSlide}
                className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center gap-1.5 text-xs font-bold transition-all dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <Plus size={14} /> Add Slide
              </button>
            </div>
          )}

          {/* Preset templates list cards */}
          {leftTab === "templates" && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block pb-1 border-b">Templates</span>
              <div className="flex flex-col gap-3.5">
                {TEMPLATE_PRESETS.map(preset => (
                  <div 
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="group border border-neutral-200/60 rounded-2xl p-4 bg-white hover:border-neutral-900 transition-all cursor-pointer dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-white"
                  >
                    <div className="h-20 bg-neutral-50 rounded-xl mb-3 flex items-center justify-center border text-[10px] text-neutral-400 font-bold dark:bg-neutral-800 dark:border-neutral-700">
                      {preset.category} layout preview
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate w-32">{preset.name}</h4>
                        <span className="text-[9px] text-neutral-400 font-semibold uppercase">{preset.category}</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500 opacity-0 group-hover:opacity-100 transition-all">
                        Apply →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand settings kit */}
          {leftTab === "brand" && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block pb-1 border-b">Brand Settings</span>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Brand Name</span>
                  <input
                    type="text"
                    value={activeSlide.footer.brandName}
                    onChange={(e) => updateSlideFooter({ brandName: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                  />
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Show Divider</span>
                  <input
                    type="checkbox"
                    checked={activeSlide.footer.dividerEnabled}
                    onChange={(e) => updateSlideFooter({ dividerEnabled: e.target.checked })}
                    className="h-4 w-4 text-neutral-900 dark:bg-neutral-800"
                  />
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Show Page Numbers</span>
                  <input
                    type="checkbox"
                    checked={activeSlide.footer.pageNumberEnabled}
                    onChange={(e) => updateSlideFooter({ pageNumberEnabled: e.target.checked })}
                    className="h-4 w-4 text-neutral-900 dark:bg-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Footer Text Color</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activeSlide.footer.color}
                      onChange={(e) => updateSlideFooter({ color: e.target.value })}
                      className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={activeSlide.footer.color}
                      onChange={(e) => updateSlideFooter({ color: e.target.value })}
                      className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </aside>

        {/* ------------------------------------------
            CENTER VIEWPORT: FLOATING CANVAS
            ------------------------------------------ */}
        <main className="flex-1 bg-[#F5F5F7] overflow-auto flex items-center justify-center p-8 relative dark:bg-neutral-950">
          
          {/* Floating Viewport Toolbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1.5 border border-neutral-200/60 rounded-2xl shadow-sm z-30 dark:bg-neutral-900/80 dark:border-neutral-800">
            <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/40 dark:bg-neutral-800 dark:border-neutral-700">
              <button 
                onClick={() => setEditorMode("fixed")}
                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                  editorMode === "fixed" ? "bg-white text-black shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-400"
                }`}
              >
                Fixed Grid
              </button>
              <button 
                onClick={() => setEditorMode("free")}
                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                  editorMode === "free" ? "bg-white text-black shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-400"
                }`}
              >
                Free Design
              </button>
            </div>

            <div className="h-4 w-px bg-neutral-200 mx-2 dark:bg-neutral-800" />

            <button 
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={`p-1.5 rounded-lg border transition-all ${
                showSafeArea ? "bg-neutral-100 border-neutral-300 text-neutral-900" : "bg-transparent border-transparent text-neutral-400"
              }`}
              title="Safe Area Grid (72px Left/Right, 60px Top, 70px Bottom)"
            >
              <Maximize2 size={12} />
            </button>
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg border transition-all ${
                showGrid ? "bg-neutral-100 border-neutral-300 text-neutral-900" : "bg-transparent border-transparent text-neutral-400"
              }`}
              title="Toggle Grid overlay"
            >
              <Grid size={12} />
            </button>
            
            <div className="h-4 w-px bg-neutral-200 mx-2 dark:bg-neutral-800" />

            <button 
              onClick={() => setZoomScale(prev => Math.max(0.2, prev - 0.05))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Minimize2 size={12} />
            </button>
            <span className="text-[10px] font-mono font-bold text-neutral-500 w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button 
              onClick={() => setZoomScale(prev => Math.min(1.2, prev + 0.05))}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Floating Canvas Wrapper */}
          <div 
            ref={canvasRef}
            className="bg-white shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] relative select-none overflow-hidden shrink-0 transition-transform rounded-[24px] dark:border dark:border-neutral-800"
            style={{
              width: `${CANVAS_WIDTH * zoomScale}px`,
              height: `${CANVAS_HEIGHT * zoomScale}px`,
              boxSizing: "border-box"
            }}
          >
            {/* Safe Area guideline overlays */}
            {showSafeArea && (
              <div 
                className="absolute border border-dashed border-[#000000]/15 pointer-events-none z-40"
                style={{
                  top: `${SAFE_TOP * zoomScale}px`,
                  bottom: `${SAFE_BOTTOM * zoomScale}px`,
                  left: `${SAFE_LEFT * zoomScale}px`,
                  right: `${SAFE_RIGHT * zoomScale}px`
                }}
              />
            )}

            {/* Grid overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(#000000 1.5px, transparent 1.5px)",
                  backgroundSize: `${30 * zoomScale}px ${30 * zoomScale}px`
                }}
              />
            )}

            {/* Elements list rendering */}
            
            {/* Logo */}
            {renderCanvasElement("logo", (
              <div className="w-full h-full">
                {activeSlide.logo.logoUrl ? (
                  <img src={activeSlide.logo.logoUrl} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#18181b] text-white font-bold flex items-center justify-center text-[10px]" style={{ fontSize: `${12 * zoomScale}px` }}>
                    GX
                  </div>
                )}
              </div>
            ))}

            {/* Divider */}
            {renderCanvasElement("divider", (
              <div 
                className="w-full h-full animate-fade"
                style={{
                  background: activeSlide.divider.color,
                  height: `${activeSlide.divider.thickness * zoomScale}px`
                }}
              />
            ))}

            {/* Category tag */}
            {renderCanvasElement("category", (
              <div 
                className="w-full h-full font-sans uppercase tracking-widest truncate"
                style={{
                  fontSize: `${activeSlide.category.fontSize * zoomScale}px`,
                  fontWeight: activeSlide.category.fontWeight,
                  color: activeSlide.category.color,
                  letterSpacing: `${activeSlide.category.letterSpacing * zoomScale}px`,
                  textAlign: activeSlide.category.align
                }}
              >
                {activeSlide.category.text}
              </div>
            ))}

            {/* Headline Title */}
            {renderCanvasElement("headline", (
              <div 
                className="w-full h-full font-sans tracking-tight leading-tight"
                style={{
                  fontSize: `${activeSlide.headline.fontSize * zoomScale}px`,
                  fontWeight: activeSlide.headline.fontWeight,
                  color: activeSlide.headline.color,
                  lineHeight: activeSlide.headline.lineHeight,
                  letterSpacing: `${activeSlide.headline.letterSpacing * zoomScale}px`,
                  textAlign: activeSlide.headline.align
                }}
              >
                {renderFormattedText(activeSlide.headline.text)}
              </div>
            ))}

            {/* Featured Image */}
            {renderCanvasElement("featuredImage", (
              <div 
                className="w-full h-full overflow-hidden"
                style={{
                  background: activeSlide.featuredImage.color || "transparent",
                  borderRadius: `${activeSlide.featuredImage.borderRadius * zoomScale}px`,
                  border: activeSlide.featuredImage.borderWidth > 0 
                    ? `${activeSlide.featuredImage.borderWidth * zoomScale}px solid ${activeSlide.featuredImage.borderColor}`
                    : "none"
                }}
              >
                {activeSlide.featuredImage.mediaUrl ? (
                  isVideo(activeSlide.featuredImage.mediaUrl) ? (
                    <video 
                      src={activeSlide.featuredImage.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full"
                      style={{
                        objectFit: activeSlide.featuredImage.objectFit,
                        filter: `brightness(${activeSlide.featuredImage.brightness}%) contrast(${activeSlide.featuredImage.contrast}%)`
                      }}
                    />
                  ) : (
                    <img 
                      src={activeSlide.featuredImage.mediaUrl}
                      alt="Featured Image Layout"
                      className="w-full h-full"
                      style={{
                        objectFit: activeSlide.featuredImage.objectFit,
                        filter: `brightness(${activeSlide.featuredImage.brightness}%) contrast(${activeSlide.featuredImage.contrast}%)`
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 bg-neutral-50/50 border border-neutral-100 rounded-2xl">
                    <span className="font-extrabold uppercase tracking-wider text-[11px] mb-1" style={{ fontSize: `${12 * zoomScale}px` }}>
                      Featured Image Placeholder
                    </span>
                    <span className="text-[9px] opacity-60" style={{ fontSize: `${9 * zoomScale}px` }}>
                      Upload custom photo in Right Panel
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Body Copy text */}
            {renderCanvasElement("body", (
              <div 
                className="w-full h-full font-sans whitespace-pre-line text-neutral-800"
                style={{
                  fontSize: `${activeSlide.body.fontSize * zoomScale}px`,
                  fontWeight: activeSlide.body.fontWeight,
                  color: activeSlide.body.color,
                  lineHeight: activeSlide.body.lineHeight,
                  letterSpacing: `${activeSlide.body.letterSpacing * zoomScale}px`,
                  textAlign: activeSlide.body.align
                }}
              >
                {renderFormattedText(activeSlide.body.text)}
              </div>
            ))}

            {/* Bullets items */}
            {renderCanvasElement("bullets", (
              <div 
                className="w-full h-full font-sans text-neutral-800"
                style={{
                  fontSize: `${activeSlide.bullets.fontSize * zoomScale}px`,
                  fontWeight: activeSlide.bullets.fontWeight,
                  color: activeSlide.bullets.color,
                  lineHeight: activeSlide.bullets.lineHeight
                }}
              >
                <ul className="list-none m-0 p-0" style={{ display: "flex", flexDirection: "column", gap: `${activeSlide.bullets.spacing * zoomScale}px` }}>
                  {activeSlide.bullets.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-black font-bold">
                        {activeSlide.bullets.bulletStyle === "check" ? "✔" : activeSlide.bullets.bulletStyle === "number" ? `${idx + 1}.` : "•"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Quote Box element */}
            {renderCanvasElement("quote", (
              <div 
                className="w-full h-full font-sans"
                style={{
                  background: activeSlide.quote.backgroundColor,
                  borderLeft: `${5 * zoomScale}px solid ${activeSlide.quote.borderColor}`,
                  borderRadius: `${activeSlide.quote.borderRadius * zoomScale}px`,
                  padding: `${(activeSlide.quote.padding || 24) * zoomScale}px`
                }}
              >
                <p 
                  className="m-0 mb-2 font-bold"
                  style={{
                    fontSize: `${activeSlide.quote.fontSize * zoomScale}px`,
                    fontWeight: activeSlide.quote.fontWeight,
                    lineHeight: activeSlide.quote.lineHeight,
                    color: activeSlide.quote.color
                  }}
                >
                  "{activeSlide.quote.text}"
                </p>
                <span className="text-neutral-500 font-semibold" style={{ fontSize: `${(activeSlide.quote.fontSize - 4) * zoomScale}px` }}>
                  — {activeSlide.quote.author}
                </span>
              </div>
            ))}

            {/* CTA Button */}
            {renderCanvasElement("cta", (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: activeSlide.cta.backgroundColor,
                  color: activeSlide.cta.textColor,
                  borderRadius: `${activeSlide.cta.borderRadius * zoomScale}px`,
                  fontSize: `${activeSlide.cta.fontSize * zoomScale}px`,
                  fontWeight: activeSlide.cta.fontWeight,
                  fontFamily: activeSlide.cta.fontFamily,
                  padding: `${(activeSlide.cta.padding || 16) * zoomScale}px`,
                  letterSpacing: `${activeSlide.cta.letterSpacing * zoomScale}px`
                }}
              >
                {activeSlide.cta.text}
              </div>
            ))}

            {/* Author profile */}
            {renderCanvasElement("author", (
              <div className="w-full h-full flex items-center gap-2">
                <div 
                  className="rounded-full bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300"
                  style={{ width: `${32 * zoomScale}px`, height: `${32 * zoomScale}px` }}
                >
                  {activeSlide.author.avatarUrl ? (
                    <img src={activeSlide.author.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#18181b]" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span 
                    className="font-bold text-neutral-800 leading-tight" 
                    style={{ fontSize: `${activeSlide.author.fontSize * zoomScale}px` }}
                  >
                    {activeSlide.author.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Footer Branding line */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(null);
                setIsFooterSelected(true);
              }}
              className={`absolute flex items-center justify-between border-t border-neutral-100 cursor-pointer ${
                isFooterSelected ? "ring-1.5 ring-neutral-900 ring-offset-1" : "hover:outline hover:outline-dashed hover:outline-neutral-300"
              }`}
              style={{
                bottom: `${SAFE_BOTTOM * zoomScale}px`,
                left: `${SAFE_LEFT * zoomScale}px`,
                width: `${SAFE_WIDTH * zoomScale}px`,
                height: `${50 * zoomScale}px`,
                borderTop: activeSlide.footer.dividerEnabled ? `1.5px solid ${activeSlide.footer.color}20` : "none",
                opacity: activeSlide.footer.opacity,
                color: activeSlide.footer.color,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                userSelect: "none"
              }}
            >
              <span className="font-extrabold uppercase" style={{ fontSize: `${16 * zoomScale}px` }}>
                {activeSlide.footer.brandName ? `[${activeSlide.footer.brandName}]` : ""}
              </span>
              {activeSlide.footer.pageNumberEnabled && (
                <span className="font-bold opacity-60" style={{ fontSize: `${16 * zoomScale}px` }}>
                  {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              )}
            </div>

          </div>
        </main>

        {/* ------------------------------------------
            RIGHT PANEL: THE INSPECTOR
            ------------------------------------------ */}
        <aside className="w-[360px] border-l border-neutral-200/60 bg-white flex flex-col overflow-y-auto px-6 py-6 space-y-6 shrink-0 z-10 dark:bg-neutral-900 dark:border-neutral-800">
          
          {/* Document configuration (rendered when nothing is selected) */}
          {!selectedElement && !isFooterSelected && (
            <div className="space-y-6">
              <div className="pb-3 border-b">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Document Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Width</span>
                    <div className="h-9 px-3 bg-neutral-50 rounded-lg flex items-center justify-between text-xs font-mono dark:bg-neutral-800">
                      <span>1080</span>
                      <span className="text-neutral-400">px</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Height</span>
                    <div className="h-9 px-3 bg-neutral-50 rounded-lg flex items-center justify-between text-xs font-mono dark:bg-neutral-800">
                      <span>1350</span>
                      <span className="text-neutral-400">px</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block pb-1 border-b">Safe Margins</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500 font-medium">Top Margin</span>
                      <span className="font-bold text-neutral-900 dark:text-white">60px</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500 font-medium">Bottom Margin</span>
                      <span className="font-bold text-neutral-900 dark:text-white">70px</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500 font-medium">Left Margin</span>
                      <span className="font-bold text-neutral-900 dark:text-white">72px</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500 font-medium">Right Margin</span>
                      <span className="font-bold text-neutral-900 dark:text-white">72px</span>
                    </div>
                  </div>
                </div>

                {/* Layer Quick Selection Panel */}
                <div className="space-y-2 pt-4 border-t">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block pb-2">Active Layers</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "category", label: "Category Tag" },
                      { id: "headline", label: "Headline Title" },
                      { id: "featuredImage", label: "Featured Image" },
                      { id: "body", label: "Body Text" },
                      { id: "bullets", label: "Bullets list" },
                      { id: "quote", label: "Quote Box" },
                      { id: "cta", label: "CTA Button" },
                      { id: "logo", label: "Logo Icon" },
                      { id: "divider", label: "Divider Line" },
                      { id: "author", label: "Author profile" },
                      { id: "footer", label: "Footer / Brand" }
                    ].map(layer => (
                      <div 
                        key={layer.id}
                        onClick={() => {
                          if (layer.id === "footer") {
                            setSelectedElement(null);
                            setIsFooterSelected(true);
                          } else {
                            setSelectedElement(layer.id as ElementKey);
                            setIsFooterSelected(false);
                          }
                        }}
                        className={`flex justify-between items-center px-3 py-2 bg-neutral-50 hover:bg-neutral-100 rounded-xl cursor-pointer transition-all dark:bg-neutral-800/50 dark:hover:bg-neutral-800 ${
                          (layer.id === "footer" ? isFooterSelected : selectedElement === layer.id) ? "ring-1 ring-neutral-900 dark:ring-white" : ""
                        }`}
                      >
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{layer.label}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (layer.id === "footer") {
                                updateSlideFooter({ opacity: activeSlide.footer.opacity > 0 ? 0 : 1 });
                              } else {
                                updateSlideElement(layer.id as ElementKey, { visible: !activeSlide[layer.id as ElementKey].visible }); 
                              }
                            }}
                            className="p-1 hover:bg-neutral-200 rounded dark:hover:bg-neutral-700"
                          >
                            {layer.id === "footer"
                              ? (activeSlide.footer.opacity > 0 ? <Eye size={12} /> : <EyeOff size={12} className="text-red-500" />)
                              : (activeSlide[layer.id as ElementKey].visible ? <Eye size={12} /> : <EyeOff size={12} className="text-red-500" />)
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Options Panel */}
                <div className="space-y-3 pt-4 border-t">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block pb-1">Export Deck</span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownloadSlideRaster(activeIndex, "png")}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 cursor-pointer"
                    >
                      <Download size={12} /> Download Slide (PNG)
                    </button>
                    <button
                      onClick={() => handleDownloadSlideRaster(activeIndex, "jpeg")}
                      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <Download size={12} /> Download Slide (JPEG)
                    </button>
                    <button
                      onClick={() => handleDownloadSlideSvg(activeIndex)}
                      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <Download size={12} /> Download Slide (SVG)
                    </button>
                    <div className="h-px bg-neutral-100 my-1 dark:bg-neutral-800" />
                    <button
                      onClick={handleDownloadAllSlidesSvg}
                      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <Download size={12} /> Download All Slides (SVG)
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <FileText size={12} /> Download Full Deck (PDF)
                    </button>
                    <button
                      onClick={handleDownloadMp4}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 cursor-pointer"
                    >
                      <Play size={12} /> Download Deck (MP4 Video)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Inspector Panel with properties matching selections */}
          {selectedElement && (
            <div className="space-y-6">
              
              {/* Header selection info */}
              <div className="flex justify-between items-center pb-3 border-b">
                <div className="flex flex-col text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                    {selectedElement}
                  </h3>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Properties</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSlideElement(selectedElement, { visible: !activeSlide[selectedElement].visible })}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 dark:hover:bg-neutral-800"
                    title="Toggle Visibility"
                  >
                    {activeSlide[selectedElement].visible ? <Eye size={13} /> : <EyeOff size={13} className="text-red-500" />}
                  </button>
                  <button
                    onClick={() => updateSlideElement(selectedElement, { locked: !activeSlide[selectedElement].locked })}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 dark:hover:bg-neutral-800"
                    title="Toggle Coordinate Lock"
                  >
                    {activeSlide[selectedElement].locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </div>
              </div>

              {/* Content Input Fields (Always visible for easy text/media updates) */}
              <div className="space-y-4 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Edit Content</span>
                
                {selectedElement === "category" && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Category Tag Text</span>
                    <input
                      type="text"
                      value={activeSlide.category.text}
                      onChange={(e) => updateSlideElement("category", { text: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                )}

                {selectedElement === "headline" && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Headline Text</span>
                    <textarea
                      value={activeSlide.headline.text}
                      rows={3}
                      onChange={(e) => updateSlideElement("headline", { text: e.target.value })}
                      className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold resize-none dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                )}

                {selectedElement === "featuredImage" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-semibold text-neutral-400">Media File Upload</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        id="featured-media-file"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="featured-media-file"
                        className="flex flex-col items-center justify-center border border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl p-5 cursor-pointer bg-white transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-white"
                      >
                        <Upload size={16} className="text-neutral-400 mb-1" />
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">Upload Image / Video</span>
                        <span className="text-[9px] text-neutral-400 font-semibold mt-0.5">Supports PNG, JPG, MP4, WebM</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Or Paste Asset URL</span>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={activeSlide.featuredImage.mediaUrl}
                        onChange={(e) => updateSlideElement("featuredImage", { mediaUrl: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                )}

                {selectedElement === "body" && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Body Copy</span>
                    <textarea
                      value={activeSlide.body.text}
                      rows={4}
                      onChange={(e) => updateSlideElement("body", { text: e.target.value })}
                      className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold resize-none font-sans dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                )}

                {selectedElement === "bullets" && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold text-neutral-400 block">Bullet Items</span>
                    {activeSlide.bullets.items.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const next = [...activeSlide.bullets.items];
                            next[idx] = e.target.value;
                            updateSlideElement("bullets", { items: next });
                          }}
                          className="flex-1 h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                        />
                        <button
                          onClick={() => {
                            const next = activeSlide.bullets.items.filter((_, i) => i !== idx);
                            updateSlideElement("bullets", { items: next });
                          }}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded dark:bg-red-950 dark:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateSlideElement("bullets", { items: [...activeSlide.bullets.items, "New bullet point"] });
                      }}
                      className="w-full py-2 border border-dashed rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      + Add Bullet Item
                    </button>
                  </div>
                )}

                {selectedElement === "quote" && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Quote Text</span>
                      <textarea
                        value={activeSlide.quote.text}
                        rows={3}
                        onChange={(e) => updateSlideElement("quote", { text: e.target.value })}
                        className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold resize-none dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Author</span>
                      <input
                        type="text"
                        value={activeSlide.quote.author}
                        onChange={(e) => updateSlideElement("quote", { author: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                )}

                {selectedElement === "cta" && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Button Label</span>
                      <input
                        type="text"
                        value={activeSlide.cta.text}
                        onChange={(e) => updateSlideElement("cta", { text: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Button Link</span>
                      <input
                        type="text"
                        value={activeSlide.cta.link}
                        onChange={(e) => updateSlideElement("cta", { link: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                )}

                {selectedElement === "logo" && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Brand Logo URL</span>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={activeSlide.logo.logoUrl}
                      onChange={(e) => updateSlideElement("logo", { logoUrl: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                )}

                {selectedElement === "author" && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Author Name</span>
                      <input
                        type="text"
                        value={activeSlide.author.name}
                        onChange={(e) => updateSlideElement("author", { name: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Avatar Photo URL</span>
                      <input
                        type="text"
                        placeholder="https://example.com/avatar.jpg"
                        value={activeSlide.author.avatarUrl}
                        onChange={(e) => updateSlideElement("author", { avatarUrl: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinates Box (Free layout mode only) */}
              {selectedElement && (
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Alignment & Size</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Position X (px)</span>
                      <input
                        type="number"
                        disabled={editorMode === "fixed" || activeSlide[selectedElement].locked}
                        value={activeSlide[selectedElement].x}
                        onChange={(e) => updateSlideElement(selectedElement, { x: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Position Y (px)</span>
                      <input
                        type="number"
                        disabled={editorMode === "fixed" || activeSlide[selectedElement].locked}
                        value={activeSlide[selectedElement].y}
                        onChange={(e) => updateSlideElement(selectedElement, { y: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Width (px)</span>
                      <input
                        type="number"
                        disabled={editorMode === "fixed" || activeSlide[selectedElement].locked}
                        value={activeSlide[selectedElement].width}
                        onChange={(e) => updateSlideElement(selectedElement, { width: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Height (px)</span>
                      <input
                        type="number"
                        disabled={activeSlide[selectedElement].locked}
                        value={activeSlide[selectedElement].height}
                        onChange={(e) => updateSlideElement(selectedElement, { height: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Typography inspector settings */}
              {selectedElement !== "featuredImage" && selectedElement !== "divider" && (
                <div className="space-y-4 pt-3 border-t">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Typography</span>

                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Font Family</span>
                    <select
                      value={activeSlide[selectedElement].fontFamily}
                      onChange={(e) => updateSlideElement(selectedElement, { fontFamily: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                    >
                      {DEFAULT_FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Font Size (px)</span>
                      <input
                        type="number"
                        value={activeSlide[selectedElement].fontSize}
                        onChange={(e) => updateSlideElement(selectedElement, { fontSize: parseInt(e.target.value) || 12 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Weight</span>
                      <select
                        value={activeSlide[selectedElement].fontWeight}
                        onChange={(e) => updateSlideElement(selectedElement, { fontWeight: e.target.value })}
                        className="w-full h-9 px-2 bg-white border border-neutral-200 rounded-lg text-xs dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        <option value="400">Regular (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semibold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extrabold (800)</option>
                        <option value="900">Black (900)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Line Height</span>
                      <input
                        type="number"
                        step="0.05"
                        value={activeSlide[selectedElement].lineHeight}
                        onChange={(e) => updateSlideElement(selectedElement, { lineHeight: parseFloat(e.target.value) || 1.2 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Color</span>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={activeSlide[selectedElement].color}
                          onChange={(e) => updateSlideElement(selectedElement, { color: e.target.value })}
                          className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={activeSlide[selectedElement].color}
                          onChange={(e) => updateSlideElement(selectedElement, { color: e.target.value })}
                          className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Alignment</span>
                    <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60 dark:bg-neutral-800 dark:border-neutral-700">
                      {[
                        { align: "left", icon: <AlignLeft size={11} /> },
                        { align: "center", icon: <AlignCenter size={11} /> },
                        { align: "right", icon: <AlignRight size={11} /> }
                      ].map(opt => (
                        <button
                          key={opt.align}
                          onClick={() => updateSlideElement(selectedElement, { align: opt.align as any })}
                          className={`p-1.5 rounded-md ${
                            activeSlide[selectedElement].align === opt.align ? "bg-white text-black shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-400"
                          }`}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image specific inputs */}
              {selectedElement === "featuredImage" && (
                <div className="space-y-4 pt-3 border-t">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Image Properties</span>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Object Fit</span>
                      <select
                        value={activeSlide.featuredImage.objectFit}
                        onChange={(e) => updateSlideElement("featuredImage", { objectFit: e.target.value as any })}
                        className="w-full h-9 px-2 bg-white border border-neutral-200 rounded-lg text-xs dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Border Radius (px)</span>
                      <input
                        type="number"
                        value={activeSlide.featuredImage.borderRadius}
                        onChange={(e) => updateSlideElement("featuredImage", { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Brightness (%)</span>
                      <input
                        type="number"
                        value={activeSlide.featuredImage.brightness}
                        onChange={(e) => updateSlideElement("featuredImage", { brightness: parseInt(e.target.value) || 100 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Contrast (%)</span>
                      <input
                        type="number"
                        value={activeSlide.featuredImage.contrast}
                        onChange={(e) => updateSlideElement("featuredImage", { contrast: parseInt(e.target.value) || 100 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-neutral-400">Card Background Color</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeSlide.featuredImage.color || "#000000"}
                        onChange={(e) => updateSlideElement("featuredImage", { color: e.target.value })}
                        className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={activeSlide.featuredImage.color || "transparent"}
                        onChange={(e) => updateSlideElement("featuredImage", { color: e.target.value })}
                        className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Drop Shadow</span>
                    <input
                      type="checkbox"
                      checked={!!activeSlide.featuredImage.shadowEnabled}
                      onChange={(e) => updateSlideElement("featuredImage", { shadowEnabled: e.target.checked })}
                      className="h-4 w-4 text-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Quote specific inputs */}
              {selectedElement === "quote" && (
                <div className="space-y-4 pt-3 border-t">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Quote Box</span>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-semibold text-neutral-400">Border Color</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeSlide.quote.borderColor}
                        onChange={(e) => updateSlideElement("quote", { borderColor: e.target.value })}
                        className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={activeSlide.quote.borderColor}
                        onChange={(e) => updateSlideElement("quote", { borderColor: e.target.value })}
                        className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-semibold text-neutral-400">Background Color</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeSlide.quote.backgroundColor}
                        onChange={(e) => updateSlideElement("quote", { backgroundColor: e.target.value })}
                        className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={activeSlide.quote.backgroundColor}
                        onChange={(e) => updateSlideElement("quote", { backgroundColor: e.target.value })}
                        className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Radius (px)</span>
                      <input
                        type="number"
                        value={activeSlide.quote.borderRadius}
                        onChange={(e) => updateSlideElement("quote", { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Padding (px)</span>
                      <input
                        type="number"
                        value={activeSlide.quote.padding}
                        onChange={(e) => updateSlideElement("quote", { padding: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA button specific inputs */}
              {selectedElement === "cta" && (
                <div className="space-y-4 pt-3 border-t">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">CTA Button</span>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-semibold text-neutral-400">Background</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeSlide.cta.backgroundColor}
                        onChange={(e) => updateSlideElement("cta", { backgroundColor: e.target.value })}
                        className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={activeSlide.cta.backgroundColor}
                        onChange={(e) => updateSlideElement("cta", { backgroundColor: e.target.value })}
                        className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-semibold text-neutral-400">Text Color</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeSlide.cta.textColor}
                        onChange={(e) => updateSlideElement("cta", { textColor: e.target.value })}
                        className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={activeSlide.cta.textColor}
                        onChange={(e) => updateSlideElement("cta", { textColor: e.target.value })}
                        className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Radius (px)</span>
                      <input
                        type="number"
                        value={activeSlide.cta.borderRadius}
                        onChange={(e) => updateSlideElement("cta", { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Padding (px)</span>
                      <input
                        type="number"
                        value={activeSlide.cta.padding}
                        onChange={(e) => updateSlideElement("cta", { padding: parseInt(e.target.value) || 0 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Divider specific inputs */}
              {selectedElement === "divider" && (
                <div className="space-y-4 pt-3 border-t">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Divider Line</span>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Thickness (px)</span>
                      <input
                        type="number"
                        value={activeSlide.divider.thickness}
                        onChange={(e) => updateSlideElement("divider", { thickness: parseInt(e.target.value) || 1 })}
                        className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-neutral-400">Color</span>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={activeSlide.divider.color}
                          onChange={(e) => updateSlideElement("divider", { color: e.target.value })}
                          className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unselect layers button */}
              <button 
                onClick={() => {
                  setSelectedElement(null);
                  setIsFooterSelected(false);
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all dark:bg-neutral-800 dark:text-white"
              >
                Clear Selection
              </button>

            </div>
          )}

          {/* Footer/Brand Settings Panel */}
          {isFooterSelected && (
            <div className="space-y-6 animate-fade">
              
              {/* Header info */}
              <div className="flex justify-between items-center pb-3 border-b">
                <div className="flex flex-col text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                    Footer / Brand
                  </h3>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Properties</span>
                </div>
              </div>

              {/* Edit Content Tab */}
              <div className="space-y-4 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Edit Content</span>
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-neutral-400">Brand Name</span>
                  <input
                    type="text"
                    value={activeSlide.footer.brandName}
                    onChange={(e) => updateSlideFooter({ brandName: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-lg text-xs font-semibold dark:bg-neutral-800 dark:border-neutral-700"
                  />
                </div>
              </div>

              {/* Styling Options */}
              <div className="space-y-4 pt-3 border-t">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block pb-1 border-b">Footer Styling</span>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Show Divider</span>
                  <input
                    type="checkbox"
                    checked={activeSlide.footer.dividerEnabled}
                    onChange={(e) => updateSlideFooter({ dividerEnabled: e.target.checked })}
                    className="h-4 w-4 text-neutral-900"
                  />
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Show Page Numbers</span>
                  <input
                    type="checkbox"
                    checked={activeSlide.footer.pageNumberEnabled}
                    onChange={(e) => updateSlideFooter({ pageNumberEnabled: e.target.checked })}
                    className="h-4 w-4 text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-neutral-400">Footer Text Color</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activeSlide.footer.color}
                      onChange={(e) => updateSlideFooter({ color: e.target.value })}
                      className="w-9 h-9 border border-neutral-200 rounded-lg cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={activeSlide.footer.color}
                      onChange={(e) => updateSlideFooter({ color: e.target.value })}
                      className="flex-1 h-9 px-2 border border-neutral-200 rounded-lg text-xs font-mono dark:bg-neutral-800 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Unselect layers button */}
              <button 
                onClick={() => {
                  setSelectedElement(null);
                  setIsFooterSelected(false);
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all dark:bg-neutral-800 dark:text-white"
              >
                Clear Selection
              </button>

            </div>
          )}

        </aside>

      </div>

    </div>
  );
}
