"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFullscreen
 * Four-corner display viewport perimeter
 */
export const GrowxFullscreen = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFullscreen" {...props}>
      <path d="M3 8V3H8" /><path d="M16 3H21V8" /><path d="M21 16V21H16" /><path d="M8 21H3V16" />
    </GrowxIcon>
  )
);

GrowxFullscreen.displayName = "GrowxFullscreen";
