"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSession
 * Active authenticated network session token
 */
export const GrowxSession = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSession" {...props}>
      <circle cx="12" cy="12" r="9" /><path d="M12 3C7 3 3 7 3 12" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </GrowxIcon>
  )
);

GrowxSession.displayName = "GrowxSession";
