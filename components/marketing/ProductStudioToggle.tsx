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
            ? "bg-[#C0F0FB] text-black border border-[#C0F0FB] shadow-[0_0_25px_rgba(192,240,251,0.25)]"
            : "bg-[#0A0A0D] text-neutral-400 border border-neutral-800/80 hover:border-neutral-700 hover:text-white"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            active === "products" ? "bg-black" : "bg-neutral-600 group-hover:bg-neutral-400"
          )}
        />
        <span>Products</span>
      </Link>

      <Link
        href="/products/studio"
        className={cn(
          "group flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-xs sm:text-[13px] tracking-[0.14em] uppercase font-bold transition-all duration-300 cursor-pointer select-none",
          active === "studio"
            ? "bg-[#C0F0FB] text-black border border-[#C0F0FB] shadow-[0_0_25px_rgba(192,240,251,0.25)]"
            : "bg-[#0A0A0D] text-neutral-400 border border-neutral-800/80 hover:border-neutral-700 hover:text-white"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            active === "studio" ? "bg-black" : "bg-neutral-600 group-hover:bg-neutral-400"
          )}
        />
        <span>Studio</span>
      </Link>
    </div>
  );
}
