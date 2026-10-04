"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAccentColor, type AccentColor } from "@/components/providers/AccentColorProvider";
import { Button } from "@/components/ui/Button";
import {
  Settings, ShieldCheck, Users, Lock, KeyRound, Database,
  Search, X, Check, ChevronDown, Sparkles,
  Activity, Bell, Globe, ArrowRight, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatGPTSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export function ChatGPTSettingsModal({
  isOpen,
  onClose,
  defaultTab = "general",
}: ChatGPTSettingsModalProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { accentColor, setAccentColor, accentOptions } = useAccentColor();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [compactNav, setCompactNav] = useState(false);

  // Dropdown states
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAccentOpen, setIsAccentOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentTheme = resolvedTheme || theme || "dark";
  const selectedAccent =
    accentOptions.find((opt) => opt.id === accentColor) || accentOptions[0];

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
      if (accentRef.current && !accentRef.current.contains(e.target as Node)) {
        setIsAccentOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const getSwatchColor = (opt: (typeof accentOptions)[0]) => {
    if (opt.id === "white") {
      return currentTheme === "dark" ? "#ffffff" : "#18181b";
    }
    return opt.colorHex;
  };

  const TABS = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security & Login", icon: ShieldCheck },
    { id: "users", label: "Team & Access", icon: Users },
    { id: "integrations", label: "API & Integrations", icon: KeyRound },
    { id: "storage", label: "Data & Storage", icon: Database },
  ];

  const filteredTabs = TABS.filter((t) =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-3xl h-[580px] bg-[#171717] border border-[#2e2e33] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-zinc-100 relative"
      >
        {/* ═══ LEFT SIDEBAR (ChatGPT Style) ═══ */}
        <div className="w-full md:w-60 bg-[#121212] border-b md:border-b-0 md:border-r border-[#262626] p-3 flex flex-col shrink-0">
          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#212121] transition-all cursor-pointer"
              title="Close Settings (Esc)"
            >
              <X size={16} />
            </button>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              GrowX Settings
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <Search
              size={13}
              className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#212121] border border-transparent focus:border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 outline-none transition-all"
            />
          </div>

          {/* Nav Tab Items */}
          <nav className="space-y-0.5 flex-1 overflow-y-auto custom-scrollbar pt-1">
            {filteredTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                    isActive
                      ? "bg-[#212121] text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]"
                  )}
                >
                  <Icon size={15} className={isActive ? "text-white" : "text-zinc-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer Clearance */}
          <div className="pt-2 mt-auto border-t border-[#262626] px-1">
            <span className="text-[10px] text-zinc-500 font-medium">
              Enterprise OS v2.4 • Admin Clear
            </span>
          </div>
        </div>

        {/* ═══ RIGHT CONTENT AREA (ChatGPT Style 1-Line Rows) ═══ */}
        <div className="flex-1 flex flex-col bg-[#171717] overflow-hidden">
          {/* Content Header */}
          <div className="px-6 pt-5 pb-3 border-b border-[#262626] flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-white capitalize">
              {TABS.find((t) => t.id === activeTab)?.label || "Settings"}
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="md:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {/* 1. GENERAL TAB (EXACT CHATGPT MATCH) */}
            {activeTab === "general" && (
              <div className="space-y-4">
                {/* Optional MFA Banner (like ChatGPT) */}
                <div className="p-4 rounded-xl bg-[#212121] border border-[#2a2a2a] flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#2a2a2a] text-zinc-200 shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Secure your account</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        Add multi-factor authentication (MFA) to help protect your administrative credentials.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-7 text-[11px] px-3 font-semibold border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 rounded-lg shrink-0"
                  >
                    Set up MFA
                  </Button>
                </div>

                {/* Settings Rows */}
                <div className="divide-y divide-[#262626] border-t border-b border-[#262626]">
                  {/* Row 1: Appearance */}
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">
                      Appearance
                    </span>
                    <div ref={themeRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsThemeOpen(!isThemeOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] border border-[#2e2e33] text-xs font-medium text-zinc-200 cursor-pointer transition-all shadow-xs"
                      >
                        <span className="capitalize">{theme || "system"}</span>
                        <ChevronDown size={13} className="text-zinc-400" />
                      </button>

                      {isThemeOpen && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-[350] w-36 rounded-xl bg-[#212121] border border-[#333333] p-1 shadow-xl animate-in fade-in duration-150">
                          {(["system", "dark", "light"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setTheme(t);
                                setIsThemeOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer",
                                (theme || "system") === t
                                  ? "bg-[#2e2e2e] text-white font-semibold"
                                  : "text-zinc-400 hover:text-white hover:bg-[#282828]"
                              )}
                            >
                              <span>{t}</span>
                              {(theme || "system") === t && <Check size={13} className="text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Accent Color (EXACT CHATGPT MATCH) */}
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">
                      Accent color
                    </span>
                    <div ref={accentRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsAccentOpen(!isAccentOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] border border-[#2e2e33] text-xs font-medium text-zinc-200 cursor-pointer transition-all shadow-xs"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: getSwatchColor(selectedAccent) }}
                        />
                        <span>{selectedAccent.name}</span>
                        <ChevronDown size={13} className="text-zinc-400" />
                      </button>

                      {isAccentOpen && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-[350] w-44 rounded-xl bg-[#212121] border border-[#333333] p-1 shadow-xl animate-in fade-in duration-150 space-y-0.5">
                          {accentOptions.map((opt) => {
                            const isSelected = accentColor === opt.id;
                            const bg = getSwatchColor(opt);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setAccentColor(opt.id);
                                  setIsAccentOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                                  isSelected
                                    ? "bg-[#2e2e2e] text-white font-semibold"
                                    : "text-zinc-300 hover:text-white hover:bg-[#282828]"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: bg }}
                                  />
                                  <span>{opt.name}</span>
                                </div>
                                {isSelected && <Check size={13} className="text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Language */}
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">
                      Language
                    </span>
                    <div ref={langRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] border border-[#2e2e33] text-xs font-medium text-zinc-200 cursor-pointer transition-all shadow-xs"
                      >
                        <span>Auto-detect</span>
                        <ChevronDown size={13} className="text-zinc-400" />
                      </button>

                      {isLangOpen && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-[350] w-36 rounded-xl bg-[#212121] border border-[#333333] p-1 shadow-xl animate-in fade-in duration-150">
                          {["Auto-detect", "English (US)", "English (UK)"].map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => setIsLangOpen(false)}
                              className={cn(
                                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                                l === "Auto-detect"
                                  ? "bg-[#2e2e2e] text-white font-semibold"
                                  : "text-zinc-400 hover:text-white hover:bg-[#282828]"
                              )}
                            >
                              <span>{l}</span>
                              {l === "Auto-detect" && <Check size={13} className="text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Compact Mode Toggle */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">
                        Compact Navigation
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Minimize sidebar rails to maximize active canvas space.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompactNav(!compactNav)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative",
                        compactNav ? "bg-[var(--primary)]" : "bg-[#2e2e33]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform shadow-xs",
                          compactNav ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Sleek 1-Row Live Preview */}
                <div className="p-3.5 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Live Accent Reactivity
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      Buttons &amp; badges update instantly.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      className="text-xs h-7 px-3 font-bold rounded-lg shadow-sm"
                    >
                      Primary Action
                    </Button>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-3 divide-y divide-[#262626]">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Two-Factor Authentication</div>
                    <p className="text-[11px] text-zinc-500">Enforced for all admin sessions.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Enabled
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Database Row-Level Security</div>
                    <p className="text-[11px] text-zinc-500">PostgreSQL policies verified.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Protected
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Active Session</div>
                    <p className="text-[11px] text-zinc-500">Windows • Chrome • Current session</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    Online now
                  </span>
                </div>
              </div>
            )}

            {/* 3. TEAM TAB */}
            {activeTab === "users" && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 mb-2">
                  Administrative team members with access to GrowXLabs.
                </p>
                {[
                  { name: "GrowX Admin", email: "admin@growxlabs.tech", role: "Super Admin" },
                  { name: "Varshith", email: "varshith@growxlabs.tech", role: "Founder / Executive" },
                  { name: "Engineering Agent", email: "agent@growxlabs.tech", role: "Co-Admin" },
                ].map((u, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#212121] border border-[#2a2a2a] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[10px] font-bold">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-zinc-400">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-300 bg-[#2b2b2b] px-2 py-0.5 rounded-md">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 4. INTEGRATIONS TAB */}
            {activeTab === "integrations" && (
              <div className="space-y-2">
                {[
                  { name: "Supabase PostgreSQL", desc: "Primary relational store", status: "Connected" },
                  { name: "Google Gemini 1.5 API", desc: "Model gateway & intelligence", status: "Active" },
                  { name: "NextAuth Authentication", desc: "JWT session encryption", status: "Enforced" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#212121] border border-[#2a2a2a] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 5. STORAGE TAB */}
            {activeTab === "storage" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#212121] border border-[#2a2a2a] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Local Cache &amp; Preferences</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Stored in browser localStorage</p>
                  </div>
                  <Button
                    onClick={() => {
                      localStorage.removeItem("growx-accent-color");
                      window.location.reload();
                    }}
                    variant="outline"
                    className="h-7 text-[11px] px-2.5 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                  >
                    Reset Cache
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
