"use client";

import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  GripVertical,
  Tag,
  Type,
  Image as ImageIcon,
  FileText,
  List,
  Quote,
  MousePointer,
  Minus,
  User,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "@/components/editor/icons/StudioIcons";

interface LayerRowProps {
  layerKey: string;
  label: string;
  type: string;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  category: <Tag size={14} />,
  headline: <Type size={14} />,
  body: <FileText size={14} />,
  featuredImage: <ImageIcon size={14} />,
  bullets: <List size={14} />,
  quote: <Quote size={14} />,
  cta: <MousePointer size={14} />,
  logo: <ImageIcon size={14} />,
  divider: <Minus size={14} />,
  author: <User size={14} />,
};

export function LayerRow({
  layerKey,
  label,
  type,
  isSelected,
  isVisible,
  isLocked,
  onClick,
  onToggleVisibility,
  onToggleLock,
}: LayerRowProps) {
  const Icon = TYPE_ICONS[layerKey] || <Tag size={14} />;

  return (
    <div
      onClick={onClick}
      className={`grid items-center gap-[6px] min-h-[40px] px-[6px] py-[4px] border border-transparent rounded-[9px] transition-colors duration-140 cursor-pointer ${
        isSelected
          ? "bg-[#1687f814] dark:bg-[#1687f81f] border-[#1687f838]"
          : "hover:bg-black/5 dark:hover:bg-white/5"
      } ${!isVisible ? "opacity-55" : ""}`}
      style={{ gridTemplateColumns: "20px 20px minmax(0, 1fr) 28px 28px" }}
    >
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <GripVertical size={14} />
      </div>

      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
        {Icon}
      </div>

      <div className="text-[13px] font-[550] text-gray-700 dark:text-gray-200 truncate">
        {label}
      </div>

      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              className="flex items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md z-50"
              sideOffset={5}
            >
              {isLocked ? "Unlock layer" : "Lock layer"}
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              className="flex items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
            >
              {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md z-50"
              sideOffset={5}
            >
              {isVisible ? "Hide layer" : "Show layer"}
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
