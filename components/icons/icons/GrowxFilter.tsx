"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFilter
 * Stepped funnel classification gate
 */
export const GrowxFilter = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFilter" {...props}>
      <path d="M3 4H21L14 13V19L10 21V13L3 4Z" />
    </GrowxIcon>
  )
);

GrowxFilter.displayName = "GrowxFilter";
