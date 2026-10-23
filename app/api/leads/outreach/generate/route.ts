import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // 1. Fetch Lead Data
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if already generated and cache exists
    if (lead.outreach_generated && lead.outreach_content) {
      return NextResponse.json(lead.outreach_content);
    }

    // 2. Prepare AI Prompt
    const insight = !lead.has_website ? "No website detected" : (lead.google_rating < 4 ? "Low Google rating" : "General optimization");
    
    const systemPrompt = `You are a high-performing sales assistant for a digital agency (GrowX Labs).
Your job is to convert leads into clients using short, personalized outreach messages.

Based on the lead data, generate:
1. WhatsApp message (friendly, direct, max 3 lines)
2. Cold email (professional, max 5 lines)
3. Call script (2 lines, natural speech)

Rules:
* Mention business name: ${lead.business_name}
* Identify problem clearly: ${insight}
* Suggest solution briefly
* Add soft CTA
* No generic fluff
* No long paragraphs

Return ONLY a JSON object with this structure:
{
  "whatsapp": "string",
  "email": "string",
  "call": "string"
}`;

    const userMessage = `Lead Data:
Business Name: ${lead.business_name}
City: ${lead.city || 'Unknown'}
Rating: ${lead.google_rating || 'N/A'}
Has Website: ${lead.has_website}
Key Insight: ${insight}`;

    // 3. Call AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash", // Use a reliable model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI failed to generate content");

    const outreachContent = JSON.parse(content);

    // 4. Update Database
    await supabaseAdmin
      .from("leads")
      .update({
        outreach_generated: true,
        outreach_content: outreachContent,
        updated_at: new Date().toISOString()
      })
      .eq("id", leadId);

    return NextResponse.json(outreachContent);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Outreach Generation Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
