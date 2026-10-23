"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/PageHero";
import { ProductStudioToggle } from "@/components/marketing/ProductStudioToggle";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { GrowxArrowRight } from "@/components/icons";

// ══════════════════════════════════════════════════════════════════
// TypeScript Definitions
// ══════════════════════════════════════════════════════════════════

export interface ProductItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  href: string;
  isExternal?: boolean;
  categoryTag?: string; // e.g. "// RECRUITMENT INTELLIGENCE"
  badge?: string; // e.g. "PROPRIETARY", "BETA", "LIVE"
  tags?: string[]; // e.g. ["Next.js", "AI", "Enterprise"]
  status?: string; // e.g. "Live", "Production"
  ctaText?: string; // e.g. "Explore Platform", "Launch App"
  aspectRatio?: string; // defaults to "aspect-[16/10]"
}

export interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export interface ProductCatalogTemplateProps {
  // Page Hero Cover
  title: string;
  viewingText?: string;
  exploreText?: string;
  tagline: string;

  // Toggle & Navigation
  showToggle?: boolean;
  activeToggle?: "products" | "studio";
  customToggle?: React.ReactNode;

  // Catalog Items
  items: ProductItem[];

  // Optional Intro / Editorial note
  introTag?: string;
  introDescription?: string;

  // Children / Slot for custom elements
  children?: React.ReactNode;

  // Closing CTA Section
  showClosingCta?: boolean;
  ctaTitle?: React.ReactNode;
  ctaDescription?: string;
  ctaHref?: string;
  ctaButtonText?: string;

  // Bottom Meta Bar
  metaLeft?: string;
  metaRight?: string;
}

// ══════════════════════════════════════════════════════════════════
// Reusable Product Showcase Card
// ══════════════════════════════════════════════════════════════════

export function ProductCard({ product, className }: ProductCardProps) {
  const isExternal = product.isExternal ?? (product.href.startsWith("http://") || product.href.startsWith("https://"));

  const displayCategory = product.categoryTag?.startsWith("//")
    ? product.categoryTag
    : product.categoryTag
    ? `// ${product.categoryTag.toUpperCase()}`
    : "// AI-NATIVE PLATFORM";

  const cardBody = (
    <>
      {/* Left Column: Clean Platform Surface Screenshot */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#FAFCFD] border border-[#D5E2E9] shadow-sm">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      {/* Right Column: Editorial Product Details (Full Right Side) */}
      <div className="w-full flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 space-y-4">
        <div>
          <span className="font-mono text-xs font-bold text-[#55788D] tracking-[0.2em] uppercase block mb-3">
            {displayCategory}
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-[#17252D] leading-tight font-sans tracking-tight">
            {product.name}
          </h3>
        </div>
        <p className="text-base text-[#17252D]/85 leading-relaxed font-sans font-medium">
          {product.description}
        </p>
        <div className="pt-4 border-t border-[#D5E2E9] flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#17252D] group-hover:text-[#55788D] transition-colors uppercase tracking-wider">
            <span>{product.ctaText ?? (isExternal ? "Launch Platform" : "Explore Platform")}</span>
            <GrowxArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </span>
          {product.status && (
            <span className="font-mono text-[11px] font-bold text-[#55788D] tracking-wider uppercase">
              {product.status}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const containerClasses = cn(
    "group grid grid-cols-1 md:grid-cols-2 items-center overflow-hidden border border-[#D5E2E9] rounded-2xl bg-[#F4F8FA] text-[#17252D] shadow-[0_2px_8px_rgba(23,37,45,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(23,37,45,0.08)] cursor-pointer no-underline w-full",
    className
  );

  if (isExternal) {
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

// ══════════════════════════════════════════════════════════════════
// Universal Product Catalog Template Component
// ══════════════════════════════════════════════════════════════════

export function ProductCatalogTemplate({
  title,
  viewingText,
  exploreText = "PLATFORMS",
  tagline,
  showToggle = true,
  activeToggle = "studio",
  customToggle,
  items,
  introTag,
  introDescription,
  children,
  showClosingCta = true,
  ctaTitle,
  ctaDescription = "Let's discuss how our proprietary AI systems can deploy inside your infrastructure.",
  ctaHref = "/contact",
  ctaButtonText = "Get in Touch",
  metaLeft,
  metaRight,
}: ProductCatalogTemplateProps) {
  const displayViewingText = viewingText || title.toUpperCase();
  const displayMetaLeft = metaLeft || `// END OF ${title.toUpperCase()}`;
  const displayMetaRight = metaRight || `${items.length} PROPRIETARY PLATFORMS ACTIVE`;

  return (
    <div className="flex flex-col bg-[#A2BECC] text-[#17252D] min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Architectural Cover) ═══ */}
      <PageHero
        title={title}
        viewingText={displayViewingText}
        exploreText={exploreText}
        tagline={tagline}
      />

      <div className="w-full bg-[#A2BECC] pb-32 pt-8 border-t border-[#D5E2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">
          
          {/* Navigation Toggle / Filter */}
          {showToggle && (
            <div>
              {customToggle || (activeToggle && <ProductStudioToggle active={activeToggle} />)}
            </div>
          )}

          {/* Optional Intro Editorial Header */}
          {(introTag || introDescription) && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-b border-[#D5E2E9] pb-8">
              {introTag && (
                <div className="md:col-span-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#55788D] block">
                    {introTag}
                  </span>
                </div>
              )}
              {introDescription && (
                <div className={introTag ? "md:col-span-8" : "md:col-span-12"}>
                  <p className="text-[#55788D] text-lg sm:text-xl leading-relaxed font-normal">
                    {introDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom Slot / Children */}
          {children}

          {/* Product Cards Stack */}
          {items.length > 0 ? (
            <div className="space-y-8 sm:space-y-10 lg:space-y-12 pt-4">
              {items.map((product) => (
                <ProductCard key={product.name} product={product} />
              ))}
            </div>
          ) : (
            <div className="min-h-[350px] flex items-center justify-center border border-dashed border-[#D5E2E9] rounded-2xl p-12 text-center bg-[#F4F8FA]">
              <div className="space-y-3 font-mono">
                <span className="text-[#55788D] text-xs uppercase tracking-widest block font-bold">
                  // CATALOG INITIALIZING
                </span>
                <p className="text-[#17252D] text-sm">
                  Platforms are being registered. Check back shortly.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              CLOSING (Editorial Style)
          ══════════════════════════════════════════════════════════════════ */}
          {showClosingCta && (
            <section className="pt-20 pb-12 space-y-20 border-t border-[#D5E2E9] mt-20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                  <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-[#17252D] tracking-tight leading-[1.05]">
                    {ctaTitle || (
                      <>
                        Interested<br />in our Platforms?
                      </>
                    )}
                  </h2>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-5">
                  <p className="text-[#55788D] text-sm sm:text-base font-sans font-medium">
                    {ctaDescription}
                  </p>
                  <LiquidButton
                    href={ctaHref}
                    variant="airforce"
                    size="lg"
                    icon={<GrowxArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
                    iconPosition="right"
                  >
                    {ctaButtonText}
                  </LiquidButton>
                </div>
              </div>

              {/* Bottom Meta Bar */}
              <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-[#55788D] uppercase select-none pt-8 border-t border-[#D5E2E9]">
                <span>{displayMetaLeft}</span>
                <span>{displayMetaRight}</span>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
