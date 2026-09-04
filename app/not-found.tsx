"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 text-center font-sans bg-black text-white">
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center">
        {/* Subtle // error label in Fira Code / monospace */}
        <p className="font-mono text-xs sm:text-sm text-neutral-500 mb-3 select-none tracking-widest lowercase">
          // error
        </p>

        {/* Large Muted 404 Display */}
        <div className="text-8xl sm:text-9xl md:text-[140px] font-sans font-black tracking-tight leading-none select-none text-neutral-200">
          404
        </div>

        {/* Page Not Found Heading - Clean modern sans-serif with proper breathing room */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight text-white mt-6 mb-3">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-sans text-neutral-400 leading-relaxed max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Button matching 360labs.dev reference */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl border border-white/20 bg-white text-black hover:bg-neutral-200 text-sm font-sans font-medium transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
