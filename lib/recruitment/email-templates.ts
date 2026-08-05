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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${preheader}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #0f172a; padding: 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 16px; }
    .footer { padding: 24px; text-align: center; font-size: 14px; color: #64748b; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0075de; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; }
    .text-muted { color: #64748b; }
    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>GrowXLabs</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} GrowXLabs. All rights reserved.</p>
      <p>If you no longer wish to receive these emails, please <a href="{{portalLink}}" style="color: #64748b; text-decoration: underline;">update your preferences</a>.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getDefaultTemplate(templateKey: TemplateType): { subject: string; html: string } {
  switch (templateKey) {
    case 'application_received':
      return {
        subject: 'Thank you for applying to {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
           <p>We have successfully received your application. Your application reference number is: <strong>{{applicationRef}}</strong>.</p>
           <p>Our team will review your qualifications and experience. If your profile matches our requirements for this role, we will contact you to discuss the next steps.</p>
           <p>You can check the status of your application anytime through our <a href="{{portalLink}}">careers portal</a>.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
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
        subject: 'Application Update: {{jobTitle}}',
        html: wrapInHtmlLayout(
          `<p>Hi {{candidateName}},</p>
           <p>We are writing to provide an update on your application for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
           <p>Your application has moved to the next stage of our process: <strong>{{newStage}}</strong>.</p>
           <p>We will be in touch shortly with next steps. You can track your application status anytime on our <a href="{{portalLink}}">careers portal</a>.</p>
           <p>Best regards,<br>The {{companyName}} Team</p>`,
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
