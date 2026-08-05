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
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching email settings:', error);
      return NextResponse.json({ error: 'Failed to fetch email settings' }, { status: 500 });
    }

    return NextResponse.json({ 
      settings: settings || {
        organisation_id: CAREERS_ORGANISATION,
        from_name: 'GrowXLabs',
        from_email: 'noreply@growxlabs.tech',
        reply_to: null,
        enabled: true
      }
    });
  } catch (error) {
    console.error('Error in email settings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_name, from_email, reply_to, enabled } = body;

    const updates = {
      organisation_id: CAREERS_ORGANISATION,
      from_name,
      from_email,
      reply_to,
      enabled,
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
