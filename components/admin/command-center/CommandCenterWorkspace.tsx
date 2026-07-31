"use client";

import { Bell, Menu, PanelRight, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentPresence } from "./AgentPresence";
import { CommandComposer } from "./CommandComposer";
import { CommandSidebar } from "./CommandSidebar";
import { ContextFlyout } from "./ContextFlyout";
import { MessageThread } from "./MessageThread";
import type { ActivityItem, AgentState, CommandMessage, ComposerAttachment, ConversationSummary, FlyoutMode, ToolActivity } from "./command-center.types";
import { consumeSSEChunk, record, safeString } from "./sse";

export function CommandCenterWorkspace() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState("new");
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [agentSummary, setAgentSummary] = useState("Ready for an instruction");
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [flyout, setFlyout] = useState(false);
  const [flyoutMode, setFlyoutMode] = useState<FlyoutMode>("activity");
  const [unread, setUnread] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<{ text: string; attachments: ComposerAttachment[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeRunRef = useRef<string | null>(null);

  const closeFlyout = useCallback(() => setFlyout(false), []);

  // Load persistent conversations from server + localStorage
  const loadConversations = useCallback(async () => {
    let localItems: ConversationSummary[] = [];
    try {
      const saved = localStorage.getItem("gxl_cc_conversations");
      if (saved) localItems = JSON.parse(saved);
    } catch (_e) {}

    try {
      const response = await fetch("/api/admin/command-center?limit=40", { cache: "no-store" });
      if (response.ok) {
        const payload = record(await response.json());
        if (Array.isArray(payload.conversations)) {
          const serverItems = payload.conversations.map(toConversation).filter((item): item is ConversationSummary => item !== null);
          const merged = [...serverItems];
          localItems.forEach((loc) => {
            if (!merged.some((m) => m.id === loc.id)) {
              merged.push(loc);
            }
          });
          setConversations(merged);
          try { localStorage.setItem("gxl_cc_conversations", JSON.stringify(merged)); } catch (_e) {}
          return;
        }
      }
    } catch (_e) {}

    if (localItems.length > 0) {
      setConversations(localItems);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    void fetch("/api/admin/command-center/notifications", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = record(await response.json());
        const values: unknown[] = Array.isArray(payload.notifications) ? payload.notifications : [];
        setUnread(values.filter((value) => record(value).status === "unread").length);
      })
      .catch(() => undefined);
  }, []);

  // Load persistent messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (conversationId === "new") {
      setMessages([]);
      return;
    }

    let localMsgs: CommandMessage[] = [];
    try {
      const saved = localStorage.getItem(`gxl_cc_msgs_${conversationId}`);
      if (saved) localMsgs = JSON.parse(saved);
    } catch (_e) {}

    try {
      const response = await fetch(`/api/admin/command-center?conversationId=${encodeURIComponent(conversationId)}`, { cache: "no-store" });
      if (response.ok) {
        const payload = record(await response.json());
        if (Array.isArray(payload.messages) && payload.messages.length > 0) {
          const serverMsgs = payload.messages.map((value) => toMessage(value, conversationId)).filter((item): item is CommandMessage => item !== null);
          setMessages(serverMsgs);
          try { localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(serverMsgs)); } catch (_e) {}
          return;
        }
      }
    } catch (_e) {}

    if (localMsgs.length > 0) {
      setMessages(localMsgs);
    } else {
      setMessages([]);
    }
  }, []);

  useEffect(() => { void loadMessages(activeId); }, [activeId, loadMessages]);

  const activeTitle = useMemo(() => conversations.find((item) => item.id === activeId)?.title ?? "New conversation", [activeId, conversations]);

  async function submit(text: string, attachments: ComposerAttachment[]) {
    if (busy) return;
    setLastSubmission({ text, attachments });
    setBusy(true); setAgentState("thinking"); setAgentSummary("Planning");
    const conversationId = activeId === "new" ? crypto.randomUUID() : activeId;

    const summary: ConversationSummary = {
      id: conversationId,
      title: text.slice(0, 50) || attachments[0]?.name || "New conversation",
      createdAt: new Date().toISOString()
    };

    setConversations((items) => {
      const filtered = items.filter((i) => i.id !== conversationId);
      const updated = [summary, ...filtered];
      try { localStorage.setItem("gxl_cc_conversations", JSON.stringify(updated)); } catch (_e) {}
      return updated;
    });

    if (activeId === "new") {
      setActiveId(conversationId);
    }

    const userMessage: CommandMessage = { id: crypto.randomUUID(), conversationId, sender: "user", text, timestamp: new Date().toISOString() };
    const agentMessageId = crypto.randomUUID();
    const agentMessage: CommandMessage = { id: agentMessageId, conversationId, sender: "gxl", text: "", timestamp: new Date().toISOString(), toolCalls: [] };
    
    const prior = messages;
    const initialMsgs = [...prior, userMessage, agentMessage];
    setMessages(initialMsgs);
    try { localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(initialMsgs)); } catch (_e) {}

    addActivity("Planning", "thinking", "Selecting an authorised agent, capability, and safe execution path.");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/admin/command-center", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": userMessage.id },
        body: JSON.stringify({
          message: text,
          conversationId,
          history: prior.map(({ id, sender, text: body, timestamp }) => ({ id, sender, text: body, timestamp })),
          attachments: attachments.map(({ name, type, base64 }) => ({ name, type, base64 })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("The Command Center is temporarily unavailable.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const { events, remainder } = consumeSSEChunk(buffer, chunk);
        buffer = remainder;
        events.forEach(({ event, data }) => handleSSEEvent(conversationId, agentMessageId, event, record(data)));
      }

      setAgentState("complete"); setAgentSummary("Completed");
    } catch (cause) {
      if (controller.signal.aborted) {
        setAgentState("idle"); setAgentSummary("Stopped");
      } else {
        setAgentState("failed"); setAgentSummary("Execution error");
        setMessages((items) =>
          items.map((item) =>
            item.id === agentMessageId
              ? { ...item, text: item.text || "Execution error encountered. Please try again.", kind: "error" }
              : item,
          ),
        );
      }
    } finally {
      setBusy(false); abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setBusy(false); setAgentState("idle"); setAgentSummary("Stopped");
  }

  function handleSSEEvent(conversationId: string, agentMessageId: string, event: string, value: Record<string, unknown>) {
    if (event === "text_delta") {
      const delta = safeString(value.text);
      setMessages((items) => {
        const updated = items.map((item) => item.id === agentMessageId ? { ...item, text: item.text + delta } : item);
        try { localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated)); } catch (_e) {}
        return updated;
      });
    } else if (event === "tool_call") {
      const name = safeString(value.name);
      const tool: ToolActivity = { id: crypto.randomUUID(), name, status: "calling", summary: safeToolLabel(name) };
      setMessages((items) => {
        const updated = items.map((item) => item.id === agentMessageId ? { ...item, toolCalls: [...(item.toolCalls ?? []), tool] } : item);
        try { localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated)); } catch (_e) {}
        return updated;
      });
      addActivity(safeToolLabel(name), "working", "Using an authorised tool. Sensitive inputs are hidden.");
    } else if (event === "tool_result") {
      const name = safeString(value.name);
      setMessages((items) => {
        const updated = items.map((item) => {
          if (item.id !== agentMessageId || !item.toolCalls) return item;
          return {
            ...item,
            toolCalls: item.toolCalls.map((tc) =>
              tc.name === name && tc.status === "calling" ? { ...tc, status: "complete" as const } : tc
            ),
          };
        });
        try { localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated)); } catch (_e) {}
        return updated;
      });
    } else if (event === "artifact_generating") {
      addActivity("Generating artifact", "working", safeString(value.name, "Preparing a downloadable file."));
    } else if (event === "artifact_ready") {
      addActivity("Artifact ready", "complete", safeString(value.name, "A signed download is available."));
      setFlyoutMode("artifacts");
    } else if (event === "artifact_failed") {
      addActivity("Artifact failed", "failed", "The file could not be generated safely.");
    } else if (event === "clarification_required") {
      setMessages((items) => items.map((item) => item.id === agentMessageId ? { ...item, kind: "clarification", text: safeString(value.message, item.text || "More information is required.") } : item));
      setAgentState("waiting"); setAgentSummary("Waiting for your answer");
    } else if (event === "notification_created") {
      setUnread((count) => count + 1);
    } else if (event === "run_status") {
      const status = safeString(value.status);
      if (status === "succeeded") { activeRunRef.current = null; setAgentState("complete"); setAgentSummary("Completed"); }
      else if (status === "failed" || status === "cancelled") { activeRunRef.current = null; setAgentState("failed"); setAgentSummary(status === "cancelled" ? "Cancelled" : "Needs attention"); }
      else { setAgentState("waiting"); setAgentSummary(status === "waiting" ? "Waiting" : "Executing"); }
      addActivity("Run status updated", status === "failed" || status === "cancelled" ? "failed" : status === "succeeded" ? "complete" : "working", status || "Execution details are available.");
    } else if (event === "run_created" || event === "plan_created" || event === "step_started") {
      addActivity(activityLabel(event), "working", safeString(value.title, safeString(value.status, "Execution details are available.")));
    } else if (event === "step_succeeded" || event === "done") {
      if (event === "step_succeeded") addActivity("Execution step completed", "complete");
    } else if (event === "step_failed" || event === "error") {
      addActivity("Execution needs attention", "failed", safeString(value.message, "A recoverable execution error occurred."));
    }
  }

  function addActivity(label: string, state: AgentState, detail?: string) {
    setActivity((items) => [...items.slice(-99), { id: crypto.randomUUID(), label, state, detail, timestamp: new Date().toISOString() }]);
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-white text-slate-900">
      <CommandSidebar
        open={sidebar}
        conversations={conversations}
        activeId={activeId}
        unread={unread}
        onClose={() => setSidebar(false)}
        onSelect={(id) => { setActiveId(id); setSidebar(false); }}
        onNew={() => { setActiveId("new"); setMessages([]); setActivity([]); setSidebar(false); }}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-3 sm:px-4">
          <button onClick={() => setSidebar(true)} className="grid size-9 place-items-center rounded-lg hover:bg-slate-100 md:hidden" aria-label="Open navigation"><Menu size={18} /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-slate-900">{activeTitle}</h1>
            <p className="truncate text-[10px] text-slate-400">Workspace defaults active</p>
          </div>
          <div className="hidden min-w-44 sm:block"><AgentPresence name="GXL Orchestrator" state={agentState} summary={agentSummary} /></div>
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Search conversation"><Search size={17} /></button>
          <button onClick={() => { setFlyoutMode("notifications"); setFlyout(true); }} className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Open notifications">
            <Bell size={17} />
            {unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />}
          </button>
          <button onClick={() => setFlyout((value) => !value)} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Toggle context panel"><PanelRight size={17} /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite"><MessageThread messages={messages} busy={busy} onSuggestion={(text) => void submit(text, [])} /></div>
        <CommandComposer busy={busy} canRetry={Boolean(lastSubmission)} onSubmit={submit} onStop={stop} onRetry={() => { if (lastSubmission) void submit(lastSubmission.text, lastSubmission.attachments); }} />
      </section>
      <ContextFlyout open={flyout} mode={flyoutMode} activity={activity} onClose={closeFlyout} onMode={setFlyoutMode} onUnreadChange={setUnread} />
    </div>
  );
}

function toConversation(value: unknown): ConversationSummary | null {
  const item = record(value);
  const id = safeString(item.id), title = safeString(item.title), createdAt = typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString();
  return id && title ? { id, title, createdAt } : null;
}

function toMessage(value: unknown, conversationId: string): CommandMessage | null {
  const item = record(value);
  const id = safeString(item.id), sender = item.sender;
  if (!id || (sender !== "user" && sender !== "gxl")) return null;
  return { id, conversationId, sender, text: safeString(item.text), timestamp: safeString(item.timestamp, new Date().toISOString()) };
}

function safeToolLabel(name: string) {
  const labels: Record<string, string> = { query_leads: "Looking up customer data", search_web: "Researching sources", generate_proposal: "Preparing proposal", get_company_stats: "Reviewing company metrics", get_admin_invoices: "Reviewing invoices" };
  return labels[name] ?? "Using authorised tool";
}

function activityLabel(event: string) {
  return event === "plan_created" ? "Plan prepared" : event === "run_created" ? "Execution started" : event === "step_started" ? "Execution step started" : "Run status updated";
}
