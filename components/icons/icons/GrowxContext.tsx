"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxContext
 * Model working context window buffer
 */
export const GrowxContext = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxContext" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" /><rect x="7" y="7" width="10" height="10" rx="1" /><line x1="10" y1="12" x2="14" y2="12" />
    </GrowxIcon>
  )
);

GrowxContext.displayName = "GrowxContext";
