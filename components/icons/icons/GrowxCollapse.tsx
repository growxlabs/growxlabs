"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCollapse
 * Diagonal inward collapse vectors
 */
export const GrowxCollapse = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCollapse" {...props}>
      <path d="M4 14H10V20" /><path d="M20 10H14V4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="10" y1="14" x2="3" y2="21" />
    </GrowxIcon>
  )
);

GrowxCollapse.displayName = "GrowxCollapse";
