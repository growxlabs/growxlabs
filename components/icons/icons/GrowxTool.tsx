"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxTool
 * Agent capability execution instrument
 */
export const GrowxTool = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxTool" {...props}>
      <path d="M14.7 6.3A1 1 0 0 0 14 6H10A1 1 0 0 0 9.3 6.3L2.3 13.3A1 1 0 0 0 2.3 14.7L9.3 21.7A1 1 0 0 0 10.7 21.7L17.7 14.7A1 1 0 0 0 17.7 13.3L14.7 6.3Z" /><line x1="6" y1="10" x2="14" y2="18" />
    </GrowxIcon>
  )
);

GrowxTool.displayName = "GrowxTool";
