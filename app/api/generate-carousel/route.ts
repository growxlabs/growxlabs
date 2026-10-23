import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const SYSTEM_PROMPT = `You are a professional social media content creator specializing in high-engagement Instagram carousel posts.
Your goal is to structure a compelling, value-packed carousel post about the given topic.

Follow these content guidelines:
1. Slide 1 (The Hook): A strong, attention-grabbing title. Make it punchy (e.g., "STOP doing X", "5 AI Hacks for Y"). The subtitle should tease the value. Layout must be 'title-only'.
2. Slide 2 to N-1 (The Value): Break down the core concepts into logical steps or points. Keep text minimal: 1 brief subtitle and 0-3 bullet points. No walls of text. Avoid fluff.
3. Slide N (The CTA): The final slide must have a call to action. Prompt the user to follow, check out the website, or save the post. Layout must be 'cta'.
4. Tone: Adjust tone to match the user's request: Hype, Professional, Casual, Technical, Minimalist.
5. Theme suggestion: Recommend one of the following themes that fits the topic best:
   - 'cyberpunk' (for futuristic, modern tech, AI topics)
   - 'cream' (for lifestyle, design, advice, minimal topics)
   - 'sunset' (for motivational, hype, marketing topics)
   - 'terminal' (for code, deep tech, developers, systems)
   - 'glass' (for business, SaaS, clean agency topics)
   - 'emerald' (for organic tech, finance, environment, clean energy)
   - 'minimal' (for stark contrast, high-fidelity layouts, thought leadership)
   - 'gold' (for luxury branding, growth coaching, high-ticket sales)
6. Graphics (SVG + Image Prompt): For some slides (usually 1-2 value/educational slides), set 'imageEnabled: true'.
   - Generate a clean, responsive vector graphic in 'svgCode'. The graphic must be valid, well-formed inline SVG code inside <svg viewBox="0 0 400 400" width="100%" height="100%">...</svg>. Use vector elements like circles, rects, paths, lines, and text representing diagrams, flowcharts, technical blocks, graphs, or icons. Theme-harmonize it.
   - Write a detailed descriptive prompt for AI text-to-image generation in 'imagePrompt'. Synthesize the slide's title, subtitle, and bullet points into a highly coherent visual schematic. Prompt for a premium, clean technical 2D diagram, architectural blueprint, software flowchart, or polished dashboard mockup suitable for the FLUX.1 model. Emphasize crisp structure, high-end tech theme styling matching the chosen preset, and zero messy realistic photograph fluff or stock photo look. Keep it text-free.
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
    const { topic, tone = "Professional", slideCount = 5, slides, instruction } = await req.json();

    if (!topic && (!slides || !instruction)) {
      return NextResponse.json({ error: "Topic or refinement instructions are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const targetSlideCount = slides ? slides.length : slideCount;

    const generationConfig: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          themeSuggestion: {
            type: SchemaType.STRING,
            description: "Suggested theme preset: cyberpunk, cream, sunset, terminal, glass, emerald, minimal, gold",
          },
          slides: {
            type: SchemaType.ARRAY,
            description: `List of exactly ${targetSlideCount} slides for the carousel.`,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING, description: "Slide main header or hook. Keep it very punchy and short." },
                subtitle: { type: SchemaType.STRING, description: "Slide subheader or additional text. Max 1-2 lines." },
                bullets: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "List of key takeaway points (optional, 0 to 3 items)."
                },
                layout: {
                  type: SchemaType.STRING,
                  description: "Visual layout style. Must be one of: 'title-only', 'bullets', 'quote', 'cta'."
                },
                quoteAuthor: { type: SchemaType.STRING, description: "Author of the quote if layout is 'quote', otherwise empty." },
                imageEnabled: { type: SchemaType.BOOLEAN, description: "Whether to enable a graphical illustration image on this slide." },
                imagePrompt: { type: SchemaType.STRING, description: "Detailed descriptive visual prompt for AI text-to-image generation. Keep it style-consistent and text-free." },
                svgCode: { type: SchemaType.STRING, description: "Valid, inline, responsive SVG code (wrapped in <svg viewBox=\"0 0 400 400\" width=\"100%\" height=\"100%\">...</svg>) representing the slide concept visually (e.g. diagrams, flowcharts, abstract tech nodes, icons). Use clean styles with color themes matching the suggested theme. Do not wrap in markdown code block ticks." }
              },
              required: ["title", "subtitle", "bullets", "layout"]
            }
          }
        },
        required: ["themeSuggestion", "slides"]
      }
    };

    let searchContext = "";
    if (process.env.SERPER_API_KEY && topic && !slides) {
      try {
        searchContext = await searchWeb(topic);
      } catch (err) {
        console.error("Web search failed during generation:", err);
      }
    }

    let userPrompt = "";
    if (slides && instruction) {
      userPrompt = `
You are an expert editor refining an existing Instagram carousel.
Please apply the user's instructions to refine the content while preserving the structure.

Current Slides (JSON):
${JSON.stringify(slides, null, 2)}

Refinement Instruction: "${instruction}"

Make sure there are exactly ${targetSlideCount} slides in the output. Keep the first slide as 'title-only' and the last slide as 'cta'.
`;
    } else {
      userPrompt = `
Generate an Instagram carousel post with exactly ${slideCount} slides.
Topic: ${topic}
Tone: ${tone}

${searchContext ? `Latest Google Search news/findings on the topic to ground your response:\n${searchContext}\n` : ""}

Make sure there are exactly ${slideCount} slides. The first slide MUST be 'title-only' (the hook), and the last slide MUST be 'cta' (the call to action).
`;
    }

    if (!genAI) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    let resultStream;
    try {
      // Primary model: gemini-2.5-flash
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig
      });
      resultStream = await model.generateContentStream(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
    } catch (e) {
      console.warn("Primary Gemini 2.5 Flash model failed, attempting fallback to Gemini 1.5 Flash:", e);
      try {
        // Fallback model: gemini-1.5-flash
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
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });
  } catch (error: any) {
    console.error("Generate Carousel API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate carousel content" },
      { status: 500 }
    );
  }
}
