"use client";

import React, { useState } from 'react';
import { Printer, ShieldCheck, Mail, CheckCircle2, Pencil, Eye, Plus, Trash2 } from 'lucide-react';

interface InvoiceProps {
  data?: {
    client_name?: string;
    business_name?: string;
    email?: string;
    amount?: number;
    description?: string;
    invoice_id?: string;
    address?: string;
  };
}

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
}

const EditField = ({ isEditing, value, onChange, placeholder, className, type = "text" }: {
  isEditing: boolean;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) => {
  if (!isEditing) {
    return <span className={`${className} text-neutral-900 font-semibold`}>{value || placeholder || "—"}</span>;
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} bg-neutral-50 border border-neutral-200 focus:border-[#355CFF] focus:ring-1 focus:ring-[#355CFF] outline-none px-2 py-0.5 rounded-lg text-neutral-900 font-semibold transition-all`}
      style={{ minWidth: type === "number" ? 60 : 80, color: "#171717" }}
    />
  );
};

export default function InvoiceTemplate({ data = {} }: InvoiceProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [items, setItems] = useState<LineItem[]>([
    { id: 1, desc: data.description || "Digital Services", qty: 1, rate: data.amount || 0 },
  ]);

  const [metadata, setMetadata] = useState({
    invoiceNo: data.invoice_id || `GX-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    clientName: data.client_name || "",
    businessName: data.business_name || "",
    clientEmail: data.email || "",
    clientAddress: data.address || "",
    advancePaid: 0
  });

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const totalPayable = subtotal;
  const balanceDue = totalPayable - metadata.advancePaid;

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: field === 'desc' ? value : Number(value) || 0 } : item
    ));
  };

  const addItem = () => {
    const maxId = Math.max(...items.map(i => i.id), 0);
    setItems(prev => [...prev, { id: maxId + 1, desc: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateMeta = (field: string, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4 print:bg-white print:py-0 print:px-0" style={{ fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      {/* TOOLBAR */}
      <div className="max-w-[900px] mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2.5 text-[#666]">
           <ShieldCheck className="text-[#355CFF] h-5 w-5" />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none text-neutral-500">Invoice Management Console</span>
        </div>
        <div className="flex gap-3">
           <button
             onClick={() => setIsEditing(!isEditing)}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 text-xs ${
               isEditing
                 ? 'bg-[#355CFF] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600'
                 : 'bg-white border border-neutral-200 text-[#222] hover:bg-neutral-50'
             }`}
           >
             {isEditing ? <><Eye size={14} /> Preview</> : <><Pencil size={14} /> Edit Invoice</>}
           </button>
           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 hover:bg-neutral-800 text-xs"
           >
             <Printer size={14} /> Export / Print
           </button>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div data-admin-typography="preserve" className="max-w-[900px] mx-auto bg-white shadow-2xl print:shadow-none min-h-[1100px] flex flex-col border border-neutral-100 print:border-none p-10 md:p-16 rounded-3xl text-neutral-800 text-[13px] leading-[1.7]">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-neutral-100 pb-8 mb-12">
           <div className="text-left">
              <h1 className="text-[28px] font-black text-neutral-900 tracking-tight m-0 leading-none">GrowX<span className="text-[#355CFF]">Labs</span><span className="text-neutral-400 font-medium">Tech</span></h1>
              <p className="text-[10px] text-neutral-400 mt-2.5 m-0 font-bold tracking-[0.15em] uppercase">AI-Native Digital Systems Engineering</p>
           </div>
           <div className="text-right space-y-1 text-xs">
              <p className="text-[11px] font-bold text-neutral-800">billing@growxlabs.tech</p>
              <p className="text-[11px] font-semibold text-neutral-400">growxlabs.tech</p>
           </div>
        </div>

        <div className="mb-12">
           <div className="text-[20px] font-bold text-neutral-900 mb-1 uppercase tracking-[0.25em]">Tax Invoice</div>
           <div className="text-[11px] text-neutral-500 font-semibold uppercase tracking-[0.1em]">Reference # {metadata.invoiceNo}</div>
        </div>

        {/* ADDRESS MATRIX */}
        <div className="grid grid-cols-2 gap-x-20 mb-12">
           <div className="space-y-4">
              <h3 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 uppercase font-bold tracking-[0.2em] m-0">Billed From</h3>
              <div className="space-y-1.5 text-neutral-800 font-semibold text-xs">
                 <p className="text-[14px] text-neutral-900 font-bold">GrowXLabsTech Engineering</p>
                 <p>Guntur, Andhra Pradesh, India</p>
                 <p>Email: billing@growxlabs.tech</p>
                 <p className="text-[10px] text-neutral-400 mt-2 font-normal uppercase tracking-widest">UDYAM: UDYAM-AP-22-0063260</p>
              </div>
           </div>
           <div className="space-y-4">
              <h3 className="text-[11px] text-neutral-900 border-l-[3px] border-[#355CFF] pl-3 uppercase font-bold tracking-[0.2em] m-0">Billed To</h3>
              <div className="space-y-1.5 text-neutral-800 font-semibold text-xs">
                 <p className="text-[14px] text-neutral-900 font-bold">
                    <EditField isEditing={isEditing} value={metadata.businessName} onChange={(v) => updateMeta('businessName', v)} placeholder="Business Name" />
                 </p>
                 <p>
                    <EditField isEditing={isEditing} value={metadata.clientName} onChange={(v) => updateMeta('clientName', v)} placeholder="Contact Name" />
                 </p>
                 <p>
                    <EditField isEditing={isEditing} value={metadata.clientAddress} onChange={(v) => updateMeta('clientAddress', v)} placeholder="Address" />
                 </p>
                 <p className="text-[#355CFF]">
                    <EditField isEditing={isEditing} value={metadata.clientEmail} onChange={(v) => updateMeta('clientEmail', v)} placeholder="Email" />
                 </p>
              </div>
           </div>
        </div>

        {/* INVOICE DETAILS */}
        <div className="grid grid-cols-2 gap-10 bg-neutral-50/50 p-6 mb-12 border border-neutral-100 rounded-2xl">
           <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold m-0 tracking-[0.15em]">Invoice Date</p>
              <p className="text-[13px] font-bold text-neutral-900 m-0">{metadata.date}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-red-500/90 uppercase font-bold m-0 tracking-[0.15em]">Due Date</p>
              <p className="text-[13px] font-bold text-neutral-900 m-0">{metadata.dueDate}</p>
           </div>
        </div>

        {/* LINE ITEMS */}
        <div className="mb-12">
           <table className="w-full border-collapse border border-neutral-200/60 rounded-2xl overflow-hidden">
              <thead>
                 <tr className="bg-neutral-900 text-white">
                    <th className="py-4 px-4 text-left text-[10px] font-bold border-r border-neutral-800 w-12 uppercase tracking-wider leading-normal">No</th>
                    <th className="py-4 px-4 text-left text-[10px] font-bold border-r border-neutral-800 uppercase tracking-wider leading-normal">Description</th>
                    <th className="py-4 px-4 text-center text-[10px] font-bold border-r border-neutral-800 w-20 uppercase tracking-wider leading-normal">Qty</th>
                    <th className="py-4 px-4 text-right text-[10px] font-bold border-r border-neutral-800 w-32 uppercase tracking-wider leading-normal">Rate (₹)</th>
                    <th className="py-4 px-4 text-right text-[10px] font-bold w-32 uppercase tracking-wider leading-normal">Total (₹)</th>
                 </tr>
              </thead>
              <tbody className="text-xs text-neutral-800 font-semibold">
                 {items.map((item, i) => (
                    <tr key={item.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'} border-b border-neutral-100`}>
                       <td className="p-4 border-r border-neutral-100 text-neutral-400 text-center leading-normal">0{i+1}</td>
                       <td className="p-4 border-r border-neutral-100 leading-normal">
                          <input 
                            value={item.desc}
                            onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                            placeholder="Service description..."
                            className={`bg-transparent w-full focus:outline-none font-semibold text-neutral-800 text-xs py-1 ${isEditing ? 'bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-0.5' : ''}`}
                            readOnly={!isEditing}
                          />
                       </td>
                       <td className="p-4 border-r border-neutral-100 text-center leading-normal">
                          <input 
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                            className={`bg-transparent w-full text-center focus:outline-none font-semibold text-neutral-800 text-xs py-1 ${isEditing ? 'bg-neutral-50 border border-neutral-200 rounded-lg py-0.5' : ''}`}
                            readOnly={!isEditing}
                          />
                       </td>
                       <td className="p-4 border-r border-neutral-100 text-right leading-normal">
                          <input 
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                            className={`bg-transparent w-full text-right focus:outline-none font-semibold text-neutral-800 text-xs py-1 ${isEditing ? 'bg-neutral-50 border border-neutral-200 rounded-lg py-0.5' : ''}`}
                            readOnly={!isEditing}
                          />
                       </td>
                       <td className="p-4 text-right font-bold text-neutral-900 text-xs leading-normal">{(item.qty * item.rate).toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {isEditing && (
             <button onClick={addItem} className="mt-4 flex items-center gap-1.5 text-[#355CFF] text-[10px] font-bold uppercase tracking-widest print:hidden hover:text-blue-700">
               <Plus size={14} /> Add Line Item
             </button>
           )}
        </div>

        {/* SUMMARY */}
        <div className="flex justify-end mb-12">
           <div className="w-80 space-y-3.5 bg-neutral-50/30 p-6 rounded-2xl border border-neutral-100">
              <div className="flex justify-between text-xs text-neutral-500 font-semibold">
                 <span>Subtotal</span>
                 <span className="text-neutral-900 font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400 font-semibold">
                 <span>Tax (0% GST)</span>
                 <span>+ ₹0.00</span>
              </div>
              <div className="flex justify-between text-xs border-b border-neutral-100 pb-3.5 text-neutral-500 font-semibold">
                 <span>Advance Paid</span>
                 <span className="text-red-500/90 font-bold">
                    - ₹{isEditing ? (
                      <input
                        type="number"
                        value={metadata.advancePaid}
                        onChange={(e) => updateMeta('advancePaid', Number(e.target.value) || 0)}
                        className="bg-neutral-50/80 border border-neutral-200 text-right w-24 outline-none rounded-lg font-semibold px-2 py-0.5"
                      />
                    ) : metadata.advancePaid.toLocaleString()}
                 </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2.5 text-neutral-900 border-t border-neutral-100 mt-2">
                 <span>Balance Due</span>
                 <span className="underline decoration-[#355CFF] decoration-2 underline-offset-4">₹{balanceDue.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* NOTES & SIGNATURE */}
        <div className="grid grid-cols-2 gap-20 mt-auto pt-10 border-t border-neutral-100">
           <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 m-0">Payment Protocol</h5>
              <div className="text-[11px] text-neutral-500 leading-relaxed font-semibold italic space-y-1 mt-2">
                 <p>Bank Transfer: HDFC Bank | growxlabs@hdfc</p>
                 <p>UPI: growxlabs@ybl</p>
                 <p>Note: Digital receipt is issued instantly upon confirmation.</p>
              </div>
           </div>
           <div className="text-right flex flex-col items-end">
              <div className="w-56 border-b border-neutral-200 mb-2 flex items-center justify-center">
                 {/* Space for stamp/signature */}
                 <div className="h-16 flex items-center justify-center text-[10px] text-neutral-300 font-bold uppercase tracking-[4px]">Verified</div>
              </div>
              <p className="text-[10px] font-bold text-neutral-900 uppercase m-0 tracking-widest">Authorized Signatory</p>
              <p className="text-[9px] text-neutral-400 font-bold m-0 tracking-widest uppercase mt-1">GrowXLabsTech Engineering</p>
           </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-neutral-100 text-center text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
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
