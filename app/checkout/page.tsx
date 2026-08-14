"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, 
  CreditCard, 
  ShoppingBag, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Tag,
  MapPin,
  Contact
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Script from "next/script";
import { toast } from "sonner";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const productId = searchParams.get("productId");
  const productType = searchParams.get("type"); // course | subscription
  const initialPrice = parseInt(searchParams.get("price") || "0");
  const title = searchParams.get("title") || "Product Purchase";

  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ discount: number, finalAmount: number } | null>(null);
  
  const [billing, setBilling] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    area: "",
    city: "",
    pincode: ""
  });

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      const userEmail = session.user.email;
      setBilling(prev => ({ ...prev, email: userEmail || "" }));
    }
  }, [session]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        body: JSON.stringify({ code: couponCode, amount: initialPrice })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setDiscountInfo(data);
      toast.success("Coupon Applied Successfully!");
    } catch (err: any) {
      toast.error(err.message);
      setDiscountInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    if (!billing.phone || !billing.address || !billing.pincode) {
       toast.error("Please complete all billing fields.");
       return;
    }

    setIsLoading(true);

    try {
      // 1. Create Order
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        body: JSON.stringify({
          productId,
          productType,
          amount: initialPrice,
          couponCode: discountInfo ? couponCode : null,
          billingDetails: billing
        })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "GrowxLabs Tech",
        description: `Purchase of ${title}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
           // 3. Verify Payment
           setIsLoading(true);
           const verifyRes = await fetch("/api/courses/verify", { // Unified verify can re-use this or use NEW
              method: "POST",
              body: JSON.stringify({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
              })
           });
           
           const verifyData = await verifyRes.json();
           if (verifyData.success) {
              toast.success("Payment successful! Unlocking your access...");
              router.push("/dashboard");
           } else {
              toast.error("Payment verification failed.");
           }
        },
        prefill: {
          name: billing.full_name,
          email: billing.email,
          contact: billing.phone
        },
        theme: { color: "#00A86B" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!productId) return <div className="min-h-screen bg-black flex items-center justify-center text-white/40">Invalid Checkout Request</div>;

  return (
    <div className="min-h-screen bg-black pt-32 pb-32 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left: Billing Form */}
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
               <h1 className="text-5xl font-black text-white tracking-tighter italic">Checkout.</h1>
               <p className="text-[#C0F0FB] font-mono tracking-wider uppercase text-[10px]">Step 1 // Secure Billing Configuration</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10">
              <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Full Legal Name</label>
                    <input 
                      required
                      value={billing.full_name}
                      onChange={e => setBilling({...billing, full_name: e.target.value})}
                      type="text" placeholder="John Doe" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input 
                      required readOnly
                      value={billing.email}
                      type="email" placeholder="john@example.com" 
                      className="w-full bg-[#161616] border border-white/5 rounded-xl py-3.5 px-5 text-white/45 outline-none cursor-not-allowed" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Phone Number</label>
                    <input 
                      required
                      value={billing.phone}
                      onChange={e => setBilling({...billing, phone: e.target.value})}
                      type="tel" placeholder="+91 0000000000" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Full Address</label>
                    <input 
                      required
                      value={billing.address}
                      onChange={e => setBilling({...billing, address: e.target.value})}
                      type="text" placeholder="Door No, Street Name" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Village / Area</label>
                    <input 
                      required
                      value={billing.area}
                      onChange={e => setBilling({...billing, area: e.target.value})}
                      type="text" placeholder="Gachibowli" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">City</label>
                    <input 
                      required
                      value={billing.city}
                      onChange={e => setBilling({...billing, city: e.target.value})}
                      type="text" placeholder="Hyderabad" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Pincode</label>
                    <input 
                      required
                      value={billing.pincode}
                      onChange={e => setBilling({...billing, pincode: e.target.value})}
                      type="text" placeholder="500032" 
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#C0F0FB] focus:ring-1 focus:ring-[#C0F0FB] transition-all" />
                 </div>

                 <div className="md:col-span-2 pt-6">
                   <Button disabled={isLoading} type="submit" size="lg" className="h-14 w-full rounded-xl bg-[#C0F0FB] text-black font-bold hover:bg-[#C0F0FB]/90 transition-all shadow-lg shadow-[#C0F0FB]/5">
                      {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                      PROCEED TO PAYMENT
                   </Button>
                 </div>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[400px] space-y-8">
             <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                   <ShoppingBag size={120} />
                </div>

                <div className="space-y-6 relative z-10">
                   <h3 className="text-xl font-bold text-white tracking-tight italic">Order Summary.</h3>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                         <div>
                            <p className="text-white font-semibold text-sm leading-tight">{title}</p>
                            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">Product Type: {productType}</p>
                         </div>
                         <p className="text-white font-black">₹{initialPrice}</p>
                      </div>
                      
                      <div className="h-[1px] bg-white/5 w-full" />
                      
                      <div className="space-y-4 pt-2">
                          <div className="flex items-center gap-2">
                             <Tag className="text-[#C0F0FB]" size={14} />
                             <input 
                               value={couponCode}
                               onChange={e => setCouponCode(e.target.value.toUpperCase())}
                               type="text" placeholder="COUPON CODE" 
                               className="bg-transparent border-b border-white/10 flex-1 text-[10px] font-black tracking-widest text-white outline-none focus:border-[#C0F0FB] uppercase py-1" />
                             <Button onClick={handleApplyCoupon} variant="ghost" className="h-8 text-[9px] font-black text-[#C0F0FB] p-0 hover:bg-transparent">APPLY</Button>
                          </div>
                      </div>

                       <div className="space-y-3 pt-6">
                          <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase tracking-widest">
                             <span>Subtotal</span>
                             <span>₹{initialPrice}</span>
                          </div>
                          {discountInfo && (
                             <div className="flex justify-between items-center text-xs font-bold text-[#C0F0FB] uppercase tracking-widest">
                                <span>Discount Applied</span>
                                <span>-₹{discountInfo.discount}</span>
                             </div>
                          )}
                          <div className="flex justify-between items-center pt-4 border-t border-white/10">
                             <span className="text-lg font-black text-white italic tracking-tighter">Total.</span>
                             <span className="text-2xl font-black text-[#C0F0FB] italic">₹{discountInfo ? discountInfo.finalAmount : initialPrice}</span>
                          </div>
                       </div>
                   </div>
                </div>

                 <div className="bg-[#C0F0FB]/5 border-[#C0F0FB]/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-4">
                       <ShieldCheck className="text-[#C0F0FB] shrink-0" size={24} />
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                          Verified secure transaction. Granting immediate activation of <span className="text-white">{title}</span>.
                       </p>
                    </div>
                 </div>
             </div>

             <div className="px-8 space-y-4">
                <div className="flex items-center gap-3 opacity-20">
                   <CheckCircle2 size={14} className="text-white" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white">Refundable within 24 hours</span>
                </div>
                <div className="flex items-center gap-3 opacity-20">
                   <CheckCircle2 size={14} className="text-white" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white">Production ready certification</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
