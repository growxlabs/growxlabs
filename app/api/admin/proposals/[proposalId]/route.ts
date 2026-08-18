import { commercialError, requireCommercialAdmin, supabaseAdmin } from "@/lib/commercial/workflow";
import {
  createRevision,
  recordInternalDecision,
  sendProposal,
  updateProposalDraft,
} from "@/lib/commercial/proposal-phase2";
import { toClientProposalDto } from "@/lib/commercial/proposal-domain";
export async function GET(_: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    await requireCommercialAdmin();
    const { proposalId } = await params;
    const [p, a, r, c, v] = await Promise.all([
      supabaseAdmin.from("commercial_proposals").select("*").eq("id", proposalId).maybeSingle(),
      supabaseAdmin
        .from("commercial_document_activity")
        .select("*")
        .eq("document_type", "proposal")
        .eq("document_id", proposalId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("proposal_internal_reviews")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("proposal_change_requests")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("requested_at", { ascending: false }),
      supabaseAdmin
        .from("commercial_document_versions")
        .select("id,version,content_hash,client_visible,created_at,superseded_at")
        .eq("document_type", "proposal")
        .eq("document_id", proposalId)
        .order("version", { ascending: false }),
    ]);
    if (p.error) throw new Error(p.error.message);
    if (!p.data)
      return Response.json({ error: "PROPOSAL_NOT_FOUND: Proposal not found." }, { status: 404 });
    const proposal = p.data;
    const [client, company, assessment, deal, architecture, scope] = await Promise.all([
      lookup("users", "name,email", proposal.client_id),
      lookup("companies", "name", proposal.company_id),
      lookup("client_assessments", "assessment_number", proposal.assessment_id),
      lookup("deals", "name", proposal.deal_id),
      lookup("solution_architectures", "architecture_number", proposal.solution_architecture_id),
      lookup("scopes_of_work", "scope_number", proposal.scope_of_work_id),
    ]);
    const references = {
      client: client?.name || client?.email || "Linked client",
      company: company?.name || "Linked company",
      assessment: assessment?.assessment_number || "Not linked",
      deal: deal?.name || "Linked opportunity",
      architecture: architecture?.architecture_number || "Not linked",
      scope: scope?.scope_number || "Not linked",
    };
    return Response.json({
      proposal,
      references,
      clientVisiblePreview: toClientProposalDto(proposal),
      activity: a.data || [],
      reviews: r.data || [],
      changeRequests: c.data || [],
      versions: v.data || [],
    });
  } catch (error) {
    return commercialError(error);
  }
}
async function lookup(table: string, columns: string, id: string | null) {
  if (!id) return null;
  const result = await supabaseAdmin.from(table).select(columns).eq("id", id).maybeSingle();
  return result.error ? null : (result.data as Record<string, string> | null);
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ proposalId: string }> },
) {
  try {
    const admin = await requireCommercialAdmin(),
      { proposalId } = await params,
      body = await request.json();
    if (body.action === "save")
      return Response.json({
        proposal: await updateProposalDraft(proposalId, body.proposal, admin.userId),
      });
    if (body.action === "submit_review" || body.action === "approve" || body.action === "return")
      return Response.json({
        proposal: await recordInternalDecision(
          proposalId,
          body.action === "submit_review" ? "submit" : body.action,
          body.comment,
          admin.userId,
        ),
      });
    if (body.action === "send")
      return Response.json(
        await sendProposal(proposalId, admin.userId, new URL(request.url).origin),
      );
    if (body.action === "create_revision")
      return Response.json({
        proposal: await createRevision(proposalId, admin.userId),
      });
    return Response.json(
      { error: "INVALID_TRANSITION: Unsupported proposal action." },
      { status: 400 },
    );
  } catch (error) {
    return commercialError(error);
  }
}
