type ZoomMeeting = {
  id: number;
  uuid?: string;
  join_url: string;
  start_url?: string;
  password?: string;
};

function config() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  if (!clientId || !clientSecret || !accountId) throw new Error("Zoom OAuth is not configured. Set ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and ZOOM_ACCOUNT_ID.");
  return { clientId, clientSecret, accountId };
}

export async function createZoomInterviewMeeting(input: { topic: string; startTime: string; durationMinutes: number; agenda?: string }): Promise<ZoomMeeting> {
  const { clientId, clientSecret, accountId } = config();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
  const tokenBody = await tokenResponse.json() as { access_token?: string; error?: string; reason?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) throw new Error(`Zoom OAuth authorization failed: ${tokenBody.reason || tokenBody.error || "Unknown error"}`);
  const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", { method: "POST", headers: { Authorization: `Bearer ${tokenBody.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ topic: input.topic, type: 2, start_time: input.startTime, duration: input.durationMinutes, timezone: "Asia/Kolkata", agenda: input.agenda || undefined, settings: { join_before_host: false, waiting_room: true } }) });
  const meetingBody = await meetingResponse.json() as ZoomMeeting & { message?: string; code?: number };
  if (!meetingResponse.ok || !meetingBody.join_url || !meetingBody.id) throw new Error(`Zoom meeting creation failed: ${meetingBody.message || "Unknown error"}`);
  return meetingBody;
}
