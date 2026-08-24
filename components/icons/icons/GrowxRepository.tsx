"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxRepository
 * Indexed source code ledger vault
 */
export const GrowxRepository = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxRepository" {...props}>
      <path d="M4 19.5V4.5C4 3.4 4.9 2.5 6 2.5H19V21.5H6C4.9 21.5 4 20.6 4 19.5Z" /><line x1="4" y1="17.5" x2="19" y2="17.5" /><polyline points="9 8 12 11 9 14" />
    </GrowxIcon>
  )
);

GrowxRepository.displayName = "GrowxRepository";
