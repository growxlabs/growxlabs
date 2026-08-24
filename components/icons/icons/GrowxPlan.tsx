"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPlan
 * Multi-step reasoning roadmap ledger
 */
export const GrowxPlan = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPlan" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><polyline points="8 13 10 15 15 11" /><line x1="8" y1="18" x2="14" y2="18" />
    </GrowxIcon>
  )
);

GrowxPlan.displayName = "GrowxPlan";
