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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWordmarkHidden, setIsWordmarkHidden] = useState(false);
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
  const isContact = Boolean(pathname?.includes("/contact"));
  const blogSlug = pathname?.split("/").filter(Boolean).at(-1) || "";
  const editorialArticle = getEditorialArticle(blogSlug);
  const isLightThemePage = Boolean(isBlog && editorialArticle?.theme === "light");
  const isDarkBlog = Boolean(isBlog && editorialArticle?.theme === "dark");
  const isAirForceTheme = !isDarkBlog && !isLightThemePage;

  // Dynamic Theme Colors
  const navBg = isAirForceTheme
    ? "bg-transparent border-b-0 shadow-none"
    : isScrolled
    ? (isLightThemePage
        ? "bg-[#FBF9F5] border-b border-[#E5E2DC] shadow-sm"
        : "bg-black md:bg-black/90 border-b border-white/10 shadow-sm")
    : (isLightThemePage
        ? "bg-[#FBF9F5] border-b border-transparent"
        : "bg-black/80 border-b border-transparent");

  const logoColor1 = isAirForceTheme ? "text-[#17252D]" : (isLightThemePage ? "text-[#1A1A1A]" : "text-white");
  const logoColor2 = isAirForceTheme ? "text-[#55788D]" : (isLightThemePage ? "text-[#111111]" : (isBlog ? "text-white" : "text-[#C0F0FB]"));

  const buttonOverrideClass = isAirForceTheme
    ? "border-[#55788D]/40 text-[#17252D] hover:bg-[#E5EFF4]"
    : isLightThemePage
    ? "border-[#E5E2DC] text-[#1A1A1A] hover:bg-neutral-100"
    : "border-white/10 text-white hover:bg-white/5 bg-transparent";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;
    let prevScrolled = typeof window !== "undefined" ? window.scrollY > 20 : false;
    let prevHidden = typeof window !== "undefined" ? window.scrollY > 120 : false;

    if (prevScrolled) setIsScrolled(true);
    if (prevHidden) setIsWordmarkHidden(true);

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const nextScrolled = scrollY > 20;
          const nextHidden = scrollY > 120;

          if (nextScrolled !== prevScrolled) {
            setIsScrolled(nextScrolled);
            prevScrolled = nextScrolled;
          }
          if (nextHidden !== prevHidden) {
            setIsWordmarkHidden(nextHidden);
            prevHidden = nextHidden;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 py-3.5 sm:py-5",
          navBg
        )}
      >
        <div className="w-full px-4 sm:px-6 md:px-10">
          <div className="flex justify-between items-center relative h-9 sm:h-10">
            {/* Left Hamburger Button (Standard on Desktop & Mobile) */}
            <div className="flex items-center z-10">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "transition-colors p-1.5 -ml-1.5 cursor-pointer bg-transparent border-0 rounded-md",
                  isAirForceTheme ? "text-[#17252D] hover:text-[#55788D]" : (isLightThemePage ? "text-[#1A1A1A] hover:text-[#111111]" : "text-zinc-400 hover:text-white")
                )}
                aria-label="Open menu"
              >
                <GrowxMenu size={22} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Centered Serif Logo (True absolute mathematical center on all devices; smoothly fades out on scroll >120px to prevent overlapping content) */}
            <div 
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-[opacity,visibility] duration-[250ms] ease-out motion-reduce:transition-none",
                isWordmarkHidden 
                  ? "opacity-0 pointer-events-none invisible" 
                  : "opacity-100 pointer-events-auto visible"
              )}
              aria-hidden={isWordmarkHidden ? "true" : undefined}
            >
              {(() => {
                const resolvedHref = getAbsoluteUrl("/");
                const isExternal = resolvedHref.startsWith("http") && isMounted;
                if (isExternal) {
                  return (
                    <a 
                      href={resolvedHref} 
                      className="flex items-center group notranslate" 
                      translate="no" 
                      aria-label="GrowxLabs home"
                      tabIndex={isWordmarkHidden ? -1 : 0}
                    >
                      <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                        <span className={logoColor1}>GrowxLabs</span>
                        <span className={logoColor2}>.tech</span>
                      </div>
                    </a>
                  );
                }
                return (
                  <Link 
                    href="/" 
                    className="flex items-center group notranslate" 
                    translate="no" 
                    aria-label="GrowxLabs home"
                    tabIndex={isWordmarkHidden ? -1 : 0}
                  >
                    <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                      <span className={logoColor1}>GrowxLabs</span>
                      <span className={logoColor2}>.tech</span>
                    </div>
                  </Link>
                );
              })()}
            </div>

            {/* Right: Contact Button */}
            <div className="flex items-center justify-end z-10">
              <LiquidButton
                href="/contact"
                variant="primary"
                size="default"
                className="h-8 sm:h-9 md:h-[44px] px-3.5 sm:px-5 md:px-6 min-w-0 sm:min-w-[96px] md:min-w-[108px] text-xs sm:text-xs md:text-sm"
              >
                Contact
              </LiquidButton>
            </div>
          </div>
        </div>
      </nav>

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
