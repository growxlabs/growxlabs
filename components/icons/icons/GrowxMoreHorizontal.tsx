"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMoreHorizontal
 * 3-point horizontal index array
 */
export const GrowxMoreHorizontal = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMoreHorizontal" {...props}>
      <circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxMoreHorizontal.displayName = "GrowxMoreHorizontal";
