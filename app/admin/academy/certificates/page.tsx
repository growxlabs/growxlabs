import { createClient } from "@/lib/supabase/server";
import { 
  Award, 
  Search, 
  Download, 
  User, 
  CheckCircle2, 
  FileCheck,
  RefreshCcw,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function CertificateManagement() {
  const supabase = await createClient();
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, courses(title), clients(name, email)")
    .order("issued_at", { ascending: false });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Registry Admin</h1>
          <p className="text-white/40 font-medium">Audit and verify globally recognized student credentials.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="border-white/10 text-white/80 hover:text-white hover:bg-white/5 px-6 py-2 h-11 font-medium rounded-md flex items-center gap-2">
              <RefreshCcw size={16} />
              Regenerate Batch
           </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Issued", value: certificates?.length || 0, icon: Award, color: "text-white" },
           { label: "Active Verifications", value: certificates?.length || 0, icon: ShieldAlert, color: "text-white/60" },
           { label: "Revoked Logs", value: "0", icon: CheckCircle2, color: "text-white/60" },
           { label: "Pending Print", value: "0", icon: FileCheck, color: "text-white/40" }
         ].map((stat, i) => (
           <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
              <div>
                 <p className="admin-kpi-label text-white/40 text-sm font-medium mb-1">{stat.label}</p>
                 <h3 className="admin-kpi-value text-white">{stat.value}</h3>
              </div>
              <div className={cn("p-3 bg-white/5 rounded-xl", stat.color)}>
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>

      {/* Certificates Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1 relative">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
               <input 
                 type="text" 
                 placeholder="Search student name or certificate ID..." 
                 className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-white/20 outline-none transition-all"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-white/40 tracking-wider uppercase bg-white/[0.01]">
                     <th className="px-6 py-4">Certificate ID</th>
                     <th className="px-6 py-4">Student</th>
                     <th className="px-6 py-4">Mastery Track</th>
                     <th className="px-6 py-4">Issued Date</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {certificates?.map((cert) => (
                     <tr key={cert.id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-xs font-mono text-white/60">
                              {cert.id.slice(0, 13)}...
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white/80 shrink-0">
                                 {cert.clients?.name?.charAt(0) || 'S'}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-white font-medium text-sm truncate">{cert.clients?.name || 'Unknown Student'}</p>
                                 <p className="text-xs text-white/40 truncate">{cert.clients?.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-xs font-medium text-white/80 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                              {cert.courses?.title || 'Unknown Course'}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-xs text-white/60">
                              {new Date(cert.issued_at).toLocaleDateString()}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                              <Download size={16} />
                           </Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {!certificates?.length && (
               <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Award className="mb-4 text-white/20" size={24} />
                  <p className="text-sm text-white/40">No credentials found in the registry.</p>
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
