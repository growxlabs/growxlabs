import { createClient } from "@/lib/supabase/server";
import { 
  Plus, 
  Search, 
  PenTool, 
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Code
} from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";

export default async function AssessmentManagement() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id, title");
  const { data: questions } = await supabase
    .from("questions")
    .select("*, courses(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Assessment Matrix</h1>
          <p className="text-white/40 font-medium">Engineer rigorous certification exams for your students.</p>
        </div>
        <Link href="/admin/academy/assessments/new">
          <Button className="bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)] px-6 py-2 h-11 font-medium rounded-md flex items-center gap-2">
            <Plus size={18} />
            Add New Question
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Questions", value: questions?.length || 0, icon: PenTool, color: "text-white" },
           { label: "Code-Based Challenges", value: questions?.filter(q => q.type === 'code').length || 0, icon: Code, color: "text-white/60" },
           { label: "Validated Banks", value: courses?.length || 0, icon: CheckCircle2, color: "text-white/60" }
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

      {/* Questions Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1 relative">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
               <input 
                 type="text" 
                 placeholder="Filter by question content..." 
                 className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-white/20 outline-none transition-all"
               />
            </div>
            <select className="w-full sm:w-auto bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-medium text-white/80 outline-none">
               <option>All Courses</option>
               {courses?.map(c => <option key={c.id}>{c.title}</option>)}
            </select>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-white/40 tracking-wider uppercase bg-white/[0.01]">
                     <th className="px-6 py-4">Course</th>
                     <th className="px-6 py-4">Question Preview</th>
                     <th className="px-6 py-4">Difficulty</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {questions?.map((q) => (
                     <tr key={q.id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-xs font-medium text-white/80 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                              {q.courses?.title || 'Unknown'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="space-y-1 max-w-md">
                              <p className="text-white font-medium text-sm line-clamp-1">{q.question_text}</p>
                              <div className="flex gap-2 items-center">
                                 {q.type === 'code' && <Code size={12} className="text-white/40" />}
                                 <span className="text-xs text-white/40 font-medium">{q.type}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                 "w-2 h-2 rounded-full",
                                 q.difficulty === 'hard' ? "bg-red-500" : q.difficulty === 'medium' ? "bg-orange-500" : "bg-green-500"
                              )} />
                              <span className="text-xs font-medium text-white/60 capitalize">{q.difficulty}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                              <MoreVertical size={16} />
                           </Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {!questions?.length && (
               <div className="py-16 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="mb-4 text-white/20" size={24} />
                  <p className="text-sm text-white/40">The matrix is empty. Proceed to add knowledge probes.</p>
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
