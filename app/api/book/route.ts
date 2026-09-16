import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, message, date, time } = body;

    if (!name?.trim() || !email?.trim() || !date?.trim() || !time?.trim()) {
      return NextResponse.json(
        { error: "Name, email, date, and time are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const bookingNotes = `
### 📅 Discovery Call Booked
- **Full Name:** ${name.trim()}
- **Company:** ${company?.trim() || "Not specified"}
- **Work Email:** ${email.trim()}
- **Scheduled Date:** ${date.trim()}
- **Scheduled Time:** ${time.trim()}
- **Project Brief / Notes:** ${message?.trim() || "No additional notes"}
`.trim();

    const leadPayload = {
      name: name.trim(),
      business_name: company?.trim() || name.trim(),
      email: email.trim(),
      notes: bookingNotes,
      message: bookingNotes,
      status: "new",
      source: "Book a Discovery Call",
      lead_score: 9,
    };

    if (supabaseAdmin) {
      const { error: dbError } = await supabaseAdmin.from("leads").insert([leadPayload]);
      if (dbError) {
        console.warn("Could not save to Supabase leads table:", dbError);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Discovery call booked successfully.",
      data: {
        name: name.trim(),
        company: company?.trim() || "",
        date: date.trim(),
        time: time.trim(),
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error. Please try again.";
    console.error("Booking API Error:", errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
