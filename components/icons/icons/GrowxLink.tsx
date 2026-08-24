"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxLink
 * Interlocked URI hyperlink vectors
 */
export const GrowxLink = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxLink" {...props}>
      <path d="M10 13A5 5 0 0 0 17.5 13L20 10.5A5 5 0 0 0 13 3.5L11.5 5" /><path d="M14 11A5 5 0 0 0 6.5 11L4 13.5A5 5 0 0 0 11 20.5L12.5 19" />
    </GrowxIcon>
  )
);

GrowxLink.displayName = "GrowxLink";
