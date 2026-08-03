import { activateProject, financeError, requireFinanceAdmin, supabaseAdmin } from "@/lib/finance/activation-workflow";

export async function GET() { try { await requireFinanceAdmin(); const { data, error } = await supabaseAdmin.from("consulting_projects").select("id,project_number,status,activated_at,client_id,agreement_id,consulting_kickoffs(id,kickoff_number,status,scheduled_for)").order("created_at", { ascending: false }); if (error) throw new Error(error.message); return Response.json({ projects: data || [] }); } catch (error) { return financeError(error); } }

export async function POST(request: Request) { try { const { userId } = await requireFinanceAdmin(); const body = await request.json() as { agreementId?: string }; if (!body.agreementId) return Response.json({ error: "Agreement is required." }, { status: 400 }); return Response.json({ project: await activateProject(body.agreementId, userId) }, { status: 201 }); } catch (error) { return financeError(error); } }
