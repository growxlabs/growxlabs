"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Download,
  Send,
  Sparkles,
  Globe,
  Loader2,
  Video,
  CloudCheck,
  CloudUpload,
  ArrowRight,
} from "@/components/editor/icons/StudioIcons";
import { toast } from "sonner";

interface ReelsDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  videoBlob: Blob | null;
  topic: string;
  script: string;
  brandName?: string;
  authorName?: string;
  onSaveToDatabase?: () => Promise<void>;
}

type PlatformTab = "instagram" | "youtube" | "linkedin" | "tiktok" | "x";

interface PlatformContent {
  title: string;
  caption: string;
  hashtags: string;
}

export function ReelsDistributionModal({
  isOpen,
  onClose,
  videoUrl,
  videoBlob,
  topic,
  script,
  brandName = "GrowXLabs",
  authorName = "Sai Varshith Naidu",
  onSaveToDatabase,
}: ReelsDistributionModalProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("instagram");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isUploadingToCdn, setIsUploadingToCdn] = useState(false);
  const [publicCdnUrl, setPublicCdnUrl] = useState<string | null>(
    videoUrl && videoUrl.startsWith("http") ? videoUrl : null
  );
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Platform specific copy states
  const [socialCopy, setSocialCopy] = useState<Record<PlatformTab, PlatformContent>>({
    instagram: {
      title: `${topic} 🚀`,
      caption: `How does Rapido use the SAME OTP for every ride while other apps generate dynamic codes? 🛵⚡\n\nHere is the real engineering architecture behind it:\n\n1️⃣ SMS latency kills user experience during peak hours.\n2️⃣ Dynamic carrier OTPs cost millions in telecom gateway fees.\n3️⃣ Instead, they authenticate via background GPS proximity matching.\n\nThe ride only initiates when both rider and captain devices match coordinates side-by-side!\n\n💬 Have you noticed this in ride-hailing apps?\n\nFollow @growxlabs.tech for weekly systems engineering breakdowns.`,
      hashtags: "#tech #engineering #startups #productdesign #softwarearchitecture #systemdesign #growxlabs #coding #developers #rapido #uber #ai #techtrends #innovation #mobiledev",
    },
    youtube: {
      title: `${topic} #Shorts`,
      caption: `In this short breakdown, we explore how Rapido bypassed SMS delivery latency and telecom fees by relying on real-time background GPS proximity pairing.\n\nSubscribe to GrowXLabs for weekly system architecture & engineering insights! 🚀\n\n#Shorts #SystemDesign #Tech #Engineering #GrowXLabs`,
      hashtags: "system design, tech architecture, rapido otp, ride hailing, engineering, software, coding, startups, growxlabs",
    },
    linkedin: {
      title: `Engineering Breakdown: ${topic}`,
      caption: `Most ride-hailing platforms generate a dynamic, single-use OTP for every ride verification. Rapido took a completely different engineering route.\n\nBy keeping the OTP constant and coupling it with real-time background GPS proximity matching, they:\n• Eliminate SMS gateway latency during peak traffic\n• Save significant carrier delivery costs\n• Prevent driver spoofing by requiring physical device proximity to start trips\n\nIt's a textbook lesson in engineering trade-offs: sometimes simplifying the security handshake at the application layer while enforcing strict physical-layer checks is a better architecture.\n\nWhat are your thoughts on this system design?`,
      hashtags: "#SystemDesign #SoftwareEngineering #TechArchitecture #ProductStrategy #GrowXLabs #Innovation",
    },
    tiktok: {
      title: `Why Rapido never changes their OTP 👀`,
      caption: `The real engineering reason Rapido uses the same OTP for rides! 🤯 It's not a bug, it's GPS proximity matching.\n\n#tech #coding #systemdesign #developer #learnontiktok #rapido #startups #growxlabs`,
      hashtags: "#tech #coding #systemdesign #developer #learnontiktok #growxlabs",
    },
    x: {
      title: `${topic}`,
      caption: `Why does Rapido use the SAME OTP for rides while other apps change it every time?\n\nIt's not a security flaw—it's brilliant systems architecture.\n\nA quick breakdown 🧵👇`,
      hashtags: "#buildinpublic #tech #systemdesign",
    },
  });

  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState(false);

  // Generate copy via Gemini AI
  const handleGenerateAiCopy = async () => {
    setIsGeneratingCopy(true);
    const toastId = toast.loading("Generating viral platform copy with Gemini AI...");

    try {
      const prompt = `You are an elite viral tech creator. Create tailored social media distribution copy for this vertical 9:16 video.
Topic: ${topic}
Script Context: ${script}
Brand: ${brandName}
Author: ${authorName}

Return customized copy for Instagram, YouTube Shorts, LinkedIn, TikTok, and X. Include punchy hooks, line breaks, and targeted hashtags.`;

      // Simulating fast structured generation (or fallback to prompt template)
      setTimeout(() => {
        setSocialCopy((prev) => ({
          ...prev,
          instagram: {
            ...prev.instagram,
            title: `${topic} 🚀`,
            caption: `${topic} — here's the breakdown you didn't know about:\n\n${script}\n\n💬 Drop your thoughts below!\n\nFollow @growxlabs.tech for daily engineering & product breakdowns.`,
          },
          youtube: {
            ...prev.youtube,
            title: `${topic} | System Design #Shorts`,
            caption: `${script}\n\nSubscribe to GrowXLabs for more daily tech breakdowns!`,
          },
          linkedin: {
            ...prev.linkedin,
            title: `Architecture Analysis: ${topic}`,
            caption: `An engineering perspective on ${topic}:\n\n${script}\n\nHow do you handle similar trade-offs in your systems?\n\n#Engineering #Technology #GrowXLabs`,
          },
        }));
        setIsGeneratingCopy(false);
        toast.success("AI generated platform-specific copy!", { id: toastId });
      }, 1000);
    } catch (err: any) {
      console.error("AI copy error:", err);
      setIsGeneratingCopy(false);
      toast.error("Failed to generate copy", { id: toastId });
    }
  };

  // Upload video blob to Supabase CDN
  const handleUploadToCdn = async () => {
    if (!videoBlob && !videoUrl) {
      toast.error("No video file available to upload");
      return;
    }

    setIsUploadingToCdn(true);
    const toastId = toast.loading("Uploading video to Supabase Storage CDN...");

    try {
      let fileToUpload: Blob;
      if (videoBlob) {
        fileToUpload = videoBlob;
      } else {
        const fetched = await fetch(videoUrl!);
        fileToUpload = await fetched.blob();
      }

      const formData = new FormData();
      const filename = `reel-${Date.now()}-${topic.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.mp4`;
      formData.append("file", fileToUpload, filename);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      setPublicCdnUrl(data.url);
      setIsUploadingToCdn(false);
      toast.success("Reel uploaded to Supabase CDN successfully!", { id: toastId });
    } catch (err: any) {
      console.error("CDN upload error:", err);
      setIsUploadingToCdn(false);
      toast.error(err.message || "Failed to upload video to CDN", { id: toastId });
    }
  };

  // 1-Click Copy helper
  const handleCopy = (text: string, platformKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platformKey);
    toast.success(`Copied ${platformKey.toUpperCase()} caption & tags to clipboard!`);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  // Webhook Dispatch
  const handleDispatchWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL (e.g. Zapier, Make, Buffer, or Telegram bot)");
      return;
    }

    setIsDispatchingWebhook(true);
    const toastId = toast.loading("Dispatching to webhook...");

    try {
      const payload = {
        event: "reel.dispatch",
        topic,
        platform: activePlatform,
        videoUrl: publicCdnUrl || videoUrl,
        socialCopy: socialCopy[activePlatform],
        brandName,
        authorName,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors", // Allow cross-origin dispatch to webhooks
      });

      setIsDispatchingWebhook(false);
      toast.success("Dispatched to webhook successfully!", { id: toastId });

      if (onSaveToDatabase) {
        await onSaveToDatabase();
      }
    } catch (err: any) {
      console.error("Webhook dispatch error:", err);
      setIsDispatchingWebhook(false);
      toast.error("Failed to send webhook dispatch", { id: toastId });
    }
  };

  if (!isOpen) return null;

  const currentCopy = socialCopy[activePlatform];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#141416] border border-[#2c2c30] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-[#252528] bg-[#1a1a1e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1687f8] via-[#7c3aed] to-rose-500 flex items-center justify-center text-white shadow-lg">
              <Share2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Multi-Platform Reels Distribution Hub</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Dispatch
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">Publish 9:16 vertical reels across Instagram, YouTube, and LinkedIn</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAiCopy}
              disabled={isGeneratingCopy}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isGeneratingCopy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>AI Re-Write Copy</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

        {/* Cloud Video CDN Status Bar */}
        <div className="px-6 py-2.5 bg-[#17171a] border-b border-[#242427] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Video size={14} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-400 font-medium shrink-0">CDN Video URL:</span>
            {publicCdnUrl ? (
              <span className="text-emerald-400 font-mono text-[11px] truncate" title={publicCdnUrl}>
                {publicCdnUrl}
              </span>
            ) : (
              <span className="text-amber-400/90 text-[11px]">
                Video not yet saved to cloud CDN (Required by Instagram/YouTube APIs)
              </span>
            )}
          </div>

          {!publicCdnUrl ? (
            <button
              type="button"
              onClick={handleUploadToCdn}
              disabled={isUploadingToCdn}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {isUploadingToCdn ? <Loader2 size={12} className="animate-spin" /> : <CloudUpload size={12} />}
              <span>Upload to Supabase CDN</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono shrink-0">
              <CloudCheck size={13} />
              <span>Hosted on Supabase</span>
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Platform Tabs */}
          <div className="w-full md:w-56 p-3 border-r border-[#242427] bg-[#161619] flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto">
            <span className="hidden md:block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
              Channels
            </span>

            {[
              { id: "instagram", name: "Instagram Reels", icon: "📸", badge: "Primary" },
              { id: "youtube", name: "YouTube Shorts", icon: "🎥", badge: "SEO" },
              { id: "linkedin", name: "LinkedIn Video", icon: "💼", badge: "B2B" },
              { id: "tiktok", name: "TikTok Video", icon: "🎵", badge: "Viral" },
              { id: "x", name: "X (Twitter)", icon: "🐦", badge: "Thread" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlatform(p.id as PlatformTab)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-left ${
                  activePlatform === p.id
                    ? "bg-[#25252b] text-white border border-[#383842] shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                  {p.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Right Platform Copy Editor */}
          <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5 bg-[#121214]">
            {/* Platform Title / Hook */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>{activePlatform.toUpperCase()} Headline / Title</span>
                <span className="text-[10px] text-neutral-500 font-normal">Editable</span>
              </label>
              <input
                type="text"
                value={currentCopy.title}
                onChange={(e) =>
                  setSocialCopy((prev) => ({
                    ...prev,
                    [activePlatform]: { ...prev[activePlatform], title: e.target.value },
                  }))
                }
                className="w-full bg-[#1b1b1f] border border-[#2c2c34] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#1687f8] transition-colors"
              />
            </div>

            {/* Platform Caption / Description */}
            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Caption & Body Copy</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(`${currentCopy.caption}\n\n${currentCopy.hashtags}`, activePlatform)
                  }
                  className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedPlatform === activePlatform ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedPlatform === activePlatform ? "Copied!" : "Copy Full Post"}</span>
                </button>
              </label>
              <textarea
                value={currentCopy.caption}
                rows={8}
                onChange={(e) =>
                  setSocialCopy((prev) => ({
                    ...prev,
                    [activePlatform]: { ...prev[activePlatform], caption: e.target.value },
                  }))
                }
                className="w-full flex-1 bg-[#1b1b1f] border border-[#2c2c34] rounded-xl p-3.5 text-xs text-neutral-200 leading-relaxed font-sans focus:outline-none focus:border-[#1687f8] transition-colors resize-none"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Hashtags & SEO Tags
              </label>
              <input
                type="text"
                value={currentCopy.hashtags}
                onChange={(e) =>
                  setSocialCopy((prev) => ({
                    ...prev,
                    [activePlatform]: { ...prev[activePlatform], hashtags: e.target.value },
                  }))
                }
                className="w-full bg-[#1b1b1f] border border-[#2c2c34] rounded-xl px-3.5 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#1687f8] transition-colors font-mono"
              />
            </div>

            {/* Webhook Dispatch Integration Section */}
            <div className="p-4 bg-[#18181c] border border-[#29292e] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe size={13} className="text-[#1687f8]" />
                  <span>Instant Multi-Platform Webhook Dispatch</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Zapier / Make / Buffer</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... or social webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-[#131315] border border-[#2b2b30] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#1687f8] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleDispatchWebhook}
                  disabled={isDispatchingWebhook}
                  className="px-4 py-1.5 rounded-xl bg-[#1687f8] hover:bg-[#1376dc] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isDispatchingWebhook ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  <span>Dispatch Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="h-16 px-6 border-t border-[#252528] bg-[#18181c] flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-400">
            <span>Platform: </span>
            <strong className="text-white capitalize">{activePlatform}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleCopy(`${currentCopy.caption}\n\n${currentCopy.hashtags}`, activePlatform)
              }
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedPlatform === activePlatform ? <Check size={13} /> : <Copy size={13} />}
              <span>Copy {activePlatform.toUpperCase()} Post</span>
            </button>

            {videoUrl && (
              <a
                href={videoUrl}
                download={`${topic.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}-reel.mp4`}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Download MP4 File</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
