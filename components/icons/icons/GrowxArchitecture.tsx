import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxArchitecture = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3" y="3.5" width="7" height="5.5" rx="1" />
      <rect x="14" y="3.5" width="7" height="5.5" rx="1" />
      <rect x="8.5" y="15" width="7" height="5.5" rx="1" />
      <path d="M6.5 9v3.5h11V9" />
      <path d="M12 12.5V15" />
    </GrowxIcon>
  );
});

GrowxArchitecture.displayName = "GrowxArchitecture";
