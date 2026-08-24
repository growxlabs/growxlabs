import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxDocument = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M6 3.5h8.5L19 8v12.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5z" />
      <path d="M14.5 3.5V8H19" />
      <path d="M8.5 13h7" />
      <path d="M8.5 17h4.5" />
    </GrowxIcon>
  );
});

GrowxDocument.displayName = "GrowxDocument";
