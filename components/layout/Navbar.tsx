"use client";

import { useState, useEffect } from "react";
import { GrowxMenu, X } from "@/components/icons";

import { cn } from "@/lib/utils";
import { Button, LiquidButton } from "@/components/ui/Button";
import { usePathname } from "@/navigation-client";
import { Link } from "@/navigation-client";
import { useSession, signOut } from "next-auth/react";
import { getAbsoluteUrl } from "@/lib/subdomains";
import { getEditorialArticle } from "@/components/marketing/editorialArticleData";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as any)?.role;
  const dashboardPath = (userRole === "ADMIN" || userRole === "CO_ADMIN" || userRole === "crm_agent")
    ? "/admin"
    : "/client/dashboard";

  const pathname = usePathname();
  const isDemoRoute = Boolean(pathname?.includes("/demos"));
  const isBlog = Boolean(pathname?.includes("/blog"));
  const blogSlug = pathname?.split("/").filter(Boolean).at(-1) || "";
  const editorialArticle = getEditorialArticle(blogSlug);
  const isLightThemePage = Boolean(isBlog && editorialArticle?.theme === "light");
  const isDarkBlog = Boolean(isBlog && editorialArticle?.theme === "dark");
  const isAirForceTheme = !isDarkBlog && !isLightThemePage;

  const topLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Products", href: "/products" },
    { name: "R&D", href: "/research" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ'S", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const centerNavLinks = [
    { name: "Portfolio", href: "/portfolio" },
    { name: "R&D", href: "/research" },
    { name: "FAQ", href: "/faq" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  if (isDemoRoute) return null;

  return (
    <>
      {/* ═══ GROWXLABS PUBLIC FLOATING INSET HEADER (EARTH OPAQUE SURFACE) ═══ */}
      <header
        role="banner"
        className={cn(
          "fixed z-50 select-none",
          "top-3 left-3 right-3 md:top-4 md:left-6 md:right-6",
          "h-[68px] sm:h-[70px] md:h-[80px]",
          "bg-[#E9E7E1] rounded-[16px]",
          "border border-[#22282C]/[0.08]",
          "shadow-none"
        )}
      >
        <div className="w-full h-full px-3.5 sm:px-5 md:px-6 lg:px-10">
          <div className="flex justify-between items-center relative w-full h-full">
            
            {/* ═══ ZONE 1: LEFT — Hamburger Icon → Brand Wordmark ═══ */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-4 lg:gap-6 z-10">
              {/* Hamburger Menu Button (Minimum 44x44px clickable touch target) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 p-2 cursor-pointer bg-transparent border-0 rounded-none text-[#22282C] hover:text-[#353A3E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22282C]"
                aria-label="Open menu"
              >
                <GrowxMenu size={24} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[#22282C]" />
              </button>

              {/* Brand Wordmark */}
              {(() => {
                const resolvedHref = getAbsoluteUrl("/");
                const isExternal = resolvedHref.startsWith("http") && isMounted;
                const linkContent = (
                  <div className="flex items-center text-[17px] sm:text-[18px] md:text-[19px] lg:text-[23px] font-serif font-bold tracking-tight whitespace-nowrap">
                    <span className="text-[#22282C]">GrowxLabs</span>
                    <span className="text-[#353A3E]">.tech</span>
                  </div>
                );

                if (isExternal) {
                  return (
                    <a 
                      href={resolvedHref} 
                      className="flex items-center group notranslate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22282C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9E7E1]" 
                      translate="no" 
                      aria-label="GrowxLabs home"
                    >
                      {linkContent}
                    </a>
                  );
                }
                return (
                  <Link 
                    href="/" 
                    className="flex items-center group notranslate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22282C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9E7E1]" 
                    translate="no" 
                    aria-label="GrowxLabs home"
                  >
                    {linkContent}
                  </Link>
                );
              })()}
            </div>

            {/* ═══ ZONE 2: CENTER — Navigation (Portfolio · R&D · FAQ) ═══ */}
            <nav 
              aria-label="Primary Navigation"
              className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4 lg:gap-8 z-10"
            >
              {centerNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                const resolvedHref = isMounted ? getAbsoluteUrl(link.href) : link.href;
                const isExternal = isMounted && resolvedHref.startsWith("http");
                
                const linkClasses = cn(
                  "relative py-1 text-[13px] lg:text-[14px] font-sans transition-colors duration-200 select-none",
                  isActive
                    ? "text-[#22282C] font-semibold after:scale-x-100"
                    : "text-[#22282C]/85 hover:text-[#22282C] font-medium after:scale-x-0 hover:after:scale-x-100",
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#22282C] after:origin-left after:transition-transform after:duration-200 after:ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22282C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9E7E1]"
                );

                if (isExternal) {
                  return (
                    <a key={link.href} href={resolvedHref} className={linkClasses}>
                      {link.name}
                    </a>
                  );
                }
                return (
                  <Link key={link.href} href={link.href} className={linkClasses}>
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* ═══ ZONE 3: RIGHT — Contact Button ═══ */}
            <div className="flex items-center z-10">
              <LiquidButton
                href="/contact"
                variant="primary"
                size="default"
                className="h-[36px] sm:h-[42px] md:h-[46px] px-3.5 sm:px-5 md:px-6 min-w-0 text-xs md:text-[13px] font-semibold !rounded-none rounded-none"
              >
                Contact
              </LiquidButton>
            </div>

          </div>
        </div>
      </header>

      {/* Menu Drawer Overlay (slides in from left) */}
      <div
        className={cn(
          "fixed inset-0 z-[55] transition-all duration-500 ease-in-out",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop (dimmed background) */}
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" 
        />

        {/* Drawer Container */}
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] border-r flex flex-col justify-between py-6 transition-transform duration-500 ease-out z-10 shadow-2xl",
            isAirForceTheme ? "bg-[#DCE8EE] border-[#9CB5C1] text-[#17252D]" : (isLightThemePage ? "bg-[#F7F4EE] border-[#111111]/15 text-[#111111]" : "bg-[#020202] border-neutral-800 text-white"),
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Top Section */}
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6 px-6">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "transition-colors cursor-pointer bg-transparent border-0 p-1.5 -ml-1.5 rounded-md",
                  isAirForceTheme ? "text-[#17252D] hover:text-[#385568] hover:bg-[#C8DCE5]" : (isLightThemePage ? "text-[#1A1A1A] hover:text-[#111111] hover:bg-neutral-100" : "text-neutral-400 hover:text-white hover:bg-white/5")
                )}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links — clean, borderless list with proper hierarchy and spacing */}
            <div className="flex flex-col gap-1 px-4">
              {topLinks.map((link) => {
                const isCurrent = pathname === link.href;
                const resolvedHref = isMounted ? getAbsoluteUrl(link.href) : link.href;
                const isExternal = isMounted && resolvedHref.startsWith("http");

                const linkClasses = cn(
                  "text-[15px] font-medium transition-all text-left block w-full px-4 py-2.5 rounded-lg",
                  isCurrent
                    ? (isAirForceTheme ? "bg-[#A2BECC] text-[#17252D] font-semibold" : "bg-neutral-200/60 dark:bg-neutral-800 font-semibold")
                    : (isAirForceTheme ? "text-[#17252D] hover:text-[#17252D] hover:bg-[#C8DCE5]" : (isLightThemePage ? "text-[#34312D] hover:text-[#111111] hover:bg-black/[0.04]" : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"))
                );

                if (isExternal) {
                  return (
                    <a
                      key={link.href}
                      href={resolvedHref}
                      className={linkClasses}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClasses}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isLoggedIn && (
                <div className={cn(
                  "pt-2 mt-2 border-t flex flex-col gap-1",
                  isAirForceTheme ? "border-[#9CB5C1]" : "border-neutral-800"
                )}>
                  {(() => {
                    const resolvedHref = isMounted ? getAbsoluteUrl(dashboardPath) : dashboardPath;
                    const isExternal = isMounted && resolvedHref.startsWith("http");
                    const linkClasses = cn(
                      "text-[15px] font-medium transition-all text-left block w-full px-4 py-2.5 rounded-lg",
                      isAirForceTheme ? "text-[#17252D] hover:bg-[#C8DCE5]" : (isLightThemePage ? "text-[#34312D] hover:text-[#111111] hover:bg-black/[0.04]" : "text-neutral-300 hover:text-white hover:bg-white/[0.04]")
                    );

                    if (isExternal) {
                      return (
                        <a
                          href={resolvedHref}
                          className={linkClasses}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </a>
                      );
                    }
                    return (
                      <Link
                        href={dashboardPath}
                        className={linkClasses}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "text-[14px] font-medium transition-colors text-left block w-full px-4 py-2 rounded-lg bg-transparent border-0 cursor-pointer",
                      isAirForceTheme ? "text-[#385568] hover:text-red-500" : "text-neutral-400 hover:text-red-400"
                    )}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Careers + Direct Contact Details */}
          <div className={cn(
            "border-t flex flex-col mt-auto pt-4 px-4 gap-3 shrink-0",
            isAirForceTheme ? "border-[#9CB5C1]" : (isLightThemePage ? "border-[#111111]/15" : "border-neutral-800")
          )}>
            {/* Careers Link */}
            {(() => {
              const resolvedHref = isMounted ? getAbsoluteUrl("/careers") : "/careers";
              const isExternal = isMounted && resolvedHref.startsWith("http");
              const linkContent = (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#17252D]">Careers</span>
                  <span className={cn(
                    "text-[10px] font-mono font-medium px-2 py-0.5 rounded border tracking-normal",
                    isAirForceTheme
                      ? "text-[#385568] border-[#9CB5C1] bg-[#A2BECC]/30"
                      : isLightThemePage 
                      ? "text-[#111111]/70 border-[#111111]/20 bg-black/[0.03]" 
                      : "text-neutral-400 border-neutral-700 bg-white/[0.04]"
                  )}>
                    WE&apos;RE HIRING
                  </span>
                </div>
              );

              const careersClasses = cn(
                "transition-all text-left block w-full px-4 py-2.5 rounded-lg",
                isAirForceTheme ? "hover:bg-[#C8DCE5]" : (isLightThemePage ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.04]")
              );

              if (isExternal) {
                return (
                  <a
                    href={resolvedHref}
                    className={careersClasses}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {linkContent}
                  </a>
                );
              }
              return (
                <Link
                  href="/careers"
                  className={careersClasses}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {linkContent}
                </Link>
              );
            })()}

            {/* Contact Details Section */}
            <div className="flex flex-col px-4 pt-1 pb-1">
              {/* Contact Email */}
              <a
                href="mailto:svp@growxlabs.tech"
                className={cn(
                  "text-xs font-mono tracking-tight truncate py-1 transition-colors block",
                  isAirForceTheme
                    ? "text-[#385568] hover:text-[#17252D]"
                    : isLightThemePage
                    ? "text-[#65625D] hover:text-[#111111]"
                    : "text-neutral-400 hover:text-white"
                )}
                title="Email us directly"
              >
                svp@growxlabs.tech
              </a>

              {/* Mobile No & WhatsApp */}
              <div className="flex items-center justify-between pt-1">
                <a
                  href="tel:+918790907144"
                  className={cn(
                    "text-xs font-mono tracking-tight transition-colors truncate flex-1",
                    isAirForceTheme
                      ? "text-[#385568] hover:text-[#17252D]"
                      : isLightThemePage
                      ? "text-[#65625D] hover:text-[#111111]"
                      : "text-neutral-400 hover:text-white"
                  )}
                  title="Call directly"
                >
                  +91 87909 07144
                </a>
                <a
                  href="https://wa.me/918790907144"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-colors shrink-0 ml-2 border flex items-center",
                    isAirForceTheme || isLightThemePage
                      ? "text-emerald-700 border-emerald-300/60 bg-emerald-50 hover:bg-emerald-100"
                      : "text-emerald-400 border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50"
                  )}
                  title="Chat on WhatsApp"
                >
                  <span>WA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
