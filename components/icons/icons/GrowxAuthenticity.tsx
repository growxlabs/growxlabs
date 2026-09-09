"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxAuthenticity
 * Multimodal authenticity verification scanner & neural vision lens
 */
export const GrowxAuthenticity = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxAuthenticity" {...props}>
      <path d="M3 8V3h5" />
      <path d="M16 3h5v5" />
      <path d="M21 16v5h-5" />
      <path d="M8 21H3v-5" />
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </GrowxIcon>
  )
);

GrowxAuthenticity.displayName = "GrowxAuthenticity";
