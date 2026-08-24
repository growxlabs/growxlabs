"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxList
 * Sequential structured item index
 */
export const GrowxList = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxList" {...props}>
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><rect x="4" y="5" width="2" height="2" /><rect x="4" y="11" width="2" height="2" /><rect x="4" y="17" width="2" height="2" />
    </GrowxIcon>
  )
);

GrowxList.displayName = "GrowxList";
