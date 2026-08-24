"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxMention
 * Identity anchor operator vector
 */
export const GrowxMention = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxMention" {...props}>
      <circle cx="12" cy="12" r="4" /><path d="M16 8V12C16 13.7 17.3 15 19 15C20.7 15 22 13.7 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C14.8 22 17.3 20.8 19 19" />
    </GrowxIcon>
  )
);

GrowxMention.displayName = "GrowxMention";
