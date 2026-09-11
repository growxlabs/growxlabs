"use client";

import React from "react";
import Link from "next/link";
import { GrowxExternalLink } from "@/components/icons";
import { PageHero } from "@/components/marketing/PageHero";
import { AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";

export default function ResearchPage() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      <PageHero
        title="Research"
        viewingText="R&D"
        exploreText="OUR WORK"
        tagline="LABS & PORTFOLIO"
      />

      <div className="w-full bg-black px-4 sm:px-6 md:px-8 xl:px-12 pb-32 border-t border-white/10 pt-16">
        <div className="max-w-[1200px] mx-auto">

          {/* Cards Grid */}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* LABS CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)]">

                  {/* Card Top */}
                  <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#C0F0FB] uppercase">
                          // OUR TOOLS
                        </span>
                        <div className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-500 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="font-serif font-black text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                        AI Lab
                      </h3>

                      <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed">
                        Foundation models, fine-tuned models, and applied research in machine intelligence.
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-10 pt-6 border-t border-neutral-800/60 grid grid-cols-2 gap-6">
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Systems</span>
                        <span className="text-foreground font-bold text-lg">3 Live</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Type</span>
                        <span className="text-foreground font-bold text-lg">Internal R&D</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* PORTFOLIO CARD */}
            <AnimatedItem>
              <Link href="/portfolio" className="group block h-full">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_40px_rgba(192,240,251,0.06)]">

                  {/* Card Top */}
                  <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#C0F0FB] uppercase">
                          // CLIENT WORK
                        </span>
                        <div className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-500 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="font-serif font-black text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                        Portfolio
                      </h3>

                      <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed">
                        Custom software and platforms built for real clients — from distributor management systems to enterprise web applications.
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-10 pt-6 border-t border-neutral-800/60 grid grid-cols-2 gap-6">
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Projects</span>
                        <span className="text-foreground font-bold text-lg">2 Shipped</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Type</span>
                        <span className="text-foreground font-bold text-lg">Client Work</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

          </AnimatedStagger>

        </div>
      </div>
    </div>
  );
}
