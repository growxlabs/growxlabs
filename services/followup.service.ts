import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Lead } from "@/types";



export class FollowUpService {
  static async processFollowUps() {
    console.log("Checking for pending follow-ups...");

    try {
      const today = new Date().toISOString();
      
      const { data: leads, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .lte("follow_up_date", today)
        .in("status", ["contacted", "following_up"]);

      if (error) throw error;
      if (!leads) return [];

      for (const lead of leads) {
        await this.handleLeadFollowUp(lead);
      }

      return leads;
    } catch (error) {
      console.error("FollowUpService Error:", error);
      throw error;
    }
  }

  private static async handleLeadFollowUp(lead: Lead) {
    const lastContact = new Date(lead.follow_up_date!);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - lastContact.getTime()) / (1000 * 3600 * 24));

    // Simple state machine for follow-ups
    if (diffDays >= 30) {
      await this.markCold(lead);
    } else if (diffDays >= 14) {
      await this.sendWhatsApp(lead);
    } else if (diffDays >= 7) {
      await this.sendEmail(lead, "Second Follow-up");
    } else if (diffDays >= 3) {
      await this.sendEmail(lead, "First Follow-up");
    }
  }

  private static async sendEmail(lead: Lead, type: string) {
    if (!lead.email) return;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured for follow-up email operations.");
    }
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "GrowXLabsTech <outreach@growxlabs.tech>",
      to: lead.email,
      subject: `Re: Question about ${lead.business_name}'s website`,
      html: `<p>Hi team, following up on my previous email. Just wanted to see if you received it.</p>`,
    });

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (type === "First Follow-up" ? 4 : 7));

    await supabaseAdmin
      .from("leads")
      .update({
        status: "following_up",
        follow_up_date: nextDate.toISOString(),
        notes: lead.notes + `\nSent ${type} on ${new Date().toLocaleDateString()}`
      })
      .eq("id", lead.id);
  }

  private static async sendWhatsApp(lead: Lead) {
    console.log(`Sending WhatsApp follow-up to ${lead.phone}...`);
    // Placeholder for Twilio/WhatsApp API
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 16);

    await supabaseAdmin
      .from("leads")
      .update({
        outreach_channel: "whatsapp",
        follow_up_date: nextDate.toISOString(),
        notes: lead.notes + `\nAttempted WhatsApp on ${new Date().toLocaleDateString()}`
      })
      .eq("id", lead.id);
  }

  private static async markCold(lead: Lead) {
    await supabaseAdmin
      .from("leads")
      .update({
        status: "cold",
        notes: lead.notes + `\nMarked cold on ${new Date().toLocaleDateString()} after no response for 30 days.`
      })
      .eq("id", lead.id);
  }
}
