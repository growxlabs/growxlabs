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
      "Web research platform that crawls websites, extracts company information, scores search visibility, and delivers clean reports — all running locally on your machine.",
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
      "Desktop workspace for running multiple coding agents side by side — track changes in real time, compare outputs, and roll back safely.",
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
          <div className="w-11 h-11 border border-neutral-700 rounded-lg flex items-center justify-center text-[#C0F0FB]">
            <IconComponent size={22} />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-widest text-[#C0F0FB]/70 uppercase">
            · {tool.status}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-sans font-black text-2xl sm:text-[28px] text-foreground tracking-tight leading-tight mt-8 mb-4">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed font-sans">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-8 mt-6 border-t border-neutral-800/60 flex items-center gap-2 font-mono text-xs font-bold text-[#C0F0FB] uppercase tracking-wider">
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
      className="block h-full border border-neutral-800/80 bg-[#0A0A0D] rounded-xl overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)] cursor-pointer group"
    >
      {CardInner}
    </a>
  ) : (
    <Link
      href={tool.href}
      className="block h-full border border-neutral-800/80 bg-[#0A0A0D] rounded-xl overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)] cursor-pointer group"
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
