"use client";

import React, { useState } from 'react';
import { Printer, Pencil, Eye, ShieldCheck, Building2, Palette, Target, Calendar, Check } from 'lucide-react';

const EditField = ({ isEditing, value, onChange, placeholder, className, multiline }: {
  isEditing: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) => {
  if (!isEditing) {
    return <span className={className}>{value || placeholder || "—"}</span>;
  }
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} bg-yellow-50/80 border-2 border-[#00A86B] outline-none px-2 py-1 rounded min-h-[60px] w-full text-neutral-900`}
        style={{ color: "inherit" }}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} bg-yellow-50/80 border-b-2 border-[#00A86B] outline-none px-1 rounded text-neutral-900`}
      style={{ color: "inherit" }}
    />
  );
};

export default function OnboardingPreview() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "Sample Business",
    industry: "Restaurant",
    city: "Guntur, AP",
    email: "client@example.com",
    phone: "+91 98765 43210",
    website: "",
    primaryColor: "#0D1B4B",
    secondaryColor: "#00A86B",
    brandPersonality: ["Professional", "Bold"],
    competitors: ["competitor1.com", "competitor2.com", ""],
    primaryGoal: "All of above",
    targetAudience: "Local customers aged 25-45 looking for premium dining experiences",
    features: ["Contact", "WhatsApp", "Gallery", "Booking"],
    notWanted: "",
    contentReady: "Partially ready",
    launchDate: "2026-06-01",
    commPref: "Both",
    reachTime: "Morning 9-12",
    notes: "Need the website live before our new location opens.",
    agree: true
  });

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4 print:bg-white print:py-0 print:px-0" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      {/* Toolbar */}
      <div className="max-w-[850px] mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2 text-neutral-500">
          <ShieldCheck className="text-green-600 h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Client Onboarding Brief</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
              isEditing
                ? 'bg-[#00A86B] text-white'
                : 'bg-white border border-neutral-200 text-neutral-700'
            }`}
          >
            {isEditing ? <><Eye className="h-4 w-4" /> Preview</> : <><Pencil className="h-4 w-4" /> Edit Live</>}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#0D1B4B] text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" /> Print Brief
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="max-w-[850px] mx-auto mb-4 px-4 py-3 bg-[#00A86B]/10 border border-[#00A86B]/20 rounded-xl flex items-center gap-3 print:hidden">
          <Pencil className="h-4 w-4 text-[#00A86B]" />
          <p className="text-sm font-medium text-[#00A86B]">
            <strong>Edit Mode</strong> — Click any highlighted field to edit. This document can be printed as a client brief.
          </p>
        </div>
      )}

      {/* Document */}
      <div data-admin-typography="preserve" className="max-w-[850px] mx-auto bg-white shadow-2xl print:shadow-none min-h-[1100px] flex flex-col font-sans border border-neutral-200 print:border-none">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-[#00b894] p-12 mb-8 bg-[#0D1B4B] text-white">
           <div className="text-left">
              <h1 className="text-[36px] font-black text-[#00b894] tracking-tight m-0 leading-none">GrowXLabs<span className="text-white">Tech</span></h1>
              <p className="text-[12px] text-white/60 mt-2 m-0 font-medium tracking-wide uppercase italic">Onboarding & Strategic Brief</p>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[11px] font-bold text-white uppercase tracking-widest">Document Ref</p>
              <p className="text-[14px] font-black text-[#00b894]">ONB-{new Date().getFullYear()}-001</p>
           </div>
        </div>

        {/* CONTENT */}
        <div className="p-12 flex-1">
          
          {/* Section 1: Business Identity */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
                <Building2 className="text-[#00A86B] h-5 w-5" />
              </div>
              <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#0D1B4B]">Business Identity</h3>
              <div className="h-px bg-[#00b894]/20 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Business Name</label>
                <p className="text-lg font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.businessName} onChange={(v) => update('businessName', v)} className="text-lg font-bold text-[#0D1B4B]" />
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Industry</label>
                <p className="text-lg font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.industry} onChange={(v) => update('industry', v)} className="text-lg font-bold text-[#0D1B4B]" />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Location</label>
                <p className="text-sm font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.city} onChange={(v) => update('city', v)} className="text-sm font-bold text-[#0D1B4B]" />
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Email</label>
                <p className="text-sm font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.email} onChange={(v) => update('email', v)} className="text-sm font-bold text-[#0D1B4B]" />
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Phone</label>
                <p className="text-sm font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.phone} onChange={(v) => update('phone', v)} className="text-sm font-bold text-[#0D1B4B]" />
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Brand DNA */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-[#00A86B]/10 flex items-center justify-center">
                <Palette className="text-[#00A86B] h-4 w-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0D1B4B]">Brand DNA</h3>
              <div className="h-px bg-[#00A86B] flex-1 opacity-10" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Brand Colors</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg border border-neutral-200" style={{ backgroundColor: formData.primaryColor }} />
                    <span className="text-xs font-mono text-neutral-600">{formData.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg border border-neutral-200" style={{ backgroundColor: formData.secondaryColor }} />
                    <span className="text-xs font-mono text-neutral-600">{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Personality</label>
                <div className="flex flex-wrap gap-2">
                  {formData.brandPersonality.map((trait, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#00A86B]/10 text-[#00A86B] border border-[#00A86B]/20">
                      {trait}
                    </span>
                  ))}
                  {formData.brandPersonality.length === 0 && <span className="text-xs text-neutral-400 italic">Not specified</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Inspiration / Competitors</label>
              <div className="flex gap-4">
                {formData.competitors.filter(c => c).map((comp, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-100 text-xs font-medium text-neutral-600">
                    {comp}
                  </span>
                ))}
                {formData.competitors.filter(c => c).length === 0 && (
                  <span className="text-xs text-neutral-400 italic">None provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Project Objectives */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-[#00A86B]/10 flex items-center justify-center">
                <Target className="text-[#00A86B] h-4 w-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0D1B4B]">Project Objectives</h3>
              <div className="h-px bg-[#00A86B] flex-1 opacity-10" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Primary Goal</label>
                <p className="text-lg font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.primaryGoal} onChange={(v) => update('primaryGoal', v)} className="text-lg font-bold text-[#0D1B4B]" />
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Required Features</label>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feat, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-[#0D1B4B]/5 text-[#0D1B4B] border border-[#0D1B4B]/10">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Target Audience</label>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <EditField isEditing={isEditing} value={formData.targetAudience} onChange={(v) => update('targetAudience', v)} placeholder="Target audience description" className="text-sm text-neutral-700 leading-relaxed" multiline />
              </div>
            </div>
          </div>

          {/* Section 4: Operations */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-[#00A86B]/10 flex items-center justify-center">
                <Calendar className="text-[#00A86B] h-4 w-4" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0D1B4B]">Operations & Timeline</h3>
              <div className="h-px bg-[#00A86B] flex-1 opacity-10" />
            </div>

            <div className="grid grid-cols-3 gap-8 bg-[#0D1B4B]/[0.02] rounded-2xl p-6 border border-neutral-100 mb-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Target Launch</label>
                <p className="text-sm font-bold text-[#0D1B4B]">
                  <EditField isEditing={isEditing} value={formData.launchDate} onChange={(v) => update('launchDate', v)} className="text-sm font-bold text-[#0D1B4B]" />
                </p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Communication</label>
                <p className="text-sm font-bold text-[#0D1B4B]">{formData.commPref}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Content Status</label>
                <p className="text-sm font-bold text-[#0D1B4B]">{formData.contentReady}</p>
              </div>
            </div>

            {formData.notes && (
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">Special Instructions</label>
                <div className="p-4 bg-[#00A86B]/5 rounded-xl border border-[#00A86B]/10">
                  <EditField isEditing={isEditing} value={formData.notes} onChange={(v) => update('notes', v)} className="text-sm text-neutral-700 leading-relaxed italic" multiline />
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="grid grid-cols-2 gap-24 pt-12 border-t border-neutral-100">
            <div className="space-y-6">
              <div className="h-10 border-b-2 border-neutral-900" />
              <div>
                <p className="text-[10px] font-black uppercase text-[#0D1B4B]">Authorized For GrowXLabsTech</p>
                <p className="text-[9px] font-bold text-neutral-400 mt-0.5 tracking-widest italic uppercase">Project Manager</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-10 border-b-2 border-neutral-900" />
              <div>
                <p className="text-[10px] font-black uppercase text-[#0D1B4B]">Client Acknowledgment</p>
                <p className="text-[9px] font-bold text-neutral-400 mt-0.5 tracking-widest italic uppercase">{formData.businessName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto bg-[#0D1B4B] p-5 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
            GrowXLabsTech Onboarding Protocol | GrowXLabsTech Confidential Brief
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden, [class*="print:hidden"] { display: none !important; }
          @page { margin: 1cm; size: A4; }
          .shadow-2xl { box-shadow: none !important; }
          .min-h-screen { min-height: auto !important; padding: 0 !important; }
          .bg-neutral-100 { background: white !important; }
          input, textarea { border: none !important; background: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
