import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendRecruitmentEmail } from '@/lib/recruitment/email-service';
import { CAREERS_ORGANISATION } from '@/lib/careers/jobs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const candidateId = searchParams.get('candidateId');
    const applicationId = searchParams.get('applicationId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .schema('recruitment')
      .from('email_logs')
      .select('*', { count: 'exact' });

    if (candidateId) query = query.eq('candidate_id', candidateId);
    if (applicationId) query = query.eq('application_id', applicationId);
    if (jobId) query = query.eq('job_id', jobId);
    if (status) query = query.eq('status', status);

    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching email logs:', error);
      return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 });
    }

    return NextResponse.json({
      logs,
      total: count || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Error in email logs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, templateKey, candidateId, applicationId, jobId } = body;

    if (!to || (!subject && !templateKey) || (!emailBody && !templateKey)) {
      return NextResponse.json(
        { error: 'Missing required fields (to, and either templateKey or subject/body)' },
        { status: 400 }
      );
    }

    const result = await sendRecruitmentEmail({
      to,
      subject: subject || '',
      html: emailBody || '',
      templateKey,
      candidateId,
      applicationId,
      jobId,
      metadata: { organisation_id: CAREERS_ORGANISATION }
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
