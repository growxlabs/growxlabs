"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Download, Edit3, ImageIcon, Plus, Trash2, 
  Palette, Play, Pause, RotateCw, Info, Check, ArrowRight, AlertCircle, Video, Camera, Share2
} from "@/components/editor/icons/StudioIcons";
import { toast } from "sonner";
import { SelfRecordedVideoStudio } from "@/components/editor/reels/SelfRecordedVideoStudio";
import { ReelsDistributionModal } from "@/components/editor/reels/ReelsDistributionModal";

interface Scene {
  sceneNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  svgCode: string;
  duration: number;
}

export function ReelsGeneratorClient() {
  // Studio Mode: Self-Recorded Video Studio vs AI Storyboard Generator
  const [studioMode, setStudioMode] = useState<"self-recorded" | "ai-storyboard">("self-recorded");
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);

  // Content state
  const [topic, setTopic] = useState("Explain how Rapido uses the same OTP for rides");
  const [tone, setTone] = useState<"Hype" | "Professional" | "Casual" | "Technical" | "Minimalist">("Technical");
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState<Scene[]>([
    {
      sceneNumber: 1,
      title: "Why Rapido Uses The Same OTP",
      content: "Most ride apps change OTPs every ride. Rapido does something completely different.",
      imagePrompt: "Vector illustration of a smartphone screen showing OTP verification code 9999, clean tech graphic",
      svgCode: `<svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id="phoneGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#39ff14" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        <rect x="100" y="50" width="200" height="300" rx="30" fill="url(#phoneGlow)" stroke="#39ff14" stroke-width="4"/>
        <rect x="120" y="100" width="160" height="80" rx="10" fill="#18212c" stroke="#39ff14" stroke-width="1.5"/>
        <text x="200" y="145" fill="#39ff14" font-family="monospace" font-size="28" font-weight="bold" text-anchor="middle">OTP: 5555</text>
        <circle cx="200" cy="325" r="15" fill="none" stroke="#39ff14" stroke-width="2"/>
      </svg>`,
      duration: 5
    },
    {
      sceneNumber: 2,
      title: "The Common Standard",
      content: "Usually, booking systems request new dynamic OTPs to verify riders and prevent spoofing.",
      imagePrompt: "Abstract flow chart showing server sending different OTP keys to riders, dark terminal visual style",
      svgCode: `<svg viewBox="0 0 400 400" width="100%" height="100%">
        <path d="M 50 200 L 150 200 M 250 200 L 350 200" stroke="#8892b0" stroke-width="3" stroke-dasharray="8 4"/>
        <rect x="150" y="160" width="100" height="80" rx="10" fill="#18212c" stroke="#8892b0" stroke-width="2"/>
        <text x="200" y="205" fill="#8892b0" font-family="monospace" font-size="14" text-anchor="middle">OTP GENERATOR</text>
      </svg>`,
      duration: 5
    },
    {
      sceneNumber: 3,
      title: "Rapido's Static Bypass",
      content: "By keeping the OTP constant, Rapido bypasses SMS delivery latency and saves carrier costs.",
      imagePrompt: "Minimal network database server sending speed lanes directly to mobile devices, speed vectors, glowing green",
      svgCode: `<svg viewBox="0 0 400 400" width="100%" height="100%">
        <rect x="50" y="120" width="300" height="160" rx="20" fill="none" stroke="#39ff14" stroke-dasharray="10 5" stroke-width="2"/>
        <circle cx="120" cy="200" r="30" fill="#18212c" stroke="#39ff14" stroke-width="3"/>
        <circle cx="280" cy="200" r="30" fill="#18212c" stroke="#39ff14" stroke-width="3"/>
        <path d="M 150 200 L 250 200" stroke="#39ff14" stroke-width="4"/>
        <text x="200" y="185" fill="#39ff14" font-family="monospace" font-size="16" text-anchor="middle">FAST SYNC</text>
      </svg>`,
      duration: 5
    },
    {
      sceneNumber: 4,
      title: "Is it Secure?",
      content: "They rely on background GPS matching. The ride only starts if both devices are side-by-side.",
      imagePrompt: "Smartphone interface displaying maps with proximity nodes connecting together, minimal tech interface",
      svgCode: `<svg viewBox="0 0 400 400" width="100%" height="100%">
        <circle cx="200" cy="200" r="120" fill="none" stroke="#39ff14" stroke-opacity="0.2" stroke-width="2"/>
        <circle cx="200" cy="200" r="80" fill="none" stroke="#39ff14" stroke-opacity="0.4" stroke-width="2"/>
        <circle cx="160" cy="180" r="10" fill="#39ff14"/>
        <circle cx="240" cy="220" r="10" fill="#39ff14"/>
        <path d="M 160 180 Q 200 200 240 220" fill="none" stroke="#39ff14" stroke-width="2" stroke-dasharray="4"/>
      </svg>`,
      duration: 5
    },
    {
      sceneNumber: 5,
      title: "Save For Later",
      content: "Follow for more product breakdowns and architectural systems analysis.",
      imagePrompt: "Tech logo card displaying profile details, save icon glowing neon border, sleek dark card",
      svgCode: `<svg viewBox="0 0 400 400" width="100%" height="100%">
        <rect x="80" y="80" width="240" height="240" rx="20" fill="#090c0f" stroke="#39ff14" stroke-width="3"/>
        <path d="M 170 140 L 230 140 L 230 240 L 200 220 L 170 240 Z" fill="#39ff14"/>
        <text x="200" y="280" fill="#39ff14" font-family="monospace" font-size="16" text-anchor="middle">FOLLOW FOR MORE</text>
      </svg>`,
      duration: 5
    }
  ]);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  // Styling state
  const [themePreset, setThemePreset] = useState<"cyberpunk" | "cream" | "sunset" | "terminal" | "glass" | "emerald" | "minimal" | "gold">("terminal");
  const [visualMode, setVisualMode] = useState<"svg" | "image">("image");
  const [brandName, setBrandName] = useState("GrowXLabs");
  const [instagramHandle, setInstagramHandle] = useState("@growxlabs.tech");

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Cumulative time in ms
  const [activeIndex, setActiveIndex] = useState(0); // Current active scene index
  const [sceneElapsedTime, setSceneElapsedTime] = useState(0); // Ms elapsed in current scene

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Auto-calculated timelines
  const getTimeline = () => {
    let cumulative = 0;
    return scenes.map((scene) => {
      const start = cumulative;
      const end = cumulative + (scene.duration * 1000);
      cumulative = end;
      return { ...scene, start, end };
    });
  };

  const timeline = getTimeline();
  const totalDurationMs = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;

  // Active scene selection
  const activeScene = scenes[activeIndex] || scenes[0] || {
    title: "",
    content: "",
    imagePrompt: "",
    svgCode: "",
    duration: 5
  };

  // Synchronize playback timeline
  useEffect(() => {
    // Find active scene based on currentTime
    const foundIndex = timeline.findIndex(
      (s) => currentTime >= s.start && currentTime < s.end
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
      setSceneElapsedTime(currentTime - timeline[foundIndex].start);
    } else if (currentTime >= totalDurationMs && totalDurationMs > 0) {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveIndex(0);
      setSceneElapsedTime(0);
    }
  }, [currentTime, totalDurationMs]);

  // Playback Timer loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDurationMs) {
          setIsPlaying(false);
          return totalDurationMs;
        }
        return next;
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, totalDurationMs]);

  // API Call to Generate Reels Content
  const handleGenerateReel = async () => {
    setIsGenerating(true);
    setStreamBuffer("");
    const apiToast = toast.loading("Connecting to Gemini 2.5 Flash...");

    try {
      const response = await fetch("/api/generate-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, sceneCount })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate: ${response.statusText}`);
      }

      toast.loading("Compiling Reels timeline...", { id: apiToast });
      
      let reader = null;
      try {
        reader = response.body ? response.body.getReader() : null;
      } catch (err) {
        console.warn("Streaming reader not available for Reels, falling back to full text reading:", err);
      }

      if (!reader) {
        const text = await response.text();
        setStreamBuffer(text);
        const finalJson = JSON.parse(text);
        if (finalJson.scenes && Array.isArray(finalJson.scenes)) {
          setScenes(finalJson.scenes);
          if (finalJson.themeSuggestion) {
            setThemePreset(finalJson.themeSuggestion.toLowerCase() as any);
          }
          setCurrentTime(0);
          setIsPlaying(false);
          toast.success("Reels content generated successfully!", { id: apiToast });
        } else {
          throw new Error("Invalid format received from server");
        }
      } else {
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          buffer += textChunk;
          setStreamBuffer(buffer);
        }

        // Final parse
        const finalJson = JSON.parse(buffer);
        if (finalJson.scenes && Array.isArray(finalJson.scenes)) {
          setScenes(finalJson.scenes);
          if (finalJson.themeSuggestion) {
            setThemePreset(finalJson.themeSuggestion.toLowerCase() as any);
          }
          setCurrentTime(0);
          setIsPlaying(false);
          toast.success("Reels content generated successfully!", { id: apiToast });
        } else {
          throw new Error("Invalid format received from server");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to compile Reels timeline.", { id: apiToast });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get active styling configs
  const getThemeColors = () => {
    switch (themePreset) {
      case "cyberpunk":
        return {
          bg: "#05050a",
          bgImage: "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.25) 0%, transparent 60%)",
          brandColor: "#06b6d4",
          accentColor: "#9333ea",
          titleColor: "#06b6d4",
          textColor: "#ffffff",
          textHighlightColor: "#39ff14", // Neon Green caption pop
          cardBg: "rgba(10,10,20,0.6)"
        };
      case "cream":
        return {
          bg: "#F9F6F0",
          bgImage: "none",
          brandColor: "#5c554c",
          accentColor: "#8c8273",
          titleColor: "#1c1a17",
          textColor: "#5c554c",
          textHighlightColor: "#8c8273",
          cardBg: "#f2ede4"
        };
      case "sunset":
        return {
          bg: "#1a0b2e",
          bgImage: "linear-gradient(to bottom, #FF512F 0%, #DD2476 100%)",
          brandColor: "#ffffff",
          accentColor: "#ffffff",
          titleColor: "#ffffff",
          textColor: "#ffffff",
          textHighlightColor: "#ffecd2",
          cardBg: "rgba(255,255,255,0.06)"
        };
      case "terminal":
      default:
        return {
          bg: "#090c0f",
          bgImage: "linear-gradient(rgba(24, 33, 44, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(24, 33, 44, 0.4) 1px, transparent 1px)",
          brandColor: "#39ff14",
          accentColor: "#8892b0",
          titleColor: "#39ff14",
          textColor: "#a8b2d1",
          textHighlightColor: "#ffffff",
          cardBg: "#18212c"
        };
      case "glass":
        return {
          bg: "#03001e",
          bgImage: "radial-gradient(circle at 50% 50%, #4a0072 0%, #03001e 85%)",
          brandColor: "#a5f3fc",
          accentColor: "#c084fc",
          titleColor: "#ffffff",
          textColor: "#e2e8f0",
          textHighlightColor: "#39ff14",
          cardBg: "rgba(255,255,255,0.05)"
        };
      case "emerald":
        return {
          bg: "#041611",
          bgImage: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          brandColor: "#10b981",
          accentColor: "#34d399",
          titleColor: "#10b981",
          textColor: "#e2e8f0",
          textHighlightColor: "#34d399",
          cardBg: "rgba(10,30,25,0.6)"
        };
      case "minimal":
        return {
          bg: "#ffffff",
          bgImage: "none",
          brandColor: "#0a0a0a",
          accentColor: "#404040",
          titleColor: "#0a0a0a",
          textColor: "#404040",
          textHighlightColor: "#000000",
          cardBg: "#f5f5f5"
        };
      case "gold":
        return {
          bg: "#0a0907",
          bgImage: "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)",
          brandColor: "#d4af37",
          accentColor: "#f59e0b",
          titleColor: "#d4af37",
          textColor: "#f3f4f6",
          textHighlightColor: "#ffffff",
          cardBg: "#1a1610"
        };
    }
  };

  const themeColors = getThemeColors();

  // Word-by-word Caption Calculation
  const renderWordCaptions = () => {
    if (!activeScene.content) return null;
    const words = activeScene.content.split(" ");
    const totalWords = words.length;
    const durationMs = activeScene.duration * 1000;
    const msPerWord = durationMs / totalWords;
    const activeWordIndex = Math.floor(sceneElapsedTime / msPerWord);

    // Group words into phrases of 4 words
    const chunkSize = 4;
    const chunks: string[][] = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize));
    }

    const activeChunkIndex = Math.floor(activeWordIndex / chunkSize);
    const currentChunk = chunks[activeChunkIndex] || chunks[chunks.length - 1] || [];
    const localActiveIndex = activeWordIndex % chunkSize;

    const getActiveColor = () => {
      switch (themePreset) {
        case "cyberpunk": return "#00ffff"; // Neon Cyan
        case "terminal": return "#39ff14"; // Neon Green
        case "sunset": return "#ffff00"; // Neon Yellow
        case "glass": return "#00ffff"; // Neon Cyan
        case "emerald": return "#34d399"; // Emerald Glow
        case "cream": return "#5c554c"; // Dark Cream Accent
        case "minimal": return "#ffffff"; // Stark White
        case "gold": return "#f59e0b"; // Golden Amber
        default: return "#ffff00";
      }
    };

    const getInactiveColor = () => {
      return themePreset === "cream" ? "rgba(92, 85, 76, 0.5)" : "rgba(255, 255, 255, 0.4)";
    };

    const activeColor = getActiveColor();
    const inactiveColor = getInactiveColor();

    return (
      <div 
        key={activeChunkIndex} // Force re-mount on new phrase to trigger the slideInUp animation
        className="flex flex-wrap justify-center text-center px-4 leading-none"
        style={{
          animation: "slideInUp 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
        }}
      >
        {currentChunk.map((word, index) => {
          const isLocalActive = index === localActiveIndex;
          return (
            <span
              key={index}
              className="inline-block mx-1.5 text-xl font-black uppercase tracking-tight italic select-none"
              style={{
                color: isLocalActive ? activeColor : inactiveColor,
                textShadow: isLocalActive 
                  ? `0 0 12px ${activeColor}90, 0 2px 4px rgba(0,0,0,0.9)` 
                  : "0 1px 3px rgba(0,0,0,0.8)",
                transform: isLocalActive ? "scale(1.18) translateY(-2px)" : "scale(1.0) translateY(0)",
                transition: "all 0.1s ease-out"
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  // Modify active scene details
  const updateActiveScene = (updatedFields: Partial<Scene>) => {
    const updatedScenes = [...scenes];
    updatedScenes[activeIndex] = { ...activeScene, ...updatedFields };
    setScenes(updatedScenes);
  };

  const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const getProxyImageUrl = (src: string) => {
    if (src.startsWith("data:")) return src;
    return `/api/proxy-image?url=${encodeURIComponent(src)}`;
  };

  const loadSvgAsImage = (svgCode: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to parse vector SVG as image layout."));
      };
      img.src = url;
    });
  };

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const getThemeTitleColor = () => {
    switch (themePreset) {
      case "cyberpunk": return "#06b6d4";
      case "terminal": return "#39ff14";
      case "sunset": return "#ffffff";
      case "glass": return "#ffffff";
      case "cream": return "#1c1a17";
      case "emerald": return "#10b981";
      case "minimal": return "#ffffff";
      case "gold": return "#d4af37";
      default: return "#ffffff";
    }
  };

  const getActiveThemeColor = () => {
    switch (themePreset) {
      case "cyberpunk": return "#00ffff";
      case "terminal": return "#39ff14";
      case "sunset": return "#ffff00";
      case "glass": return "#00ffff";
      case "emerald": return "#34d399";
      case "cream": return "#5c554c";
      case "minimal": return "#ffffff";
      case "gold": return "#f59e0b";
      default: return "#ffff00";
    }
  };

  const drawCanvasBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, timeMs: number) => {
    switch (themePreset) {
      case "cyberpunk": {
        const cycle = (timeMs / 4000) * Math.PI * 2;
        ctx.fillStyle = "#05050a";
        ctx.fillRect(0, 0, width, height);

        const gradient1 = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, 400 + Math.sin(cycle) * 30
        );
        gradient1.addColorStop(0, "rgba(6, 182, 212, 0.15)");
        gradient1.addColorStop(1, "transparent");
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, width, height);

        const gradient2 = ctx.createRadialGradient(
          width, height, 0,
          width, height, 500
        );
        gradient2.addColorStop(0, "rgba(147, 51, 234, 0.15)");
        gradient2.addColorStop(1, "transparent");
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
        ctx.lineWidth = 1.5;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      }
      case "sunset": {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        const color1 = hexToRgb("#FF512F");
        const color2 = hexToRgb("#DD2476");
        grad.addColorStop(0, `rgb(${color1.r}, ${color1.g}, ${color1.b})`);
        grad.addColorStop(0.5, "rgb(255, 126, 95)");
        grad.addColorStop(1, `rgb(${color2.r}, ${color2.g}, ${color2.b})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "glass": {
        ctx.fillStyle = "#03001e";
        ctx.fillRect(0, 0, width, height);

        const cycle = (timeMs / 8000) * Math.PI * 2;
        const ox1 = width / 2 + Math.cos(cycle) * 100;
        const oy1 = height / 3 + Math.sin(cycle) * 100;
        const grad1 = ctx.createRadialGradient(ox1, oy1, 0, ox1, oy1, 350);
        grad1.addColorStop(0, "rgba(74, 0, 114, 0.25)");
        grad1.addColorStop(1, "transparent");
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const ox2 = width / 2 + Math.sin(cycle + Math.PI) * 100;
        const oy2 = height * 0.6 + Math.cos(cycle + Math.PI) * 100;
        const grad2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, 350);
        grad2.addColorStop(0, "rgba(221, 36, 118, 0.15)");
        grad2.addColorStop(1, "transparent");
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "terminal":
      default: {
        ctx.fillStyle = "#06080b";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(57, 255, 20, 0.04)";
        ctx.lineWidth = 1;
        const size = 50;
        for (let x = 0; x < width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += size) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        const scanY = (timeMs / 4000 * height) % height;
        ctx.fillStyle = "rgba(57, 255, 20, 0.03)";
        ctx.fillRect(0, scanY, width, 4);
        break;
      }
      case "cream": {
        ctx.fillStyle = "#F9F6F0";
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "emerald": {
        ctx.fillStyle = "#041611";
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "minimal": {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "gold": {
        ctx.fillStyle = "#090806";
        ctx.fillRect(0, 0, width, height);
        break;
      }
    }
  };

  const drawCanvasHeader = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const headerY = height * 0.08;
    const avatarX = width * 0.12;

    const avatarColor = getThemeTitleColor();
    ctx.fillStyle = avatarColor;
    ctx.beginPath();
    ctx.arc(avatarX, headerY, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = themePreset === "cream" ? "#ffffff" : "#000000";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(brandName[0] || "G", avatarX, headerY);

    ctx.fillStyle = getThemeTitleColor();
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(brandName, avatarX + 36, headerY);

    ctx.fillStyle = getThemeTitleColor();
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(instagramHandle, width * 0.88, headerY);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, headerY + 45);
    ctx.lineTo(width * 0.9, headerY + 45);
    ctx.stroke();
  };

  const drawCanvasFooter = (ctx: CanvasRenderingContext2D, width: number, height: number, activeIdx: number) => {
    const footerY = height * 0.92;
    const color = getThemeTitleColor();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, footerY - 25);
    ctx.lineTo(width * 0.9, footerY - 25);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const text = activeIdx === scenes.length - 1 ? "SAVE THIS POST" : "SWIPE LEFT ➔";
    ctx.fillText(text, width * 0.12, footerY);

    ctx.fillStyle = color;
    ctx.font = "bold italic 22px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const pages = `${String(activeIdx + 1).padStart(2, "0")}/${String(scenes.length).padStart(2, "0")}`;
    ctx.fillText(pages, width * 0.88, footerY);
  };

  const drawCanvasProgressBar = (ctx: CanvasRenderingContext2D, width: number, height: number, timeMs: number, timeline: any[]) => {
    const barY = height * 0.03;
    const barHeight = 6;
    const paddingX = width * 0.08;
    const totalBarsWidth = width * 0.84;
    const gap = 6;
    const numBars = timeline.length;
    const barWidth = (totalBarsWidth - gap * (numBars - 1)) / numBars;

    timeline.forEach((scene, index) => {
      const startX = paddingX + index * (barWidth + gap);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(startX, barY, barWidth, barHeight, 3);
      ctx.fill();

      let fillPercent = 0;
      if (timeMs >= scene.end) {
        fillPercent = 1.0;
      } else if (timeMs > scene.start && timeMs < scene.end) {
        fillPercent = (timeMs - scene.start) / (scene.end - scene.start);
      }

      if (fillPercent > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(startX, barY, barWidth * fillPercent, barHeight, 3);
        ctx.fill();
      }
    });
  };

  const drawReelFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeMs: number,
    preloadedImages: Record<number, HTMLImageElement>
  ) => {
    ctx.clearRect(0, 0, width, height);

    drawCanvasBackground(ctx, width, height, timeMs);

    const timeline = getTimeline();
    const activeIdx = timeline.findIndex((s) => timeMs >= s.start && timeMs < s.end);
    const sceneIdx = activeIdx !== -1 ? activeIdx : timeline.length - 1;
    const scene = scenes[sceneIdx];
    if (!scene) return;

    const sceneElapsedTime = timeMs - (timeline[sceneIdx]?.start || 0);
    const sceneDurationMs = scene.duration * 1000;

    drawCanvasHeader(ctx, width, height);

    const imgWidth = 400;
    const imgHeight = 400;
    const imgX = (width - imgWidth) / 2;
    const imgY = height * 0.28;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgWidth, imgHeight, 32);
    ctx.clip();

    if (visualMode === "svg") {
      const svgImg = preloadedImages[sceneIdx];
      if (svgImg) {
        ctx.drawImage(svgImg, imgX, imgY, imgWidth, imgHeight);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
      }
    } else {
      const img = preloadedImages[sceneIdx];
      if (img) {
        const scale = 1.0 + 0.08 * (sceneElapsedTime / sceneDurationMs);
        const sw = img.width / scale;
        const sh = img.height / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgWidth, imgHeight);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
      }
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgWidth, imgHeight, 32);
    ctx.stroke();

    ctx.fillStyle = getThemeTitleColor();
    ctx.font = "bold italic uppercase 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(scene.title, width / 2, height * 0.65);

    if (scene.content) {
      const words = scene.content.split(" ");
      const totalWords = words.length;
      const msPerWord = sceneDurationMs / totalWords;
      const activeWordIndex = Math.floor(sceneElapsedTime / msPerWord);

      const chunkSize = 4;
      const chunks: string[][] = [];
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize));
      }

      const activeChunkIdx = Math.floor(activeWordIndex / chunkSize);
      const currentChunk = chunks[activeChunkIdx] || chunks[chunks.length - 1] || [];
      const localActiveIdx = activeWordIndex % chunkSize;

      const activeColor = getActiveThemeColor();
      const inactiveColor = "rgba(255,255,255,0.5)";

      ctx.font = "black italic uppercase 42px sans-serif";
      ctx.textAlign = "center";
      
      let totalChunkWidth = 0;
      const wordSpacing = 16;
      
      const wordWidths = currentChunk.map(w => ctx.measureText(w).width);
      totalChunkWidth = wordWidths.reduce((a, b) => a + b, 0) + wordSpacing * (currentChunk.length - 1);

      let currentX = (width - totalChunkWidth) / 2;
      const textY = height * 0.73;

      currentChunk.forEach((word, wIdx) => {
        const isWordActive = wIdx === localActiveIdx;
        ctx.fillStyle = isWordActive ? activeColor : inactiveColor;
        
        ctx.save();
        if (isWordActive) {
          ctx.shadowColor = activeColor;
          ctx.shadowBlur = 15;
          ctx.font = "black italic uppercase 46px sans-serif";
        }
        ctx.fillText(word, currentX + wordWidths[wIdx]/2, textY);
        ctx.restore();
        
        currentX += wordWidths[wIdx] + wordSpacing;
      });
    }

    drawCanvasFooter(ctx, width, height, sceneIdx);

    drawCanvasProgressBar(ctx, width, height, timeMs, timeline);
  };

  const handleExportVideo = async () => {
    if (scenes.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);

    const timeline = getTimeline();
    const durationMs = totalDurationMs;
    const preloadedImages: Record<number, HTMLImageElement> = {};

    const preloadToast = toast.loading("Preloading scene assets...");
    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setExportProgress(Math.round((i / scenes.length) * 30));

        if (visualMode === "svg") {
          const svgImg = await loadSvgAsImage(scene.svgCode);
          preloadedImages[i] = svgImg;
        } else {
          const src = `https://image.pollinations.ai/prompt/${encodeURIComponent(scene.imagePrompt)}?width=500&height=500&nologo=true&model=flux`;
          const proxyUrl = getProxyImageUrl(src);
          const img = await preloadImage(proxyUrl);
          preloadedImages[i] = img;
        }
      }
      toast.success("Scene assets preloaded successfully!", { id: preloadToast });
    } catch (e) {
      console.error(e);
      toast.error("Failed to preload visual assets for video generation.", { id: preloadToast });
      setIsExporting(false);
      return;
    }

    const compileToast = toast.loading("Compiling high-resolution MP4 video frames...");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D context");

      const fps = 30;
      const stream = canvas.captureStream(fps);
      
      let options: MediaRecorderOptions = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = { mimeType: "video/webm" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = { mimeType: "video/mp4" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options = {};
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const mimeType = (chunks.length > 0 && chunks[0] && chunks[0].type) ? chunks[0].type : (options.mimeType || "video/mp4");
          const fileBlob = new Blob(chunks, { type: mimeType });
          const downloadUrl = URL.createObjectURL(fileBlob);
          
          const a = document.createElement("a");
          a.href = downloadUrl;
          const ext = mimeType.includes("webm") ? "webm" : "mp4";
          a.download = `growxlabs-reel-${Date.now()}.${ext}`;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
            URL.revokeObjectURL(downloadUrl);
          }, 2000);

          toast.success("Video compiled and downloaded successfully!", { id: compileToast });
        } catch (err: any) {
          console.error("Video export save error:", err);
          toast.error("Failed to save exported video.", { id: compileToast });
        } finally {
          setIsExporting(false);
        }
      };

      // Start recording with 100ms timeslice buffer
      recorder.start(100);

      let timeElapsed = 0;
      const frameDuration = 1000 / fps;

      const recordFrame = () => {
        if (timeElapsed >= durationMs) {
          setTimeout(() => {
            if (recorder.state !== "inactive") {
              recorder.stop();
            }
          }, 200);
          return;
        }

        drawReelFrame(ctx, canvas.width, canvas.height, timeElapsed, preloadedImages);

        const progress = 30 + Math.round((timeElapsed / durationMs) * 70);
        setExportProgress(progress);

        timeElapsed += frameDuration;
        setTimeout(recordFrame, 0);
      };

      recordFrame();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to compile video.", { id: compileToast });
      setIsExporting(false);
    }
  };

  // Export static high-res files (ZIP / SVGs)
  const handleDownloadSVG = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([activeScene.svgCode], { type: "image/svg+xml" });
      element.href = URL.createObjectURL(file);
      element.download = `reel-scene-${activeIndex + 1}.svg`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Scene ${activeIndex + 1} SVG downloaded.`);
    } catch (e) {
      toast.error("Failed to export SVG.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Studio Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 bg-[#17171a] border border-[#2b2b30] rounded-2xl shadow-sm">
        <div className="flex flex-wrap bg-[#101012] p-1 rounded-xl border border-[#26262a] gap-1">
          <button
            type="button"
            onClick={() => setStudioMode("self-recorded")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              studioMode === "self-recorded"
                ? "bg-[#27272e] text-white shadow-sm border border-[#3c3c46]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Camera size={14} className="text-rose-400" />
            <span>Self-Recorded Video Studio</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
              No CapCut Needed
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode("ai-storyboard")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              studioMode === "ai-storyboard"
                ? "bg-[#27272e] text-white shadow-sm border border-[#3c3c46]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>AI Storyboard & Graphic Reel</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button
            type="button"
            onClick={() => setIsDistributeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1687f8] to-[#1376dc] hover:from-[#1376dc] hover:to-[#0f60b4] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={13} />
            <span>Distribute Channels</span>
          </button>
          <span className="hidden md:inline text-xs text-neutral-400 font-mono">
            9:16 Vertical
          </span>
        </div>
      </div>

      {studioMode === "self-recorded" ? (
        <SelfRecordedVideoStudio
          initialTopic={topic}
          initialScript={scenes.map((s) => s.content).join(" ")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liquidFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes driftOrb1 {
          0% { transform: translate(-20px, -20px) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.15); }
          100% { transform: translate(-20px, -20px) scale(1); }
        }
        @keyframes driftOrb2 {
          0% { transform: translate(20px, 30px) scale(1.1); }
          50% { transform: translate(-20px, -20px) scale(0.9); }
          100% { transform: translate(20px, 30px) scale(1.1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes neonPulse {
          0% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.05); }
          100% { opacity: 0.25; transform: scale(1); }
        }
        @keyframes kenburns {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.12) translate(0.5%, 0.5%); }
          100% { transform: scale(1.0); }
        }
        @keyframes slideInUp {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}} />
      
      {/* Settings Panel (Left 7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Step 1: AI Prompt Input */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Generate Reel Timeline</h3>
              <p className="text-xs text-neutral-500">Provide your topic and let Gemini create a playable Reels storyboard.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Topic / Core Theme</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-24 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                placeholder="e.g. Stop using static variables in Java..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-semibold"
                >
                  <option value="Hype">Hype (Energetic & Punchy)</option>
                  <option value="Professional">Professional (Educational)</option>
                  <option value="Casual">Casual (Friendly)</option>
                  <option value="Technical">Technical (Detailed Systems)</option>
                  <option value="Minimalist">Minimalist (Stark Ideas)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Scene Count</label>
                <select
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-semibold"
                >
                  <option value="3">3 Scenes (Short)</option>
                  <option value="5">5 Scenes (Standard)</option>
                  <option value="7">7 Scenes (Long)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateReel}
              disabled={isGenerating}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  Generating via Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Compile with Gemini 2.5 Flash
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Streaming Widget */}
        {isGenerating && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Streaming Tokens</span>
            </div>
            <div className="w-full h-24 bg-neutral-950 border border-neutral-900 rounded-xl p-3 font-mono text-[10px] text-primary overflow-y-auto custom-scrollbar">
              {streamBuffer || "Waiting for first token..."}
            </div>
          </div>
        )}

        {/* Step 2: Scene Editor */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Active Scene ({activeIndex + 1}/{scenes.length})</h3>
              <p className="text-xs text-neutral-500">Fine-tune the scripts, durations, image prompts, or vector code.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Scene Title</label>
              <input
                type="text"
                value={activeScene.title}
                onChange={(e) => updateActiveScene({ title: e.target.value })}
                className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Caption Content (Spoken Script)</label>
                <textarea
                  value={activeScene.content}
                  onChange={(e) => updateActiveScene({ content: e.target.value })}
                  className="w-full h-24 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Descriptive Image Prompt</label>
                <textarea
                  value={activeScene.imagePrompt}
                  onChange={(e) => updateActiveScene({ imagePrompt: e.target.value })}
                  className="w-full h-24 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Display Duration (Seconds)</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={activeScene.duration}
                  onChange={(e) => updateActiveScene({ duration: Number(e.target.value) })}
                  className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Visual Styling theme</label>
                <select
                  value={themePreset}
                  onChange={(e) => setThemePreset(e.target.value as any)}
                  className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-semibold"
                >
                  <option value="cyberpunk">Cyberpunk Neon</option>
                  <option value="cream">Cream Aesthetics</option>
                  <option value="sunset">Sunset Gradient</option>
                  <option value="terminal">Terminal Code</option>
                  <option value="glass">Glassmorphic Glow</option>
                  <option value="emerald">Emerald Clean Energy</option>
                  <option value="minimal">Minimal Contrast</option>
                  <option value="gold">Gold Luxury</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Vector SVG Code</label>
              <textarea
                value={activeScene.svgCode}
                onChange={(e) => updateActiveScene({ svgCode: e.target.value })}
                className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-[10px] text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Vertical Player Panel (Right 5 Cols) */}
      <div className="lg:col-span-5 flex flex-col items-center space-y-6">
        
        {/* Toggle Visual Mode */}
        <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl flex gap-1.5 w-full max-w-[320px]">
          <button
            onClick={() => setVisualMode("svg")}
            className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              visualMode === "svg" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            SVG Vector
          </button>
          <button
            onClick={() => setVisualMode("image")}
            className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              visualMode === "image" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            AI Image
          </button>
        </div>

        {/* 9:16 vertical video player mockup */}
        <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-[36px] overflow-hidden border border-neutral-800 shadow-2xl bg-black flex flex-col justify-between p-6 select-none relative box-border">
          
          {/* Animated Background container */}
          {(() => {
            switch (themePreset) {
              case "cyberpunk":
                return (
                  <div className="absolute inset-0 z-0 bg-[#05050a] overflow-hidden">
                    <div 
                      className="absolute -top-10 -left-10 w-[150px] h-[150px] rounded-full bg-cyan-500/20 blur-[50px] pointer-events-none"
                      style={{ animation: "neonPulse 6s infinite ease-in-out" }}
                    />
                    <div 
                      className="absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full bg-purple-500/25 blur-[50px] pointer-events-none"
                      style={{ animation: "neonPulse 8s infinite ease-in-out 1s" }}
                    />
                    <div 
                      className="absolute inset-0 opacity-[0.12] pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                      }}
                    />
                  </div>
                );
              case "sunset":
                return (
                  <div 
                    className="absolute inset-0 z-0" 
                    style={{ 
                      background: "linear-gradient(-45deg, #FF512F, #DD2476, #ff7e5f, #feb47b)",
                      backgroundSize: "400% 400%",
                      animation: "liquidFlow 15s infinite ease-in-out"
                    }}
                  />
                );
              case "glass":
                return (
                  <div className="absolute inset-0 z-0 bg-[#03001e] overflow-hidden">
                    <div 
                      className="absolute top-1/4 left-1/4 w-[160px] h-[160px] rounded-full bg-purple-600/30 blur-[45px] pointer-events-none"
                      style={{ animation: "driftOrb1 10s infinite ease-in-out" }}
                    />
                    <div 
                      className="absolute bottom-1/4 right-1/4 w-[180px] h-[180px] rounded-full bg-pink-600/20 blur-[50px] pointer-events-none"
                      style={{ animation: "driftOrb2 12s infinite ease-in-out" }}
                    />
                    <div 
                      className="absolute inset-0 opacity-[0.05] pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "25px 25px"
                      }}
                    />
                  </div>
                );
              case "terminal":
              default:
                return (
                  <div className="absolute inset-0 z-0 bg-[#06080b] overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-[0.15] pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(rgba(57, 255, 20, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.2) 1px, transparent 1px)",
                        backgroundSize: "30px 30px"
                      }}
                    />
                    <div 
                      className="absolute inset-x-0 h-[2px] bg-[#39ff14]/10 pointer-events-none"
                      style={{
                        animation: "scanline 5s infinite linear"
                      }}
                    />
                  </div>
                );
              case "cream":
                return (
                  <div className="absolute inset-0 z-0 bg-[#F9F6F0]">
                    <div 
                      className="absolute inset-0 opacity-[0.025] pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(#000000 1.5px, transparent 1.5px)",
                        backgroundSize: "20px 20px"
                      }}
                    />
                  </div>
                );
              case "emerald":
                return (
                  <div className="absolute inset-0 z-0 bg-[#041611] overflow-hidden">
                    <div 
                      className="absolute top-1/3 right-1/4 w-[160px] h-[160px] rounded-full bg-[#10b981]/15 blur-[60px] pointer-events-none"
                      style={{ animation: "neonPulse 7s infinite ease-in-out" }}
                    />
                    <div 
                      className="absolute inset-0 opacity-[0.06] pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px)",
                        backgroundSize: "100% 15px"
                      }}
                    />
                  </div>
                );
              case "minimal":
                return (
                  <div className="absolute inset-0 z-0 bg-[#000000] overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                        backgroundSize: "40px 100%"
                      }}
                    />
                  </div>
                );
              case "gold":
                return (
                  <div className="absolute inset-0 z-0 bg-[#090806] overflow-hidden">
                    <div 
                      className="absolute -bottom-20 left-1/4 w-[200px] h-[200px] rounded-full bg-amber-500/10 blur-[70px] pointer-events-none"
                      style={{ animation: "neonPulse 9s infinite ease-in-out" }}
                    />
                  </div>
                );
            }
          })()}

          {/* Top Story/Reels Indicators */}
          <div className="absolute top-4 left-6 right-6 flex gap-1 z-20">
            {scenes.map((scene, index) => {
              // Calculate completion bar widths
              let fillPercent = 0;
              if (index < activeIndex) fillPercent = 100;
              else if (index === activeIndex) fillPercent = (sceneElapsedTime / (scene.duration * 1000)) * 100;

              return (
                <div key={index} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Header Layout Info */}
          <div className="w-full flex items-center justify-between border-b pb-2.5 z-10 mt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div 
                className="h-7 w-7 rounded-full flex items-center justify-center font-black text-[10px]"
                style={{ background: themeColors.accentColor, color: themePreset === "cream" ? "#ffffff" : "#000000" }}
              >
                {brandName[0]}
              </div>
              <span className="text-[10px] font-black tracking-tight" style={{ color: themeColors.brandColor }}>
                {brandName}
              </span>
            </div>
            <span className="text-[8px] font-bold opacity-60" style={{ color: themeColors.brandColor }}>
              {instagramHandle}
            </span>
          </div>

          {/* Graphic Visualization Area */}
          <div className="flex-1 flex flex-col justify-center items-center w-full py-4 z-10 overflow-hidden">
            {visualMode === "svg" ? (
              <div 
                className="w-[180px] h-[180px] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: activeScene.svgCode }}
              />
            ) : (
              <div className="w-[180px] h-[180px] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-white/5 relative">
                <img 
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(activeScene.imagePrompt)}?width=500&height=500&nologo=true&model=flux`}
                  alt="AI Scene visual fallback"
                  className="w-full h-full object-cover"
                  style={{
                    animation: isPlaying ? "kenburns 12s infinite ease-in-out" : "none"
                  }}
                />
              </div>
            )}
          </div>

          {/* Text/Captions Area */}
          <div className="w-full space-y-4 z-10 mb-2">
            <h2 
              className="text-center font-black leading-tight uppercase italic tracking-tighter"
              style={{ color: themeColors.titleColor, fontSize: "17px" }}
            >
              {activeScene.title}
            </h2>
            
            {/* Word by word animated text */}
            <div className="min-h-[50px] flex items-center justify-center">
              {renderWordCaptions()}
            </div>
          </div>

          {/* Brand/Swipe Footer */}
          <div className="w-full flex items-center justify-between border-t pt-2.5 z-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[8px] font-black tracking-wider opacity-50 uppercase" style={{ color: themeColors.brandColor }}>
              {activeIndex === scenes.length - 1 ? "SAVE THIS POST" : "SWIPE LEFT ➔"}
            </span>
            <span className="text-[9px] font-black italic opacity-60" style={{ color: themeColors.brandColor }}>
              {String(activeIndex + 1).padStart(2, '0')}/{String(scenes.length).padStart(2, '0')}
            </span>
          </div>

        </div>

        {/* Player Controls */}
        <div className="flex flex-col gap-3 w-full max-w-[320px]">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-neutral-800"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} fill="white" />
                  Pause Playback
                </>
              ) : (
                <>
                  <Play size={14} fill="white" />
                  Play Timeline
                </>
              )}
            </button>
            
            <button
              onClick={handleDownloadSVG}
              title="Download Active Scene SVG"
              className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-neutral-800 transition-all"
            >
              <Download size={16} />
            </button>
          </div>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isExporting ? (
              <>
                <RotateCw size={14} className="animate-spin" />
                Compiling Video... {exportProgress}%
              </>
            ) : (
              <>
                <Video size={14} />
                Export Reel Video (MP4)
              </>
            )}
          </button>
        </div>

        {/* Recording Alert / Instructions */}
        <div className="w-full max-w-[320px] bg-neutral-900/50 border border-neutral-800/80 p-4 rounded-2xl text-[10px] text-neutral-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 text-primary font-black uppercase tracking-wider">
            <Info size={14} />
            <span>Usage Info</span>
          </div>
          <p>
            Click **Export Reel Video (MP4)** to render and download a high-resolution video file automatically, or use screen capture as a backup.
          </p>
        </div>

      </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto animate-bounce">
              <Video size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Compiling Video</h3>
              <p className="text-xs text-neutral-400 font-medium">Rendering visual layouts and encoding video frames. Please keep this tab open and active.</p>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full shadow-[0_0_8px_#39ff14]"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{exportProgress}% Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Modal for AI Storyboard Mode */}
      <ReelsDistributionModal
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
        videoUrl={null}
        videoBlob={null}
        topic={topic}
        script={scenes.map((s) => s.content).join(" ")}
        brandName={brandName}
        authorName="GrowXLabs Team"
      />
    </div>
  );
}
