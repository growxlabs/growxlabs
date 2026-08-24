"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPage
 * Target web document with HTML DOM structure
 */
export const GrowxPage = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPage" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" /><line x1="4" y1="8" x2="20" y2="8" /><circle cx="7" cy="5.5" r="0.75" fill="currentColor" stroke="none" /><circle cx="9.5" cy="5.5" r="0.75" fill="currentColor" stroke="none" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="15" x2="14" y2="15" />
    </GrowxIcon>
  )
);

GrowxPage.displayName = "GrowxPage";
