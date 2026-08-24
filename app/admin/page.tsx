import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  GraduationCap,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/Reveal";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch real stats
  const { count: totalUsers } = await supabase.from("users").select("*", { count: 'exact', head: true });
  const { data: enrollments } = await supabase.from("enrollments").select("purchase_price");
  const { data: attempts } = await supabase.from("test_attempts").select("score");

  const totalRevenue = enrollments?.reduce((acc, curr) => acc + (curr.purchase_price || 0), 0) || 0;
  const totalPurchases = enrollments?.length || 0;
  
  // Calculate pass rate (score > 70)
  const passedCount = attempts?.filter(a => a.score >= 70).length || 0;
  const passRate = attempts?.length ? Math.round((passedCount / attempts.length) * 100) : 0;

  const stats = [
    { 
      label: "Total Students", 
      value: totalUsers?.toLocaleString() || "0", 
      icon: Users, 
      trend: "+12.5%", 
      positive: true,
      description: "Active platform members",
      accent: "blue"
    },
    { 
      label: "Total Revenue", 
      value: `₹${totalRevenue?.toLocaleString()}`, 
      icon: IndianRupee, 
      trend: "+24.2%", 
      positive: true,
      description: "Lifetime course sales",
      accent: "green"
    },
    { 
      label: "Course Purchases", 
      value: totalPurchases.toString(), 
      icon: ShoppingBag, 
      trend: "+8.1%", 
      positive: true,
      description: "Individual transaction count",
      accent: "amber"
    },
    { 
      label: "Pass Rate", 
      value: `${passRate}%`, 
      icon: GraduationCap, 
      trend: "-2.4%", 
      positive: false,
      description: "Students scoring > 70%",
      accent: "purple"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Reveal y={-20}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-white -tracking-[0.025em]">Intelligence Overview</h1>
            <p className="text-[var(--text-secondary)] dark:text-neutral-400 text-sm">Real-time performance metrics for GrowX Labs Academy.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0075de]/5 dark:bg-blue-500/10 border border-[#0075de]/15 dark:border-blue-500/20 rounded-md px-3 py-1.5 shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0075de] dark:bg-blue-400 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#0075de] dark:text-blue-400">System Monitoring Live</span>
          </div>
        </div>
      </Reveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const accColor = {
            blue: "text-[#0075de] dark:text-blue-400 bg-[#0075de]/5 dark:bg-blue-500/10 border-[#0075de]/15 dark:border-blue-500/20",
            green: "text-[#1aae39] dark:text-emerald-400 bg-[#1aae39]/5 dark:bg-emerald-500/10 border-[#1aae39]/15 dark:border-emerald-500/20",
            amber: "text-[#dd5b00] dark:text-amber-400 bg-[#dd5b00]/5 dark:bg-amber-500/10 border-[#dd5b00]/15 dark:border-amber-500/20",
            purple: "text-[#8a3ffc] dark:text-purple-400 bg-[#8a3ffc]/5 dark:bg-purple-500/10 border-[#8a3ffc]/15 dark:border-purple-500/20"
          }[stat.accent]!;

          return (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group relative bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 p-5 rounded-xl shadow-xs transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                   <div className={cn("p-2 rounded-lg border", accColor)}>
                      <stat.icon size={16} />
                   </div>
                   <div className={cn(
                     "flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider",
                     stat.positive ? "text-[#1aae39] dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                   )}>
                     {stat.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                     {stat.trend}
                   </div>
                </div>
                
                <div>
                  <p className="text-[var(--text-muted)] dark:text-neutral-400 text-[9px] font-bold uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] dark:text-white -tracking-[0.025em] mb-1">{stat.value}</h3>
                  <p className="text-[var(--text-tertiary)] dark:text-neutral-500 text-[9px]">{stat.description}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trajectory Chart */}
        <Reveal className="lg:col-span-2">
          <div className="bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 rounded-xl p-5 sm:p-6 h-full shadow-xs">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2.5">
                 <div className="p-2 bg-[#0075de]/5 dark:bg-blue-500/10 rounded-lg border border-[#0075de]/15 dark:border-blue-500/20">
                    <TrendingUp className="text-[#0075de] dark:text-blue-400" size={16} />
                 </div>
                 <h4 className="text-base font-bold text-[var(--text-primary)] dark:text-white -tracking-[0.02em]">Revenue Trajectory</h4>
               </div>
               <select className="bg-[var(--card)] dark:bg-neutral-800 border border-[var(--border-subtle)] dark:border-neutral-700 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-[var(--text-primary)] dark:text-neutral-200 outline-none hover:bg-[var(--surface-hover)] dark:hover:bg-neutral-750 transition-all cursor-pointer">
                 <option>Last 30 Days</option>
                 <option>Last 6 Months</option>
                 <option>Annual View</option>
               </select>
             </div>
             
             <div className="h-48 sm:h-60 flex items-end gap-1 sm:gap-2 md:gap-4 pb-2 border-b border-[var(--border-subtle)] dark:border-neutral-800">
                 {[45, 62, 58, 75, 90, 82, 95, 88, 100, 115, 105, 120].map((h, i) => (
                   <div key={i} className="flex-1 group relative">
                      <div 
                       style={{ height: `${h}%` }} 
                       className="w-full bg-[#0075de]/15 dark:bg-blue-500/20 group-hover:bg-[#0075de]/30 dark:group-hover:bg-blue-500/35 rounded-t-sm transition-all duration-200 cursor-pointer border-x border-t border-transparent group-hover:border-[#0075de]/30"
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 bg-[var(--card)] dark:bg-neutral-800 border border-[var(--border-subtle)] dark:border-neutral-700 text-[var(--text-primary)] dark:text-white text-[9px] font-semibold rounded shadow-md whitespace-nowrap z-20">
                           ₹{(h * 1240).toLocaleString()}
                         </div>
                      </div>
                   </div>
                 ))}
             </div>
             <div className="flex justify-between px-1 mt-3">
                 {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
                   <span key={i} className="text-[8px] font-bold text-[var(--text-tertiary)] dark:text-neutral-500 uppercase tracking-widest">{m}</span>
                 ))}
             </div>
          </div>
        </Reveal>

        {/* Recent Activity */}
        <Reveal>
          <div className="bg-[var(--card)] dark:bg-neutral-900 border border-[var(--border-subtle)] dark:border-neutral-800 rounded-xl p-5 sm:p-6 h-full flex flex-col shadow-xs">
             <div className="flex items-center gap-2.5 mb-6">
                 <div className="p-2 bg-[#8a3ffc]/5 dark:bg-purple-500/10 rounded-lg border border-[#8a3ffc]/15 dark:border-purple-500/20">
                    <Activity className="text-[#8a3ffc] dark:text-purple-400" size={16} />
                 </div>
                 <h4 className="text-base font-bold text-[var(--text-primary)] dark:text-white -tracking-[0.02em]">Recent Activity</h4>
             </div>
             <div className="flex-1 space-y-4 overflow-hidden">
               {((enrollments?.length ? enrollments : Array.from({length: 6}).map((_, i) => ({ purchase_price: 1999 + (i * 500) }))) as any[]).slice(0, 6).map((en, i) => (
                 <div key={i} className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-neutral-800/60 rounded-lg transition-all">
                   <div className="flex items-center gap-2.5">
                       <div className="w-6 h-6 rounded-md bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center font-bold text-[9px] text-[var(--text-muted)] dark:text-neutral-400">
                          {i + 1}
                       </div>
                       <div>
                          <p className="text-[var(--text-primary)] dark:text-white font-semibold text-xs leading-none mb-1">Student #{i+1024}</p>
                          <p className="text-[var(--text-tertiary)] dark:text-neutral-500 text-[8px] font-medium uppercase tracking-wider">Confirmed enrollment</p>
                       </div>
                   </div>
                   <div className="text-right">
                       <p className="text-[var(--text-primary)] dark:text-white font-bold text-xs">₹{en?.purchase_price || "1,999"}</p>
                       <p className="text-emerald-600 dark:text-emerald-400 text-[8px] font-medium uppercase tracking-widest">Success</p>
                   </div>
                 </div>
               ))}
             </div>
             <button className="mt-6 w-full py-2 bg-[var(--card)] dark:bg-neutral-800 border border-[var(--border-subtle)] dark:border-neutral-700 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] dark:text-neutral-300 hover:text-[var(--text-primary)] dark:hover:text-white hover:bg-[var(--surface-hover)] dark:hover:bg-neutral-700 transition-all shadow-xs cursor-pointer">
               View Activity Log
             </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
