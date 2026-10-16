import React from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { AIReadActions } from "@/components/marketing/AIReadActions";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GrowxArrowRight } from "@/components/icons";

export interface CaseStudyMetaItem {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export interface CaseStudySpecification {
  label: string;
  value: string;
}

export type CaseStudyFeatureItem =
  | string
  | {
      title: string;
      description: string;
    };

export interface CaseStudyTemplateProps {
  // Breadcrumb & Hero
  slug: string;
  title: string;
  tagline: string;
  viewingText?: string;
  breadcrumbLabel?: string;
  breadcrumbHref?: string;

  // 01 — Hero Preview & Metadata
  categoryTag?: string; // defaults to `// ${tagline}`
  summary: string;
  metadataStrip: CaseStudyMetaItem[];
  heroImage: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    captionLeft?: string;
    captionRight?: string;
  };

  // Section 01 — Overview
  overview: string | string[];

  // Section 02 — Specifications
  specificationsHeaderLabel?: string;
  specificationsHeaderValue?: string;
  specifications: CaseStudySpecification[];

  // Section 03 — Features
  features: CaseStudyFeatureItem[];

  // Section 04 — Architecture
  architecture: React.ReactNode;

  // Closing CTA
  ctaTitle?: string;
  ctaDescription?: string;
  ctaHref?: string;
  ctaButtonText?: string;
}

export function CaseStudyTemplate({
  slug,
  title,
  tagline,
  viewingText,
  breadcrumbLabel,
  breadcrumbHref = "/portfolio",
  categoryTag,
  summary,
  metadataStrip,
  heroImage,
  overview,
  specificationsHeaderLabel = "Specification",
  specificationsHeaderValue,
  specifications,
  features,
  architecture,
  ctaTitle,
  ctaDescription = "Let's discuss how this can work for you.",
  ctaHref = "/contact",
  ctaButtonText = "Get in Touch",
}: CaseStudyTemplateProps) {
  const overviewParagraphs = Array.isArray(overview) ? overview : [overview];

  return (
    <div className="w-full bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Swiss Architectural Cover) ═══ */}
      <PageHero
        title={title}
        viewingText={viewingText || title.toUpperCase()}
        exploreText="CASE STUDY"
        tagline={tagline}
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-4 border-t border-neutral-800/80">
        <Link
          href={breadcrumbHref}
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{breadcrumbLabel || `PORTFOLIO / ${title.toUpperCase()}`}</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-24 md:space-y-32">
        {/* ══════════════════════════════════════════════════════════════════
            01 — HERO METADATA & PREVIEW
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                {categoryTag || `// ${tagline.toUpperCase()}`}
              </span>
            </div>
            <div className="md:col-span-8">
              <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal">
                {summary}
              </p>
            </div>
          </div>

          {/* Metadata Parameters Strip */}
          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-8 sm:gap-14 font-mono text-xs tracking-wider">
            {metadataStrip.map((item) => (
              <div key={item.label}>
                <span className="text-muted-foreground/60 block text-[10px] uppercase">
                  {item.label}
                </span>
                <span
                  className={`font-bold uppercase ${
                    item.isHighlight ? "text-[#C0F0FB]" : "text-foreground"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Hero Showcase Image (Compact, left-aligned) */}
          <div className="space-y-2">
            <div className="max-w-3xl mr-auto w-full overflow-hidden rounded-xl border border-neutral-800/90 shadow-2xl bg-[#0A0A0C]">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                width={heroImage.width || 1920}
                height={heroImage.height || 1080}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {(heroImage.captionLeft || heroImage.captionRight) && (
              <div className="max-w-3xl font-mono text-[11px] text-muted-foreground flex justify-between px-1">
                <span>{heroImage.captionLeft}</span>
                <span>{heroImage.captionRight}</span>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            01 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Overview" className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 01 OVERVIEW
              </span>
            </div>
            <div className="md:col-span-8 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              {overviewParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — SPECIFICATIONS (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Specifications" className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 02 SPECIFICATIONS
              </span>
            </div>
            <div className="md:col-span-8">
              <div className="border-y border-neutral-800 divide-y divide-neutral-800/80">
                <div className="py-3.5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <span>{specificationsHeaderLabel}</span>
                  <span className="text-right">{specificationsHeaderValue || title}</span>
                </div>
                {specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6 transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="text-foreground font-semibold text-sm sm:text-base shrink-0 sm:w-40">
                      {spec.label}
                    </span>
                    <span className="text-muted-foreground text-sm sm:text-base sm:text-right font-normal">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — FEATURES (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Features" className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 03 FEATURES
              </span>
            </div>
            <div className="md:col-span-8 divide-y divide-neutral-800/80">
              {features.map((feature, idx) => {
                const isObject = typeof feature === "object" && feature !== null;
                const titleText = isObject ? feature.title : null;
                const descText = isObject ? feature.description : feature;

                return (
                  <div
                    key={idx}
                    className={`text-base sm:text-lg leading-relaxed flex items-start gap-4 ${
                      idx === 0
                        ? "pb-5 first:pt-0"
                        : idx === features.length - 1
                        ? "pt-5"
                        : "py-5"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[#C0F0FB] shrink-0 mt-1 select-none w-6">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      {titleText && (
                        <>
                          <strong className="text-foreground font-semibold">
                            {titleText}
                          </strong>{" "}
                        </>
                      )}
                      <span className="text-foreground font-normal">{descText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — ARCHITECTURE (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Architecture" className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            <div className="md:col-span-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                // 04 ARCHITECTURE
              </span>
            </div>
            <div className="md:col-span-8 w-full">{architecture}</div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            EXPLORE WITH AI (Secondary Publishing Utility)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="pt-4">
          <AIReadActions
            type="project"
            title={title}
            url={`/portfolio/${slug}`}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            05 — CLOSING (360Labs Reference Style)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-16 pb-12 space-y-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
                {ctaTitle || (
                  <>
                    Interested<br />in {title}?
                  </>
                )}
              </h2>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-5">
              <p className="text-neutral-400 text-sm sm:text-base font-sans">
                {ctaDescription}
              </p>
              <LiquidButton
                href={ctaHref}
                variant="white"
                size="lg"
                icon={<GrowxArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
                iconPosition="right"
              >
                {ctaButtonText}
              </LiquidButton>
            </div>
          </div>

          {/* Bottom Meta Bar */}
          <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none pt-8">
            <span>// END OF CASE STUDY</span>
            <span>{title.toUpperCase()}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
