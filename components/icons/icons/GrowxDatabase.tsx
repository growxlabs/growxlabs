import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxDatabase = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9.2h17" />
      <path d="M3.5 14.8h17" />
      <circle cx="7" cy="6.35" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17.65" r="1" fill="currentColor" stroke="none" />
    </GrowxIcon>
  );
});

GrowxDatabase.displayName = "GrowxDatabase";
