"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxOffline
 * Disconnected system endpoint marker
 */
export const GrowxOffline = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxOffline" {...props}>
      <circle cx="12" cy="12" r="9" /><line x1="4" y1="4" x2="20" y2="20" />
    </GrowxIcon>
  )
);

GrowxOffline.displayName = "GrowxOffline";
