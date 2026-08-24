"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxSave
 * Physical storage medium with write window
 */
export const GrowxSave = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxSave" {...props}>
      <path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16L21 8V19C21 20.1 20.1 21 19 21Z" /><rect x="7" y="14" width="10" height="7" /><rect x="7" y="3" width="7" height="5" />
    </GrowxIcon>
  )
);

GrowxSave.displayName = "GrowxSave";
