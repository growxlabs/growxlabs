"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GrowxExternalLink } from "@/components/icons";
import { PageHero } from "@/components/marketing/PageHero";
import { AnimatedStagger, AnimatedItem } from "@/components/marketing/AnimatedSection";

const AILAB_SLIDES = [
  {
    src: "/images/ailab/deepfake-architecture.png",
    alt: "GrowX Deepfake — Neural Architecture & Pipeline",
    title: "GrowX Deepfake™ Architecture",
    tag: "// 01 ARCHITECTURE",
    desc: "DINOv2 ViT backbone, 768-D latent manifold & 3-class verification head",
    fit: "contain",
  },
  {
    src: "/images/ailab/crawl-playground.png",
    alt: "GrowX Crawl — Extraction Playground",
    title: "GrowX Crawl™",
    tag: "// 02 PLATFORMS",
    desc: "Interactive scraping, live scoring & research engine",
    fit: "cover",
  },
  {
    src: "/portfolio/growx-crawl-api.png",
    alt: "GrowX Crawl — RESTful API Specification Suite",
    title: "GrowX Crawl API",
    tag: "// 03 API SUITE",
    desc: "Enterprise endpoints, parameter schemas & cURL integration",
    fit: "cover",
  },
  {
    src: "/images/ailab/pipper-harness.png",
    alt: "Pipper — Multi-Agent Workspace",
    title: "Pipper™",
    tag: "// 04 HARNESS",
    desc: "Desktop workspace for parallel AI agent execution & diffing",
    fit: "cover",
  },
];

const ROBOTICS_SLIDES = [
  {
    src: "/images/robotics/humanoid-embodied-ai.jpg",
    alt: "GrowX Robotics — Humanoid Embodied Intelligence & Kinematics",
    title: "Embodied Humanoid AI",
    tag: "// 01 KINEMATICS",
    desc: "Autonomous spatial perception, neural control & physical actuation",
  },
  {
    src: "/images/robotics/autonomous-manipulation.jpg",
    alt: "GrowX Robotics — Autonomous Precision Manipulation & Real-Time Teleoperation",
    title: "Autonomous Manipulation",
    tag: "// 02 MANIPULATION",
    desc: "Sub-millimeter multi-axis robotic control & dynamic tool calibration",
  },
];

function AiLabWindowCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AILAB_SLIDES.length);
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
        {/* Window Traffic Dots */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
        </div>

        {/* Address Bar: growx/ailab */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-[11px] sm:text-xs text-neutral-300 tracking-wide shadow-inner">
          <span className="text-neutral-500">growx/</span>
          <span className="text-foreground font-semibold">ailab</span>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase text-[10px] text-neutral-400 font-bold">
            LIVE
          </span>
        </div>
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        {/* Sliding Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {AILAB_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 flex flex-col bg-[#05070E]">
              {/* Image Area */}
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

                {/* Slide Progress Dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {AILAB_SLIDES.map((_, i) => (
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
                      aria-label={`Go to slide ${i + 1}`}
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

function RoboticsLabWindow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROBOTICS_SLIDES.length);
    }, 4500);
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
        {/* Window Traffic Dots */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
        </div>

        {/* Address Bar: growx/robotics */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-[11px] sm:text-xs text-neutral-300 tracking-wide shadow-inner">
          <span className="text-neutral-500">growx/</span>
          <span className="text-foreground font-semibold">robotics</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase text-[10px] text-[#C0F0FB] font-bold">
            ACTIVE R&D
          </span>
        </div>
      </div>

      {/* Window Body: Horizontal Moving Slider */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#05070E]">
        {/* Sliding Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {ROBOTICS_SLIDES.map((slide, idx) => (
            <div key={slide.src} className="relative w-full h-full shrink-0 flex flex-col bg-[#05070E]">
              {/* Image Area with Subtle HUD Badge */}
              <div className="relative flex-1 w-full overflow-hidden">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                  priority={idx === 0}
                />
                
                {/* Tech Telemetry Badges */}
                <div className="absolute top-3 left-3.5 font-mono text-[9px] text-[#C0F0FB]/90 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm hidden sm:block">
                  SYS: EMBODIED_V2
                </div>
                <div className="absolute top-3 right-3.5 font-mono text-[9px] text-emerald-400 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm hidden sm:block">
                  CALIBRATED · 120HZ
                </div>
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

                {/* Slide Progress Dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {ROBOTICS_SLIDES.map((_, i) => (
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
                      aria-label={`Go to slide ${i + 1}`}
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

export default function ResearchPage() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      <PageHero
        title="Research"
        viewingText="R&D"
        exploreText="OUR WORK"
        tagline="AI & ROBOTICS LABS"
      />

      <div className="w-full bg-black px-6 md:px-10 xl:px-16 2xl:px-24 pb-36 border-t border-white/10 pt-16">
        <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto">

          {/* Cards Grid */}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 xl:gap-12">

            {/* AI LAB CARD */}
            <AnimatedItem>
              <Link href="/ailab" className="group block h-full">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">

                  {/* Card Content */}
                  <div className="p-8 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight">
                          AI Lab
                        </h3>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-5 w-5" />
                        </div>
                      </div>

                      <p className="text-neutral-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
                        We research and develop new AI models, methods, and systems in-house.
                      </p>
                    </div>

                    {/* Window Frame with Moving Screenshots */}
                    <AiLabWindowCarousel />
                  </div>
                </div>
              </Link>
            </AnimatedItem>

            {/* ROBOTICS LAB CARD */}
            <AnimatedItem>
              <div className="group block h-full cursor-pointer">
                <div className="h-full flex flex-col bg-[#0A0A0D] border border-neutral-800/80 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#C0F0FB]/30 hover:shadow-[0_0_50px_rgba(192,240,251,0.08)]">

                  {/* Card Content */}
                  <div className="p-8 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight">
                          Robotics Lab
                        </h3>
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-[#C0F0FB] group-hover:text-black group-hover:border-[#C0F0FB] shrink-0">
                          <GrowxExternalLink className="h-5 w-5" />
                        </div>
                      </div>

                      <p className="text-neutral-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
                        Autonomous systems, embodied intelligence, and physical AI platforms bridging software models with real-world robotics.
                      </p>
                    </div>

                    {/* Window Frame with Embodied Robotics Carousel */}
                    <RoboticsLabWindow />
                  </div>
                </div>
              </div>
            </AnimatedItem>

          </AnimatedStagger>

        </div>
      </div>
    </div>
  );
}
