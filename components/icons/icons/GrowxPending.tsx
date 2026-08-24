"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPending
 * Awaiting execution status with dashed perimeter
 */
export const GrowxPending = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPending" {...props}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" /><polyline points="12 7 12 12 15 15" />
    </GrowxIcon>
  )
);

GrowxPending.displayName = "GrowxPending";
