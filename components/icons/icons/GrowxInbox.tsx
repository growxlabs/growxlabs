"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxInbox
 * Ingress receptacle tray with retrieval slot
 */
export const GrowxInbox = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxInbox" {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V12L18.55 5.11C18.2 4.43 17.5 4 16.73 4H7.27C6.5 4 5.8 4.43 5.45 5.11Z" />
    </GrowxIcon>
  )
);

GrowxInbox.displayName = "GrowxInbox";
