"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxClock
 * Precision chronograph dial with orthogonal hands
 */
export const GrowxClock = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxClock" {...props}>
      <circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxClock.displayName = "GrowxClock";
