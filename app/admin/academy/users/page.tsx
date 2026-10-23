import { createClient } from "@/lib/supabase/server";
import { 
  GraduationCap, 
  Search, 
  BarChart3, 
  History, 
  UserCheck, 
  MoreVertical,
  Mail,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function StudentManagement() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("clients") // Students are in 'clients' table
    .select("*, enrollments(count), test_attempts(score)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Registry</h1>
          <p className="text-white/40 font-medium">Monitor global talent and track mastery progression.</p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)] px-6 py-2 h-11 font-medium rounded-md flex items-center gap-2">
          <Mail size={16} />
          Broadcast Announcement
        </Button>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Enrolled Students", value: students?.length || 0, icon: GraduationCap, color: "text-white" },
           { label: "Active Mastery", value: students?.filter(s => (s as any).enrollments?.[0]?.count > 0).length || 0, icon: UserCheck, color: "text-white/60" },
           { label: "Exam Velocity", value: "High", icon: Zap, color: "text-white/60" }
         ].map((stat, i) => (
           <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
              <div>
                 <p className="admin-kpi-label text-white/40 text-sm font-medium mb-1">{stat.label}</p>
                 <h3 className="admin-kpi-value text-white">{stat.value}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-white/40">
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>

      {/* Student Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1 relative">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
               <input 
                 type="text" 
                 placeholder="Search by student identity or email..." 
                 className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-white/20 outline-none transition-all"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-white/40 tracking-wider uppercase bg-white/[0.01]">
                     <th className="px-6 py-4">Student Identity</th>
                     <th className="px-6 py-4">Enrollments</th>
                     <th className="px-6 py-4">Avg Score</th>
                     <th className="px-6 py-4">Last Active</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {students?.map((student) => {
                     const avgScore = (student as any).test_attempts?.length 
                        ? Math.round((student as any).test_attempts.reduce((acc: any, curr: any) => acc + curr.score, 0) / (student as any).test_attempts.length) 
                        : '--';
                     
                     return (
                        <tr key={student.id} className="group hover:bg-white/[0.02] transition-all">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-white/80 shrink-0">
                                    {student.name?.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{student.name}</p>
                                    <p className="text-xs text-white/40 truncate">{student.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                 <History size={14} className="text-white/40" />
                                 <span className="text-xs font-medium text-white/80">{(student as any).enrollments?.[0]?.count || 0} Tracks</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                 "text-xs font-medium px-2.5 py-1 rounded-md border",
                                 avgScore === '--' ? "text-white/40 border-white/5 bg-white/5" : "text-white/80 border-white/10 bg-white/10"
                              )}>
                                 {avgScore}{avgScore !== '--' ? '%' : ''}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs text-white/60">
                                 {new Date(student.created_at).toLocaleDateString()}
                              </p>
                           </td>
                           <td className="px-6 py-4 text-right whitespace-nowrap">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                                 <MoreVertical size={16} />
                              </Button>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
