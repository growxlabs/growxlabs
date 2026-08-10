export const TEMPLATE_TYPES = [
  'application_received',
  'interview_invite',
  'assessment_invite',
  'offer_extended',
  'rejection',
  'stage_update',
  'general',
  'interviewer_assignment',
  'interview_access_extended',
  'interview_access_revoked'
] as const;
import { growxlabsEmailLayout } from "@/lib/email/growxlabs-layout";

export type TemplateType = typeof TEMPLATE_TYPES[number];

export interface TemplateVariables {
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  applicationRef?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  interviewType?: string;
  interviewFormat?: string;
  timeZone?: string;
  interviewDuration?: string;
  interviewerName?: string;
  interviewerRole?: string;
  preparationInstructions?: string;
  supportEmail?: string;
  confirmLink?: string;
  rescheduleLink?: string;
  declineLink?: string;
  assessmentLink?: string;
  assessmentDeadline?: string;
  currentStage?: string;
  newStage?: string;
  portalLink?: string;
  [key: string]: string | undefined;
}

export function wrapInHtmlLayout(content: string, preheader: string = 'Message from GrowXLabs'): string {
  return growxlabsEmailLayout({ context: preheader, preheader, content, footerNote: "Recruitment communication · PRIVATE & CONFIDENTIAL" }); /* legacy wrapper retained for saved templates */
  /* return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${preheader}</title>
  <style>
    body { margin: 0; padding: 0; background: #eef2f7; color: #172033; font-family: Arial, Helvetica, sans-serif; }
    .shell { width: 100%; background: #eef2f7; padding: 36px 12px; }
    .container { width: 100%; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #dce4ef; border-radius: 18px; overflow: hidden; }
    .header { background: #101a33; padding: 28px 34px; }
    .brand { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
    .brand-mark { display: inline-block; width: 10px; height: 10px; margin-right: 8px; border-radius: 3px; background: #1d8fff; }
    .eyebrow { margin: 0 0 10px; color: #1d8fff; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
    .content { padding: 36px 34px 30px; line-height: 1.58; font-size: 16px; }
    .content p { margin: 0 0 18px; }
    .content a { color: #006dcc; }
    .footer { padding: 22px 34px 28px; color: #718096; background: #f7f9fc; border-top: 1px solid #e7edf5; font-size: 12px; line-height: 1.5; }
    .footer p { margin: 4px 0; }
    .button { display: inline-block; padding: 13px 22px; background: #0878df; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 4px 0 14px; }
    .text-muted { color: #718096; }
    .info-box { background: #f7f9fc; border: 1px solid #dce4ef; border-radius: 10px; padding: 16px 18px; margin: 22px 0; }
    .status-box { background: #eef7ff; border-left: 4px solid #0878df; border-radius: 8px; padding: 16px 18px; margin: 22px 0; }
    @media only screen and (max-width: 640px) { .shell { padding: 16px 8px; } .header { padding: 24px 22px; } .content { padding: 28px 22px 20px; } .footer { padding: 20px 22px 24px; } }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="shell">
  <div class="container">
    <div class="header">
      <div class="brand"><span class="brand-mark"></span>GrowXLabs Careers</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} GrowXLabs. This is an application update.</p>
      <p>Questions? Reply to this email and our recruitment team will help.</p>
    </div>
  </div>
  </div>
</body>
</html>`; */
}

export function getDefaultTemplate(templateKey: TemplateType): { subject: string; html: string } {
  switch (templateKey) {
    case 'application_received':
      return {
        subject: 'We received your application for {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p class="eyebrow">Application received</p>
           <p>Hi {{candidateName}},</p>
           <p>Thank you for applying for <strong>{{jobTitle}}</strong> at {{companyName}}. Your application is safely with our recruitment team.</p>
           <div class="status-box"><strong>Application reference</strong><br>{{applicationRef}}</div>
           <p>We’ll review your experience and contact you if we’d like to move forward. You can check your status at any time in the candidate portal.</p>
           <p style="text-align:center"><a class="button" href="{{portalLink}}">Open candidate portal</a></p>
           <p>Best regards,<br>The {{companyName}} Recruitment Team</p>`,
          'We have received your application'
        )
      };
    
    case 'interview_invite':
      return {
        subject: 'Interview Invitation for {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> role at {{companyName}}.</p>
           <p>We would like to invite you to an interview to discuss your application further.</p>
           <div class="info-box">
             <p style="margin-top:0;"><strong>Date:</strong> {{interviewDate}}</p>
             <p><strong>Time:</strong> {{interviewTime}}</p>
           <p><strong>Format:</strong> {{interviewFormat}}</p>
           <p><strong>Time zone:</strong> {{timeZone}}</p>
           <p><strong>Duration:</strong> {{interviewDuration}}</p>
           <p><strong>Interviewer:</strong> {{interviewerName}} ({{interviewerRole}})</p>
             <p style="margin-bottom:0;"><strong>Meeting link / office:</strong> {{interviewLink}}</p>
           </div>
           <p><strong>Preparation:</strong> {{preparationInstructions}}</p>
           {{playbookCta}}
           <p><strong>Questions?</strong> Contact <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
           <p style="text-align:center"><a class="button" href="{{confirmLink}}">Confirm Attendance</a> <a class="button" href="{{rescheduleLink}}">Request Reschedule</a> <a class="button" href="{{declineLink}}">Decline Interview</a></p>
           <p>Please let us know if you need any accommodations or if this time no longer works for you.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
          'Invitation to interview'
        )
      };
    
    case 'assessment_invite':
      return {
        subject: 'Assessment for {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>As part of our recruitment process for the <strong>{{jobTitle}}</strong> position, we would like to invite you to complete an assessment.</p>
           <p>Please click the button below to access the assessment.</p>
           <div style="text-align: center;">
             <a href="{{assessmentLink}}" class="button">Start Assessment</a>
           </div>
           <div class="info-box">
             <p style="margin:0;"><strong>Deadline:</strong> {{assessmentDeadline}}</p>
           </div>
           <p>If you have any questions or face technical difficulties, please reply to this email.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
          'Action required: Assessment invitation'
        )
      };

    case 'offer_extended':
      return {
        subject: 'Offer from GrowXLabs for {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>Congratulations! We are thrilled to extend an offer for you to join {{companyName}} as a <strong>{{jobTitle}}</strong>.</p>
           <p>We were very impressed with your skills and experience during the interview process, and we believe you will be a fantastic addition to our team.</p>
           <p>You can view your offer details and next steps via the <a href="{{portalLink}}">careers portal</a>.</p>
           <p>If you have any questions, please do not hesitate to reach out.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
          'Congratulations! We have an offer for you'
        )
      };
      
    case 'rejection':
      return {
        subject: 'Update on your application for {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>Thank you for taking the time to apply for the <strong>{{jobTitle}}</strong> position and for your interest in {{companyName}}.</p>
           <p>While we were impressed with your background, we have decided to move forward with other candidates whose experience more closely aligns with our current needs for this role.</p>
           <p>We appreciate your time and effort during the application process and encourage you to apply for future openings that match your skills.</p>
           <p>We wish you the best in your career search.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
          'Update on your application'
        )
      };

    case 'stage_update':
      return {
        subject: 'Application update for {{jobTitle}}: {{newStage}}',
        html: wrapInHtmlLayout(
          `<p class="eyebrow">Application update</p>
           <p>Hi {{candidateName}},</p>
           <p>There’s an update on your application for <strong>{{jobTitle}}</strong> at {{companyName}}.</p>
           <div class="status-box"><strong>New status</strong><br><span style="font-size:20px;color:#0878df;font-weight:700">{{newStage}}</span></div>
           <p>We’ll share any next steps with you as soon as they’re ready. You can view your full application timeline in the candidate portal.</p>
           <p style="text-align:center"><a class="button" href="{{portalLink}}">View application status</a></p>
           <p>Best regards,<br>The {{companyName}} Recruitment Team</p>`,
          'Update on your application status'
        )
      };

    case 'general':
      return {
        subject: 'Message from GrowXLabs',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>This is a message regarding your application for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
           <p>If you have any questions, please feel free to reach out.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
          'Message from GrowXLabs'
        )
      };

    case 'interviewer_assignment':
      return {
        subject: 'Interview Assignment: {{candidateName}} for {{jobTitle}} | GrowXLabs',
        html: wrapInHtmlLayout(
          `<p>Hi {{interviewerName}},</p>
           <p>You have been assigned to conduct an interview for candidate <strong>{{candidateName}}</strong> applying for the position of <strong>{{jobTitle}}</strong>.</p>
           
           <div class="info-box">
             <p>📅 <strong>Date:</strong> {{interviewDate}}</p>
             <p>⏰ <strong>Time:</strong> {{interviewTime}} ({{timeZone}})</p>
             <p>⏱️ <strong>Duration:</strong> {{interviewDuration}} mins</p>
             <p>🔓 <strong>Access Window:</strong> Available from {{accessStartsAt}} to {{accessExpiresAt}}</p>
           </div>
           
           <p>You can access the dedicated Interviewer Workspace to review approved candidate details, resume, screening answers, and complete your evaluation scorecard.</p>

           <a href="{{invitationLink}}" class="button">Review Candidate & Access Workspace</a>
           
           <p class="text-muted">Note: Access is time-bound and strictly authorized for your account during the assigned window.</p>`,
          'Interview Assignment'
        )
      };

    case 'interview_access_extended':
      return {
        subject: 'Interview Access Extended: {{candidateName}} | GrowXLabs',
        html: wrapInHtmlLayout(
          `<p>Hi {{interviewerName}},</p>
           <p>Your temporary access window to review <strong>{{candidateName}}</strong> for the <strong>{{jobTitle}}</strong> role has been extended by the recruitment administrator.</p>
           
           <div class="info-box">
             <p>⏳ <strong>New Expiry Time:</strong> {{accessExpiresAt}}</p>
           </div>

           <a href="{{workspaceLink}}" class="button">Open Interviewer Workspace</a>`,
          'Interview Access Extended'
        )
      };

    case 'interview_access_revoked':
      return {
        subject: 'Interview Access Revoked: {{candidateName}} | GrowXLabs',
        html: wrapInHtmlLayout(
          `<p>Hi {{interviewerName}},</p>
           <p>Your temporary access assignment for candidate <strong>{{candidateName}}</strong> has been updated or revoked by the recruitment administrator.</p>
           <p class="text-muted">If you believe this is an error, please contact your hiring administrator.</p>`,
          'Interview Access Revoked'
        )
      };
  }
}

export function renderTemplate(templateHtml: string, variables: TemplateVariables): string {
  let rendered = templateHtml;
  
  // Ensure default companyName is set
  const varsToRender = {
    companyName: 'GrowXLabs',
    ...variables
  };

  // Replace all {{var}} placeholders
  for (const [key, value] of Object.entries(varsToRender)) {
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
  }

  // Clear out any unused placeholders
  rendered = rendered.replace(/{{[^}]+}}/g, '');

  return rendered;
}

export type HrNotificationType = 'new_application' | 'stage_change' | 'interview_scheduled' | 'offer_decision';

export function getHrNotificationHtml(type: HrNotificationType, data: Record<string, any>): { subject: string; html: string } {
  let title = 'HR Notification';
  let detailsHtml = '';

  for (const [key, value] of Object.entries(data)) {
    detailsHtml += `<p style="margin: 4px 0;"><strong>${key}:</strong> ${value}</p>`;
  }

  let content = '';

  switch (type) {
    case 'new_application':
      title = 'New Application Received';
      content = `
        <p>A new application has been submitted.</p>
        <div class="info-box">${detailsHtml}</div>
      `;
      break;
    case 'stage_change':
      title = 'Application Stage Changed';
      content = `
        <p>A candidate's application stage has been updated.</p>
        <div class="info-box">${detailsHtml}</div>
      `;
      break;
    case 'interview_scheduled':
      title = 'Interview Scheduled';
      content = `
        <p>A new interview has been scheduled.</p>
        <div class="info-box">${detailsHtml}</div>
      `;
      break;
    case 'offer_decision':
      title = 'Offer Decision Update';
      content = `
        <p>An update has occurred regarding an offer.</p>
        <div class="info-box">${detailsHtml}</div>
      `;
      break;
  }

  return {
    subject: `[HR Alert] ${title}`,
    html: wrapInHtmlLayout(content, title)
  };
}
