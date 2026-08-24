"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxFile
 * Generic flat file asset with notched corner
 */
export const GrowxFile = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxFile" {...props}>
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" /><polyline points="14 2 14 8 20 8" />
    </GrowxIcon>
  )
);

GrowxFile.displayName = "GrowxFile";
