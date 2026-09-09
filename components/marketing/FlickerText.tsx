"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FlickerTextProps {
  text: string;
  className?: string;
  delays?: number[];
}

export function FlickerText({ text, className, delays }: FlickerTextProps) {
  const defaultDelays = [
    0.2, 0.45, 0.1, 0.6, 0.3, 0.8, 0.15, 0.5, 0.7, 0.25, 0.9, 0.35, 0.05, 0.55, 0.4, 0.75,
  ];
  const activeDelays = delays || defaultDelays;
  let letterIdx = 0;

  return (
    <span className={className}>
      <style>{`
        @keyframes flickerEntrance {
          0% { opacity: 0; }
          20% { opacity: 1; }
          35% { opacity: 0.15; }
          50% { opacity: 0.9; }
          65% { opacity: 0.3; }
          80% { opacity: 1; }
          90% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .flicker-char {
          animation: flickerEntrance 0.85s ease-in-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .flicker-char {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
      {text.split("").map((char, idx) => {
        if (char === "\n") {
          return <br key={idx} />;
        }
        if (char === " ") {
          return <span key={idx} className="inline-block w-[0.25em]" />;
        }
        const currentDelay = activeDelays[letterIdx % activeDelays.length];
        letterIdx++;
        const isDescender = char === "y" || char === "g" || char === "p" || char === "q" || char === "j";
        return (
          <span
            key={idx}
            className={cn("inline-block flicker-char", isDescender && "relative -top-[0.06em]")}
            style={{ animationDelay: `${currentDelay}s` }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
