"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPatch
 * Firmware/software security hotfix patch
 */
export const GrowxPatch = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPatch" {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" /><line x1="5" y1="12" x2="19" y2="12" /><line x1="12" y1="5" x2="12" y2="19" /><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxPatch.displayName = "GrowxPatch";
