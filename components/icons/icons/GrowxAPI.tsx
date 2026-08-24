"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxAPI
 * Bidirectional service contract gateway
 */
export const GrowxAPI = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxAPI" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" /><line x1="9" y1="10" x2="7" y2="12" /><line x1="7" y1="12" x2="9" y2="14" /><line x1="15" y1="10" x2="17" y2="12" /><line x1="17" y1="12" x2="15" y2="14" /><line x1="12" y1="9" x2="12" y2="15" />
    </GrowxIcon>
  )
);

GrowxAPI.displayName = "GrowxAPI";
