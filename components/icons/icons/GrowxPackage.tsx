"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxPackage
 * Isometric software distribution artifact
 */
export const GrowxPackage = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxPackage" {...props}>
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" /><line x1="12" y1="2" x2="12" y2="12" /><line x1="12" y1="12" x2="21" y2="7" /><line x1="12" y1="12" x2="3" y2="7" /><polyline points="7.5 4.5 16.5 9.5" />
    </GrowxIcon>
  )
);

GrowxPackage.displayName = "GrowxPackage";
