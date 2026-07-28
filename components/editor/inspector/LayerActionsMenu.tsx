"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface LayerActionsMenuProps {
  onDuplicate?: () => void;
  onCopy?: () => void;
  onCopyStyle?: () => void;
  onPasteStyle?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onResetProperties?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export function LayerActionsMenu({
  onDuplicate,
  onCopy,
  onCopyStyle,
  onPasteStyle,
  onBringForward,
  onSendBackward,
  onResetProperties,
  onDelete,
  children,
}: LayerActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white dark:bg-[rgba(24,25,28,0.98)] border border-gray-200 dark:border-[rgba(255,255,255,0.09)] rounded-[11px] p-1.5 shadow-xl backdrop-blur-[18px] z-50 text-[12px] text-gray-800 dark:text-gray-200 font-medium"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onDuplicate}
          >
            <span>Duplicate</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+D</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onCopy}
          >
            <span>Copy</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+C</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onCopyStyle}
          >
            <span>Copy Style</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onPasteStyle}
          >
            <span>Paste Style</span>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-white/10 my-1 mx-1" />
          
          <DropdownMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onBringForward}
          >
            <span>Bring Forward</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+]</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onSendBackward}
          >
            <span>Send Backward</span>
            <span className="text-[10px] text-gray-400 group-focus:text-white/70">Ctrl+[</span>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-white/10 my-1 mx-1" />
          
          <DropdownMenu.Item
            className="flex items-center h-[32px] px-2 rounded-md outline-none cursor-default hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-[#1687f8] focus:text-white transition-colors"
            onSelect={onResetProperties}
          >
            <span>Reset Properties</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center justify-between h-[32px] px-2 rounded-md outline-none cursor-default text-[#ef4444] hover:bg-[#ef4444]/10 focus:bg-[#ef4444] focus:text-white transition-colors"
            onSelect={onDelete}
          >
            <span>Delete</span>
            <span className="text-[10px] opacity-70">Del</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
