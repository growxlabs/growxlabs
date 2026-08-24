"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxArrowUp
 * Directional vector pointing up
 */
export const GrowxArrowUp = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxArrowUp" {...props}>
      <line x1="12" y1="20" x2="12" y2="4" /><path d="M6 10L12 4L18 10" />
    </GrowxIcon>
  )
);

GrowxArrowUp.displayName = "GrowxArrowUp";
