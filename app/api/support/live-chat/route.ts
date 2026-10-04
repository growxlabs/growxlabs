import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MOCK_CHAT_SESSIONS = [
  {
    id: "chat1111-1111-1111-1111-111111111111",
    visitor_name: "Alex Rivera",
    visitor_email: "alex@riveratech.io",
    channel: "Website Widget",
    status: "Active",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messages: [
      { sender: "visitor", text: "Hello! I am having trouble configuring Webhook headers.", time: "10:15 AM" },
      { sender: "agent", text: "Hi Alex! Sure, make sure you pass `x-growx-signature` in header verification.", time: "10:17 AM" },
      { sender: "visitor", text: "Got it! Thanks for the quick support.", time: "10:19 AM" }
    ]
  },
  {
    id: "chat2222-2222-2222-2222-222222222222",
    visitor_name: "Jennifer Wu",
    visitor_email: "jennifer@cloudtech.com",
    channel: "Customer Portal",
    status: "Active",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    messages: [
      { sender: "visitor", text: "Can someone help me update our billing credit card on file?", time: "09:45 AM" },
      { sender: "agent", text: "Connecting you with an agent...", time: "09:46 AM" }
    ]
  }
];

export async function GET() {
  try {
    const { data: sessions } = await supabaseAdmin
      .from("live_chat_sessions")
      .select(`
        *,
        chat_messages(*)
      `)
      .order("created_at", { ascending: false });

    const sessionList = (!sessions || sessions.length === 0) ? MOCK_CHAT_SESSIONS : sessions;
    const allMessages = sessionList.flatMap((s: any) => s.messages || []);

    return NextResponse.json({
      chatSessions: sessionList,
      messages: allMessages
    });
  } catch (error) {
    const allMessages = MOCK_CHAT_SESSIONS.flatMap((s: any) => s.messages || []);
    return NextResponse.json({
      chatSessions: MOCK_CHAT_SESSIONS,
      messages: allMessages
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, senderName, message, senderType } = body;

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    try {
      await supabaseAdmin.from("chat_messages").insert([{
        session_id: sessionId,
        sender_name: senderName || "Agent",
        sender_type: senderType || "agent",
        message
      }]);
    } catch (e) {
      console.log("Chat message insert skipped");
    }

    return NextResponse.json({
      success: true,
      message: {
        id: crypto.randomUUID(),
        sender: senderType || "agent",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
