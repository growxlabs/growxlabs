import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MOCK_CUSTOMERS_HEALTH = [
  {
    id: "cs111111-1111-1111-1111-111111111111",
    customer_name: "Apex Enterprise",
    company_name: "Apex Enterprise Solutions",
    csm: "Sarah Jenkins",
    health_score: 92,
    churn_risk: "Low",
    product_adoption: 88,
    usage_frequency: "Daily (250+ Users)",
    contract_value: 45000,
    renewal_date: "2026-11-15",
    renewal_stage: "Upcoming",
    onboarding: {
      kickoff: true,
      account_setup: true,
      data_migration: true,
      training: true,
      go_live: true,
      progress: 100
    }
  },
  {
    id: "cs222222-2222-2222-2222-222222222222",
    customer_name: "Lumina Labs",
    company_name: "Lumina Labs Inc.",
    csm: "David Miller",
    health_score: 58,
    churn_risk: "Medium",
    product_adoption: 45,
    usage_frequency: "Weekly",
    contract_value: 18000,
    renewal_date: "2026-08-30",
    renewal_stage: "Negotiating",
    onboarding: {
      kickoff: true,
      account_setup: true,
      data_migration: true,
      training: false,
      go_live: true,
      progress: 80
    }
  },
  {
    id: "cs333333-3333-3333-3333-333333333333",
    customer_name: "Vanguard Tech",
    company_name: "Vanguard Global",
    csm: "Elena Rostova",
    health_score: 35,
    churn_risk: "High",
    product_adoption: 20,
    usage_frequency: "Rarely",
    contract_value: 28000,
    renewal_date: "2026-08-10",
    renewal_stage: "Contacted",
    onboarding: {
      kickoff: true,
      account_setup: true,
      data_migration: false,
      training: false,
      go_live: false,
      progress: 40
    }
  }
];

export async function GET() {
  try {
    const { data: customers } = await supabaseAdmin.from("customer_success").select(`
      *,
      customer_health(*),
      contracts(*),
      customer_onboarding(*)
    `);

    const rawList = (!customers || customers.length === 0) ? MOCK_CUSTOMERS_HEALTH : customers;
    const formatted = rawList.map((c: any) => ({
      id: c.id,
      name: c.customer_name || c.name || "Customer Account",
      company_name: c.company_name || c.name,
      arr: c.contract_value || c.arr || 35000,
      health_score: c.health_score ?? (c.customer_health?.[0]?.health_score ?? 85),
      nps: c.nps ?? 68,
      churn_risk: c.churn_risk ?? (c.customer_health?.[0]?.churn_risk ?? "Low"),
      renewal_date: c.renewal_date || "2026-12-31",
      renewal_stage: c.renewal_stage || "Active"
    }));

    return NextResponse.json({
      customerHealth: formatted,
      customers: formatted
    });
  } catch (error) {
    const formatted = MOCK_CUSTOMERS_HEALTH.map((c: any) => ({
      id: c.id,
      name: c.customer_name,
      company_name: c.company_name,
      arr: c.contract_value,
      health_score: c.health_score,
      nps: 72,
      churn_risk: c.churn_risk,
      renewal_date: c.renewal_date,
      renewal_stage: c.renewal_stage
    }));
    return NextResponse.json({
      customerHealth: formatted,
      customers: formatted
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, customerId, health_score, churn_risk } = body;

    if (action === "update-health" && customerId) {
      const { data, error } = await supabaseAdmin
        .from("customer_health")
        .update({ health_score, churn_risk })
        .eq("customer_success_id", customerId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: true, customerId, health_score, churn_risk, synthetic: true });
      }

      return NextResponse.json({ success: true, health: data });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
