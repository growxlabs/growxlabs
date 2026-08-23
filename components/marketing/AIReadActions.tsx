"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Check } from "lucide-react";

export type ContentType = "project" | "blog" | "article" | "research";

export interface AIReadActionsProps {
  type?: ContentType;
  title?: string;
  url?: string;
  name?: string;
  className?: string;
}

export function AIReadActions({
  type = "project",
  title,
  url,
  name,
  className = "",
}: AIReadActionsProps) {
  const [resolvedUrl, setResolvedUrl] = useState(url || "https://growxlabs.tech");
  const [copiedProvider, setCopiedProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setResolvedUrl(window.location.href);
    } else if (url && url.startsWith("/")) {
      setResolvedUrl(`https://growxlabs.tech${url}`);
    } else if (url) {
      setResolvedUrl(url);
    }
  }, [url]);

  const isProject = type === "project";
  const heading = isProject ? "Explore this project with AI" : "Read this article with AI";

  const prompt = isProject
    ? `Read this GrowxLabs project: ${resolvedUrl}. Help me understand what was built, how the system works, the business problems it solves, and answer my questions about the project.`
    : `Read this GrowxLabs article: ${resolvedUrl}. Help me understand the article and answer my questions about it.`;

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  const handleAction = async (provider: "chatgpt" | "claude", targetUrl: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedProvider(provider);
        setTimeout(() => setCopiedProvider(null), 2500);
      } catch {
        // graceful fallback if clipboard access is restricted
      }
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`w-full border-t border-b border-neutral-800/80 py-4 my-8 text-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
            // AI UTILITY
          </span>
          <span className="text-neutral-700 hidden sm:inline">·</span>
          <span className="text-neutral-300 font-medium font-sans text-xs sm:text-sm">
            {heading}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => handleAction("chatgpt", chatGptUrl)}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors group cursor-pointer"
            title="Read with ChatGPT"
          >
            <span>Read with ChatGPT</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <span className="text-neutral-700">/</span>

          <button
            type="button"
            onClick={() => handleAction("claude", claudeUrl)}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors group cursor-pointer"
            title="Read with Claude"
          >
            <span>Read with Claude</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {copiedProvider && (
            <span className="text-[10px] text-green-400 font-mono flex items-center gap-1 ml-1">
              <Check className="w-3 h-3" /> Copied
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
