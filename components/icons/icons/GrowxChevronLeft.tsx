"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxChevronLeft
 * Leftward directional chevron indicator
 */
export const GrowxChevronLeft = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxChevronLeft" {...props}>
      <path d="M14.5 6L8.5 12L14.5 18" />
    </GrowxIcon>
  )
);

GrowxChevronLeft.displayName = "GrowxChevronLeft";
