"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxScan
 * Active security sweep radar grid
 */
export const GrowxScan = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxScan" {...props}>
      <path d="M3 8V3H8" /><path d="M16 3H21V8" /><path d="M21 16V21H16" /><path d="M8 21H3V16" /><line x1="4" y1="12" x2="20" y2="12" />
    </GrowxIcon>
  )
);

GrowxScan.displayName = "GrowxScan";
