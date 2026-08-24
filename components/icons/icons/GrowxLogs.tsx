"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxLogs
 * Sequential execution ledger stream with status ticks
 */
export const GrowxLogs = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxLogs" {...props}>
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="18" x2="18" y2="18" /><circle cx="20" cy="12" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxLogs.displayName = "GrowxLogs";
