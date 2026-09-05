import React from "react";

export interface StudioIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

const base = (
  props: StudioIconProps,
  children: React.ReactNode,
  viewBox = "0 0 24 24",
  fill = "none"
) => {
  const { size = 24, className = "", color = "currentColor", strokeWidth = 2, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
};

// ----------------------------------------------------
// NAVIGATION & CHEVRONS
// ----------------------------------------------------

export const ChevronDown = (props: StudioIconProps) =>
  base(props, <path d="m6 9 6 6 6-6" />);

export const ChevronUp = (props: StudioIconProps) =>
  base(props, <path d="m18 15-6-6-6 6" />);

export const ChevronLeft = (props: StudioIconProps) =>
  base(props, <path d="m15 18-6-6 6-6" />);

export const ChevronRight = (props: StudioIconProps) =>
  base(props, <path d="m9 18 6-6-6-6" />);

export const ChevronsDown = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m7 6 5 5 5-5" />
      <path d="m7 13 5 5 5-5" />
    </>
  );

export const ChevronsUp = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m17 18-5-5-5 5" />
      <path d="m17 11-5-5-5 5" />
    </>
  );

export const ArrowLeft = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  );

export const ArrowUp = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </>
  );

export const ArrowDown = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </>
  );

// ----------------------------------------------------
// TOOLS & CURSORS
// ----------------------------------------------------

export const MousePointer = (props: StudioIconProps) =>
  base(
    props,
    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
  );

export const Hand = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </>
  );

export const Type = (props: StudioIconProps) =>
  base(
    props,
    <>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" x2="15" y1="20" y2="20" />
      <line x1="12" x2="12" y1="4" y2="20" />
    </>
  );

export const Image = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>
  );
export const ImageIcon = Image;

export const Video = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </>
  );

// ----------------------------------------------------
// ACTIONS & CONTROLS
// ----------------------------------------------------

export const Plus = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  );

export const Minus = (props: StudioIconProps) =>
  base(props, <path d="M5 12h14" />);

export const Trash2 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </>
  );

export const Copy = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  );

export const Download = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </>
  );

export const Upload = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </>
  );

export const Share2 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </>
  );

export const Link2 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </>
  );

export const Undo = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </>
  );

export const Redo = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </>
  );

export const RotateCw = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </>
  );

export const RotateCcw = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>
  );

export const RefreshCw = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </>
  );

export const Play = (props: StudioIconProps) =>
  base(props, <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />);

export const Check = (props: StudioIconProps) =>
  base(props, <polyline points="20 6 9 17 4 12" />);

export const CheckSquare = (props: StudioIconProps) =>
  base(
    props,
    <>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  );

export const MoreHorizontal = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
    </>
  );

// ----------------------------------------------------
// LAYOUT & ALIGNMENT
// ----------------------------------------------------

export const AlignLeft = (props: StudioIconProps) =>
  base(
    props,
    <>
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="15" x2="3" y1="12" y2="12" />
      <line x1="17" x2="3" y1="18" y2="18" />
    </>
  );

export const AlignCenter = (props: StudioIconProps) =>
  base(
    props,
    <>
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="17" x2="7" y1="12" y2="12" />
      <line x1="19" x2="5" y1="18" y2="18" />
    </>
  );

export const AlignRight = (props: StudioIconProps) =>
  base(
    props,
    <>
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="21" x2="9" y1="12" y2="12" />
      <line x1="21" x2="7" y1="18" y2="18" />
    </>
  );

export const Layers = (props: StudioIconProps) =>
  base(
    props,
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  );
export const LayersIcon = Layers;

export const LayoutGrid = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </>
  );

export const Grid = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="3" x2="21" y1="15" y2="15" />
      <line x1="9" x2="9" y1="3" y2="21" />
      <line x1="15" x2="15" y1="3" y2="21" />
    </>
  );

export const GripVertical = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </>
  );

// ----------------------------------------------------
// ELEMENTS & INSPECTOR
// ----------------------------------------------------

export const Tag = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </>
  );

export const Quote = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </>
  );
export const QuoteIcon = Quote;

export const List = (props: StudioIconProps) =>
  base(
    props,
    <>
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </>
  );

export const FileText = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </>
  );

export const FileCode = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </>
  );

export const FileImage = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="10" cy="13" r="1.5" />
      <path d="m18 19-3.5-3.5a1.5 1.5 0 0 0-2.12 0L8 20" />
    </>
  );

export const FolderOpen = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
    </>
  );

export const User = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  );

export const Smartphone = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </>
  );

export const Sparkles = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </>
  );

export const Palette = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </>
  );

export const Edit3 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  );

export const Sliders = (props: StudioIconProps) =>
  base(
    props,
    <>
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </>
  );

export const Settings = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );

export const Search = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </>
  );

// ----------------------------------------------------
// VISIBILITY & SECURITY
// ----------------------------------------------------

export const Eye = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );
export const ViewIcon = Eye;

export const EyeOff = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </>
  );

export const Lock = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  );

export const Unlock = (props: StudioIconProps) =>
  base(
    props,
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  );

export const Maximize2 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" x2="14" y1="3" y2="10" />
      <line x1="3" x2="10" y1="21" y2="14" />
    </>
  );

export const Minimize2 = (props: StudioIconProps) =>
  base(
    props,
    <>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" x2="21" y1="10" y2="3" />
      <line x1="10" x2="3" y1="14" y2="21" />
    </>
  );

export const Info = (props: StudioIconProps) =>
  base(
    props,
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </>
  );

export const Loader2 = (props: StudioIconProps) => {
  const { className = "", ...rest } = props;
  return base(
    { className: `animate-spin ${className}`, ...rest },
    <>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </>
  );
};

// ----------------------------------------------------
// CLOUD PERSISTENCE & DATABASE SYNC
// ----------------------------------------------------

export const CloudCheck = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <polyline points="9 13.5 11 15.5 15 11.5" />
    </>
  );

export const CloudUpload = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <polyline points="10 13 12 11 14 13" />
      <line x1="12" x2="12" y1="11" y2="17" />
    </>
  );

export const CloudAlert = (props: StudioIconProps) =>
  base(
    props,
    <>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <line x1="12" x2="12" y1="11" y2="15" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </>
  );
