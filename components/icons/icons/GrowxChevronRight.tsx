"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxChevronRight
 * Rightward directional chevron indicator
 */
export const GrowxChevronRight = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxChevronRight" {...props}>
      <path d="M9.5 6L15.5 12L9.5 18" />
    </GrowxIcon>
  )
);

GrowxChevronRight.displayName = "GrowxChevronRight";
