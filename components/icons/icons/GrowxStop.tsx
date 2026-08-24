"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxStop
 * Immediate agent halt block
 */
export const GrowxStop = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxStop" {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </GrowxIcon>
  )
);

GrowxStop.displayName = "GrowxStop";
