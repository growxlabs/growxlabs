"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxAttachment
 * Orthogonal interlocking binder link
 */
export const GrowxAttachment = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxAttachment" {...props}>
      <path d="M16.5 13.5L8.5 21.5C6.5 23.5 3.5 23.5 1.5 21.5C-0.5 19.5 -0.5 16.5 1.5 14.5L10 6C11.5 4.5 13.5 4.5 15 6C16.5 7.5 16.5 9.5 15 11L7.5 18.5C6.8 19.2 5.8 19.2 5 18.5C4.3 17.7 4.3 16.7 5 16L12 9" transform="translate(3, -1)" />
    </GrowxIcon>
  )
);

GrowxAttachment.displayName = "GrowxAttachment";
