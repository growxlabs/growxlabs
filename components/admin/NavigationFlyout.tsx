"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Search, Clock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationFlyoutProps {
  open: boolean;
  mounted: boolean;
  title: string;
  groupId: string;
  icon: LucideIcon;
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
  sidebarWidth,
  items,
  renderLink,
  onClose,
}: NavigationFlyoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent items from localStorage on mount and when groupId changes
  useEffect(() => {
    if (!mounted || !open) return;
    try {
      const stored = localStorage.getItem("growx_recent_destinations");
      if (stored) {
        const parsed = JSON.parse(stored) as { name: string; href: string; iconName: string; groupId: string }[];
        // Filter to only items belonging to this group
        const matchingItems = items.filter(item => 
          parsed.some(p => p.href === item.href && p.groupId === groupId)
        );
        // Take the 3 most recently clicked matching items
        const orderedMatching: NavigationItem[] = [];
        parsed.forEach(p => {
          if (p.groupId === groupId) {
            const matched = items.find(item => item.href === p.href);
            if (matched && !orderedMatching.some(m => m.href === matched.href)) {
              orderedMatching.push(matched);
            }
          }
        });
        setRecentItems(orderedMatching.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to load recent destinations:", e);
    }
  }, [mounted, open, groupId, items]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the flyout or inside the sidebar
      const target = event.target as Node;
      if (flyoutRef.current && flyoutRef.current.contains(target)) {
        return;
      }
      
      // Let sidebar handle its own toggle buttons to prevent double-toggle bugs
      const sidebarContainer = document.getElementById("admin-sidebar-container");
      if (sidebarContainer && sidebarContainer.contains(target)) {
        return;
      }

      onClose(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // Keyboard navigation: Escape key & focus trapping
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Autofocus search input when flyout opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  // Filter destinations based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Track destination selection to save as recent item
  const handleItemClick = (item: NavigationItem) => {
    try {
      const stored = localStorage.getItem("growx_recent_destinations") || "[]";
      let parsed = JSON.parse(stored) as { name: string; href: string; iconName: string; groupId: string }[];
      // Remove existing to place it first
      parsed = parsed.filter(p => p.href !== item.href);
      parsed.unshift({
        name: item.name,
        href: item.href,
        iconName: item.icon?.name || "",
        groupId,
      });
      // Limit to 15 items
      localStorage.setItem("growx_recent_destinations", JSON.stringify(parsed.slice(0, 15)));
    } catch (e) {
      console.error("Failed to save recent destination:", e);
    }
  };

  return createPortal(
    <div
      id="navigation-flyout-panel"
      ref={flyoutRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${title} navigation`}
      className={cn(
        "notion-theme fixed z-[999] flex w-[340px] max-h-[72vh] flex-col overflow-hidden",
        "rounded-2xl border border-slate-100 dark:border-neutral-800/80",
        "bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md",
        "text-[var(--text-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        "transition-all duration-180 ease-out",
        "animate-in fade-in slide-in-from-left-3 duration-180 ease-out motion-reduce:animate-none"
      )}
      style={{ 
        left: `${left}px`, 
        top: `${top}px`, 
        display: "flex" 
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-800/60 px-4 py-3.5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0075de]/15 bg-[#0075de]/10 text-[#0075de] dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400">
          <ModuleIcon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
          <p className="mt-0.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {items.length} {items.length === 1 ? "destination" : "destinations"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-slate-100 dark:hover:bg-neutral-900 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0075de]/40"
          aria-label="Close navigation panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-3 text-slate-400 dark:text-neutral-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-8.5 pl-8 pr-3 bg-slate-50 dark:bg-neutral-900/60",
              "border border-slate-100 dark:border-neutral-800",
              "rounded-xl text-[12px] focus:outline-none focus:border-[#0075de]/30",
              "focus:ring-1 focus:ring-[#0075de]/30 text-[var(--text-primary)]",
              "placeholder-slate-400 dark:placeholder-neutral-500 transition-all"
            )}
          />
        </div>
      </div>

      {/* Scrollable Items Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 min-h-0 space-y-4">
        {/* Recent Items Section */}
        {!searchQuery && recentItems.length > 0 && (
          <div className="space-y-1 px-1">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest px-1 pb-1">
              <Clock size={10} />
              <span>Recent</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {recentItems.map(item => (
                <div key={`recent-${item.href}`} onClick={() => handleItemClick(item)}>
                  {renderLink(item, true, true)}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Destinations List */}
        <div className="space-y-1 px-1">
          <div className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest px-1 pb-1">
            {searchQuery ? "Search Results" : "Destinations"}
          </div>
          <nav className="flex flex-col gap-0.5">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.href} onClick={() => handleItemClick(item)}>
                  {renderLink(item, true, true)}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[11px] text-[var(--text-muted)] font-medium">
                No matching destinations found.
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>,
    document.body
  );
}
