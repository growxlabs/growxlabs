import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxCrawl = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3" y="3.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="8.75" y="8.75" width="6.5" height="6.5" rx="1.2" />
      <rect x="14.5" y="14" width="6.5" height="6.5" rx="1.2" />
      <path d="M9.5 6.75h2.5v2" />
      <path d="M15.25 12h2.25v2" />
    </GrowxIcon>
  );
});

GrowxCrawl.displayName = "GrowxCrawl";
