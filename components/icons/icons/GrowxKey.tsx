"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxKey
 * Cryptographic credential token with stepped bitting
 */
export const GrowxKey = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxKey" {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" /><line x1="11" y1="12" x2="21" y2="2" /><line x1="17" y1="6" x2="20" y2="9" /><line x1="14" y1="9" x2="16" y2="11" />
    </GrowxIcon>
  )
);

GrowxKey.displayName = "GrowxKey";
