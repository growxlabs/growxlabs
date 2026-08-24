"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxScreenshot
 * Visual DOM render frame with aperture lens
 */
export const GrowxScreenshot = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxScreenshot" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxScreenshot.displayName = "GrowxScreenshot";
