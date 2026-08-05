import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
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
const resend = new Resend(resendApiKey || 'dummy_key');

const FROM_EMAIL = 'GrowXLabs <noreply@growxlabs.tech>';
const HR_FROM_EMAIL = 'GrowXLabs HR <hr@growxlabs.tech>';
const HR_TO_EMAIL = 'hr@growxlabs.tech';

export interface SendRecruitmentEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  templateKey?: string;
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendRecruitmentEmail(options: SendRecruitmentEmailOptions): Promise<EmailResult> {
  try {
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not set. Email would have been sent:', options.subject);
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
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
        to_email: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        template_key: options.templateKey,
        candidate_id: options.candidateId,
        application_id: options.applicationId,
        job_id: options.jobId,
        status: 'sent',
        message_id: messageId,
        metadata: options.metadata || {}
      });
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError);
      // We still return success for the email sending part
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
        to_email: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        template_key: options.templateKey,
        candidate_id: options.candidateId,
        application_id: options.applicationId,
        job_id: options.jobId,
        status: 'failed',
        error_message: error.message,
        metadata: options.metadata || {}
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

export async function sendCandidateEmail(
  templateKey: TemplateType,
  variables: TemplateVariables,
  candidateEmail: string,
  candidateId?: string,
  applicationId?: string,
  jobId?: string
): Promise<EmailResult> {
  const template = getDefaultTemplate(templateKey);
  
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
    const response = await resend.emails.send({
      from: HR_FROM_EMAIL,
      to: HR_TO_EMAIL,
      subject,
      html
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return {
      success: true,
      messageId: response.data?.id
    };
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
    const response = await resend.emails.send({
      from: FROM_EMAIL,
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

  const template = getDefaultTemplate(templateKey);
  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.html, variables);

  return sendRecruitmentEmail({
    to: log.to_email,
    subject,
    html,
    templateKey,
    candidateId: log.candidate_id,
    applicationId: log.application_id,
    jobId: log.job_id,
    metadata: { ...log.metadata, retried_from: emailLogId }
  });
}
