"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Statically import English as a fallback
const enDictionary = {
  "hero": {
    "label": "TRANSFORM YOUR DIGITAL FOOTPRINT",
    "title1": "Digital Systems",
    "title2": "That Drive Growth.",
    "subtitle": "We build high-performance websites and automation systems that help businesses grow faster. From custom platforms to AI-powered workflows — GrowX Labs handles everything end-to-end.",
    "cta_start": "Get Started",
    "cta_portfolio": "View Portfolio"
  },
  "services": {
    "title": "Our Expertise",
    "subtitle": "World-class engineering for high-stakes digital products.",
    "items": [
      {
        "title": "WorkFlow Automation",
        "desc": "Eliminate manual bottlenecks with AI-driven automation pipelines that work while you sleep."
      },
      {
        "title": "AI Integration",
        "desc": "Inject intelligence into your business with custom LLM integrations and autonomous lead generation."
      }
    ]
  },
  "nav": {
    "services": "Services",
    "portfolio": "Portfolio",
    "pricing": "Pricing",
    "about": "About",
    "contact": "Contact",
    "dashboard": "Dashboard",
    "get_started": "Get Started"
  },
  "chat": {
    "welcome": "Welcome to GrowX Labs! To get started, what is your Business Name and City?",
    "onboarding": "Our team will contact you within 1 hour.",
    "submitting": "Processing intelligence...",
    "success": "Lead Captured Successfully",
    "placeholder": "Type your message..."
  }
};

type Region = "in" | "us" | "eu";
type Locale = "en" | "te" | "hi" | "fr" | "es";

interface LanguageContextType {
  region: Region;
  locale: Locale;
  t: (key: string) => any;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialRegion, 
  initialLocale 
}: { 
  children: ReactNode;
  initialRegion: Region;
  initialLocale: Locale;
}) {
  const [dictionary, setDictionary] = useState<any>(enDictionary);
  const [loading, setLoading] = useState(false);

  const loadDictionary = async (reg: Region, lang: Locale) => {
    // English is the baseline, but we check if we have localized files for that region
    setLoading(true);
    try {
      const response = await fetch(`/locales/${reg}/${lang}.json`);
      if (!response.ok) throw new Error("Locale not found");
      const data = await response.json();
      setDictionary(data);
    } catch (error) {
      console.warn("Falling back to English baseline...");
      setDictionary(enDictionary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDictionary(initialRegion, initialLocale);
  }, [initialRegion, initialLocale]);

  const t = (key: string) => {
    if (!dictionary) return key;
    const keys = key.split(".");
    let value = dictionary;
    for (const k of keys) {
      if (!value || value[k] === undefined) return key;
      value = value[k];
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ region: initialRegion, locale: initialLocale, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
