import { createClient } from "@/lib/supabase/server";
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  IndianRupee, 
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RevenueTracking() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "paid");

  const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.final_amount || 0), 0) || 0;
  const courseRevenue = orders?.filter(o => o.product_type === 'course').reduce((acc, curr) => acc + (curr.final_amount || 0), 0) || 0;
  const subRevenue = totalRevenue - courseRevenue;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Intelligence</h1>
          <p className="text-white/40 font-medium">Granular analysis of platform-wide financial growth.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">Real-time Sync</span>
        </div>
      </div>

      {/* High Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-all duration-700">
               <TrendingUp size={80} className="text-white" />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="p-3 bg-white/5 rounded-xl w-fit">
                  <IndianRupee className="text-white/80" size={24} />
               </div>
               <div>
                  <p className="admin-kpi-label text-white/40 text-sm font-medium mb-1">Gross Yield</p>
                  <h3 className="admin-kpi-value text-white">₹{totalRevenue.toLocaleString()}</h3>
               </div>
            </div>
         </div>

         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl flex flex-col justify-between">
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="admin-kpi-label text-white/40 text-sm font-medium">Academy Sales</p>
                      <h4 className="admin-kpi-value text-white">₹{courseRevenue.toLocaleString()}</h4>
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl">
                      <Layers className="text-white/60" size={18} />
                   </div>
                </div>
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="admin-kpi-label text-white/40 text-sm font-medium">Subscription ARR</p>
                      <h4 className="admin-kpi-value text-white">₹{subRevenue.toLocaleString()}</h4>
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl">
                      <ArrowUpRight className="text-white/60" size={18} />
                   </div>
                </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full mt-8 overflow-hidden">
                <div 
                   className="h-full bg-white/40 rounded-full" 
                   style={{ width: `${(courseRevenue/totalRevenue) * 100 || 0}%` }} 
                />
            </div>
         </div>

         <div className="bg-white border border-white p-8 rounded-2xl flex flex-col justify-center gap-4 group hover:translate-y-[-4px] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer">
            <h3 className="text-2xl font-bold text-black tracking-tight leading-tight">Optimize <br/> Monetization</h3>
            <p className="text-black/60 text-sm font-medium leading-relaxed">Analyze drop-off rates and adjust discount corridors for maximum terminal yield.</p>
            <ArrowRight className="text-black ml-auto mt-2 transition-transform group-hover:translate-x-2" size={20} />
         </div>
      </div>

      {/* Analytics Projection Placeholder */}
      <div className="bg-white/[0.02] border border-white/5 p-12 rounded-2xl h-[300px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="text-white/10 mb-6" size={48} />
          <h4 className="text-white font-semibold tracking-tight text-lg mb-1">Revenue Projection Engine</h4>
          <p className="text-white/40 text-sm max-w-md">Data modeling in progress. Trends will be visualized once order volume reaches threshold.</p>
      </div>
    </div>
  );
}
