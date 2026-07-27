"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";

interface NavigationFlyoutProps {
  open: boolean;
  mounted: boolean;
  title: string;
  destinationCount: number;
  icon: LucideIcon;
  left: number;
  top: number;
  sidebarWidth: number;
  children: ReactNode;
  onClose: (restoreFocus?: boolean) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function NavigationFlyout({
  open,
  mounted,
  title,
  destinationCount,
  icon: ModuleIcon,
  left,
  top,
  sidebarWidth,
  children,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: NavigationFlyoutProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-y-0 right-0 z-[980] cursor-default bg-transparent"
        style={{ left: sidebarWidth }}
        onClick={() => onClose(true)}
        aria-label="Close navigation popup"
      />

      <section
        role="dialog"
        aria-modal="false"
        aria-label={`${title} navigation`}
        className="notion-theme fixed z-[999] flex w-[340px] max-h-[72vh] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-primary)] shadow-[0_30px_90px_-28px_rgba(15,23,42,0.5)] ring-1 ring-black/[0.04] animate-in fade-in slide-in-from-left-3 duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none"
        style={{ left, top, display: "flex" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0075de]/15 bg-[#0075de]/10 text-[#0075de]">
            <ModuleIcon size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
            <p className="mt-0.5 text-[11px] font-medium text-[var(--text-muted)]">
              {destinationCount} {destinationCount === 1 ? "destination" : "destinations"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]/40"
            aria-label="Close navigation panel"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="custom-scrollbar flex flex-col gap-1 overflow-y-auto p-2.5" aria-label={`${title} destinations`}>
          {children}
        </nav>
      </section>
    </>,
    document.body
  );
}
