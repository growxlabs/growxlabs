import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      business_name,
      city,
      has_website,
      problem,
      phone,
      email,
      source
    } = data;

    // 1. Generate Pitch via OpenRouter
    let pitch = "Based on your challenges, our team will design a custom solution to scale your business.";
    
    if (process.env.OPENROUTER_API_KEY) {
      try {
         const openrouter = new OpenAI({
           baseURL: "https://openrouter.ai/api/v1",
           apiKey: process.env.OPENROUTER_API_KEY,
         });
         const completion = await openrouter.chat.completions.create({
           model: "openai/gpt-4o-mini",
           messages: [
             { 
               role: "system", 
               content: "You are a senior sales strategist at GrowX Labs, a premium engineering agency specializing in high-performance web development and AI automation. Your task is to generate an exactly 3-line punchy, professional, and convincing pitch based on the client's business and problem. Do not use generic intros. Direct and powerful." 
             },
             { 
               role: "user", 
               content: `Business: ${business_name} in ${city}. Website: ${has_website ? 'Yes' : 'No'}. Main Problem: ${problem}. Generate a 3-line pitch.` 
             }
           ],
           max_tokens: 150,
         });
         pitch = completion.choices[0].message.content || pitch;
      } catch (e) {
        console.error("Pitch generation failed:", e);
      }
    }

    // 2. Store in Supabase
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert([{
      business_name,
      city,
      has_website: has_website === "yes",
      phone,
      email,
      notes: `Problem: ${problem} | Source: ${source || "inbound_ai"} | AI Pitch: ${pitch}`,
      status: "new",
      lead_score: 8, // Hot lead from AI widget
    }]);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Trigger WhatsApp Alert Placeholder
    // In a real scenario, you'd call a WhatsApp API (Twilio, Gupshup, etc.) here.
    console.log(`[WHATSAPP ALERT] New Hot Lead: ${business_name} (${city}) - ${phone}`);

    return NextResponse.json({ success: true, pitch });

  } catch (error: any) {
    console.error("Inbound API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
