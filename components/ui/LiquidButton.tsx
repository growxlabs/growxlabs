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
  variant?: "primary" | "secondary" | "outline" | "ghost" | "cyan" | "dark" | "white" | "airforce";
  size?: "default" | "sm" | "lg" | "full";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  target?: string;
  rel?: string;
  disabled?: boolean;
}

export function LiquidButton({
  children,
  href,
  onClick,
  type = "button",
  className,
  variant = "primary",
  size = "default",
  icon,
  iconPosition = "left",
  target,
  rel,
  disabled = false,
}: LiquidButtonProps) {
  // Normalize variants: primary (default) or secondary
  const normalizedVariant = (() => {
    if (variant === "secondary" || variant === "white") return "secondary";
    if (variant === "outline") return "outline";
    if (variant === "ghost") return "ghost";
    // "primary", "airforce", "dark", "cyan" map to primary dark button
    return "primary";
  })();

  const sizeClasses = {
    sm: "h-[36px] px-4 text-xs",
    default: "h-[44px] px-6 text-[13px]",
    lg: "h-[48px] px-8 text-sm",
    full: "w-full h-[44px] px-6 text-[13px]",
  }[size];

  const variantStyles = {
    // Primary dark button: Midnight #22282C -> Earth #E9E7E1 fill rising from bottom
    primary: {
      container: "bg-[#22282C] text-[#FFFFFF] border border-[#22282C]",
      fill: "bg-[#E9E7E1]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },
    // Secondary light button: Earth #E9E7E1 -> Midnight #22282C fill rising from bottom
    secondary: {
      container: "bg-[#E9E7E1] text-[#22282C] border border-[#22282C]",
      fill: "bg-[#22282C]",
      hoverText: "group-hover:text-[#FFFFFF] group-focus-visible:text-[#FFFFFF] group-active:text-[#FFFFFF]",
    },
    outline: {
      container: "bg-transparent text-[#22282C] border border-[#22282C]",
      fill: "bg-[#22282C]",
      hoverText: "group-hover:text-[#FFFFFF] group-focus-visible:text-[#FFFFFF] group-active:text-[#FFFFFF]",
    },
    ghost: {
      container: "bg-transparent text-[#22282C] border border-transparent",
      fill: "bg-[#E9E7E1]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },
  }[normalizedVariant];

  const innerContent = (
    <span
      className={cn(
        "group relative inline-flex items-center justify-center font-sans font-semibold tracking-[0.04em] uppercase overflow-hidden select-none cursor-pointer box-border !rounded-none rounded-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22282C] focus-visible:ring-offset-2",
        sizeClasses,
        variantStyles.container,
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {/* 
        Exact Motion Specification:
        - Direction: Bottom -> Top
        - Duration: 700ms
        - Easing: cubic-bezier(0.22, 1, 0.36, 1)
        - Fill technique: CSS transform translateY(100%) -> translateY(0)
        - Reverse: Smooth downward retreat
        - Border radius: 0px (sharp rectangular)
      */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 w-full h-full translate-y-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 group-active:translate-y-0 motion-reduce:transition-none",
          variantStyles.fill
        )}
      />

      {/* Button Text & Icons Layer */}
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-[500ms] ease-out font-sans font-semibold",
          variantStyles.hoverText
        )}
      >
        {icon && iconPosition === "left" && <span className="inline-flex shrink-0">{icon}</span>}
        <span className="whitespace-nowrap">{children}</span>
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
          className={cn("inline-block no-underline select-none", className?.includes("w-full") && "w-full block")}
        >
          {innerContent}
        </a>
      );
    }
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn("inline-block no-underline select-none", className?.includes("w-full") && "w-full block")}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "inline-block bg-transparent border-0 p-0 select-none",
        className?.includes("w-full") && "w-full block",
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
      )}
    >
      {innerContent}
    </button>
  );
}

export { LiquidButton as FluidButton };
