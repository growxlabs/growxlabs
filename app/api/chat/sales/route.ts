import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

const SYSTEM_PROMPT = `You are the GrowX Labs Lead Strategy Agent. You are a senior business consultant, not a chatbot.
Your goal is to qualify prospective clients for our high-end engineering and AI services.

### OPERATING PRINCIPLES:
1. BE NATURAL: Don't sound like a robot. Acknowledge what they say.
2. ADAPTIVE FLOW: If they give you their business name and city in one message, don't ask for them separately.
3. DATA POINTS: You need to collect: Business Name, City, Website (Yes/No), Core Challenge, WhatsApp, and Email.
4. ONE AT A TIME: Ask exactly ONE question at a time. Keep it brief.
5. CLOSING: Once you have all data, immediately call 'save_lead'.

### TONE:
Expert, professional, and results-oriented. You represent a premium agency.`;

const LEAD_TOOL = {
  type: "function" as const,
  function: {
    name: "save_lead",
    description: "Submit qualified lead data for strategy session.",
    parameters: {
      type: "object",
      properties: {
        business_name: { type: "string" },
        city: { type: "string" },
        has_website: { type: "boolean" },
        problem: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" }
      },
      required: ["business_name", "city", "has_website", "problem", "phone", "email"]
    }
  }
};

async function handleLeadSubmission(data: any) {
  try {
    const { business_name, city, has_website, problem, phone, email } = data;

    // 1. LEAD SCORING LOGIC
    let score = 4; // Base score
    if (!has_website) score += 3; // High priority: they need a site
    if (problem.toLowerCase().includes("automation") || problem.toLowerCase().includes("ai") || problem.toLowerCase().includes("scale")) score += 2;
    if (phone && email) score += 1;
    score = Math.min(score, 10);

    // 2. GENERATE PERSONALIZED PITCH (Fast)
    let pitch = "Based on your challenges, our team will design a high-performance solution to scale your operations.";
    try {
      const openrouter = getOpenRouterClient();
      const pitchCompletion = await openrouter.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "Generate a 3-line professional sales pitch for GrowX Labs based on the client info. Be bold and specific." },
          { role: "user", content: `Business: ${business_name}. Problem: ${problem}. Website: ${has_website ? 'Yes' : 'No'}` }
        ],
        max_tokens: 150,
      });
      pitch = pitchCompletion.choices[0].message.content || pitch;
    } catch (e) {
      console.error("Secondary Pitch Generation Failed", e);
    }

    // 3. STORE IN SUPABASE
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert([{
      business_name,
      city,
      has_website,
      phone,
      email,
      lead_score: score,
      notes: `Consultant Pitch: ${pitch} | Problem: ${problem}`,
      status: "new"
    }]);

    if (error) throw error;

    // 4. WHATSAPP ALERT SIMULATION
    console.log(`[SALES ALERT] High Intent Lead: ${business_name} (Score: ${score}/10)`);

    return { 
      success: true, 
      pitch,
      finalMessage: "Your strategy is ready. Our senior consultant will reach out on WhatsApp within 1 hour." 
    };
  } catch (error) {
    console.error("Lead Submission Error:", error);
    return { success: false, error: "Submission failed" };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const openrouter = getOpenRouterClient();

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      tools: [LEAD_TOOL],
      tool_choice: "auto",
      max_tokens: 500
    });

    const choice = completion.choices[0].message;

    if (choice.tool_calls?.[0]) {
      const toolCall = choice.tool_calls[0];
      // Type guard for function call
      if ("function" in toolCall && toolCall.function.name === "save_lead") {
        const leadData = JSON.parse(toolCall.function.arguments);
        const result = await handleLeadSubmission(leadData);
        
        if (result.success) {
          return NextResponse.json({ 
            message: `${result.pitch}\n\n${result.finalMessage}`,
            isLeadSaved: true 
          });
        }
      }
    }

    return NextResponse.json({ message: choice.content });

  } catch (error: unknown) {
    console.error("Sales Agent API Error:", error);
    return NextResponse.json({ message: "My intelligence systems are currently calibrating. Please try again soon." }, { status: 500 });
  }
}
