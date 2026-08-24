"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPasskey
 * Biometric cryptographic key node
 */
export const GrowxPasskey = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPasskey" {...props}>
      <circle cx="8" cy="14" r="4" /><path d="M12 10L20 2M16 6L18 8M14 8L16 10" /><path d="M6 14C6 13 7 12 8 12" />
    </GrowxIcon>
  )
);

GrowxPasskey.displayName = "GrowxPasskey";
