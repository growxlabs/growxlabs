"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxUsers
 * Multi-operator cluster nodes with shared perimeter
 */
export const GrowxUsers = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxUsers" {...props}>
      <circle cx="9" cy="7" r="3.5" /><path d="M2 19C2 15.5 5 13 9 13C13 13 16 15.5 16 19" /><path d="M16 3.5C17.5 4.5 18.5 6 18.5 7.5C18.5 9 17.5 10.5 16 11.5" /><path d="M18 14C20.5 15 22 16.8 22 19" />
    </GrowxIcon>
  )
);

GrowxUsers.displayName = "GrowxUsers";
