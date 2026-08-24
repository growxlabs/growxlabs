"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPanelLeft
 * Split container with highlighted left pane
 */
export const GrowxPanelLeft = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPanelLeft" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" />
    </GrowxIcon>
  )
);

GrowxPanelLeft.displayName = "GrowxPanelLeft";
