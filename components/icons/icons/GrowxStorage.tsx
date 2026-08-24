import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxStorage = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3.5" y="3.5" width="17" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="17" height="6.5" rx="1.5" />
      <path d="M10.5 6.75h5" />
      <path d="M10.5 17.25h5" />
      <circle cx="6.5" cy="6.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="17.25" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  );
});

GrowxStorage.displayName = "GrowxStorage";
