"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMinimize
 * Window minimize anchor rule
 */
export const GrowxMinimize = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMinimize" {...props}>
      <line x1="5" y1="19" x2="19" y2="19" />
    </GrowxIcon>
  )
);

GrowxMinimize.displayName = "GrowxMinimize";
