"use client";

import { FlickerText } from "@/components/marketing/FlickerText";

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
              {/* LOWER LEFT — Scroll Direction (Thin outlined vertical pill + label) */}
              <div className="flex items-center gap-3.5 select-none">
                <div 
                  className="w-[37px] h-[54px] rounded-full border border-[#22282C]/55 bg-transparent flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <svg 
                    width="13" 
                    height="17" 
                    viewBox="0 0 14 18" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="stroke-[#22282C]"
                  >
                    <path 
                      d="M7 1V16M7 16L1.5 10.5M7 16L12.5 10.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
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

              {/* LOWER LEFT — Scroll Direction (Pill + Text) */}
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-[32px] h-[48px] rounded-full border border-[#22282C]/55 bg-transparent flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <svg 
                    width="11" 
                    height="15" 
                    viewBox="0 0 14 18" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="stroke-[#22282C]"
                  >
                    <path 
                      d="M7 1V16M7 16L1.5 10.5M7 16L12.5 10.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
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
