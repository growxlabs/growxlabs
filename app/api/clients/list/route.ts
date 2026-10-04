import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: users, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, created_at")
      .eq("role", "CLIENT")
      .order("created_at", { ascending: false });

    if (userError) throw userError;

    const userList = users || [];
    const userIds = userList.map((u) => u.id);

    // Fetch client profiles
    const { data: profiles } = userIds.length
      ? await supabaseAdmin
          .from("client_profiles")
          .select("id, user_id, company_id, lead_id, deal_id, created_at")
          .in("user_id", userIds)
      : { data: [] };

    const profileList = profiles || [];
    const profileIds = profileList.map((p) => p.id);
    const companyIds = profileList.map((p) => p.company_id).filter(Boolean) as string[];

    // Fetch companies
    const { data: companies } = companyIds.length
      ? await supabaseAdmin
          .from("companies")
          .select("id, name, industry, website, country, status")
          .in("id", companyIds)
      : { data: [] };

    // Fetch master service agreements
    const targetClientIds = [...new Set([...userIds, ...profileIds])];
    const { data: agreements } = targetClientIds.length
      ? await supabaseAdmin
          .from("master_service_agreements")
          .select("id, agreement_number, client_id, company_id, status, created_at, effective_at")
          .in("client_id", targetClientIds)
          .not("status", "eq", "archived")
          .order("created_at", { ascending: false })
      : { data: [] };

    // Fetch consulting advance invoices
    const { data: invoices } = targetClientIds.length
      ? await supabaseAdmin
          .from("consulting_advance_invoices")
          .select("id, invoice_number, client_id, total, amount_paid, balance_due, currency, status, created_at")
          .in("client_id", targetClientIds)
          .order("created_at", { ascending: false })
      : { data: [] };

    // Fetch client onboardings
    const { data: onboardings } = targetClientIds.length
      ? await supabaseAdmin
          .from("client_onboardings")
          .select("id, onboarding_number, client_id, company_id, status, completion_percentage, created_at, updated_at")
          .in("client_id", targetClientIds)
          .order("created_at", { ascending: false })
      : { data: [] };

    // Map lookups
    const profileByUser = new Map(profileList.map((p) => [p.user_id, p]));
    const companyMap = new Map((companies || []).map((c) => [c.id, c]));

    const transformedClients = userList.map((u) => {
      const profile = profileByUser.get(u.id);
      const company = profile?.company_id ? companyMap.get(profile.company_id) : null;

      const clientId = profile?.id || u.id;
      const clientKeys = [u.id, profile?.id].filter(Boolean) as string[];

      // Find matching agreements
      const clientAgreements = (agreements || []).filter((a) => clientKeys.includes(a.client_id));
      const latestAgreement = clientAgreements[0] || null;

      // Find matching invoices
      const clientInvoices = (invoices || []).filter((inv) => clientKeys.includes(inv.client_id));
      const totalBilled = clientInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
      const totalPaid = clientInvoices.reduce((sum, inv) => sum + (Number(inv.amount_paid) || 0), 0);
      const balanceDue = clientInvoices.reduce((sum, inv) => sum + (Number(inv.balance_due) || 0), 0);
      const currency = clientInvoices[0]?.currency || "INR";
      const latestInvoice = clientInvoices[0] || null;

      // Find matching onboarding
      const clientOnboardings = (onboardings || []).filter((o) => clientKeys.includes(o.client_id));
      const latestOnboarding = clientOnboardings[0] || null;

      // Determine commercial status
      let commercialStatus: "active" | "onboarding" | "pending_agreement" | "provisioned" = "provisioned";
      if (latestAgreement?.status === "signed" || totalPaid > 0) {
        commercialStatus = "active";
      } else if (latestOnboarding && latestOnboarding.status !== "not_started") {
        commercialStatus = "onboarding";
      } else if (latestAgreement) {
        commercialStatus = "pending_agreement";
      }

      // Format business name
      const businessName = company?.name || u.name || u.email.split("@")[0];

      return {
        id: clientId,
        userId: u.id,
        profileId: profile?.id || null,
        companyId: profile?.company_id || null,
        business_name: businessName,
        name: u.name || businessName,
        email: u.email,
        industry: company?.industry || null,
        website: company?.website || null,
        country: company?.country || null,
        commercialStatus,
        agreementNumber: latestAgreement?.agreement_number || null,
        agreementStatus: latestAgreement?.status || null,
        agreementCount: clientAgreements.length,
        onboardingNumber: latestOnboarding?.onboarding_number || null,
        onboardingStatus: latestOnboarding?.status || null,
        onboardingProgress: latestOnboarding?.completion_percentage ?? null,
        invoiceCount: clientInvoices.length,
        totalBilled,
        totalPaid,
        balanceDue,
        currency,
        latestInvoiceNumber: latestInvoice?.invoice_number || null,
        latestInvoiceStatus: latestInvoice?.status || null,
        createdAt: u.created_at,
      };
    });

    return NextResponse.json(transformedClients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
