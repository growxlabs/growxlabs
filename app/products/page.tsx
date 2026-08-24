"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/marketing/PageHero";

// ══════════════════════════════════════════════════════════════════
// Product Catalog Definition Matching 360Labs Structure As-Is
// ══════════════════════════════════════════════════════════════════

const PRODUCTS = [
  {
    name: "RecruitAI™",
    label: "AUTONOMOUS TALENT ACQUISITION",
    shortName: "RECRUITAI",
    image: "/images/products/recruitai.png",
    taglineLead: "Your autonomous screening platform that is",
    taglineBold: "rigorous, unbiased and scalable.",
    subtext: "It evaluates candidate proof-of-work, generates scorecards, and streamlines hiring.",
    description:
      "An end-to-end recruitment intelligence platform that automates technical candidate screening, scorecard evaluation, and applicant communication. It matches applicant portfolios against customized engineering rubrics with verifiable proof of work, enabling hiring teams to identify top engineering talent in minutes.",
    href: "https://recruitaitech.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "Pipper™",
    label: "DESKTOP AGENT HARNESS",
    shortName: "PIPPER",
    image: "/images/products/pipper.png",
    taglineLead: "Your desktop workspace for running and seeing",
    taglineBold: "autonomous coding agents.",
    subtext: "It executes in parallel, tracks live diffs and compiles deterministically.",
    description:
      "A desktop workspace for running and seeing autonomous coding agents work together. Pipper orchestrates parallel model execution, visualizes live file changes across branches, and runs deterministic AST compilations before merging into your codebase. Its companion dashboard gives full visibility over agent prompts, test coverage, and sandbox rollbacks.",
    href: "https://pipper.dev?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "ResumeForgeAI™",
    label: "CAREER & RESUME INTELLIGENCE",
    shortName: "RESUMEFORGE",
    image: "/images/products/resumeforgeai.png",
    taglineLead: "Your role-targeted career platform that is",
    taglineBold: "optimized, versioned and verified.",
    subtext: "It aligns ATS vector scores, manages multiple roles, and builds publication-ready resumes.",
    description:
      "An AI-native resume engineering platform designed for software engineers and technical leaders. It builds role-specific resumes with granular version branching, ATS semantic match benchmarking, and publication-ready typography. The system ensures every bullet point is grounded in verifiable impact metrics tailored to target job descriptions.",
    href: "https://resumeforgeai.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "UniversalAI™",
    label: "UNIFIED AI GATEWAY",
    shortName: "UNIVERSAL",
    image: "/images/products/universalai.png",
    taglineLead: "Your unified AI switchboard that is",
    taglineBold: "multi-model, ultra-fast and cost-optimized.",
    subtext: "It routes between Claude, GPT-5 and Gemini with sub-15ms latency.",
    description:
      "A unified AI gateway enabling seamless switching, side-by-side comparison, and automated intent routing across leading frontier models. UniversalAI allows you to choose the exact reasoning depth and latency profile needed for every conversation, drastically reducing API costs while guaranteeing high-precision outputs.",
    href: "/contact",
    isExternal: false,
  },
  {
    name: "GrowX Crawl™",
    label: "WEB INTELLIGENCE & RESEARCH RUNTIME",
    shortName: "GROWX CRAWL",
    image: "/portfolio/growx-crawl.svg",
    isSvg: true,
    taglineLead: "Your local-first web discovery engine that is",
    taglineBold: "verifiable, high-throughput and structured.",
    subtext: "It executes headless JS crawls, extracts entities, and audits search engine visibility.",
    description:
      "A local-first web research tool built inside GrowXLabs to discover companies, crawl websites, extract structured information, and keep verifiable source evidence behind every finding.",
    href: "/contact",
    isExternal: false,
  },
];

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Products"
        viewingText="PRODUCTS"
        exploreText="PLATFORMS"
        tagline="OWN PRODUCTS"
      />

      <div className="w-full bg-background pb-32 pt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          
          {/* Stacked Product Showcase Rows as independent floating editorial sheets */}
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {PRODUCTS.map((product) => {
              const LeftVisual = product.image ? (
                <div className="w-full bg-black border border-black min-h-[300px] sm:min-h-[340px] md:min-h-[380px] h-full relative overflow-hidden flex items-center justify-center">
                  {product.isSvg ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  )}
                </div>
              ) : (
                <div className="w-full bg-black border border-black p-8 sm:p-10 md:p-12 min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex flex-col justify-between text-center">
                  {/* Top Tag */}
                  <span className="font-mono text-[9.5px] sm:text-[10px] tracking-[0.25em] text-white/50 uppercase block">
                    {product.label}
                  </span>

                  {/* Giant Product Title */}
                  <h4 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white my-6">
                    {product.shortName}
                  </h4>

                  {/* Bottom Philosophy & Subtitle */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-[13px] text-white/80 font-sans">
                      {product.taglineLead}{" "}
                      <span className="font-bold text-[#C0F0FB]">
                        {product.taglineBold}
                      </span>
                    </p>
                    <p className="text-[10.5px] sm:text-xs text-white/40 font-sans">
                      {product.subtext}
                    </p>
                  </div>
                </div>
              );

              const PanelInner = (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
                  {/* LEFT SIDE: Visual Artwork / Image (Flat inside panel) */}
                  <div className="lg:col-span-6 w-full h-full">
                    {LeftVisual}
                  </div>

                  {/* RIGHT SIDE: Product Name + Editorial Description */}
                  <div className="lg:col-span-6 space-y-5">
                    <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-[40px] text-black tracking-tight leading-tight">
                      {product.name}
                    </h2>

                    <p className="text-black/80 text-sm sm:text-base md:text-[16.5px] leading-relaxed font-sans font-medium">
                      {product.description}
                    </p>
                  </div>
                </div>
              );

              return product.isExternal ? (
                <a
                  key={product.name}
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-black/15 bg-[#C0F0FB] p-6 sm:p-8 md:p-10 lg:p-12 text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer"
                >
                  {PanelInner}
                </a>
              ) : (
                <Link
                  key={product.name}
                  href={product.href}
                  className="block border border-black/15 bg-[#C0F0FB] p-6 sm:p-8 md:p-10 lg:p-12 text-black shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.5),0_28px_56px_rgba(0,0,0,0.75),0_48px_96px_rgba(0,0,0,0.85)] relative transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_24px_48px_rgba(0,0,0,0.65),0_48px_96px_rgba(0,0,0,0.85),0_72px_130px_rgba(0,0,0,0.95)] will-change-transform cursor-pointer"
                >
                  {PanelInner}
                </Link>
              );
            })}
          </div>

          {/* End of Products Separator & Count */}
          <div className="mt-20 sm:mt-24 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-widest">
              <span>// End of Products</span>
              <span>{PRODUCTS.length} Products</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
