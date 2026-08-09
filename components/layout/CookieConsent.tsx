"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, ChevronDown, ChevronUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isEmployeeWorkspaceRoute } from "@/lib/routes/application-shell";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("growx_cookie_consent");
    const savedPrefs = localStorage.getItem("growx_cookie_preferences");
    
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error("Error parsing cookie preferences", e);
      }
    }

    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveAndClose = (consentType: "accepted" | "rejected" | "custom", finalPrefs: CookiePreferences) => {
    localStorage.setItem("growx_cookie_consent", consentType);
    localStorage.setItem("growx_cookie_preferences", JSON.stringify(finalPrefs));
    setIsVisible(false);
    
    // Dispatch a custom event to notify analytics scripts
    window.dispatchEvent(
      new CustomEvent("growx_consent_updated", { detail: { consent: consentType, preferences: finalPrefs } })
    );
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveAndClose("accepted", allAccepted);
  };

  const handleDeclineAll = () => {
    const allDeclined = { essential: true, analytics: false, marketing: false };
    setPreferences(allDeclined);
    saveAndClose("rejected", allDeclined);
  };

  const handleSavePreferences = () => {
    saveAndClose("custom", preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Essential cannot be disabled
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Custom Toggle Switch Component
  const Toggle = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }) => (
    <div
      onClick={() => !disabled && onChange()}
      className={`w-9 h-5 rounded-full flex items-center p-[2px] transition-colors duration-300 ${
        checked ? "bg-[#C0F0FB]" : "bg-zinc-800"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        layout
        className={`h-4 w-4 rounded-full ${checked ? "bg-black" : "bg-zinc-500"}`}
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );

  if (isEmployeeWorkspaceRoute(pathname)) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[1000] pointer-events-none"
        >
          <div className="w-full sm:w-[400px] bg-black/90 border border-white/10 hover:border-[#C0F0FB]/20 p-5 rounded-[24px] pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl text-white transition-all duration-500">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-[#C0F0FB]/10 border border-[#C0F0FB]/20 rounded-xl flex items-center justify-center shrink-0 text-[#C0F0FB] shadow-[0_0_15px_rgba(192,240,251,0.05)]">
                  <ShieldCheck className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1 flex-grow">
                  <p className="text-sm font-bold text-white tracking-tight leading-tight">Cookie Preferences</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    We use cookies to optimize performance, customize content, and analyze our traffic.
                    <Link href="/privacy" className="text-[#C0F0FB] hover:underline ml-1 font-semibold">Privacy Policy</Link>
                  </p>
                </div>
                <button 
                  onClick={handleDeclineAll}
                  className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 self-start"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Preferences List (Expandable) */}
              <AnimatePresence initial={false}>
                {isCustomizing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-white/5 pt-3 mt-1"
                  >
                    <div className="space-y-3 pb-3">
                      {/* Essential */}
                      <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white">Strictly Necessary</p>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C0F0FB] bg-[#C0F0FB]/10 px-1.5 py-0.5 rounded-md">Always Active</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-normal">Required for the site to function properly.</p>
                        </div>
                        <Toggle checked={preferences.essential} onChange={() => {}} disabled={true} />
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C0F0FB]/10 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Analytics & Performance</p>
                          <p className="text-[10px] text-zinc-400 leading-normal">Helps us analyze user behavior to improve site features.</p>
                        </div>
                        <Toggle 
                          checked={preferences.analytics} 
                          onChange={() => togglePreference("analytics")} 
                        />
                      </div>

                      {/* Marketing */}
                      <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C0F0FB]/10 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Marketing & Personalization</p>
                          <p className="text-[10px] text-zinc-400 leading-normal">Allows us to personalize content and marketing campaigns.</p>
                        </div>
                        <Toggle 
                          checked={preferences.marketing} 
                          onChange={() => togglePreference("marketing")} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="flex-1 h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition-all cursor-pointer bg-transparent flex items-center justify-center gap-1.5"
                  >
                    <span>{isCustomizing ? "Hide Options" : "Customize"}</span>
                    {isCustomizing ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  {!isCustomizing && (
                    <button 
                      onClick={handleDeclineAll}
                      className="flex-1 h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition-all cursor-pointer bg-transparent"
                    >
                      Decline
                    </button>
                  )}

                  <button 
                    onClick={isCustomizing ? handleSavePreferences : handleAcceptAll}
                    className="flex-1 bg-[#C0F0FB] text-black hover:bg-white h-9 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(192,240,251,0.25)] hover:shadow-[0_0_20px_rgba(192,240,251,0.45)] transition-all duration-300 cursor-pointer border-0 flex items-center justify-center gap-1.5"
                  >
                    {isCustomizing ? (
                      <>
                        <span>Save settings</span>
                        <Check size={11} className="stroke-[3]" />
                      </>
                    ) : (
                      "Accept All"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
