"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/marketing/PageHero";
import { LiquidButton } from "@/components/ui/LiquidButton";

const AILAB_SLIDES = [
  {
    src: "/images/ailab/crawl-playground.png",
    alt: "GrowX Crawl — Extraction Playground",
    title: "GrowX Crawl™",
    tag: "// 01 EXTRACTION",
    desc: "Interactive scraping, live scoring & research engine",
  },
  {
    src: "/portfolio/growx-crawl-api.png",
    alt: "GrowX Crawl — RESTful API Specification Suite",
    title: "GrowX Crawl API",
    tag: "// 02 API SUITE",
    desc: "Enterprise endpoints, parameter schemas & cURL integration",
  },
  {
    src: "/images/ailab/pipper-harness.png",
    alt: "Pipper — Multi-Agent Workspace",
    title: "Pipper™",
    tag: "// 03 HARNESS",
    desc: "Desktop workspace for parallel AI agent execution & diffing",
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

function AiLabCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AILAB_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = AILAB_SLIDES[currentIndex];

  return (
    <article 
      className="h-full min-w-0 flex flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5 text-[#17252D]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link 
        href="/ailab" 
        className="block rounded-[4px] bg-[#8EAAB9] p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-[#0B1013]">
          <Image 
            src={slide.src} 
            alt={slide.alt} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            className="object-cover object-top transition-all duration-700" 
            priority
          />
          {/* Subtle Slide Indicators */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 bg-[#0B1013]/60 px-2 py-1 rounded-[2px] backdrop-blur-sm">
            {AILAB_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  i === currentIndex ? "w-3 bg-[#A2BECC]" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-6">
        <p className="mb-2 font-mono text-[10px] tracking-wider uppercase text-[#3E5B6B]">
          // AI RESEARCH & FOUNDATION LAB
        </p>
        <Link href="/ailab" className="block">
          <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-7 tracking-[-0.015em] hover:text-[#385568] transition-colors">
            AI Lab
          </h3>
        </Link>
        <p className="mt-1 text-sm font-sans text-[#3E5B6B]">
          Proprietary AI Models & Systems
        </p>
        <p className="mt-3 text-[15px] sm:text-[16px] leading-6 font-sans text-[#3E5B6B]">
          We research and develop new AI models, methods, and autonomous systems in-house.
        </p>
      </div>

      <div className="mt-auto pt-10 sm:pt-12">
        <LiquidButton href="/ailab" variant="primary" size="default">
          Explore AI Lab
        </LiquidButton>
      </div>
    </article>
  );
}

function RoboticsLabCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROBOTICS_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = ROBOTICS_SLIDES[currentIndex];

  return (
    <article 
      className="h-full min-w-0 flex flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5 text-[#17252D]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link 
        href="/contact" 
        className="block rounded-[4px] bg-[#8EAAB9] p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-[#0B1013]">
          <Image 
            src={slide.src} 
            alt={slide.alt} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            className="object-cover object-center transition-all duration-700" 
            priority
          />
          {/* Tech Telemetry Badges */}
          <div className="absolute top-2.5 left-2.5 font-mono text-[9px] text-[#17252D] uppercase tracking-widest bg-[#FAFCFD]/90 px-1.5 py-0.5 rounded-[2px] border border-[#D5E2E9] font-bold">
            SYS: EMBODIED_V2
          </div>
          <div className="absolute top-2.5 right-2.5 font-mono text-[9px] text-emerald-800 uppercase tracking-widest bg-[#FAFCFD]/90 px-1.5 py-0.5 rounded-[2px] border border-[#D5E2E9] font-bold">
            CALIBRATED · 120HZ
          </div>

          {/* Subtle Slide Indicators */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 bg-[#0B1013]/60 px-2 py-1 rounded-[2px] backdrop-blur-sm">
            {ROBOTICS_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  i === currentIndex ? "w-3 bg-[#A2BECC]" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-6">
        <p className="mb-2 font-mono text-[10px] tracking-wider uppercase text-[#3E5B6B]">
          // EMBODIED INTELLIGENCE LAB
        </p>
        <Link href="/contact" className="block">
          <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-7 tracking-[-0.015em] hover:text-[#385568] transition-colors">
            Robotics Lab
          </h3>
        </Link>
        <p className="mt-1 text-sm font-sans text-[#3E5B6B]">
          Embodied AI & Humanoid Systems
        </p>
        <p className="mt-3 text-[15px] sm:text-[16px] leading-6 font-sans text-[#3E5B6B]">
          Autonomous systems, embodied intelligence, and physical AI platforms bridging software models with real-world robotics.
        </p>
      </div>

      <div className="mt-auto pt-10 sm:pt-12">
        <LiquidButton href="/contact" variant="primary" size="default">
          Explore Robotics
        </LiquidButton>
      </div>
    </article>
  );
}

export default function ResearchPage() {
  return (
    <div className="flex flex-col bg-[#F5F4F0] text-[#17252D] min-h-screen">
      <PageHero
        title="Research"
        viewingText="R&D"
        exploreText="OUR WORK"
        tagline="AI & ROBOTICS LABS"
      />

      <div className="w-full px-3 sm:px-4 md:px-6 pb-8">
        <section className="w-full bg-[#A2BECC] rounded-[16px] px-6 md:px-10 xl:px-16 2xl:px-24 py-16">
          <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-12">

            {/* Research & Development Cards Section (Matching Portfolio Frame) */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#D5E2E9]">
                <h2 className="font-mono text-xs sm:text-sm font-bold text-[#17252D] tracking-[0.2em] uppercase">
                  Research & Development
                </h2>
                <span className="font-mono text-xs text-[#55788D] tracking-widest">[ 01 ]</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
                <AiLabCard />
                <RoboticsLabCard />
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
