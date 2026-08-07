type ZoomMeeting = {
  id: number;
  uuid?: string;
  join_url: string;
  start_url?: string;
  password?: string;
};

export type ZoomIntegrationErrorCode = "ZOOM_CONFIGURATION_MISSING" | "ZOOM_OAUTH_FAILED" | "ZOOM_MEETING_CREATION_FAILED";

export class ZoomIntegrationError extends Error {
  constructor(public readonly code: ZoomIntegrationErrorCode, message: string) {
    super(message);
    this.name = "ZoomIntegrationError";
  }
}

function config() {
  const entries = [
    ["ZOOM_ACCOUNT_ID", process.env.ZOOM_ACCOUNT_ID],
    ["ZOOM_CLIENT_ID", process.env.ZOOM_CLIENT_ID],
    ["ZOOM_CLIENT_SECRET", process.env.ZOOM_CLIENT_SECRET],
  ] as const;
  const missing = entries.find(([, value]) => !value)?.[0];
  if (missing) {
    console.error(`[Zoom] Missing ${missing}`);
    throw new ZoomIntegrationError("ZOOM_CONFIGURATION_MISSING", "Zoom integration is not configured.");
  }
  const accountId = process.env.ZOOM_ACCOUNT_ID!;
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
  return { clientId, clientSecret, accountId };
}

export async function createZoomInterviewMeeting(input: { topic: string; startTime: string; durationMinutes: number; agenda?: string }): Promise<ZoomMeeting> {
  const { clientId, clientSecret, accountId } = config();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
  const tokenBody = await tokenResponse.json() as { access_token?: string; error?: string; reason?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) {
    console.error(`[Zoom] OAuth token request failed: HTTP ${tokenResponse.status}`);
    throw new ZoomIntegrationError("ZOOM_OAUTH_FAILED", "Zoom authorization failed.");
  }
  const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", { method: "POST", headers: { Authorization: `Bearer ${tokenBody.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ topic: input.topic, type: 2, start_time: input.startTime, duration: input.durationMinutes, timezone: "Asia/Kolkata", agenda: input.agenda || undefined, settings: { join_before_host: false, waiting_room: true } }) });
  const meetingBody = await meetingResponse.json() as ZoomMeeting & { message?: string; code?: number };
  if (!meetingResponse.ok || !meetingBody.join_url || !meetingBody.id) {
    console.error(`[Zoom] Meeting creation failed: HTTP ${meetingResponse.status}`);
    throw new ZoomIntegrationError("ZOOM_MEETING_CREATION_FAILED", "Zoom meeting creation failed.");
  }
  return meetingBody;
}
