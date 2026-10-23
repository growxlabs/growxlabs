"use client";

import React, { useState } from 'react';
import { Check, Mail, Phone, MapPin, Globe, Printer, ShieldCheck, Pencil, Eye, Save, Loader2 } from 'lucide-react';
import SignaturePad from '@/components/shared/SignaturePad';

interface AgreementProps {
  data?: {
    client_name?: string;
    business_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gst_number?: string;
    service_type?: string;
    project_description?: string;
    total_amount?: string | number;
    advance_amount?: string | number;
    start_date?: string;
    delivery_date?: string;
    agreement_date?: string;
    invoice_no?: string;
  };
  role?: "admin" | "client" | "view";
  initialSignatures?: { client?: string | null, admin?: string | null };
  onSign?: (party: "admin" | "client", signatureDataUrl: string | null) => void;
  onUpdate?: (updatedData: any) => Promise<void>;
}

const EditableText = ({ isEditing, value, onChange, placeholder, className, type = "text", multiline = false }: {
  isEditing: boolean;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  multiline?: boolean;
}) => {
  if (!isEditing) {
    return <span className={`${className} text-[#111827] font-semibold`}>{value || placeholder || "—"}</span>;
  }
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} bg-neutral-50 border border-neutral-200 outline-none p-4 rounded-xl transition-all text-[#111827] w-full min-h-[120px] focus:border-[#355CFF] focus:ring-1 focus:ring-[#355CFF] font-medium`}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} bg-neutral-50/80 border-b border-neutral-300 focus:border-[#355CFF] outline-none px-2 py-0.5 rounded transition-all text-[#111827] font-semibold`}
      style={{ minWidth: type === "date" ? 140 : 80, width: "auto" }}
    />
  );
};

export default function AgreementContract({ data = {}, role = "admin", initialSignatures = {}, onSign, onUpdate }: AgreementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminSig, setAdminSig] = useState<string | null>(initialSignatures.admin || null);
  const [clientSig, setClientSig] = useState<string | null>(initialSignatures.client || null);
  const safeData = data || {};
  
  const [formData, setFormData] = useState({
    invoiceNumber: safeData.invoice_no || `GX-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    agreementDate: safeData.agreement_date || new Date().toLocaleDateString(),
    clientName: safeData.client_name || "",
    businessName: safeData.business_name || "",
    clientEmail: safeData.email || "",
    clientPhone: safeData.phone || "",
    clientAddress: safeData.address || "",
    gstNumber: safeData.gst_number || "",
    projectName: safeData.service_type || "Digital Transformation Project",
    projectDescription: safeData.project_description || "",
    totalValue: safeData.total_amount || "0",
    advanceAmount: safeData.advance_amount || "0",
    startDate: safeData.start_date || "",
    deliveryDate: safeData.delivery_date || "",
    selectedPlan: "Growth",
    plans: [
      { name: "Starter", cost: "₹10,000", maintenance: "₹3,500/mo", delivery: "7 Days" },
      { name: "Growth", cost: "₹20,000", maintenance: "₹6,500/mo", delivery: "14 Days" },
      { name: "Enterprise (Next.js)", cost: "₹40,000–60,000", maintenance: "₹10,000/mo", delivery: "21–30 Days" },
      { name: "Enterprise (Microservices)", cost: "₹1,00,000+", maintenance: "₹20,000+/mo", delivery: "60–90 Days" },
      { name: "Custom", cost: "Variable", maintenance: "Variable", delivery: "Variable" }
    ],
    customBuildCost: "",
    customMaintenance: "",
    customDelivery: "",
  });

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePlan = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newPlans = [...prev.plans];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return { ...prev, plans: newPlans };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 print:bg-white print:py-0 print:px-0" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      {/* Control Panel (Hidden on Print) */}
      <div className="max-w-[900px] mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2 text-neutral-500">
           <ShieldCheck className="text-[#355CFF] h-5 w-5" />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Agreement Management Console</span>
        </div>
        <div className="flex gap-3">
          {role === "admin" && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-wider ${
                  isEditing
                    ? 'bg-[#355CFF] text-white shadow-[0_0_15px_rgba(53,92,255,0.3)]'
                    : 'bg-white border border-neutral-200 text-[#111827] hover:bg-neutral-50 shadow-sm'
                }`}
              >
                {isEditing ? <><Eye size={13} /> Preview Mode</> : <><Pencil size={13} /> Edit Details</>}
              </button>
              
              {isEditing && (
                <button
                  onClick={async () => {
                    if (onUpdate) {
                      setIsSaving(true);
                      await onUpdate(formData);
                      setIsSaving(false);
                      setIsEditing(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#355CFF] text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-wider shadow-[0_0_15px_rgba(53,92,255,0.3)]"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Changes
                </button>
              )}
            </div>
          )}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-wider shadow-sm hover:bg-neutral-800"
          >
            <Printer size={13} /> Export / Print
          </button>
        </div>
      </div>

      {/* The Agreement Document */}
      <div data-admin-typography="preserve" className="max-w-[900px] mx-auto bg-white shadow-[0_10px_50px_rgba(0,0,0,0.03)] print:shadow-none min-h-[1100px] flex flex-col border border-neutral-100 print:border-none p-10 md:p-16 text-neutral-800 text-[13px] leading-[1.8] rounded-3xl">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-neutral-100 pb-8 mb-10">
           <div className="text-left">
              <h1 className="text-[26px] font-black text-neutral-900 tracking-tight m-0 leading-none">GrowX<span className="text-[#355CFF]">Labs</span>Tech</h1>
              <p className="text-[9px] text-neutral-400 mt-2 m-0 font-bold tracking-[0.2em] uppercase">AI-Native Digital Systems Engineering</p>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[10px] font-bold text-neutral-900 leading-none">hello@growxlabs.tech</p>
              <p className="text-[9px] font-medium text-neutral-400">growxlabs.tech</p>
           </div>
        </div>

        <div className="text-center mb-10">
           <div className="text-[18px] font-black text-neutral-900 mb-2 uppercase tracking-[4px]">CLIENT SERVICE AGREEMENT</div>
           <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider">This is a legally binding agreement between GrowXLabsTech and the Client.</div>
        </div>

        {/* 1. PARTY DETAILS */}
        <h2 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 my-6 uppercase font-bold tracking-[0.2em]">1. Party Details</h2>
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-4">
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Client Name</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1 font-bold">
                 <EditableText isEditing={isEditing} value={formData.clientName} onChange={(v) => update('clientName', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Business Name</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1 font-bold">
                 <EditableText isEditing={isEditing} value={formData.businessName} onChange={(v) => update('businessName', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.clientEmail} onChange={(v) => update('clientEmail', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.clientPhone} onChange={(v) => update('clientPhone', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Business Address</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.clientAddress} onChange={(v) => update('clientAddress', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">GST Number (if applicable)</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.gstNumber} onChange={(v) => update('gstNumber', v)} />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Agreement Date</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.agreementDate} onChange={(v) => update('agreementDate', v)} type="date" />
              </div>
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Project Start Date</label>
              <div className="border-b border-neutral-100 min-h-[22px] px-1">
                 <EditableText isEditing={isEditing} value={formData.startDate} onChange={(v) => update('startDate', v)} type="date" />
              </div>
           </div>
        </div>

        {/* 2. SELECTED PLAN */}
        <h2 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 my-8 uppercase font-bold tracking-[0.2em]">2. Selected Plan</h2>
        <div className="overflow-hidden border border-neutral-100 mb-8 rounded-2xl">
           <table className="w-full border-collapse">
              <thead>
                 <tr className="bg-neutral-900 text-white">
                    <th className="p-4 text-left text-[10px] font-bold border-r border-white/5 uppercase tracking-widest">Plan Name</th>
                    <th className="p-4 text-left text-[10px] font-bold border-r border-white/5 uppercase tracking-widest">Build Cost</th>
                    <th className="p-4 text-left text-[10px] font-bold border-r border-white/5 uppercase tracking-widest">Maintenance</th>
                    <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest">Delivery</th>
                 </tr>
              </thead>
              <tbody className="text-[12px] text-neutral-800">
                 {formData.plans.map((plan, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'} border-b border-neutral-100`}>
                       <td className="p-4 border-r border-neutral-100 flex items-center gap-3">
                          <input 
                             type="radio" 
                             name="plan"
                             checked={formData.selectedPlan === plan.name} 
                             onChange={() => isEditing && update('selectedPlan', plan.name)}
                             className="h-4 w-4 accent-[#355CFF] cursor-pointer"
                          />
                          <span className="text-[#000] font-bold">{plan.name}</span>
                       </td>
                       <td className="p-4 border-r border-[#eee] text-[#000] font-medium">
                          <EditableText isEditing={isEditing} value={plan.cost} onChange={(v) => updatePlan(idx, 'cost', v)} />
                       </td>
                       <td className="p-4 border-r border-[#eee] text-[#000] font-medium">
                          <EditableText isEditing={isEditing} value={plan.maintenance} onChange={(v) => updatePlan(idx, 'maintenance', v)} />
                       </td>
                       <td className="p-4 text-[#000] font-medium">
                          <EditableText isEditing={isEditing} value={plan.delivery} onChange={(v) => updatePlan(idx, 'delivery', v)} />
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* 3. SCOPE OF WORK */}
        <h2 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 my-8 uppercase font-bold tracking-[0.2em]">3. Scope of Work</h2>
        <p className="m-0 mb-4 font-semibold text-neutral-900 text-xs">GrowXLabsTech agrees to deliver the following for the selected plan:</p>
        <div className="border border-neutral-100 min-h-[100px] p-6 mb-6 bg-neutral-50/50 rounded-2xl">
           <EditableText isEditing={isEditing} value={formData.projectDescription} onChange={(v) => update('projectDescription', v)} multiline className="text-[12px] text-neutral-700 leading-relaxed" />
        </div>
        <p className="m-0 mb-8 text-neutral-500 text-xs"><strong>Out of Scope:</strong> Logo design, content writing, photography, domain purchase, third-party software licenses, or features not listed above.</p>

        {/* 4. PAYMENT TERMS */}
        <h2 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 my-6 uppercase font-bold tracking-[0.2em]">4. Payment Terms</h2>
        <div className="bg-blue-50/20 border-l-[3px] border-[#355CFF] p-6 rounded-r-2xl mb-6">
           <div className="space-y-2 text-xs">
              <p className="m-0 font-semibold text-neutral-800">50% advance required before project begins.</p>
              <p className="m-0 font-semibold text-neutral-800">50% balance due before final delivery / go-live.</p>
              <p className="m-0 font-semibold text-neutral-800">Monthly maintenance billed on the 1st of each month.</p>
           </div>
        </div>
        <p className="m-0 mb-2 text-neutral-600 font-medium text-xs">Payments via Bank Transfer / UPI / Razorpay. Invoice provided for all transactions.</p>
        <p className="m-0 mb-8 text-neutral-400 text-[10px] leading-relaxed uppercase tracking-wider">Late payments (beyond 7 days) attract 2% monthly interest. GrowXLabsTech reserves the right to suspend services on overdue accounts.</p>

        {/* 5-12 LEGAL SECTIONS GRID */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-10 border-t border-neutral-100 pt-8">
           {[
              { id: 5, title: "Revision Policy", content: "Starter: 2 revision rounds | Growth: 3 revision rounds | Enterprise: 5 revision rounds. Additional revisions billed at ₹500–₹2,000 per round." },
              { id: 6, title: "Client Responsibilities", content: "Client agrees to provide assets, content, and feedback within 48 hours of delivery milestones. Delays extend delivery timelines accordingly." },
              { id: 7, title: "Intellectual Property", content: "Upon full payment, the client owns the final website/application. GrowXLabsTech retains rights to display work in its portfolio." },
              { id: 8, title: "Maintenance & Support", content: "Monthly maintenance covers: hosting, security, and minor content changes (2hrs/mo). Major features quoted separately." },
              { id: 9, title: "Termination", content: "Either party may terminate with 30 days written notice. Work completed is billable. Advance payments are non-refundable." },
              { id: 10, title: "Confidentiality", content: "Both parties agree to keep project details, pricing, and business information confidential. No data shared with third parties." },
              { id: 11, title: "Limitation of Liability", content: "Liability limited to total paid. Not liable for indirect losses or third-party service failures (hosting, payment gateways, etc.)." },
              { id: 12, title: "Governing Law", content: "This agreement is governed by the laws of India. Any disputes shall be resolved in the courts of Andhra Pradesh." }
           ].map((item) => (
              <div key={item.id}>
                 <h4 className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest mb-1.5">{item.id}. {item.title}</h4>
                 <p className="m-0 text-[11px] text-neutral-500 leading-relaxed font-medium">{item.content}</p>
              </div>
           ))}
        </div>

        {/* SIGNATURES */}
        <div className="flex gap-10 mt-10 pt-6 border-t border-neutral-100">
           <div className="flex-1 border-t border-neutral-300 pt-4">
              <p className="text-[10px] font-bold text-neutral-900 mb-3 uppercase tracking-widest">Client Signature</p>
              <div className="min-h-[70px] flex items-center justify-center border border-dashed border-neutral-200 rounded-xl mb-3 bg-neutral-50/30">
                 <SignaturePad 
                   label="Client"
                   disabled={role !== "client"} 
                   initialSignature={clientSig}
                   onSign={(sig) => {
                     setClientSig(sig);
                     if (onSign) onSign("client", sig);
                   }}
                 />
              </div>
              <p className="text-[10px] text-neutral-500 m-0 font-medium tracking-wide">Name: {formData.clientName || "_______________________"}</p>
              <p className="text-[10px] text-neutral-500 m-0 font-medium tracking-wide">Date: {clientSig ? formData.agreementDate : "_______________________"}</p>
           </div>
           <div className="flex-1 border-t border-neutral-300 pt-4">
              <p className="text-[10px] font-bold text-neutral-900 mb-3 uppercase tracking-widest">GrowXLabsTech Representative</p>
              <div className="min-h-[70px] flex items-center justify-center border border-dashed border-neutral-200 rounded-xl mb-3 bg-neutral-50/30">
                 <SignaturePad 
                   label="GrowXLabsTech"
                   disabled={role !== "admin"} 
                   initialSignature={adminSig}
                   onSign={(sig) => {
                     setAdminSig(sig);
                     if (onSign) onSign("admin", sig);
                   }}
                 />
              </div>
              <p className="text-[10px] text-neutral-500 m-0 font-medium tracking-wide">Name: Varshith Pujala</p>
              <p className="text-[10px] text-neutral-500 m-0 font-medium tracking-wide">Date: {adminSig ? formData.agreementDate : "_______________________"}</p>
           </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-6 border-t border-neutral-100 text-center text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
           GrowX<span className="text-[#355CFF]">Labs</span>Tech | growxlabs.tech | hello@growxlabs.tech | © 2025 GrowXLabsTech. All rights reserved.
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1cm; size: A4; }
          .shadow-2xl { box-shadow: none !important; }
          .min-h-screen { min-height: auto !important; padding: 0 !important; }
          input, textarea { border: none !important; background: none !important; color: #111827 !important; font-weight: 600 !important; }
          .bg-[#355CFF] { background-color: #355CFF !important; }
          .text-[#355CFF] { color: #355CFF !important; }
          .bg-neutral-50 { background-color: #f9fafb !important; }
        }
      ` }} />
    </div>
  );
}
