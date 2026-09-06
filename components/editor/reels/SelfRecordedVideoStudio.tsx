"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Palette,
  Share2,
  Download,
  Upload,
  Check,
  CheckSquare,
  User,
  Smartphone,
  Eye,
  EyeOff,
  CloudCheck,
  CloudUpload,
  CloudAlert,
  ChevronDown,
  LayersIcon,
} from "@/components/editor/icons/StudioIcons";
import { WebcamRecorderModal } from "./WebcamRecorderModal";
import { ReelsDistributionModal } from "./ReelsDistributionModal";
import { toast } from "sonner";

interface SelfRecordedVideoStudioProps {
  initialTopic?: string;
  initialScript?: string;
  onSaveToDatabase?: (projectData: any) => Promise<void>;
}

export function SelfRecordedVideoStudio({
  initialTopic = "Why Rapido Uses The Same OTP for Every Ride",
  initialScript = "Most ride apps change OTPs every ride. Rapido does something completely different. By keeping the OTP constant, Rapido bypasses SMS delivery latency and saves carrier costs. They rely on background GPS matching instead. The ride only starts if both devices are side-by-side. Follow GrowXLabs for more product breakdowns.",
  onSaveToDatabase,
}: SelfRecordedVideoStudioProps) {
  // Video source state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState(0); // seconds
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);

  // Content & Script
  const [topic, setTopic] = useState(initialTopic);
  const [scriptText, setScriptText] = useState(initialScript);

  // Brand Overlays State
  const [showCategoryPill, setShowCategoryPill] = useState(true);
  const [categoryText, setCategoryText] = useState("GROWXLABS • AI & SYSTEM DESIGN");
  const [categoryColor, setCategoryColor] = useState("#39ff14"); // Neon green

  const [showHeadline, setShowHeadline] = useState(true);
  const [headlineText, setHeadlineText] = useState(initialTopic);
  const [headlineSize, setHeadlineSize] = useState(22); // px

  const [showSpeakerCard, setShowSpeakerCard] = useState(true);
  const [speakerName, setSpeakerName] = useState("Sai Varshith Naidu");
  const [speakerRole, setSpeakerRole] = useState("Founder • GrowXLabs");
  const [speakerHandle, setSpeakerHandle] = useState("@growxlabs.tech");

  const [showProgressBar, setShowProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState("#38bdf8");

  // Picture-in-Picture / Supporting Slide Overlay
  const [showPipGraphic, setShowPipGraphic] = useState(false);
  const [pipGraphicUrl, setPipGraphicUrl] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
  );
  const [pipTitle, setPipTitle] = useState("GPS Proximity Architecture");

  // Captions State
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<"hormozi" | "cyber" | "minimal">("hormozi");
  const [captionYPercent, setCaptionYPercent] = useState(70); // % from top

  // Database save status
  const [cloudStatus, setCloudStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");

  const videoElementRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploaded video file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file (.mp4, .mov, or .webm)");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setVideoBlob(file);
    setVideoUrl(localUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setCloudStatus("unsaved");
    toast.success("Video loaded into 9:16 studio!");

    // Background upload to Supabase storage
    const uploadToast = toast.loading("Backing up video to Supabase Storage...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setVideoUrl(data.url);
        setCloudStatus("saved");
        toast.success("Video backed up to Supabase CDN!", { id: uploadToast });
      } else {
        toast.info("Keeping local preview for studio editing", { id: uploadToast });
      }
    } catch (err) {
      console.warn("Cloud backup notice:", err);
      toast.info("Keeping local preview for studio editing", { id: uploadToast });
    }
  };

  // Video playback time synchronization
  const handleTimeUpdate = () => {
    if (videoElementRef.current) {
      setCurrentTime(videoElementRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoElementRef.current) {
      setVideoDuration(videoElementRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoElementRef.current) return;
    if (isPlaying) {
      videoElementRef.current.pause();
      setIsPlaying(false);
    } else {
      videoElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (videoElementRef.current) {
      videoElementRef.current.currentTime = target;
    }
  };

  // Word-by-word kinetic captions calculation
  const renderLiveKineticCaptions = () => {
    if (!showCaptions || !scriptText.trim()) return null;

    const words = scriptText.trim().split(/\s+/);
    const totalWords = words.length;
    const duration = videoDuration || 20; // fallback if video duration not loaded yet
    const secPerWord = duration / Math.max(1, totalWords);
    const activeWordIndex = Math.min(totalWords - 1, Math.floor(currentTime / secPerWord));

    // Chunk words in groups of 4
    const chunkSize = 4;
    const chunkIndex = Math.floor(activeWordIndex / chunkSize);
    const currentChunk = words.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
    const localActive = activeWordIndex % chunkSize;

    const getColors = () => {
      switch (captionStyle) {
        case "hormozi":
          return { active: "#ffe600", inactive: "#ffffff", glow: "rgba(255, 230, 0, 0.9)" };
        case "cyber":
          return { active: "#00ffff", inactive: "rgba(255, 255, 255, 0.5)", glow: "rgba(0, 255, 255, 0.9)" };
        case "minimal":
        default:
          return { active: "#ffffff", inactive: "rgba(255, 255, 255, 0.4)", glow: "rgba(255, 255, 255, 0.6)" };
      }
    };

    const colors = getColors();

    return (
      <div
        className="absolute inset-x-4 flex justify-center text-center select-none pointer-events-none z-30"
        style={{ top: `${captionYPercent}%` }}
      >
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap justify-center gap-2">
          {currentChunk.map((word, i) => {
            const isActive = i === localActive;
            return (
              <span
                key={i}
                className="text-lg md:text-xl font-black uppercase tracking-tight italic transition-all duration-100"
                style={{
                  color: isActive ? colors.active : colors.inactive,
                  textShadow: isActive
                    ? `0 0 16px ${colors.glow}, 0 2px 6px rgba(0,0,0,0.9)`
                    : "0 1px 3px rgba(0,0,0,0.9)",
                  transform: isActive ? "scale(1.15) translateY(-2px)" : "scale(1)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  // Save to database
  const handleSaveProject = async () => {
    setCloudStatus("saving");
    const payload = {
      name: topic || "GrowXLabs Self-Recorded Reel",
      documentType: "reels_project",
      videoUrl,
      topic,
      scriptText,
      overlays: {
        category: { visible: showCategoryPill, text: categoryText, color: categoryColor },
        headline: { visible: showHeadline, text: headlineText, size: headlineSize },
        speaker: { visible: showSpeakerCard, name: speakerName, role: speakerRole, handle: speakerHandle },
        progressBar: { visible: showProgressBar, color: progressBarColor },
        pip: { visible: showPipGraphic, url: pipGraphicUrl, title: pipTitle },
        captions: { visible: showCaptions, style: captionStyle, yPercent: captionYPercent },
      },
    };

    try {
      if (onSaveToDatabase) {
        await onSaveToDatabase(payload);
      } else {
        const res = await fetch("/api/v1/editor/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: topic,
            documentKind: "reels",
            background: payload,
          }),
        });
        if (!res.ok) throw new Error("Failed to save to database");
      }
      setCloudStatus("saved");
      toast.success("Reel project saved to Supabase database!");
    } catch (err) {
      console.error("Save error:", err);
      setCloudStatus("error");
      toast.error("Failed to save project to database");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#141416] border border-[#26262a] rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-[#1687f8] flex items-center justify-center text-white shadow-md">
            <Video size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>GrowXLabs Self-Recorded Video Studio</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#1687f8]/20 text-[#38bdf8] border border-[#1687f8]/30">
                9:16 Reel
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Auto-generate kinetic captions & branding overlays on your phone/camera video
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cloud Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            {cloudStatus === "saved" && (
              <>
                <CloudCheck size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Database Saved</span>
              </>
            )}
            {cloudStatus === "saving" && (
              <>
                <CloudUpload size={14} className="text-amber-400 animate-pulse" />
                <span className="text-amber-400">Saving...</span>
              </>
            )}
            {cloudStatus === "unsaved" && (
              <>
                <CloudUpload size={14} className="text-neutral-400" />
                <span className="text-neutral-400">Unsaved Changes</span>
              </>
            )}
            {cloudStatus === "error" && (
              <>
                <CloudAlert size={14} className="text-rose-400 animate-bounce" />
                <span className="text-rose-400">Save Error</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsRecorderOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Camera size={14} />
            <span>Record Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload Video File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={handleSaveProject}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check size={14} />
            <span>Save to DB</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDistributeOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1687f8] to-[#1376dc] hover:from-[#1376dc] hover:to-[#0f60b4] text-white font-bold text-xs shadow-md shadow-[#1687f8]/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 size={14} />
            <span>Distribute Reel</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Two Columns: Studio 9:16 Canvas & Right Control Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT / CENTER: 9:16 PHONE PREVIEW CANVAS (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#0f0f12] border border-[#202024] rounded-3xl shadow-xl relative overflow-hidden">
          {/* 9:16 Mobile Viewport Container */}
          <div className="relative w-[300px] sm:w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2d2d34] flex flex-col justify-between">
            {/* 1. Underlying Video or Empty State */}
            {videoUrl ? (
              <video
                ref={videoElementRef}
                src={videoUrl}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <div
                onClick={() => setIsRecorderOpen(true)}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <Camera size={28} className="text-rose-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No Video Loaded</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Record yourself talking or drag & drop a video from your phone
                </p>
                <div className="flex gap-2">
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Record Camera
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/5 text-neutral-300 border border-white/10">
                    Upload .MP4
                  </span>
                </div>
              </div>
            )}

            {/* ====================================================
                BRAND OVERLAYS (No Canva needed!)
                ==================================================== */}

            {/* Top Brand Pill & Category */}
            {showCategoryPill && (
              <div className="relative z-30 pt-6 px-4 flex justify-between items-center pointer-events-none">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase font-mono shadow-lg border"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.65)",
                    backdropFilter: "blur(8px)",
                    color: categoryColor,
                    borderColor: `${categoryColor}40`,
                  }}
                >
                  {categoryText}
                </span>

                {/* GrowXLabs Signature Watermark Icon */}
                <div className="w-6 h-6 rounded-full bg-[#1687f8] flex items-center justify-center text-white text-[10px] font-black shadow-md">
                  GX
                </div>
              </div>
            )}

            {/* Headline Ticker */}
            {showHeadline && headlineText && (
              <div className="relative z-30 px-4 pt-2 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-lg">
                  <h2
                    className="font-black text-white leading-snug tracking-tight text-center"
                    style={{ fontSize: `${headlineSize}px` }}
                  >
                    {headlineText}
                  </h2>
                </div>
              </div>
            )}

            {/* Picture-in-Picture / Graphic Slide Overlay */}
            {showPipGraphic && (
              <div className="relative z-30 px-4 py-2 pointer-events-none flex justify-end">
                <div className="w-32 bg-black/80 backdrop-blur-md rounded-xl p-1 border border-white/20 shadow-2xl overflow-hidden">
                  <img
                    src={pipGraphicUrl}
                    alt={pipTitle}
                    className="w-full h-20 object-cover rounded-lg mb-1"
                  />
                  <p className="text-[9px] font-bold text-white truncate px-1">{pipTitle}</p>
                </div>
              </div>
            )}

            {/* Dynamic Kinetic Captions (Word-by-word) */}
            {renderLiveKineticCaptions()}

            {/* Bottom Speaker Card & Progress Bar */}
            <div className="relative z-30 p-4 space-y-2.5 pointer-events-none">
              {showSpeakerCard && (
                <div className="flex items-center justify-between bg-black/70 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-[#1687f8] flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {speakerName[0] || "S"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{speakerName}</span>
                        <span className="text-[9px] text-[#38bdf8] bg-[#38bdf8]/10 px-1 rounded-full font-bold">
                          ✓
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{speakerRole}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 pr-1">{speakerHandle}</span>
                </div>
              )}

              {/* Video Progress Line */}
              {showProgressBar && (
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${videoDuration ? (currentTime / videoDuration) * 100 : 0}%`,
                      backgroundColor: progressBarColor,
                      boxShadow: `0 0 8px ${progressBarColor}`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Play/Pause Center Indicator Overlay */}
            {videoUrl && !isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl pl-1 transform hover:scale-110 transition-transform">
                  <Play size={24} />
                </div>
              </div>
            )}
          </div>

          {/* Player Scrubber & Time Controls */}
          {videoUrl && (
            <div className="w-[300px] sm:w-[340px] mt-4 flex items-center gap-3 bg-[#18181c] p-2.5 rounded-2xl border border-[#2b2b30] shadow-md">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <input
                type="range"
                min={0}
                max={videoDuration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-[#1687f8] cursor-pointer"
              />

              <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: STUDIO EDITING CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 p-6 bg-[#141416] border border-[#222226] rounded-3xl shadow-xl overflow-y-auto max-h-[800px] custom-scrollbar">
          {/* Section 1: Video Details & Script */}
          <div className="space-y-3 pb-4 border-b border-[#252528]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
              <Sliders size={13} className="text-[#1687f8]" />
              <span>1. News Topic & Speech Script</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Reel Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setHeadlineText(e.target.value);
                }}
                className="w-full bg-[#1b1b1f] border border-[#2c2c34] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#1687f8] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Spoken Transcript (Powers Kinetic Subtitles)</span>
                <span className="text-[10px] text-neutral-500 font-normal">Animated word-by-word</span>
              </label>
              <textarea
                value={scriptText}
                rows={4}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full bg-[#1b1b1f] border border-[#2c2c34] rounded-xl p-3 text-xs text-neutral-200 leading-relaxed focus:outline-none focus:border-[#1687f8] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section 2: Kinetic Subtitles Styling (CapCut killer) */}
          <div className="space-y-3 pb-4 border-b border-[#252528]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>2. Dynamic Kinetic Captions (CapCut Style)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCaptions(!showCaptions)}
                className={`text-xs px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                  showCaptions ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-neutral-500"
                }`}
              >
                {showCaptions ? "Active" : "Hidden"}
              </button>
            </div>

            {showCaptions && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "hormozi", name: "Hormozi Gold", badge: "High Converting", preview: "yellow" },
                  { id: "cyber", name: "Cyber Cyan", badge: "Neon Glow", preview: "cyan" },
                  { id: "minimal", name: "Clean Minimal", badge: "Stark White", preview: "white" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCaptionStyle(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      captionStyle === s.id
                        ? "bg-[#202026] border-[#1687f8] shadow-md"
                        : "bg-[#18181c] border-[#29292e] hover:border-neutral-600"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{s.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{s.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Brand Overlays (Canva killer) */}
          <div className="space-y-3 pb-4 border-b border-[#252528]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
              <Palette size={13} className="text-[#38bdf8]" />
              <span>3. Brand Overlays & Lower-Thirds (Canva Killer)</span>
            </h3>

            {/* Category Pill Controls */}
            <div className="p-3 bg-[#18181c] border border-[#27272c] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">Top Category Badge</span>
                <button
                  type="button"
                  onClick={() => setShowCategoryPill(!showCategoryPill)}
                  className="text-xs text-[#38bdf8] hover:text-white cursor-pointer"
                >
                  {showCategoryPill ? "Hide" : "Show"}
                </button>
              </div>
              {showCategoryPill && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryText}
                    onChange={(e) => setCategoryText(e.target.value)}
                    className="flex-1 bg-[#121214] border border-[#2c2c34] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <div className="flex items-center gap-1">
                    {["#39ff14", "#38bdf8", "#ff007a", "#ffff00"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategoryColor(c)}
                        className="w-5 h-5 rounded-full border border-white/20 cursor-pointer"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Speaker Lower-Third Controls */}
            <div className="p-3 bg-[#18181c] border border-[#27272c] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">Speaker Lower-Third Card</span>
                <button
                  type="button"
                  onClick={() => setShowSpeakerCard(!showSpeakerCard)}
                  className="text-xs text-[#38bdf8] hover:text-white cursor-pointer"
                >
                  {showSpeakerCard ? "Hide" : "Show"}
                </button>
              </div>
              {showSpeakerCard && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    className="bg-[#121214] border border-[#2c2c34] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={speakerRole}
                    onChange={(e) => setSpeakerRole(e.target.value)}
                    className="bg-[#121214] border border-[#2c2c34] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Supporting Graphic / PIP Slide */}
            <div className="p-3 bg-[#18181c] border border-[#27272c] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">Picture-in-Picture Slide Card</span>
                <button
                  type="button"
                  onClick={() => setShowPipGraphic(!showPipGraphic)}
                  className="text-xs text-[#38bdf8] hover:text-white cursor-pointer"
                >
                  {showPipGraphic ? "Hide" : "Show"}
                </button>
              </div>
              {showPipGraphic && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Graphic Title"
                    value={pipTitle}
                    onChange={(e) => setPipTitle(e.target.value)}
                    className="w-full bg-[#121214] border border-[#2c2c34] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={pipGraphicUrl}
                    onChange={(e) => setPipGraphicUrl(e.target.value)}
                    className="w-full bg-[#121214] border border-[#2c2c34] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: 1-Click Multi-Platform Dispatch */}
          <div className="p-4 bg-gradient-to-r from-[#181820] to-[#1d1d28] border border-[#2f2f3c] rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Ready for Multi-Platform Blast?</h4>
              <p className="text-xs text-neutral-400">
                Dispatch to Instagram Reels, YouTube Shorts & LinkedIn simultaneously
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDistributeOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1687f8] hover:bg-[#1376dc] text-white font-bold text-xs shadow-lg shadow-[#1687f8]/30 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Share2 size={14} />
              <span>Launch Distribution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WebcamRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        initialScript={scriptText}
        onRecordingComplete={(blob, url) => {
          setVideoBlob(blob);
          setVideoUrl(url);
          setIsPlaying(false);
          setCurrentTime(0);
          setCloudStatus("unsaved");
        }}
      />

      <ReelsDistributionModal
        isOpen={isDistributeOpen}
        onClose={() => setIsDistributeOpen(false)}
        videoUrl={videoUrl}
        videoBlob={videoBlob}
        topic={topic}
        script={scriptText}
        brandName="GrowXLabs"
        authorName={speakerName}
        onSaveToDatabase={handleSaveProject}
      />
    </div>
  );
}
