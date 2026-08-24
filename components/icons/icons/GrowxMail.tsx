"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMail
 * Engineered postal packet with faceted fold
 */
export const GrowxMail = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMail" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" />
    </GrowxIcon>
  )
);

GrowxMail.displayName = "GrowxMail";
