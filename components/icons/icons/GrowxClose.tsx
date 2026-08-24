"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxClose
 * Precision diagonal dismissal cross
 */
export const GrowxClose = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxClose" {...props}>
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" /><line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
    </GrowxIcon>
  )
);

GrowxClose.displayName = "GrowxClose";
