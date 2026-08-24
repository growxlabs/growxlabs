"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCalendar
 * Scheduled temporal grid with binder lugs
 */
export const GrowxCalendar = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCalendar" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="7" y1="2" x2="7" y2="6" /><line x1="17" y1="2" x2="17" y2="6" /><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxCalendar.displayName = "GrowxCalendar";
