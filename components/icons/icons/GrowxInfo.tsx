"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxInfo
 * Informational telemetry status marker
 */
export const GrowxInfo = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxInfo" {...props}>
      <circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxInfo.displayName = "GrowxInfo";
