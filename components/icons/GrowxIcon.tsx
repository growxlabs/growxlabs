import React, { forwardRef } from "react";
import { GrowxIconProps } from "./types";

export interface BaseGrowxIconProps extends GrowxIconProps {
  children: React.ReactNode;
}

export const GrowxIcon = forwardRef<SVGSVGElement, BaseGrowxIconProps>(
  (
    {
      size = 24,
      strokeWidth = 1.8,
      className = "",
      children,
      "aria-hidden": ariaHidden,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 inline-block align-middle ${className}`}
        aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </svg>
    );
  }
);

GrowxIcon.displayName = "GrowxIcon";
