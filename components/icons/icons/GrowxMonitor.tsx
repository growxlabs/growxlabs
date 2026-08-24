"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMonitor
 * Standing automated site inspection monitor
 */
export const GrowxMonitor = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMonitor" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" /><line x1="12" y1="16" x2="12" y2="20" /><line x1="7" y1="20" x2="17" y2="20" /><polyline points="7 10 10 7 13 11 16 9" />
    </GrowxIcon>
  )
);

GrowxMonitor.displayName = "GrowxMonitor";
