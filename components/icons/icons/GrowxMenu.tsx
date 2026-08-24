import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxMenu = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M3 6.5h18" />
      <path d="M7.5 12h13.5" />
      <path d="M3 17.5h13.5" />
    </GrowxIcon>
  );
});

GrowxMenu.displayName = "GrowxMenu";
