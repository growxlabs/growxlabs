"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowUpRight } from "@/components/icons";
import { AnimatedSection, AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";
import { DeepfakeSimpleCardDiagram } from "@/components/ailab/DeepfakeSimpleCardDiagram";

const PORTFOLIO_SLIDES = [
  {
    src: "/portfolio/trionyx-dashboard.png",
    alt: "TRIONYX — Distributor Management Platform",
    title: "TRIONYX™",
    tag: "// 01 CLIENT PLATFORM",
    desc: "Distributor operations, enquiries, inventory and sales in one platform",
    fit: "cover",
  },
  {
    src: "/portfolio/growx-crawl.png",
    alt: "GrowX Crawl — Enterprise Web Intelligence Runtime",
    title: "GrowX Crawl™",
    tag: "// 02 ENTERPRISE SOFTWARE",
    desc: "Local-first web intelligence & enterprise extraction runtime",
    fit: "cover",
  },
];

const LABS_SLIDES = [
  {
    src: "/images/ailab/deepfake-architecture.png",
    alt: "GrowX Deepfake — Neural System Architecture",
    title: "GrowX Deepfake™ Architecture",
    tag: "// 01 AI LAB · MODELS",
    desc: "DINOv2 ViT backbone, 768-D latent manifold & 3-class verification head",
    fit: "contain",
    isComponent: true,
  },
  {
    src: "/images/robotics/humanoid-embodied-ai.jpg",
    alt: "GrowX Robotics — Humanoid Embodied Intelligence & Kinematics",
    title: "Embodied Humanoid AI",
    tag: "// 02 ROBOTICS · KINEMATICS",
    desc: "Autonomous spatial perception, neural control & physical actuation",
    fit: "cover",
  },
  {
    src: "/images/robotics/autonomous-manipulation.jpg",
    alt: "GrowX Robotics — Autonomous Precision Manipulation",
    title: "Autonomous Manipulation",
    tag: "// 03 ROBOTICS · MANIPULATION",
    desc: "Sub-millimeter multi-axis robotic control & dynamic tool calibration",
    fit: "cover",
  },
  {
    src: "/images/products/recruitai.png",
    alt: "RecruitAI — Autonomous Talent Acquisition",
    title: "RecruitAI™",
    tag: "// 04 AI LAB · TALENT AI",
    desc: "Autonomous technical screening & candidate proof-of-work",
    fit: "cover",
  },
  {
    src: "/images/products/pipper.png",
    alt: "Pipper — Desktop Agent Workspace",
    title: "Pipper™",
    tag: "// 05 AI LAB · HARNESS",
    desc: "Desktop workspace for parallel AI agent execution & diffing",
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-[11px] sm:text-xs text-neutral-300 tracking-wide shadow-inner">
          <span className="text-neutral-500">growx/</span>
          <span className="text-foreground font-semibold">portfolio</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase text-[10px] text-neutral-400 font-bold">
            DEPLOYED
          </span>
        </div>
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {PORTFOLIO_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 flex flex-col bg-[#05070E]">
              <div className="relative flex-1 w-full overflow-hidden">
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

              {/* Bottom Caption Bar */}
              <div className="h-14 sm:h-16 shrink-0 bg-[#0A0D17]/95 border-t border-neutral-800/80 px-4 sm:px-5 flex items-center justify-between gap-4 select-none">
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#C0F0FB] tracking-widest uppercase">
                      {slide.tag}
                    </span>
                    <span className="text-neutral-600 text-xs hidden sm:inline">·</span>
                    <p className="font-sans font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">
                      {slide.title}
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate hidden sm:block">
                    {slide.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
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
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Portfolio slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-[11px] sm:text-xs text-neutral-300 tracking-wide shadow-inner">
          <span className="text-neutral-500">growx/</span>
          <span className="text-foreground font-semibold">research</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase text-[10px] text-[#C0F0FB] font-bold">
            LIVE R&D
          </span>
        </div>
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {LABS_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 flex flex-col bg-[#05070E]">
              <div className="relative flex-1 w-full overflow-hidden">
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

              {/* Bottom Caption Bar */}
              <div className="h-14 sm:h-16 shrink-0 bg-[#0A0D17]/95 border-t border-neutral-800/80 px-4 sm:px-5 flex items-center justify-between gap-4 select-none">
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#C0F0FB] tracking-widest uppercase">
                      {slide.tag}
                    </span>
                    <span className="text-neutral-600 text-xs hidden sm:inline">·</span>
                    <p className="font-sans font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">
                      {slide.title}
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate hidden sm:block">
                    {slide.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
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
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Labs slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
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
            <Link href="/portfolio" className="group block h-full">
              <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">
                <div className="p-8 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Eyebrow + Header + Action */}
                    <div>
                      <span className="font-mono text-xs tracking-[0.2em] text-[#C0F0FB] uppercase block mb-3 font-bold">
                        [ 01 / CLIENT SOLUTIONS ]
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-[42px] text-foreground tracking-tight leading-tight">
                          Portfolio
                        </h3>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                      Custom software architectures, autonomous AI workflows, and secure integrations engineered with senior-developer velocity.
                    </p>
                  </div>

                  {/* Window Frame with Moving Portfolio Screenshots */}
                  <PortfolioWindowCarousel />

                  {/* Bottom Meta Bar */}
                  <div className="flex justify-between items-center pb-1 pt-6 mt-6 font-mono text-xs tracking-[0.18em] text-neutral-400 uppercase border-t border-neutral-800/80">
                    <span>[ CASE STUDIES ]</span>
                    <span className="text-[#C0F0FB] group-hover:text-white transition-colors font-bold">VIEW WORK →</span>
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedItem>

          {/* LABS CARD */}
          <AnimatedItem>
            <Link href="/research" className="group block h-full">
              <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">
                <div className="p-8 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Eyebrow + Header + Action */}
                    <div>
                      <span className="font-mono text-xs tracking-[0.2em] text-[#C0F0FB] uppercase block mb-3 font-bold">
                        [ 02 / AI LAB & ROBOTICS ]
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-[42px] text-foreground tracking-tight leading-tight">
                          Research
                        </h3>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                      In-house neural research, autonomous AI platforms, and embodied humanoid robotics engineered from first principles.
                    </p>
                  </div>

                  {/* Window Frame with Moving Labs & Products Screenshots */}
                  <LabsWindowCarousel />

                  {/* Bottom Meta Bar */}
                  <div className="flex justify-between items-center pb-1 pt-6 mt-6 font-mono text-xs tracking-[0.18em] text-neutral-400 uppercase border-t border-neutral-800/80">
                    <span>[ RESEARCH & LABS ]</span>
                    <span className="text-[#C0F0FB] group-hover:text-white transition-colors font-bold">EXPLORE RESEARCH →</span>
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedItem>
        </AnimatedStagger>
      </div>
    </section>
  );
}
