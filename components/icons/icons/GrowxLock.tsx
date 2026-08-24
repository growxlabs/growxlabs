"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxLock
 * Secured credential boundary vault
 */
export const GrowxLock = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxLock" {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M7 10V6C7 3.2 9.2 1 12 1C14.8 1 17 3.2 17 6V10" /><circle cx="12" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxLock.displayName = "GrowxLock";
