"use client";

import React from "react";
import { GrowxIcon } from "../GrowxIcon";
import { GrowxIconProps } from "../types";

/**
 * GrowxGitBranch
 * Divergent code stream graph node
 */
export const GrowxGitBranch = React.forwardRef<SVGSVGElement, GrowxIconProps>(
  (props, ref) => (
    <GrowxIcon ref={ref} aria-label="GrowxGitBranch" {...props}>
      <circle cx="6" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><path d="M6 9V15" /><path d="M18 9A9 9 0 0 1 9 18" />
    </GrowxIcon>
  )
);

GrowxGitBranch.displayName = "GrowxGitBranch";
