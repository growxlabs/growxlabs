"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxCommand
 * Engineered system invocation loop
 */
export const GrowxCommand = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxCommand" {...props}>
      <path d="M15 6V18M9 6V18M6 9H18M6 15H18M6 9A3 3 0 1 1 9 6M15 6A3 3 0 1 1 18 9M18 15A3 3 0 1 1 15 18M9 18A3 3 0 1 1 6 15" />
    </GrowxIcon>
  )
);

GrowxCommand.displayName = "GrowxCommand";
