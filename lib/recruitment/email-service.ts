import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CAREERS_ORGANISATION } from '@/lib/careers/jobs';
import { 
  TemplateType, 
  TemplateVariables, 
  getDefaultTemplate, 
  renderTemplate, 
  getHrNotificationHtml,
  HrNotificationType
} from './email-templates';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const DEFAULT_FROM = 'GrowXLabs <noreply@growxlabs.tech>';
const HR_TO_EMAIL = process.env.RECRUITMENT_HR_EMAIL || 'sai@growxlabs.tech';

async function getSettings() {
  const { data } = await supabaseAdmin.schema('recruitment').from('email_settings').select('*').eq('organisation_id', CAREERS_ORGANISATION).maybeSingle();
  return data || { enabled: true, from_name: 'GrowXLabs', from_email: 'noreply@growxlabs.tech', reply_to: 'hr@growxlabs.tech', internal_audit_enabled: true, internal_audit_recipients: ['sai@growxlabs.tech'] };
}

async function getTemplate(templateKey: TemplateType) {
  const { data } = await supabaseAdmin.schema('recruitment').from('email_templates').select('subject,html_body,is_active').eq('organisation_id', CAREERS_ORGANISATION).eq('template_key', templateKey).maybeSingle();
  if (data?.is_active !== false && data?.subject && data?.html_body && !data.html_body.startsWith('<!-- HTML rendered')) return { subject: data.subject, html: data.html_body };
  return getDefaultTemplate(templateKey);
}

export interface SendRecruitmentEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  templateKey?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  metadata?: Record<string, any>;
  skipInternalAudit?: boolean;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendRecruitmentEmail(options: SendRecruitmentEmailOptions): Promise<EmailResult> {
  const settings = await getSettings();
  const from = `${settings.from_name || 'GrowXLabs'} <${settings.from_email || 'noreply@growxlabs.tech'}>`;
  const recipients = Array.isArray(options.to) ? options.to.join(',') : options.to;
  try {
    if (settings.enabled === false) throw new Error('Recruitment email sending is disabled in Email Settings.');
    if (!resend) throw new Error('RESEND_API_KEY is not configured. Configure the provider before sending email.');

    const response = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: settings.reply_to || undefined,
      tags: [
        { name: 'source', value: 'recruitment_system' },
        ...(options.templateKey ? [{ name: 'template', value: options.templateKey }] : [])
      ]
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const messageId = response.data?.id;

    // Log the email in Supabase
    try {
      await supabaseAdmin.schema('recruitment').from('email_logs').insert({
        organisation_id: CAREERS_ORGANISATION,
        recipient_email: recipients,
        subject: options.subject,
        template_key: options.templateKey,
        candidate_id: options.candidateId,
        application_id: options.applicationId,
        job_id: options.jobId,
        status: 'sent',
        message_id: messageId,
        metadata: options.metadata || {},
        last_attempt_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError);
      // We still return success for the email sending part
    }

    if (!options.skipInternalAudit && settings.internal_audit_enabled !== false) {
      const recipients = Array.isArray(settings.internal_audit_recipients)
        ? settings.internal_audit_recipients.filter((recipient: unknown): recipient is string => typeof recipient === 'string' && recipient.includes('@'))
        : ['sai@growxlabs.tech'];
      if (recipients.length) {
        try {
          const auditHtml = buildInternalAuditHtml(options, recipients, settings, messageId);
          const auditResult = await resend.emails.send({
            from,
            to: recipients,
            subject: `[Internal Copy] ${options.subject}`,
            html: auditHtml,
            replyTo: settings.reply_to || undefined,
            tags: [{ name: 'source', value: 'recruitment_audit' }],
          });
          if (auditResult.error) console.error('Failed to send recruitment audit copy:', auditResult.error.message);
          else await supabaseAdmin.schema('recruitment').from('email_logs').insert({
            organisation_id: CAREERS_ORGANISATION,
            recipient_email: recipients.join(','),
            subject: `[Internal Copy] ${options.subject}`,
            template_key: 'internal_audit',
            candidate_id: options.candidateId,
            application_id: options.applicationId,
            job_id: options.jobId,
            status: 'sent',
            message_id: auditResult.data?.id,
            sent_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
            metadata: { candidateMessageId: messageId, sourceTemplate: options.templateKey || 'manual' },
          });
        } catch (auditError) {
          console.error('Failed to send recruitment audit copy:', auditError);
        }
      }
    }

    return {
      success: true,
      messageId
    };
  } catch (error: any) {
    console.error('Error sending recruitment email:', error);
    
    // Log the failed email
    try {
      await supabaseAdmin.schema('recruitment').from('email_logs').insert({
        organisation_id: CAREERS_ORGANISATION,
        recipient_email: recipients,
        subject: options.subject,
        template_key: options.templateKey,
        candidate_id: options.candidateId,
        application_id: options.applicationId,
        job_id: options.jobId,
        status: 'failed',
        error_message: error.message,
        metadata: options.metadata || {},
        last_attempt_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to log failed email to database:', dbError);
    }

    return {
      success: false,
      error: error.message || 'Unknown error occurred while sending email'
    };
  }
}

function buildInternalAuditHtml(options: SendRecruitmentEmailOptions, recipients: string[], settings: any, messageId?: string) {
  const vars = options.metadata?.variables || {};
  const metadata = [
    ['Candidate name', vars.candidateName || 'Not provided'],
    ['Candidate email', Array.isArray(options.to) ? options.to.join(', ') : options.to],
    ['Application reference', vars.applicationRef || 'Not provided'],
    ['Job role', vars.jobTitle || 'Not provided'],
    ['Current stage', vars.newStage || vars.currentStage || 'Not provided'],
    ['Email template', options.templateKey || 'Manual communication'],
    ['Sent timestamp', new Date().toISOString()],
    ['Triggered by', options.metadata?.triggeredBy || 'System'],
    ['Candidate message ID', messageId || 'Not available'],
    ['Audit recipients', recipients.join(', ')],
  ].map(([label, value]) => `<tr><td style="padding:7px 12px;border:1px solid #dbe3ee;font-weight:700">${escapeAuditHtml(label)}</td><td style="padding:7px 12px;border:1px solid #dbe3ee">${escapeAuditHtml(value)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#f3f6fa;font-family:Arial,Helvetica,sans-serif;color:#172033"><div style="max-width:680px;margin:24px auto;background:#fff;border:1px solid #dbe3ee"><div style="padding:16px 24px;background:#172033;color:#fff;font-weight:700;letter-spacing:.08em">INTERNAL RECRUITMENT COPY</div><div style="padding:24px"><p style="margin-top:0">This is an internal audit copy. It was not shown to the candidate.</p><table style="border-collapse:collapse;width:100%;font-size:13px;margin:18px 0">${metadata}</table><hr style="border:0;border-top:1px solid #dbe3ee;margin:24px 0"><div>${options.html}</div></div></div></body></html>`;
}

function escapeAuditHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
}

export async function sendCandidateEmail(
  templateKey: TemplateType,
  variables: TemplateVariables,
  candidateEmail: string,
  candidateId?: string,
  applicationId?: string,
  jobId?: string
): Promise<EmailResult> {
  const template = await getTemplate(templateKey);
  
  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.html, variables);

  return sendRecruitmentEmail({
    to: candidateEmail,
    subject,
    html,
    templateKey,
    candidateId,
    applicationId,
    jobId,
    metadata: { variables }
  });
}

export async function sendHrNotification(
  type: HrNotificationType,
  data: Record<string, any>
): Promise<EmailResult> {
  const { subject, html } = getHrNotificationHtml(type, data);

  try {
    return sendRecruitmentEmail({ to: HR_TO_EMAIL, subject, html, templateKey: `hr_${type}`, metadata: { notificationType: type } });
  } catch (error: any) {
    console.error('Error sending HR notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function sendTestEmail(toEmail: string): Promise<EmailResult> {
  try {
    if (!resend) return { success: false, error: 'RESEND_API_KEY is not configured.' };
    const settings = await getSettings();
    if (settings.enabled === false) return { success: false, error: 'Recruitment email sending is disabled.' };
    const response = await resend.emails.send({
      from: `${settings.from_name || 'GrowXLabs'} <${settings.from_email || 'noreply@growxlabs.tech'}>`,
      to: toEmail,
      subject: 'GrowXLabs Recruitment System - Test Email',
      html: '<p>This is a test email to verify that the Resend integration is working correctly.</p>'
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export interface GetEmailLogsFilters {
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function getEmailLogs(filters: GetEmailLogsFilters) {
  let query = supabaseAdmin
    .schema('recruitment')
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.candidateId) {
    query = query.eq('candidate_id', filters.candidateId);
  }
  
  if (filters.applicationId) {
    query = query.eq('application_id', filters.applicationId);
  }
  
  if (filters.jobId) {
    query = query.eq('job_id', filters.jobId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function retryEmail(emailLogId: string): Promise<EmailResult> {
  const { data: log, error } = await supabaseAdmin
    .schema('recruitment')
    .from('email_logs')
    .select('*')
    .eq('id', emailLogId)
    .single();

  if (error || !log) {
    return { success: false, error: 'Email log not found' };
  }

  if (log.status === 'sent') {
    return { success: false, error: 'Email has already been sent successfully' };
  }

  // Assuming metadata contains original variables, we might need to fetch the original HTML/subject
  // Alternatively, if it failed inside `sendRecruitmentEmail`, we might need to recreate the payload.
  // For simplicity, let's re-render it if templateKey and variables are available, or send a generic retry.
  
  const templateKey = log.template_key as TemplateType;
  const variables = log.metadata?.variables || {};

  if (!templateKey) {
    return { success: false, error: 'Missing template key to retry email' };
  }

  const template = await getTemplate(templateKey);
  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.html, variables);

  return sendRecruitmentEmail({
    to: log.recipient_email,
    subject,
    html,
    templateKey,
    candidateId: log.candidate_id,
    applicationId: log.application_id,
    jobId: log.job_id,
    metadata: { ...log.metadata, retried_from: emailLogId }
  });
}
