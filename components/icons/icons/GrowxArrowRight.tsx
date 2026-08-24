import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxArrowRight = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M3.5 12h15.5" />
      <path d="M13 6.5L19 12l-6 5.5" />
    </GrowxIcon>
  );
});

GrowxArrowRight.displayName = "GrowxArrowRight";
