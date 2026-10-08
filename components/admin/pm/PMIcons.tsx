import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// Arrow Left for navigation
export function IconArrowLeft({ size = 16, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// Plus icon
export function IconPlus({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Calendar icon
export function IconCalendar({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// User / Assignee icon
export function IconUser({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Check square / taskboard
export function IconCheckSquare({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

// Bug icon
export function IconBug({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect width="8" height="14" x="8" y="6" rx="4" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m10 4 1 2" />
      <path d="m14 4-1 2" />
    </svg>
  );
}

// Document / File text
export function IconFileText({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// Activity / Zap
export function IconZap({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// Search icon
export function IconSearch({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Close / X icon
export function IconClose({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Spinner
export function IconSpinner({ size = 18, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className || ""}`} {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// Filter icon
export function IconFilter({ size = 14, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// Subtasks check icon
export function IconSubtasks({ size = 12, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10" />
      <path d="M5 5h10" />
    </svg>
  );
}

// Priority Signal Bars (Linear-style)
export function IconPriority({
  priority,
  size = 14,
  className
}: {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  size?: number;
  className?: string;
}) {
  if (priority === "CRITICAL") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`text-red-600 ${className || ""}`} title="Critical (P0)">
        <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M8 4.5v4M8 10.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (priority === "HIGH") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`text-amber-500 ${className || ""}`} title="High Priority">
        <rect x="2" y="10" width="2.5" height="4" rx="0.75" />
        <rect x="6.75" y="7" width="2.5" height="7" rx="0.75" />
        <rect x="11.5" y="3" width="2.5" height="11" rx="0.75" />
      </svg>
    );
  }

  if (priority === "MEDIUM") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`text-blue-500 ${className || ""}`} title="Medium Priority">
        <rect x="2" y="10" width="2.5" height="4" rx="0.75" />
        <rect x="6.75" y="7" width="2.5" height="7" rx="0.75" />
        <rect x="11.5" y="3" width="2.5" height="11" rx="0.75" fillOpacity="0.25" />
      </svg>
    );
  }

  // LOW
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`text-slate-400 ${className || ""}`} title="Low Priority">
      <rect x="2" y="10" width="2.5" height="4" rx="0.75" />
      <rect x="6.75" y="7" width="2.5" height="7" rx="0.75" fillOpacity="0.25" />
      <rect x="11.5" y="3" width="2.5" height="11" rx="0.75" fillOpacity="0.25" />
    </svg>
  );
}

// Issue Type Icon (Story / Task / Bug / Spike)
export function IconIssueType({
  type = "task",
  size = 13,
  className
}: {
  type?: "story" | "task" | "bug" | "spike";
  size?: number;
  className?: string;
}) {
  if (type === "bug") {
    return (
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-red-100 text-red-600 ${className || ""}`} title="Bug">
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="4.5" />
        </svg>
      </span>
    );
  }

  if (type === "story") {
    return (
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-emerald-100 text-emerald-600 ${className || ""}`} title="User Story">
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2.5a.5.5 0 0 0-.5.5v10.5l4.5-2.5 4.5 2.5V3a.5.5 0 0 0-.5-.5H4z" />
        </svg>
      </span>
    );
  }

  // Default: Task
  return (
    <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-blue-100 text-blue-600 ${className || ""}`} title="Task">
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 8 7 11 12 5" />
      </svg>
    </span>
  );
}
