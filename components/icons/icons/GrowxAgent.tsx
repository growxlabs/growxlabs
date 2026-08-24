import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxAgent = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M12 3L20 8.5v7L12 21l-8-5.5v-7L12 3z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 5.8v3.2" />
      <path d="M17.2 15l-2.7-1.6" />
      <path d="M6.8 15l2.7-1.6" />
    </GrowxIcon>
  );
});

GrowxAgent.displayName = "GrowxAgent";
