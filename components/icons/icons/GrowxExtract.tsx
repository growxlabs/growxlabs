"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxExtract
 * Structured data parsing & transformation funnel
 */
export const GrowxExtract = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxExtract" {...props}>
      <path d="M4 4H20L15 11V20L9 16V11L4 4Z" /><polyline points="11 11 13 13 17 9" />
    </GrowxIcon>
  )
);

GrowxExtract.displayName = "GrowxExtract";
