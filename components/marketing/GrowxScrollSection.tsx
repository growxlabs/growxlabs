"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ContentState {
  letter: string;
  rightLabel: string | null;
  statement: React.ReactNode;
}

/**
 * Single Editorial Sketch L-Shape Accent (Top-Right Only)
 * 
 * Clean hand-drawn editorial marker in dark charcoal (#22282C).
 * Minimalist L-form with two primary strokes (horizontal and vertical)
 * and a single subtle sketch overdraw line. No clutter, no technical diagram lines.
 */
function GrowxEditorialCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
      className={className}
    >
      {/* Primary Horizontal Stroke (Dark Charcoal, 2.5px, subtle organic hand-drafted path) */}
      <path
        d="M 14 20 C 38 19.6, 62 20.3, 86 19.8"
        stroke="#22282C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.72"
      />
      {/* Primary Vertical Stroke (Dark Charcoal, 2.5px, natural drafting overshoot at corner) */}
      <path
        d="M 82 14 C 81.8 38, 82.2 62, 81.9 86"
        stroke="#22282C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.72"
      />
      {/* Subtle Sketch Imperfection: single light companion overdraw trace */}
      <path
        d="M 44 24 C 60 23.8, 74 24.1, 84 24.0"
        stroke="#22282C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.36"
      />
    </svg>
  );
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
 * One stable, pinned Sage Green card. Five editorial statements. One continuous scroll interaction.
 * 
 * The card stays visually stationary beneath the floating site header while
 * scrolling through G → R → O → W → X. Outgoing and incoming text crossfade
 * cleanly with zero layout shift and release naturally at the end of the sequence.
 */
export function GrowxScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!containerRef.current || !cardRef.current) return;
    const container = containerRef.current;
    const card = cardRef.current;
    const rect = container.getBoundingClientRect();

    // Read computed sticky top directly from CSS (dynamic & breakpoint-aware)
    const computedTop = parseFloat(window.getComputedStyle(card).top) || 116;
    const pinDistance = container.offsetHeight - card.offsetHeight;

    if (pinDistance <= 0) return;

    const scrolledInPin = computedTop - rect.top;
    const progress = Math.min(Math.max(scrolledInPin / pinDistance, 0), 1);

    // 5 clean equidistant slices across the pinned scroll track
    let nextIndex = 0;
    if (progress < 0.20) nextIndex = 0;
    else if (progress < 0.40) nextIndex = 1;
    else if (progress < 0.60) nextIndex = 2;
    else if (progress < 0.80) nextIndex = 3;
    else nextIndex = 4;

    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          updateScrollState();
          rafId = null;
        });
      }
    };

    updateScrollState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateScrollState]);

  const scrollToState = (index: number) => {
    if (!containerRef.current || !cardRef.current) return;
    const container = containerRef.current;
    const card = cardRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const containerTop = scrollTop + rect.top;
    const computedTop = parseFloat(window.getComputedStyle(card).top) || 116;
    const pinDistance = container.offsetHeight - card.offsetHeight;
    if (pinDistance <= 0) return;

    const pinStartScroll = containerTop - computedTop;
    const targetOffset = pinStartScroll + (pinDistance * (index + 0.5)) / 5;
    window.scrollTo({ top: targetOffset, behavior: "smooth" });
  };

  const currentState = CONTENT_STATES[activeIndex] || CONTENT_STATES[0];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[350vh] sm:h-[420vh] md:h-[450vh] px-3 sm:px-4 md:px-6 mb-4 sm:mb-6 select-none growx-sticky-viewport !overflow-visible"
      aria-label="GROWX Interactive Presentation"
    >
      {/* ═══ One Stable Pinned Warm Stone Card (Beneath Site Header, Released after X) ═══ */}
      <div
        ref={cardRef}
        role="region"
        aria-label="GROWX Presentation Stage"
        style={{ position: "sticky" }}
        className="sticky top-[92px] sm:top-[98px] md:top-[116px] lg:top-[120px] w-full h-[calc(100dvh-104px)] sm:h-[calc(100dvh-114px)] md:h-[calc(100dvh-140px)] lg:h-[calc(100dvh-144px)] min-h-[460px] sm:min-h-[500px] rounded-[16px] bg-[#E8DDD0] growx-editorial-stage flex flex-col justify-center overflow-hidden z-20 px-6 md:px-10 xl:px-16 2xl:px-24 py-8"
      >
        {/* ═══ Single Editorial Sketch L-Shape Accent (Top-Right Only, 70-110px Presence) ═══ */}
        <GrowxEditorialCorner className="absolute pointer-events-none select-none z-10 top-5 right-5 sm:top-7 sm:right-7 md:top-8 md:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-[88px] md:h-[88px] lg:w-24 lg:h-24" />

        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full relative flex items-center justify-center min-h-[300px]">
          
          {/* ═══ ZONE 1: LEFT — GROWX Navigation Rail (Desktop) ═══ */}
          <nav
            aria-label="GROWX Navigation"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col items-center gap-4 font-mono text-xs select-none z-30"
          >
            {CONTENT_STATES.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => scrollToState(idx)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center border leading-none transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22282C]",
                    isActive
                      ? "border-[#22282C] text-[#22282C] font-bold"
                      : "border-transparent text-[#466778] hover:text-[#22282C]"
                  )}
                >
                  {isActive ? `[${item.letter}]` : item.letter}
                </button>
              );
            })}
          </nav>

          {/* ═══ ZONE 2: CENTER — Editorial Statement (Stable single grid cell: zero layout shifts) ═══ */}
          <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full max-w-4xl px-4 sm:px-12 z-10">
            {CONTENT_STATES.map((item, idx) => {
              const isCurrent = activeIndex === idx;
              const isPreceding = idx < activeIndex;

              // Subtle 10px vertical drift (within 8-12px editorial specification)
              const translateY = isCurrent ? "0px" : isPreceding ? "-10px" : "10px";
              const opacity = isCurrent ? 1 : 0;

              return (
                <div
                  key={item.letter}
                  className="col-start-1 row-start-1 w-full text-center motion-reduce:transition-none motion-reduce:transform-none select-text"
                  style={{
                    opacity,
                    transform: `translate3d(0, ${translateY}, 0)`,
                    transition: isCurrent
                      ? "opacity 260ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, transform 260ms cubic-bezier(0.16, 1, 0.3, 1) 80ms"
                      : "opacity 140ms ease-in, transform 140ms ease-in",
                    pointerEvents: isCurrent ? "auto" : "none",
                  }}
                  aria-hidden={!isCurrent}
                >
                  {item.statement}
                </div>
              );
            })}
          </div>

          {/* ═══ ZONE 3: RIGHT — Section Label (Desktop: WHO WE ARE, OUR VISION, OUR PHILOSOPHY, GET IN TOUCH) ═══ */}
          <div
            className={cn(
              "hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 font-mono text-[10px] tracking-[0.22em] text-[#304956] uppercase select-none items-end leading-relaxed z-30 transition-all duration-300 ease-out",
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
            "hidden sm:flex absolute bottom-6 md:bottom-8 left-8 right-8 md:left-12 md:right-12 xl:left-16 xl:right-16 items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#304956] uppercase select-none transition-opacity duration-300 ease-out",
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
            "flex sm:hidden absolute bottom-5 left-5 right-5 items-center justify-between font-mono text-[9px] tracking-[0.22em] text-[#304956] uppercase select-none transition-opacity duration-300 ease-out",
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
            "flex sm:hidden absolute bottom-5 left-5 right-5 items-center justify-between font-mono text-[9px] tracking-[0.18em] text-[#304956] uppercase select-none transition-opacity duration-300 ease-out",
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
                      className="px-1.5 py-0.5 rounded bg-[#31453E]/15 text-[#17252D] border border-[#31453E]/30 font-bold transition-all duration-300"
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
    </section>
  );
}
