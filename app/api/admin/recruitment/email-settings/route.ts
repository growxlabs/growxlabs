import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CAREERS_ORGANISATION } from '@/lib/careers/jobs';
import { sendTestEmail } from '@/lib/recruitment/email-service';

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .schema('recruitment')
      .from('email_settings')
      .select('*')
      .eq('organisation_id', CAREERS_ORGANISATION)
      .maybeSingle();

    if (error) {
      console.error('Error fetching email settings:', error);
      return NextResponse.json({
        settings: defaultSettings(),
        connection: {
          configured: Boolean(process.env.RESEND_API_KEY),
          setupRequired: true,
          message: 'Email settings are not ready yet. Please contact your system administrator to complete the email service setup.',
        },
      });
    }

    return NextResponse.json({
      settings: { ...defaultSettings(), ...settings },
      connection: {
        configured: Boolean(process.env.RESEND_API_KEY),
        setupRequired: false,
      },
    });
  } catch (error) {
    console.error('Error in email settings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_name, from_email, reply_to, enabled, provider } = body;

    const updates = {
      organisation_id: CAREERS_ORGANISATION,
      from_name,
      from_email,
      reply_to,
      enabled,
      provider: provider || 'resend',
      updated_at: new Date().toISOString()
    };

    const { data: settings, error } = await supabaseAdmin
      .schema('recruitment')
      .from('email_settings')
      .upsert(updates, { onConflict: 'organisation_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating email settings:', error);
      return NextResponse.json({ error: 'Failed to update email settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in email settings PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function defaultSettings() {
  return {
    organisation_id: CAREERS_ORGANISATION,
    provider: 'resend',
    from_name: 'GrowXLabs',
    from_email: 'noreply@growxlabs.tech',
    reply_to: '',
    enabled: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, to } = body;

    if (action === 'test') {
      if (!to) {
        return NextResponse.json({ error: 'Recipient email is required for test' }, { status: 400 });
      }

      const result = await sendTestEmail(to);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send test email', details: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, messageId: result.messageId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in email settings POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
