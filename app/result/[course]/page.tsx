"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Award, ShieldCheck, Download, ExternalLink, RefreshCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const score = parseInt(searchParams.get("score") || "0");
  const grade = searchParams.get("grade") || "F";
  
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${params.course}`);
        if (res.status === 401) {
          router.push(`/${params.locale}/login`);
          return;
        }
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) {
          setError("Failed to load result details");
          return;
        }
        const data = await res.json();
        setCourseTitle(data.title);
      } catch (e) {
        setError("Failed to load result details");
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [params.course, params.locale, router]);

  const isPassed = grade !== "F";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-[#00A86B] animate-spin" />
      </div>
    );
  }

  if (error || !courseTitle) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
         <h1 className="text-2xl font-bold mb-4">No Assessment Result Found</h1>
         <p className="text-[#A0A0A0]">We couldn't verify the completion status for this course.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white/[0.02] border border-white/5 rounded-[48px] p-12 lg:p-20 text-center relative overflow-hidden"
        >
           {/* Background Accents */}
           <div className={`absolute top-0 inset-x-0 h-2 ${isPassed ? "bg-[#00A86B]" : "bg-red-500"}`} />
           <div className={`absolute -top-24 -left-24 w-64 h-64 blur-[120px] rounded-full opacity-20 ${isPassed ? "bg-[#00A86B]" : "bg-red-500"}`} />

           {isPassed ? (
             <div className="space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-[#00A86B]/10 border border-[#00A86B]/20 flex items-center justify-center mx-auto mb-8">
                   <Award className="text-[#00A86B]" size={48} />
                </div>
                <div>
                   <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter mb-4">Credentials Verified.</h1>
                   <p className="text-white/40 text-xl font-light uppercase tracking-widest leading-relaxed">
                     You have successfully qualified for the GrowxLabs Tech <br /> 
                     <span className="text-white font-bold">{courseTitle} Certification</span>
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto my-12">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Final Score</p>
                      <p className="text-4xl font-black text-white">{score}%</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Grade</p>
                      <p className="text-4xl font-black text-[#00A86B]">{grade}</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                   <Button className="h-16 px-10 bg-[#00A86B] text-white hover:bg-[#00A86B]/90 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-[#00A86B]/20">
                      Generate PDF Certificate <Download size={18} className="ml-3" />
                   </Button>
                   <Link href={`/verify/GXL-DEMO-2026-VAL`}>
                      <Button variant="outline" className="h-16 px-10 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all">
                        Verify Credential <ShieldCheck size={18} className="ml-3" />
                      </Button>
                   </Link>
                </div>
             </div>
           ) : (
             <div className="space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                   <XCircle className="text-red-500" size={48} />
                </div>
                <div>
                   <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter mb-4">Baseline Not Met.</h1>
                   <p className="text-white/40 text-xl font-light uppercase tracking-widest leading-relaxed">
                     Score: <span className="text-red-500 font-bold">{score}% ({grade})</span>. <br />
                     Certification requires a minimum grade of 'E' (40%).
                   </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-red-500/60 text-sm max-w-md mx-auto italic">
                   Retake protocol active. You must review the materials again before attempting the evaluation.
                </div>

                <div className="pt-8">
                   <Link href={`/courses/${params.course}`}>
                      <Button className="h-16 px-12 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em]">
                        Restart Learning Cycle <RefreshCcw size={18} className="ml-3" />
                      </Button>
                   </Link>
                </div>
             </div>
           )}

           <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-center gap-12 opacity-30 grayscale">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Trust Center</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Cryptographic Verification</span>
           </div>
        </motion.div>

        <div className="mt-12 text-center">
           <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
             Return to Dashboard
           </Link>
        </div>

      </div>
    </div>
  );
}
