"use client";

import React from "react";
import { PageHero } from "@/components/marketing/PageHero";
import { ProductStudioToggle } from "@/components/marketing/ProductStudioToggle";

export default function ProductsPage() {
  return (
    <div className="flex flex-col bg-black text-foreground min-h-screen">
      <PageHero
        title="Products"
        viewingText="PRODUCTS"
        exploreText="PLATFORMS"
        tagline="OWN PRODUCTS"
      />

      <div className="w-full bg-black pb-32 pt-8 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">
          
          {/* Navigation Toggle: Products / Studio */}
          <ProductStudioToggle active="products" />

          {/* Clean canvas ready for user-specified products */}
          <div className="min-h-[350px]" />

          {/* End of Products Separator */}
          <div className="mt-20 sm:mt-24 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 uppercase tracking-widest">
              <span>{"// End of Products"}</span>
              <span>GrowX Labs</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
