"use client";

import { GrowxContact } from "@/components/icons";
import { Link, usePathname } from "@/navigation-client";
import { useState, useEffect } from "react";
import { getAbsoluteUrl } from "@/lib/subdomains";

export function Footer() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const isBlog = pathname?.includes("/blog");

  const links = {
    legal: [
      { name: "Courses", href: "/courses" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  };

  // Design tokens based on page context (Marketing / Blog)
  const footerBg = isBlog 
    ? "bg-transparent border-neutral-900" 
    : "bg-background border-border";

  const logoColor1 = "text-white";
  const logoColor2 = isBlog ? "text-white" : "text-[#C0F0FB]";

  const textColor = isBlog ? "text-neutral-300" : "text-[#8C8D91]";
  const headingColor = "text-white";
  const accentColor = isBlog ? "text-neutral-300" : "text-[#C0F0FB]";
  const linkHoverColor = "hover:text-white";

  const socialLinkClass = isBlog 
    ? "text-neutral-400 hover:text-white" 
    : "text-[#8C8D91] hover:text-[#C0F0FB]";

  return (
    <footer className={`w-full border-t pt-10 pb-10 px-6 md:px-12 xl:px-20 2xl:px-32 transition-colors duration-500 ${footerBg}`}>
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
          {/* Left side: Brand + Email + Socials */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Link href="/" className="flex items-center group" aria-label="GrowxLabs home">
              <div className="flex items-center text-xl font-serif tracking-normal transition-transform group-hover:scale-[1.02] duration-300">
                <span className={logoColor1}>Growx</span>
                <span className={logoColor1}>Labs</span>
                <span className={logoColor2}>.tech</span>
              </div>
            </Link>

            <span className="hidden md:inline text-border/30">|</span>

            <a href="mailto:sai@growxlabs.tech" className={`flex items-center gap-2 text-[13px] hover:text-foreground transition-colors ${textColor}`}>
              <GrowxContact size={14} className={accentColor} aria-hidden="true" /> sai@growxlabs.tech
            </a>

            <span className="hidden md:inline text-border/30">|</span>

            {/* Horizontal Social Icons */}
            <div className="flex items-center gap-4">
              <a 
                href="https://www.linkedin.com/company/growxlabs-tech/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:scale-110 transition-all duration-300 ${socialLinkClass}`}
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/growxlabs.tech?igsh=MTJ2cmUwaHpibGVreg==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:scale-110 transition-all duration-300 ${socialLinkClass}`}
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1AymTBmSj2/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:scale-110 transition-all duration-300 ${socialLinkClass}`}
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a 
                href="https://github.com/saivarshithnaidu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:scale-110 transition-all duration-300 ${socialLinkClass}`}
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right side: Legal links horizontal */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {links.legal.map((link) => {
              const resolvedHref = getAbsoluteUrl(link.href);
              const isExternal = resolvedHref.startsWith("http");

              if (isExternal) {
                return (
                  <a
                    key={link.name}
                    href={resolvedHref}
                    className={`text-[13px] transition-colors ${textColor} ${linkHoverColor}`}
                  >
                    {link.name}
                  </a>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] transition-colors ${textColor} ${linkHoverColor}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

        </div>

        <div className={`border-t pt-8 flex items-center justify-center ${isBlog ? "border-neutral-900" : "border-[#2B2D31]"}`}>
          <p className={`text-[13px] text-center ${textColor}`}>
            Copyright 2026 GrowxLabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

