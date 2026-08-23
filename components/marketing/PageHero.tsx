"use client";

import { motion } from "framer-motion";
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
  const charCount = title.length;
  const desktopFontSize =
    charCount <= 7
      ? "clamp(4.5rem, 13.5vw, 15.5rem)"
      : charCount <= 9
      ? "clamp(4rem, 11vw, 13.5rem)"
      : "clamp(3.5rem, 9vw, 11.5rem)";

  return (
    <div className={cn("w-full bg-background relative overflow-hidden select-none", className)}>
      {/* ═══ DESKTOP HERO (Hidden on mobile) ═══ */}
      <section
        className="hidden sm:flex sm:flex-col w-full relative overflow-hidden z-20 px-6 md:px-10 xl:px-16 2xl:px-24 pt-28 pb-6 md:pb-8 min-h-dvh justify-between select-none"
      >
        <div className="flex-grow" />

        {/* Middle part: Swiss Grid columns aligned to the right */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-end mb-28 z-10 select-none"
        >
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
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="w-full flex justify-start items-end select-none pointer-events-none z-0 overflow-visible -ml-2 md:-ml-4 xl:-ml-6 mb-2"
        >
          <h1
            className="font-sans font-black select-none tracking-[0.01em] text-foreground leading-[0.85] whitespace-nowrap inline-block origin-bottom"
            style={{ fontSize: desktopFontSize }}
          >
            <FlickerText text={title} />
          </h1>
        </motion.div>
      </section>

      {/* ═══ SWISS-EDITORIAL MOBILE HERO (Visible only on mobile) ═══ */}
      <section
        className="flex sm:hidden w-full relative overflow-hidden px-6 pt-28 pb-10 min-h-dvh items-center"
      >
        <div className="relative w-full flex flex-row items-center justify-between">
          
          {/* Left Column: Swiss Editorial Stack */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-between h-[62dvh] text-left pr-4 select-none z-10"
          >
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
          </motion.div>

          {/* Right Column: Rotated Vertical Brand Title pinned perfectly to the right */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[90px] h-[75dvh] flex items-center justify-center pointer-events-none z-0 overflow-hidden"
          >
            <h1
              className="font-sans rotate-[-90deg] whitespace-nowrap text-foreground font-black select-none tracking-[0.03em] leading-none"
              style={{
                fontSize: "clamp(1.8rem, 6.8vh, 3.4rem)",
              }}
            >
              <FlickerText text={title} />
            </h1>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
