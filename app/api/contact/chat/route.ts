import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are the GrowX Labs Project Architect AI. Your job is to consult with prospective clients, refine their ideas, classify their project, and live-generate a development roadmap.

Keep your response friendly, professional, and consultative. Do not be overly verbose. Ask 1 clarifying question at a time to keep the conversation focused.

Based on the client's raw inputs, you must:
1. Identify the core "service":
   - "website" (Next.js development, e-commerce, portfolios, dashboards)
   - "automation" (n8n workflow automation, scrapers, API integrations)
   - "hosting" (deployment, cloud setup, maintenance)
   - "ai" (custom LLM workflows, agents, integrations)
   - "bundle" (multi-service projects)
2. Estimate the "budget" range:
   - "under-15k" (basic landing pages or single automation scripts, <15,000 INR)
   - "15k-35k" (standard small business websites, mid-tier workflow setups, 15,000 - 35,000 INR)
   - "35k-70k" (custom web apps, complex CRM integrations, portals, 35,000 - 70,000 INR)
   - "above-70k" (large enterprise web portals, advanced full-stack SaaS, >70,000 INR)
   - "overseas" (international clients outside India desiring USD billing)
3. Live-generate a roadmap: Generate exactly 2 high-level milestones (Tasks) with exactly 2 subtasks each, tailored to the project. Keep titles and descriptions extremely brief (max 5 words) to avoid JSON truncation.

Return ONLY a JSON response conforming strictly to the following TypeScript interface structure. Do not wrap it in markdown block tags, return plain raw JSON:

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  priority: "high" | "medium" | "low";
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  priority: "high" | "medium" | "low";
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

interface AIResponse {
  response: string; // Your direct, friendly answer or follow-up question to the user.
  service: "website" | "automation" | "hosting" | "ai" | "bundle" | ""; // Auto-detected service class (leave empty if not clear yet).
  budget: "under-15k" | "15k-35k" | "35k-70k" | "above-70k" | "overseas" | ""; // Auto-detected budget class (leave empty if not clear yet).
  tasks: Task[]; // Custom roadmap list. Provide a clean set of tasks that gets refined as they explain more.
  isReady: boolean; // Set to true if you have a clear picture of their scope, service, and budget, and they are ready to finalize.
}`;

// Robust parser to clean LLM JSON response and extract fields via regex if parsing fails
function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  
  // Strip Markdown JSON codeblocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "").trim();
  }

  // Remove trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON.parse failed, running regex fallback extraction. Raw text:", text, e);
    
    // Extract "response" field
    const responseMatch = cleaned.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const responseVal = responseMatch 
      ? responseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
      : "I've processed your idea. Could you tell me more about your requirements or budget?";

    // Extract "service" field
    const serviceMatch = cleaned.match(/"service"\s*:\s*"([^"]*)"/);
    const serviceVal = serviceMatch ? serviceMatch[1] : "";

    // Extract "budget" field
    const budgetMatch = cleaned.match(/"budget"\s*:\s*"([^"]*)"/);
    const budgetVal = budgetMatch ? budgetMatch[1] : "";

    // Extract "isReady" field
    const isReadyMatch = cleaned.match(/"isReady"\s*:\s*(true|false)/i);
    const isReadyVal = isReadyMatch ? isReadyMatch[1].toLowerCase() === "true" : false;

    // Extract tasks array
    let tasksVal: any[] = [];
    try {
      const tasksStartIdx = cleaned.indexOf('"tasks"');
      if (tasksStartIdx !== -1) {
        const tasksSubStr = cleaned.substring(tasksStartIdx);
        const arrayStart = tasksSubStr.indexOf('[');
        if (arrayStart !== -1) {
          let bracketCount = 1;
          let arrayEnd = -1;
          for (let i = arrayStart + 1; i < tasksSubStr.length; i++) {
            if (tasksSubStr[i] === '[') bracketCount++;
            else if (tasksSubStr[i] === ']') bracketCount--;
            if (bracketCount === 0) {
              arrayEnd = i;
              break;
            }
          }
          if (arrayEnd !== -1) {
            const tasksJsonStr = tasksSubStr.substring(arrayStart, arrayEnd + 1);
            const cleanedTasks = tasksJsonStr.replace(/,\s*([\]}])/g, "$1");
            tasksVal = JSON.parse(cleanedTasks);
          }
        }
      }
    } catch (tasksErr) {
      console.warn("Failed to extract tasks array via regex", tasksErr);
    }

    return {
      response: responseVal,
      service: serviceVal,
      budget: budgetVal,
      tasks: tasksVal,
      isReady: isReadyVal
    };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages history" }, { status: 400 });
    }

    // Format prompt from history
    const historyText = messages
      .map((m: any) => `${m.role === "user" ? "Client" : "Architect"}: ${m.content}`)
      .join("\n");

    const prompt = `Analyze the user's latest inputs and respond with the updated JSON.
    
=== CONVERSATION HISTORY ===
${historyText}`;

    let jsonText = "";
    let selectedModel = "";

    // List of reliable free models on OpenRouter to try in order
    const FREE_MODELS = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-coder:free",
      "google/gemma-4-31b-it:free",
      "openrouter/free"
    ];

    if (process.env.OPENROUTER_API_KEY) {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      for (const model of FREE_MODELS) {
        try {
          console.log(`Attempting OpenRouter free model: ${model}...`);
          const completion = await openai.chat.completions.create({
            model: model,
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" }
          });
          
          jsonText = completion.choices?.[0]?.message?.content || "";
          if (jsonText && jsonText.trim()) {
            selectedModel = model;
            console.log(`OpenRouter model ${model} responded successfully.`);
            break;
          }
        } catch (openRouterErr: any) {
          console.warn(`OpenRouter model ${model} failed. Error:`, openRouterErr.message || openRouterErr);
        }
      }
    }

    // Try Direct Google Gemini SDK Fallback (as backup if OpenRouter key is missing or entirely down)
    if (!jsonText && process.env.GEMINI_API_KEY) {
      try {
        console.log("Attempting direct Google Gemini API fallback...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          }
        });
        
        const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${prompt}`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        jsonText = response.text() || "";
        console.log("Direct Google Gemini API fallback responded successfully.");
      } catch (geminiErr: any) {
        console.error("Direct Google Gemini API fallback failed. Error:", geminiErr.message || geminiErr);
      }
    }

    if (!jsonText) {
      console.warn("All AI inference providers failed. Returning friendly client-side fallback response.");
      return NextResponse.json({
        response: "I'm having a brief connection issue due to high traffic, but I've saved your details. Could you tell me a bit more about your project goals or switch to the traditional form to submit directly?",
        service: "",
        budget: "",
        tasks: [],
        isReady: false
      });
    }

    console.log("DEBUG Cleaned AI Output:", jsonText);
    const parsed = cleanAndParseJSON(jsonText);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Contact Conversational OpenRouter API Error:", error);
    return NextResponse.json({ error: "Architect agent is temporarily offline. Please try the traditional form." }, { status: 500 });
  }
}
