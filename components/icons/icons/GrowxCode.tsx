"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCode
 * Flanking syntax brackets with inner token dot
 */
export const GrowxCode = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCode" {...props}>
      <path d="M8 6L2 12L8 18" /><path d="M16 6L22 12L16 18" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxCode.displayName = "GrowxCode";
