"use client";

import React from "react";
import { PageHero } from "@/components/marketing/PageHero";
import { DiscoveryBookingForm } from "@/components/marketing/DiscoveryBookingForm";

export function ContactContent() {
  return (
    <div className="flex flex-col bg-black text-foreground snap-y snap-mandatory min-h-screen">
      {/* Screen 1: Universal Page Hero */}
      <section className="snap-start min-h-[100svh] flex flex-col justify-between">
        <PageHero
          title="Contact"
          viewingText="CONTACT"
          exploreText="DISCOVERY"
          exploreHref="#discovery"
          tagline="GLOBAL ENGAGEMENTS"
        />
      </section>

      {/* Screen 2: Discovery Call Page Only */}
      <section
        id="discovery"
        className="snap-start min-h-[100svh] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 bg-black py-12 relative z-10"
      >
        <DiscoveryBookingForm />
      </section>
    </div>
  );
}
