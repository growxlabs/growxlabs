import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const SYSTEM_PROMPT = `You are a professional social media content creator specializing in high-engagement Instagram Reels and video content.
Your goal is to structure a compelling, vertical 9:16 slide timeline for a short-form video Reel about the given topic.

Follow these content guidelines:
1. Scene 1 (The Hook): A strong, attention-grabbing title and introductory hook line.
2. Scene 2 to N-1 (The Value): Break down the concepts into progressive steps. Each scene should have a clear header and 1-2 lines of narrative content (this text will be animated word-by-word like video captions).
3. Scene N (The CTA): A final slide prompting a call to action (e.g. Save, Share, Follow).
4. Tone: Adjust tone to match request: Hype, Professional, Casual, Technical, Minimalist.
5. Theme suggestion: Recommend one of the following themes that fits the topic best:
   - 'cyberpunk' (for futuristic, modern tech, AI topics)
   - 'cream' (for lifestyle, design, advice, minimal topics)
   - 'sunset' (for motivational, hype, marketing topics)
   - 'terminal' (for code, deep tech, developers, systems)
   - 'glass' (for business, SaaS, clean agency topics)
   - 'emerald' (for organic tech, finance, environment, clean energy)
   - 'minimal' (for stark contrast, high-fidelity layouts, thought leadership)
   - 'gold' (for luxury branding, growth coaching, high-ticket sales)
6. Graphics (SVG + Image Prompt): Every scene requires:
   - 'imagePrompt': A detailed, highly descriptive prompt suitable for FLUX.1 image generation. Do not generate generic digital art, portraits, brain graphics, or abstract stock-photos. The prompt MUST strictly follow this format template: "A clean, minimalist 2D system architecture diagram explaining [Technical Concept, e.g. RAG database retrieval pipeline]. Labeled blocks showing [Component A] -> [Component B] -> [Component C]. Technical schematic wireframe layout, blueprint sketch style, [chosen theme preset] styling theme, glowing colored connector arrows. Simple shapes, text-free diagram, highly technical and accurate."
   - 'svgCode': Valid, well-formed inline SVG code inside <svg viewBox="0 0 400 400" width="100%" height="100%">...</svg> representing the concept visually. Do NOT generate simple abstract shapes. Gemini must write SVG code to render actual clean labeled boxes, flow nodes, server cylinders, and relational database icons with explicit text labels (e.g., <text x="..." y="...">Database</text>). To make the graphics feel alive, include inline CSS animations inside a <style> block in the SVG (e.g., path dash-arrays animating with @keyframes to show data flowing, or shapes pulsing in a loop). Keep classes scoped within the SVG. Keep SVG backgrounds transparent.
   - Match the recommended theme's style (e.g. neon shapes for cyberpunk, green grids/code paths for terminal).
7. Duration: Suggest display time in seconds for each scene (usually 4 to 6 seconds per scene).
`;

async function searchWeb(query: string): Promise<string> {
  try {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) return "";

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query })
    });

    if (!res.ok) throw new Error(`Serper status ${res.status}`);
    const data = await res.json();
    
    if (!data.organic || !Array.isArray(data.organic) || data.organic.length === 0) {
      return "";
    }

    const snippets = data.organic.slice(0, 5).map((item: any, idx: number) => {
      return `[${idx + 1}] ${item.title}\nSource: ${item.link}\nSnippet: ${item.snippet}`;
    });

    return snippets.join("\n\n");
  } catch (e: any) {
    console.error("Serper API error in generator route:", e);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { topic, tone = "Professional", sceneCount = 5, scenes, instruction } = await req.json();

    if (!topic && (!scenes || !instruction)) {
      return NextResponse.json({ error: "Topic or refinement instructions are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const targetSceneCount = scenes ? scenes.length : sceneCount;

    const generationConfig: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          themeSuggestion: {
            type: SchemaType.STRING,
            description: "Suggested theme preset: cyberpunk, cream, sunset, terminal, glass, emerald, minimal, gold",
          },
          scenes: {
            type: SchemaType.ARRAY,
            description: `List of exactly ${targetSceneCount} scenes for the Reel.`,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                sceneNumber: { type: SchemaType.INTEGER, description: "Sequential scene number, 1-indexed." },
                title: { type: SchemaType.STRING, description: "Scene main header. Keep it punchy and short." },
                content: { type: SchemaType.STRING, description: "Narration or captions. Keep it to 1-2 sentences to allow clear visual word animation." },
                imagePrompt: { type: SchemaType.STRING, description: "Detailed descriptive visual prompt for AI text-to-image generation. Keep it style-consistent." },
                svgCode: { type: SchemaType.STRING, description: "Valid, inline, responsive SVG code (wrapped in <svg viewBox=\"0 0 400 400\" width=\"100%\" height=\"100%\">...</svg>) representing the scene concept visually. Match colors to the suggested theme. Do not wrap in markdown code blocks." },
                duration: { type: SchemaType.INTEGER, description: "Display duration for this scene in seconds (normally 4, 5, or 6)." }
              },
              required: ["sceneNumber", "title", "content", "imagePrompt", "svgCode", "duration"]
            }
          }
        },
        required: ["themeSuggestion", "scenes"]
      }
    };

    let searchContext = "";
    if (process.env.SERPER_API_KEY && topic && !scenes) {
      try {
        searchContext = await searchWeb(topic);
      } catch (err) {
        console.error("Web search failed during generation:", err);
      }
    }

    let userPrompt = "";
    if (scenes && instruction) {
      userPrompt = `
You are an expert editor refining an existing Instagram Reel timeline.
Please apply the user's instructions to refine the content while preserving the structure.

Current Scenes (JSON):
${JSON.stringify(scenes, null, 2)}

Refinement Instruction: "${instruction}"

Make sure there are exactly ${targetSceneCount} scenes in the output.
`;
    } else {
      userPrompt = `
Generate an Instagram Reel timeline with exactly ${sceneCount} scenes.
Topic: ${topic}
Tone: ${tone}

${searchContext ? `Latest Google Search news/findings on the topic to ground your response:\n${searchContext}\n` : ""}

Make sure there are exactly ${sceneCount} scenes.
`;
    }

    if (!genAI) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    let resultStream;
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig
      });
      resultStream = await model.generateContentStream(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
    } catch (e) {
      console.warn("Primary Gemini 2.5 Flash model failed, attempting fallback to Gemini 1.5 Flash:", e);
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig
        });
        resultStream = await model.generateContentStream(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
      } catch (errFallback) {
        console.error("Fallback to Gemini 1.5 Flash model also failed:", errFallback);
        throw errFallback;
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("Gemini stream generation error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error: any) {
    console.error("Reel generation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate reel" }, { status: 500 });
  }
}
