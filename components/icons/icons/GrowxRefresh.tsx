"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxRefresh
 * Dual-arc cycle synchronization loop
 */
export const GrowxRefresh = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxRefresh" {...props}>
      <path d="M20 11A8 8 0 0 0 5.6 6.8" /><path d="M4 13A8 8 0 0 0 18.4 17.2" /><polyline points="20 4 20 11 13 11" /><polyline points="4 20 4 13 11 13" />
    </GrowxIcon>
  )
);

GrowxRefresh.displayName = "GrowxRefresh";
