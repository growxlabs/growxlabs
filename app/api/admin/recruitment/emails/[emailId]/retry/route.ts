import { NextRequest, NextResponse } from 'next/server';
import { retryEmail } from '@/lib/recruitment/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 });
    }

    const result = await retryEmail(emailId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to retry email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error retrying email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
