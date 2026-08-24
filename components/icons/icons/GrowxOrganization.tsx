"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxOrganization
 * Hierarchical enterprise governance structure
 */
export const GrowxOrganization = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxOrganization" {...props}>
      <rect x="9" y="2" width="6" height="5" rx="1" /><rect x="2" y="15" width="6" height="6" rx="1" /><rect x="16" y="15" width="6" height="6" rx="1" /><line x1="12" y1="7" x2="12" y2="11" /><line x1="5" y1="11" x2="19" y2="11" /><line x1="5" y1="11" x2="5" y2="15" /><line x1="19" y1="11" x2="19" y2="15" />
    </GrowxIcon>
  )
);

GrowxOrganization.displayName = "GrowxOrganization";
