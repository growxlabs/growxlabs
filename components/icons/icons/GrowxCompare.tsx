"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCompare
 * Side-by-side schema difference analyzer
 */
export const GrowxCompare = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCompare" {...props}>
      <rect x="3" y="4" width="8" height="16" rx="1.5" /><rect x="13" y="4" width="8" height="16" rx="1.5" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="17" y1="8" x2="17" y2="12" />
    </GrowxIcon>
  )
);

GrowxCompare.displayName = "GrowxCompare";
