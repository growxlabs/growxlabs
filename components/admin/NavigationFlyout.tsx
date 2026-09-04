"use client";

import { useEffect, useState, useRef, type ReactNode, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { IconClose, IconSearch, IconChevronRight } from "@/components/admin/GrowXIcons";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  description?: string;
}

interface NavigationFlyoutProps {
  open: boolean;
  mounted: boolean;
  title: string;
  groupId: string;
  icon: ComponentType<any>;
  left: number;
  top: number;
  sidebarWidth: number;
  items: NavigationItem[];
  renderLink: (item: NavigationItem, isMobile?: boolean, isFlyout?: boolean) => ReactNode;
  onClose: (restoreFocus?: boolean) => void;
}

export function NavigationFlyout({
  open,
  mounted,
  title,
  groupId,
  icon: ModuleIcon,
  left,
  top,
  items,
  renderLink,
  onClose,
}: NavigationFlyoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const flyoutRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCompact = items.length <= 4;

  // Click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (flyoutRef.current && flyoutRef.current.contains(target)) {
        return;
      }
      const sidebarContainer = document.getElementById("admin-sidebar-container");
      if (sidebarContainer && sidebarContainer.contains(target)) {
        return;
      }
      onClose(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // Keyboard navigation: Escape key & autofocus
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (!isCompact) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isCompact]);

  if (!mounted || !open) return null;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <div
      id="navigation-flyout-panel"
      ref={flyoutRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${title} navigation`}
      className={cn(
        "fixed z-[999] flex flex-col overflow-hidden",
        "rounded-2xl border border-slate-200/80 dark:border-neutral-800",
        "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl",
        "text-slate-900 dark:text-neutral-100",
        "shadow-[0_20px_45px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.6)]",
        "transition-all duration-150 ease-out",
        "animate-in fade-in slide-in-from-left-2 duration-150 ease-out motion-reduce:animate-none",
        isCompact ? "w-[270px] max-h-[50vh]" : "w-[330px] max-h-[72vh]"
      )}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        display: "flex",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-800/80 px-4 py-3 shrink-0 bg-slate-50/50 dark:bg-neutral-950/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0075de]/20 bg-[#0075de]/10 text-[#0075de] dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 shrink-0 shadow-xs">
          <ModuleIcon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
              {items.length}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onClose(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none cursor-pointer"
          aria-label="Close menu"
        >
          <IconClose size={13} />
        </button>
      </div>

      {/* Search Bar (Only for large item groups) */}
      {!isCompact && (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <div className="relative flex items-center">
            <IconSearch
              size={13}
              className="absolute left-3 text-slate-400 dark:text-neutral-500 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-neutral-950/50",
                "border border-slate-200/80 dark:border-neutral-800",
                "rounded-xl text-[11.5px] focus:outline-none focus:border-[#0075de]/40",
                "focus:ring-1 focus:ring-[#0075de]/30 text-slate-900 dark:text-neutral-100",
                "placeholder-slate-400 dark:placeholder-neutral-500 transition-all"
              )}
            />
          </div>
        </div>
      )}

      {/* Item List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0 space-y-0.5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.href} className="group/item">
              {renderLink(item, false, true)}
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
            No destinations found
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
