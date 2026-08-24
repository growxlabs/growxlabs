"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxBug
 * System defect anomaly trace with sensor legs
 */
export const GrowxBug = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxBug" {...props}>
      <rect x="8" y="7" width="8" height="11" rx="4" /><line x1="12" y1="2" x2="12" y2="7" /><line x1="4" y1="10" x2="8" y2="10" /><line x1="16" y1="10" x2="20" y2="10" /><line x1="4" y1="15" x2="8" y2="15" /><line x1="16" y1="15" x2="20" y2="15" />
    </GrowxIcon>
  )
);

GrowxBug.displayName = "GrowxBug";
