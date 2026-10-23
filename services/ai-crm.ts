import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase/admin";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenerativeAI(apiKey);
}

export class AiCrmService {
  // --- AI Lead Score ---
  static async calculateAiLeadScore(companyId: string) {
    try {
      const { data: company, error } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error || !company) throw new Error("Company not found");

      const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Analyze the following business profile and return a numeric lead score between 1 and 10 (where 10 is highest conversion probability for custom web applications/automation services) and a short 2-sentence rationale.
        
        Company Profile:
        Name: ${company.name}
        Industry: ${company.industry || "Unknown"}
        Website: ${company.website || "No Website"}
        Employees: ${company.employees_count || "Unknown"}
        Revenue: ${company.annual_revenue || "Unknown"}
        Notes: ${company.notes || "None"}
        
        Return ONLY a JSON object format:
        {
          "score": number,
          "rationale": "string"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      
      // Update database custom field or tags / notes
      const updatedNotes = `${company.notes || ""}\n[AI Lead Score: ${parsed.score}/10] Rationale: ${parsed.rationale}`;
      await supabaseAdmin.from("companies").update({ notes: updatedNotes }).eq("id", companyId);
      
      return parsed;
    } catch (e) {
      console.error("AI Lead Score Error:", e);
      return { score: 5, rationale: "Default score due to processing error." };
    }
  }

  // --- AI Email Writer ---
  static async generateAiEmail(clientName: string, companyName: string, context: string) {
    try {
      const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Write a highly professional and personalized sales outreach email from GrowX Labs to ${clientName} at ${companyName}.
        Goal: Pitch custom automation workflows, CRM integration, and software engineering.
        Context notes: ${context}
        Keep the email under 150 words. Avoid generic pitches or AI clichés.
        Provide Subject and Body.
        
        Return ONLY a JSON format:
        {
          "subject": "string",
          "body": "string"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (e) {
      console.error("AI Email Writer Error:", e);
      return {
        subject: `Partnership Opportunity: GrowX Labs x ${companyName}`,
        body: `Hi ${clientName},\n\nI noticed ${companyName}'s growth and wanted to reach out regarding our software engineering and business automation solutions.\n\nBest,\nGrowX Labs Team`
      };
    }
  }

  // --- AI Proposal Writer ---
  static async generateAiProposal(companyName: string, requirements: string, value: number) {
    try {
      const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Draft a brief 3-paragraph executive proposal template for custom software services for ${companyName}.
        Requirements: ${requirements}
        Project Valuation: INR ${value}
        
        Format as plain text with clear section headers:
        - Executive Summary
        - Scope & Deliverables
        - Commercial & Timeline
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error("AI Proposal Writer Error:", e);
      return `Executive Proposal for ${companyName}\n\nScope: ${requirements}\nValue: INR ${value}`;
    }
  }

  // --- AI Meeting Summary ---
  static async generateMeetingSummary(meetingId: string, transcript: string) {
    try {
      const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Analyze the following sales call transcript and compile a brief meeting summary.
        Include:
        1. Key topics discussed
        2. Client pain points
        3. Next action steps
        
        Transcript:
        ${transcript}
      `;

      const result = await model.generateContent(prompt);
      const summaryText = result.response.text();

      await supabaseAdmin.from("meetings").update({
        notes: summaryText,
        outcome: "COMPLETED"
      }).eq("id", meetingId);

      return summaryText;
    } catch (e) {
      console.error("AI Meeting Summary Error:", e);
      return "Failed to compile AI meeting summary.";
    }
  }

  // --- AI Forecast & Pipeline Insights ---
  static async generatePipelineForecast() {
    try {
      const { data: deals } = await supabaseAdmin
        .from("deals")
        .select("value, expected_close_date, probability, stage_id(name)");

      if (!deals || deals.length === 0) return { totalForecast: 0, analysis: "No deals in pipeline." };

      const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Analyze the following CRM Deals pipeline list and generate a brief 2-sentence sales forecast report.
        What is the realistic expected revenue and where are the bottlenecks?
        
        Deals List:
        ${JSON.stringify(deals, null, 2)}
      `;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      // Weighted revenue calculation
      const totalForecast = deals.reduce((acc, curr) => {
        const prob = curr.probability || 50;
        return acc + ((curr.value || 0) * (prob / 100));
      }, 0);

      return {
        totalForecast: Math.round(totalForecast),
        analysis
      };
    } catch (e) {
      console.error("AI Pipeline Forecast Error:", e);
      return { totalForecast: 0, analysis: "Pipeline analysis unavailable." };
    }
  }
}
