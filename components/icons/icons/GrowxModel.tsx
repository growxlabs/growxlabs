"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxModel
 * Neural weights matrix node
 */
export const GrowxModel = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxModel" {...props}>
      <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><circle cx="12" cy="12" r="3" /><line x1="8" y1="7.5" x2="10" y2="10" /><line x1="8" y1="16.5" x2="10" y2="14" /><line x1="16" y1="7.5" x2="14" y2="10" /><line x1="16" y1="16.5" x2="14" y2="14" />
    </GrowxIcon>
  )
);

GrowxModel.displayName = "GrowxModel";
