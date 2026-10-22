import { NextResponse } from "next/server";
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { ensureGrowXLabsEmailLayout } from '@/lib/email/growxlabs-layout';



export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'welcome_email.html');
    const html = fs.readFileSync(templatePath, 'utf8');

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: 'GrowXLabsTech <onboarding@growxlabs.tech>',
      to: 'saivarshith8284@gmail.com',
      subject: 'Welcome to GrowXLabsTech 🚀',
      html: ensureGrowXLabsEmailLayout(html.replace('[Client Name]', 'Sai Varshith').replace('[Project Name]', 'Your Project'), { context: 'CLIENT WELCOME', reference: 'YOUR PROJECT', footerNote: 'CLIENT COMMUNICATION · PRIVATE & CONFIDENTIAL' }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
