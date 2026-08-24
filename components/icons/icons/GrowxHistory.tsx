"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxHistory
 * Temporal counter-clockwise replay trace
 */
export const GrowxHistory = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxHistory" {...props}>
      <path d="M3 12A9 9 0 1 0 5.6 5.6" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15 15" />
    </GrowxIcon>
  )
);

GrowxHistory.displayName = "GrowxHistory";
