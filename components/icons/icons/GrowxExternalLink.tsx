import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxExternalLink = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M13 4h7v7" />
      <path d="M9 15L20 4" />
      <path d="M19 12v7a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V6.5A1.5 1.5 0 0 1 5.5 5H12" />
    </GrowxIcon>
  );
});

GrowxExternalLink.displayName = "GrowxExternalLink";
