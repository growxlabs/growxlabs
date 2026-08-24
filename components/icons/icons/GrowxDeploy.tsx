"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxDeploy
 * Ascending launch vector to edge production tier
 */
export const GrowxDeploy = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxDeploy" {...props}>
      <path d="M12 2L4 10H8V18H16V10H20L12 2Z" /><line x1="3" y1="22" x2="21" y2="22" />
    </GrowxIcon>
  )
);

GrowxDeploy.displayName = "GrowxDeploy";
