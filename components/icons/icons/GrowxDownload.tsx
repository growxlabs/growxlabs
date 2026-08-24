"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxDownload
 * Downward asset egress vector to storage tray
 */
export const GrowxDownload = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxDownload" {...props}>
      <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" /><line x1="12" y1="3" x2="12" y2="15" /><path d="M7 10L12 15L17 10" />
    </GrowxIcon>
  )
);

GrowxDownload.displayName = "GrowxDownload";
