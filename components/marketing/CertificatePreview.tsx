"use client";

import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import Image from "next/image";

const cinzel = { className: "font-serif" };

export function CertificatePreview() {
  return (
    <div className="relative group perspective-2000 w-full mb-12 font-serif">
      <motion.div
        whileHover={{ rotateY: -2, rotateX: 1, scale: 1.02 }}
        className="aspect-[1.414/1] bg-[#faf6ee] text-[#1a1a1a] p-8 rounded-[4px] relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10"
      >
        {/* Borders */}
        <div className="absolute inset-2 border-[1.5px] border-[#c9a84c] pointer-events-none z-10" />
        <div className="absolute inset-[12px] border-[0.5px] border-[#c9a84c88] pointer-events-none z-10" />

        {/* Corner Ornaments (Simplified for preview) */}
        <div className="absolute top-2 left-2 w-8 h-8 opacity-40 z-20">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
            <path d="M8 8 L8 50" stroke="#c9a84c" strokeWidth="2"/>
            <path d="M8 8 L50 8" stroke="#c9a84c" strokeWidth="2"/>
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 opacity-40 z-20 scale-x-[-1]">
          <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
            <path d="M8 8 L8 50" stroke="#c9a84c" strokeWidth="2"/>
            <path d="M8 8 L50 8" stroke="#c9a84c" strokeWidth="2"/>
          </svg>
        </div>

        {/* Watermark */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] font-bold text-[#c9a84c]/[0.05] tracking-[-4px] select-none pointer-events-none ${cinzel.className}`}>
          GXL
        </div>

        {/* Main Content */}
        <div className="h-full flex flex-col justify-between items-center text-center relative z-10 py-2">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 scale-75 origin-top">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded flex items-center justify-center p-1.5">
              <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
                <path d="M10 22 L18 14 L26 22 L22 22 L22 30 L14 30 L14 22Z" fill="#c9a84c"/>
                <path d="M22 14 L34 14 L34 22 L26 22Z" fill="#c9a84c" opacity="0.5"/>
              </svg>
            </div>
            <span className={`text-[14px] font-semibold tracking-[3px] text-[#1a1a1a] ${cinzel.className}`}>
              GROW<span className="text-[#c9a84c]">X</span> LABS
            </span>
          </div>

          <div className="flex flex-col items-center">
            <p className={`uppercase text-[6px] tracking-[0.4em] font-bold text-[#888] mb-4 ${cinzel.className}`}>Certificate of Mastery</p>
            <p className="text-[8px] font-light italic text-[#999] mb-1 uppercase tracking-widest">This is to certify that</p>
            <h5 className="text-2xl font-light italic text-[#1a1a1a] mb-1">Hemanth Kumar</h5>
            <div className="w-32 h-[0.5px] bg-[#c9a84c]/30 mb-3" />
            <p className={`text-[10px] font-semibold uppercase tracking-widest text-[#1a1a1a] ${cinzel.className}`}>AI Engineering Specialist</p>
          </div>

          <div className="w-full flex justify-between items-end px-4 mt-2 scale-90 origin-bottom">
            <div className="text-left">
              <div className="h-8 w-20 relative opacity-60 grayscale brightness-0">
                <Image 
                  src="/founder-signature.png" 
                  alt="Signature" 
                  fill 
                  className="object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-end">
                   <p className="text-[12px] font-serif italic text-black/40">Founder Name</p>
                </div>
              </div>
              <div className="w-20 h-[0.5px] bg-[#c9a84c] mb-1" />
              <p className="text-[5px] font-bold uppercase tracking-widest text-[#999]">Director · GrowX Labs</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="bg-card p-1 border border-[#e0d8c8] rounded shadow-sm">
                <QrCode size={24} strokeWidth={1.5} className="text-black" />
              </div>
              <p className="text-[5px] font-bold uppercase tracking-widest text-black/40">Verify</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
