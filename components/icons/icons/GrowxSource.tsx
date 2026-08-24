"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSource
 * Origin web citation & crawl provenance
 */
export const GrowxSource = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSource" {...props}>
      <circle cx="12" cy="12" r="9" /><polyline points="9 12 11 14 15 10" /><path d="M12 3A9 9 0 0 1 21 12" strokeWidth="2.5" />
    </GrowxIcon>
  )
);

GrowxSource.displayName = "GrowxSource";
