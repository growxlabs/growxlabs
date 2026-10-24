"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { LiquidButton } from "@/components/ui/LiquidButton";

interface Preview {
  src: string;
  alt: string;
  title: string;
  framing?: string;
}

const PORTFOLIO_SLIDES: Preview[] = [
  { src: "/portfolio/trionyx-dashboard.png", alt: "TRIONYX distributor management dashboard", title: "TRIONYX", framing: "object-cover object-top origin-top-right scale-[1.65]" },
  { src: "/portfolio/growx-crawl.png", alt: "GrowX Crawl web intelligence platform", title: "GrowX Crawl" },
];

const LABS_SLIDES: Preview[] = [
  { src: "/images/robotics/humanoid-embodied-ai.jpg", alt: "Humanoid robotics research", title: "Embodied AI" },
  { src: "/images/robotics/autonomous-manipulation.jpg", alt: "Robotic precision manipulation", title: "Autonomous manipulation" },
];

function ProjectPreview({ slides, label }: { slides: Preview[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!paused && !motion.matches && !document.hidden) {
        timer = setInterval(() => setIndex(current => (current + 1) % slides.length), 6000);
      }
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, slides.length]);

  return (
    <div
      role="region"
      aria-label={`${label} previews; focus or hover to pause`}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="overflow-hidden rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
    >
      <div className={`relative aspect-[16/9] overflow-hidden p-2 ${label === "Portfolio" ? "bg-[#8EAAB9]" : "bg-[#7893A2]"}`}>
        <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#0B1013]">
          {slides.map((slide, slideIndex) => (
            <div key={slide.src} aria-hidden={slideIndex !== index} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${slideIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 767px) calc(100vw - 80px), (max-width: 1280px) 44vw, 560px"
                className={slide.framing ?? (label === "Portfolio" ? "object-cover object-top" : "object-cover object-center")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PracticeAreasSection() {
  return (
    <section aria-labelledby="practice-areas-title" className="border-t border-[#17252D]/10 bg-[#A2BECC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 id="practice-areas-title" className="mb-7 font-sans text-2xl font-medium tracking-[-0.035em] text-[#17252D] sm:mb-9 sm:text-3xl">Our work</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { title: "Portfolio", description: "Software, AI agents, and integrations built for clients.", href: "/portfolio", action: "View projects", slides: PORTFOLIO_SLIDES },
            { title: "Research", description: "Experiments in AI, robotics, and developer tools.", href: "/research", action: "Explore research", slides: LABS_SLIDES },
          ].map(({ title, description, href, action, slides }) => (
            <article key={title} className="flex min-w-0 flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5">
              <ProjectPreview slides={slides} label={title} />
              <div className="mt-6">
                <h3 className="font-sans text-[18px] font-medium leading-7 tracking-[-0.015em] text-[#17252D] sm:text-[20px]">{title}</h3>
                <p className="mt-1 max-w-[48ch] font-sans text-[15px] leading-6 sm:text-[16px] text-[#3E5B6B]">{description}</p>
              </div>
              <div className="mt-auto pt-10 sm:pt-12">
                <LiquidButton href={href} variant="primary" size="default">
                  {action}
                </LiquidButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
