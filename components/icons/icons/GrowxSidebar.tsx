"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSidebar
 * Collapsible navigation sidebar perimeter
 */
export const GrowxSidebar = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSidebar" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="8" y1="4" x2="8" y2="20" /><line x1="5" y1="8" x2="6.5" y2="8" /><line x1="5" y1="11" x2="6.5" y2="11" />
    </GrowxIcon>
  )
);

GrowxSidebar.displayName = "GrowxSidebar";
