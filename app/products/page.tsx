"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/marketing/PageHero";

// ══════════════════════════════════════════════════════════════════
// Product Catalog Definition Matching 360Labs Structure As-Is
// ══════════════════════════════════════════════════════════════════

const PRODUCTS = [
  {
    name: "RecruitAI™",
    label: "AUTONOMOUS TALENT ACQUISITION",
    shortName: "RECRUITAI",
    image: "/images/products/recruitai.png",
    taglineLead: "Your autonomous screening platform that is",
    taglineBold: "rigorous, unbiased and scalable.",
    subtext: "It evaluates candidate proof-of-work, generates scorecards, and streamlines hiring.",
    description:
      "An end-to-end recruitment intelligence platform that automates technical candidate screening, scorecard evaluation, and applicant communication. It matches applicant portfolios against customized engineering rubrics with verifiable proof of work, enabling hiring teams to identify top engineering talent in minutes.",
    href: "https://recruitaitech.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "Pipper™",
    label: "DESKTOP AGENT HARNESS",
    shortName: "PIPPER",
    image: "/images/products/pipper.png",
    taglineLead: "Your desktop workspace for running and seeing",
    taglineBold: "autonomous coding agents.",
    subtext: "It executes in parallel, tracks live diffs and compiles deterministically.",
    description:
      "A desktop workspace for running and seeing autonomous coding agents work together. Pipper orchestrates parallel model execution, visualizes live file changes across branches, and runs deterministic AST compilations before merging into your codebase. Its companion dashboard gives full visibility over agent prompts, test coverage, and sandbox rollbacks.",
    href: "https://pipper.dev?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "ResumeForgeAI™",
    label: "CAREER & RESUME INTELLIGENCE",
    shortName: "RESUMEFORGE",
    image: "/images/products/resumeforgeai.png",
    taglineLead: "Your role-targeted career platform that is",
    taglineBold: "optimized, versioned and verified.",
    subtext: "It aligns ATS vector scores, manages multiple roles, and builds publication-ready resumes.",
    description:
      "An AI-native resume engineering platform designed for software engineers and technical leaders. It builds role-specific resumes with granular version branching, ATS semantic match benchmarking, and publication-ready typography. The system ensures every bullet point is grounded in verifiable impact metrics tailored to target job descriptions.",
    href: "https://resumeforgeai.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "UniversalAI™",
    label: "UNIFIED AI GATEWAY",
    shortName: "UNIVERSAL",
    image: "/images/products/universalai.png",
    taglineLead: "Your unified AI switchboard that is",
    taglineBold: "multi-model, ultra-fast and cost-optimized.",
    subtext: "It routes between Claude, GPT-5 and Gemini with sub-15ms latency.",
    description:
      "A unified AI gateway enabling seamless switching, side-by-side comparison, and automated intent routing across leading frontier models. UniversalAI allows you to choose the exact reasoning depth and latency profile needed for every conversation, drastically reducing API costs while guaranteeing high-precision outputs.",
    href: "/contact",
    isExternal: false,
  },
  {
    name: "GrowX Crawl™",
    label: "WEB INTELLIGENCE & RESEARCH RUNTIME",
    shortName: "GROWX CRAWL",
    image: "/portfolio/growx-crawl.svg",
    isSvg: true,
    taglineLead: "Your local-first web discovery engine that is",
    taglineBold: "verifiable, high-throughput and structured.",
    subtext: "It executes headless JS crawls, extracts entities, and audits search engine visibility.",
    description:
      "A local-first web research tool built inside GrowXLabs to discover companies, crawl websites, extract structured information, and keep verifiable source evidence behind every finding.",
    href: "/contact",
    isExternal: false,
  },
];

const RECRUITAI_GRADIENT = {
  mode: "stripes",
  colors: [
    { id: "c905_63705", hex: "#1B1035", pos: 0, name: "Night" },
    { id: "c906_99466", hex: "#4A3A8C", pos: 33, name: "Iris" },
    { id: "c907_35227", hex: "#B58AC9", pos: 67, name: "Lilac" },
    { id: "c908_70988", hex: "#F5D6E6", pos: 100, name: "Petal" },
  ],
  angle: 155,
  centerX: 50,
  centerY: 50,
  scale: 68,
  softness: 26,
  wave: 12,
  distortion: 28,
  grain: 63,
  count: 6,
  fade: 40,
  envelope: "ramp",
  spread: -20,
  soften: 0,
  pixelCols: 16,
  pixelRows: 10,
  pixelAngle: 45,
  pixelDither: 50,
  pixelGap: 0,
  archBase: 70,
  archHeight: 50,
  archWidth: 100,
  archGlow: 55,
  archEdge: 30,
  animated: true,
  speed: 98,
  motionAmount: 75,
  motionReverse: false,
  seed: 1,
  backdrop: "#EAF4FC",
} as const;

const PIPPER_GRADIENT = {
  mode: "mesh",
  colors: [
    { hex: "#223A70", pos: 100, name: "Navy" },
    { hex: "#824880", pos: 30, name: "Aubergine" },
    { hex: "#F4B3C2", pos: 74, name: "Ibis pink" },
    { hex: "#FFF1CF", pos: 0, name: "Eggshell" },
  ],
  angle: 38,
  centerX: 50,
  centerY: 50,
  scale: 68,
  softness: 24,
  wave: 14,
  distortion: 32,
  grain: 100,
  vignette: 0,
  count: 6,
  fade: 40,
  envelope: "ramp",
  spread: -20,
  soften: 0,
  pixelCols: 16,
  pixelRows: 10,
  pixelAngle: 45,
  pixelDither: 50,
  pixelGap: 0,
  archBase: 70,
  archHeight: 50,
  archWidth: 100,
  archGlow: 55,
  archEdge: 30,
  animated: true,
  speed: 100,
  motionAmount: 100,
  motionReverse: false,
  seed: 174074637,
  backdrop: "#223A70",
} as const;

const PIPPER_BLOOMS = [
  {
    x: 67.04,
    y: 45.93,
    color: "#223A70",
    stops: [0, 19.02, 38.05, 57.07, 76.1],
  },
  {
    x: 35.47,
    y: 65.92,
    color: "#824880",
    stops: [0, 12.9, 25.8, 38.7, 51.6],
  },
  {
    x: 48.33,
    y: 20.11,
    color: "#F4B3C2",
    stops: [0, 16.75, 33.5, 50.25, 67],
  },
  {
    x: 80.81,
    y: 88.03,
    color: "#FFF1CF",
    stops: [0, 10.28, 20.55, 30.83, 41.1],
  },
] as const;

const UNIVERSALAI_GRADIENT = {
  mode: "stripes",
  colors: [
    { hex: "#FFFFFF", pos: 18, name: "White" },
    { hex: "#B96A96", pos: 57, name: "Coral red" },
    { hex: "#950F46", pos: 60, name: "Ruby" },
    { hex: "#4D0026", pos: 100, name: "Charcoal" },
  ],
  angle: 38,
  centerX: 50,
  centerY: 50,
  scale: 68,
  softness: 24,
  wave: 14,
  distortion: 28,
  grain: 42,
  vignette: 0,
  count: 6,
  fade: 40,
  envelope: "ramp",
  spread: -20,
  soften: 0,
  pixelCols: 16,
  pixelRows: 10,
  pixelAngle: 45,
  pixelDither: 50,
  pixelGap: 0,
  archBase: 70,
  archHeight: 50,
  archWidth: 100,
  archGlow: 55,
  archEdge: 30,
  animated: true,
  speed: 100,
  motionAmount: 0,
  motionReverse: false,
  seed: 174074637,
  backdrop: "#0B1220",
} as const;

const UNIVERSALAI_BANDS = [0, 0, 1, 2, 3, 3] as const;

const RESUMEFORGEAI_GRADIENT = {
  mode: "bars",
  colors: [
    { hex: "#123A6B", pos: 0, name: "Navy" },
    { hex: "#E4676B", pos: 63, name: "Coral" },
    { hex: "#F4B3C2", pos: 91, name: "Ibis pink" },
    { hex: "#FBF3E7", pos: 100, name: "Cream" },
  ],
  angle: 90,
  centerX: 50,
  centerY: 50,
  scale: 68,
  softness: 29,
  wave: 0,
  distortion: 28,
  grain: 0,
  vignette: 13,
  count: 6,
  fade: 25,
  envelope: "ramp",
  spread: -22,
  soften: 0,
  pixelCols: 16,
  pixelRows: 10,
  pixelAngle: 45,
  pixelDither: 50,
  pixelGap: 0,
  archBase: 70,
  archHeight: 50,
  archWidth: 100,
  archGlow: 55,
  archEdge: 30,
  animated: true,
  speed: 17,
  motionAmount: 35,
  motionReverse: false,
  seed: 239191696,
  backdrop: "#123A6B",
} as const;

const RESUMEFORGEAI_BAR_COLORS = [0, 1, 2, 3, 0, 1] as const;

const GROWX_CRAWL_GRADIENT = {
  mode: "stripes",
  colors: [
    { hex: "#3CC1F6", pos: 50, name: "Glazed azure" },
    { hex: "#C3CFEA", pos: 47, name: "Mauve" },
    { hex: "#1D62D7", pos: 40, name: "Lagoon blue" },
    { hex: "#1839A7", pos: 63, name: "Lapis" },
    { hex: "#1E788A", pos: 100, name: "Cobalt" },
  ],
  angle: 135,
  centerX: 50,
  centerY: 50,
  scale: 68,
  softness: 26,
  wave: 12,
  distortion: 28,
  grain: 100,
  vignette: 40,
  count: 6,
  fade: 40,
  envelope: "ramp",
  spread: -20,
  soften: 0,
  pixelCols: 16,
  pixelRows: 10,
  pixelAngle: 45,
  pixelDither: 50,
  pixelGap: 0,
  archBase: 70,
  archHeight: 50,
  archWidth: 100,
  archGlow: 55,
  archEdge: 30,
  animated: false,
  speed: 40,
  motionAmount: 50,
  motionReverse: false,
  seed: 1,
  backdrop: "#3B82F6",
} as const;

// These are the duplicated stops from the supplied 21st.dev CSS approximation.
// Keeping them as canvas stops preserves the same band widths while allowing the
// non-zero wave parameter to bend the field instead of falling back to CSS.
const GROWX_CRAWL_RIBBON_STOPS = [
  { position: 0.0091, color: 2 },
  { position: 0.4259, color: 2 },
  { position: 0.4389, color: 1 },
  { position: 0.4811, color: 1 },
  { position: 0.4889, color: 0 },
  { position: 0.5611, color: 0 },
  { position: 0.5819, color: 3 },
  { position: 0.7981, color: 3 },
  { position: 0.815, color: 4 },
  { position: 1, color: 4 },
] as const;

function hexToRgb(hex: string) {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const;
}

function PipperBloomCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let grainCanvas: HTMLCanvasElement | null = null;
    let animationFrame = 0;
    let motionElapsed = 0;
    let motionStart = 0;
    let lastDrawAt = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colorRgb = PIPPER_BLOOMS.map((bloom) => hexToRgb(bloom.color));
    const phases = PIPPER_BLOOMS.map((_, index) => {
      const hash = Math.sin(PIPPER_GRADIENT.seed * 0.000001 + index * 78.233) * 43758.5453;
      const hash2 = Math.sin(PIPPER_GRADIENT.seed * 0.000002 + index * 39.17 + 11.3) * 43758.5453;
      return {
        x: (hash - Math.floor(hash)) * Math.PI * 2,
        y: (hash2 - Math.floor(hash2)) * Math.PI * 2,
      };
    });

    const seededNoise = (index: number) => {
      const value = Math.sin(index * 12.9898 + PIPPER_GRADIENT.seed * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const devicePixelRatio = 1;
      width = Math.max(1, Math.floor(bounds.width * devicePixelRatio));
      height = Math.max(1, Math.floor(bounds.height * devicePixelRatio));
      canvas.width = width;
      canvas.height = height;
      grainCanvas = document.createElement("canvas");
      grainCanvas.width = width;
      grainCanvas.height = height;
      const grainContext = grainCanvas.getContext("2d");
      if (grainContext) {
        const grainImage = grainContext.createImageData(width, height);
        for (let index = 0; index < width * height; index += 1) {
          const value = Math.floor(seededNoise(index) * 256);
          const pixelIndex = index * 4;
          grainImage.data[pixelIndex] = value;
          grainImage.data[pixelIndex + 1] = value;
          grainImage.data[pixelIndex + 2] = value;
          grainImage.data[pixelIndex + 3] = 255;
        }
        grainContext.putImageData(grainImage, 0, 0);
      }
    };

    const draw = (elapsedSeconds: number) => {
      if (!grainCanvas || width === 0 || height === 0) return;

      const ph = elapsedSeconds * (PIPPER_GRADIENT.speed / 100);
      const amt = PIPPER_GRADIENT.motionAmount / 100;
      const direction = PIPPER_GRADIENT.motionReverse ? -1 : 1;
      const spin = ph * direction;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = PIPPER_GRADIENT.backdrop;
      context.fillRect(0, 0, width, height);

      PIPPER_BLOOMS.forEach((bloom, index) => {
        const phase = phases[index];
        const xDelta = (Math.sin(spin * 0.55 + phase.x) - Math.sin(phase.x)) * 14 * amt;
        const yDelta = (Math.sin(spin * 0.43 + phase.y) - Math.sin(phase.y)) * 14 * amt;
        const centerX = ((bloom.x + xDelta) / 100) * width;
        const centerY = ((bloom.y + yDelta) / 100) * height;
        const radius = Math.max(
          Math.hypot(centerX, centerY),
          Math.hypot(width - centerX, centerY),
          Math.hypot(centerX, height - centerY),
          Math.hypot(width - centerX, height - centerY),
        );
        const [red, green, blue] = colorRgb[index];
        const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 1)`);
        gradient.addColorStop(bloom.stops[1] / 100, `rgba(${red}, ${green}, ${blue}, 0.844)`);
        gradient.addColorStop(bloom.stops[2] / 100, `rgba(${red}, ${green}, ${blue}, 0.5)`);
        gradient.addColorStop(bloom.stops[3] / 100, `rgba(${red}, ${green}, ${blue}, 0.156)`);
        gradient.addColorStop(bloom.stops[4] / 100, `rgba(${red}, ${green}, ${blue}, 0)`);

        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });

      context.save();
      context.globalCompositeOperation = "overlay";
      context.globalAlpha = 0.16 + (PIPPER_GRADIENT.grain / 100) * 0.08;
      context.drawImage(grainCanvas, 0, 0, width, height);
      context.restore();
    };

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const startAnimation = () => {
      if (animationFrame || prefersReducedMotion || !PIPPER_GRADIENT.animated) return;

      motionStart = performance.now() - motionElapsed * 1000;
      const animate = (now: number) => {
        motionElapsed = (now - motionStart) / 1000;
        if (now - lastDrawAt >= 1000 / 30) {
          draw(motionElapsed);
          lastDrawAt = now;
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      motionElapsed = (performance.now() - motionStart) / 1000;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAnimation();
      else stopAnimation();
    });
    visibilityObserver.observe(host);

    if (!prefersReducedMotion && PIPPER_GRADIENT.animated) startAnimation();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function ResumeForgeAIPulseBarsCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let motionElapsed = 0;
    let motionStart = 0;
    let lastDrawAt = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = RESUMEFORGEAI_GRADIENT.colors.map((color) => hexToRgb(color.hex));
    const backdrop = hexToRgb(RESUMEFORGEAI_GRADIENT.backdrop);
    const phases = RESUMEFORGEAI_BAR_COLORS.map((_, index) => {
      const hash = Math.sin(RESUMEFORGEAI_GRADIENT.seed * 0.000001 + index * 78.233) * 43758.5453;
      return (hash - Math.floor(hash)) * Math.PI * 2;
    });

    const rgba = (color: readonly [number, number, number], alpha: number) =>
      `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const devicePixelRatio = 1;
      width = Math.max(1, Math.floor(bounds.width * devicePixelRatio));
      height = Math.max(1, Math.floor(bounds.height * devicePixelRatio));
      canvas.width = width;
      canvas.height = height;
    };

    const draw = (elapsedSeconds: number) => {
      if (width === 0 || height === 0) return;

      const ph = elapsedSeconds * (RESUMEFORGEAI_GRADIENT.speed / 100);
      const amt = RESUMEFORGEAI_GRADIENT.motionAmount / 100;
      const direction = RESUMEFORGEAI_GRADIENT.motionReverse ? -1 : 1;
      const spin = ph * direction;
      const envelopeClock = spin * 1.6;
      const angle = RESUMEFORGEAI_GRADIENT.angle * (Math.PI / 180);
      const verticalFactor = Math.abs(Math.sin(angle));
      const slotWidth = width / RESUMEFORGEAI_GRADIENT.count;
      const barWidth = slotWidth * (1 + RESUMEFORGEAI_GRADIENT.spread / 100);
      const bottom = height;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = RESUMEFORGEAI_GRADIENT.backdrop;
      context.fillRect(0, 0, width, height);

      RESUMEFORGEAI_BAR_COLORS.forEach((colorIndex, index) => {
        const phase = phases[index];
        const ramp = index / Math.max(1, RESUMEFORGEAI_GRADIENT.count - 1);
        const baseHeight = RESUMEFORGEAI_GRADIENT.envelope === "ramp" ? 0.05 + ramp * 0.95 : 0.72;
        const shimmer = (Math.sin(envelopeClock * (0.85 + index * 0.035) + phase) - Math.sin(phase)) * 0.22 * amt;
        const heightRatio = clamp((baseHeight + shimmer) * verticalFactor, 0.04, 1);
        const barHeight = height * heightRatio;
        const left = index * slotWidth + (slotWidth - barWidth) / 2;
        const top = bottom - barHeight;
        const edge = Math.min(barWidth * 0.06, (RESUMEFORGEAI_GRADIENT.softness / 100) * barWidth * 0.22);
        const color = palette[colorIndex];
        const fadedColor: [number, number, number] = [
          color[0] * (1 - RESUMEFORGEAI_GRADIENT.fade / 100) + backdrop[0] * (RESUMEFORGEAI_GRADIENT.fade / 100),
          color[1] * (1 - RESUMEFORGEAI_GRADIENT.fade / 100) + backdrop[1] * (RESUMEFORGEAI_GRADIENT.fade / 100),
          color[2] * (1 - RESUMEFORGEAI_GRADIENT.fade / 100) + backdrop[2] * (RESUMEFORGEAI_GRADIENT.fade / 100),
        ];
        const barGradient = context.createLinearGradient(0, top, 0, bottom);
        barGradient.addColorStop(0, rgba(fadedColor, 0.92));
        barGradient.addColorStop(0.16, rgba(color, 0.98));
        barGradient.addColorStop(1, rgba(color, 1));

        context.save();
        context.shadowColor = rgba(color, 0.3);
        context.shadowBlur = RESUMEFORGEAI_GRADIENT.softness * 0.35;
        context.fillStyle = barGradient;
        context.fillRect(left + edge, top, Math.max(1, barWidth - edge * 2), barHeight);
        context.restore();

        const leftFeather = context.createLinearGradient(left, 0, left + edge, 0);
        leftFeather.addColorStop(0, rgba(color, 0));
        leftFeather.addColorStop(1, rgba(color, 0.92));
        context.fillStyle = leftFeather;
        context.fillRect(left, top, edge, barHeight);

        const rightFeather = context.createLinearGradient(left + barWidth - edge, 0, left + barWidth, 0);
        rightFeather.addColorStop(0, rgba(color, 0.92));
        rightFeather.addColorStop(1, rgba(color, 0));
        context.fillStyle = rightFeather;
        context.fillRect(left + barWidth - edge, top, edge, barHeight);

        context.fillStyle = "rgba(255,255,255,0.14)";
        context.fillRect(left + edge + 1, top + 4, 1, Math.max(1, barHeight - 8));
      });

      const verticalFade = context.createLinearGradient(0, 0, 0, height);
      verticalFade.addColorStop(0, rgba(backdrop, RESUMEFORGEAI_GRADIENT.fade / 100));
      verticalFade.addColorStop(1, rgba(backdrop, 0));
      context.fillStyle = verticalFade;
      context.fillRect(0, 0, width, height);

      const vignette = context.createRadialGradient(
        width * (RESUMEFORGEAI_GRADIENT.centerX / 100),
        height * (RESUMEFORGEAI_GRADIENT.centerY / 100),
        Math.min(width, height) * 0.52,
        width * (RESUMEFORGEAI_GRADIENT.centerX / 100),
        height * (RESUMEFORGEAI_GRADIENT.centerY / 100),
        Math.hypot(width, height) * 0.7,
      );
      vignette.addColorStop(0.52, "rgba(0,0,0,0)");
      vignette.addColorStop(1, `rgba(0,0,0,${(RESUMEFORGEAI_GRADIENT.vignette / 100) * 0.8})`);
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const startAnimation = () => {
      if (animationFrame || prefersReducedMotion || !RESUMEFORGEAI_GRADIENT.animated) return;

      motionStart = performance.now() - motionElapsed * 1000;
      const animate = (now: number) => {
        motionElapsed = (now - motionStart) / 1000;
        if (now - lastDrawAt >= 1000 / 30) {
          draw(motionElapsed);
          lastDrawAt = now;
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      motionElapsed = (performance.now() - motionStart) / 1000;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAnimation();
      else stopAnimation();
    });
    visibilityObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function GrowXCrawlRibbonCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let noise = new Float32Array(0);
    let imageData: ImageData | null = null;
    const palette = GROWX_CRAWL_GRADIENT.colors.map((color) => hexToRgb(color.hex));
    const backdrop = hexToRgb(GROWX_CRAWL_GRADIENT.backdrop);
    const seededNoise = (index: number) => {
      const value = Math.sin(index * 12.9898 + GROWX_CRAWL_GRADIENT.seed * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const devicePixelRatio = 1;
      width = Math.max(1, Math.floor(bounds.width * devicePixelRatio));
      height = Math.max(1, Math.floor(bounds.height * devicePixelRatio));
      canvas.width = width;
      canvas.height = height;
      noise = new Float32Array(width * height);
      for (let index = 0; index < noise.length; index += 1) noise[index] = seededNoise(index);
      imageData = context.createImageData(width, height);
    };

    const sampleRibbon = (position: number): [number, number, number] => {
      const stops = GROWX_CRAWL_RIBBON_STOPS;
      if (position <= stops[0].position) return [...palette[stops[0].color]];

      for (let index = 1; index < stops.length; index += 1) {
        const previous = stops[index - 1];
        const current = stops[index];
        if (position <= current.position) {
          const first = palette[previous.color];
          const second = palette[current.color];
          const mix = (position - previous.position) / Math.max(0.0001, current.position - previous.position);
          return [
            first[0] + (second[0] - first[0]) * mix,
            first[1] + (second[1] - first[1]) * mix,
            first[2] + (second[2] - first[2]) * mix,
          ];
        }
      }

      return [...palette[stops[stops.length - 1].color]];
    };

    const draw = () => {
      if (!imageData || width === 0 || height === 0) return;

      const { data } = imageData;
      const angle = GROWX_CRAWL_GRADIENT.angle * (Math.PI / 180);
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const scale = GROWX_CRAWL_GRADIENT.scale / 100;
      const spread = 1 + GROWX_CRAWL_GRADIENT.spread / 100;
      const waveAmount = (GROWX_CRAWL_GRADIENT.wave / 100) * 0.35;
      const waveClock = 20.75;
      const fade = GROWX_CRAWL_GRADIENT.fade / 100;
      const grainStrength = (GROWX_CRAWL_GRADIENT.grain / 100) * 0.5;

      for (let y = 0; y < height; y += 1) {
        const ny = y / Math.max(1, height - 1) - GROWX_CRAWL_GRADIENT.centerY / 100;
        for (let x = 0; x < width; x += 1) {
          const nx = x / Math.max(1, width - 1) - GROWX_CRAWL_GRADIENT.centerX / 100;
          const along = nx * sinAngle - ny * cosAngle;
          const cross = nx * cosAngle + ny * sinAngle;
          const waveOffset = waveAmount * Math.sin(cross * 2.4 * 2 * Math.PI + waveClock);
          const stripePosition = 0.5 + ((along + waveOffset) / (scale * 2)) * spread;
          const ribbonColor = sampleRibbon(stripePosition);
          const fadedColor = [
            ribbonColor[0] * (1 - fade) + backdrop[0] * fade,
            ribbonColor[1] * (1 - fade) + backdrop[1] * fade,
            ribbonColor[2] * (1 - fade) + backdrop[2] * fade,
          ];
          const noiseValue = noise[y * width + x] * 255;
          const pixelIndex = (y * width + x) * 4;
          const channels = fadedColor.map((channel) => {
            const overlay = noiseValue < 128
              ? (2 * channel * noiseValue) / 255
              : 255 - (2 * (255 - channel) * (255 - noiseValue)) / 255;
            return Math.max(0, Math.min(255, channel * (1 - grainStrength) + overlay * grainStrength));
          });

          data[pixelIndex] = channels[0];
          data[pixelIndex + 1] = channels[1];
          data[pixelIndex + 2] = channels[2];
          data[pixelIndex + 3] = 255;
        }
      }

      context.putImageData(imageData, 0, 0);

      const vignette = context.createRadialGradient(
        width * (GROWX_CRAWL_GRADIENT.centerX / 100),
        height * (GROWX_CRAWL_GRADIENT.centerY / 100),
        Math.min(width, height) * 0.52,
        width * (GROWX_CRAWL_GRADIENT.centerX / 100),
        height * (GROWX_CRAWL_GRADIENT.centerY / 100),
        Math.hypot(width, height) * 0.7,
      );
      vignette.addColorStop(0.52, "rgba(0,0,0,0)");
      vignette.addColorStop(1, `rgba(0,0,0,${(GROWX_CRAWL_GRADIENT.vignette / 100) * 0.8})`);
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(host);

    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function UniversalAIRibbonCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let noise = new Float32Array(0);
    let imageData: ImageData | null = null;
    let animationFrame = 0;
    let motionElapsed = 0;
    let motionStart = 0;
    let lastDrawAt = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = UNIVERSALAI_GRADIENT.colors.map((color) => hexToRgb(color.hex));
    const bandPalette = UNIVERSALAI_BANDS;

    const seededNoise = (index: number) => {
      const value = Math.sin(index * 12.9898 + UNIVERSALAI_GRADIENT.seed * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const devicePixelRatio = 1;
      width = Math.max(1, Math.floor(bounds.width * devicePixelRatio));
      height = Math.max(1, Math.floor(bounds.height * devicePixelRatio));
      canvas.width = width;
      canvas.height = height;
      noise = new Float32Array(width * height);
      for (let index = 0; index < noise.length; index += 1) noise[index] = seededNoise(index);
      imageData = context.createImageData(width, height);
    };

    const draw = (elapsedSeconds: number) => {
      if (!imageData || width === 0 || height === 0) return;

      const { data } = imageData;
      const ph = elapsedSeconds * (UNIVERSALAI_GRADIENT.speed / 100);
      const amt = UNIVERSALAI_GRADIENT.motionAmount / 100;
      const direction = UNIVERSALAI_GRADIENT.motionReverse ? -1 : 1;
      const spin = ph * direction;
      const angle = (UNIVERSALAI_GRADIENT.angle + Math.sin(spin * 0.6) * 28 * amt) * (Math.PI / 180);
      const waveClock = 20.75 + ph * 1.2;
      const baseWaveClock = 20.75;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const scale = UNIVERSALAI_GRADIENT.scale / 100;
      const spread = 1 + UNIVERSALAI_GRADIENT.spread / 100;
      const feather = Math.min(0.42, (UNIVERSALAI_GRADIENT.softness / 100) * 0.65 + (UNIVERSALAI_GRADIENT.fade / 100) * 0.12);
      const waveAmount = (UNIVERSALAI_GRADIENT.wave / 100) * 0.35;
      const stripeFeather = 0.22 + feather * 0.4;
      const backdrop = hexToRgb(UNIVERSALAI_GRADIENT.backdrop);
      const backdropWeight = UNIVERSALAI_GRADIENT.fade / 100;

      for (let y = 0; y < height; y += 1) {
        const ny = y / Math.max(1, height - 1) - UNIVERSALAI_GRADIENT.centerY / 100;
        for (let x = 0; x < width; x += 1) {
          const nx = x / Math.max(1, width - 1) - UNIVERSALAI_GRADIENT.centerX / 100;
          const along = nx * sinAngle - ny * cosAngle;
          const cross = nx * cosAngle + ny * sinAngle;
          const waveInput = cross * 2.4 * 2 * Math.PI;
          const baseWave = Math.sin(waveInput + baseWaveClock);
          const animatedWaveDelta = Math.sin(waveInput + waveClock) - baseWave;
          const waveOffset = waveAmount * baseWave + waveAmount * animatedWaveDelta;
          const warped = along + waveOffset;
          const stripePosition = 0.5 + (warped / (scale * 2)) * spread;
          const stripePhase = stripePosition * UNIVERSALAI_GRADIENT.count;
          const blendedColor = [backdrop[0] * backdropWeight, backdrop[1] * backdropWeight, backdrop[2] * backdropWeight];
          let totalWeight = backdropWeight;

          for (let band = 0; band < bandPalette.length; band += 1) {
            const distance = Math.abs(stripePhase - (band + 0.5));
            const weight = Math.exp(-((distance / stripeFeather) ** 2));
            const bandColor = palette[bandPalette[band]];
            blendedColor[0] += bandColor[0] * weight;
            blendedColor[1] += bandColor[1] * weight;
            blendedColor[2] += bandColor[2] * weight;
            totalWeight += weight;
          }

          const pixelIndex = (y * width + x) * 4;
          const grain = (noise[y * width + x] - 0.5) * (UNIVERSALAI_GRADIENT.grain / 100) * 18;
          data[pixelIndex] = Math.max(0, Math.min(255, blendedColor[0] / totalWeight + grain));
          data[pixelIndex + 1] = Math.max(0, Math.min(255, blendedColor[1] / totalWeight + grain));
          data[pixelIndex + 2] = Math.max(0, Math.min(255, blendedColor[2] / totalWeight + grain));
          data[pixelIndex + 3] = 255;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const startAnimation = () => {
      if (animationFrame || prefersReducedMotion || !UNIVERSALAI_GRADIENT.animated) return;

      motionStart = performance.now() - motionElapsed * 1000;
      const animate = (now: number) => {
        motionElapsed = (now - motionStart) / 1000;
        if (now - lastDrawAt >= 1000 / 30) {
          draw(motionElapsed);
          lastDrawAt = now;
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      motionElapsed = (performance.now() - motionStart) / 1000;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAnimation();
      else stopAnimation();
    });
    visibilityObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function RecruitAIGradientCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let noise = new Float32Array(0);
    let imageData: ImageData | null = null;
    let animationFrame = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = RECRUITAI_GRADIENT.colors.map((color) => hexToRgb(color.hex));
    const bandPalette = [0, 1, 2, 3, 2, 1];

    const seededNoise = (index: number) => {
      const value = Math.sin(index * 12.9898 + RECRUITAI_GRADIENT.seed * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(bounds.width * devicePixelRatio));
      height = Math.max(1, Math.floor(bounds.height * devicePixelRatio));
      canvas.width = width;
      canvas.height = height;
      noise = new Float32Array(width * height);
      for (let index = 0; index < noise.length; index += 1) noise[index] = seededNoise(index);
      imageData = context.createImageData(width, height);
    };

    const draw = (elapsedSeconds: number) => {
      if (!imageData || width === 0 || height === 0) return;

      const { data } = imageData;
      const ph = elapsedSeconds * (RECRUITAI_GRADIENT.speed / 100);
      const amt = RECRUITAI_GRADIENT.motionAmount / 100;
      const direction = RECRUITAI_GRADIENT.motionReverse ? -1 : 1;
      const spin = ph * direction;
      const angle = (RECRUITAI_GRADIENT.angle + Math.sin(spin * 0.6) * 28 * amt) * (Math.PI / 180);
      const waveClock = 20.75 + ph * 1.2;
      const baseWaveClock = 20.75;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const scale = RECRUITAI_GRADIENT.scale / 100;
      const spread = 1 + RECRUITAI_GRADIENT.spread / 100;
      const feather = Math.min(0.42, (RECRUITAI_GRADIENT.softness / 100) * 0.65 + (RECRUITAI_GRADIENT.fade / 100) * 0.12);
      const waveAmount = (RECRUITAI_GRADIENT.wave / 100) * 0.35;
      const stripeFeather = 0.22 + feather * 0.4;

      for (let y = 0; y < height; y += 1) {
        const ny = y / Math.max(1, height - 1) - RECRUITAI_GRADIENT.centerY / 100;
        for (let x = 0; x < width; x += 1) {
          const nx = x / Math.max(1, width - 1) - RECRUITAI_GRADIENT.centerX / 100;
          // At the configured 155° angle, this axis keeps the field predominantly horizontal.
          const along = nx * sinAngle - ny * cosAngle;
          const cross = nx * cosAngle + ny * sinAngle;
          const waveInput = cross * 2.4 * 2 * Math.PI;
          const baseWave = Math.sin(waveInput + baseWaveClock);
          const animatedWaveDelta = Math.sin(waveInput + waveClock) - baseWave;
          const waveOffset = waveAmount * baseWave + waveAmount * animatedWaveDelta;
          const warped = along + waveOffset;
          const stripePosition = 0.5 + (warped / (scale * 2)) * spread;
          const stripePhase = stripePosition * RECRUITAI_GRADIENT.count;
          const blendedColor = [0, 0, 0];
          let totalWeight = 0;

          for (let band = 0; band < bandPalette.length; band += 1) {
            const distance = Math.abs(stripePhase - (band + 0.5));
            const weight = Math.exp(-((distance / stripeFeather) ** 2));
            const bandColor = palette[bandPalette[band]];
            blendedColor[0] += bandColor[0] * weight;
            blendedColor[1] += bandColor[1] * weight;
            blendedColor[2] += bandColor[2] * weight;
            totalWeight += weight;
          }

          const pixelIndex = (y * width + x) * 4;
          const grain = (noise[y * width + x] - 0.5) * (RECRUITAI_GRADIENT.grain / 100) * 12;
          data[pixelIndex] = Math.max(0, Math.min(255, blendedColor[0] / totalWeight + grain));
          data[pixelIndex + 1] = Math.max(0, Math.min(255, blendedColor[1] / totalWeight + grain));
          data[pixelIndex + 2] = Math.max(0, Math.min(255, blendedColor[2] / totalWeight + grain));
          data[pixelIndex + 3] = 255;
        }
      }

      context.putImageData(imageData, 0, 0);
    };

    resize();
    draw(0);

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    if (!prefersReducedMotion && RECRUITAI_GRADIENT.animated) {
      const start = performance.now();
      const animate = (now: number) => {
        draw((now - start) / 1000);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function RecruitAIArtworkCard({ href }: { href: string }) {
  const recruitAITone = "dark" as string;
  const toneStyles = {
    "--recruitai-foreground": recruitAITone === "dark" ? "#FFFFFF" : "#111111",
    "--recruitai-muted": recruitAITone === "dark" ? "rgba(255,255,255,0.78)" : "rgba(17,17,17,0.64)",
    "--recruitai-readability":
      recruitAITone === "dark"
        ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.16) 78%, rgba(0,0,0,0.42) 100%)"
        : "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.06) 78%, rgba(255,255,255,0.2) 100%)",
  } as React.CSSProperties;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open RecruitAI"
      className="group block w-full max-w-[360px] cursor-pointer rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7564a4]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div data-tone={recruitAITone} style={toneStyles} className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] bg-[#ECE8E0] text-[var(--recruitai-foreground)]">
        {/* Layer 1: the 21st.dev Purple Animated Waves Graved ribbon field. */}
        <div
          className="product-visual-background absolute inset-0 z-0 h-full w-full overflow-hidden bg-[#1B1035]"
        >
          <RecruitAIGradientCanvas />
        </div>

        {/* Layer 2: readability treatment that can follow the card tone. */}
        <div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: "var(--recruitai-readability)" }} />

        {/* Layer 3: real RecruitAI product UI. */}
        <div
          className="absolute left-1/2 top-[calc(20%+12px)] z-[4] w-[90%] overflow-hidden rounded-[7px] border border-white/[0.42] bg-black shadow-[0_30px_65px_rgba(20,10,40,0.24),0_10px_24px_rgba(20,10,40,0.14)]"
          style={{ transform: "translateX(-50%) perspective(1000px) rotateX(1deg) rotateY(-2deg)" }}
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/products/recruitai.png"
              alt="RecruitAI product interface"
              fill
              className="object-cover"
              sizes="(max-width: 360px) 90vw, 324px"
              priority
            />
          </div>
        </div>

        {/* Layer 5: short product hierarchy, intentionally kept out of the screenshot. */}
        <div className="absolute left-[22px] top-[24px] z-[6] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--recruitai-muted)]">
          AI-NATIVE RECRUITMENT
        </div>
        <h2 className="absolute left-[22px] bottom-[58px] z-[7] text-[27px] font-bold leading-none tracking-[-0.035em] text-[var(--recruitai-foreground)]">
          RecruitAI<span className="ml-0.5 align-super text-[9px] leading-none">™</span>
        </h2>
        <p className="absolute left-[22px] bottom-[22px] z-[7] max-w-[220px] text-[12px] font-normal leading-[1.4] text-[var(--recruitai-muted)]">
          Hiring decisions built on evidence, not intuition.
        </p>
      </div>
    </a>
  );
}

type RecruitAICapability = "resume" | "assessment" | "interview" | "decision";

function RecruitAICapabilityPanel({
  capability,
  title,
  body,
}: {
  capability: RecruitAICapability;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[9px] border border-white/[0.09] bg-[#202020]/[0.92] p-3 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors duration-300 hover:border-[#B58AC9]/[0.40] hover:bg-[#28232A]/[0.94]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-white/[0.52]">{title}</p>
      <p className="mt-1.5 text-[11px] leading-[1.3] text-white/[0.72]">{body}</p>

      {capability === "resume" ? (
        <div aria-hidden="true" className="mt-2.5 flex items-end gap-2">
          <div className="h-6 w-4 rounded-[2px] border border-white/[0.20] bg-white/[0.10] p-1">
            <div className="h-0.5 w-full bg-white/[0.62]" />
            <div className="mt-1 h-0.5 w-3/4 bg-white/[0.30]" />
            <div className="mt-1 h-0.5 w-full bg-white/[0.30]" />
          </div>
          <span className="text-[9px] font-medium uppercase tracking-[0.09em] text-[#D8BCE5]/[0.78]">Structured</span>
        </div>
      ) : null}

      {capability === "assessment" ? (
        <div aria-hidden="true" className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] text-white/[0.60]"><span className="h-1.5 w-1.5 rounded-full bg-[#B58AC9]/[0.80]" /> Role evaluation</div>
          <div className="h-0.5 rounded-full bg-white/[0.10]"><div className="h-full w-[78%] rounded-full bg-[#B58AC9]/[0.62]" /></div>
          <p className="text-[9px] uppercase tracking-[0.09em] text-white/[0.40]">Complete</p>
        </div>
      ) : null}

      {capability === "interview" ? (
        <div aria-hidden="true" className="mt-2.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D8BCE5]/[0.78]" />
          <span className="text-[9px] uppercase tracking-[0.08em] text-white/[0.48]">Feedback received</span>
        </div>
      ) : null}

      {capability === "decision" ? (
        <div aria-hidden="true" className="mt-2.5 rounded-[5px] border border-[#B58AC9]/[0.24] bg-[#B58AC9]/[0.07] px-1.5 py-1 text-[9px] uppercase tracking-[0.07em] text-[#E8D8EF]/[0.74]">
          Ready for review
        </div>
      ) : null}
    </div>
  );
}

function RecruitAIWorkflowWindow() {
  const stages = [
    ["Applied", "24"],
    ["Screening", "12"],
    ["Assessment", "8"],
    ["Interview", "4"],
    ["Decision", "2"],
  ] as const;
  const progression = [
    "Resume received",
    "Profile structured",
    "Assessment complete",
    "Interview reviewed",
    "Ready for decision",
  ] as const;

  return (
    <div className="relative flex min-h-[414px] flex-col overflow-hidden rounded-[10px] border border-black/[0.14] bg-[#F7F5F0] text-[#222222] shadow-[0_18px_34px_rgba(0,0,0,0.20)] lg:absolute lg:bottom-[8%] lg:left-[15%] lg:right-[14%] lg:top-[14%] lg:min-h-0">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-black/[0.08] bg-[#EEECE7] px-3 text-[9px] text-black/[0.52]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-black/[0.20]" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/[0.14]" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/[0.10]" />
          </div>
          <span className="font-semibold tracking-[-0.01em]">RecruitAI</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="lg:pl-[40px]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black/[0.42]">Hiring workflow</p>
            <h4 className="mt-1 text-[18px] font-semibold leading-none tracking-[-0.035em] text-[#171717] sm:text-[20px]">Senior Full-Stack Engineer</h4>
          </div>
          <span className="rounded-full border border-[#687D66]/[0.34] bg-[#687D66]/[0.08] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#536750]">Open role</span>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {stages.map(([stage, count]) => (
            <div key={stage} className="min-w-0 rounded-[5px] border border-black/[0.08] bg-white/[0.60] px-1.5 py-2">
              <p className="truncate text-[7px] font-semibold uppercase tracking-[0.04em] text-black/[0.42]">{stage}</p>
              <p className="mt-1 text-[16px] font-semibold leading-none tracking-[-0.04em] text-[#222222]">{count}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[7px] border border-black/[0.08] bg-white/[0.58] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/[0.42]">Candidate progression</p>
              <span className="text-[8px] uppercase tracking-[0.08em] text-black/[0.34]">Demo</span>
            </div>
            <p className="mt-2 text-[14px] font-semibold tracking-[-0.025em] text-[#252525]">Priya Sharma</p>
            <ol className="mt-3 space-y-2">
              {progression.map((step, index) => (
                <li key={step} className="flex items-center gap-2 text-[10px] text-black/[0.62]">
                  <span className={`relative flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${index === progression.length - 1 ? "border-[#B58AC9] bg-[#B58AC9]/[0.16]" : "border-[#7C8778]/[0.40] bg-[#7C8778]/[0.12]"}`}>
                    {index === progression.length - 1 ? <span className="h-1 w-1 rounded-full bg-[#8B6599]" /> : null}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[7px] border border-black/[0.08] bg-white/[0.58] p-3">
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/[0.42]">Decision state</p>
            <p className="mt-2 text-[14px] font-semibold tracking-[-0.025em] text-[#252525]">Evidence complete</p>
            <div className="mt-3 space-y-2 text-[10px] text-black/[0.60]">
              <div className="flex items-center justify-between gap-2"><span>Resume</span><span className="font-medium text-[#65785F]">Structured</span></div>
              <div className="flex items-center justify-between gap-2"><span>Assessment</span><span className="font-medium text-[#65785F]">Complete</span></div>
              <div className="flex items-center justify-between gap-2"><span>Interview</span><span className="font-medium text-[#65785F]">Reviewed</span></div>
            </div>
            <div className="mt-4 border-t border-black/[0.08] pt-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#795D86]">Recruiter review pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruitAIIntelligenceCard() {
  return (
    <div className="group relative h-[720px] w-full overflow-hidden rounded-[14px] border border-white/[0.10] bg-[#241E30] text-[#F5F3EF] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] lg:h-[540px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 22% 18%, rgba(206,184,218,0.42) 0%, rgba(157,128,178,0.20) 28%, transparent 58%), radial-gradient(ellipse at 82% 24%, rgba(142,116,169,0.38) 0%, rgba(105,82,137,0.18) 30%, transparent 58%), radial-gradient(ellipse at 64% 84%, rgba(139,103,139,0.30) 0%, rgba(95,70,112,0.14) 34%, transparent 62%), radial-gradient(ellipse at 50% 48%, rgba(205,194,207,0.16) 0%, transparent 48%), linear-gradient(135deg, #292136 0%, #40304F 38%, #2D2439 70%, #1B1921 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10%] -top-[22%] h-[88%] w-[68%] blur-[34px]"
        style={{ background: "radial-gradient(ellipse at center, rgba(214,197,225,0.24) 0%, rgba(181,154,199,0.10) 42%, transparent 72%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[12%] -top-[8%] h-[72%] w-[62%] blur-[38px]"
        style={{ background: "radial-gradient(ellipse at center, rgba(151,124,176,0.24) 0%, rgba(115,91,143,0.10) 44%, transparent 74%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[34%] left-[18%] h-[82%] w-[76%] blur-[42px]"
        style={{ background: "radial-gradient(ellipse at center, rgba(151,114,148,0.20) 0%, rgba(98,75,116,0.09) 46%, transparent 74%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.58'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />

      <div className="relative h-full px-4 py-5 sm:px-6 sm:py-6 lg:px-0 lg:py-0">
        <p className="absolute left-4 top-5 z-[5] text-[9px] font-semibold uppercase tracking-[0.13em] text-white/[0.52] sm:left-6 sm:top-6 lg:left-7 lg:top-6">
          RECRUITAI WORKFLOW
        </p>

        <RecruitAIWorkflowWindow />

        <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
          <RecruitAICapabilityPanel capability="resume" title="Resume intelligence" body="Resume parsed into structured candidate evidence" />
          <RecruitAICapabilityPanel capability="assessment" title="Assessment" body="Role-specific evaluation completed with evidence" />
          <RecruitAICapabilityPanel capability="interview" title="Interview" body="Scorecard and interviewer feedback collected" />
          <RecruitAICapabilityPanel capability="decision" title="Decision" body="Complete evidence ready for recruiter review" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[4] hidden lg:block">
          <div className="pointer-events-auto absolute left-[4px] top-[116px] w-[160px]">
            <RecruitAICapabilityPanel capability="resume" title="Resume intelligence" body="Resume parsed into structured candidate evidence" />
          </div>
          <div className="pointer-events-auto absolute right-[4px] top-[92px] w-[160px]">
            <RecruitAICapabilityPanel capability="assessment" title="Assessment" body="Role-specific evaluation completed with evidence" />
          </div>
          <div className="pointer-events-auto absolute bottom-[72px] left-[6px] w-[160px]">
            <RecruitAICapabilityPanel capability="interview" title="Interview" body="Scorecard and interviewer feedback collected" />
          </div>
          <div className="pointer-events-auto absolute bottom-[52px] right-[6px] w-[160px]">
            <RecruitAICapabilityPanel capability="decision" title="Decision" body="Complete evidence ready for recruiter review" />
          </div>
        </div>
      </div>
    </div>
  );
}

type ProductCardVariant = "resume" | "pipper" | "universal" | "crawl";

function ProductVisualBackground({ variant }: { variant: ProductCardVariant }) {
  if (variant === "resume") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#1D62D7]">
        <GrowXCrawlRibbonCanvas />
      </div>
    );
  }

  if (variant === "pipper") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#223A70]">
        <PipperBloomCanvas />
      </div>
    );
  }

  if (variant === "universal") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#0B1220]">
        <UniversalAIRibbonCanvas />
      </div>
    );
  }

  if (variant === "crawl") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#123A6B]">
        <ResumeForgeAIPulseBarsCanvas />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E5E3DC]">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 360 480" preserveAspectRatio="none">
        <path d="M0 0 H360 V148 C270 132 196 165 0 228 Z" fill="#FFFFFF" opacity="0.55" />
        <path d="M360 92 C280 134 202 193 0 286 L0 340 C185 262 276 224 360 190 Z" fill="#8E897E" opacity="0.12" />
        <path d="M360 254 C260 268 160 343 0 410" fill="none" stroke="#6F6A61" strokeWidth="1" opacity="0.46" />
        <path d="M360 274 C258 290 163 360 0 430" fill="none" stroke="#A27E5B" strokeWidth="1.5" opacity="0.34" />
        <path d="M64 0 V480 M128 0 V480 M192 0 V480 M256 0 V480" stroke="#74716A" strokeWidth="0.7" opacity="0.18" />
        <path d="M0 94 H360 M0 188 H360 M0 282 H360 M0 376 H360" stroke="#74716A" strokeWidth="0.7" opacity="0.14" />
      </svg>
    </div>
  );
}

type ProductCardProps = {
  name: string;
  category: string;
  statement: string;
  href: string;
  image: string;
  imageAlt: string;
  imageAspect: string;
  variant: ProductCardVariant;
  tone: "light" | "dark";
  isExternal: boolean;
};

function ProductCard({
  name,
  category,
  statement,
  href,
  image,
  imageAlt,
  imageAspect,
  variant,
  tone,
  isExternal,
}: ProductCardProps) {
  const toneStyles = {
    "--product-foreground": tone === "dark" ? "#FFFFFF" : "#111111",
    "--product-muted": tone === "dark" ? "rgba(255,255,255,0.74)" : "rgba(17,17,17,0.62)",
    "--product-readability":
      tone === "dark"
        ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.2) 78%, rgba(0,0,0,0.45) 100%)"
        : "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.12) 78%, rgba(255,255,255,0.28) 100%)",
  } as React.CSSProperties;

  const card = (
    <div data-tone={tone} style={toneStyles} className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] bg-[#E5E3DC] text-[var(--product-foreground)]">
      <ProductVisualBackground variant={variant} />
      <div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: "var(--product-readability)" }} />

      <div
        className="absolute left-1/2 top-[20%] z-[4] w-[90%] overflow-hidden rounded-[7px] border border-white/[0.42] bg-black shadow-[0_30px_65px_rgba(20,10,40,0.24),0_10px_24px_rgba(20,10,40,0.14)]"
        style={{ transform: "translateX(-50%) perspective(1000px) rotateX(1deg) rotateY(-2deg)" }}
      >
        <div className="relative w-full" style={{ aspectRatio: imageAspect }}>
          <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(max-width: 360px) 90vw, 324px" />
        </div>
      </div>

      <div className="absolute left-[22px] top-[24px] z-[6] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--product-muted)]">
        {category}
      </div>
      <h2 className="absolute bottom-[58px] left-[22px] z-[7] text-[27px] font-bold leading-none tracking-[-0.035em] text-[var(--product-foreground)]">
        {name}
      </h2>
      <p className="absolute bottom-[22px] left-[22px] z-[7] max-w-[230px] text-[12px] font-normal leading-[1.4] text-[var(--product-muted)]">
        {statement}
      </p>
    </div>
  );

  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name}`}
      className="group block w-full max-w-[360px] cursor-pointer rounded-[12px] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      {card}
    </a>
  ) : (
    <Link
      href={href}
      aria-label={`Open ${name}`}
      className="group block w-full max-w-[360px] cursor-pointer rounded-[12px] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      {card}
    </Link>
  );
}

function WideEditorialCtaCard() {
  return (
    <a
      href="/contact"
      aria-label="Start a conversation with GrowXLabs"
      className="group wide-cta-surface relative mx-auto mt-24 block h-[440px] w-full max-w-[1320px] overflow-hidden rounded-[12px] bg-[#101014] text-white transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0F0FB]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Layer 1: one full-bleed landscape surface, never a separate image column. */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landscape.jpg"
            alt=""
            fill
            sizes="(max-width: 1320px) 100vw, 1320px"
            className="object-cover object-center transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
          />
        </div>

        {/* Layer 2: controlled left scrim keeps the copy readable without hiding the subject. */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.90) 0%, rgba(5,5,5,0.70) 28%, rgba(5,5,5,0.22) 54%, rgba(5,5,5,0.04) 74%, transparent 100%)",
          }}
        />

        {/* Layers 3–5: direct editorial copy and one primary GrowxLabs action. */}
        <div className="absolute left-9 top-10 z-[2] max-w-[540px] sm:left-10 sm:top-11 md:left-11">
          <h2 className="max-w-[540px] font-sans text-[clamp(40px,4vw,48px)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
            Ready to build what&apos;s next?
          </h2>
          <p className="mt-5 text-base leading-[1.4] text-white/75">Let&apos;s make it happen.</p>
          <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] bg-[#0075DE] px-[22px] text-sm font-semibold text-white shadow-sm transition-colors duration-200 group-hover:bg-[#005BAB]">
            Book a Strategy Call
            <span aria-hidden="true" className="text-base leading-none">↗</span>
          </span>
        </div>

        {/* Layer 7: quiet brand signature, not a second headline or action. */}
        <span className="absolute bottom-[22px] right-[26px] z-[2] text-[15px] font-semibold tracking-[-0.02em] text-white">
          growxlabs.tech
        </span>
      </div>
    </a>
  );
}

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Products"
        viewingText="PRODUCTS"
        exploreText="PLATFORMS"
        tagline="OWN PRODUCTS"
      />

      <div className="w-full bg-background pb-32 pt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          
          {/* Stacked Product Showcase Rows as independent floating editorial sheets */}
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {PRODUCTS.map((product) => {
              if (product.name === "RecruitAI™") {
                return (
                  <div
                    key={product.name}
                    className="grid w-full max-w-[1268px] grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start xl:gap-7"
                  >
                    <RecruitAIArtworkCard href={product.href} />
                    <RecruitAIIntelligenceCard />
                  </div>
                );
              }

              if (product.name === "ResumeForgeAI™") {
                return (
                  <ProductCard
                    key={product.name}
                    name="ResumeForgeAI"
                    category="AI-NATIVE CAREER PLATFORM"
                    statement="Build, refine and adapt your career profile with intelligence."
                    href={product.href}
                    image="/images/products/resumeforgeai.png"
                    imageAlt="ResumeForgeAI career platform interface"
                    imageAspect="16 / 9"
                    variant="resume"
                    tone="light"
                    isExternal={product.isExternal}
                  />
                );
              }

              if (product.name === "Pipper™") {
                return (
                  <ProductCard
                    key={product.name}
                    name="Pipper"
                    category={product.label}
                    statement={product.subtext}
                    href={product.href}
                    image={product.image}
                    imageAlt="Pipper desktop workspace interface"
                    imageAspect="1024 / 659"
                    variant="pipper"
                    tone="dark"
                    isExternal={product.isExternal}
                  />
                );
              }

              if (product.name === "GrowX Crawl™") {
                return (
                  <ProductCard
                    key={product.name}
                    name="GrowX Crawl"
                    category="WEB INTELLIGENCE"
                    statement="Public web information turned into structured research."
                    href={product.href}
                    image="/portfolio/growx-crawl.svg"
                    imageAlt="GrowX Crawl local research runtime terminal"
                    imageAspect="1200 / 660"
                    variant="crawl"
                    tone="light"
                    isExternal={product.isExternal}
                  />
                );
              }

              if (product.name === "UniversalAI™") {
                return (
                  <ProductCard
                    key={product.name}
                    name="UniversalAI"
                    category={product.label}
                    statement={product.subtext}
                    href={product.href}
                    image={product.image}
                    imageAlt="UniversalAI model routing interface"
                    imageAspect="1024 / 682"
                    variant="universal"
                    tone="dark"
                    isExternal={product.isExternal}
                  />
                );
              }

              const LeftVisual = product.image ? (
                <div className="w-full bg-black border border-black min-h-[300px] sm:min-h-[340px] md:min-h-[380px] h-full relative overflow-hidden flex items-center justify-center">
                  {product.isSvg ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  )}
                </div>
              ) : (
                <div className="w-full bg-black border border-black p-8 sm:p-10 md:p-12 min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex flex-col justify-between text-center">
                  {/* Top Tag */}
                  <span className="font-mono text-[9.5px] sm:text-[10px] tracking-[0.25em] text-white/50 uppercase block">
                    {product.label}
                  </span>

                  {/* Giant Product Title */}
                  <h4 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white my-6">
                    {product.shortName}
                  </h4>

                  {/* Bottom Philosophy & Subtitle */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-[13px] text-white/80 font-sans">
                      {product.taglineLead}{" "}
                      <span className="font-bold text-[#C0F0FB]">
                        {product.taglineBold}
                      </span>
                    </p>
                    <p className="text-[10.5px] sm:text-xs text-white/40 font-sans">
                      {product.subtext}
                    </p>
                  </div>
                </div>
              );

              const PanelInner = (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
                  {/* LEFT SIDE: Visual Artwork / Image (Flat inside panel) */}
                  <div className="lg:col-span-6 w-full h-full">
                    {LeftVisual}
                  </div>

                  {/* RIGHT SIDE: Product Name + Editorial Description */}
                  <div className="lg:col-span-6 space-y-5">
                    <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-[40px] text-black tracking-tight leading-tight">
                      {product.name}
                    </h2>

                    <p className="text-black/80 text-sm sm:text-base md:text-[16.5px] leading-relaxed font-sans font-medium">
                      {product.description}
                    </p>
                  </div>
                </div>
              );

              return product.isExternal ? (
                <a
                  key={product.name}
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-black/15 bg-[#C0F0FB] p-6 sm:p-8 md:p-10 lg:p-12 text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer"
                >
                  {PanelInner}
                </a>
              ) : (
                <Link
                  key={product.name}
                  href={product.href}
                  className="block border border-black/15 bg-[#C0F0FB] p-6 sm:p-8 md:p-10 lg:p-12 text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer"
                >
                  {PanelInner}
                </Link>
              );
            })}
          </div>

          <WideEditorialCtaCard />

          {/* End of Products Separator & Count */}
          <div className="mt-20 sm:mt-24 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-widest">
              <span>{"// End of Products"}</span>
              <span>{PRODUCTS.length} Products</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
