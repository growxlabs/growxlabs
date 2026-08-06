"use client";

import { useEffect, useRef, useState } from "react";

type Props = { interviewId: string; externalJoinUrl?: string | null; enabled: boolean; onEvent?: (event: string) => void };

export default function ZoomEmbeddedMeeting({ interviewId, externalJoinUrl, enabled, onEvent }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const [state, setState] = useState("ready");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  useEffect(() => { const query = window.matchMedia("(max-width: 767px)"); const update = () => setMobile(query.matches); update(); query.addEventListener?.("change", update); return () => query.removeEventListener?.("change", update); }, []);
  const join = async () => {
    if (!enabled || mobile) { onEvent?.("zoom_external_fallback_used"); if (externalJoinUrl) window.open(externalJoinUrl, "_blank", "noopener,noreferrer"); return; }
    try {
      setState("authorizing"); onEvent?.("zoom_join_attempted");
      const response = await fetch(`/api/interviewer/interviews/${interviewId}/zoom-signature`, { method: "POST", cache: "no-store" });
      const credentials = await response.json();
      if (!response.ok) throw new Error(credentials.error || "Zoom access is not available.");
      const { default: ZoomMtgEmbedded } = await import("@zoom/meetingsdk/embedded");
      const client = ZoomMtgEmbedded.createClient(); clientRef.current = client;
      await client.init({ zoomAppRoot: rootRef.current, language: "en-US" });
      setState("joining");
      await client.join({ signature: credentials.signature, sdkKey: credentials.sdkKey, meetingNumber: credentials.meetingNumber, password: credentials.passcode, userName: credentials.userName, userEmail: credentials.userEmail });
      setState("connected"); onEvent?.("zoom_joined");
    } catch (joinError: any) { setState("failed"); setError(joinError?.message || "Unable to join Zoom."); onEvent?.("zoom_join_failed"); }
  };
  useEffect(() => { const timer = window.setInterval(async () => { if (state !== "connected") return; try { const response = await fetch(`/api/interviewer/interviews/${interviewId}`, { cache: "no-store" }); if (!response.ok) { try { clientRef.current?.leaveMeeting?.(); } catch {} setState("failed"); setError("Your interviewer access has expired or been revoked."); onEvent?.("zoom_access_expired"); } } catch {} }, 30000); return () => window.clearInterval(timer); }, [interviewId, state, onEvent]);
  useEffect(() => () => { try { clientRef.current?.leaveMeeting?.(); onEvent?.("zoom_left"); } catch {} }, [onEvent]);
  return <section className="space-y-3">{!mobile && <div ref={rootRef} className="min-h-[420px] overflow-hidden rounded-xl bg-slate-950" aria-live="polite" />}{state === "connected" ? <p className="text-sm text-emerald-700">Connected to Zoom.</p> : <button type="button" onClick={join} disabled={["authorizing", "joining"].includes(state)} className="min-h-11 rounded-xl bg-[#0075de] px-5 text-sm font-semibold text-white disabled:opacity-50">{state === "authorizing" ? "Checking access…" : state === "joining" ? "Joining…" : enabled && !mobile ? "Join embedded Zoom" : "Open Zoom meeting"}</button>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}</section>;
}
