"use client";

import { cn } from "@/lib/utils";
import { FlickerText } from "@/components/marketing/FlickerText";

interface PageHeroProps {
  title: string;          // e.g. "Services", "Portfolio", "Products", "Courses", "Blog", "About", "Contact"
  viewingText: string;    // e.g. "SERVICES", "PORTFOLIO", etc.
  exploreText?: string;   // e.g. "WHAT WE DO", etc.
  tagline?: string;       // e.g. "AI ENGINEERING", etc.
  className?: string;
}

export function PageHero({
  title,
  viewingText,
  exploreText = "EXPLORE",
  tagline = "SYSTEMS & LAB",
  className,
}: PageHeroProps) {
  const isMultiLine = title.includes("\n");
  const maxLineLength = isMultiLine
    ? Math.max(...title.split("\n").map((l) => l.length))
    : title.length;

  const desktopFontSize = isMultiLine
    ? maxLineLength <= 20
      ? "clamp(3rem, 6.2vw, 7.2rem)"
      : "clamp(2.5rem, 5vw, 6rem)"
    : title.length <= 7
    ? "clamp(4.5rem, 13.5vw, 15.5rem)"
    : title.length <= 9
    ? "clamp(4rem, 11vw, 13.5rem)"
    : title.length <= 12
    ? "clamp(3.5rem, 9vw, 11.5rem)"
    : title.length <= 18
    ? "clamp(2.8rem, 6.2vw, 8rem)"
    : title.length <= 26
    ? "clamp(2.2rem, 4.6vw, 6rem)"
    : "clamp(1.75rem, 3.6vw, 4.5rem)";

  const mobileTitle = title.replace(/\n/g, " ");
  const mobileCharCount = mobileTitle.length;
  const mobileFontSize =
    mobileCharCount <= 12
      ? "clamp(1.8rem, 6.8vh, 3.4rem)"
      : mobileCharCount <= 22
      ? "clamp(1.2rem, 4.2vh, 2.2rem)"
      : mobileCharCount <= 36
      ? "clamp(0.95rem, 3.4vh, 1.8rem)"
      : "clamp(0.85rem, 2.8vh, 1.5rem)";

  return (
    <div className={cn("w-full bg-black relative overflow-hidden select-none", className)}>
      {/* ═══ DESKTOP HERO (Hidden on mobile) ═══ */}
      <section
        className="hidden sm:flex sm:flex-col w-full relative overflow-hidden z-20 px-6 md:px-10 xl:px-16 2xl:px-24 pt-28 pb-6 md:pb-8 min-h-dvh justify-between bg-black select-none"
      >
        <div className="flex-grow" />

        {/* Middle part: Swiss Grid columns aligned to the right */}
        <div className={cn("w-full flex flex-col items-end z-10 select-none", isMultiLine ? "mb-14" : "mb-28")}>
          {/* Subtle horizontal grid line for Swiss architectural framing */}
          <div className="w-full max-w-4xl pr-8 mb-6">
            <div className="w-full h-[1px] bg-border" />
          </div>

          <div className="flex flex-row justify-between w-full max-w-4xl gap-8 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-muted-foreground leading-[1.65] uppercase text-left pr-8">
            <div>
              YOU ARE<br />
              NOW<br />
              ENTERING <span className="text-foreground font-bold">{viewingText}</span>
            </div>
            <div>
              SCROLL<br />
              TO<br />
              {exploreText}
            </div>
            <div className="text-foreground font-bold">
              AI-NATIVE<br />
              PRODUCT STUDIO &<br />
              {tagline}
            </div>
            <div>
              © 2026 // GL-X<br />
              ALL RIGHTS RESERVED
            </div>
          </div>
        </div>

        {/* Bottom part: Massive Brand Title touching the bottom */}
        <div className={cn(
          "w-full flex justify-start items-end select-none pointer-events-none z-0 overflow-visible mb-2",
          !isMultiLine && title.length <= 12 ? "-ml-2 md:-ml-4 xl:-ml-6" : "ml-0"
        )}>
          <h1
            className={cn(
              "font-sans font-black select-none tracking-[0.01em] text-foreground inline-block origin-bottom",
              isMultiLine ? "leading-[0.9] whitespace-pre-line" : "leading-[0.85] whitespace-nowrap"
            )}
            style={{ fontSize: desktopFontSize }}
          >
            <FlickerText text={title} />
          </h1>
        </div>
      </section>

      {/* ═══ SWISS-EDITORIAL MOBILE HERO (Visible only on mobile) ═══ */}
      <section
        className="flex sm:hidden w-full relative overflow-hidden px-6 pt-28 pb-10 min-h-dvh items-center bg-black"
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
                ENTERING <span className="text-foreground font-bold">{viewingText}</span>
              </div>
              <div>
                SCROLL<br />
                TO<br />
                {exploreText}
              </div>
              <div className="w-5 h-[1px] bg-border" />
              <div className="text-foreground font-bold">
                AI-NATIVE<br />
                PRODUCT STUDIO &<br />
                {tagline}
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
              className="font-sans rotate-[-90deg] whitespace-nowrap text-foreground font-black select-none tracking-[0.03em] leading-none"
              style={{
                fontSize: mobileFontSize,
              }}
            >
              <FlickerText text={mobileTitle} />
            </h1>
          </div>

        </div>
      </section>
    </div>
  );
}
