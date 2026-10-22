import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Lead } from "@/types";



export class OutreachService {
  static async sendInitialOutreach(leadId: string) {
    try {
      const { data: lead, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error || !lead) throw new Error("Lead not found");
      if (!lead.email) throw new Error("Lead has no email");

      const category = lead.notes?.includes("Category:") 
        ? lead.notes.split("Category:")[1].trim() 
        : "business";

      const subject = `Question about ${lead.business_name}'s website`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">Hi ${lead.business_name} Team,</h2>
          <p>I was looking at your ${category} business in ${lead.city || 'your area'} and noticed something interesting about your online presence.</p>
          <p>We help businesses like yours scale through high-performance digital systems.</p>
          <p>Would you be open to a quick 5-minute chat about how we can help you grow?</p>
          <br />
          <p>Best regards,</p>
          <strong>GrowXLabsTech Team</strong>
        </div>
      `;

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured for outreach email operations.");
      }
      const resend = new Resend(apiKey);

      const { data, error: sendError } = await resend.emails.send({
        from: "GrowXLabsTech <outreach@growxlabs.tech>",
        to: lead.email,
        subject,
        html,
      });

      if (sendError) throw sendError;

      // Update lead
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 3); // 3 days follow up

      await supabaseAdmin
        .from("leads")
        .update({
          status: "contacted",
          outreach_channel: "email",
          follow_up_date: followUpDate.toISOString(),
          notes: lead.notes + `\nSent initial email on ${new Date().toLocaleDateString()}`
        })
        .eq("id", lead.id);

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("OutreachService Error:", error);
      throw error;
    }
  }
}
