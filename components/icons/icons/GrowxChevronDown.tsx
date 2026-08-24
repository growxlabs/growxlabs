"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxChevronDown
 * Downward directional chevron indicator
 */
export const GrowxChevronDown = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxChevronDown" {...props}>
      <path d="M6 9.5L12 15.5L18 9.5" />
    </GrowxIcon>
  )
);

GrowxChevronDown.displayName = "GrowxChevronDown";
