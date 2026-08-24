"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxExpand
 * Diagonal outward viewport expand brackets
 */
export const GrowxExpand = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxExpand" {...props}>
      <path d="M15 3H21V9" /><path d="M9 21H3V15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </GrowxIcon>
  )
);

GrowxExpand.displayName = "GrowxExpand";
