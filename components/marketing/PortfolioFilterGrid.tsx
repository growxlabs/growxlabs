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
            "h-[40px] px-5 sm:px-6 rounded-none font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-semibold transition-all duration-300 cursor-pointer select-none border border-[#22282C]",
            activeFilter === "all"
              ? "bg-[#22282C] text-[#FFFFFF] shadow-sm"
              : "bg-[#E9E7E1] text-[#22282C] hover:bg-[#22282C] hover:text-[#FFFFFF]"
          )}
        >
          <span>Show All</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("software")}
          className={cn(
            "h-[40px] px-5 sm:px-6 rounded-none font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-semibold transition-all duration-300 cursor-pointer select-none border border-[#22282C]",
            activeFilter === "software"
              ? "bg-[#22282C] text-[#FFFFFF] shadow-sm"
              : "bg-[#E9E7E1] text-[#22282C] hover:bg-[#22282C] hover:text-[#FFFFFF]"
          )}
        >
          <span>Software</span>
        </button>
      </div>

      {/* Vertical Stack: TRIONYX (Distribution Platform) -> Middle Border -> GrowX Crawl (Platform and Tools) */}
      <div className="space-y-16 sm:space-y-20">
        {/* Section 1: Distribution Platform (TRIONYX) */}
        {trionyxProject && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#D5E2E9]">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-[#17252D] tracking-[0.2em] uppercase">
                Distribution Platform
              </h2>
              <span className="font-mono text-xs text-[#55788D] tracking-widest">[ 01 ]</span>
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
          <div className="w-full border-t border-[#D5E2E9]" />
        )}

        {/* Section 2: Platform and Tools (GrowX Crawl) */}
        {crawlProject && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#D5E2E9]">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-[#17252D] tracking-[0.2em] uppercase">
                Platform and Tools
              </h2>
              <span className="font-mono text-xs text-[#55788D] tracking-widest">[ 02 ]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
              <Reveal delay={0.08}>
                <ProjectCard {...crawlProject} />
              </Reveal>
            </div>
          </div>
        )}
      </div>

      {/* Bottom End of Portfolio Meta Bar */}
      <div className="pt-10 sm:pt-14 mt-16 sm:mt-20 border-t border-[#D5E2E9] flex items-center justify-between font-mono text-xs sm:text-sm tracking-[0.18em] uppercase select-none">
        <span className="text-[#55788D] font-bold">
          // End of Portfolio
        </span>
        <span className="text-[#55788D] font-bold">
          2 Case Studies
        </span>
      </div>
    </div>
  );
}
