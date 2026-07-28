"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";

interface LayerContextMenuProps {
  children: React.ReactNode;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onToggleLock?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  isLocked?: boolean;
  isVisible?: boolean;
}

export function LayerContextMenu({
  children,
  onDuplicate,
  onCopy,
  onToggleLock,
  onToggleVisibility,
  onDelete,
  isLocked,
  isVisible,
}: LayerContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[180px] bg-white dark:bg-[rgba(24,25,28,0.98)] border border-gray-200 dark:border-[rgba(255,255,255,0.09)] rounded-[11px] p-1.5 shadow-xl backdrop-blur-[18px] z-50 text-[12px] text-gray-800 dark:text-gray-200 font-medium"
        >
          <ContextMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onDuplicate}
          >
            <span>Duplicate</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+D</span>
          </ContextMenu.Item>
          <ContextMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onCopy}
          >
            <span>Copy</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+C</span>
          </ContextMenu.Item>
          
          <ContextMenu.Item
            className="flex items-center h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onToggleLock}
          >
            <span>{isLocked ? "Unlock" : "Lock"}</span>
          </ContextMenu.Item>
          <ContextMenu.Item
            className="flex items-center h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onToggleVisibility}
          >
            <span>{isVisible ? "Hide" : "Show"}</span>
          </ContextMenu.Item>
          
          <ContextMenu.Separator className="h-px bg-gray-200 dark:bg-white/10 my-1 mx-1" />
          
          <ContextMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default text-[#ef4444] hover:bg-[#ef4444]/10 focus:bg-[#ef4444] focus:text-white transition-colors"
            onSelect={onDelete}
          >
            <span>Delete</span>
            <span className="text-[10px] opacity-70">Del</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
