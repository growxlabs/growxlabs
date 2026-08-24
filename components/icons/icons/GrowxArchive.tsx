"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxArchive
 * Cold storage archive chest with slot index
 */
export const GrowxArchive = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxArchive" {...props}>
      <rect x="3" y="3" width="18" height="5" rx="1" /><path d="M4 8V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V8" /><line x1="10" y1="12" x2="14" y2="12" />
    </GrowxIcon>
  )
);

GrowxArchive.displayName = "GrowxArchive";
