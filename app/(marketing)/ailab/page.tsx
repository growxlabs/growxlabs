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
  kicker: string;
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
    kicker: "// MODELS",
    category: "",
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
    kicker: "// PLATFORMS & TOOLS",
    category: "",
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
    kicker: "// HARNESS",
    category: "",
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
    <div className="h-full min-h-[390px] sm:min-h-[410px] flex flex-col justify-between p-8 sm:p-9 bg-[#F4F8FA]">
      {/* Top Header: Category + Status Tag */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-[#D5E2E9]">
          {tool.category ? (
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#55788D] uppercase">
              {tool.category}
            </span>
          ) : (
            <span />
          )}
          <span className="font-mono text-[10px] font-bold tracking-widest text-[#55788D] uppercase">
            {tool.category ? `· ${tool.status}` : tool.status}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="pt-6 flex items-center gap-3.5">
          <div className="w-10 h-10 border border-[#D5E2E9] bg-[#E5EFF4] rounded-xl flex items-center justify-center text-[#17252D] shrink-0">
            <IconComponent size={20} />
          </div>
          <h3 className="font-sans font-bold text-xl sm:text-[22px] text-[#17252D] tracking-tight leading-tight">
            {tool.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-[#17252D]/80 text-sm leading-relaxed font-sans pt-4">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-6 mt-8 border-t border-[#D5E2E9] flex items-center gap-2 font-mono text-xs font-bold text-[#17252D] group-hover:text-[#55788D] uppercase tracking-wider transition-colors">
        <span>{tool.cta}</span>
        <GrowxArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </div>
  );

  const containerClasses = "block w-full max-w-[440px] border border-[#D5E2E9] rounded-2xl bg-[#F4F8FA] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#A2BECC] shadow-[0_2px_8px_rgba(23,37,45,0.04)] hover:shadow-[0_8px_24px_rgba(23,37,45,0.08)] cursor-pointer group";

  return tool.isExternal ? (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className={containerClasses}
    >
      {CardInner}
    </a>
  ) : (
    <Link
      href={tool.href}
      className={containerClasses}
    >
      {CardInner}
    </Link>
  );
}

export default function AiLabPage() {
  return (
    <div className="flex flex-col bg-[#F5F4F0] text-[#17252D] min-h-screen">
      <PageHero
        title="AI Lab"
        viewingText="AI LAB"
        exploreText="SYSTEMS"
        tagline="MODELS & RESEARCH"
      />

      <div className="w-full bg-[#A2BECC] pb-32 pt-8 border-t border-[#D5E2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">

          {/* Cards Stacked One by One with individual section headers and standard dividers */}
          <div className="flex flex-col">
            {LAB_SYSTEMS.map((tool, index) => (
              <React.Fragment key={tool.name}>
                {index > 0 && (
                  <div className="py-10 sm:py-12">
                    <div className="w-full border-t border-[#D5E2E9]" />
                  </div>
                )}

                {/* Section Header */}
                <div className={`${index === 0 ? "pt-6" : "pt-2"} pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6`}>
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#55788D] block shrink-0 pt-1">
                    {tool.kicker}
                  </span>
                  {index === 0 && (
                    <div className="max-w-xl">
                      <h2 className="font-sans font-bold text-lg sm:text-xl md:text-2xl text-[#17252D] tracking-tight leading-snug">
                        We research and develop new AI models, methods, and systems in-house.
                      </h2>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-[440px]">
                  <LabCard tool={tool} />
                </div>
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
