import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxDeveloper = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M7 6.5L2.5 12L7 17.5" />
      <path d="M17 6.5L21.5 12L17 17.5" />
      <path d="M13.5 5.5L10.5 18.5" />
    </GrowxIcon>
  );
});

GrowxDeveloper.displayName = "GrowxDeveloper";
