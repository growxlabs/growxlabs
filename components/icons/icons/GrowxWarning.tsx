"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxWarning
 * Geometric hazard alert beacon
 */
export const GrowxWarning = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxWarning" {...props}>
      <polygon points="12 3 22 20 2 20 12 3" /><line x1="12" y1="9" x2="12" y2="14" /><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxWarning.displayName = "GrowxWarning";
