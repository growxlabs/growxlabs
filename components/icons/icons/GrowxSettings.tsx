import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxSettings = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M4 6.5h16" />
      <path d="M8 4.5v4" />
      <path d="M4 12h16" />
      <path d="M16 10v4" />
      <path d="M4 17.5h16" />
      <path d="M10 15.5v4" />
    </GrowxIcon>
  );
});

GrowxSettings.displayName = "GrowxSettings";
