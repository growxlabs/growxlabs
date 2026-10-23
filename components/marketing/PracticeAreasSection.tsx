"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DeepfakeSimpleCardDiagram } from "@/components/ailab/DeepfakeSimpleCardDiagram";

interface Preview {
  src: string;
  alt: string;
  title: string;
  isComponent?: boolean;
}

const PORTFOLIO_SLIDES: Preview[] = [
  { src: "/portfolio/trionyx-dashboard.png", alt: "TRIONYX distributor management dashboard", title: "TRIONYX" },
  { src: "/portfolio/growx-crawl.png", alt: "GrowX Crawl web intelligence platform", title: "GrowX Crawl" },
];

const LABS_SLIDES: Preview[] = [
  { src: "/images/robotics/humanoid-embodied-ai.jpg", alt: "Humanoid robotics research", title: "Embodied AI" },
  { src: "/images/ailab/deepfake-architecture.png", alt: "Deepfake detection architecture", title: "Deepfake detection", isComponent: true },
  { src: "/images/robotics/autonomous-manipulation.jpg", alt: "Robotic precision manipulation", title: "Autonomous manipulation" },
  { src: "/images/products/recruitai.png", alt: "RecruitAI hiring platform", title: "RecruitAI" },
  { src: "/images/products/pipper.png", alt: "Pipper desktop agent workspace", title: "Pipper" },
];

function ProjectPreview({ slides, label }: { slides: Preview[]; label: string }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <div role="region" aria-label={`${label} previews`} aria-roledescription="carousel" className="overflow-hidden rounded-xl border border-[#D5E2E9] bg-[#F4F8FA]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0B1013]" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}>
        {slide.isComponent ? (
          <DeepfakeSimpleCardDiagram className="h-full w-full" />
        ) : (
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 767px) calc(100vw - 80px), (max-width: 1280px) 44vw, 560px"
            className="object-cover object-top"
          />
        )}
      </div>
      <div className="flex min-h-14 items-center justify-between gap-3 border-t border-[#D5E2E9] px-4">
        <p aria-live="polite" aria-atomic="true" className="truncate font-sans text-[13px] font-medium text-[#17252D]">{slide.title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <span aria-hidden="true" className="mr-2 font-sans text-xs tabular-nums text-[#55788D]">{index + 1} / {slides.length}</span>
          <button type="button" aria-label={`Previous ${label.toLowerCase()} preview`} onClick={() => setIndex((index - 1 + slides.length) % slides.length)} className="flex h-9 w-9 items-center justify-center rounded-md text-[#55788D] transition-colors hover:text-[#17252D] hover:bg-[#E5EFF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55788D]">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Next ${label.toLowerCase()} preview`} onClick={() => setIndex((index + 1) % slides.length)} className="flex h-9 w-9 items-center justify-center rounded-md text-[#55788D] transition-colors hover:text-[#17252D] hover:bg-[#E5EFF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55788D]">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PracticeAreasSection() {
  return (
    <section aria-labelledby="practice-areas-title" className="border-t border-[#D5E2E9] bg-[#A2BECC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 id="practice-areas-title" className="mb-7 font-sans text-2xl font-medium tracking-[-0.035em] text-[#17252D] sm:mb-9 sm:text-3xl">Our work</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-7">
          {[
            { title: "Portfolio", description: "Software, AI agents, and integrations built for clients.", href: "/portfolio", action: "View projects", slides: PORTFOLIO_SLIDES },
            { title: "Research", description: "Experiments in AI, robotics, and developer tools.", href: "/research", action: "Explore research", slides: LABS_SLIDES },
          ].map(({ title, description, href, action, slides }) => (
            <article key={title} className="flex min-w-0 flex-col rounded-2xl border border-[#D5E2E9] bg-[#F4F8FA] p-5 sm:p-7 lg:p-8">
              <div className="mb-6 sm:mb-7">
                <h3 className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#17252D] sm:text-[34px]">{title}</h3>
                <p className="mt-3 max-w-sm font-sans text-[15px] leading-6 text-[#55788D]">{description}</p>
              </div>
              <div className="mt-auto">
                <ProjectPreview slides={slides} label={title} />
                <Link href={href} className="group mt-6 flex min-h-10 items-center justify-between gap-4 rounded-sm font-sans text-sm font-semibold text-[#17252D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55788D]">
                  {action}
                  <ArrowRight aria-hidden="true" className="h-5 w-5 text-[#55788D] transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
