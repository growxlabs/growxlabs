export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  ShoppingBag, 
  Search, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Receipt
} from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";

export default async function OrderManagement() {
  const supabase = supabaseAdmin;
  const { data: orders } = await supabase
    .from("orders")
    .select("*, coupons(code)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Transaction Ledger</h1>
          <p className="text-white/40 font-medium">Audit and reconcile global monetization activity.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-white/10 text-white/80 hover:text-white hover:bg-white/5 px-6 py-2 h-11 font-medium rounded-md flex items-center gap-2">
              <Receipt size={16} /> Export CSV
           </Button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-4">
         {[
           { label: "Total Volume", value: orders?.length || 0 },
           { label: "Gross Revenue", value: `₹${orders?.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.final_amount, 0).toLocaleString()}` },
           { label: "Failed Initiations", value: orders?.filter(o => o.status === 'failed').length || 0 }
         ].map((chip, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl flex items-center gap-3">
             <span className="text-white/40 text-sm font-medium">{chip.label}</span>
             <span className="text-white font-bold tracking-tight">{chip.value}</span>
          </div>
         ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1 relative">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
               <input 
                 type="text" 
                 placeholder="Search by Razorpay Order ID or Product..." 
                 className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-white/20 outline-none transition-all"
               />
            </div>
            <button className="p-2.5 bg-white/5 rounded-lg text-white/60 hover:text-white transition-all">
               <Filter size={16} />
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-white/40 tracking-wider uppercase bg-white/[0.01]">
                     <th className="px-6 py-4">Order Identity</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Incentive</th>
                     <th className="px-6 py-4 text-right">Activity</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {orders?.map((order) => (
                     <tr key={order.id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4">
                           <div className="min-w-0">
                              <p className="text-white font-medium text-sm line-clamp-1">{order.razorpay_order_id}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-xs text-white/40 truncate">{order.product_type}: {order.product_id}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-2">
                              {order.status === 'paid' && <CheckCircle2 className="text-green-500" size={14} />}
                              {order.status === 'pending' && <Clock className="text-orange-500" size={14} />}
                              {order.status === 'failed' && <XCircle className="text-red-500" size={14} />}
                              <span className={cn(
                                 "text-xs font-medium capitalize",
                                 order.status === 'paid' ? "text-green-500" : order.status === 'pending' ? "text-orange-500" : "text-red-500"
                              )}>
                                 {order.status}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                           ₹{order.final_amount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={cn(
                              "text-xs font-medium px-2.5 py-1 rounded-md border",
                              order.coupons?.code ? "text-white/80 border-white/10 bg-white/10" : "text-white/40 border-white/5 bg-white/5"
                           )}>
                              {order.coupons?.code || 'None'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <p className="text-xs text-white/60">
                              {new Date(order.created_at).toLocaleDateString()}
                           </p>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {!orders?.length && (
               <div className="py-16 flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 text-white/20" size={24} />
                  <p className="text-sm text-white/40">The ledger is currently empty.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
