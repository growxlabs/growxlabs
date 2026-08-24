"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxChevronUp
 * Upward directional chevron indicator
 */
export const GrowxChevronUp = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxChevronUp" {...props}>
      <path d="M6 14.5L12 8.5L18 14.5" />
    </GrowxIcon>
  )
);

GrowxChevronUp.displayName = "GrowxChevronUp";
