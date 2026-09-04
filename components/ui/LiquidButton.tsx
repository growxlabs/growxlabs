"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LiquidButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "cyan" | "dark" | "white";
  size?: "default" | "sm" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  target?: string;
  rel?: string;
}

export function LiquidButton({
  children,
  href,
  onClick,
  type = "button",
  className,
  variant = "cyan",
  size = "default",
  icon,
  iconPosition = "left",
  target,
  rel,
}: LiquidButtonProps) {
  const sizeClasses = {
    sm: "h-7 sm:h-8 px-3 sm:px-4 text-[11px] sm:text-xs",
    default: "h-8 sm:h-9 md:h-10 px-3.5 sm:px-5 md:px-6 min-w-0 sm:min-w-[96px] md:min-w-[108px] text-xs sm:text-xs md:text-sm",
    lg: "h-10 sm:h-11 md:h-12 min-w-0 sm:min-w-[120px] px-5 sm:px-7 md:px-8 text-xs sm:text-sm md:text-base",
  }[size];

  const variantStyles = {
    cyan: {
      border: "border border-[#C0F0FB] text-[#C0F0FB]",
      wave: "bg-[#C0F0FB]",
      hoverText: "group-hover:text-black group-active:text-black",
    },
    dark: {
      border: "border border-[#111111]/25 text-[#111111]",
      wave: "bg-[#111111]",
      hoverText: "group-hover:text-[#F7F4EE] group-active:text-[#F7F4EE]",
    },
    white: {
      border: "border border-white/30 text-white",
      wave: "bg-white",
      hoverText: "group-hover:text-black group-active:text-black",
    },
  }[variant];

  const innerContent = (
    <span
      className={cn(
        "group relative inline-flex items-center justify-center font-bold rounded-md overflow-hidden transition-all duration-300 shadow-sm cursor-pointer select-none active:scale-[0.98]",
        sizeClasses,
        variantStyles.border,
        className
      )}
    >
      {/* Liquid / Water Wave Fill Layer */}
      <span
        className={cn(
          "absolute -bottom-[20%] -left-[15%] -right-[15%] h-[140%] translate-y-[120%] group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500 rounded-t-[100%] pointer-events-none",
          variantStyles.wave
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
      />
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors duration-300 font-bold",
          variantStyles.hoverText
        )}
      >
        {icon && iconPosition === "left" && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === "right" && <span className="inline-flex shrink-0">{icon}</span>}
      </span>
    </span>
  );

  if (href) {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          onClick={onClick}
          target={target}
          rel={rel}
          className="inline-block no-underline"
        >
          {innerContent}
        </a>
      );
    }
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-block no-underline"
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-block bg-transparent border-0 p-0 cursor-pointer"
    >
      {innerContent}
    </button>
  );
}
