"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFolder
 * Tabbed directory vault
 */
export const GrowxFolder = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFolder" {...props}>
      <path d="M3 6C3 4.9 3.9 4 5 4H10L12 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V6Z" />
    </GrowxIcon>
  )
);

GrowxFolder.displayName = "GrowxFolder";
