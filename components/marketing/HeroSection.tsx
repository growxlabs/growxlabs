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
      {/* ═══ DESKTOP HERO (Hidden on mobile) ═══ */}
      <section
        className="hidden sm:flex sm:flex-col w-full relative overflow-hidden z-20 px-6 md:px-10 xl:px-16 2xl:px-24 pt-28 pb-0 min-h-dvh justify-between bg-black"
        aria-labelledby="hero-studio-heading-desktop"
      >
        {/* Empty flex spacer at top to push content down */}
        <div className="flex-grow" />

        {/* Middle part: Swiss Grid columns aligned to the right */}
        <div className="w-full flex flex-col items-end mb-36 z-10 select-none">
          {/* Subtle horizontal grid line for Swiss architectural framing */}
          <div className="w-full max-w-4xl pr-8 mb-6">
            <div className="w-full h-[1px] bg-border" />
          </div>

          <div className="flex flex-row justify-between w-full max-w-4xl gap-8 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-muted-foreground leading-[1.65] uppercase text-left pr-8">
            <div>
              YOU ARE<br />
              NOW<br />
              ENTERING
            </div>
            <div>
              SCROLL<br />
              TO<br />
              EXPLORE
            </div>
            <div className="text-foreground font-bold">
              AI-NATIVE<br />
              PRODUCT STUDIO &<br />
              ENGINEERING LAB
            </div>
            <div>
              © 2026 // GL-X<br />
              ALL RIGHTS RESERVED
            </div>
          </div>
        </div>

        {/* Bottom part: Massive Brand Title touching the bottom */}
        <div className="w-full flex justify-center items-end select-none pointer-events-none z-0 translate-y-[3%] overflow-visible">
          <h1
            id="hero-studio-heading-desktop"
            className="font-sans font-black select-none tracking-[-0.05em] text-foreground leading-[0.8] whitespace-nowrap inline-block origin-bottom scale-y-[1.35]"
            style={{ fontSize: "14.2vw" }}
          >
            <FlickerText text={brandName} delays={flickerDelays} />
          </h1>
        </div>
      </section>

      {/* ═══ SWISS-EDITORIAL MOBILE HERO (Visible only on mobile) ═══ */}
      <section
        className="flex sm:hidden w-full relative overflow-hidden px-6 pt-28 pb-10 min-h-dvh items-center bg-black"
        aria-labelledby="hero-studio-heading-mobile"
      >
        <div className="relative w-full flex flex-row items-center justify-between">
          
          {/* Left Column: Swiss Editorial Stack */}
          <div className="flex flex-col justify-between h-[62dvh] text-left pr-4 select-none z-10">
            {/* Top Indicator */}
            <div className="font-mono text-[10px] tracking-[0.22em] font-extrabold text-foreground uppercase">
              [ GROWXLABS ]
            </div>

            {/* Middle Editorial Block */}
            <div className="flex flex-col gap-5 font-mono text-[9px] tracking-[0.18em] text-muted-foreground leading-[1.65] uppercase">
              <div>
                YOU ARE<br />
                NOW<br />
                ENTERING
              </div>
              <div>
                GROWXLABS<br />
                TO<br />
                EXPLORE
              </div>
              <div className="w-5 h-[1px] bg-border" />
              <div className="text-foreground font-bold">
                AI-NATIVE<br />
                PRODUCT STUDIO &<br />
                ENGINEERING LAB
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="font-mono text-[9px] tracking-[0.15em] text-[#9CA3AF] uppercase leading-relaxed">
              © 2026 // GL-X<br />
              ALL RIGHTS RESERVED
            </div>
          </div>

          {/* Right Column: Rotated Vertical Brand Title pinned perfectly to the right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90px] h-[75dvh] flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <h1
              id="hero-studio-heading-mobile"
              className="font-sans rotate-[-90deg] whitespace-nowrap text-foreground font-black select-none tracking-[-0.04em] leading-none"
              style={{
                fontSize: "clamp(2.2rem, 8vh, 4.2rem)",
              }}
            >
              <FlickerText text={brandName} delays={flickerDelays} />
            </h1>
          </div>

        </div>
      </section>
    </>
  );
}
