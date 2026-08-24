"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/marketing/PageHero";
import { AnimatedSection, AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";

export default function ResearchPage() {
  return (
    <>
      <PageHero
        title="Research"
        viewingText="R&D"
        exploreText="AI LABS"
        tagline="OWN LAB SYSTEMS"
      />

      <div className="w-full bg-background px-4 sm:px-6 md:px-8 xl:px-12 pb-24 border-t border-border/20 pt-16">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Block */}
          <div className="text-center mb-16 pt-4 md:pt-8">
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block font-mono">
              R&D // RESEARCH & LABS
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black text-foreground tracking-tight mb-4 leading-[1.05]">
              Explore Our AI Labs
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-sans">
              Test and use proprietary AI SaaS platforms, experimental research tools, and open-source models crafted by our studio.
            </p>
          </div>

          {/* Explore Cards Grid with increased scale and presence */}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 max-w-7xl mx-auto">
            {/* LABS CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#111111] text-white border border-white/5 rounded-3xl p-10 md:p-14 overflow-hidden shadow-2xl transition-[border-color,background-image,box-shadow] duration-500 hover:border-[#6366F1]/40 hover:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_60%)] min-h-[560px] md:min-h-[620px]">
                  {/* Top line with title and circular arrow */}
                  <div className="flex justify-between items-start z-10">
                    <h3 className="text-[clamp(32px,3.8vw,46px)] font-sans font-black tracking-tight leading-[1.05] max-w-[340px]">
                      Explore Our Labs
                    </h3>
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Central geometric SVG animation - Large Scale */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] group-hover:opacity-[0.18] transition-opacity duration-700">
                    <svg viewBox="0 0 100 100" className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] text-white group-hover:text-[#6366F1] group-hover:scale-[1.04] transition-all duration-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" />
                      <line x1="50" y1="50" x2="50" y2="10" />
                      <line x1="50" y1="50" x2="85" y2="30" />
                      <line x1="50" y1="50" x2="85" y2="70" />
                      <line x1="50" y1="50" x2="50" y2="90" />
                      <line x1="50" y1="50" x2="15" y2="70" />
                      <line x1="50" y1="50" x2="15" y2="30" />
                      <polygon points="50,25 72,37 72,63 50,75 28,63 28,37" />
                      <circle cx="50" cy="50" r="1.5" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Bottom description & status indicators */}
                  <div className="z-10 mt-auto pt-20">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5 font-mono text-[11px] md:text-[12px] tracking-[0.2em] text-white/40 uppercase">
                      <span>[ EXPLORE ]</span>
                      <span>[ OWN PRODUCTS ]</span>
                    </div>
                    <p className="text-white/80 text-[16px] md:text-[18px] leading-relaxed max-w-lg font-sans">
                      Test and use proprietary AI SaaS platforms, experimental research tools, and open-source models crafted by our studio.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* PORTFOLIO CARD */}
            <AnimatedItem>
              <Link href="/portfolio" className="group block h-full">
                <div className="relative h-full flex flex-col justify-between bg-[#111111] text-white border border-white/5 rounded-3xl p-10 md:p-14 overflow-hidden shadow-2xl transition-[border-color,background-image,box-shadow] duration-500 hover:border-[#C0F0FB]/40 hover:bg-[radial-gradient(circle_at_top_right,rgba(192,240,251,0.08),transparent_60%)] min-h-[560px] md:min-h-[620px]">
                  {/* Top line with title and circular arrow */}
                  <div className="flex justify-between items-start z-10">
                    <h3 className="text-[clamp(32px,3.8vw,46px)] font-sans font-black tracking-tight leading-[1.05] max-w-[340px]">
                      Explore Our Portfolio
                    </h3>
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Central geometric SVG animation - Large Scale */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] group-hover:opacity-[0.18] transition-opacity duration-700">
                    <svg viewBox="0 0 100 100" className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] text-white group-hover:text-[#C0F0FB] group-hover:scale-[1.04] transition-all duration-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <path d="M50 10 L90 50 L50 90 L10 50 Z" />
                      <path d="M50 20 L80 50 L50 80 L20 50 Z" />
                      <path d="M50 30 L70 50 L50 70 L30 50 Z" />
                      <path d="M50 40 L60 50 L50 60 L40 50 Z" />
                      <line x1="50" y1="10" x2="50" y2="90" />
                      <line x1="10" y1="50" x2="90" y2="50" />
                      <line x1="20" y1="50" x2="50" y2="20" />
                      <line x1="80" y1="50" x2="50" y2="20" />
                      <line x1="20" y1="50" x2="50" y2="80" />
                      <line x1="80" y1="50" x2="50" y2="80" />
                    </svg>
                  </div>

                  {/* Bottom description & status indicators */}
                  <div className="z-10 mt-auto pt-20">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5 font-mono text-[11px] md:text-[12px] tracking-[0.2em] text-white/40 uppercase">
                      <span>[ EXPLORE ]</span>
                      <span>[ CLIENT WORK ]</span>
                    </div>
                    <p className="text-white/80 text-[16px] md:text-[18px] leading-relaxed max-w-lg font-sans">
                      Discover custom software, autonomous AI agents, and secure integrations engineered for global brands.
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedItem>
          </AnimatedStagger>
        </div>
      </div>
    </>
  );
}
