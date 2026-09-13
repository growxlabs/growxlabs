"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import { AnimatedSection, AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";
import { DeepfakeSimpleCardDiagram } from "@/components/ailab/DeepfakeSimpleCardDiagram";

const PORTFOLIO_SLIDES = [
  {
    src: "/portfolio/trionyx-dashboard.png",
    alt: "TRIONYX — Distributor Management Platform",
    title: "TRIONYX™",
    fit: "cover",
  },
  {
    src: "/portfolio/growx-crawl.png",
    alt: "GrowX Crawl — Enterprise Web Intelligence Runtime",
    title: "GrowX Crawl™",
    fit: "cover",
  },
];

const LABS_SLIDES = [
  {
    src: "/images/ailab/deepfake-architecture.png",
    alt: "GrowX Deepfake — Neural System Architecture",
    title: "GrowX Deepfake™ Architecture",
    fit: "contain",
    isComponent: true,
  },
  {
    src: "/images/robotics/humanoid-embodied-ai.jpg",
    alt: "GrowX Robotics — Humanoid Embodied Intelligence & Kinematics",
    title: "Embodied Humanoid AI",
    fit: "cover",
  },
  {
    src: "/images/robotics/autonomous-manipulation.jpg",
    alt: "GrowX Robotics — Autonomous Precision Manipulation",
    title: "Autonomous Manipulation",
    fit: "cover",
  },
  {
    src: "/images/products/recruitai.png",
    alt: "RecruitAI — Autonomous Talent Acquisition",
    title: "RecruitAI™",
    fit: "cover",
  },
  {
    src: "/images/products/pipper.png",
    alt: "Pipper — Desktop Agent Workspace",
    title: "Pipper™",
    fit: "cover",
  },
];

function PortfolioWindowCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PORTFOLIO_SLIDES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl border border-neutral-800/80 bg-[#07070A] overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-neutral-700/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Window Title Bar */}
      <div className="h-10 px-4 bg-[#0E0E14] border-b border-neutral-800/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
        </div>

        <div className="font-mono text-[11px] sm:text-xs text-neutral-400 tracking-wider uppercase font-semibold">
          GROWX / CLIENTS
        </div>

        <div className="w-12" />
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {PORTFOLIO_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 bg-[#05070E]">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={
                  slide.fit === "contain"
                    ? "object-contain object-center p-2.5"
                    : "object-cover object-top"
                }
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Floating Slide Indicator Dots */}
        <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg select-none">
          {PORTFOLIO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-4 sm:w-5 bg-[#C0F0FB]"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Portfolio slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LabsWindowCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LABS_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl border border-neutral-800/80 bg-[#07070A] overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-neutral-700/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Window Title Bar */}
      <div className="h-10 px-4 bg-[#0E0E14] border-b border-neutral-800/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
        </div>

        <div className="font-mono text-[11px] sm:text-xs text-neutral-400 tracking-wider uppercase font-semibold">
          GROWX / RESEARCH
        </div>

        <div className="w-12" />
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {LABS_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 bg-[#05070E]">
              {slide.isComponent ? (
                <DeepfakeSimpleCardDiagram className="w-full h-full" />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={
                    slide.fit === "contain"
                      ? "object-contain object-center p-2.5"
                      : "object-cover object-top"
                  }
                  priority={idx === 0}
                />
              )}
            </div>
          ))}
        </div>

        {/* Floating Slide Indicator Dots */}
        <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg select-none">
          {LABS_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-4 sm:w-5 bg-[#C0F0FB]"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Labs slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PracticeAreasSection() {
  return (
    <section className="w-full py-24 px-6 md:px-10 xl:px-16 2xl:px-24 bg-black border-t border-white/10">
      <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-[clamp(32px,4vw,48px)] font-sans font-bold text-white tracking-tight">
            Client Solutions & Proprietary Labs
          </h2>
        </AnimatedSection>

        <AnimatedStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12">
          {/* PORTFOLIO CARD */}
          <AnimatedItem>
            <Link href="/portfolio" className="group block h-full select-none">
              <div className="h-full flex flex-col justify-between bg-[#0A0A0D] border border-neutral-800/80 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-neutral-600 hover:shadow-[0_0_50px_rgba(255,255,255,0.06)] p-8 sm:p-10 lg:p-12">
                <div className="space-y-4 sm:space-y-6">
                  {/* Eyebrow Badge (360Labs Pill Style) */}
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-md border border-neutral-700/80 bg-neutral-900/60 font-mono text-[11px] sm:text-xs tracking-[0.14em] text-neutral-300 uppercase font-semibold">
                      CLIENT PORTFOLIO
                    </span>
                  </div>

                  {/* Title + Circular Arrow Button */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[44px] text-white tracking-tight leading-tight">
                      Portfolio
                    </h3>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700/80 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white shrink-0">
                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                    Custom software architectures, autonomous AI workflows, and secure integrations engineered with senior-developer velocity.
                  </p>
                </div>

                {/* Window Frame with Moving Portfolio Screenshots */}
                <PortfolioWindowCarousel />
              </div>
            </Link>
          </AnimatedItem>

          {/* LABS CARD */}
          <AnimatedItem>
            <Link href="/research" className="group block h-full select-none">
              <div className="h-full flex flex-col justify-between bg-[#0A0A0D] border border-neutral-800/80 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-neutral-600 hover:shadow-[0_0_50px_rgba(255,255,255,0.06)] p-8 sm:p-10 lg:p-12">
                <div className="space-y-4 sm:space-y-6">
                  {/* Eyebrow Badge (360Labs Pill Style) */}
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-md border border-neutral-700/80 bg-neutral-900/60 font-mono text-[11px] sm:text-xs tracking-[0.14em] text-neutral-300 uppercase font-semibold">
                      AI &amp; ROBOTICS LAB
                    </span>
                  </div>

                  {/* Title + Circular Arrow Button */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[44px] text-white tracking-tight leading-tight">
                      Research
                    </h3>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700/80 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white shrink-0">
                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                    Explore our AI research, experiments, and open-source tools built at the frontier of intelligence.
                  </p>
                </div>

                {/* Window Frame with Moving Labs & Products Screenshots */}
                <LabsWindowCarousel />
              </div>
            </Link>
          </AnimatedItem>
        </AnimatedStagger>
      </div>
    </section>
  );
}
