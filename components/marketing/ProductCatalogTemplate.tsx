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
  const isExternal = product.isExternal ?? /^https?:/.test(product.href);
  const displayCategory = product.categoryTag?.startsWith("//")
    ? product.categoryTag
    : product.categoryTag
    ? `// ${product.categoryTag.toUpperCase()}`
    : "// PROPRIETARY PLATFORM";

  return (
    <article className={cn("h-full min-w-0 flex flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5 text-[#17252D]", className)}>
      <Link 
        href={product.href} 
        target={isExternal ? "_blank" : undefined} 
        rel={isExternal ? "noopener noreferrer" : undefined} 
        className="block rounded-[4px] bg-[#8EAAB9] p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-[#0B1013]">
          {product.image && (
            <Image 
              src={product.image} 
              alt={`${product.name} preview`} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
              className="object-cover object-top" 
            />
          )}
        </div>
      </Link>
      <div className="mt-6">
        {displayCategory && (
          <p className="mb-2 font-mono text-[10px] tracking-wider uppercase text-[#3E5B6B]">
            {displayCategory}
          </p>
        )}
        <Link 
          href={product.href} 
          target={isExternal ? "_blank" : undefined} 
          rel={isExternal ? "noopener noreferrer" : undefined} 
          className="block"
        >
          <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-7 tracking-[-0.015em] hover:text-[#385568] transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.status && (
          <p className="mt-1 text-sm font-sans text-[#3E5B6B]">
            {product.status}
          </p>
        )}
        {product.description && (
          <p className="mt-3 text-[15px] sm:text-[16px] leading-6 font-sans text-[#3E5B6B]">
            {product.description}
          </p>
        )}
      </div>
      <div className="mt-auto pt-10 sm:pt-12">
        <LiquidButton 
          href={product.href} 
          target={isExternal ? "_blank" : undefined} 
          rel={isExternal ? "noopener noreferrer" : undefined} 
          variant="primary" 
          size="default"
        >
          {product.ctaText ?? (isExternal ? "Launch Platform" : "Explore Platform")}
        </LiquidButton>
      </div>
    </article>
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
    <div className="flex flex-col bg-[#F5F4F0] text-[#17252D] min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Architectural Cover) ═══ */}
      <PageHero
        title={title}
        viewingText={displayViewingText}
        exploreText={exploreText}
        tagline={tagline}
      />

      <div className="w-full bg-[#A2BECC] px-6 md:px-10 xl:px-16 2xl:px-24 pb-32 border-t border-[#D5E2E9] pt-12">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-12">
          
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

          {/* Product Cards Stack (Matching Portfolio Architectural Frame) */}
          {items.length > 0 ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#D5E2E9]">
                <h2 className="font-mono text-xs sm:text-sm font-bold text-[#17252D] tracking-[0.2em] uppercase">
                  Proprietary Platforms
                </h2>
                <span className="font-mono text-xs text-[#55788D] tracking-widest">[ 01 ]</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
                {items.map((product) => (
                  <ProductCard key={product.name} product={product} />
                ))}
              </div>
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
