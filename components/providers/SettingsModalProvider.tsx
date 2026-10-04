"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChatGPTSettingsModal } from "@/components/admin/settings/ChatGPTSettingsModal";

interface SettingsModalContextType {
  isOpen: boolean;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  activeTab: string;
}

const SettingsModalContext = createContext<SettingsModalContextType>({
  isOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  activeTab: "general",
});

export function SettingsModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Check URL query param ?settings=open or ?settings=true
  useEffect(() => {
    if (searchParams?.get("settings") === "open" || searchParams?.get("settings") === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  // Keyboard shortcut: Ctrl+, or Cmd+, to open settings (standard ChatGPT shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openSettings = (tab: string = "general") => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
    // If URL has ?settings=open, clean it up gracefully
    if (searchParams?.get("settings")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("settings");
      const qs = newParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  };

  return (
    <SettingsModalContext.Provider value={{ isOpen, openSettings, closeSettings, activeTab }}>
      {children}
      <ChatGPTSettingsModal isOpen={isOpen} onClose={closeSettings} defaultTab={activeTab} />
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  return useContext(SettingsModalContext);
}
