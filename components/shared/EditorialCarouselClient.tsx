"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
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
  CloudCheck,
  CloudUpload,
  CloudAlert,
} from "@/components/editor/icons/StudioIcons";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { StudioInspector, CANVAS_FORMAT_PRESETS, CanvasPreset } from "../editor/inspector/StudioInspector";
import { StudioLeftPanel } from "../editor/canvas/StudioLeftPanel";
import { StudioVerticalToolDock } from "../editor/canvas/StudioVerticalToolDock";
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
  secondaryImage: {
    mediaUrl: "",
    objectFit: "contain",
    brightness: 100,
    contrast: 100,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowEnabled: true,
    x: SAFE_LEFT,
    y: 705,
    width: SAFE_WIDTH,
    height: 435,
    visible: false,
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
    zIndex: 6,
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
  {
    id: "dual-image",
    name: "Dual Image Showcase",
    category: "Visual",
    setup: (slide: Slide): Slide => ({
      ...slide,
      category: { ...slide.category, text: "VISUAL SHOWCASE", visible: true },
      headline: {
        ...slide.headline,
        text: "Architecture Overview & Live Implementation",
        visible: true,
        y: 110,
        height: 120,
      },
      featuredImage: {
        ...slide.featuredImage,
        visible: true,
        y: 245,
        height: 435,
        borderRadius: 18,
      },
      secondaryImage: {
        ...(slide.secondaryImage || slide.featuredImage),
        visible: true,
        y: 705,
        height: 435,
        borderRadius: 18,
        mediaUrl: (slide.secondaryImage && slide.secondaryImage.mediaUrl) ? slide.secondaryImage.mediaUrl : "",
      },
      body: { ...slide.body, visible: false },
      bullets: { ...slide.bullets, visible: false },
      quote: { ...slide.quote, visible: false },
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
  const [viewportViewMode, setViewportViewMode] = useState<"desk" | "single">("desk");

  // Viewport & Infinite Canvas Control
  const [zoomScale, setZoomScale] = useState(0.48);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [pan, setPan] = useState({ x: 120, y: 80 });
  const [isMobileView, setIsMobileView] = useState(false);

  // Responsive mobile screen detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (mobile) {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Touch gesture state for mobile pinch zoom & swipe pan
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    initialDist?: number;
    initialZoom?: number;
  }>({ startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStateRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        initialPanX: pan.x,
        initialPanY: pan.y,
        initialDist: dist,
        initialZoom: zoomScale,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !selectedElement) {
      const dx = e.touches[0].clientX - touchStateRef.current.startX;
      const dy = e.touches[0].clientY - touchStateRef.current.startY;
      setPan({
        x: touchStateRef.current.initialPanX + dx,
        y: touchStateRef.current.initialPanY + dy,
      });
    } else if (e.touches.length === 2 && touchStateRef.current.initialDist && touchStateRef.current.initialZoom) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleMultiplier = currentDist / touchStateRef.current.initialDist;
      const newZoom = Math.min(2.5, Math.max(0.15, touchStateRef.current.initialZoom * scaleMultiplier));
      setZoomScale(newZoom);
    }
  };
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

  // Fit canvas to screen function helper (Multi-Artboard Desk vs Single Slide)
  const handleFitToScreen = (customFormat?: CanvasPreset, forceMode?: "desk" | "single") => {
    if (!viewportRef.current) return;
    const format = customFormat || activeFormat;
    const mode = forceMode || viewportViewMode;
    const rect = viewportRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const marginX = 48;
    const topPadding = 56;
    const bottomDockSpace = 72; // Reserve space for bottom floating dock
    const availableWidth = rect.width - marginX * 2;
    const availableHeight = rect.height - topPadding - bottomDockSpace;

    if (mode === "desk" && slides.length > 1) {
      const GAP = 100;
      const totalWidth = slides.length * format.width + (slides.length - 1) * GAP;
      const zoomW = availableWidth / totalWidth;
      const zoomH = availableHeight / format.height;
      const newZoom = Math.min(zoomW, zoomH, 0.95);
      const clampedZoom = Math.max(0.08, Number(newZoom.toFixed(2)));
      setZoomScale(clampedZoom);

      const fittedWidth = totalWidth * clampedZoom;
      const fittedHeight = format.height * clampedZoom;
      setPan({
        x: Math.round((rect.width - fittedWidth) / 2),
        y: Math.round(topPadding + Math.max(0, (availableHeight - fittedHeight) / 2)),
      });
    } else {
      const zoomW = availableWidth / format.width;
      const zoomH = availableHeight / format.height;
      const newZoom = Math.min(zoomW, zoomH, 1.0);
      const clampedZoom = Math.max(0.15, Number(newZoom.toFixed(2)));
      setZoomScale(clampedZoom);

      const fittedWidth = format.width * clampedZoom;
      const fittedHeight = format.height * clampedZoom;
      const centerX = Math.round((rect.width - fittedWidth) / 2);
      const centerY = Math.round(topPadding + Math.max(0, (availableHeight - fittedHeight) / 2));

      const slideOffset = mode === "desk" ? activeIndex * (format.width + 100) * clampedZoom : 0;
      setPan({
        x: centerX - slideOffset,
        y: centerY,
      });
    }
  };

  // Center and fit canvas on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen();
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  // Format switcher handler
  const handleFormatChange = (preset: CanvasPreset) => {
    setActiveFormat(preset);
    toast.success(`Switched format: ${preset.name} (${preset.width} × ${preset.height})`);
    setTimeout(() => {
      handleFitToScreen(preset);
    }, 20);
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
        saveToDatabase(true);
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
  const activeSlide = slides[activeIndex] || DEFAULT_SLIDE(0);

  // Supabase Database Persistence state
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);
  const [isInitialHydrated, setIsInitialHydrated] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Synchronized state refs for keyboard shortcuts and async callbacks
  const slidesRef = useRef(slides);
  slidesRef.current = slides;
  const activeFormatRef = useRef(activeFormat);
  activeFormatRef.current = activeFormat;
  const projectNameRef = useRef(projectName);
  projectNameRef.current = projectName;
  const documentKindRef = useRef(documentKind);
  documentKindRef.current = documentKind;
  const editorModeRef = useRef(editorMode);
  editorModeRef.current = editorMode;
  const currentDocIdRef = useRef(currentDocId);
  currentDocIdRef.current = currentDocId;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Supabase API operations
  const fetchSavedProjects = async () => {
    try {
      const res = await fetch("/api/v1/editor/documents");
      if (res.ok) {
        const data = await res.json();
        setSavedProjects(data.documents || data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved projects:", err);
    }
  };

  const loadDocumentFromDatabase = async (docId: string) => {
    try {
      setCloudSaveStatus("saving");
      const res = await fetch(`/api/v1/editor/documents/${docId}`);
      if (!res.ok) throw new Error("Failed to fetch document");
      const docJson = await res.json();
      const doc = docJson.data || docJson;
      const payload = doc.background || doc || {};
      if (payload.slides && Array.isArray(payload.slides) && payload.slides.length > 0) {
        setSlides(payload.slides);
        saveHistory(payload.slides);
      }
      if (payload.activeFormat) {
        setActiveFormat(payload.activeFormat);
      }
      if (payload.documentKind) {
        setDocumentKind(payload.documentKind);
      }
      if (payload.editorMode) {
        setEditorMode(payload.editorMode);
      }
      if (doc.name) {
        setProjectName(doc.name);
      }
      setCurrentDocId(doc.id);
      currentDocIdRef.current = doc.id;
      setActiveIndex(0);
      setSelectedElement(null);
      setIsFooterSelected(false);
      setCloudSaveStatus("saved");
      setLastSavedTime(new Date());
      setShowProjectsDrawer(false);
      toast.success(`Loaded "${doc.name}" from database`);
    } catch (err) {
      console.error("Error loading document:", err);
      setCloudSaveStatus("error");
      toast.error("Failed to load project from database");
    }
  };

  const saveToDatabase = async (showToast = true) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setCloudSaveStatus("saving");

    try {
      const docId = currentDocIdRef.current;
      const currentSlides = slidesRef.current;
      const currentFormat = activeFormatRef.current;
      const currentName = projectNameRef.current;
      const currentKind = documentKindRef.current;
      const currentMode = editorModeRef.current;

      const payload = {
        name: currentName,
        slides: currentSlides,
        activeFormat: currentFormat,
        documentKind: currentKind,
        editorMode: currentMode,
        width: currentFormat.width,
        height: currentFormat.height,
      };

      if (docId) {
        const res = await fetch(`/api/v1/editor/documents/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Database update failed");
      } else {
        const res = await fetch("/api/v1/editor/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Database create failed");
        const created = await res.json();
        setCurrentDocId(created.id);
        currentDocIdRef.current = created.id;
      }

      setCloudSaveStatus("saved");
      setLastSavedTime(new Date());
      if (showToast) {
        toast.success("Saved to Supabase database");
      }
    } catch (err) {
      console.error("Save to database error:", err);
      setCloudSaveStatus("error");
      if (showToast) {
        toast.error("Cloud database save failed");
      }
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleCreateNewProject = async (kind: "editorial" | "product" = "editorial") => {
    try {
      setCloudSaveStatus("saving");
      const initialSlides = kind === "product" ? PRODUCT_LAUNCH_DECK() : [DEFAULT_SLIDE(0)];
      const initialName = kind === "product" ? "ResumeForgeAI Product Launch" : "GrowXLabs Editorial Post";
      const initialMode = kind === "product" ? "free" : "fixed";

      const res = await fetch("/api/v1/editor/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: initialName,
          slides: initialSlides,
          activeFormat,
          documentKind: kind,
          editorMode: initialMode,
          width: activeFormat.width,
          height: activeFormat.height,
        }),
      });
      if (!res.ok) throw new Error("Failed to create new project in database");
      const created = await res.json();

      setCurrentDocId(created.id);
      currentDocIdRef.current = created.id;
      setProjectName(initialName);
      setDocumentKind(kind);
      setEditorMode(initialMode);
      setSlides(initialSlides);
      setActiveIndex(0);
      setSelectedElement(null);
      setIsFooterSelected(false);
      saveHistory(initialSlides);
      setCloudSaveStatus("saved");
      setLastSavedTime(new Date());
      setShowProjectsDrawer(false);
      fetchSavedProjects();
      toast.success("New project created in database!");
    } catch (err) {
      console.error("Create project error:", err);
      setCloudSaveStatus("error");
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProject = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project from database?")) return;
    try {
      const res = await fetch(`/api/v1/editor/documents/${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      toast.success("Project deleted from database");
      fetchSavedProjects();
      if (currentDocId === docId) {
        handleCreateNewProject(documentKind);
      }
    } catch (err) {
      console.error("Delete project error:", err);
      toast.error("Failed to delete project");
    }
  };

  // Initial Hydration from Supabase Database
  useEffect(() => {
    let isMounted = true;
    async function initDatabase() {
      try {
        setCloudSaveStatus("saving");
        const res = await fetch("/api/v1/editor/documents");
        if (res.ok) {
          const data = await res.json();
          const docs = data.documents || data.data || [];
          setSavedProjects(docs);

          if (docs.length > 0) {
            const latest = docs[0];
            const docRes = await fetch(`/api/v1/editor/documents/${latest.id}`);
            if (docRes.ok && isMounted) {
              const docJson = await docRes.json();
              const fullDoc = docJson.data || docJson;
              const payload = fullDoc.background || fullDoc || {};
              if (payload.slides && Array.isArray(payload.slides) && payload.slides.length > 0) {
                setSlides(payload.slides);
                saveHistory(payload.slides);
              }
              if (payload.activeFormat) {
                setActiveFormat(payload.activeFormat);
              }
              if (payload.documentKind) {
                setDocumentKind(payload.documentKind);
              }
              if (payload.editorMode) {
                setEditorMode(payload.editorMode);
              }
              if (fullDoc.name) {
                setProjectName(fullDoc.name);
              }
              setCurrentDocId(fullDoc.id);
              currentDocIdRef.current = fullDoc.id;
              setCloudSaveStatus("saved");
              setLastSavedTime(new Date());
              setIsInitialHydrated(true);
              return;
            }
          }
        }

        if (isMounted) {
          const initialSlides = [DEFAULT_SLIDE(0)];
          const postRes = await fetch("/api/v1/editor/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "GrowXLabs Editorial Post",
              slides: initialSlides,
              activeFormat: CANVAS_FORMAT_PRESETS[0],
              documentKind: "editorial",
              editorMode: "fixed",
              width: 1080,
              height: 1350,
            }),
          });
          if (postRes.ok) {
            const created = await postRes.json();
            setCurrentDocId(created.id);
            currentDocIdRef.current = created.id;
            setCloudSaveStatus("saved");
            setLastSavedTime(new Date());
          }
        }
      } catch (err) {
        console.error("Database initialization error:", err);
        setCloudSaveStatus("error");
      } finally {
        if (isMounted) {
          setIsInitialHydrated(true);
        }
      }
    }

    initDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save to Supabase (1.5s after any change)
  useEffect(() => {
    if (!isInitialHydrated) return;
    setCloudSaveStatus("unsaved");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveToDatabase(false);
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [slides, activeFormat, projectName, documentKind, editorMode, isInitialHydrated]);

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

  // Paper.design Static Slide Content Renderer (for non-active artboards on infinite canvas)
  const renderStaticSlideContent = (slide: Slide, slideIdx: number) => {
    return (
      <div className="w-full h-full relative pointer-events-none overflow-hidden select-none">
        {/* Logo */}
        {slide.logo?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.logo.x}px`,
              top: `${slide.logo.y}px`,
              width: `${slide.logo.width}px`,
              height: `${slide.logo.height}px`,
              opacity: slide.logo.opacity,
            }}
          >
            {slide.logo.logoUrl ? (
              <img src={slide.logo.logoUrl} className="w-full h-full object-contain" />
            ) : (
              <div
                className="w-full h-full rounded-full bg-[#18181b] text-white font-bold flex items-center justify-center text-[10px]"
                style={{ fontSize: "12px" }}
              >
                GX
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {slide.divider?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.divider.x}px`,
              top: `${slide.divider.y}px`,
              width: `${slide.divider.width}px`,
              height: `${slide.divider.height}px`,
              background: slide.divider.color,
            }}
          />
        )}

        {/* Category */}
        {slide.category?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.category.x}px`,
              top: `${slide.category.y}px`,
              width: `${slide.category.width}px`,
              height: `${slide.category.height}px`,
              fontSize: `${slide.category.fontSize}px`,
              fontWeight: slide.category.fontWeight,
              color: slide.category.color,
              letterSpacing: `${slide.category.letterSpacing}px`,
              textAlign: slide.category.align,
              textTransform: slide.category.uppercase ? "uppercase" : "none",
            }}
            className="font-sans tracking-widest truncate"
          >
            {slide.category.text}
          </div>
        )}

        {/* Headline */}
        {slide.headline?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.headline.x}px`,
              top: `${slide.headline.y}px`,
              width: `${slide.headline.width}px`,
              height: `${slide.headline.height}px`,
              fontSize: `${slide.headline.fontSize}px`,
              fontWeight: slide.headline.fontWeight,
              color: slide.headline.color,
              lineHeight: slide.headline.lineHeight,
              letterSpacing: `${slide.headline.letterSpacing}px`,
              textAlign: slide.headline.align,
              fontFamily: slide.headline.fontFamily,
              display: "-webkit-box",
              WebkitLineClamp: slide.headline.maxLines || 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            dangerouslySetInnerHTML={{ __html: slide.headline.text }}
          />
        )}

        {/* Featured Image */}
        {slide.featuredImage?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.featuredImage.x}px`,
              top: `${slide.featuredImage.y}px`,
              width: `${slide.featuredImage.width}px`,
              height: `${slide.featuredImage.height}px`,
              borderRadius: `${slide.featuredImage.borderRadius}px`,
              border: `${slide.featuredImage.borderWidth}px solid ${slide.featuredImage.borderColor}`,
              boxShadow: slide.featuredImage.shadowEnabled
                ? "0 20px 40px -15px rgba(0,0,0,0.3)"
                : "none",
              overflow: "hidden",
            }}
          >
            {slide.featuredImage.mediaUrl ? (
              <img
                src={slide.featuredImage.mediaUrl}
                alt=""
                className="w-full h-full"
                style={{
                  objectFit: slide.featuredImage.objectFit,
                  filter: `brightness(${slide.featuredImage.brightness}%) contrast(${slide.featuredImage.contrast}%)`,
                }}
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-semibold uppercase">
                Featured Image Placeholder
              </div>
            )}
          </div>
        )}

        {/* Secondary Image */}
        {slide.secondaryImage?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.secondaryImage.x}px`,
              top: `${slide.secondaryImage.y}px`,
              width: `${slide.secondaryImage.width}px`,
              height: `${slide.secondaryImage.height}px`,
              borderRadius: `${slide.secondaryImage.borderRadius}px`,
              border: `${slide.secondaryImage.borderWidth}px solid ${slide.secondaryImage.borderColor}`,
              boxShadow: slide.secondaryImage.shadowEnabled
                ? "0 20px 40px -15px rgba(0,0,0,0.3)"
                : "none",
              overflow: "hidden",
            }}
          >
            {slide.secondaryImage.mediaUrl ? (
              <img
                src={slide.secondaryImage.mediaUrl}
                alt=""
                className="w-full h-full"
                style={{
                  objectFit: slide.secondaryImage.objectFit,
                  filter: `brightness(${slide.secondaryImage.brightness}%) contrast(${slide.secondaryImage.contrast}%)`,
                }}
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-semibold uppercase">
                Secondary Image Placeholder
              </div>
            )}
          </div>
        )}

        {/* Body */}
        {slide.body?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.body.x}px`,
              top: `${slide.body.y}px`,
              width: `${slide.body.width}px`,
              height: `${slide.body.height}px`,
              fontSize: `${slide.body.fontSize}px`,
              fontWeight: slide.body.fontWeight,
              color: slide.body.color,
              lineHeight: slide.body.lineHeight,
              letterSpacing: `${slide.body.letterSpacing}px`,
              textAlign: slide.body.align,
              display: "-webkit-box",
              WebkitLineClamp: slide.body.maxLines || 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            dangerouslySetInnerHTML={{ __html: slide.body.text }}
          />
        )}

        {/* Bullets */}
        {slide.bullets?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.bullets.x}px`,
              top: `${slide.bullets.y}px`,
              width: `${slide.bullets.width}px`,
            }}
            className="flex flex-col gap-3"
          >
            {slide.bullets.items.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  style={{
                    backgroundColor: slide.bullets.bulletColor,
                    width: `${slide.bullets.bulletSize}px`,
                    height: `${slide.bullets.bulletSize}px`,
                    marginTop: "6px",
                  }}
                  className="rounded-full shrink-0"
                />
                <span
                  style={{
                    fontSize: `${slide.bullets.fontSize}px`,
                    color: slide.bullets.color,
                  }}
                  className="font-medium leading-snug"
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quote */}
        {slide.quote?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.quote.x}px`,
              top: `${slide.quote.y}px`,
              width: `${slide.quote.width}px`,
              borderLeft: `${slide.quote.borderWidth}px solid ${slide.quote.borderColor}`,
              paddingLeft: "20px",
            }}
          >
            <p
              style={{
                fontSize: `${slide.quote.fontSize}px`,
                color: slide.quote.color,
                fontFamily: slide.quote.fontFamily,
              }}
              className="italic font-serif"
            >
              "{slide.quote.text}"
            </p>
            {slide.quote.author && (
              <p
                style={{
                  fontSize: `${slide.quote.authorFontSize}px`,
                  color: slide.quote.authorColor,
                }}
                className="mt-2 font-semibold"
              >
                — {slide.quote.author}
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        {slide.cta?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.cta.x}px`,
              top: `${slide.cta.y}px`,
              width: `${slide.cta.width}px`,
              height: `${slide.cta.height}px`,
              backgroundColor: slide.cta.backgroundColor,
              color: slide.cta.textColor,
              borderRadius: `${slide.cta.borderRadius}px`,
              fontSize: `${slide.cta.fontSize}px`,
              fontWeight: slide.cta.fontWeight,
            }}
            className="flex items-center justify-center cursor-pointer shadow-md"
          >
            {slide.cta.text}
          </div>
        )}

        {/* Author */}
        {slide.author?.visible && (
          <div
            style={{
              position: "absolute",
              left: `${slide.author.x}px`,
              top: `${slide.author.y}px`,
              gap: "10px",
            }}
            className="flex items-center"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-300">
              {slide.author.avatarUrl ? (
                <img src={slide.author.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0075de]" />
              )}
            </div>
            <span
              style={{
                fontSize: `${slide.author.fontSize}px`,
                fontWeight: slide.author.fontWeight,
                color: slide.author.color,
              }}
            >
              {slide.author.name}
            </span>
          </div>
        )}

        {/* Dynamic Bottom Footer - Page Number & Brand */}
        {slide.footer && (
          <div
            className="absolute flex items-center justify-between font-mono select-none pointer-events-none"
            style={{
              bottom: `${SAFE_BOTTOM}px`,
              left: `${SAFE_LEFT}px`,
              right: `${SAFE_RIGHT}px`,
              height: "50px",
              opacity: slide.footer.opacity ?? 1,
              color: slide.footer.color || "#000000",
              borderTop: slide.footer.dividerEnabled
                ? `1px solid ${slide.footer.color || "#000000"}20`
                : "none",
            }}
          >
            <span
              className="font-extrabold uppercase"
              style={{ fontSize: "16px" }}
            >
              {slide.footer.brandName ? `[${slide.footer.brandName}]` : ""}
            </span>
            {slide.footer.pageNumberEnabled && (
              <span
                className="font-bold opacity-60"
                style={{ fontSize: "16px" }}
              >
                {String(slideIdx + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

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
          MAIN THREE-COLUMN WORKSPACE (Full Viewport Height)
          ========================================== */}
      <div
        className="flex-1 min-h-0 w-full grid select-none relative"
        style={{
          gridTemplateColumns: isMobileView
            ? "1fr"
            : `${showLeftSidebar ? "240px" : "0px"} minmax(0, 1fr) ${showRightSidebar ? "280px" : "0px"}`,
          transition: "all 200ms ease",
        }}
      >
        {/* ==========================================
            STUDIO LEFT PANEL (Paper.design 240px & Mobile Drawer)
            ========================================== */}
        {showLeftSidebar && isMobileView && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLeftSidebar(false)}
            />
            <div className="relative z-10 w-[280px] h-full bg-[#1a1a1c] shadow-2xl">
              <StudioLeftPanel
                slides={slides}
                activeIndex={activeIndex}
                activeSlide={activeSlide}
                selectedElement={selectedElement}
                isFooterSelected={isFooterSelected}
                activeFormat={activeFormat}
                projectName={projectName}
                cloudSaveStatus={cloudSaveStatus}
                onOpenProjectsDrawer={() => {
                  fetchSavedProjects();
                  setShowProjectsDrawer(true);
                }}
                onCreateNewProject={() => handleCreateNewProject(documentKind)}
                onSaveToDatabase={() => saveToDatabase(true)}
                onSelectSlide={(idx) => {
                  setActiveIndex(idx);
                  setSelectedElement(null);
                  setIsFooterSelected(false);
                  setShowLeftSidebar(false);
                }}
                onAddSlide={() => {
                  addSlide();
                  setShowLeftSidebar(false);
                }}
                onDuplicateSlide={duplicateSlide}
                onDeleteSlide={deleteSlide}
                onSelectElement={(key) => {
                  setSelectedElement(key);
                  setIsFooterSelected(false);
                  setShowLeftSidebar(false);
                }}
                onSelectFooter={(sel) => {
                  setIsFooterSelected(sel);
                  if (sel) setSelectedElement(null);
                  setShowLeftSidebar(false);
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
                onApplyPreset={(p) => {
                  applyPreset(p);
                  setShowLeftSidebar(false);
                }}
                onFormatChange={(fmt) => {
                  handleFormatChange(fmt);
                  setShowLeftSidebar(false);
                }}
                presets={TEMPLATE_PRESETS.map((p) => ({
                  id: p.id,
                  name: p.name,
                  desc: p.category,
                }))}
                onCollapse={() => setShowLeftSidebar(false)}
              />
            </div>
          </div>
        )}

        {showLeftSidebar && !isMobileView && (
          <StudioLeftPanel
            slides={slides}
            activeIndex={activeIndex}
            activeSlide={activeSlide}
            selectedElement={selectedElement}
            isFooterSelected={isFooterSelected}
            activeFormat={activeFormat}
            projectName={projectName}
            cloudSaveStatus={cloudSaveStatus}
            onOpenProjectsDrawer={() => {
              fetchSavedProjects();
              setShowProjectsDrawer(true);
            }}
            onCreateNewProject={() => handleCreateNewProject(documentKind)}
            onSaveToDatabase={() => saveToDatabase(true)}
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
          className="flex-1 h-full w-full overflow-hidden relative select-none touch-none"
          style={{
            backgroundColor: "#999999",
          }}
          onMouseDown={handleViewportMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Paper.design Signature Floating Document Pill (when sidebar is collapsed) */}
          {!showLeftSidebar && (
            <div className="absolute top-3.5 left-3.5 z-40 h-[34px] bg-[#242426] border border-[#383838] rounded-lg px-2.5 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.4)] text-white select-none">
              <div className="relative group/menu">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                  title="File Menu • Back to Admin"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="9" height="10" rx="1.5" />
                    <path d="M5 2h7a1.5 1.5 0 0 1 1.5 1.5V11" />
                  </svg>
                </button>
                <div className="hidden group-hover/menu:block absolute top-full left-0 mt-1 w-48 bg-[#242426] border border-[#383838] rounded-lg shadow-xl py-1 z-50 text-[11px] font-medium text-neutral-200 divide-y divide-white/5">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        fetchSavedProjects();
                        setShowProjectsDrawer(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <FolderOpen size={12} />
                      <span>Saved Projects...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateNewProject(documentKind)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>New Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => saveToDatabase(true)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <CloudCheck size={12} />
                      <span>Save to Database</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={12} />
                      <span>Return to Admin</span>
                    </Link>
                  </div>
                </div>
              </div>

              <span
                className="text-[12px] font-medium text-[#ececec] truncate max-w-[150px] tracking-tight cursor-default"
                title={projectName}
              >
                {projectName}
              </span>

              {/* Cloud Database Status indicator */}
              <button
                type="button"
                onClick={() => saveToDatabase(true)}
                title={
                  cloudSaveStatus === "saved"
                    ? "All changes saved to database"
                    : cloudSaveStatus === "saving"
                      ? "Saving to database..."
                      : cloudSaveStatus === "unsaved"
                        ? "Unsaved changes (auto-saving)"
                        : "Cloud error: click to retry"
                }
                className="flex items-center gap-1 cursor-pointer p-0.5 rounded hover:bg-white/10"
              >
                {cloudSaveStatus === "saved" && (
                  <CloudCheck size={13} className="text-emerald-400" />
                )}
                {cloudSaveStatus === "saving" && (
                  <CloudUpload size={13} className="text-amber-400 animate-pulse" />
                )}
                {cloudSaveStatus === "unsaved" && (
                  <CloudUpload size={13} className="text-neutral-400" />
                )}
                {cloudSaveStatus === "error" && (
                  <CloudAlert size={13} className="text-red-400 animate-bounce" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchSavedProjects();
                  setShowProjectsDrawer(true);
                }}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Browse Cloud Projects"
              >
                <FolderOpen size={12} />
              </button>

              <button
                type="button"
                onClick={() => setShowLeftSidebar(true)}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer ml-0.5"
                title="Expand sidebar"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <line x1="6" y1="3" x2="6" y2="13" />
                </svg>
              </button>
            </div>
          )}

          {/* Paper.design Signature Floating Inspector Pill (when right sidebar is collapsed) */}
          {!showRightSidebar && (
            <div className="absolute top-3.5 right-3.5 z-40 h-[34px] bg-[#242426] border border-[#383838] rounded-lg px-2.5 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.4)] text-white select-none">
              <div
                className="w-5 h-5 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm"
                title="GrowXLabs Workspace"
              >
                S
              </div>
              <span className="text-[12px] font-medium text-[#ececec]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setShowRightSidebar(true)}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer ml-0.5"
                title="Expand inspector sidebar"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <path d="M11 2v12" />
                </svg>
              </button>
            </div>
          )}

          {/* Vertical Floating Tool Palette (Paper.design Signature) */}
          <StudioVerticalToolDock
            activeTool={activeTool}
            onSelectTool={(tool) => setActiveTool(tool)}
            showSafeArea={showSafeArea}
            onToggleSafeArea={() => setShowSafeArea(!showSafeArea)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onSelectTextElement={() => {
              setSelectedElement("headline");
              setIsFooterSelected(false);
            }}
            onSelectImageElement={() => {
              setSelectedElement("featuredImage");
              setIsFooterSelected(false);
            }}
            onAddSlide={addSlide}
            onOpenFormats={() => setShowLeftSidebar(true)}
            isLeftSidebarCollapsed={!showLeftSidebar}
          />
          {/* Paper.design Signature Bottom Center Dock */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#242426] px-2 py-1 border border-[#383838] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.45)] z-30 select-none transition-all duration-200 max-w-[calc(100vw-24px)] overflow-x-auto"
            role="toolbar"
            aria-label="Canvas Viewport Controls"
          >
            {/* 1. Mode Segmented Pill: Fixed Grid / Free Design */}
            <div className="flex bg-[#1a1a1c] p-0.5 rounded-lg border border-[#383838]">
              <button
                type="button"
                onClick={() => setEditorMode("fixed")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide transition-all cursor-pointer ${
                  editorMode === "fixed"
                    ? "bg-[#3a3a3c] text-white shadow-sm font-semibold"
                    : "text-[#8e8e93] hover:text-[#ececec]"
                }`}
                title="Fixed Grid layout mode"
              >
                Fixed Grid
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("free")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide transition-all cursor-pointer ${
                  editorMode === "free"
                    ? "bg-[#3a3a3c] text-[#38bdf8] shadow-sm font-semibold"
                    : "text-[#8e8e93] hover:text-[#ececec]"
                }`}
                title="Freeform Drag & Drop design mode"
              >
                Free Design
              </button>
            </div>

            <div className="h-4 w-px bg-[#383838] mx-0.5" />

            {/* 2. Safe Margins Toggle */}
            <button
              type="button"
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
                showSafeArea
                  ? "bg-[#3a3a3c] text-[#38bdf8] shadow-sm"
                  : "text-[#8e8e93] hover:text-white hover:bg-white/5"
              }`}
              title="Toggle Safe Margins (S)"
            >
              <Smartphone size={13} />
              <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
                <span>Safe Margins</span>
                <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">S</kbd>
              </span>
            </button>

            {/* 3. Pixel Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group relative cursor-pointer ${
                showGrid
                  ? "bg-[#3a3a3c] text-[#38bdf8] shadow-sm"
                  : "text-[#8e8e93] hover:text-white hover:bg-white/5"
              }`}
              title="Toggle Grid (G)"
            >
              <Grid size={13} />
              <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 px-2 py-1 bg-[#1c1c1e] text-white text-[10px] font-medium rounded-md whitespace-nowrap shadow-xl border border-[#353535] z-50 flex items-center gap-1.5">
                <span>Grid Dots</span>
                <kbd className="text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono text-neutral-300">G</kbd>
              </span>
            </button>

            <div className="h-4 w-px bg-[#383838] mx-0.5" />

            {/* 4. Slide Pagination Controls (‹ 1 / N ›) */}
            {slides.length > 1 && (
              <>
                <div className="flex items-center gap-0.5 text-[#8e8e93]">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                    disabled={activeIndex === 0}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Previous Slide (←)"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[10px] font-mono font-medium text-[#ececec] px-1 select-none whitespace-nowrap">
                    {activeIndex + 1} <span className="text-[#8e8e93]">/</span> {slides.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(Math.min(slides.length - 1, activeIndex + 1))}
                    disabled={activeIndex === slides.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Next Slide (→)"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
                <div className="h-4 w-px bg-[#383838] mx-0.5" />
              </>
            )}

            {/* 5. Zoom Out, Percentage, Zoom In */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.15, Number((prev - 0.05).toFixed(2))))}
                className="w-6 h-6 rounded flex items-center justify-center text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Zoom Out (-)"
              >
                <Minus size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleFitToScreen()}
                className="text-[11px] font-mono font-medium text-[#ececec] hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-all text-center select-none cursor-pointer"
                title="Click to reset zoom to Fit"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(3.0, Number((prev + 0.05).toFixed(2))))}
                className="w-6 h-6 rounded flex items-center justify-center text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Zoom In (+)"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="h-4 w-px bg-[#383838] mx-0.5" />

            {/* 6. Fit Button */}
            <button
              type="button"
              onClick={() => handleFitToScreen()}
              className="h-[24px] px-2.5 rounded-md bg-[#323234] hover:bg-[#3d3d40] text-[#ececec] text-[10px] font-medium border border-[#48484a]/30 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              title="Fit artboard inside view (Ctrl+0)"
            >
              Fit
            </button>
          </div>

          {/* World Container containing Artboards (Paper.design Multi-Artboard Desk) */}
          <div
            className="absolute"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Artboard Sequence (Paper.design Horizontal Desk) */}
            {slides.map((slide, slideIdx) => {
              const isCurrentActive = slideIdx === activeIndex;
              const slideX = slideIdx * (activeFormat.width + 100);

              if (!isCurrentActive) {
                return (
                  <div
                    key={slide.id || slideIdx}
                    className="absolute"
                    style={{
                      left: `${slideX}px`,
                      top: 0,
                      width: `${activeFormat.width}px`,
                      height: `${activeFormat.height}px`,
                    }}
                  >
                    {/* Slide Number above artboard */}
                    <div className="absolute -top-11 left-0 text-[24px] font-semibold select-none flex items-center gap-2">
                      <span className="px-3 py-1 rounded-md bg-[#242426]/90 border border-white/10 text-neutral-300 shadow-sm flex items-center gap-2">
                        <span>Slide {slideIdx + 1}</span>
                        <span className="text-[18px] text-neutral-500 font-mono">/ {slides.length}</span>
                      </span>
                    </div>

                    {/* Non-Active Static Artboard */}
                    <div
                      className="editor-canvas bg-white relative select-none overflow-hidden cursor-pointer hover:ring-1 hover:ring-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.15)] opacity-95 hover:opacity-100 transition-all"
                      style={{
                        width: `${activeFormat.width}px`,
                        height: `${activeFormat.height}px`,
                        backgroundColor: slide.backgroundColor || "#ffffff",
                        borderRadius: "0px",
                        boxSizing: "border-box",
                      }}
                      onClick={() => {
                        setActiveIndex(slideIdx);
                        setSelectedElement(null);
                      }}
                      title={`Click to edit Slide ${slideIdx + 1}`}
                    >
                      {renderStaticSlideContent(slide, slideIdx)}
                    </div>
                  </div>
                );
              }

              // Active Interactive Artboard
              return (
                <div
                  key={slide.id || slideIdx}
                  className="absolute"
                  style={{
                    left: `${slideX}px`,
                    top: 0,
                    width: `${activeFormat.width}px`,
                    height: `${activeFormat.height}px`,
                  }}
                >
                  {/* Slide Number above artboard */}
                  <div className="absolute -top-11 left-0 text-[24px] font-semibold select-none flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-[#1687f8] text-white shadow-md flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      <span>Slide {slideIdx + 1}</span>
                      <span className="text-[18px] text-white/75 font-mono">/ {slides.length}</span>
                    </span>
                  </div>

                  {/* Active Artboard Frame */}
                  <div
                    className="editor-canvas bg-white relative select-none overflow-hidden ring-2 ring-[#1687f8] shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
                    style={{
                      width: `${activeFormat.width}px`,
                      height: `${activeFormat.height}px`,
                      backgroundColor: activeSlide.backgroundColor || "#ffffff",
                      borderRadius: "0px",
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

              {/* Secondary Image */}
              {renderCanvasElement(
                "secondaryImage",
                <div
                  className="w-full h-full overflow-hidden animate-fade"
                  style={{
                    background:
                      activeSlide.secondaryImage?.color || "transparent",
                    borderRadius: `${activeSlide.secondaryImage?.borderRadius || 18}px`,
                    border:
                      (activeSlide.secondaryImage?.borderWidth || 0) > 0
                        ? `${activeSlide.secondaryImage?.borderWidth}px solid ${activeSlide.secondaryImage?.borderColor}`
                        : "none",
                  }}
                >
                  {activeSlide.secondaryImage?.mediaUrl ? (
                    isVideo(activeSlide.secondaryImage.mediaUrl) ? (
                      <video
                        src={activeSlide.secondaryImage.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full"
                        style={{
                          objectFit: activeSlide.secondaryImage.objectFit,
                          filter: `brightness(${activeSlide.secondaryImage.brightness}%) contrast(${activeSlide.secondaryImage.contrast}%)`,
                        }}
                      />
                    ) : (
                      <img
                        src={activeSlide.secondaryImage.mediaUrl}
                        alt="Secondary Image Layout"
                        className="w-full h-full"
                        style={{
                          objectFit: activeSlide.secondaryImage.objectFit,
                          filter: `brightness(${activeSlide.secondaryImage.brightness}%) contrast(${activeSlide.secondaryImage.contrast}%)`,
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 bg-neutral-50/50 border border-neutral-100 rounded-2xl">
                      <span
                        className="font-extrabold uppercase tracking-wider text-[11px] mb-1"
                        style={{ fontSize: "12px" }}
                      >
                        Image 2 Placeholder
                      </span>
                      <span
                        className="text-[9px] opacity-60"
                        style={{ fontSize: "9px" }}
                      >
                        Upload photo in Right Panel
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
              );
            })}
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
            RIGHT PANEL: STUDIO INSPECTOR (280px & Mobile Drawer)
            ------------------------------------------ */}
        {showRightSidebar && isMobileView && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRightSidebar(false)}
            />
            <div className="relative z-10 w-[300px] max-w-[85vw] h-full bg-[#2a2a2a] shadow-2xl overflow-y-auto">
              <StudioInspector
                activeSlide={activeSlide}
                selectedElement={selectedElement}
                isFooterSelected={isFooterSelected}
                activeFormat={activeFormat}
                slidesCount={slides.length}
                activeIndex={activeIndex}
                projectName={projectName}
                onUpdateProjectName={setProjectName}
                documentKind={documentKind}
                onSwitchDocumentKind={switchDocumentKind}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onShare={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Project URL copied to clipboard!");
                  }
                }}
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
                zoomScale={zoomScale}
                onSetZoomScale={setZoomScale}
                onZoomFit={() => handleFitToScreen()}
              />
            </div>
          </div>
        )}

        {showRightSidebar && !isMobileView && (
          <StudioInspector
            activeSlide={activeSlide}
            selectedElement={selectedElement}
            isFooterSelected={isFooterSelected}
            activeFormat={activeFormat}
            slidesCount={slides.length}
            activeIndex={activeIndex}
            projectName={projectName}
            onUpdateProjectName={setProjectName}
            documentKind={documentKind}
            onSwitchDocumentKind={switchDocumentKind}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onShare={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Project URL copied to clipboard!");
              }
            }}
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
            zoomScale={zoomScale}
            onSetZoomScale={setZoomScale}
            onZoomFit={() => handleFitToScreen()}
          />
        )}

        {/* ==========================================
            SUPABASE DATABASE PROJECTS DRAWER
            ========================================== */}
        {showProjectsDrawer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
              className="fixed inset-0" 
              onClick={() => setShowProjectsDrawer(false)} 
            />
            <div className="relative z-10 w-full max-w-2xl bg-[#1e1e20] border border-[#333336] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between bg-[#19191b]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CloudCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white tracking-tight">
                      Supabase Cloud Projects
                    </h2>
                    <p className="text-[12px] text-neutral-400">
                      Fully persisted in PostgreSQL database with auto-sync
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateNewProject("editorial")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-medium transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>New Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectsDrawer(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              </div>

              {/* Body / List */}
              <div className="p-6 overflow-y-auto divide-y divide-[#2a2a2d] space-y-2">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400">
                    <FolderOpen size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-[14px] font-medium text-neutral-300">No saved projects found</p>
                    <p className="text-[12px] text-neutral-500 mt-1">
                      Click "New Project" above to create your first cloud database post.
                    </p>
                  </div>
                ) : (
                  savedProjects.map((proj) => {
                    const isCurrent = proj.id === currentDocId;
                    const rawDate = proj.updatedAt || proj.updated_at;
                    const updatedAt = rawDate 
                      ? new Date(rawDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently";

                    return (
                      <div
                        key={proj.id}
                        onClick={() => loadDocumentFromDatabase(proj.id)}
                        className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                          isCurrent
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? "bg-emerald-500 text-white"
                                : "bg-neutral-800 text-neutral-400 group-hover:text-white group-hover:bg-neutral-700"
                            } transition-colors`}
                          >
                            <LayoutGrid size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[13px] font-medium text-white truncate max-w-[280px]">
                                {proj.name || "Untitled Project"}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span>{proj.slidesCount || proj.slide_count || 1} {(proj.slidesCount || proj.slide_count) === 1 ? "slide" : "slides"}</span>
                              <span>•</span>
                              <span>{proj.width || 1080} × {proj.height || 1350}</span>
                              <span>•</span>
                              <span>Updated {updatedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                            className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 text-neutral-500 transition-colors cursor-pointer"
                            title="Delete from database"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-[#2d2d30] bg-[#161618] flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PostgreSQL Cloud Engine Connected</span>
                </div>
                <div>{savedProjects.length} total saved documents</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
