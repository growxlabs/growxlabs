import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data: templates, error } = await supabaseAdmin
      .schema('recruitment')
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email templates:', error);
      return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in email templates GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, subject, html_body, text_body, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (subject !== undefined) updates.subject = subject;
    if (html_body !== undefined) updates.html_body = html_body;
    if (text_body !== undefined) updates.text_body = text_body;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: template, error } = await supabaseAdmin
      .schema('recruitment')
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email template:', error);
      return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in email templates PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
