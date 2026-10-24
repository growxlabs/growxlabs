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
      className="overflow-hidden rounded-[14px] bg-[#B9CFDA] p-2 sm:p-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-[#0B1013]">
        <div className="work-image-frame relative w-full h-full">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.src}
              aria-hidden={slideIndex !== index}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${slideIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
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
    <div className="w-full px-3 sm:px-4 md:px-6 mb-4 sm:mb-6 select-none">
      <section
        aria-labelledby="practice-areas-title"
        className="w-full rounded-[16px] bg-[#F5F5F5] px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="practice-areas-title"
            className="mb-5 sm:mb-7 font-sans text-xl sm:text-2xl font-medium tracking-[-0.035em] text-[#17252D] md:mb-9 md:text-3xl"
          >
            Our work
          </h2>
          <div className="grid grid-cols-1 gap-7 sm:gap-9 md:grid-cols-2 md:gap-5 items-stretch">
            {[
              {
                title: "Portfolio",
                description:
                  "We design and build custom software, AI agents, and integrated platforms for companies across automotive, manufacturing, logistics, and other industries.",
                href: "/portfolio",
                action: "VIEW PROJECTS",
                slides: PORTFOLIO_SLIDES,
              },
              {
                title: "Research",
                description:
                  "We research and explore foundation AI models, robotics, and intelligent systems, designing and engineering technologies for real-world applications.",
                href: "/research",
                action: "EXPLORE RESEARCH",
                slides: LABS_SLIDES,
              },
            ].map(({ title, description, href, action, slides }) => (
              <article
                key={title}
                className="work-item group flex min-w-0 flex-col h-full cursor-default"
              >
                {/* 1. Large 16:9 Image Surface with Powder-Blue #B9CFDA Framing */}
                <div className="w-full">
                  <ProjectPreview slides={slides} label={title} />
                </div>

                {/* 2. Overlapping White Information Panel (Balanced mobile overlap, equal heights, refined padding) */}
                <div className="work-info-panel relative z-10 -mt-4 sm:-mt-6 md:-mt-8 w-[94%] sm:w-[92%] mx-auto flex-1 flex flex-col justify-between rounded-[12px] border border-[#E6E6E6] bg-white p-5 sm:p-6 md:p-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                  <div className="flex flex-col">
                    <h3 className="font-sans text-[20px] sm:text-[22px] md:text-[24px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#22282C]">
                      {title}
                    </h3>
                    <p className="mt-2.5 sm:mt-3 font-sans text-[14px] sm:text-[15px] md:text-[16px] font-normal leading-[1.5] sm:leading-[1.55] tracking-normal text-[#4B555A]">
                      {description}
                    </p>
                  </div>
                  <div className="mt-auto pt-5 sm:pt-6 md:pt-7">
                    <LiquidButton href={href} variant="primary" size="default">
                      {action}
                    </LiquidButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
