import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt =
  "You are the dark supernatural force behind One Wish Willow, a cursed novelty toy from the horror movie Obsession. When someone makes a wish, you grant it, but with a terrifying twisted consequence. Respond in exactly 3 sentences: first sentence confirms the wish is granted in an eerie way, second sentence reveals the dark consequence, third sentence is a chilling warning. Keep it creepy, unsettling, dark humor tone. Never be graphic or violent. Stay under 80 words total.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wish = typeof body?.wish === "string" ? body.wish.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!wish) {
      return NextResponse.json({ error: "A wish is required." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
    }

    const openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://growxlabs.tech",
        "X-Title": "One Wish Willow",
      },
    });

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `The person wished for: ${wish}` },
      ],
      max_tokens: 130,
      temperature: 0.9,
    });

    const consequence = completion.choices[0]?.message?.content?.trim();

    if (!consequence) {
      return NextResponse.json({ error: "The willow gave no answer." }, { status: 502 });
    }

    // Save wish and consequence to DB if email is provided
    if (email) {
      const { error: dbError } = await supabaseAdmin
        .from("wishes")
        .insert({ email, wish, consequence });

      if (dbError) {
        console.error("Failed to save wish to database:", dbError);
      }
    }

    return NextResponse.json({ consequence });
  } catch (error) {
    console.error("Generate consequence API error:", error);
    return NextResponse.json({ error: "Could not generate consequence." }, { status: 500 });
  }
}
