"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxTeam
 * Structured organizational team cell
 */
export const GrowxTeam = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxTeam" {...props}>
      <rect x="3" y="7" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="2.5" /><circle cx="7" cy="14" r="1.5" /><circle cx="17" cy="14" r="1.5" /><line x1="8" y1="3" x2="16" y2="3" />
    </GrowxIcon>
  )
);

GrowxTeam.displayName = "GrowxTeam";
