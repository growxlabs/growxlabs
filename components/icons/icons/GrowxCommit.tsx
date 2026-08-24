"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCommit
 * Linear execution ledger point
 */
export const GrowxCommit = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCommit" {...props}>
      <circle cx="12" cy="12" r="4" /><line x1="2" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxCommit.displayName = "GrowxCommit";
