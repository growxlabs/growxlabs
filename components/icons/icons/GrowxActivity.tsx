"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxActivity
 * Real-time system pulse heartbeat vector
 */
export const GrowxActivity = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxActivity" {...props}>
      <polyline points="2 12 6 12 9 4 15 20 18 12 22 12" />
    </GrowxIcon>
  )
);

GrowxActivity.displayName = "GrowxActivity";
