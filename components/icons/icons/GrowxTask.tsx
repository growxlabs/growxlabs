"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxTask
 * Discrete executable agent unit
 */
export const GrowxTask = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxTask" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 12L11 14L15 10" />
    </GrowxIcon>
  )
);

GrowxTask.displayName = "GrowxTask";
