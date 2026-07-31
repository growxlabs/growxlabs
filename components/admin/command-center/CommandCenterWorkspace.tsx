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

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/command-center?limit=40", { cache: "no-store" });
      const payload = record(await response.json());
      if (!response.ok || !Array.isArray(payload.conversations)) return;
      setConversations(payload.conversations.map(toConversation).filter((item): item is ConversationSummary => item !== null));
    } catch {
      // The empty state remains usable when history is temporarily unavailable.
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

  const loadMessages = useCallback(async (conversationId: string) => {
    if (conversationId === "new") { setMessages([]); return; }
    try {
      const response = await fetch(`/api/admin/command-center?conversationId=${encodeURIComponent(conversationId)}`, { cache: "no-store" });
      const payload = record(await response.json());
      if (!response.ok || !Array.isArray(payload.messages)) throw new Error();
      setMessages(payload.messages.map((value) => toMessage(value, conversationId)).filter((item): item is CommandMessage => item !== null));
    } catch {
      setMessages([{ id: crypto.randomUUID(), conversationId, sender: "gxl", text: "This conversation could not be loaded. Try again.", timestamp: new Date().toISOString(), kind: "error" }]);
    }
  }, []);
  useEffect(() => { void loadMessages(activeId); }, [activeId, loadMessages]);

  const activeTitle = useMemo(() => conversations.find((item) => item.id === activeId)?.title ?? "New conversation", [activeId, conversations]);

  async function submit(text: string, attachments: ComposerAttachment[]) {
    if (busy) return;
    setLastSubmission({ text, attachments });
    setBusy(true); setAgentState("thinking"); setAgentSummary("Planning");
    const conversationId = activeId === "new" ? crypto.randomUUID() : activeId;
    if (activeId === "new") {
      const summary = { id: conversationId, title: text.slice(0, 54) || attachments[0]?.name || "New conversation", createdAt: new Date().toISOString() };
      setConversations((items) => [summary, ...items]);
      setActiveId(conversationId);
    }
    const userMessage: CommandMessage = { id: crypto.randomUUID(), conversationId, sender: "user", text, timestamp: new Date().toISOString() };
    const agentMessageId = crypto.randomUUID();
    const agentMessage: CommandMessage = { id: agentMessageId, conversationId, sender: "gxl", text: "", timestamp: new Date().toISOString(), toolCalls: [] };
    const prior = messages;
    setMessages((items) => [...items, userMessage, agentMessage]);
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
      let runId = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        const parsed = consumeSSEChunk(buffer, decoder.decode(chunk.value, { stream: true }));
        buffer = parsed.remainder;
        for (const event of parsed.events) {
          if (event.event === "run_created") {
            runId = safeString(record(event.data).runId);
            activeRunRef.current = runId || null;
          }
          applyEvent(event.event, event.data, agentMessageId, conversationId);
        }
      }
      if (runId && !controller.signal.aborted) await followRun(runId, controller.signal, agentMessageId, conversationId);
    } catch (cause) {
      if (controller.signal.aborted) {
        setMessages((items) => items.map((item) => item.id === agentMessageId ? { ...item, text: item.text || "Run cancelled by user.", kind: "error" } : item));
        addActivity("Run cancelled", "failed", "The active request was stopped. No new work will be submitted.");
      } else {
        const message = cause instanceof Error ? cause.message : "Connection failed.";
        setMessages((items) => items.map((item) => item.id === agentMessageId ? { ...item, text: message, kind: "error" } : item));
        addActivity("Request failed", "failed", message);
      }
      setAgentState("failed"); setAgentSummary("Needs attention");
    } finally {
      abortRef.current = null;
      setBusy(false);
      if (activeRunRef.current) {
        setAgentState("waiting");
        setAgentSummary("Run continues in background");
      } else {
        setAgentState((state) => state === "failed" || state === "blocked" ? state : "complete");
        setAgentSummary((summary) => summary === "Needs attention" || summary === "Waiting for approval" ? summary : "Completed");
      }
      void loadConversations();
    }
  }

  async function followRun(runId: string, signal: AbortSignal, messageId: string, conversationId: string) {
    const response = await fetch(`/api/admin/command-center/runs/${encodeURIComponent(runId)}/events`, { cache: "no-store", signal });
    if (!response.ok || !response.body) throw new Error("Live execution updates are unavailable.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const parsed = consumeSSEChunk(buffer, decoder.decode(chunk.value, { stream: true }));
      buffer = parsed.remainder;
      for (const event of parsed.events) applyEvent(event.event, event.data, messageId, conversationId);
    }
  }

  function stop() {
    const runId = activeRunRef.current;
    abortRef.current?.abort();
    if (runId) void fetch(`/api/admin/command-center/runs/${encodeURIComponent(runId)}/cancel`, { method: "POST" });
  }

  function applyEvent(event: string, data: unknown, messageId: string, conversationId: string) {
    const value = record(data);
    if (event === "text_delta") {
      const delta = safeString(value.text);
      setMessages((items) => items.map((item) => item.id === messageId ? { ...item, text: item.text + delta } : item));
      setAgentState("working"); setAgentSummary("Preparing response");
    } else if (event === "tool_call") {
      const name = safeString(value.name, "Authorised tool");
      const tool: ToolActivity = { id: crypto.randomUUID(), name, status: "calling", summary: safeToolLabel(name) };
      setMessages((items) => items.map((item) => item.id === messageId ? { ...item, toolCalls: [...(item.toolCalls ?? []), tool] } : item));
      addActivity(safeToolLabel(name), "working", "Using an authorised tool. Sensitive inputs are hidden.");
      setAgentState("working"); setAgentSummary(safeToolLabel(name));
    } else if (event === "tool_result") {
      const name = safeString(value.name);
      setMessages((items) => items.map((item) => item.id === messageId ? { ...item, toolCalls: (item.toolCalls ?? []).map((tool) => tool.name === name && tool.status === "calling" ? { ...tool, status: "complete" } : tool) } : item));
    } else if (event === "approval_required") {
      setMessages((items) => [...items, { id: crypto.randomUUID(), conversationId, sender: "gxl", text: safeString(value.safeSummary, "This operation is blocked until an eligible approver decides."), timestamp: new Date().toISOString(), kind: "approval" }]);
      setAgentState("blocked"); setAgentSummary("Waiting for approval"); setFlyoutMode("approvals"); setFlyout(true);
      addActivity("Waiting for approval", "blocked", "Execution is paused. Opening the request does not approve it.");
    } else if (event === "approval_resolved") {
      addActivity("Approval resolved", "complete", "The server validated the decision and resumed eligible work.");
      setAgentState("working"); setAgentSummary("Resuming execution");
    } else if (event === "artifact_generating") {
      addActivity("Generating artifact", "working", safeString(value.name, "Preparing a downloadable file."));
    } else if (event === "artifact_ready") {
      addActivity("Artifact ready", "complete", safeString(value.name, "A signed download is available."));
      setFlyoutMode("artifacts");
    } else if (event === "artifact_failed") {
      addActivity("Artifact failed", "failed", "The file could not be generated safely.");
    } else if (event === "clarification_required") {
      setMessages((items) => items.map((item) => item.id === messageId ? { ...item, kind: "clarification", text: safeString(value.message, item.text || "More information is required.") } : item));
      setAgentState("waiting"); setAgentSummary("Waiting for your answer");
    } else if (event === "notification_created") {
      setUnread((count) => count + 1);
    } else if (event === "run_status") {
      const status = safeString(value.status);
      if (status === "succeeded") { activeRunRef.current = null; setAgentState("complete"); setAgentSummary("Completed"); }
      else if (status === "failed" || status === "cancelled") { activeRunRef.current = null; setAgentState("failed"); setAgentSummary(status === "cancelled" ? "Cancelled" : "Needs attention"); }
      else { setAgentState(status === "waiting" ? "waiting" : "working"); setAgentSummary(status === "waiting" ? "Waiting" : "Executing"); }
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
      <CommandSidebar open={sidebar} conversations={conversations} activeId={activeId} unread={unread} onClose={() => setSidebar(false)} onSelect={(id) => { setActiveId(id); setSidebar(false); }} onNew={() => { setActiveId("new"); setMessages([]); setActivity([]); setSidebar(false); }} />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-3 sm:px-4">
          <button onClick={() => setSidebar(true)} className="grid size-9 place-items-center rounded-lg hover:bg-slate-100 md:hidden" aria-label="Open navigation"><Menu size={18} /></button>
          <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-semibold">{activeTitle}</h1><p className="truncate text-[10px] text-slate-400">Workspace defaults active</p></div>
          <div className="hidden min-w-44 sm:block"><AgentPresence name="GXL Orchestrator" state={agentState} summary={agentSummary} /></div>
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Search conversation"><Search size={17} /></button>
          <button onClick={() => { setFlyoutMode("notifications"); setFlyout(true); }} className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`${unread} unread notifications`}><Bell size={17} />{unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />}</button>
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
