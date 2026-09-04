"use client";

import React from "react";

interface Feature1Props {
  buttonLabel?: string;
  subtitle?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export const Feature1 = ({
  buttonLabel = "Talk to us",
  whatsappNumber = "918790907144",
  whatsappMessage = "Hi, I'd like to discuss a project with GrowX Labs.",
}: Feature1Props) => {
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
      <div className="max-w-6xl xl:max-w-7xl mx-auto relative">
        {/* Large Horizontal Hero Card with Blog Electric Ice Blue Surface */}
        <div className="relative w-full rounded-[28px] md:rounded-[32px] overflow-hidden bg-[#bdefff] min-h-[340px] sm:min-h-[380px] md:min-h-[400px] flex items-center justify-center shadow-[0_24px_64px_-16px_rgba(0,0,0,0.85)] group cursor-default">
          {/* Subtle Precision Dot Matrix */}
          <div 
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.4) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)"
            }}
          />

          {/* Clean Centered Content: 1-Line Headline + Perfect CTA */}
          <div className="relative z-20 p-8 sm:p-12 md:p-16 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
            {/* Pure 1-Line Bold Headline */}
            <h1 className="text-[clamp(24px,3.2vw,44px)] font-bold tracking-tight text-neutral-950 leading-tight font-sans">
              Building the autonomous infrastructure for AI
            </h1>

            {/* Premium Understated Primary CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2.5 h-[52px] sm:h-[54px] px-8 rounded-[14px] bg-black hover:bg-neutral-900 text-white text-[15px] font-medium transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 border border-black/10 cursor-pointer font-sans group/btn select-none"
            >
              <span>{buttonLabel}</span>
              <span className="text-[#2dd4bf] font-medium text-base leading-none group-hover/btn:translate-x-1 transition-transform duration-200">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
