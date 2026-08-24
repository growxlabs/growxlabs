"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFingerprint
 * Unique identity hash topography ridges
 */
export const GrowxFingerprint = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFingerprint" {...props}>
      <path d="M12 10A2 2 0 0 0 10 12V14A2 2 0 0 0 14 14V12A2 2 0 0 0 12 10Z" /><path d="M7 13V12A5 5 0 0 1 17 12V15A4 4 0 0 1 9 15" /><path d="M4 12A8 8 0 0 1 20 12V16" /><path d="M12 21V19" />
    </GrowxIcon>
  )
);

GrowxFingerprint.displayName = "GrowxFingerprint";
