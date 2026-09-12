"use client";

import React, { useState, useMemo } from "react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CaseStudy } from "@/lib/data/projects";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

interface PortfolioFilterGridProps {
  projects: CaseStudy[];
}

export function PortfolioFilterGrid({ projects }: PortfolioFilterGridProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "software">("all");

  const trionyxProject = useMemo(
    () => projects.find((p) => p.slug === "trionyx"),
    [projects]
  );

  const crawlProject = useMemo(
    () => projects.find((p) => p.slug === "growx-crawl"),
    [projects]
  );

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Filter Tabs / Buttons */}
      <div className="flex flex-wrap items-center gap-3 select-none">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={cn(
            "group flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-bold transition-all duration-300 cursor-pointer select-none",
            activeFilter === "all"
              ? "bg-[#C0F0FB] text-black border border-[#C0F0FB] shadow-[0_0_25px_rgba(192,240,251,0.25)]"
              : "bg-[#0A0A0D] text-neutral-400 border border-neutral-800/80 hover:border-neutral-700 hover:text-white"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              activeFilter === "all" ? "bg-black" : "bg-neutral-600 group-hover:bg-neutral-400"
            )}
          />
          <span>Show All</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("software")}
          className={cn(
            "group flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-bold transition-all duration-300 cursor-pointer select-none",
            activeFilter === "software"
              ? "bg-[#C0F0FB] text-black border border-[#C0F0FB] shadow-[0_0_25px_rgba(192,240,251,0.25)]"
              : "bg-[#0A0A0D] text-neutral-400 border border-neutral-800/80 hover:border-neutral-700 hover:text-white"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              activeFilter === "software" ? "bg-black" : "bg-neutral-600 group-hover:bg-neutral-400"
            )}
          />
          <span>Software</span>
        </button>
      </div>

      {/* Vertical Stack: TRIONYX (Distribution Platform) -> Middle Border -> GrowX Crawl (Platform and Tools) */}
      <div className="space-y-16 sm:space-y-20">
        {/* Section 1: Distribution Platform (TRIONYX) */}
        {trionyxProject && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C0F0FB]" />
                <h2 className="font-mono text-xs sm:text-sm font-bold text-[#C0F0FB] tracking-[0.2em] uppercase">
                  Distribution Platform
                </h2>
              </div>
              <span className="font-mono text-xs text-neutral-500 tracking-widest">[ 01 ]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
              <Reveal delay={0.08}>
                <ProjectCard {...trionyxProject} />
              </Reveal>
            </div>
          </div>
        )}

        {/* Middle Border Separator */}
        {trionyxProject && crawlProject && (
          <div className="w-full border-t border-white/10" />
        )}

        {/* Section 2: Platform and Tools (GrowX Crawl) */}
        {crawlProject && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C0F0FB]" />
                <h2 className="font-mono text-xs sm:text-sm font-bold text-[#C0F0FB] tracking-[0.2em] uppercase">
                  Platform and Tools
                </h2>
              </div>
              <span className="font-mono text-xs text-neutral-500 tracking-widest">[ 02 ]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
              <Reveal delay={0.08}>
                <ProjectCard {...crawlProject} />
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
