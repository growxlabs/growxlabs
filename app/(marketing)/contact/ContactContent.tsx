"use client";

import React from "react";
import { PageHero } from "@/components/marketing/PageHero";
import { DiscoveryBookingForm } from "@/components/marketing/DiscoveryBookingForm";

export function ContactContent() {
  return (
    <div className="flex flex-col bg-[#F5F4F0] text-[#17252D] snap-y snap-mandatory min-h-screen">
      {/* Screen 1: Universal Page Hero */}
      <section className="snap-start flex flex-col justify-between">
        <PageHero
          title="Contact"
          viewingText="CONTACT"
          exploreText="DISCOVERY"
          exploreHref="#discovery"
          tagline="GLOBAL ENGAGEMENTS"
        />
      </section>

      {/* Screen 2: Discovery Call Page Only */}
      <div className="w-full px-3 sm:px-4 md:px-6 pb-8 snap-start">
        <section
          id="discovery"
          className="min-h-[calc(100svh-32px)] rounded-[16px] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 bg-[#A2BECC] py-12 relative z-10"
        >
          <DiscoveryBookingForm />
        </section>
      </div>
    </div>
  );
}
