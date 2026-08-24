"use client";

import React from "react";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import {
  GrowxCrawl,
  GrowxTerminal,
  GrowxArrowRight,
} from "@/components/icons";

interface LabTool {
  name: string;
  status: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  href: string;
  isExternal: boolean;
  cta: string;
}

const PLATFORMS_AND_TOOLS: LabTool[] = [
  {
    name: "GrowX Crawl™",
    status: "LIVE",
    icon: GrowxCrawl,
    description:
      "Local-first web research and discovery engine built to crawl complex websites, execute headless JS rendering, extract structured entities, and anchor findings to verifiable DOM evidence.",
    href: "/portfolio/growx-crawl",
    isExternal: false,
    cta: "LEARN MORE",
  },
];

const HARNESSES: LabTool[] = [
  {
    name: "Pipper™",
    status: "LIVE",
    icon: GrowxTerminal,
    description:
      "Desktop workspace for running and visualizing autonomous coding agents working in parallel with AST compilation verification, live diff tracking, and sandbox rollbacks.",
    href: "/products",
    isExternal: false,
    cta: "LEARN MORE",
  },
];

function LabCard({ tool }: { tool: LabTool }) {
  const IconComponent = tool.icon;
  const CardInner = (
    <div className="h-full flex flex-col justify-between p-8 sm:p-10">
      {/* Top Header: Icon + Status Tag */}
      <div>
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 border border-black/20 flex items-center justify-center text-black">
            <IconComponent size={22} />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-widest text-black/60 uppercase">
            · {tool.status}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-sans font-black text-2xl sm:text-[28px] text-black tracking-tight leading-tight mt-8 mb-4">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-black/80 text-sm sm:text-[15px] leading-relaxed font-sans font-medium">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-8 mt-6 border-t border-black/15 flex items-center gap-2 font-mono text-xs font-bold text-black uppercase tracking-wider">
        <span>{tool.cta}</span>
        <GrowxArrowRight
          size={15}
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
      className="block h-full border border-black/15 bg-[#C0F0FB] text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer group"
    >
      {CardInner}
    </a>
  ) : (
    <Link
      href={tool.href}
      className="block h-full border border-black/15 bg-[#C0F0FB] text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer group"
    >
      {CardInner}
    </Link>
  );
}

export default function AiLabPage() {
  return (
    <>
      <PageHero
        title="AI Lab"
        viewingText="AI LAB"
        exploreText="R&D"
        tagline="OWN LAB SYSTEMS"
      />

      <div className="w-full bg-background pb-32 pt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-16 sm:space-y-20">
          
          {/* SECTION 01: PLATFORMS & TOOLS */}
          <div>
            <div className="pt-6 pb-8">
              <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-primary font-mono block">
                // PLATFORMS &amp; TOOLS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {PLATFORMS_AND_TOOLS.map((tool) => (
                <LabCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>

          {/* SECTION 02: HARNESS */}
          <div>
            <div className="pt-6 pb-8">
              <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] text-primary font-mono block">
                // HARNESS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {HARNESSES.map((tool) => (
                <LabCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>

          {/* End of AI Lab Footer */}
          <div className="mt-20 sm:mt-24 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-widest">
              <span>// End of AI Lab</span>
              <span>2 Lab Systems Active</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
