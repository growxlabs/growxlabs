"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/marketing/PageHero";
import { ProductStudioToggle } from "@/components/marketing/ProductStudioToggle";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GrowxArrowRight } from "@/components/icons";

// ══════════════════════════════════════════════════════════════════
// Product Catalog Definition Matching 360Labs Reference Structure
// ══════════════════════════════════════════════════════════════════

const PRODUCTS = [
  {
    name: "RecruitAI™",
    image: "/portfolio/recruitai.png",
    description:
      "An end-to-end recruitment intelligence platform that automates technical candidate screening, scorecard evaluation, and applicant communication. It matches applicant portfolios against customized engineering rubrics with verifiable proof of work, enabling hiring teams to identify top engineering talent in minutes.",
    href: "https://recruitaitech.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "Pipper™",
    image: "/images/products/pipper.png",
    description:
      "A desktop workspace for running and seeing autonomous coding agents work together. Pipper orchestrates parallel model execution, visualizes live file changes across branches, and runs deterministic AST compilations before merging into your codebase. Its companion dashboard gives full visibility over agent prompts, test coverage, and sandbox rollbacks.",
    href: "https://pipper.dev?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "ResumeForgeAI™",
    image: "/images/products/resumeforgeai.png",
    description:
      "An AI-native resume engineering platform designed for software engineers and technical leaders. It builds role-specific resumes with granular version branching, ATS semantic match benchmarking, and publication-ready typography. The system ensures every bullet point is grounded in verifiable impact metrics tailored to target job descriptions.",
    href: "https://resumeforgeai.in?utm_source=growxlabswebsite",
    isExternal: true,
  },
  {
    name: "UniversalAI™",
    image: "/images/products/universalai.png",
    description:
      "A unified AI gateway enabling seamless switching, side-by-side comparison, and automated intent routing across leading frontier models. UniversalAI allows you to choose the exact reasoning depth and latency profile needed for every conversation, drastically reducing API costs while guaranteeing high-precision outputs.",
    href: "/portfolio/universalai",
    isExternal: false,
  },
  {
    name: "GrowX Crawl™",
    image: "/portfolio/growx-crawl.png",
    description:
      "A local-first web research tool built inside GrowXLabs to discover companies, crawl websites, extract structured information, and keep verifiable source evidence behind every finding.",
    href: "/portfolio/growx-crawl",
    isExternal: false,
  },
  {
    name: "GrowX Deepfake™",
    image: "/images/products/deepfake.png",
    description:
      "Enterprise multimodal intelligence engine detecting AI deepfakes across live video calls, synthetic audio streams, and manipulated identity media with sub-50ms inference latency.",
    href: "/ailab/growx-deepfake-multimodal-intelligence",
    isExternal: false,
  },
];

function ProductReferenceCard({ product }: { product: (typeof PRODUCTS)[number] }) {
  const cardBody = (
    <>
      {/* Left: Clean Platform Surface Screenshot (Padded, No Window Chrome) */}
      <div className="flex items-center justify-center w-full sm:w-1/2 p-2 sm:p-3">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#07070A]">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
            />
          )}
        </div>
      </div>

      {/* Right: Editorial Product Details (Matching 360labs Reference) */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12 xl:p-14">
        <h3 className="text-3xl sm:text-4xl font-normal text-white/90 leading-tight font-sans tracking-tight">
          {product.name}
        </h3>
        <p className="mt-4 text-base text-neutral-400 leading-relaxed font-sans font-light">
          {product.description}
        </p>
      </div>
    </>
  );

  const containerClasses =
    "group flex flex-col sm:flex-row overflow-hidden border border-neutral-800 bg-[#0C0C10] transition-all duration-300 hover:border-neutral-600 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] cursor-pointer no-underline block";

  if (product.isExternal) {
    return (
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        className={containerClasses}
      >
        {cardBody}
      </a>
    );
  }

  return (
    <Link href={product.href} className={containerClasses}>
      {cardBody}
    </Link>
  );
}

export default function StudioPage() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      <PageHero
        title="Studio"
        viewingText="STUDIO"
        exploreText="PLATFORMS"
        tagline="PROPRIETARY PRODUCTS"
      />

      <div className="w-full bg-black pb-32 pt-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">
          
          {/* Navigation Toggle: Products / Studio */}
          <ProductStudioToggle active="studio" />

          {/* Product Cards Stack (Exact 360Labs Reference Pattern) */}
          <div className="space-y-8 sm:space-y-10 lg:space-y-12 pt-4">
            {PRODUCTS.map((product) => (
              <ProductReferenceCard key={product.name} product={product} />
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              CLOSING (360Labs Reference Style)
          ══════════════════════════════════════════════════════════════════ */}
          <section className="pt-20 pb-12 space-y-20 border-t border-white/10 mt-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
                  Interested<br />in our Platforms?
                </h2>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-5">
                <p className="text-neutral-400 text-sm sm:text-base font-sans">
                  Let&apos;s discuss how our proprietary AI systems can deploy inside your infrastructure.
                </p>
                <LiquidButton
                  href="/contact"
                  variant="white"
                  size="lg"
                  icon={<GrowxArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
                  iconPosition="right"
                >
                  Get in Touch
                </LiquidButton>
              </div>
            </div>

            {/* Bottom Meta Bar (360labs reference) */}
            <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none pt-8">
              <span>{"// END OF STUDIO"}</span>
              <span>{PRODUCTS.length} PROPRIETARY PLATFORMS ACTIVE</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
