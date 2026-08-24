"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSitemap
 * Hierarchical site tree map topology
 */
export const GrowxSitemap = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSitemap" {...props}>
      <rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="5" height="4" rx="1" /><rect x="10" y="17" width="5" height="4" rx="1" /><rect x="17" y="17" width="5" height="4" rx="1" /><path d="M12 7V12M5.5 12V17M12.5 12V17M19.5 12V17M5.5 12H19.5" />
    </GrowxIcon>
  )
);

GrowxSitemap.displayName = "GrowxSitemap";
