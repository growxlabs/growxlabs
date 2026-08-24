"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPanelRight
 * Split container with highlighted right inspector
 */
export const GrowxPanelRight = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPanelRight" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="15" y1="4" x2="15" y2="20" />
    </GrowxIcon>
  )
);

GrowxPanelRight.displayName = "GrowxPanelRight";
