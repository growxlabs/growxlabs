"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Utensils, Bed, Building2, ArrowRight, Monitor, Smartphone, Layout, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DemoNavbar, DemoFooter, FloatingWhatsApp, DemoBadge } from "@/components/demos/SharedDemoUI";

const DEMOS = [
  {
    title: "Premium Restaurant",
    path: "/demos/restaurant",
    icon: Utensils,
    desc: "Luxury dining experience with signature menu and reservation architectural flows.",
    tags: ["F&B", "Hospitality"]
  },
  {
    title: "Boutique Hotel",
    path: "/demos/hotel",
    icon: Bed,
    desc: "Immersive stay showcase with area guides and room booking UI infrastructure.",
    tags: ["Travel", "Hotels"]
  },
  {
    title: "Real Estate Asset",
    path: "/demos/real-estate",
    icon: Building2,
    desc: "Corporate property listings with asset tracking and developer trust points.",
    tags: ["Property", "Asset"]
  }
];

export default function DemoHub() {
  return (
    <div className="bg-[#0B0F1A] text-[#DFE5F3] min-h-screen selection:bg-[#6C63FF]/30">
      <DemoNavbar brand="GrowXLabsTech Demos" />
      <DemoBadge />
      <FloatingWhatsApp phone="910000000000" />

      {/* 2. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#6C63FF]/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto text-center space-y-10 relative z-10">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] rounded-2xl border border-white/[0.08]">
              <Rocket className="text-[#6C63FF]" size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6C63FF]">Demo Repository Alpha</span>
           </motion.div>
           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-[9.5rem] font-black tracking-tighter leading-[0.85] italic">
              One System. <br /> <span className="text-white/10">Zero Friction.</span>
           </motion.h1>
           <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl text-[#9CA3AF] max-w-3xl mx-auto font-medium leading-relaxed">
              Standardized architectural templates for production delivery. Unified design system. Zero redundancy.
           </motion.p>
        </div>
      </section>

      {/* 4. Cards Section (Grid) */}
      <section className="py-20 px-6 mt-20 mb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {DEMOS.map((demo, i) => (
             <motion.div
               key={demo.title}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
             >
                <Link href={demo.path}>
                   <div className="group bg-[#111827] p-8 md:p-12 rounded-[3.5rem] border border-white/[0.08] h-full flex flex-col justify-between hover:bg-card/[0.02] hover:border-white/20 transition-all duration-700 relative overflow-hidden">
                      <div className="h-20 w-20 bg-[#6C63FF]/10 rounded-[2rem] flex items-center justify-center text-[#6C63FF] mb-12 group-hover:bg-[#6C63FF] group-hover:text-white transition-all shadow-xl shadow-[#6C63FF]/5">
                         <demo.icon size={36} />
                      </div>
                      <div className="space-y-6">
                         <h3 className="text-4xl font-black italic tracking-tighter group-hover:text-[#6C63FF] transition-colors">{demo.title}</h3>
                         <p className="text-lg text-[#9CA3AF] font-medium leading-relaxed">{demo.desc}</p>
                         <div className="flex flex-wrap gap-3">
                            {demo.tags.map(tag => (
                               <span key={tag} className="text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-card/5 rounded-full text-[#9CA3AF]/40">{tag}</span>
                            ))}
                         </div>
                      </div>
                      <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6C63FF] italic">Access Vector →</span>
                         <div className="flex gap-4 text-[#9CA3AF]/10">
                            <Monitor size={20} />
                            <Smartphone size={20} />
                         </div>
                      </div>
                   </div>
                </Link>
             </motion.div>
           ))}
        </div>
      </section>

      <DemoFooter brand="GrowXLabsTech Demos" />
    </div>
  );
}
