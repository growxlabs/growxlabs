"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxArrowDown
 * Directional vector pointing down
 */
export const GrowxArrowDown = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxArrowDown" {...props}>
      <line x1="12" y1="4" x2="12" y2="20" /><path d="M6 14L12 20L18 14" />
    </GrowxIcon>
  )
);

GrowxArrowDown.displayName = "GrowxArrowDown";
