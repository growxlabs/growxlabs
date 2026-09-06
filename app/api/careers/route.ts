import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApplicationPayload } from "@/lib/careers/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      resume,
      role,
      experience,
      techStack,
      jobTitle,
      company,
      expectedSalary,
      noticePeriod,
      employmentType,
      motivation,
    } = body;

    // Strict Validation & Anti-Duplication Enforcement
    const validationError = validateApplicationPayload(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error, step: validationError.step },
        { status: 400 }
      );
    }

    // Prepare payload matching career_applications DB schema
    const applicationPayload = {
      name,
      email,
      phone: phone || null,
      location: location || null,
      role: role || null,
      experience: experience || null,
      tech_stack: techStack || null,
      github_url: github || null,
      linkedin_url: linkedin || null,
      portfolio_url: portfolio || null,
      resume_url: resume || null,
      job_title: jobTitle || null,
      company: company || null,
      expected_salary: expectedSalary || null,
      notice_period: noticePeriod || null,
      employment_type: employmentType || null,
      motivation: motivation || null,
      status: "new",
    };

    const { error } = await supabaseAdmin
      .from("career_applications")
      .insert([applicationPayload]);

    if (error) {
      console.error("Error submitting career application to Supabase:", error);
      return NextResponse.json(
        { error: "Failed to submit application to the database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Application submitted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Careers API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching career applications:", error);
      return NextResponse.json({ applications: [] });
    }

    return NextResponse.json({ applications: data || [] });
  } catch (err: any) {
    return NextResponse.json({ applications: [] });
  }
}
