import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxProduct = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M12 2.5L20.5 7.5L12 12.5L3.5 7.5Z" />
      <path d="M3.5 7.5V16.5L12 21.5V12.5" />
      <path d="M20.5 7.5V16.5L12 21.5" />
      <path d="M12 7.5v5" />
    </GrowxIcon>
  );
});

GrowxProduct.displayName = "GrowxProduct";
