"use client";

import React from "react";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { ArrowLeft } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="w-full min-h-[85vh] flex-1 flex flex-col items-center justify-center px-6 py-16 text-center font-sans bg-black text-white">
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center">
        {/* Monospace error badge with spacious tracking */}
        <p className="font-mono text-xs sm:text-sm text-neutral-500 uppercase tracking-[0.25em] select-none mb-2">
          // 404 error
        </p>

        {/* Large Architectural 404 Display - widely spaced digits, no squeezing */}
        <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-[0.2em] text-neutral-100 select-none my-4 sm:my-6 pl-[0.2em]">
          404
        </div>

        {/* Page Not Found Heading - Clean modern sans-serif with proper breathing room */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight text-white mb-3">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-sans text-neutral-400 leading-relaxed max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Standardized Reusable Liquid Button */}
        <LiquidButton
          href="/"
          variant="cyan"
          size="default"
          icon={<ArrowLeft size={16} />}
          iconPosition="left"
        >
          Back to Home
        </LiquidButton>
      </div>
    </div>
  );
}
