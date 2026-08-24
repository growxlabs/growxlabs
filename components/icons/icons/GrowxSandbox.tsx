"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSandbox
 * Isolated execution container boundary
 */
export const GrowxSandbox = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSandbox" {...props}>
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" strokeDasharray="3 2" /><polygon points="12 6 17 9 17 15 12 18 7 15 7 9 12 6" />
    </GrowxIcon>
  )
);

GrowxSandbox.displayName = "GrowxSandbox";
