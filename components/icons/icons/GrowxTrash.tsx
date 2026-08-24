"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxTrash
 * Disposal receptacle with lid separation rule
 */
export const GrowxTrash = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxTrash" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" /><path d="M19 6L18 20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20L5 6" /><path d="M9 6V3C9 2.4 9.4 2 10 2H14C14.6 2 15 2.4 15 3V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </GrowxIcon>
  )
);

GrowxTrash.displayName = "GrowxTrash";
