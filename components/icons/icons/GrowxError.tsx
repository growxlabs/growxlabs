"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxError
 * Execution failure state circle with cancel cross
 */
export const GrowxError = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxError" {...props}>
      <circle cx="12" cy="12" r="9" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
    </GrowxIcon>
  )
);

GrowxError.displayName = "GrowxError";
