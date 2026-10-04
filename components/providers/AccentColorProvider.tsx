"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AccentColor =
  | "blue"
  | "purple"
  | "green"
  | "yellow"
  | "pink"
  | "orange"
  | "white";

export interface AccentOption {
  id: AccentColor;
  name: string;
  label: string;
  colorHex: string;
  darkColorHex?: string;
  textColor: string;
  description: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "blue",
    name: "Blue",
    label: "Default",
    colorHex: "#0075de",
    textColor: "#ffffff",
    description: "GrowXLabs signature enterprise blue",
  },
  {
    id: "green",
    name: "Green",
    label: "Green",
    colorHex: "#10b981",
    textColor: "#ffffff",
    description: "Emerald teal inspired by ChatGPT",
  },
  {
    id: "yellow",
    name: "Yellow",
    label: "Yellow",
    colorHex: "#f59e0b",
    textColor: "#000000",
    description: "Warm golden amber for high visibility",
  },
  {
    id: "pink",
    name: "Pink",
    label: "Pink",
    colorHex: "#ec4899",
    textColor: "#ffffff",
    description: "Vibrant rose & magenta",
  },
  {
    id: "orange",
    name: "Orange",
    label: "Orange",
    colorHex: "#f97316",
    textColor: "#ffffff",
    description: "Dynamic radiant tangerine",
  },
  {
    id: "purple",
    name: "Purple",
    label: "Purple",
    colorHex: "#8b5cf6",
    textColor: "#ffffff",
    description: "Creative electric violet",
  },
  {
    id: "white",
    name: "White",
    label: "White",
    colorHex: "#ffffff",
    darkColorHex: "#18181b",
    textColor: "#000000",
    description: "High-contrast monochrome studio",
  },
];

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  accentOptions: AccentOption[];
}

const AccentColorContext = createContext<AccentColorContextType>({
  accentColor: "blue",
  setAccentColor: () => {},
  accentOptions: ACCENT_OPTIONS,
});

const STORAGE_KEY = "growx-accent-color";

export function AccentColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accentColor, setAccentColorState] = useState<AccentColor>("blue");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AccentColor;
      if (
        saved &&
        ACCENT_OPTIONS.some((opt) => opt.id === saved)
      ) {
        setAccentColorState(saved);
        document.documentElement.setAttribute("data-accent", saved);
      } else {
        document.documentElement.setAttribute("data-accent", "blue");
      }
    } catch (e) {
      // Storage access error or SSR
    }
    setMounted(true);
  }, []);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    try {
      localStorage.setItem(STORAGE_KEY, color);
      document.documentElement.setAttribute("data-accent", color);
    } catch (e) {
      console.error("Failed to persist accent color:", e);
    }
  };

  return (
    <AccentColorContext.Provider
      value={{
        accentColor: mounted ? accentColor : "blue",
        setAccentColor,
        accentOptions: ACCENT_OPTIONS,
      }}
    >
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (!context) {
    throw new Error("useAccentColor must be used within an AccentColorProvider");
  }
  return context;
}
