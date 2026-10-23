import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { EnterpriseCrmService } from "./enterprise-crm";

export class WorkflowEngine {
  static async evaluateRules(triggerEvent: string, record: any, contextType: "company" | "contact" | "deal" | "task") {
    try {
      // 1. Fetch active rules for this trigger
      const { data: rules, error } = await supabaseAdmin
        .from("automation_rules")
        .select("*")
        .eq("trigger_event", triggerEvent)
        .eq("is_active", true);

      if (error || !rules || rules.length === 0) return;

      for (const rule of rules) {
        const matches = this.evaluateConditions(rule.conditions, record);
        if (matches) {
          await this.executeActions(rule.id, rule.actions, record, contextType);
        }
      }
    } catch (e) {
      console.error("WorkflowEngine Exception:", e);
    }
  }

  private static evaluateConditions(conditions: any, record: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;

    // Evaluate simple match checks
    for (const key of Object.keys(conditions)) {
      const conditionValue = conditions[key];
      const recordValue = record[key];

      if (typeof conditionValue === "object" && conditionValue !== null) {
        // e.g. { greater_than: 50000 }
        if (conditionValue.greater_than !== undefined && Number(recordValue) <= Number(conditionValue.greater_than)) return false;
        if (conditionValue.less_than !== undefined && Number(recordValue) >= Number(conditionValue.less_than)) return false;
        if (conditionValue.equals !== undefined && recordValue !== conditionValue.equals) return false;
      } else {
        if (recordValue !== conditionValue) return false;
      }
    }
    return true;
  }

  private static async executeActions(ruleId: string, actions: any[], record: any, contextType: "company" | "contact" | "deal" | "task") {
    const runLog: any = {
      rule_id: ruleId,
      trigger_record_id: record.id,
      status: "success"
    };

    try {
      for (const action of actions) {
        switch (action.type) {
          case "assign_owner":
            await this.handleAssignOwner(action.owner_id, record, contextType);
            break;

          case "send_email":
            await this.handleSendEmail(action.template_id, action.subject, action.body_text, record, contextType);
            break;

          case "create_task":
            await this.handleCreateTask(action.task_title, action.task_desc, action.due_days_offset, record, contextType);
            break;

          case "notify_manager":
            await this.handleNotifyManager(action.manager_id, action.title, action.message, record);
            break;

          default:
            console.warn("Unknown workflow action type:", action.type);
        }
      }
    } catch (err: any) {
      runLog.status = "failed";
      runLog.error_message = err.message || "Failed to execute workflow action";
      console.error("Workflow Action Error:", err);
    } finally {
      // Save run log
      await supabaseAdmin.from("automation_runs").insert(runLog);
    }
  }

  // --- Actions Implementations ---

  private static async handleAssignOwner(ownerId: string, record: any, contextType: string) {
    const tableName = contextType === "company" ? "companies" : contextType === "deal" ? "deals" : null;
    if (!tableName) return;

    await supabaseAdmin
      .from(tableName)
      .update({ owner_id: ownerId, updated_at: new Date().toISOString() })
      .eq("id", record.id);

    await EnterpriseCrmService.logTimelineEvent({
      company_id: record.company_id || record.id,
      deal_id: contextType === "deal" ? record.id : undefined,
      event_type: "activity",
      description: `Workflow assigned record owner to: ${ownerId}`
    });
  }

  private static async handleSendEmail(templateId: string, subject: string, bodyText: string, record: any, contextType: string) {
    let emailTo = "";
    let clientName = "Customer";

    if (contextType === "contact") {
      emailTo = record.email;
      clientName = `${record.first_name} ${record.last_name || ''}`;
    } else if (record.primary_contact_id) {
      const { data: contact } = await supabaseAdmin.from("contacts").select("email, first_name").eq("id", record.primary_contact_id).single();
      if (contact) {
        emailTo = contact.email;
        clientName = contact.first_name;
      }
    } else if (record.email) {
      emailTo = record.email;
    }

    if (!emailTo) return;

    const formattedSubject = subject.replace("[Name]", clientName).replace("[Company]", record.name || "");
    const formattedBody = bodyText.replace("[Name]", clientName).replace("[Company]", record.name || "");

    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0075de; margin-bottom: 20px;">GrowX Labs Automation</h2>
        <p>Dear ${clientName},</p>
        <p>${formattedBody.replace(/\n/g, "<br/>")}</p>
        <br/>
        <p>Best Regards,</p>
        <strong>GrowX Labs Operations Team</strong>
      </div>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured for workflow email operations.");
    }
    const resend = new Resend(apiKey);

    const { data: emailRes, error } = await resend.emails.send({
      from: "GrowX Labs CRM <crm@growxlabs.tech>",
      to: emailTo,
      subject: formattedSubject,
      html
    });

    if (error) throw error;

    // Log in database activities
    const { data: act } = await supabaseAdmin.from("activities").insert({
      company_id: record.company_id || (contextType === "company" ? record.id : null),
      contact_id: contextType === "contact" ? record.id : record.primary_contact_id,
      deal_id: contextType === "deal" ? record.id : null,
      type: "EMAIL",
      title: `Auto-Email: ${formattedSubject}`,
      description: formattedBody
    }).select().single();

    if (act) {
      await supabaseAdmin.from("emails").insert({
        activity_id: act.id,
        from_address: "crm@growxlabs.tech",
        to_address: emailTo,
        subject: formattedSubject,
        body: formattedBody,
        sent_at: new Date().toISOString()
      });
    }
  }

  private static async handleCreateTask(title: string, desc: string, dueOffsetDays: number, record: any, contextType: string) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (dueOffsetDays || 1));

    await supabaseAdmin.from("tasks").insert({
      title: title.replace("[Company]", record.name || ""),
      description: desc,
      priority: "MEDIUM",
      status: "TODO",
      due_date: dueDate.toISOString().split("T")[0],
      deal_id: contextType === "deal" ? record.id : record.deal_id,
      company_id: contextType === "company" ? record.id : record.company_id,
      contact_id: contextType === "contact" ? record.id : record.contact_id
    });
  }

  private static async handleNotifyManager(managerId: string, title: string, message: string, record: any) {
    await supabaseAdmin.from("notifications").insert({
      recipient_id: managerId,
      type: "assignment",
      title: title.replace("[Company]", record.name || ""),
      message: message.replace("[Company]", record.name || ""),
      is_read: false
    });
  }
}
