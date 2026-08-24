"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxUpload
 * Upward asset ingress vector into cloud tray
 */
export const GrowxUpload = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxUpload" {...props}>
      <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" /><line x1="12" y1="15" x2="12" y2="3" /><path d="M7 8L12 3L17 8" />
    </GrowxIcon>
  )
);

GrowxUpload.displayName = "GrowxUpload";
