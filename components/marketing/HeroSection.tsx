"use client";

import { FlickerText } from "@/components/marketing/FlickerText";

/**
 * Refined hand-drawn sketched scroll indicator icon.
 * Features a subtle engineering sketch vertical oval with a single confident pen stroke,
 * housing a hand-sketched downward arrow with balanced proportions and crisp stroke clarity.
 */
function SketchedScrollIcon({
  width = 37,
  height = 54,
  className = ""
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 39 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hand-sketched engineering oval: single confident pen stroke with subtle natural overlap at top-left */}
      <path
        d="M 17.5 3.2 C 28 2.5, 36.2 10.2, 36 21 C 35.8 31.5, 36.2 39.2, 34 46.5 C 31.2 53.5, 24 55, 18.8 54.8 C 10.5 54.5, 2.8 48.8, 3 37.2 C 3.2 25, 2.5 16.5, 5.2 10.2 C 8 3.8, 15.5 2.6, 20.5 3"
        stroke="#22282C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Downward arrow shaft: crisp vertical line with subtle organic draw */}
      <path
        d="M 19.2 16.2 C 19.1 23.5, 19.4 31.5, 19.3 40"
        stroke="#22282C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Sketched arrowhead: left barb */}
      <path
        d="M 13.5 33.8 C 15.2 36, 17.2 38.2, 19.3 40"
        stroke="#22282C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sketched arrowhead: right barb */}
      <path
        d="M 19.3 40 C 21.2 38, 23.4 35.8, 25 34.2"
        stroke="#22282C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Minimal home hero: features standard desktop view and the vertical
 * Swiss-design editorial mobile view inspired by 360labs.dev.
 * Includes individual letter neon flicker-in animation delays with
 * spaced text "GROW X LABS TECH" for maximum high-end readability.
 */
export function HeroSection() {
  const brandName = "GrowX Labs";
  
  // Custom neon flicker-in delays to mimic a high-fidelity retro studio load
  const flickerDelays = [
    1.02, // G
    0.48, // r
    1.38, // o
    0.72, // w
    1.15, // X
    0.35, // L
    0.95, // a
    0.58, // b
    1.25  // s
  ];

  return (
    <>
      {/* ═══ DESKTOP HERO CARD (Hidden on mobile) ═══ */}
      {/* Outer canvas wrapper: hero card extends under the header (pt-3 md:pt-4, 24px side gutters) */}
      <div className="hidden sm:block w-full pt-3 md:pt-4 px-4 md:px-6 pb-4 md:pb-6 select-none">
        <section
          className="w-full relative overflow-hidden z-20 pt-0 pb-0 min-h-[calc(100dvh-32px)] flex flex-col justify-between bg-[#A2BECC] rounded-[16px]"
          aria-labelledby="hero-studio-heading-desktop"
        >
          {/* Asymmetric Editorial Metadata Container (pt-28 md:pt-32 ensures content starts safely below floating header) */}
          <div className="w-full flex flex-col justify-between flex-grow pt-28 md:pt-32 px-[6.5%] pb-4 z-10">
            {/* ═══ UPPER ZONE: Introduction (Left) + Company Description (Right) ═══ */}
            <div className="w-full flex flex-row justify-between items-start gap-8">
              {/* TOP LEFT — Introduction */}
              <div 
                className="font-sans font-[780] text-[#22282C] leading-[1.03] tracking-[-0.045em] select-none"
                style={{ fontSize: "clamp(26px, 3.4vw, 46px)" }}
              >
                <div>YOU ARE</div>
                <div>NOW</div>
                <div className="pl-3 sm:pl-4 md:pl-5">ENTERING.</div>
              </div>

              {/* TOP RIGHT — Company Description */}
              <div className="flex flex-col text-left select-none max-w-md pt-0.5 sm:pt-1">
                <span className="font-mono text-[11px] uppercase text-[#55788D] tracking-[0.2em] mb-3.5 font-medium block">
                  WHAT WE ARE
                </span>
                <h2 className="font-sans text-[20px] sm:text-[23px] md:text-[25px] lg:text-[27px] xl:text-[28px] font-semibold text-[#22282C] leading-[1.2] tracking-[-0.025em]">
                  AI-NATIVE<br />
                  PRODUCT STUDIO &<br />
                  ENGINEERING LAB
                </h2>
              </div>
            </div>

            {/* ═══ LOWER ZONE: Scroll Direction (Left) + Copyright (Right) ═══ */}
            <div className="w-full flex flex-row justify-between items-end mb-4 sm:mb-6 lg:mb-8">
              {/* LOWER LEFT — Scroll Direction (Sketched vertical pill + label) */}
              <div 
                className="flex items-center gap-3.5 select-none cursor-pointer group"
                onClick={() => {
                  const target = document.getElementById("ai-platforms-label");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const target = document.getElementById("ai-platforms-label");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
                    }
                  }
                }}
                aria-label="Scroll to explore"
              >
                <SketchedScrollIcon
                  width={37}
                  height={54}
                  className="flex-shrink-0 transition-opacity duration-200 group-hover:opacity-75 motion-reduce:transition-none"
                />
                <div className="font-mono text-[11px] font-semibold text-[#22282C] leading-[1.35] tracking-[0.15em] uppercase">
                  SCROLL TO<br />
                  EXPLORE
                </div>
              </div>

              {/* LOWER RIGHT — Copyright */}
              <div className="font-mono text-[11px] text-[#353A3E] uppercase tracking-[0.16em] text-right leading-[1.55] select-none">
                © 2026 // GX-L<br />
                ALL RIGHTS RESERVED
              </div>
            </div>
          </div>

          {/* Bottom part: Monumental Brand Title spanning ~94–96% of card width */}
          <div className="w-full px-2 sm:px-3 md:px-4 flex justify-center items-end select-none pointer-events-none z-10 translate-y-[3%] overflow-visible">
            <h1
              id="hero-studio-heading-desktop"
              className="font-sans font-black select-none tracking-[-0.05em] text-[#22282C] leading-[0.8] whitespace-nowrap inline-block origin-bottom scale-y-[1.35]"
              style={{ fontSize: "17.0vw" }}
            >
              <FlickerText text={brandName} delays={flickerDelays} />
            </h1>
          </div>
        </section>
      </div>

      {/* ═══ SWISS-EDITORIAL MOBILE HERO CARD (Visible only on mobile) ═══ */}
      {/* Outer canvas wrapper: hero card extends under the mobile header (pt-3, 12px side gutters) */}
      <div className="block sm:hidden w-full pt-3 px-3 pb-3 select-none">
        <section
          className="w-full relative overflow-hidden px-5 pt-24 pb-6 min-h-[calc(100dvh-24px)] flex items-center bg-[#A2BECC] rounded-[16px]"
          aria-labelledby="hero-studio-heading-mobile"
        >
          <div className="relative w-full flex flex-row items-center justify-between z-10">
            
            {/* Left Column: Asymmetric Editorial Stack */}
            <div className="flex flex-col justify-between h-[64dvh] text-left pr-4 max-w-[calc(100%-90px)] select-none z-10">
              {/* TOP LEFT — Introduction */}
              <div className="font-sans font-[780] text-[#22282C] leading-[1.04] tracking-[-0.04em] text-[25px]">
                <div>YOU ARE</div>
                <div>NOW</div>
                <div className="pl-3">ENTERING.</div>
              </div>

              {/* TOP RIGHT / MIDDLE — Company Description */}
              <div className="flex flex-col text-left">
                <span className="font-mono text-[10px] uppercase text-[#55788D] tracking-[0.2em] mb-2 font-medium">
                  WHAT WE ARE
                </span>
                <h2 className="font-sans text-[16px] font-semibold text-[#22282C] leading-[1.22] tracking-tight">
                  AI-NATIVE<br />
                  PRODUCT STUDIO &<br />
                  ENGINEERING LAB
                </h2>
              </div>

              {/* LOWER LEFT — Scroll Direction (Sketched vertical pill + label) */}
              <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => {
                  const target = document.getElementById("ai-platforms-label");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const target = document.getElementById("ai-platforms-label");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
                    }
                  }
                }}
                aria-label="Scroll to explore"
              >
                <SketchedScrollIcon
                  width={32}
                  height={48}
                  className="flex-shrink-0 transition-opacity duration-200 group-hover:opacity-75 motion-reduce:transition-none"
                />
                <div className="font-mono text-[10px] font-semibold text-[#22282C] leading-tight tracking-[0.14em] uppercase">
                  SCROLL TO<br />
                  EXPLORE
                </div>
              </div>

              {/* LOWER RIGHT / BOTTOM — Copyright */}
              <div className="font-mono text-[10px] text-[#353A3E] uppercase tracking-[0.15em] leading-relaxed">
                © 2026 // GX-L<br />
                ALL RIGHTS RESERVED
              </div>
            </div>

            {/* Right Column: Rotated Vertical Brand Title pinned to the right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[86px] h-[72dvh] flex items-center justify-center pointer-events-none z-10 overflow-hidden">
              <h1
                id="hero-studio-heading-mobile"
                className="font-sans rotate-[-90deg] whitespace-nowrap text-[#22282C] font-black select-none tracking-[-0.04em] leading-none"
                style={{
                  fontSize: "clamp(2.3rem, 7.8vh, 4.2rem)",
                }}
              >
                <FlickerText text={brandName} delays={flickerDelays} />
              </h1>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
