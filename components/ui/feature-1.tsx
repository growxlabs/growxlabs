"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { BookingScheduler } from "@/components/marketing/BookingScheduler";

interface Feature1Props {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonPrimary?: {
    label: string;
    href: string;
  };
  buttonSecondary?: {
    label: string;
    href: string;
  };
}

export const Feature1 = ({
  title = "Ready to build what’s next?",
  description = "Let's make it happen.",
  imageSrc = "/images/landscape.jpg",
  imageAlt = "GrowXLabs Landscape Illustration",
  buttonPrimary = {
    label: "Book a Strategy Call",
    href: "/contact",
  },
  buttonSecondary = {
    label: "Explore Our Work",
    href: "/portfolio",
  },
}: Feature1Props) => {
  const [showCalendly, setShowCalendly] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleClose = () => {
    setShowCalendly(false);
    setIframeLoaded(false);
  };

  const renderButton = (
    button: { label: string; href: string },
    variant: "default" | "outline"
  ) => {
    const isExternal =
      button.href.startsWith("http://") || button.href.startsWith("https://");

    // Intercept Strategy Call buttons to show inline Calendly
    const isBookCall =
      button.label.toLowerCase().includes("strategy") ||
      button.label.toLowerCase().includes("call") ||
      button.label.toLowerCase().includes("book");

    if (isBookCall) {
      return (
        <Button
          variant={variant}
          onClick={(e) => {
            e.preventDefault();
            setShowCalendly(true);
          }}
        >
          {button.label}
        </Button>
      );
    }

    if (isExternal) {
      return (
        <Button variant={variant} asChild>
          <a href={button.href} target="_blank" rel="noopener noreferrer">
            {button.label}
          </a>
        </Button>
      );
    }

    return (
      <Button variant={variant} asChild>
        <Link href={button.href as any}>
          {button.label}
        </Link>
      </Button>
    );
  };

  return (
    <section className="py-24 border-t border-b border-white/5 bg-background overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left z-10">
            <h2 className="my-6 mt-0 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              {title}
            </h2>
            <p className="mb-8 max-w-xl text-zinc-400 text-base md:text-lg leading-relaxed">
              {description}
            </p>
            <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {buttonPrimary && renderButton(buttonPrimary, "default")}
              {buttonSecondary && renderButton(buttonSecondary, "outline")}
            </div>
          </div>
          <div
            className="relative group w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-[420px] border border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-xl rounded-[24px] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 hover:border-[#C0F0FB]/35"
          >
            {/* Subtle premium accent glows in background */}
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#C0F0FB]/5 blur-[70px] pointer-events-none transition-all duration-1000 ease-in-out",
                showCalendly ? "opacity-100 scale-150 bg-[#C0F0FB]/10" : "opacity-75 scale-100"
              )}
            />
            <div
              className={cn(
                "absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#355CFF]/5 blur-[50px] pointer-events-none transition-all duration-1000 ease-in-out",
                showCalendly ? "opacity-100 scale-150 bg-[#355CFF]/10" : "opacity-75 scale-100"
              )}
            />

            {/* Original Artwork Image Wrapper */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-all duration-700 ease-in-out z-10",
                showCalendly ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
              )}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 select-none"
              />
            </div>

            {/* Calendly Scheduler Widget Wrapper */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full flex flex-col transition-all duration-700 ease-in-out bg-[#0c0c0e]/95 backdrop-blur-xl",
                showCalendly ? "opacity-100 scale-100 z-20" : "opacity-0 scale-95 pointer-events-none z-0"
              )}
            >
              {/* Close/Back button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-30 bg-white/5 hover:bg-white/10 active:scale-95 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-full p-2 flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-all duration-300 shadow-lg"
                title="Return to Artwork"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Custom Booking Scheduler */}
              {showCalendly && (
                <div className="w-full h-full relative z-20">
                  <BookingScheduler onClose={handleClose} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
