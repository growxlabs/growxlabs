import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const required = ["business_name", "business_email", "primary_contact", "signature_name"];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const { data: submission, error } = await supabaseAdmin
      .from("onboarding_submissions")
      .insert([{
        full_name: data.primary_contact,
        business_name: data.business_name,
        email: data.business_email,
        phone: data.phone || "Not provided",
        business_type: data.industry,
        description: data.company_overview,
        target_audience: data.primary_customers,
        city: data.headquarters,
        plan: Array.isArray(data.services) ? data.services.join(", ") : null,
        features: [...(Array.isArray(data.objectives) ? data.objectives : []), ...(Array.isArray(data.services) ? data.services : [])],
        budget: data.budget,
        timeline: data.timeline,
        domain: data.website,
        payment_gateway: null,
        notes: JSON.stringify({ assessmentVersion: 2, submittedAt: new Date().toISOString(), assessment: data }),
        signature: `${data.signature_name}${data.signature_designation ? ` — ${data.signature_designation}` : ""}`
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error: unknown) {
    console.error("Onboarding API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit assessment" }, { status: 500 });
  }
}
