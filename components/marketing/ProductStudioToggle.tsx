"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductStudioToggleProps {
  active: "products" | "studio";
}

export function ProductStudioToggle({ active }: ProductStudioToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 select-none pb-2">
      <Link
        href="/products"
        className={cn(
          "group flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-bold transition-all duration-300 cursor-pointer select-none",
          active === "products"
            ? "bg-[#A2BECC] text-[#17252D] border border-[#55788D]/30 shadow-sm"
            : "bg-[#E5EFF4] text-[#55788D] border border-[#55788D]/20 hover:border-[#55788D]/40 hover:text-[#17252D]"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            active === "products" ? "bg-[#17252D]" : "bg-[#55788D] group-hover:bg-[#17252D]"
          )}
        />
        <span>Products</span>
      </Link>

      <Link
        href="/products/studio"
        className={cn(
          "group flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-bold transition-all duration-300 cursor-pointer select-none",
          active === "studio"
            ? "bg-[#A2BECC] text-[#17252D] border border-[#55788D]/30 shadow-sm"
            : "bg-[#E5EFF4] text-[#55788D] border border-[#55788D]/20 hover:border-[#55788D]/40 hover:text-[#17252D]"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            active === "studio" ? "bg-[#17252D]" : "bg-[#55788D] group-hover:bg-[#17252D]"
          )}
        />
        <span>Studio</span>
      </Link>
    </div>
  );
}
