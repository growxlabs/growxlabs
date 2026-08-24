import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxPortfolio = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.8" />
      <path d="M8.5 4.5v15" />
      <path d="M12.5 9h4" />
      <path d="M12.5 13h2.5" />
    </GrowxIcon>
  );
});

GrowxPortfolio.displayName = "GrowxPortfolio";
