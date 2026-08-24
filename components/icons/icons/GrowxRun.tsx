"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxRun
 * Agent pipeline execution vector
 */
export const GrowxRun = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxRun" {...props}>
      <polygon points="7 4 19 12 7 20 7 4" />
    </GrowxIcon>
  )
);

GrowxRun.displayName = "GrowxRun";
