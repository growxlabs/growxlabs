'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from '@/navigation-client';
import { isEmployeeWorkspaceRoute } from '@/lib/routes/application-shell';

export function WhatsAppWidget() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Hide the widget completely on dashboard, admin, and client console views
  const isDashboardRoute = pathname?.includes('/admin') || 
                           pathname?.includes('/client') || 
                           pathname?.includes('/dashboard') ||
                           pathname?.includes('/careers') ||
                           pathname?.startsWith('/activate/') ||
                           pathname?.includes('/blog') ||
                           pathname?.includes('/insights') ||
                           pathname?.includes('/research') ||
                           isEmployeeWorkspaceRoute(pathname) ||
                           pathname === '/onboarding';

  // International format for Indian number: 918185958336
  const phoneNumber = '918185958336';
  const rawMessage = "Hi, I'd like to discuss a project with GrowX Labs. When can we have an intro call?";
  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  useEffect(() => {
    if (isDashboardRoute) return;

    const handleScroll = () => {
      // Show when scrolled down more than 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on mount/route-change

    // Fallback check to handle async browser scroll restoration
    const timeoutId = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname, isDashboardRoute]);

  if (isDashboardRoute) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none transition-all duration-500 transform",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
          : "opacity-0 translate-y-8 scale-90 pointer-events-none"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes brand-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(192, 240, 251, 0.45);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(192, 240, 251, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(192, 240, 251, 0);
          }
        }
        .brand-premium-pulse {
          animation: brand-pulse 2.5s infinite ease-in-out;
        }
      `}</style>

      {/* Tooltip Label (fades in on hover) */}
      <div
        className={cn(
          "bg-[#111111] border border-white/10 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xl transition-all duration-300 transform font-sans whitespace-nowrap pointer-events-none opacity-0 translate-x-4",
          isHovered && "opacity-100 translate-x-0"
        )}
      >
        Chat with us
      </div>

      {/* Pulsing Outer Ring (matches their brand ice blue #C0F0FB) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-[#C0F0FB] text-[#111111] rounded-full shadow-2xl transition-all duration-300 hover:scale-108 active:scale-95 group cursor-pointer brand-premium-pulse"
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-6.5 h-6.5 fill-current relative z-10 transition-transform group-hover:rotate-12 duration-300"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
