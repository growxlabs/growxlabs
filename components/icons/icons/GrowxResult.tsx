"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxResult
 * Final agent execution deliverable token
 */
export const GrowxResult = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxResult" {...props}>
      <polygon points="12 2 15 8 22 9 17 14 18 21 12 17.5 6 21 7 14 2 9 9 8 12 2" strokeLinejoin="round" />
    </GrowxIcon>
  )
);

GrowxResult.displayName = "GrowxResult";
