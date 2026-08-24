"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFolderOpen
 * Active open directory vault
 */
export const GrowxFolderOpen = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFolderOpen" {...props}>
      <path d="M3 7V5C3 3.9 3.9 3 5 3H10L12 6H19C20.1 6 21 6.9 21 8V9" /><path d="M2.5 10H21.5L19 21H5L2.5 10Z" />
    </GrowxIcon>
  )
);

GrowxFolderOpen.displayName = "GrowxFolderOpen";
