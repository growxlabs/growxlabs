"use client";

import { GrowxContact } from "@/components/icons";
import { Link, usePathname } from "@/navigation-client";
import { useState, useEffect } from "react";
import { getAbsoluteUrl } from "@/lib/subdomains";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const isLandingPage = pathname === "/" || pathname === "";

  const links = {
    legal: [
      { name: "Courses", href: "/courses" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy", href: "/privacy" },
      { name: "T&C", href: "/terms" },
    ],
  };

  // Typography & Accent Colors adhering to GrowxLabs design hierarchy
  const logoColor1 = "text-[#F5F4F0]";
  const logoColor2 = "text-[#B6C2C7]";
  const textColor = "text-[#B6C2C7]";
  const mainLinkColor = "text-[#F5F4F0] hover:text-[#B6C2C7]";
  const linkHoverColor = "hover:text-[#F5F4F0]";
  const accentColor = "text-[#B6C2C7]";
  const socialLinkClass = "text-[#B6C2C7] hover:text-[#F5F4F0]";

  return (
    <div
      className={cn(
        "w-full bg-[#F5F4F0] px-3 sm:px-4 md:px-[26px] pb-6 md:pb-8 select-none",
        isLandingPage ? "pt-0" : "pt-6"
      )}
    >
      <footer
        className={cn(
          "w-full overflow-hidden transition-colors duration-500 bg-[#22282C]",
          isLandingPage ? "rounded-t-none rounded-b-[16px]" : "rounded-[16px]",
          "pt-10 pb-10 px-6 md:px-12 xl:px-20 2xl:px-32"
        )}
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-10">
            {/* Left side: Brand + Email + Socials */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Wordmark: 24px desktop, bold serif */}
              <Link href="/" className="flex items-center group" aria-label="GrowxLabs home">
                <div className="flex items-center text-[21px] sm:text-[22px] md:text-[24px] font-serif font-bold tracking-normal transition-transform group-hover:scale-[1.02] duration-300">
                  <span className={logoColor1}>Growx</span>
                  <span className={logoColor1}>Labs</span>
                  <span className={logoColor2}>.tech</span>
                </div>
              </Link>

              <span className="hidden sm:inline text-[#4C575B]" aria-hidden="true">|</span>

              {/* Business email: 14px, weight 400 */}
              <a 
                href="mailto:svp@growxlabs.tech" 
                className={`flex items-center gap-2 text-[14px] font-normal transition-colors ${textColor} ${linkHoverColor}`}
              >
                <GrowxContact size={15} className={accentColor} aria-hidden="true" />
                <span>svp@growxlabs.tech</span>
              </a>

              <span className="hidden sm:inline text-[#4C575B]" aria-hidden="true">|</span>

              {/* Horizontal Social Icons: 18-20px */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.linkedin.com/company/growxlabs-tech/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`hover:scale-110 transition-all duration-300 p-1 ${socialLinkClass}`}
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/growxlabs.tech?igsh=MTJ2cmUwaHpibGVreg==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`hover:scale-110 transition-all duration-300 p-1 ${socialLinkClass}`}
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/share/1AymTBmSj2/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`hover:scale-110 transition-all duration-300 p-1 ${socialLinkClass}`}
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a 
                  href="https://github.com/saivarshithnaidu" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`hover:scale-110 transition-all duration-300 p-1 ${socialLinkClass}`}
                  aria-label="GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right side: Navigation links (15px desktop, 14px mobile, weight 500, 28-32px gap) */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-7 md:gap-x-8 gap-y-3">
              {links.legal.map((link) => {
                const resolvedHref = isMounted ? getAbsoluteUrl(link.href) : link.href;
                const isExternal = isMounted && resolvedHref.startsWith("http");

                if (isExternal) {
                  return (
                    <a
                      key={link.name}
                      href={resolvedHref}
                      className={`text-[14px] md:text-[15px] font-medium transition-colors ${mainLinkColor}`}
                    >
                      {link.name}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-[14px] md:text-[15px] font-medium transition-colors ${mainLinkColor}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* Centered Copyright: 13px, weight 400, adequate breathing room */}
          <div className="border-t pt-8 pb-1 flex items-center justify-center border-[#4C575B]">
            <p className={`text-[13px] font-normal text-center ${textColor}`}>
              Copyright 2026 GrowxLabs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
