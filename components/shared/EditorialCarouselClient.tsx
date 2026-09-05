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
  MousePointer,
  Hand,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { StudioInspector, CANVAS_FORMAT_PRESETS, CanvasPreset } from "../editor/inspector/StudioInspector";
import { StudioLeftPanel } from "../editor/canvas/StudioLeftPanel";
import { calculateSnap, SnapGuide } from "../editor/canvas/SmartSnapEngine";
import { FigmaTransformGizmo, TransformHandle } from "../editor/canvas/FigmaTransformGizmo";
import { InlineCanvasTextEditor } from "../editor/canvas/InlineCanvasTextEditor";
import { CanvasContextMenu } from "../editor/canvas/CanvasContextMenu";

const isVideo = (url?: string) => {
  if (!url) return false;
  return (
    url.match(
      /\.(mp4|webm|ogg|mov|m4v|mp1|mp2|mpeg|mpg|avi|mkv|flv|wmv|3gp)($|\?)/i,
    ) !== null || url.startsWith("data:video/")
  );
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
  backgroundColor: string;
  category: ElementStyle & { text: string };
  headline: ElementStyle & {
    text: string;
    maxLines: number;
    autoScale: boolean;
  };
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

type ElementKey =
  | "category"
  | "headline"
  | "featuredImage"
  | "body"
  | "bullets"
  | "quote"
  | "cta"
  | "logo"
  | "divider"
  | "author";

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
  {
    name: "Inter",
    value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  { name: "Outfit", value: "'Outfit', sans-serif" },
  { name: "SF Mono", value: "'SF Mono', 'Fira Code', monospace" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  {
    name: "Neue Haas Grotesk",
    value:
      "'Neue Haas Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
];

const DEFAULT_SLIDE = (index: number): Slide => ({
  id: `slide-${Date.now()}-${Math.random()}`,
  backgroundColor: "#ffffff",
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
    zIndex: 10,
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
    zIndex: 11,
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
    zIndex: 5,
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
    zIndex: 12,
  },
  bullets: {
    bulletStyle: "check",
    spacing: 12,
    items: [
      "2.8 Trillion parameters Mixture-of-Experts",
      "Native 1 Million token context window",
      "Multi-modal: supports text and image inputs",
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
    zIndex: 13,
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
    padding: 24,
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
    padding: 16,
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
    zIndex: 8,
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
    zIndex: 4,
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
    zIndex: 9,
  },
  footer: {
    brandName: "GrowxLabs",
    logoEnabled: true,
    dividerEnabled: true,
    pageNumberEnabled: true,
    opacity: 1,
    color: "#000000",
    align: "left",
  },
});

const PRODUCT_CYAN = "#bdefff";
const PRODUCT_IMAGE = "/portfolio/resumeforgeai-card.png";

const PRODUCT_LAUNCH_SLIDE = (
  index: number,
  content: { eyebrow: string; headline: string; body: string; image?: boolean },
): Slide => {
  const slide = DEFAULT_SLIDE(index);
  return {
    ...slide,
    backgroundColor: PRODUCT_CYAN,
    category: {
      ...slide.category,
      text: content.eyebrow,
      x: 132,
      y: 115,
      width: 816,
      height: 28,
      align: "center",
      fontSize: 15,
      letterSpacing: 4,
      color: "#53666b",
      fontWeight: "800",
    },
    headline: {
      ...slide.headline,
      text: content.headline,
      x: 74,
      y: 190,
      width: 932,
      height: 260,
      align: "center",
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: index === 0 ? 78 : 72,
      lineHeight: 1.02,
      letterSpacing: -2.4,
      fontWeight: "700",
      color: "#050505",
      maxLines: 3,
    },
    body: {
      ...slide.body,
      text: content.body,
      x: 168,
      y: 485,
      width: 744,
      height: 110,
      align: "center",
      fontSize: 25,
      lineHeight: 1.45,
      color: "#53666b",
      maxLines: 3,
    },
    featuredImage: {
      ...slide.featuredImage,
      mediaUrl: content.image === false ? "" : PRODUCT_IMAGE,
      x: 62,
      y: 655,
      width: 956,
      height: 560,
      visible: content.image !== false,
      objectFit: "cover",
      borderRadius: 34,
      borderWidth: 4,
      borderColor: "rgba(255,255,255,0.7)",
      shadowEnabled: true,
    },
    bullets: { ...slide.bullets, visible: false },
    quote: { ...slide.quote, visible: false },
    cta: { ...slide.cta, visible: false },
    logo: { ...slide.logo, visible: false },
    divider: { ...slide.divider, visible: false },
    author: { ...slide.author, visible: false },
    footer: {
      ...slide.footer,
      brandName: "RESUMEFORGEAI",
      color: "#53666b",
      dividerEnabled: false,
      pageNumberEnabled: true,
    },
  };
};

const PRODUCT_LAUNCH_DECK = (): Slide[] => [
  PRODUCT_LAUNCH_SLIDE(0, {
    eyebrow: "GROWXLABS PRODUCT LAUNCH",
    headline: "Forge your career.<br/>From resume to offer.",
    body: "ResumeForgeAI brings resumes, interviews and career tools into one focused workspace.",
  }),
  PRODUCT_LAUNCH_SLIDE(1, {
    eyebrow: "THE PROBLEM",
    headline: "Your career tools should work together.",
    body: "Stop moving between disconnected resume builders, job trackers and interview-prep tools.",
  }),
  PRODUCT_LAUNCH_SLIDE(2, {
    eyebrow: "ONE WORKSPACE",
    headline: "Build a resume that is ready for the role.",
    body: "Create, improve and organize role-specific resumes from one focused dashboard.",
  }),
  PRODUCT_LAUNCH_SLIDE(3, {
    eyebrow: "INTERVIEW PREP",
    headline: "Practice before the interview matters.",
    body: "Prepare answers, rehearse technical conversations and enter every interview with clarity.",
  }),
  PRODUCT_LAUNCH_SLIDE(4, {
    eyebrow: "JOB TRACKER",
    headline: "Know exactly where every application stands.",
    body: "Track roles, interviews and next steps without losing momentum between opportunities.",
  }),
  PRODUCT_LAUNCH_SLIDE(5, {
    eyebrow: "BUILT FOR DEVELOPERS",
    headline: "A career system designed for technical talent.",
    body: "Keep your projects, skills, resumes and interview progress connected as your career grows.",
  }),
  PRODUCT_LAUNCH_SLIDE(6, {
    eyebrow: "NOW AVAILABLE",
    headline: "Your next opportunity starts here.",
    body: "Create your ResumeForgeAI workspace and move from resume to offer with a clearer process.",
  }),
];

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
      headline: {
        ...slide.headline,
        text: "Moonshot built the world's largest open model",
        visible: true,
      },
      featuredImage: { ...slide.featuredImage, visible: true },
      body: {
        ...slide.body,
        text: "Kimi K3 is a 2.8 trillion parameter Mixture-of-Experts model, the largest open-weight AI system ever released.",
        visible: true,
      },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: false },
      author: { ...slide.author, visible: false },
      divider: { ...slide.divider, visible: false },
    }),
  },
  {
    id: "research",
    name: "Research Insights",
    category: "Academic",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "RESEARCH STUDY", visible: true },
      headline: {
        ...slide.headline,
        text: "Decentralized Training Runs Over Heterogeneous Networks",
        visible: true,
      },
      featuredImage: { ...slide.featuredImage, visible: false },
      body: {
        ...slide.body,
        text: "Our empirical study shows decentralized networks can achieve up to 84% baseline efficiency under model compression pipelines.",
        visible: true,
      },
      bullets: { ...slide.bullets, visible: true },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: false },
    }),
  },
  {
    id: "services",
    name: "Product & Services",
    category: "Marketing",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "CORE SERVICES", visible: true },
      headline: {
        ...slide.headline,
        text: "End-to-End AI Engineering & Agent Orchestration",
        visible: true,
      },
      featuredImage: { ...slide.featuredImage, visible: true, height: 350 },
      body: {
        ...slide.body,
        text: "We configure multi-agent networks, clean pipeline nodes, and build high-performance search infrastructures tailored to your CRM workflow.",
        visible: true,
      },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: false },
      cta: { ...slide.cta, visible: true },
    }),
  },
  {
    id: "quote",
    name: "Editorial Quote",
    category: "Social",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "EDITORIAL QUOTE", visible: true },
      headline: {
        ...slide.headline,
        text: "What our team says about pipeline safety:",
        visible: true,
      },
      featuredImage: { ...slide.featuredImage, visible: false },
      body: { ...slide.body, visible: false },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: true },
      cta: { ...slide.cta, visible: false },
    }),
  },
];

export function EditorialCarouselClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const [slides, setSlides] = useState<Slide[]>([DEFAULT_SLIDE(0)]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(
    null,
  );
  const [isFooterSelected, setIsFooterSelected] = useState(false);
  const [editorMode, setEditorMode] = useState<"fixed" | "free">("fixed");

  // Viewport & Infinite Canvas Control
  const [zoomScale, setZoomScale] = useState(0.48);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [pan, setPan] = useState({ x: 120, y: 80 });
  const [activeTool, setActiveTool] = useState<"select" | "hand">("select");
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeFormat, setActiveFormat] = useState<CanvasPreset>(CANVAS_FORMAT_PRESETS[0]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Viewport & Canvas refs
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Figma interactive canvas states
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [editingTextKey, setEditingTextKey] = useState<ElementKey | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<{
    x: number;
    y: number;
    key: ElementKey | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<TransformHandle | null>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
  } | null>(null);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
    handle: TransformHandle;
    aspectRatio: number;
  } | null>(null);
  const rotateStartRef = useRef<{
    centerX: number;
    centerY: number;
    startAngle: number;
    initialRotation: number;
  } | null>(null);

  // App states for history
  const [history, setHistory] = useState<Slide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Push new state to history stack
  const saveHistory = (newSlides: Slide[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(newSlides))]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      toast.success("Undo successful");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Synchronize darkMode state with resolvesTheme
  useEffect(() => {
    setDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // Center canvas on first load
  useEffect(() => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const defaultZoom = 0.48;
    const artboardWidth = activeFormat.width * defaultZoom;
    const artboardHeight = activeFormat.height * defaultZoom;

    setPan({
      x: Math.max(20, (rect.width - artboardWidth) / 2),
      y: Math.max(20, (rect.height - artboardHeight) / 2),
    });
    setZoomScale(defaultZoom);
  }, []);

  // Fit canvas to screen function helper
  const handleFitToScreen = () => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const margin = 40;
    const availableWidth = rect.width - margin * 2;
    const availableHeight = rect.height - margin * 2;
    const zoomW = availableWidth / activeFormat.width;
    const zoomH = availableHeight / activeFormat.height;
    const newZoom = Math.min(zoomW, zoomH, 1.2);
    const clampedZoom = Math.max(0.15, newZoom);
    setZoomScale(clampedZoom);
    setPan({
      x: (rect.width - activeFormat.width * clampedZoom) / 2,
      y: (rect.height - activeFormat.height * clampedZoom) / 2,
    });
  };

  // Format switcher handler
  const handleFormatChange = (preset: CanvasPreset) => {
    setActiveFormat(preset);
    toast.success(`Switched format: ${preset.name} (${preset.width} × ${preset.height})`);
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const margin = 40;
      const availableWidth = rect.width - margin * 2;
      const availableHeight = rect.height - margin * 2;
      const zoomW = availableWidth / preset.width;
      const zoomH = availableHeight / preset.height;
      const newZoom = Math.max(0.15, Math.min(zoomW, zoomH, 1.0));
      setZoomScale(newZoom);
      setPan({
        x: Math.max(20, (rect.width - preset.width * newZoom) / 2),
        y: Math.max(20, (rect.height - preset.height * newZoom) / 2),
      });
    }
  };

  // Viewport wheel zooming & scroll-panning
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = 1.05;
        const newZoom =
          e.deltaY > 0 ? zoomScale / zoomFactor : zoomScale * zoomFactor;
        const clampedZoom = Math.min(Math.max(0.15, newZoom), 3.0);

        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - pan.x) / zoomScale;
        const worldY = (mouseY - pan.y) / zoomScale;

        const newPanX = mouseX - worldX * clampedZoom;
        const newPanY = mouseY - worldY * clampedZoom;

        setZoomScale(clampedZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        const panSpeed = 0.8;
        if (e.shiftKey) {
          setPan((prev) => ({ ...prev, x: prev.x - e.deltaY * panSpeed }));
        } else {
          setPan((prev) => ({
            x: prev.x - e.deltaX * panSpeed,
            y: prev.y - e.deltaY * panSpeed,
          }));
        }
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [zoomScale, pan]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === " " && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        isCmdOrCtrl &&
        ((e.key.toLowerCase() === "z" && e.shiftKey) ||
          e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }

      if (isCmdOrCtrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoomScale((prev) => Math.min(3.0, prev + 0.05));
      }

      if (isCmdOrCtrl && e.key === "-") {
        e.preventDefault();
        setZoomScale((prev) => Math.max(0.15, prev - 0.05));
      }

      if (isCmdOrCtrl && e.key === "0") {
        e.preventDefault();
        handleFitToScreen();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElement) {
          e.preventDefault();
          updateSlideElement(selectedElement, { visible: false });
          setSelectedElement(null);
          toast.success(`Removed layer: ${selectedElement}`);
        } else if (isFooterSelected) {
          e.preventDefault();
          updateSlideFooter({ opacity: 0 });
          setIsFooterSelected(false);
          toast.success("Removed footer layer");
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedElement(null);
        setIsFooterSelected(false);
        setContextMenu(null);
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toast.success("Design saved successfully!");
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSlide(activeIndex);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [
    isSpacePressed,
    selectedElement,
    isFooterSelected,
    activeIndex,
    slides,
    historyIndex,
    history,
  ]);

  // Left panel collapse settings
  const [leftTab, setLeftTab] = useState<"slides" | "templates" | "brand">(
    "slides",
  );

  // App states
  const [projectName, setProjectName] = useState("GrowXLabs Editorial Post");
  const [documentKind, setDocumentKind] = useState<"editorial" | "product">(
    "editorial",
  );
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const activeSlide = slides[activeIndex] || DEFAULT_SLIDE(0);

  const switchDocumentKind = (kind: "editorial" | "product") => {
    if (kind === documentKind) return;
    if (kind === "product") {
      const launchDeck = PRODUCT_LAUNCH_DECK();
      setDocumentKind("product");
      setProjectName("ResumeForgeAI Product Launch");
      setEditorMode("free");
      setSlides(launchDeck);
      setActiveIndex(0);
      setSelectedElement(null);
      saveHistory(launchDeck);
      toast.success("Product Launch deck created — 7 premium slides");
      return;
    }

    const editorialDeck = [DEFAULT_SLIDE(0)];
    setDocumentKind("editorial");
    setProjectName("GrowXLabs Editorial Post");
    setEditorMode("fixed");
    setSlides(editorialDeck);
    setActiveIndex(0);
    setSelectedElement(null);
    saveHistory(editorialDeck);
    toast.success("Editorial news canvas restored");
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
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Media upload failed");
      }
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

      toast.success("Asset saved to database successfully!", {
        id: uploadToast,
      });
    } catch (err) {
      console.error("Database upload failed:", err);
      // Never leave a blob URL in the editor after persistence fails. Blob URLs
      // disappear on reload and must not be treated as saved media references.
      updateSlideElement("featuredImage", { mediaUrl: "" });
      toast.error(
        err instanceof Error ? err.message : "Media could not be saved",
        { id: uploadToast },
      );
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
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap";
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
      updated.body.y =
        updated.featuredImage.y + updated.featuredImage.height + 40;
      updated.body.width = SAFE_WIDTH;

      updated.quote.x = SAFE_LEFT;
      updated.quote.y =
        updated.featuredImage.y + updated.featuredImage.height + 40;
      updated.quote.width = SAFE_WIDTH;

      updated.bullets.x = SAFE_LEFT;
      updated.bullets.y =
        updated.body.y + (updated.body.visible ? updated.body.height + 20 : 0);
      updated.bullets.width = SAFE_WIDTH;

      updated.cta.x = SAFE_LEFT;
      updated.cta.y =
        updated.bullets.y +
        (updated.bullets.visible ? updated.bullets.height + 20 : 40);

      updated.logo.x = SAFE_LEFT;
      updated.logo.y = SAFE_TOP;

      updated.divider.x = SAFE_LEFT;
      updated.divider.y = 275;
      updated.divider.width = SAFE_WIDTH;

      updated.author.x = SAFE_LEFT;
      updated.author.y = 770;

      setSlides((prev) =>
        prev.map((s, i) => (i === activeIndex ? updated : s)),
      );
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
    activeIndex,
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
          ...updates,
        },
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
          ...updates,
        },
      };
    });
    setSlides(newSlides);
    saveHistory(newSlides);
  };

  const updateSlideBackground = (backgroundColor: string) => {
    const newSlides = slides.map((slide, idx) =>
      idx === activeIndex ? { ...slide, backgroundColor } : slide,
    );
    setSlides(newSlides);
    saveHistory(newSlides);
  };

  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (val: string) => void,
  ) => {
    return (
      <div className="flex gap-2 items-center text-left">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer shrink-0 bg-transparent"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-2.5 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-950 focus:outline-none focus:border-[#1687f8] dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100"
        />
      </div>
    );
  };

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "hand" || isSpacePressed || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elemX: pan.x,
        elemY: pan.y,
      };
      document.addEventListener("mousemove", handleViewportMouseMove);
      document.addEventListener("mouseup", handleViewportMouseUp);
    }
  };

  const handleViewportMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPan({
      x: dragStartRef.current.elemX + dx,
      y: dragStartRef.current.elemY + dy,
    });
  };

  const handleViewportMouseUp = () => {
    setIsPanning(false);
    document.removeEventListener("mousemove", handleViewportMouseMove);
    document.removeEventListener("mouseup", handleViewportMouseUp);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...slides];
    const item = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, item);

    setDraggedIndex(index);
    setSlides(reordered);
    setActiveIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveHistory(slides);
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      index,
    });
  };

  const renderShortcutsModal = () => {
    if (!showShortcutsModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#111214] border border-neutral-200 dark:border-[rgba(255,255,255,0.08)] rounded-[18px] w-full max-w-md p-6 shadow-2xl animate-fade"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-[rgba(255,255,255,0.06)] mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-[#1687f8] tracking-widest">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-left">
            {[
              { keys: ["Space", "Drag"], desc: "Pan workspace canvas" },
              { keys: ["Ctrl/Cmd", "Z"], desc: "Undo last change" },
              { keys: ["Ctrl/Cmd", "Shift", "Z"], desc: "Redo change" },
              { keys: ["Ctrl/Cmd", "Scroll"], desc: "Zoom in / out at cursor" },
              { keys: ["Ctrl/Cmd", "+"], desc: "Zoom In" },
              { keys: ["Ctrl/Cmd", "-"], desc: "Zoom Out" },
              { keys: ["Ctrl/Cmd", "0"], desc: "Fit to screen view" },
              { keys: ["Delete / Backspace"], desc: "Delete selected layer" },
              { keys: ["Escape"], desc: "Clear active selection" },
            ].map((shortcut, sIdx) => (
              <div
                key={sIdx}
                className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 dark:border-neutral-900 last:border-b-0"
              >
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                  {shortcut.desc}
                </span>
                <div className="flex gap-1">
                  {shortcut.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded font-mono text-[10px] font-bold text-neutral-800 dark:text-neutral-200 shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const addSlide = () => {
    const nextSlide =
      documentKind === "product"
        ? PRODUCT_LAUNCH_SLIDE(slides.length, {
            eyebrow: "PRODUCT STORY",
            headline: "Add the next chapter of your launch story.",
            body: "Edit this message, replace the product image and shape the next part of your campaign.",
          })
        : DEFAULT_SLIDE(slides.length);
    const newSlides = [...slides, nextSlide];
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
    const preset = TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const newSlides = slides.map((s, i) =>
      i === activeIndex ? preset.setup(s) : s,
    );
    setSlides(newSlides);
    saveHistory(newSlides);
    toast.success(`Applied ${preset.name} template layout`);
  };

  // ==========================================
  // ELEMENT POINTER HANDLERS (FIGMA 8-POINT DRAG, RESIZE & ROTATE)
  // ==========================================

  const handleElementMouseDown = (e: React.MouseEvent, key: ElementKey) => {
    if (e.button !== 0) return;
    setSelectedElement(key);
    setIsFooterSelected(false);

    if (editorMode === "fixed") setEditorMode("free");

    const elem = activeSlide[key];
    if (elem.locked) return;

    e.stopPropagation();
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
    };

    document.addEventListener("mousemove", handleElementMouseMove);
    document.addEventListener("mouseup", handleElementMouseUp);
  };

  const handleElementMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !selectedElement) return;

    const dx = (e.clientX - dragStartRef.current.startX) / zoomScale;
    const dy = (e.clientY - dragStartRef.current.startY) / zoomScale;

    const rawX = Math.round(dragStartRef.current.elemX + dx);
    const rawY = Math.round(dragStartRef.current.elemY + dy);
    const elem = activeSlide[selectedElement];

    if (showGuides) {
      const otherElements = (
        [
          "category",
          "headline",
          "featuredImage",
          "body",
          "bullets",
          "quote",
          "cta",
          "logo",
          "divider",
          "author",
        ] as ElementKey[]
      )
        .filter((k) => k !== selectedElement && activeSlide[k]?.visible)
        .map((k) => ({
          key: k,
          x: activeSlide[k].x,
          y: activeSlide[k].y,
          width: activeSlide[k].width,
          height: activeSlide[k].height,
          visible: activeSlide[k].visible,
        }));

      const snap = calculateSnap(
        { x: rawX, y: rawY, width: elem.width, height: elem.height },
        otherElements,
        { canvasWidth: activeFormat.width, canvasHeight: activeFormat.height }
      );
      setActiveGuides(snap.guides);
      updateSlideElement(selectedElement, { x: snap.x, y: snap.y });
    } else {
      updateSlideElement(selectedElement, { x: rawX, y: rawY });
    }
  };

  const handleElementMouseUp = () => {
    setIsDragging(false);
    setActiveGuides([]);
    dragStartRef.current = null;
    document.removeEventListener("mousemove", handleElementMouseMove);
    document.removeEventListener("mouseup", handleElementMouseUp);
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    key: ElementKey,
    handle: TransformHandle
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedElement(key);
    setIsFooterSelected(false);

    if (editorMode === "fixed") setEditorMode("free");

    const elem = activeSlide[key];
    if (elem.locked) return;

    setIsResizing(true);
    setActiveResizeHandle(handle);

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height,
      handle,
      aspectRatio: elem.width / Math.max(1, elem.height),
    };

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizeStartRef.current || !selectedElement) return;

    const dx = (e.clientX - resizeStartRef.current.startX) / zoomScale;
    const dy = (e.clientY - resizeStartRef.current.startY) / zoomScale;
    const { elemX, elemY, elemW, elemH, handle, aspectRatio } =
      resizeStartRef.current;

    let newX = elemX;
    let newY = elemY;
    let newW = elemW;
    let newH = elemH;

    if (handle.includes("e")) newW = Math.max(40, Math.round(elemW + dx));
    if (handle.includes("s")) newH = Math.max(20, Math.round(elemH + dy));
    if (handle.includes("w")) {
      const potentialW = Math.max(40, Math.round(elemW - dx));
      newX = elemX + (elemW - potentialW);
      newW = potentialW;
    }
    if (handle.includes("n")) {
      const potentialH = Math.max(20, Math.round(elemH - dy));
      newY = elemY + (elemH - potentialH);
      newH = potentialH;
    }

    if (
      e.shiftKey &&
      (handle === "nw" || handle === "ne" || handle === "se" || handle === "sw")
    ) {
      newH = Math.max(20, Math.round(newW / aspectRatio));
    }

    updateSlideElement(selectedElement, {
      x: newX,
      y: newY,
      width: newW,
      height: newH,
    });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    setActiveResizeHandle(null);
    resizeStartRef.current = null;
    document.removeEventListener("mousemove", handleResizeMouseMove);
    document.removeEventListener("mouseup", handleResizeMouseUp);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !selectedElement) return;
    e.stopPropagation();
    const elem = activeSlide[selectedElement];
    if (elem.locked) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const centerScreenX =
      canvasRect.left + (elem.x + elem.width / 2) * zoomScale;
    const centerScreenY =
      canvasRect.top + (elem.y + elem.height / 2) * zoomScale;

    setIsRotating(true);
    rotateStartRef.current = {
      centerX: centerScreenX,
      centerY: centerScreenY,
      startAngle:
        Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX) *
        (180 / Math.PI),
      initialRotation: elem.rotation || 0,
    };

    document.addEventListener("mousemove", handleRotateMouseMove);
    document.addEventListener("mouseup", handleRotateMouseUp);
  };

  const handleRotateMouseMove = (e: MouseEvent) => {
    if (!rotateStartRef.current || !selectedElement) return;
    const { centerX, centerY, startAngle, initialRotation } =
      rotateStartRef.current;
    const currentAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    let deltaAngle = currentAngle - startAngle;
    let newRotation = (initialRotation + deltaAngle) % 360;
    if (newRotation < 0) newRotation += 360;

    if (e.shiftKey) {
      newRotation = Math.round(newRotation / 15) * 15;
    }

    updateSlideElement(selectedElement, { rotation: Math.round(newRotation) });
  };

  const handleRotateMouseUp = () => {
    setIsRotating(false);
    rotateStartRef.current = null;
    document.removeEventListener("mousemove", handleRotateMouseMove);
    document.removeEventListener("mouseup", handleRotateMouseUp);
  };

  // Keyboard Shortcuts (Nudge, Duplicate, Z-index, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || editingTextKey) {
        return;
      }

      if (!selectedElement) return;
      const elem = activeSlide[selectedElement];
      if (!elem) return;

      const delta = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateSlideElement(selectedElement, { x: elem.x - delta });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateSlideElement(selectedElement, { x: elem.x + delta });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateSlideElement(selectedElement, { y: elem.y - delta });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateSlideElement(selectedElement, { y: elem.y + delta });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        updateSlideElement(selectedElement, { visible: false });
        toast.info(`Hidden ${selectedElement} layer`);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSlide(activeIndex);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        e.preventDefault();
        const nextZ = e.shiftKey ? 50 : Math.min(50, (elem.zIndex || 1) + 1);
        updateSlideElement(selectedElement, { zIndex: nextZ });
        toast.success(`Layer depth: ${nextZ}`);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault();
        const nextZ = e.shiftKey ? 1 : Math.max(1, (elem.zIndex || 1) - 1);
        updateSlideElement(selectedElement, { zIndex: nextZ });
        toast.success(`Layer depth: ${nextZ}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, activeSlide, activeIndex, editingTextKey]);

  // ==========================================
  // EXPORT ENGINE
  // ==========================================

  const buildSvgString = (
    slide: Slide,
    index: number,
    includeFonts = true,
    videoFrameUrl?: string,
  ) => {
    const fontsMarkup = includeFonts
      ? DEFAULT_FONTS.map(
          (f) =>
            `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;600;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');`,
        ).join("\n")
      : "";

    const renderTextMarkup = (el: ElementStyle & { text: string }) => {
      if (!el.visible) return "";
      const textTransform = el.uppercase ? "uppercase" : "none";
      const alignClass =
        el.align === "center"
          ? "text-center justify-center"
          : el.align === "right"
            ? "text-right justify-end"
            : "text-left justify-start";
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
      const borderStyle =
        el.borderWidth > 0
          ? `border: ${el.borderWidth}px solid ${el.borderColor};`
          : "";
      const shadowStyle = el.shadowEnabled
        ? "box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);"
        : "";

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
          ${
            el.mediaUrl
              ? isVideoAsset
                ? `
              <img src="${videoFrameUrl || el.mediaUrl}" style="width: 100%; height: 100%; object-fit: ${el.objectFit}; filter: brightness(${el.brightness}%) contrast(${el.contrast}%);" />
            `
                : `
              <img src="${el.mediaUrl}" style="width: 100%; height: 100%; object-fit: ${el.objectFit}; filter: brightness(${el.brightness}%) contrast(${el.contrast}%);" />
            `
              : `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #e2e8f0, #cbd5e1); display: flex; align-items: center; justify-content: center; color: #475569; font-family: sans-serif; font-weight: bold; font-size: 24px;">
              Featured Asset
            </div>
          `
          }
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
            ${el.items
              .map(
                (item, idx) => `
              <li style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="color: #000000; font-weight: bold;">${el.bulletStyle === "check" ? "✔" : el.bulletStyle === "number" ? `${idx + 1}.` : "•"}</span>
                <span>${item}</span>
              </li>
            `,
              )
              .join("")}
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
          ${
            el.logoUrl
              ? `
            <img src="${el.logoUrl}" style="width:100%; height:100%; object-fit:contain;" />
          `
              : `
            <div style="width:100%; height:100%; border-radius:50%; background:#0075de; color:white; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-weight:bold; font-size:12px;">GX</div>
          `
          }
        </div>
      `;
    };

    const renderDividerMarkup = (
      el: ElementStyle & { color: string; thickness: number },
    ) => {
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
        "></div>
      `;
    };

    const renderAuthorMarkup = (
      el: ElementStyle & { name: string; avatarUrl: string },
    ) => {
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
            ${el.avatarUrl ? `<img src="${el.avatarUrl}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; background:#0075de;"></div>`}
          </div>
          <span>${el.name}</span>
        </div>
      `;
    };

    const renderFooterMarkup = () => {
      const pageNumStr =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(slides.length).padStart(2, "0");
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
          ${
            slide.footer.pageNumberEnabled
              ? `
            <span style="font-weight: 500; font-size: 16px; opacity: 0.6;">
              ${pageNumStr}
            </span>
          `
              : ""
          }
        </div>
      `;
    };

    return `
      <svg 
        viewBox="0 0 ${activeFormat.width} ${activeFormat.height}" 
        width="${activeFormat.width}" 
        height="${activeFormat.height}" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            ${fontsMarkup}
          </style>
        </defs>
        <foreignObject x="0" y="0" width="${activeFormat.width}" height="${activeFormat.height}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${activeFormat.width}px;
            height: ${activeFormat.height}px;
            background: ${slide.backgroundColor || "#ffffff"};
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
    if (url.startsWith("data:") || url.startsWith("blob:")) return url; // already local
    try {
      const targetUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const res = await fetch(targetUrl);
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

  const prepareSlideForExport = async (
    slide: Slide,
    idx: number,
  ): Promise<{ slide: Slide; videoFrameUrl?: string }> => {
    const cloned = JSON.parse(JSON.stringify(slide)) as Slide;

    // 1. Get and convert video frame if video
    let videoFrameDataUrl = "";
    if (
      cloned.featuredImage.visible &&
      cloned.featuredImage.mediaUrl &&
      isVideo(cloned.featuredImage.mediaUrl)
    ) {
      const frameUrl = await getSlideVideoFrame(cloned, idx);
      if (frameUrl) {
        videoFrameDataUrl = await toDataUrl(frameUrl);
      }
    } else if (cloned.featuredImage.visible && cloned.featuredImage.mediaUrl) {
      // Convert normal image to data URL
      cloned.featuredImage.mediaUrl = await toDataUrl(
        cloned.featuredImage.mediaUrl,
      );
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

  const getSlideVideoFrame = async (
    slide: Slide,
    idx: number,
  ): Promise<string> => {
    if (
      !slide.featuredImage.visible ||
      !slide.featuredImage.mediaUrl ||
      !isVideo(slide.featuredImage.mediaUrl)
    ) {
      return "";
    }

    // 1. Try to capture from the live video element in the DOM if this is the active slide
    if (idx === activeIndex) {
      try {
        const liveVideo = canvasRef.current?.querySelector(
          "video",
        ) as HTMLVideoElement;
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
        console.warn(
          "Failed to capture live DOM video frame, falling back to background loading:",
          err,
        );
      }
    }

    // 2. Otherwise load in background (proxied for CORS safety) and extract the frame
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

      let videoSrc = slide.featuredImage.mediaUrl;
      if (videoSrc.startsWith("http")) {
        videoSrc = `/api/proxy-image?url=${encodeURIComponent(videoSrc)}`;
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
            try {
              document.body.removeChild(video);
            } catch (e) {}
            resolve(dataUrl);
            return;
          }
        } catch (err) {
          console.error("Error drawing background video frame:", err);
        }
        try {
          document.body.removeChild(video);
        } catch (e) {}
        resolve("");
      };

      video.onerror = () => {
        console.error(
          "Error loading video in background for frame capture:",
          slide.featuredImage.mediaUrl,
        );
        try {
          document.body.removeChild(video);
        } catch (e) {}
        resolve("");
      };

      video.src = videoSrc;
      video.load();

      // Set timeout of 4 seconds so we don't hang the export forever if the video fails to load
      setTimeout(() => {
        try {
          document.body.removeChild(video);
        } catch (e) {}
        resolve("");
      }, 4000);
    });
  };

  const convertSvgToRaster = async (
    svgString: string,
    type: "png" | "jpeg",
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const encodedSvg =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = activeFormat.width;
          canvas.height = activeFormat.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            if (type === "jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, activeFormat.width, activeFormat.height);
            }
            ctx.drawImage(img, 0, 0, activeFormat.width, activeFormat.height);
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
        img.width = activeFormat.width;
        img.height = activeFormat.height;
        img.src = encodedSvg;
      } catch (err) {
        console.error("Base64 string convert error:", err);
        reject(err);
      }
    });
  };

  const handleDownloadSlideSvg = async (idx: number) => {
    const toastId = toast.loading(`Generating Slide ${idx + 1} SVG...`);
    try {
      const { slide, videoFrameUrl } = await prepareSlideForExport(
        slides[idx],
        idx,
      );
      const svgStr = buildSvgString(slide, idx, true, videoFrameUrl);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-slide-${idx + 1}-1080x1350.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported Slide ${idx + 1} as clean vector SVG!`, {
        id: toastId,
      });
    } catch (e) {
      console.error(e);
      toast.error("SVG generation failed", { id: toastId });
    }
  };

  const handleDownloadSlideRaster = async (
    idx: number,
    type: "png" | "jpeg",
  ) => {
    const toastId = toast.loading(
      `Exporting Slide ${idx + 1} as ${type.toUpperCase()}...`,
    );
    try {
      // 1. Primary: Use pixel-perfect 1080x1350 SVG-to-raster renderer with base64 converted assets
      const { slide, videoFrameUrl } = await prepareSlideForExport(
        slides[idx],
        idx,
      );
      const svgStr = buildSvgString(slide, idx, false, videoFrameUrl);
      const dataUrl = await convertSvgToRaster(svgStr, type);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-slide-${idx + 1}-1080x1350.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported Slide ${idx + 1} as ${type.toUpperCase()}!`, {
        id: toastId,
      });
    } catch (primaryErr) {
      console.warn(
        "Primary SVG rasterizer failed, trying html2canvas fallback:",
        primaryErr,
      );
      try {
        const element = canvasRef.current;
        if (!element || idx !== activeIndex) {
          throw new Error("Canvas ref not available for html2canvas fallback");
        }
        const html2canvas = (await import("html2canvas-pro")).default;
        const safeArea = element.querySelector(".border-dashed") as HTMLElement;
        const grid = element.querySelector(
          ".opacity-\\[0\\.03\\]",
        ) as HTMLElement;
        const safeAreaDisplay = safeArea ? safeArea.style.display : "";
        const gridDisplay = grid ? grid.style.display : "";

        if (safeArea) safeArea.style.display = "none";
        if (grid) grid.style.display = "none";

        const canvas = await html2canvas(element, {
          scale: 1 / zoomScale,
          useCORS: true,
          allowTaint: false,
          backgroundColor: slides[idx]?.backgroundColor || "#ffffff",
        });

        if (safeArea) safeArea.style.display = safeAreaDisplay;
        if (grid) grid.style.display = gridDisplay;

        const dataUrl = canvas.toDataURL(`image/${type}`, 0.95);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-slide-${idx + 1}-1080x1350.${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported Slide ${idx + 1} as ${type.toUpperCase()}!`, {
          id: toastId,
        });
      } catch (fallbackErr) {
        console.error("html2canvas fallback also failed:", fallbackErr);
        toast.error(`Failed to export slide as ${type.toUpperCase()}`, {
          id: toastId,
        });
      }
    }
  };

  const handleDownloadPdf = async () => {
    const downloadToast = toast.loading("Generating full carousel PDF...");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: activeFormat.width > activeFormat.height ? "landscape" : "portrait",
        unit: "px",
        format: [activeFormat.width, activeFormat.height],
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) doc.addPage([activeFormat.width, activeFormat.height], activeFormat.width > activeFormat.height ? "landscape" : "portrait");
        const { slide, videoFrameUrl } = await prepareSlideForExport(
          slides[i],
          i,
        );
        const svgStr = buildSvgString(slide, i, false, videoFrameUrl); // Bypass CORS security policies
        const dataUrl = await convertSvgToRaster(svgStr, "png");
        doc.addImage(dataUrl, "PNG", 0, 0, activeFormat.width, activeFormat.height);
      }

      doc.save(
        `${projectName.toLowerCase().replace(/\s+/g, "-")}-carousel.pdf`,
      );
      toast.success(`Exported the deck at ${activeFormat.width} × ${activeFormat.height} per page.`, {
        id: downloadToast,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF file", { id: downloadToast });
    }
  };

  const handleDownloadMp4 = async () => {
    const videoToast = toast.loading(
      "Compiling carousel deck into an MP4/WebM video...",
    );
    try {
      const canvas = document.createElement("canvas");
      canvas.width = activeFormat.width;
      canvas.height = activeFormat.height;
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

      const recordedPromise = new Promise<Blob>(
        (resolveRecorded, rejectRecorded) => {
          recorder.onstop = () => {
            const blob = new Blob(chunks, {
              type: recorder.mimeType || "video/mp4",
            });
            resolveRecorded(blob);
          };
          recorder.onerror = (e) => {
            rejectRecorded(e);
          };
        },
      );

      recorder.start();

      // Loop through slides
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const isVideoAsset =
          slide.featuredImage.visible &&
          slide.featuredImage.mediaUrl &&
          isVideo(slide.featuredImage.mediaUrl);

        toast.loading(`Processing slide ${i + 1}/${slides.length}...`, {
          id: videoToast,
        });

        if (isVideoAsset) {
          // Route video source through the local CORS proxy to bypass security blocks
          let videoSrc = slide.featuredImage.mediaUrl;
          if (videoSrc.startsWith("http")) {
            videoSrc = `/api/proxy-image?url=${encodeURIComponent(videoSrc)}`;
          }

          // First, create and load a hidden video element
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.autoplay = false;
          video.style.position = "absolute";
          video.style.opacity = "0";
          video.style.pointerEvents = "none";
          video.style.width = "1px";
          video.style.height = "1px";
          document.body.appendChild(video);

          video.src = videoSrc;
          video.crossOrigin = "anonymous";

          await new Promise<void>((resLoad) => {
            video.onloadedmetadata = () => resLoad();
            video.onerror = () => resLoad();
            video.load();
          });

          // Rasterize static slide background (everything except the featured image)
          const { slide: sanitizedSlide } = await prepareSlideForExport(
            slide,
            i,
          );
          const slideBg = JSON.parse(JSON.stringify(sanitizedSlide)) as Slide;
          slideBg.featuredImage.visible = false; // hide featured image on background raster
          const bgSvg = buildSvgString(slideBg, i, false);
          const bgUrl = await convertSvgToRaster(bgSvg, "png");
          const bgImg = new Image();
          await new Promise((resBg) => {
            bgImg.onload = resBg;
            bgImg.src = bgUrl;
          });

          // Determine playback duration
          const duration = video.duration || 5; // default to 5 seconds
          const totalFrames = Math.ceil(duration * 15); // record at 15 FPS for faster rendering and lighter CPU/decoding loads

          // Draw frame-by-frame by seeking systematically to get exact matching decodes
          for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const seekTime = frameIndex / 15;
            video.currentTime = seekTime;

            // Wait for seek operation to complete
            await new Promise<void>((resSeek) => {
              const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                // Give the CPU/GPU 150ms buffer time to paint the decoded texture to the video element
                setTimeout(resSeek, 150);
              };
              video.addEventListener("seeked", onSeeked);
              // Safe timeout in case seek fails/hangs
              setTimeout(resSeek, 400);
            });

            ctx.clearRect(0, 0, activeFormat.width, activeFormat.height);

            // Draw background slide elements
            ctx.drawImage(bgImg, 0, 0, activeFormat.width, activeFormat.height);

            // Draw video frame with clipping and filters
            ctx.save();
            if (
              slide.featuredImage.brightness !== 100 ||
              slide.featuredImage.contrast !== 100
            ) {
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

            // Sync frame delay
            await new Promise((r) => setTimeout(r, 16));
          }

          try {
            document.body.removeChild(video);
          } catch (e) {}
        } else {
          // 2. Static Slide processing
          // Rasterize full slide SVG (including image or empty placeholder)
          const { slide: sanitizedSlide } = await prepareSlideForExport(
            slide,
            i,
          );
          const svgStr = buildSvgString(sanitizedSlide, i, false);
          const dataUrl = await convertSvgToRaster(svgStr, "png");
          const img = new Image();
          await new Promise((resImg) => {
            img.onload = resImg;
            img.src = dataUrl;
          });

          // Render static frame for 3.5 seconds (53 frames at 15 FPS)
          const staticFrames = 53;
          for (let frameIndex = 0; frameIndex < staticFrames; frameIndex++) {
            ctx.clearRect(0, 0, activeFormat.width, activeFormat.height);
            ctx.drawImage(img, 0, 0, activeFormat.width, activeFormat.height);
            await new Promise((r) => setTimeout(r, 16));
          }
        }
      }

      // Stop recording
      recorder.stop();
      toast.loading("Packaging video track...", { id: videoToast });

      const finalBlob = await recordedPromise;
      const downloadUrl = URL.createObjectURL(finalBlob);

      const actualMime = recorder.mimeType || options.mimeType;
      const fileExt = actualMime.includes("mp4") ? "mp4" : "webm";

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-video.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Successfully exported carousel video as .${fileExt}!`, {
        id: videoToast,
      });
      if (fileExt === "webm") {
        toast.info(
          "WebM is fully supported by LinkedIn & Instagram. To play it offline on legacy players, open the file inside Google Chrome.",
          { duration: 8000 },
        );
      }
    } catch (e: any) {
      console.error("Video compile error:", e);
      toast.error(`Video generation failed: ${e.message || "Unknown error"}`, {
        id: videoToast,
      });
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
    const isTextElement = [
      "category",
      "headline",
      "body",
      "quote",
      "cta",
      "author",
    ].includes(key);

    const containerStyle: React.CSSProperties = {
      position: "absolute",
      left: `${elem.x}px`,
      top: `${elem.y}px`,
      width: `${elem.width}px`,
      height: `${elem.height}px`,
      opacity: elem.opacity,
      transform: `rotate(${elem.rotation || 0}deg)`,
      cursor: elem.locked ? "not-allowed" : "move",
      boxSizing: "border-box",
      userSelect: "none",
      zIndex: elem.zIndex || 1,
    };

    return (
      <div
        style={containerStyle}
        onMouseDown={(e) => handleElementMouseDown(e, key)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isTextElement && !elem.locked) {
            setEditingTextKey(key);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedElement(key);
          setCanvasContextMenu({ x: e.clientX, y: e.clientY, key });
        }}
        className={`group relative transition-shadow ${
          isSelected
            ? "ring-1 ring-[#1687f8] ring-offset-0"
            : "hover:outline hover:outline-1 hover:outline-[#1687f8]/60 cursor-pointer"
        }`}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      className="gxl-studio-editor w-full h-full min-h-0 flex flex-col bg-[#0e0f12] text-neutral-100 font-sans overflow-hidden select-none"
    >
      {/* ==========================================
          TOP BAR (Compact Studio Header)
          ========================================== */}
      <header className="h-[44px] border-b border-white/[0.08] bg-[#121316] px-3 flex items-center justify-between shrink-0 z-50 text-white select-none">
        {/* Left Section: Document title, templates & format switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`h-7 w-7 rounded-md border flex items-center justify-center transition-all ${
              showLeftSidebar
                ? "bg-[#0d2238] border-[#1687f8] text-[#38bdf8]"
                : "bg-[#18191d] hover:bg-[#22242c] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={showLeftSidebar ? "Collapse Left Panel" : "Expand Left Panel"}
          >
            <LayersIcon size={13} />
          </button>

          <div className="h-7 w-7 rounded-md bg-[#1687f8] flex items-center justify-center font-black text-[11px] text-white shadow-sm shadow-[#1687f8]/25">
            GX
          </div>

          <div className="flex flex-col text-left mr-1">
            <div className="flex items-center gap-1.5">
              {isEditingProjectName ? (
                <input
                  type="text"
                  value={projectName}
                  onBlur={() => setIsEditingProjectName(false)}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingProjectName(false)
                  }
                  autoFocus
                  className="bg-transparent border-b border-[#1687f8] text-xs font-bold focus:outline-none w-40 text-white"
                />
              ) : (
                <h1
                  onDoubleClick={() => setIsEditingProjectName(true)}
                  className="text-xs font-bold text-white hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-all truncate max-w-[160px]"
                  title="Double click to edit project name"
                >
                  {projectName}
                </h1>
              )}
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Template pills (Daily News / Product Launch) */}
          <div className="flex rounded-md border border-white/10 bg-[#18191d] p-0.5">
            <button
              type="button"
              onClick={() => switchDocumentKind("editorial")}
              className={`rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                documentKind === "editorial"
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Daily News
            </button>
            <button
              type="button"
              onClick={() => switchDocumentKind("product")}
              className={`rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                documentKind === "product"
                  ? "bg-[#bdefff] text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Product Launch
            </button>
          </div>

          {/* Post Format Switcher (Reduced Pill Size) */}
          <div className="flex rounded-md border border-white/10 bg-[#18191d] p-0.5 gap-0.5">
            {CANVAS_FORMAT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleFormatChange(p)}
                className={`h-6 rounded px-2 text-[10px] font-bold tracking-tight transition-all flex items-center gap-1 ${
                  activeFormat.id === p.id
                    ? "bg-[#1687f8] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
                title={`${p.name} (${p.width} × ${p.height}) • ${p.badge}`}
              >
                {p.id === "mobile" && <Smartphone size={10} />}
                {p.id === "carousel" && <LayoutGrid size={10} />}
                <span>{p.aspectRatio}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Section: Tools, History, Zoom */}
        <div className="flex items-center gap-1">
          <div className="flex bg-[#18191d] p-0.5 rounded-md border border-white/10">
            <button
              onClick={() => setActiveTool("select")}
              className={`h-6 w-6 rounded flex items-center justify-center transition-all ${
                activeTool === "select"
                  ? "bg-[#22242c] text-[#1687f8] shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Pointer Selector (V)"
            >
              <MousePointer size={12} />
            </button>
            <button
              onClick={() => setActiveTool("hand")}
              className={`h-6 w-6 rounded flex items-center justify-center transition-all ${
                activeTool === "hand"
                  ? "bg-[#22242c] text-[#1687f8] shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Hand Tool / Pan (H)"
            >
              <Hand size={12} />
            </button>
          </div>

          <div className="h-3.5 w-px bg-white/10 mx-0.5" />

          {/* History */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-7 w-7 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 flex items-center justify-center disabled:opacity-25 text-neutral-400 hover:text-white transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={12} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="h-7 w-7 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 flex items-center justify-center disabled:opacity-25 text-neutral-400 hover:text-white transition-all"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={12} />
          </button>

          <div className="h-3.5 w-px bg-white/10 mx-0.5" />

          {/* Zoom & Viewport */}
          <button
            onClick={() => setZoomScale((prev) => Math.max(0.15, prev - 0.05))}
            className="h-7 w-7 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
            title="Zoom Out"
          >
            <Minimize2 size={12} />
          </button>

          <div className="relative group">
            <button className="h-7 px-2 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 text-[11px] font-mono font-bold text-neutral-300 flex items-center gap-1 transition-all">
              {Math.round(zoomScale * 100)}% <ChevronDown size={9} />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[#18191d] border border-white/10 rounded-lg shadow-xl py-1 hidden group-hover:block hover:block z-50 w-24 text-left">
              {[0.15, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map((p) => (
                <button
                  key={p}
                  onClick={() => setZoomScale(p)}
                  className="w-full px-2.5 py-1 hover:bg-[#22242c] text-[11px] font-mono text-neutral-300 text-left block"
                >
                  {Math.round(p * 100)}%
                </button>
              ))}
              <button
                onClick={handleFitToScreen}
                className="w-full px-2.5 py-1 hover:bg-[#22242c] text-[10px] font-semibold text-neutral-300 text-left border-t border-white/10 block"
              >
                Fit view
              </button>
            </div>
          </div>

          <button
            onClick={() => setZoomScale((prev) => Math.min(3.0, prev + 0.05))}
            className="h-7 w-7 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
            title="Zoom In"
          >
            <Maximize2 size={12} />
          </button>

          <button
            onClick={handleFitToScreen}
            className="h-7 px-2 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-all"
            title="Fit artboard inside view"
          >
            Fit View
          </button>

          <div className="h-3.5 w-px bg-white/10 mx-0.5" />

          {/* Grid overlays */}
          <button
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`h-7 w-7 rounded-md border flex items-center justify-center transition-all ${
              showSafeArea
                ? "bg-[#0d2238] border-[#1687f8] text-[#38bdf8]"
                : "bg-[#18191d] hover:bg-[#22242c] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title="Toggle Safe Margins Grid"
          >
            <Smartphone size={12} />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`h-7 w-7 rounded-md border flex items-center justify-center transition-all ${
              showGrid
                ? "bg-[#0d2238] border-[#1687f8] text-[#38bdf8]"
                : "bg-[#18191d] hover:bg-[#22242c] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title="Toggle Pixel Grid Dots"
          >
            <Grid size={12} />
          </button>
        </div>

        {/* Right Section: Exports & Inspector Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Project URL copied to clipboard!");
            }}
            className="h-7 px-2.5 rounded-md bg-[#18191d] hover:bg-[#22242c] border border-white/10 text-[11px] font-medium text-neutral-300 hover:text-white transition-all flex items-center gap-1"
            title="Copy project share URL"
          >
            <Share2 size={11} /> Share
          </button>

          <button
            onClick={() => handleDownloadSlideRaster(activeIndex, "png")}
            className="h-7 px-3 rounded-md bg-[#1e2026] hover:bg-[#262830] border border-white/10 text-[11px] font-semibold text-white transition-all flex items-center gap-1 cursor-pointer"
            title="Download current slide as PNG image"
          >
            <Download size={11} /> PNG
          </button>

          <button
            onClick={handleDownloadPdf}
            className="h-7 px-3 rounded-md bg-[#1e2026] hover:bg-[#262830] border border-white/10 text-[11px] font-semibold text-neutral-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            title="Download full deck PDF document"
          >
            <FileText size={11} /> PDF
          </button>

          <button
            onClick={handleDownloadMp4}
            className="h-7 px-3.5 rounded-md bg-[#1687f8] hover:bg-[#1374d6] text-[11px] font-bold text-white shadow-sm shadow-[#1687f8]/25 transition-all flex items-center gap-1 cursor-pointer border-none"
            title="Render and export as high-quality video"
          >
            <Play size={11} /> Video
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          <button
            type="button"
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`h-7 px-2.5 rounded-md border transition-all flex items-center gap-1.5 ${
              showRightSidebar
                ? "bg-[#0d2238] border-[#1687f8] text-[#38bdf8] shadow-sm"
                : "bg-[#18191d] hover:bg-[#22242c] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={showRightSidebar ? "Collapse Inspector Panel" : "Expand Inspector Panel"}
          >
            <Sliders size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Inspector</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          MAIN THREE-COLUMN WORKSPACE
          ========================================== */}
      <div
        className="flex-1 min-h-0 w-full grid select-none"
        style={{
          gridTemplateColumns: `${showLeftSidebar ? "270px" : "0px"} minmax(0, 1fr) ${showRightSidebar ? "320px" : "0px"}`,
          transition: "all 200ms ease",
        }}
      >
        {/* ==========================================
            STUDIO LEFT PANEL (270px)
            ========================================== */}
        {showLeftSidebar && (
          <StudioLeftPanel
            slides={slides}
            activeIndex={activeIndex}
            activeSlide={activeSlide}
            selectedElement={selectedElement}
            isFooterSelected={isFooterSelected}
            activeFormat={activeFormat}
            onSelectSlide={(idx) => {
              setActiveIndex(idx);
              setSelectedElement(null);
              setIsFooterSelected(false);
            }}
            onAddSlide={addSlide}
            onDuplicateSlide={duplicateSlide}
            onDeleteSlide={deleteSlide}
            onSelectElement={(key) => {
              setSelectedElement(key);
              setIsFooterSelected(false);
            }}
            onSelectFooter={(sel) => {
              setIsFooterSelected(sel);
              if (sel) setSelectedElement(null);
            }}
            onToggleVisibility={(key) => {
              if (activeSlide[key]) {
                updateSlideElement(key, { visible: !activeSlide[key].visible });
              }
            }}
            onToggleLock={(key) => {
              if (activeSlide[key]) {
                updateSlideElement(key, { locked: !activeSlide[key].locked });
              }
            }}
            onApplyPreset={applyPreset}
            onFormatChange={handleFormatChange}
            presets={TEMPLATE_PRESETS.map((p) => ({
              id: p.id,
              name: p.name,
              desc: p.category,
            }))}
            onCollapse={() => setShowLeftSidebar(false)}
          />
        )}

        {/* ------------------------------------------
            CENTER VIEWPORT: FLOATING CANVAS
            ------------------------------------------ */}
        <main
          ref={viewportRef}
          className="flex-1 h-full w-full overflow-hidden relative select-none"
          style={{
            backgroundColor: "#161719",
            backgroundImage:
              "radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onMouseDown={handleViewportMouseDown}
        >
          {/* Floating Canvas Toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#141518]/95 px-2 py-1 border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-30 backdrop-blur-md">
            <div className="flex bg-[#1a1b20] p-0.5 rounded border border-white/10">
              <button
                onClick={() => setEditorMode("fixed")}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                  editorMode === "fixed"
                    ? "bg-[#252730] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Fixed Grid
              </button>
              <button
                onClick={() => setEditorMode("free")}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                  editorMode === "free"
                    ? "bg-[#252730] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Free Design
              </button>
            </div>

            <div className="h-3.5 w-px bg-white/10 mx-1" />

            <button
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={`p-1 rounded transition-all ${
                showSafeArea
                  ? "bg-[#0d2238] text-[#38bdf8]"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Safe Area Grid"
            >
              <Smartphone size={11} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 rounded transition-all ${
                showGrid
                  ? "bg-[#0d2238] text-[#38bdf8]"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Toggle Grid overlay"
            >
              <Grid size={11} />
            </button>

            <div className="h-3.5 w-px bg-white/10 mx-1" />

            <button
              onClick={() =>
                setZoomScale((prev) => Math.max(0.15, prev - 0.05))
              }
              className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-all"
            >
              <Minimize2 size={11} />
            </button>
            <span className="text-[10px] font-mono font-bold text-neutral-300 w-9 text-center select-none">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(3.0, prev + 0.05))}
              className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-all"
            >
              <Maximize2 size={11} />
            </button>

            <div className="h-3.5 w-px bg-white/10 mx-1" />

            <button
              onClick={handleFitToScreen}
              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#1a1b20] hover:bg-[#252730] border border-white/10 text-neutral-300 hover:text-white rounded transition-all"
            >
              Fit
            </button>
          </div>

          {/* World Container containing Artboard */}
          <div
            className="absolute"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
              transformOrigin: "0 0",
              width: `${activeFormat.width}px`,
              height: `${activeFormat.height}px`,
            }}
          >
            {/* Artboard (Actual slide canvas) */}
            <div
              className="editor-canvas bg-white relative select-none overflow-hidden"
              style={{
                width: `${activeFormat.width}px`,
                height: `${activeFormat.height}px`,
                backgroundColor: activeSlide.backgroundColor || "#ffffff",
                borderRadius: "18px",
                boxShadow:
                  "0 0 0 1px rgba(255, 255, 255, 0.06), 0 24px 80px rgba(0, 0, 0, 0.38)",
                boxSizing: "border-box",
              }}
            >
              {/* Safe Area guideline overlays */}
              {showSafeArea && (
                <div
                  className="absolute border border-dashed border-[#000000]/15 pointer-events-none z-40"
                  style={{
                    top: `${SAFE_TOP}px`,
                    bottom: `${SAFE_BOTTOM}px`,
                    left: `${SAFE_LEFT}px`,
                    right: `${SAFE_RIGHT}px`,
                  }}
                />
              )}

              {/* Grid overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#000000 1.5px, transparent 1.5px)",
                    backgroundSize: `30px 30px`,
                  }}
                />
              )}

              {/* Elements list rendering */}

              {/* Logo */}
              {renderCanvasElement(
                "logo",
                <div className="w-full h-full">
                  {activeSlide.logo.logoUrl ? (
                    <img
                      src={activeSlide.logo.logoUrl}
                      className="w-full h-full object-contain animate-fade"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full bg-[#18181b] text-white font-bold flex items-center justify-center text-[10px] animate-fade"
                      style={{ fontSize: "12px" }}
                    >
                      GX
                    </div>
                  )}
                </div>,
              )}

              {/* Divider */}
              {renderCanvasElement(
                "divider",
                <div
                  className="w-full h-full animate-fade"
                  style={{
                    background: activeSlide.divider.color,
                    height: `${activeSlide.divider.thickness}px`,
                  }}
                />,
              )}

              {/* Category tag */}
              {renderCanvasElement(
                "category",
                <div
                  className="w-full h-full font-sans uppercase tracking-widest truncate animate-fade"
                  style={{
                    fontSize: `${activeSlide.category.fontSize}px`,
                    fontWeight: activeSlide.category.fontWeight,
                    color: activeSlide.category.color,
                    letterSpacing: `${activeSlide.category.letterSpacing}px`,
                    textAlign: activeSlide.category.align,
                  }}
                >
                  {activeSlide.category.text}
                </div>,
              )}

              {/* Headline Title */}
              {renderCanvasElement(
                "headline",
                <div
                  className="w-full h-full font-sans tracking-tight leading-tight animate-fade"
                  style={{
                    fontSize: `${activeSlide.headline.fontSize}px`,
                    fontWeight: activeSlide.headline.fontWeight,
                    color: activeSlide.headline.color,
                    lineHeight: activeSlide.headline.lineHeight,
                    letterSpacing: `${activeSlide.headline.letterSpacing}px`,
                    textAlign: activeSlide.headline.align,
                  }}
                >
                  {renderFormattedText(activeSlide.headline.text)}
                </div>,
              )}

              {/* Featured Image */}
              {renderCanvasElement(
                "featuredImage",
                <div
                  className="w-full h-full overflow-hidden animate-fade"
                  style={{
                    background:
                      activeSlide.featuredImage.color || "transparent",
                    borderRadius: `${activeSlide.featuredImage.borderRadius}px`,
                    border:
                      activeSlide.featuredImage.borderWidth > 0
                        ? `${activeSlide.featuredImage.borderWidth}px solid ${activeSlide.featuredImage.borderColor}`
                        : "none",
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
                          filter: `brightness(${activeSlide.featuredImage.brightness}%) contrast(${activeSlide.featuredImage.contrast}%)`,
                        }}
                      />
                    ) : (
                      <img
                        src={activeSlide.featuredImage.mediaUrl}
                        alt="Featured Image Layout"
                        className="w-full h-full"
                        style={{
                          objectFit: activeSlide.featuredImage.objectFit,
                          filter: `brightness(${activeSlide.featuredImage.brightness}%) contrast(${activeSlide.featuredImage.contrast}%)`,
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 bg-neutral-50/50 border border-neutral-100 rounded-2xl">
                      <span
                        className="font-extrabold uppercase tracking-wider text-[11px] mb-1"
                        style={{ fontSize: "12px" }}
                      >
                        Featured Image Placeholder
                      </span>
                      <span
                        className="text-[9px] opacity-60"
                        style={{ fontSize: "9px" }}
                      >
                        Upload custom photo in Right Panel
                      </span>
                    </div>
                  )}
                </div>,
              )}

              {/* Body Copy text */}
              {renderCanvasElement(
                "body",
                <div
                  className="w-full h-full font-sans whitespace-pre-line text-neutral-800 animate-fade"
                  style={{
                    fontSize: `${activeSlide.body.fontSize}px`,
                    fontWeight: activeSlide.body.fontWeight,
                    color: activeSlide.body.color,
                    lineHeight: activeSlide.body.lineHeight,
                    letterSpacing: `${activeSlide.body.letterSpacing}px`,
                    textAlign: activeSlide.body.align,
                  }}
                >
                  {renderFormattedText(activeSlide.body.text)}
                </div>,
              )}

              {/* Bullets items */}
              {renderCanvasElement(
                "bullets",
                <div
                  className="w-full h-full font-sans text-neutral-800 animate-fade"
                  style={{
                    fontSize: `${activeSlide.bullets.fontSize}px`,
                    fontWeight: activeSlide.bullets.fontWeight,
                    color: activeSlide.bullets.color,
                    lineHeight: activeSlide.bullets.lineHeight,
                  }}
                >
                  <ul
                    className="list-none m-0 p-0"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: `${activeSlide.bullets.spacing}px`,
                    }}
                  >
                    {activeSlide.bullets.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-black font-bold">
                          {activeSlide.bullets.bulletStyle === "check"
                            ? "✔"
                            : activeSlide.bullets.bulletStyle === "number"
                              ? `${idx + 1}.`
                              : "•"}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>,
              )}

              {/* Quote Box element */}
              {renderCanvasElement(
                "quote",
                <div
                  className="w-full h-full font-sans animate-fade"
                  style={{
                    background: activeSlide.quote.backgroundColor,
                    borderLeft: `5px solid ${activeSlide.quote.borderColor}`,
                    borderRadius: `${activeSlide.quote.borderRadius}px`,
                    padding: `${activeSlide.quote.padding || 24}px`,
                  }}
                >
                  <p
                    className="m-0 mb-2 font-bold"
                    style={{
                      fontSize: `${activeSlide.quote.fontSize}px`,
                      fontWeight: activeSlide.quote.fontWeight,
                      lineHeight: activeSlide.quote.lineHeight,
                      color: activeSlide.quote.color,
                    }}
                  >
                    "{activeSlide.quote.text}"
                  </p>
                  <span
                    className="text-neutral-500 font-semibold"
                    style={{ fontSize: `${activeSlide.quote.fontSize - 4}px` }}
                  >
                    — {activeSlide.quote.author}
                  </span>
                </div>,
              )}

              {/* CTA Button */}
              {renderCanvasElement(
                "cta",
                <div
                  className="w-full h-full flex items-center justify-center animate-fade"
                  style={{
                    background: activeSlide.cta.backgroundColor,
                    color: activeSlide.cta.textColor,
                    borderRadius: `${activeSlide.cta.borderRadius}px`,
                    fontSize: `${activeSlide.cta.fontSize}px`,
                    fontWeight: activeSlide.cta.fontWeight,
                    fontFamily: activeSlide.cta.fontFamily,
                    padding: `${activeSlide.cta.padding || 16}px`,
                    letterSpacing: `${activeSlide.cta.letterSpacing}px`,
                  }}
                >
                  {activeSlide.cta.text}
                </div>,
              )}

              {/* Author profile */}
              {renderCanvasElement(
                "author",
                <div className="w-full h-full flex items-center gap-2 animate-fade">
                  <div
                    className="rounded-full bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300"
                    style={{ width: "32px", height: "32px" }}
                  >
                    {activeSlide.author.avatarUrl ? (
                      <img
                        src={activeSlide.author.avatarUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#18181b]" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span
                      className="font-bold text-neutral-800 leading-tight"
                      style={{ fontSize: `${activeSlide.author.fontSize}px` }}
                    >
                      {activeSlide.author.name}
                    </span>
                  </div>
                </div>,
              )}

              {/* Footer Branding line */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(null);
                  setIsFooterSelected(true);
                }}
                className={`absolute flex items-center justify-between border-t border-neutral-100 cursor-pointer animate-fade ${
                  isFooterSelected
                    ? "ring-2 ring-[#1687f8] ring-offset-0"
                    : "hover:outline hover:outline-dashed hover:outline-[#1687f8]/50"
                }`}
                style={{
                  bottom: `${SAFE_BOTTOM}px`,
                  left: `${SAFE_LEFT}px`,
                  right: `${SAFE_RIGHT}px`,
                  height: `50px`,
                  borderTop: activeSlide.footer.dividerEnabled
                    ? `1.5px solid ${activeSlide.footer.color}20`
                    : "none",
                  opacity: activeSlide.footer.opacity,
                  color: activeSlide.footer.color,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  userSelect: "none",
                }}
              >
                <span
                  className="font-extrabold uppercase"
                  style={{ fontSize: "16px" }}
                >
                  {activeSlide.footer.brandName
                    ? `[${activeSlide.footer.brandName}]`
                    : ""}
                </span>
                {activeSlide.footer.pageNumberEnabled && (
                  <span
                    className="font-bold opacity-60"
                    style={{ fontSize: "16px" }}
                  >
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Smart Magnetic Snapping Guides */}
              {activeGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="absolute pointer-events-none z-50 transition-opacity duration-75"
                  style={
                    guide.type === "vertical"
                      ? {
                          left: `${guide.position}px`,
                          top: 0,
                          bottom: 0,
                          width: "1.5px",
                          backgroundColor: "#ff007a",
                          boxShadow: "0 0 8px rgba(255, 0, 122, 0.8)",
                        }
                      : {
                          top: `${guide.position}px`,
                          left: 0,
                          right: 0,
                          height: "1.5px",
                          backgroundColor: "#ff007a",
                          boxShadow: "0 0 8px rgba(255, 0, 122, 0.8)",
                        }
                  }
                >
                  {guide.label && (
                    <span
                      className="absolute bg-[#ff007a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md tracking-wider uppercase select-none whitespace-nowrap"
                      style={
                        guide.type === "vertical"
                          ? { top: "14px", left: "4px" }
                          : { left: "14px", top: "-18px" }
                      }
                    >
                      {guide.label}
                    </span>
                  )}
                </div>
              ))}

              {/* Figma Transform Gizmo (8-point handles + rotation stem + HUD) */}
              {selectedElement &&
                activeSlide[selectedElement] &&
                activeSlide[selectedElement].visible && (
                  <FigmaTransformGizmo
                    x={activeSlide[selectedElement].x}
                    y={activeSlide[selectedElement].y}
                    width={activeSlide[selectedElement].width}
                    height={activeSlide[selectedElement].height}
                    rotation={activeSlide[selectedElement].rotation || 0}
                    zoomScale={zoomScale}
                    locked={activeSlide[selectedElement].locked}
                    label={selectedElement}
                    isDragging={isDragging}
                    isResizing={isResizing}
                    isRotating={isRotating}
                    onResizeStart={(e, handle) =>
                      handleResizeMouseDown(e, selectedElement, handle)
                    }
                    onRotateStart={handleRotateStart}
                  />
                )}

              {/* In-place Direct Text Editor */}
              {editingTextKey && activeSlide[editingTextKey] && (
                <InlineCanvasTextEditor
                  initialText={
                    (activeSlide[editingTextKey] as any).text ||
                    (activeSlide[editingTextKey] as any).name ||
                    ""
                  }
                  x={activeSlide[editingTextKey].x}
                  y={activeSlide[editingTextKey].y}
                  width={activeSlide[editingTextKey].width}
                  height={activeSlide[editingTextKey].height}
                  rotation={activeSlide[editingTextKey].rotation || 0}
                  fontFamily={activeSlide[editingTextKey].fontFamily}
                  fontSize={activeSlide[editingTextKey].fontSize}
                  fontWeight={activeSlide[editingTextKey].fontWeight}
                  lineHeight={activeSlide[editingTextKey].lineHeight}
                  letterSpacing={activeSlide[editingTextKey].letterSpacing}
                  color={activeSlide[editingTextKey].color}
                  align={activeSlide[editingTextKey].align}
                  uppercase={activeSlide[editingTextKey].uppercase}
                  zoomScale={zoomScale}
                  onSave={(newText) => {
                    if (
                      (activeSlide[editingTextKey] as any).text !== undefined
                    ) {
                      updateSlideElement(editingTextKey, { text: newText });
                    } else {
                      updateSlideElement(editingTextKey, { name: newText });
                    }
                    setEditingTextKey(null);
                  }}
                  onCancel={() => setEditingTextKey(null)}
                />
              )}
            </div>
          </div>

          {/* Canvas Right-Click Context Menu */}
          {canvasContextMenu && (
            <CanvasContextMenu
              x={canvasContextMenu.x}
              y={canvasContextMenu.y}
              selectedKey={canvasContextMenu.key}
              isLocked={
                canvasContextMenu.key
                  ? Boolean(activeSlide[canvasContextMenu.key]?.locked)
                  : false
              }
              onDuplicate={() => duplicateSlide(activeIndex)}
              onBringForward={() => {
                if (canvasContextMenu.key) {
                  const currZ =
                    activeSlide[canvasContextMenu.key]?.zIndex || 1;
                  updateSlideElement(canvasContextMenu.key, {
                    zIndex: Math.min(50, currZ + 1),
                  });
                }
              }}
              onSendBackward={() => {
                if (canvasContextMenu.key) {
                  const currZ =
                    activeSlide[canvasContextMenu.key]?.zIndex || 1;
                  updateSlideElement(canvasContextMenu.key, {
                    zIndex: Math.max(1, currZ - 1),
                  });
                }
              }}
              onBringToFront={() => {
                if (canvasContextMenu.key) {
                  updateSlideElement(canvasContextMenu.key, { zIndex: 50 });
                }
              }}
              onSendToBack={() => {
                if (canvasContextMenu.key) {
                  updateSlideElement(canvasContextMenu.key, { zIndex: 1 });
                }
              }}
              onToggleLock={() => {
                if (canvasContextMenu.key) {
                  const currLock =
                    activeSlide[canvasContextMenu.key]?.locked;
                  updateSlideElement(canvasContextMenu.key, {
                    locked: !currLock,
                  });
                }
              }}
              onToggleHide={() => {
                if (canvasContextMenu.key) {
                  updateSlideElement(canvasContextMenu.key, {
                    visible: false,
                  });
                }
              }}
              onResetPosition={() => {
                if (canvasContextMenu.key) {
                  const def = DEFAULT_SLIDE(0)[canvasContextMenu.key];
                  if (def) {
                    updateSlideElement(canvasContextMenu.key, {
                      x: def.x,
                      y: def.y,
                      width: def.width,
                      height: def.height,
                      rotation: 0,
                    });
                  }
                }
              }}
              onClose={() => setCanvasContextMenu(null)}
            />
          )}
        </main>

        {/* ------------------------------------------
            RIGHT PANEL: STUDIO INSPECTOR (320px)
            ------------------------------------------ */}
        {showRightSidebar && (
          <StudioInspector
            activeSlide={activeSlide}
            selectedElement={selectedElement}
            isFooterSelected={isFooterSelected}
            activeFormat={activeFormat}
            slidesCount={slides.length}
            activeIndex={activeIndex}
            onSelectElement={(key) => {
              setSelectedElement(key);
              setIsFooterSelected(false);
            }}
            onSelectFooter={(sel) => {
              setIsFooterSelected(sel);
              if (sel) setSelectedElement(null);
            }}
            onUpdateElement={updateSlideElement}
            onUpdateFooter={updateSlideFooter}
            onUpdateBackground={updateSlideBackground}
            onFormatChange={handleFormatChange}
            onDownloadPng={() => handleDownloadSlideRaster(activeIndex, "png")}
            onDownloadPdf={handleDownloadPdf}
            onDownloadMp4={handleDownloadMp4}
            onDownloadAllSvg={handleDownloadAllSlidesSvg}
            onClose={() => setShowRightSidebar(false)}
          />
        )}
      </div>
    </div>
  );
}
