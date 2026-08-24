import React, { forwardRef } from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

export const GrowxNotification = forwardRef<SVGSVGElement, GrowxIconProps>((props, ref) => {
  return (
    <GrowxIcon ref={ref} {...props}>
      <path d="M5.5 17h13L17 9.5a5 5 0 0 0-10 0L5.5 17z" />
      <path d="M10 17v1.5a2 2 0 0 0 4 0V17" />
      <path d="M12 2.5v2" />
    </GrowxIcon>
  );
});

GrowxNotification.displayName = "GrowxNotification";
