"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxRunning
 * Active processing state with spinning segmented arc
 */
export const GrowxRunning = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxRunning" {...props}>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" /><path d="M12 3A9 9 0 0 1 21 12" />
    </GrowxIcon>
  )
);

GrowxRunning.displayName = "GrowxRunning";
