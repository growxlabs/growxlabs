"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSort
 * Bidirectional ordinal sorting vector
 */
export const GrowxSort = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSort" {...props}>
      <line x1="7" y1="4" x2="7" y2="20" /><path d="M4 7L7 4L10 7" /><line x1="17" y1="20" x2="17" y2="4" /><path d="M14 17L17 20L20 17" />
    </GrowxIcon>
  )
);

GrowxSort.displayName = "GrowxSort";
