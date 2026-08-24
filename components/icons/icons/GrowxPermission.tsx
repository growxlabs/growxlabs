"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPermission
 * Role-based access matrix evaluation stamp
 */
export const GrowxPermission = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPermission" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12L11 15L16 9" /><line x1="3" y1="8" x2="21" y2="8" strokeDasharray="1 1" />
    </GrowxIcon>
  )
);

GrowxPermission.displayName = "GrowxPermission";
