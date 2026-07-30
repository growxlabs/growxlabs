import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { NotificationService } from "@/lib/command-center/notifications/notification-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const notifications = NotificationService.listForUser(context.userId, context.organizationId);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "notificationId required" }, { status: 400 });
    }

    const ok = NotificationService.markRead(notificationId, context.userId);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
