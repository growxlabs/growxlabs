"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTheme } from "next-themes";

const Footer = dynamic(() => import("@/components/layout/Footer").then(mod => mod.Footer), {
  ssr: true,
});


export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  
  // Detect if we are in a dashboard or demo
  const isDashboard = pathname?.includes("/admin") || pathname?.includes("/client");
  const isDemo = pathname?.includes("/demos");

  // Apply dark theme for admin/dashboard, light for marketing
  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/client")) {
      // Allow dashboard pages to manage their own theme switcher state
      return;
    }

    if (isDashboard || isDemo) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [isDashboard, isDemo, setTheme, pathname]);

  const isBlog = pathname?.includes("/blog");

  // Toggle Every.to warm cream reading layout class for blog pages
  useEffect(() => {
    if (isBlog) {
      document.documentElement.classList.add("posts-page");
    } else {
      document.documentElement.classList.remove("posts-page");
    }
    return () => {
      document.documentElement.classList.remove("posts-page");
    };
  }, [isBlog]);
  
  const normalizedPath = pathname?.toLowerCase() || "";
  const isAuthPage = normalizedPath.includes("/login") || 
                     normalizedPath.includes("/register") || 
                     normalizedPath.includes("/signup");
  
  const isCareersSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("careers.");
  const isCareersPage = normalizedPath.includes("/careers") || isCareersSubdomain;
  const isCoursesPage = normalizedPath.includes("/courses");
  const isWishGame = normalizedPath.includes("/wish-game");
  const isArchitecture = normalizedPath.includes("/architecture");
  
  const isCheckoutPage = normalizedPath.includes("/checkout");
  
  // Hide marketing UI for dashboard, auth, careers, courses, wish-game, and architecture components to prevent visual conflicts
  if (isDashboard || isDemo || isAuthPage || isCareersPage || isCoursesPage || isWishGame || isArchitecture) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {!isCheckoutPage && <Footer />}
    </>
  );
}
