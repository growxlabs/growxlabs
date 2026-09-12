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

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;
    if (activeFilter === "software") {
      return projects.filter((p) => {
        const text = `${p.title} ${p.category} ${p.tag} ${p.subtitle || ""}`.toLowerCase();
        return (
          p.slug === "trionyx" ||
          text.includes("software") ||
          (text.includes("platform") && !text.includes("r&d"))
        );
      });
    }
    return projects;
  }, [activeFilter, projects]);

  return (
    <div className="space-y-8 md:space-y-10">
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {filteredProjects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.08}>
            <ProjectCard {...project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
