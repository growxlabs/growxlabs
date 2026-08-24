import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxRecruiter = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M4 8.5V5a1 1 0 0 1 1-1h3.5" />
      <path d="M15.5 4H19a1 1 0 0 1 1 1v3.5" />
      <path d="M20 15.5V19a1 1 0 0 1-1 1h-3.5" />
      <path d="M8.5 20H5a1 1 0 0 1-1-1v-3.5" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8.5 16.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5" />
    </GrowxIcon>
  );
});

GrowxRecruiter.displayName = "GrowxRecruiter";
