import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxDashboard = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.8" />
      <path d="M3.5 9.5h17" />
      <path d="M10 9.5v11" />
    </GrowxIcon>
  );
});

GrowxDashboard.displayName = "GrowxDashboard";
