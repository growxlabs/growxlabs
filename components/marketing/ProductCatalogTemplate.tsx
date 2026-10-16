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

  const cardBody = (
    <>
      {/* Left: Clean Platform Surface Screenshot (Padded, No Window Chrome) */}
      <div className="flex items-center justify-center w-full sm:w-1/2 p-2 sm:p-3">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#07070A]">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
            />
          )}
        </div>
      </div>

      {/* Right: Editorial Product Details (Matching 360labs Reference) */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12 xl:p-14">
        <h3 className="text-3xl sm:text-4xl font-normal text-white/90 leading-tight font-sans tracking-tight">
          {product.name}
        </h3>
        <p className="mt-4 text-base text-neutral-400 leading-relaxed font-sans font-light">
          {product.description}
        </p>
      </div>
    </>
  );

  const containerClasses = cn(
    "group flex flex-col sm:flex-row overflow-hidden border border-neutral-800 bg-[#0C0C10] transition-all duration-300 hover:border-neutral-600 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] cursor-pointer no-underline block",
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
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO (Full Viewport Architectural Cover) ═══ */}
      <PageHero
        title={title}
        viewingText={displayViewingText}
        exploreText={exploreText}
        tagline={tagline}
      />

      <div className="w-full bg-black pb-32 pt-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">
          
          {/* Navigation Toggle / Filter */}
          {showToggle && (
            <div>
              {customToggle || (activeToggle && <ProductStudioToggle active={activeToggle} />)}
            </div>
          )}

          {/* Optional Intro Editorial Header */}
          {(introTag || introDescription) && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-b border-neutral-800 pb-8">
              {introTag && (
                <div className="md:col-span-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C0F0FB] block">
                    {introTag}
                  </span>
                </div>
              )}
              {introDescription && (
                <div className={introTag ? "md:col-span-8" : "md:col-span-12"}>
                  <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed font-normal">
                    {introDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom Slot / Children */}
          {children}

          {/* Product Cards Stack (Exact 360Labs Reference Pattern) */}
          {items.length > 0 ? (
            <div className="space-y-8 sm:space-y-10 lg:space-y-12 pt-4">
              {items.map((product) => (
                <ProductCard key={product.name} product={product} />
              ))}
            </div>
          ) : (
            <div className="min-h-[350px] flex items-center justify-center border border-dashed border-neutral-800/80 rounded-xl p-12 text-center">
              <div className="space-y-3 font-mono">
                <span className="text-neutral-500 text-xs uppercase tracking-widest block">
                  // CATALOG INITIALIZING
                </span>
                <p className="text-neutral-400 text-sm">
                  Platforms are being registered. Check back shortly.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              CLOSING (360Labs Reference Style)
          ══════════════════════════════════════════════════════════════════ */}
          {showClosingCta && (
            <section className="pt-20 pb-12 space-y-20 border-t border-white/10 mt-20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                  <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
                    {ctaTitle || (
                      <>
                        Interested<br />in our Platforms?
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

              {/* Bottom Meta Bar (360labs reference) */}
              <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none pt-8">
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
