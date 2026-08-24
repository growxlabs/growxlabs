"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxRemove
 * Horizontal removal vector
 */
export const GrowxRemove = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxRemove" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </GrowxIcon>
  )
);

GrowxRemove.displayName = "GrowxRemove";
