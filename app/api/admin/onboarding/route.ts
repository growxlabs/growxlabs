import { createOnboarding, onboardingError, requireOnboardingAdmin } from "@/lib/onboarding/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireOnboardingAdmin();
    const [onboardingsResult, profilesResult, agreementsResult] = await Promise.all([
      supabaseAdmin
        .from("client_onboardings")
        .select("id,onboarding_number,client_id,company_id,status,completion_percentage,owner_id,created_at,updated_at,companies(id,name)")
        .order("updated_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("client_profiles")
        .select("id,user_id,company_id")
        .limit(200),
      supabaseAdmin
        .from("master_service_agreements")
        .select("id,agreement_number,client_id,company_id,status")
        .not("status", "eq", "archived")
    ]);

    if (onboardingsResult.error) throw new Error(onboardingsResult.error.message);

    const profiles = profilesResult.data || [];
    const userIds = profiles.map((p) => p.user_id).filter(Boolean);
    const companyIds = profiles.map((p) => p.company_id).filter(Boolean);

    const [{ data: users }, { data: companies }] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("users").select("id,name,email").in("id", userIds)
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabaseAdmin.from("companies").select("id,name").in("id", companyIds)
        : Promise.resolve({ data: [] }),
    ]);

    const userMap = new Map((users || []).map((u) => [u.id, u]));
    const companyMap = new Map((companies || []).map((c) => [c.id, c]));
    const agreements = agreementsResult.data || [];

    const clients = profiles
      .map((p) => {
        const u = userMap.get(p.user_id);
        const c = companyMap.get(p.company_id);
        const agr = agreements.find((a) => a.client_id === p.id);
        return {
          id: p.id,
          name: u?.name || u?.email || "Client Partner",
          companyName: c?.name || u?.name || "Company",
          email: u?.email || "",
          agreementNumber: agr?.agreement_number || null,
          agreementStatus: agr?.status || null,
        };
      })
      .sort((a, b) => (b.agreementNumber ? 1 : 0) - (a.agreementNumber ? 1 : 0));

    return Response.json({
      onboardings: onboardingsResult.data || [],
      clients,
    });
  } catch (error) {
    return onboardingError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireOnboardingAdmin();
    return Response.json(
      { onboarding: await createOnboarding(await request.json(), actor.userId) },
      { status: 201 }
    );
  } catch (error) {
    return onboardingError(error);
  }
}
