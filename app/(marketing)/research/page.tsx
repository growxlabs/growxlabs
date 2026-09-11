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

      <div className="w-full bg-black px-6 md:px-10 xl:px-16 2xl:px-24 pb-36 border-t border-white/10 pt-16">
        <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto">

          {/* Cards Grid */}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 xl:gap-12">

            {/* LABS CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">

                  {/* Card Top */}
                  <div className="p-10 sm:p-12 lg:p-14 xl:p-16 flex-1 flex flex-col justify-between">
                    <div className="space-y-6 lg:space-y-8">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs sm:text-[13px] font-bold tracking-[0.25em] text-[#C0F0FB] uppercase">
                          // OUR TOOLS
                        </span>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-5 w-5" />
                        </div>
                      </div>

                      <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight">
                        AI Lab
                      </h3>

                      <p className="text-neutral-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
                        Foundation models, fine-tuned models, and applied research in machine intelligence.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* PORTFOLIO CARD */}
            <AnimatedItem>
              <Link href="/portfolio" className="group block h-full">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">

                  {/* Card Top */}
                  <div className="p-10 sm:p-12 lg:p-14 xl:p-16 flex-1 flex flex-col justify-between">
                    <div className="space-y-6 lg:space-y-8">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs sm:text-[13px] font-bold tracking-[0.25em] text-[#C0F0FB] uppercase">
                          // CLIENT WORK
                        </span>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-5 w-5" />
                        </div>
                      </div>

                      <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight">
                        Portfolio
                      </h3>

                      <p className="text-neutral-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
                        Custom software and platforms built for real clients — from distributor management systems to enterprise web applications.
                      </p>
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
