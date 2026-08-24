"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxArrowLeft
 * Directional vector pointing left (matches ArrowRight geometry)
 */
export const GrowxArrowLeft = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxArrowLeft" {...props}>
      <line x1="20" y1="12" x2="4" y2="12" /><path d="M10 6L4 12L10 18" />
    </GrowxIcon>
  )
);

GrowxArrowLeft.displayName = "GrowxArrowLeft";
