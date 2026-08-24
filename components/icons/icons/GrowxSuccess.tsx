"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSuccess
 * Verified status state circle with check vector
 */
export const GrowxSuccess = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSuccess" {...props}>
      <circle cx="12" cy="12" r="9" /><polyline points="8 12 11 15 16 9" />
    </GrowxIcon>
  )
);

GrowxSuccess.displayName = "GrowxSuccess";
