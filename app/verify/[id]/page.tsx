import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ShieldCheck, Award, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const cinzel = { className: "font-serif" };
const montserrat = { className: "font-sans" };

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: certId } = await params;
  const supabase = await createClient();

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("cert_id", certId)
    .single();

  if (error || !cert) {
    notFound();
  }

  const issueDate = new Date(cert.issue_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen bg-[#030303] py-32 px-6 flex flex-col items-center ${montserrat.className}`}>
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className={`${cinzel.className} text-white text-3xl mb-4 tracking-wider uppercase`}>
          Certificate Verification
        </h1>
        <p className="text-white/40 text-sm tracking-[0.2em] uppercase font-bold">
          GrowX Labs Official Validation Portal
        </p>
      </div>

      <Card className="max-w-2xl w-full p-10 bg-white/[0.02] border-[#00A86B]/30 shadow-2xl shadow-[#00A86B]/5 backdrop-blur-xl rounded-[32px] relative overflow-hidden">
        {/* Verification Badge */}
        <div className="absolute top-0 right-0 p-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#00A86B]/10 border border-[#00A86B]/20 rounded-full">
            <ShieldCheck className="text-[#00A86B] h-4 w-4" />
            <span className="text-[#00A86B] text-[10px] font-black uppercase tracking-widest">Verified Credential</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-[#00A86B]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-[#00A86B] h-10 w-10" />
          </div>

          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Issued To</p>
            <h2 className="text-white text-4xl font-light italic">{cert.student_name}</h2>
          </div>

          <div className="w-full h-[1px] bg-white/5" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-[#c9a84c] h-5 w-5" />
                <div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Program</p>
                  <p className="text-white text-sm font-semibold">{cert.course_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="text-[#c9a84c] h-5 w-5" />
                <div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Grade Achieved</p>
                  <p className="text-white text-sm font-semibold">{cert.grade || 'Pass'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#c9a84c] h-5 w-5" />
                <div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Issue Date</p>
                  <p className="text-white text-sm font-semibold">{issueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#c9a84c] h-5 w-5" />
                <div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Certificate ID</p>
                  <p className="text-white text-sm font-semibold font-mono">{cert.cert_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <p className="text-white/40 text-[11px] leading-relaxed max-w-sm">
              This digital credential has been cryptographically signed and verified by the GrowX Labs Academy issuance system.
            </p>
            <Link href={`/certificate/${cert.cert_id}`}>
              <Button className="bg-[#00A86B] hover:bg-[#00A86B]/90 text-white rounded-full px-8">
                View Official Certificate
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Link href="/" className="mt-12 text-white/20 hover:text-white transition-colors text-xs uppercase tracking-widest">
        Back to GrowX Labs
      </Link>
    </div>
  );
}
