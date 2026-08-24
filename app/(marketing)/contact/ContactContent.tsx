"use client";

import { MessageCircle } from "lucide-react";
import { GrowxContact, GrowxArrowRight } from "@/components/icons";

export function ContactContent() {
  return (
    <div className="bg-background text-foreground min-h-[90vh] flex flex-col justify-between pt-32 pb-16 font-sans antialiased">
      {/* Main Container */}
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full px-6 md:px-10 xl:px-16 2xl:px-24">
        
        {/* Top Section / Header Title */}
        <div className="relative pb-20 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <h1 className="text-[clamp(4.5rem,11vw,9.5rem)] font-serif font-black tracking-tight leading-[0.85] text-white m-0 notranslate select-none" translate="no">
              Contact
            </h1>
            
            {/* Status indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-10 text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase select-none lg:pb-2">
              <div className="flex flex-col gap-1">
                <span className="text-neutral-600">YOU ARE NOW</span>
                <span className="text-neutral-300 font-bold">VIEWING</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-neutral-600">SCROLL TO</span>
                <span className="text-neutral-300 font-bold">EXPLORE</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-neutral-600">GET IN TOUCH</span>
                <span className="text-neutral-300 font-bold">WITH OUR TEAM</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-neutral-600">© 2026</span>
                <span className="text-neutral-300 font-bold">GROWX LABS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Links Rows Container with Top Border */}
        <div className="w-full border-t border-neutral-800">
          
          {/* Row 1: Email */}
          <a
            href="mailto:sai@growxlabs.tech"
            className="group grid grid-cols-12 items-center py-11 border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-300 px-2"
          >
            {/* Index label */}
            <div className="col-span-12 md:col-span-3 mb-2 md:mb-0 text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase select-none">
              01 / Email
            </div>
            
            {/* Icon + Label */}
            <div className="col-span-11 md:col-span-8 flex items-center gap-5">
              <GrowxContact size={20} className="text-neutral-500 group-hover:text-primary transition-colors duration-300" />
              <span className="text-xl md:text-3xl font-sans font-normal tracking-tight text-neutral-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                sai@growxlabs.tech
              </span>
            </div>
            
            {/* Arrow Indicator */}
            <div className="col-span-1 flex justify-end select-none opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              <GrowxArrowRight size={20} className="text-white" />
            </div>
          </a>

          {/* Row 2: WhatsApp */}
          <a
            href="https://wa.me/918790907144"
            target="_blank"
            rel="noopener noreferrer"
            className="group grid grid-cols-12 items-center py-11 border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-300 px-2"
          >
            {/* Index label */}
            <div className="col-span-12 md:col-span-3 mb-2 md:mb-0 text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase select-none">
              02 / Whatsapp
            </div>
            
            {/* Icon + Label */}
            <div className="col-span-11 md:col-span-8 flex items-center gap-5">
              <MessageCircle className="h-5 w-5 text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300" />
              <span className="text-xl md:text-3xl font-sans font-normal tracking-tight text-neutral-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                +91 87909 07144
              </span>
            </div>
            
            {/* Arrow Indicator */}
            <div className="col-span-1 flex justify-end select-none opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              <GrowxArrowRight size={20} className="text-white" />
            </div>
          </a>

        </div>

        {/* Footer label indicator inside content area */}
        <div className="flex justify-between items-center text-[10px] font-mono tracking-[0.2em] text-neutral-600 uppercase pt-16 select-none">
          <span>// END OF CONTACT</span>
          <span>02 CHANNELS</span>
        </div>

      </div>
    </div>
  );
}
