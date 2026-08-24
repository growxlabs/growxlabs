"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCopy
 * Dual cascading layered asset sheets
 */
export const GrowxCopy = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCopy" {...props}>
      <rect x="8" y="8" width="13" height="13" rx="2" /><path d="M4 16H3V4C3 2.9 3.9 2 5 2H16V3" />
    </GrowxIcon>
  )
);

GrowxCopy.displayName = "GrowxCopy";
