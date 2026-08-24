"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCheck
 * Engineered verification vector
 */
export const GrowxCheck = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCheck" {...props}>
      <path d="M4.5 12.5L9.5 17.5L19.5 6.5" />
    </GrowxIcon>
  )
);

GrowxCheck.displayName = "GrowxCheck";
