import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxTerminal = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M4 6.5L10.5 12L4 17.5" />
      <path d="M12.5 17.5h7.5" />
      <path d="M12.5 12h3.5" />
    </GrowxIcon>
  );
});

GrowxTerminal.displayName = "GrowxTerminal";
