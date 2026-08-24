"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxAudit
 * Structured audit log inspection scope
 */
export const GrowxAudit = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxAudit" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="12" y2="11" /><polyline points="8 15 10 17 15 12" />
    </GrowxIcon>
  )
);

GrowxAudit.displayName = "GrowxAudit";
