"use client";

import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import {
  GrowxAuthenticity,
  GrowxCrawl,
  GrowxTerminal,
  GrowxArrowRight,
} from "@/components/icons";

interface LabTool {
  name: string;
  category: string;
  status: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  href: string;
  isExternal: boolean;
  cta: string;
}

const LAB_SYSTEMS: LabTool[] = [
  {
    name: "GrowX Deepfake™",
    category: "// APPLIED RESEARCH",
    status: "RESEARCH",
    icon: GrowxAuthenticity,
    description:
      "Real-time on-device security layer for video calls that verifies whether the person you are speaking with is genuinely human — detecting face swaps, cloned voices, and synthetic avatars.",
    href: "/ailab/growx-deepfake-multimodal-intelligence",
    isExternal: false,
    cta: "EXPLORE RESEARCH",
  },
  {
    name: "GrowX Crawl™",
    category: "// PLATFORMS & TOOLS",
    status: "LIVE",
    icon: GrowxCrawl,
    description:
      "Web research platform that crawls websites, extracts company information, scores search visibility, and delivers clean reports — all running locally on your machine.",
    href: "/portfolio/growx-crawl",
    isExternal: false,
    cta: "LEARN MORE",
  },
  {
    name: "Pipper™",
    category: "// HARNESS",
    status: "LIVE",
    icon: GrowxTerminal,
    description:
      "Desktop workspace for running multiple coding agents side by side — track changes in real time, compare outputs, and roll back safely.",
    href: "/products",
    isExternal: false,
    cta: "LEARN MORE",
  },
];

function LabCard({ tool }: { tool: LabTool }) {
  const IconComponent = tool.icon;
  const CardInner = (
    <div className="h-full min-h-[390px] sm:min-h-[410px] flex flex-col justify-between p-8 sm:p-9">
      {/* Top Header: Category + Status Tag */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800/60">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            {tool.category}
          </span>
          <span className="font-mono text-[10px] font-bold tracking-widest text-primary/70 uppercase">
            · {tool.status}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="pt-6 flex items-center gap-3.5">
          <div className="w-10 h-10 border border-neutral-700/80 rounded-lg flex items-center justify-center text-primary shrink-0">
            <IconComponent size={20} />
          </div>
          <h3 className="font-sans font-black text-xl sm:text-[22px] text-foreground tracking-tight leading-tight">
            {tool.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-neutral-400 text-sm leading-relaxed font-sans pt-4">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-6 mt-8 border-t border-neutral-800/60 flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase tracking-wider">
        <span>{tool.cta}</span>
        <GrowxArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </div>
  );

  return tool.isExternal ? (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-[440px] border border-neutral-800/80 bg-[#0A0A0D] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)] cursor-pointer group"
    >
      {CardInner}
    </a>
  ) : (
    <Link
      href={tool.href}
      className="block w-full max-w-[440px] border border-neutral-800/80 bg-[#0A0A0D] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)] cursor-pointer group"
    >
      {CardInner}
    </Link>
  );
}

export default function AiLabPage() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      <PageHero
        title="AI Lab"
        viewingText="AI LAB"
        exploreText="SYSTEMS"
        tagline="MODELS & RESEARCH"
      />

      <div className="w-full bg-black pb-32 pt-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">

          {/* Section Editorial Header */}
          <div className="pt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block shrink-0 pt-1">
              // ACTIVE LAB SYSTEMS
            </span>
            <div className="max-w-2xl">
              <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
                We research and develop new AI models, methods, and systems in-house.
              </h2>
            </div>
          </div>

          {/* Cards Stacked One by One in original size */}
          <div className="flex flex-col gap-8 max-w-[440px]">
            {LAB_SYSTEMS.map((tool) => (
              <LabCard key={tool.name} tool={tool} />
            ))}
          </div>

          {/* End of AI Lab Footer */}
          <div className="mt-20 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-widest">
              <span>// End of AI Lab</span>
              <span>3 Lab Systems Active · 1 Applied Research</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
