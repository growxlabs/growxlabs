"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxReason
 * Autonomous inference logic branch
 */
export const GrowxReason = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxReason" {...props}>
      <circle cx="12" cy="12" r="8" /><polyline points="12 6 12 12 16 10" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxReason.displayName = "GrowxReason";
