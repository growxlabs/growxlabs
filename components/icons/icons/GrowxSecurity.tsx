import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxSecurity = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M12 2.5L4.5 5.5v6c0 5.2 3.2 9.5 7.5 11 4.3-1.5 7.5-5.8 7.5-11v-6L12 2.5z" />
      <circle cx="12" cy="10.5" r="2.2" />
      <path d="M12 12.7v4" />
    </GrowxIcon>
  );
});

GrowxSecurity.displayName = "GrowxSecurity";
