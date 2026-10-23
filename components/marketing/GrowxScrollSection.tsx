"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ContentState {
  letter: string;
  rightLabel: string | null;
  statement: React.ReactNode;
}

const CONTENT_STATES: ContentState[] = [
  {
    letter: "G",
    rightLabel: null,
    statement: (
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-[#17252D] tracking-tight leading-[1.35] font-sans">
        India's AI-native software Company,<br />
        product studio and AI Engineering Lab
      </h2>
    ),
  },
  {
    letter: "R",
    rightLabel: "WHO WE ARE",
    statement: (
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-[#17252D] tracking-tight leading-[1.35] font-sans">
        A group of builders, engineers and product minds obsessed with software, AI and execution.
      </h2>
    ),
  },
  {
    letter: "O",
    rightLabel: "OUR VISION",
    statement: (
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-[#17252D] tracking-tight leading-[1.35] font-sans">
        We turn ideas into software, AI agents and scalable products.
      </h2>
    ),
  },
  {
    letter: "W",
    rightLabel: "OUR PHILOSOPHY",
    statement: (
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-[#17252D] tracking-tight leading-[1.35] font-sans">
        Not as vendors, but as product partners and technical co-founders.
      </h2>
    ),
  },
  {
    letter: "X",
    rightLabel: "GET IN TOUCH",
    statement: (
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-medium text-[#17252D] tracking-tight leading-[1.35] font-sans">
        We help legacy enterprises become <span className="whitespace-nowrap">AI-native.</span>
      </h2>
    ),
  },
];

/**
 * GrowxScrollSection
 * 
 * Replaces the 5 individual full-screen G/R/O/W/X sections with one
 * continuous, sticky, scroll-driven viewport having five distinct content states.
 * 
 * Features directional optical crossfading (Apple-style cubic-bezier easing),
 * zero layout shift, seamless bi-directional scroll momentum, and buttery transitions.
 */
export function GrowxScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalScrollDistance = containerRef.current.offsetHeight - window.innerHeight;

    if (totalScrollDistance <= 0) return;

    if (rect.top > 0) {
      setActiveIndex(0);
      return;
    }

    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / totalScrollDistance, 0), 1);

    // 5 equidistant states with balanced thresholds for smooth pacing:
    let nextIndex = 0;
    if (progress < 0.18) nextIndex = 0;
    else if (progress < 0.38) nextIndex = 1;
    else if (progress < 0.58) nextIndex = 2;
    else if (progress < 0.78) nextIndex = 3;
    else nextIndex = 4;

    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateScrollState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [updateScrollState]);

  const scrollToState = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const containerTop = scrollTop + rect.top;
    const totalDistance = containerRef.current.offsetHeight - window.innerHeight;
    const targetOffset = containerTop + (totalDistance * (index + 0.5)) / 5;
    window.scrollTo({ top: targetOffset, behavior: "smooth" });
  };

  const currentState = CONTENT_STATES[activeIndex] || CONTENT_STATES[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450vh] sm:h-[500vh]"
      aria-label="GROWX Interactive Presentation"
    >
      {/* ═══ Single Sticky Viewport (100dvh, pinned while scrolling through G-R-O-W-X) ═══ */}
      <div
        role="region"
        aria-label="GROWX Presentation Viewport"
        className="sticky top-0 h-dvh w-full overflow-hidden flex flex-col justify-center px-6 md:px-10 xl:px-16 2xl:px-24 pt-20 sm:pt-28 pb-8 bg-[#A2BECC] border-b border-[#55788D]/20 select-none z-20 growx-sticky-viewport"
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
        }}
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full relative flex items-center justify-center min-h-[300px]">
          
          {/* ═══ Left Vertical Indicators (Desktop) ═══ */}
          <nav
            aria-label="GROWX Navigation"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col items-center gap-4 font-mono text-xs select-none z-30"
          >
            {CONTENT_STATES.map((item, idx) => {
              const isActive = activeIndex === idx;
              const isX = item.letter === "X";

              if (isActive) {
                if (isX) {
                  return (
                    <button
                      key={item.letter}
                      type="button"
                      onClick={() => scrollToState(idx)}
                      aria-current="step"
                      className="px-1.5 py-0.5 rounded bg-[#E5EFF4]/50 text-[#17252D] border border-[#55788D]/30 font-bold transition-all duration-300 cursor-pointer"
                    >
                      [X]
                    </button>
                  );
                }
                return (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => scrollToState(idx)}
                    aria-current="step"
                    className="text-[#17252D] font-bold transition-all duration-300 cursor-pointer"
                  >
                    [{item.letter}]
                  </button>
                );
              }

              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => scrollToState(idx)}
                  className="text-[#304956] transition-colors duration-200 hover:text-[#17252D] cursor-pointer"
                >
                  {item.letter}
                </button>
              );
            })}
          </nav>

          {/* ═══ Centered Statements (Stacked in a single grid cell: zero layout shifts) ═══ */}
          <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full max-w-4xl px-8 z-10">
            {CONTENT_STATES.map((item, idx) => {
              const isCurrent = activeIndex === idx;
              const isPreceding = idx < activeIndex;

              // Directional optical depth: preceding items drift upwards, following rise from below
              const translateY = isCurrent ? "0px" : isPreceding ? "-22px" : "22px";
              const opacity = isCurrent ? 1 : 0;
              const blur = isCurrent ? "0px" : "3px";

              return (
                <div
                  key={item.letter}
                  className="col-start-1 row-start-1 w-full text-center motion-reduce:transition-none"
                  style={{
                    opacity,
                    transform: `translate3d(0, ${translateY}, 0)`,
                    filter: `blur(${blur})`,
                    transition:
                      "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1), filter 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                    pointerEvents: isCurrent ? "auto" : "none",
                    visibility: isCurrent ? "visible" : "hidden",
                  }}
                  aria-hidden={!isCurrent}
                >
                  {item.statement}
                </div>
              );
            })}
          </div>

          {/* ═══ Right Vertical Indicators (Desktop: R, O, W, X labels) ═══ */}
          <div
            className={cn(
              "hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 font-mono text-[10px] tracking-[0.22em] text-[#304956] uppercase select-none items-end leading-relaxed z-30 transition-all duration-400 ease-out",
              currentState.rightLabel
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            )}
            aria-live="polite"
          >
            <span>{currentState.rightLabel || ""}</span>
          </div>

        </div>

        {/* ═══ Bottom Footer (Desktop: Visible on State G) ═══ */}
        <div
          className={cn(
            "hidden sm:flex absolute bottom-8 left-6 right-6 md:left-10 md:right-10 xl:left-16 xl:right-16 2xl:left-24 2xl:right-24 items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#304956] uppercase select-none transition-opacity duration-400 ease-out",
            activeIndex === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span>SOFTWARE STUDIO</span>
          <span className="text-[#17252D] font-bold">{`{ GROWXLABS }`}</span>
          <span>AI LAB</span>
        </div>

        {/* ═══ Mobile Footer (State G: Studio / GrowxLabs / AI Lab) ═══ */}
        <div
          className={cn(
            "flex sm:hidden absolute bottom-8 left-6 right-6 items-center justify-between font-mono text-[9px] tracking-[0.22em] text-[#304956] uppercase select-none transition-opacity duration-400 ease-out",
            activeIndex === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span>SOFTWARE STUDIO</span>
          <span className="text-[#17252D] font-bold">{`{ GROWXLABS }`}</span>
          <span>AI LAB</span>
        </div>

        {/* ═══ Mobile Footer (States R, O, W, X: Label on Left, Letters on Right) ═══ */}
        <div
          className={cn(
            "flex sm:hidden absolute bottom-8 left-6 right-6 items-center justify-between font-mono text-[9px] tracking-[0.18em] text-[#304956] uppercase select-none transition-opacity duration-400 ease-out",
            activeIndex > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span>{currentState.rightLabel || ""}</span>
          <span className="flex items-center gap-2">
            {CONTENT_STATES.map((item, idx) => {
              const isActive = activeIndex === idx;
              const isX = item.letter === "X";

              if (isActive) {
                if (isX) {
                  return (
                    <span
                      key={item.letter}
                      onClick={() => scrollToState(idx)}
                      className="px-1.5 py-0.5 rounded bg-[#A2BECC]/25 text-[#17252D] border border-[#55788D]/30 font-bold transition-all duration-300"
                    >
                      [X]
                    </span>
                  );
                }
                return (
                  <span
                    key={item.letter}
                    onClick={() => scrollToState(idx)}
                    className="text-[#17252D] font-bold transition-all duration-300"
                  >
                    [{item.letter}]
                  </span>
                );
              }

              return (
                <span
                  key={item.letter}
                  onClick={() => scrollToState(idx)}
                  className="text-[#304956] transition-colors duration-200"
                >
                  {item.letter}
                </span>
              );
            })}
          </span>
        </div>

      </div>
    </div>
  );
}
