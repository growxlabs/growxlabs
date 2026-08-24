"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxChart
 * Multi-tier metrics telemetry bars
 */
export const GrowxChart = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxChart" {...props}>
      <line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="11" width="3" height="9" /><rect x="11" y="5" width="3" height="15" /><rect x="16" y="8" width="3" height="12" />
    </GrowxIcon>
  )
);

GrowxChart.displayName = "GrowxChart";
