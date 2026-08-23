"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlickerTextProps {
  text: string;
  className?: string;
  delays?: number[];
}

const flickerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: delay,
      ease: "easeOut",
    },
  }),
};

export function FlickerText({ text, className, delays }: FlickerTextProps) {
  const defaultDelays = [
    0.2, 0.45, 0.1, 0.6, 0.3, 0.8, 0.15, 0.5, 0.7, 0.25, 0.9, 0.35, 0.05, 0.55, 0.4, 0.75,
  ];
  const activeDelays = delays || defaultDelays;
  let letterIdx = 0;

  return (
    <span className={className}>
      {text.split("").map((char, idx) => {
        if (char === " ") {
          return <span key={idx} className="inline-block w-[0.25em]" />;
        }
        const currentDelay = activeDelays[letterIdx % activeDelays.length];
        letterIdx++;
        const isDescender = char === "y" || char === "g" || char === "p" || char === "q" || char === "j";
        return (
          <motion.span
            key={idx}
            className={cn("inline-block", isDescender && "relative -top-[0.06em]")}
            variants={flickerVariants}
            initial="hidden"
            animate="visible"
            custom={currentDelay}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
