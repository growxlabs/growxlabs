import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SUPPORTED_EVENTS = new Set(["meeting.started", "meeting.ended", "meeting.participant_joined", "meeting.participant_left"]);
const REPLAY_WINDOW_SECONDS = 5 * 60;

function secret() {
  return process.env.ZOOM_WEBHOOK_SECRET || "";
}

function timingSafeEqualHex(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function eventIdentifier(payload: Record<string, unknown>, eventType: string, meetingId: string) {
  const eventId = typeof payload.id === "string" ? payload.id : typeof payload.event_ts === "number" ? String(payload.event_ts) : "";
  return eventId ? `zoom:${eventId}` : `zoom:${eventType}:${meetingId}:${String(payload.event_ts || "unknown")}`;
}

export async function POST(request: Request) {
  const webhookSecret = secret();
  if (!webhookSecret) return NextResponse.json({ error: "Zoom webhook is not configured." }, { status: 503 });
  const rawBody = await request.text();
  let payload: Record<string, any>;
  try { payload = JSON.parse(rawBody) as Record<string, any>; } catch { return NextResponse.json({ error: "Malformed webhook payload." }, { status: 400 }); }

  if (payload.event === "endpoint.url_validation") {
    const plainToken = typeof payload.payload?.plainToken === "string" ? payload.payload.plainToken : "";
    if (!plainToken) return NextResponse.json({ error: "Missing validation token." }, { status: 400 });
    const encryptedToken = crypto.createHmac("sha256", webhookSecret).update(plainToken).digest("hex");
    return NextResponse.json({ plainToken, encryptedToken });
  }

  const timestamp = request.headers.get("x-zm-request-timestamp") || "";
  const receivedSignature = request.headers.get("x-zm-signature") || "";
  const timestampNumber = Number(timestamp);
  if (!/^\d+$/.test(timestamp) || !Number.isFinite(timestampNumber) || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > REPLAY_WINDOW_SECONDS) return NextResponse.json({ error: "Webhook timestamp is invalid or expired." }, { status: 401 });
  const expectedDigest = crypto.createHmac("sha256", webhookSecret).update(`v0:${timestamp}:${rawBody}`).digest("hex");
  if (!receivedSignature.startsWith("v0=") || !timingSafeEqualHex(receivedSignature.slice(3), expectedDigest)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });

  const eventType = typeof payload.event === "string" ? payload.event : "unknown";
  const meetingObject = payload.payload?.object || {};
  const meetingId = meetingObject.id ? String(meetingObject.id) : "";
  const meetingUuid = typeof meetingObject.uuid === "string" ? meetingObject.uuid : "";
  const identifier = eventIdentifier(payload, eventType, meetingId || meetingUuid);
  const { data: received, error: receiptError } = await supabaseAdmin.schema("recruitment").from("zoom_webhook_events").insert({ event_identifier: identifier, event_type: eventType, meeting_id: meetingId || meetingUuid || null, payload_metadata: { eventTs: payload.event_ts || null } }).select("id").maybeSingle();
  if (receiptError && !String(receiptError.message).toLowerCase().includes("duplicate")) return NextResponse.json({ error: "Unable to record webhook receipt." }, { status: 500 });
  if (!received) return NextResponse.json({ received: true, duplicate: true });
  if (!SUPPORTED_EVENTS.has(eventType)) {
    await supabaseAdmin.schema("recruitment").from("zoom_webhook_events").update({ processed_at: new Date().toISOString(), status: "ignored" }).eq("id", received.id);
    return NextResponse.json({ received: true, ignored: true });
  }

  let interviewQuery = supabaseAdmin.schema("recruitment").from("interviews").select("id,provider_metadata,zoom_meeting_id,zoom_meeting_uuid").eq("meeting_provider", "zoom");
  interviewQuery = meetingUuid ? interviewQuery.or(`zoom_meeting_id.eq.${meetingId},zoom_meeting_uuid.eq.${meetingUuid}`) : interviewQuery.eq("zoom_meeting_id", meetingId);
  const { data: interview } = await interviewQuery.maybeSingle();
  if (!interview) {
    await supabaseAdmin.schema("recruitment").from("zoom_webhook_events").update({ processed_at: new Date().toISOString(), status: "unmatched" }).eq("id", received.id);
    return NextResponse.json({ received: true, matched: false });
  }

  const now = new Date().toISOString();
  const eventMap: Record<string, { audit: string; runtime: string }> = {
    "meeting.started": { audit: "zoom_meeting_started", runtime: "started" },
    "meeting.ended": { audit: "zoom_meeting_ended", runtime: "ended" },
    "meeting.participant_joined": { audit: "zoom_participant_joined", runtime: "participant_joined" },
    "meeting.participant_left": { audit: "zoom_participant_left", runtime: "participant_left" },
  };
  const mapped = eventMap[eventType];
  const metadata = { provider: "zoom", eventType, eventIdentifier: identifier, meetingId: meetingId || null, meetingUuid: meetingUuid || null, eventTs: payload.event_ts || null, participant: meetingObject.participant ? { userId: meetingObject.participant.user_id || null, userName: meetingObject.participant.user_name || null, email: meetingObject.participant.email || null } : null };
  await supabaseAdmin.schema("recruitment").from("interviews").update({ provider_metadata: { ...(interview.provider_metadata || {}), zoomRuntimeStatus: mapped.runtime, [`${mapped.runtime}At`]: now } }).eq("id", interview.id);
  await supabaseAdmin.schema("recruitment").from("interview_configuration_events").insert({ interview_id: interview.id, event_type: mapped.audit, metadata }).then(() => undefined, () => undefined);
  await supabaseAdmin.schema("recruitment").from("zoom_webhook_events").update({ processed_at: now, status: "processed" }).eq("id", received.id);
  return NextResponse.json({ received: true, matched: true });
}
