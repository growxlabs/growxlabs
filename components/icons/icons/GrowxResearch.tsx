import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxResearch = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3.5v2.5" />
      <path d="M12 18v2.5" />
      <path d="M3.5 12h2.5" />
      <path d="M18 12h2.5" />
    </GrowxIcon>
  );
});

GrowxResearch.displayName = "GrowxResearch";
