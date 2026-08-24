"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMoreVertical
 * 3-point vertical index array
 */
export const GrowxMoreVertical = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMoreVertical" {...props}>
      <circle cx="12" cy="5" r="1.25" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxMoreVertical.displayName = "GrowxMoreVertical";
