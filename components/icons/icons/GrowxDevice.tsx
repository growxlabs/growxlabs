"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxDevice
 * Authorized client hardware terminal
 */
export const GrowxDevice = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxDevice" {...props}>
      <rect x="4" y="3" width="16" height="14" rx="2" /><line x1="2" y1="21" x2="22" y2="21" /><line x1="8" y1="17" x2="7" y2="21" /><line x1="16" y1="17" x2="17" y2="21" />
    </GrowxIcon>
  )
);

GrowxDevice.displayName = "GrowxDevice";
