import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxBrowser = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M7 6.75h7" />
      <circle cx="17.5" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
      <path d="M7 14h5" />
      <path d="M7 16.5h3.5" />
    </GrowxIcon>
  );
});

GrowxBrowser.displayName = "GrowxBrowser";
