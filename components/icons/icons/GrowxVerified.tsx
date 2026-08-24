"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxVerified
 * Cryptographic signature validation stamp
 */
export const GrowxVerified = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxVerified" {...props}>
      <polygon points="12 2 15 5 19 4 19 8 22 11 20 14 21 18 17 19 15 22 12 20 9 22 7 19 3 18 4 14 2 11 5 8 5 4 9 5 12 2" /><polyline points="8.5 12 11 14.5 15.5 9.5" />
    </GrowxIcon>
  )
);

GrowxVerified.displayName = "GrowxVerified";
