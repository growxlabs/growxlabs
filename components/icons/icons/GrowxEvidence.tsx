import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxEvidence = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M5 3.5h9l5 5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z" />
      <path d="M14 3.5V8.5h5" />
      <circle cx="11" cy="14" r="2.5" />
      <path d="M9.5 14l1 1 2-2" />
    </GrowxIcon>
  );
});

GrowxEvidence.displayName = "GrowxEvidence";
