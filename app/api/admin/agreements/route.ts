import { createAgreement, requireCommercialAdmin, commercialError } from "@/lib/commercial/workflow";
import { listAdminAgreements, listEligibleProposals } from "@/lib/commercial/msa";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(){
  try {
    await requireCommercialAdmin();
    const [agreements, eligibleProposals] = await Promise.all([listAdminAgreements(), listEligibleProposals()]);
    return Response.json({ agreements, eligibleProposals });
  } catch(error) { return commercialError(error); }
}

export async function POST(request:Request){
  try {
    const admin=await requireCommercialAdmin();
    const body=await request.json() as {proposalId?:string; proposalNumber?:string};
    let proposalId=body.proposalId;
    if (!proposalId && body.proposalNumber) {
      const result=await supabaseAdmin.from("commercial_proposals").select("id").eq("proposal_number",body.proposalNumber).eq("status","accepted").maybeSingle();
      if (result.error) throw new Error(result.error.message);
      proposalId=result.data?.id;
    }
    if(!proposalId)return Response.json({error:"An accepted proposal is required."},{status:400});
    return Response.json({agreement:await createAgreement(proposalId,admin.userId)},{status:201});
  } catch(error) { return commercialError(error); }
}
