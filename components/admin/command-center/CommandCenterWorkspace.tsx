"use client";

import { 
  Bell, 
  ChevronDown, 
  PanelLeft, 
  PanelRight 
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentPresence } from "./AgentPresence";
import { CommandComposer } from "./CommandComposer";
import { CommandSidebar } from "./CommandSidebar";
import { ContextFlyout } from "./ContextFlyout";
import { MessageThread } from "./MessageThread";
import type { 
  ActivityItem, 
  AgentState, 
  CommandMessage, 
  ComposerAttachment, 
  ConversationSummary, 
  FlyoutMode, 
  ToolActivity 
} from "./command-center.types";
import { consumeSSEChunk, record, safeString } from "./sse";
import { cn } from "@/lib/utils";

export function CommandCenterWorkspace() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState("new");
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [agentSummary, setAgentSummary] = useState("Ready for instruction");
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [flyout, setFlyout] = useState(false);
  const [flyoutMode, setFlyoutMode] = useState<FlyoutMode>("activity");
  const [unread, setUnread] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<{ text: string; attachments: ComposerAttachment[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const closeFlyout = useCallback(() => setFlyout(false), []);

  // Load persistent conversations from server + localStorage
  const loadConversations = useCallback(async () => {
    let localItems: ConversationSummary[] = [];
    try {
      const saved = localStorage.getItem("gxl_cc_conversations_v4");
      if (saved) localItems = JSON.parse(saved);
    } catch (_e) {}

    try {
      const response = await fetch("/api/admin/command-center?limit=40", { cache: "no-store" });
      if (response.ok) {
        const payload = record(await response.json());
        if (Array.isArray(payload.conversations)) {
          const serverItems = payload.conversations.map((c: any) => ({
            id: String(c.id),
            title: String(c.title || "Conversation"),
            createdAt: String(c.created_at || new Date().toISOString()),
          }));
          const merged = [...serverItems];
          localItems.forEach((loc) => {
            if (!merged.some((m) => m.id === loc.id)) {
              merged.push(loc);
            }
          });
          setConversations(merged);
          try {
            localStorage.setItem("gxl_cc_conversations_v4", JSON.stringify(merged));
          } catch (_e) {}
          return;
        }
      }
    } catch (_e) {}

    if (localItems.length > 0) {
      setConversations(localItems);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

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

    if (localMsgs.length > 0) {
      setMessages(localMsgs);
    } else {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  const activeTitle = useMemo(() => {
    if (activeId === "new") return "New conversation";
    const found = conversations.find((c) => c.id === activeId);
    return found ? found.title : "Discussion";
  }, [activeId, conversations]);

  // REAL AGENT ORCHESTRATION SUBMISSION
  const submit = useCallback(
    async (text: string, attachments: ComposerAttachment[]) => {
      if (!text && attachments.length === 0) return;

      setLastSubmission({ text, attachments });

      let currentConversationId = activeId;
      if (currentConversationId === "new") {
        currentConversationId = `c_${Date.now()}`;
        setActiveId(currentConversationId);

        const title = text.slice(0, 45) || "New Conversation";
        const newSummary: ConversationSummary = {
          id: currentConversationId,
          title,
          createdAt: new Date().toISOString(),
        };
        setConversations((prev) => [newSummary, ...prev]);
        try {
          const existing = JSON.parse(localStorage.getItem("gxl_cc_conversations_v4") || "[]");
          localStorage.setItem(
            "gxl_cc_conversations_v4",
            JSON.stringify([newSummary, ...existing])
          );
        } catch (_e) {}
      }

      const userMessage: CommandMessage = {
        id: crypto.randomUUID(),
        conversationId: currentConversationId,
        sender: "user",
        text,
        timestamp: new Date().toISOString(),
      };

      const agentMessageId = crypto.randomUUID();
      const agentPlaceholder: CommandMessage = {
        id: agentMessageId,
        conversationId: currentConversationId,
        sender: "gxl",
        text: "",
        timestamp: new Date().toISOString(),
        toolCalls: [],
      };

      setMessages((prev) => {
        const next = [...prev, userMessage, agentPlaceholder];
        try {
          localStorage.setItem(`gxl_cc_msgs_${currentConversationId}`, JSON.stringify(next));
        } catch (_e) {}
        return next;
      });

      setBusy(true);
      setAgentState("working");
      setAgentSummary("Analyzing intent & tools...");

      abortRef.current = new AbortController();
      const idempotencyKey = `gxl-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      try {
        const response = await fetch("/api/admin/command-center", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "idempotency-key": idempotencyKey,
          },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            conversationId: currentConversationId,
            message: text,
            attachments: attachments.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              base64: a.base64,
              size: a.size,
            })),
          }),
        });

        if (!response.ok || !response.body) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || `Server returned HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const parsed = consumeSSEChunk(buffer, chunk);
          buffer = parsed.remainder;

          for (const item of parsed.events) {
            handleSSEEvent(currentConversationId, agentMessageId, item.event, record(item.data));
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          const errorMsg = err.message || "Failed to execute workflow. Please retry.";
          setMessages((items) =>
            items.map((m) =>
              m.id === agentMessageId
                ? {
                    ...m,
                    kind: "error",
                    text: m.text || errorMsg,
                  }
                : m
            )
          );
          setAgentState("failed");
          setAgentSummary("Action interrupted");
        }
      } finally {
        setBusy(false);
        setAgentState("idle");
        setAgentSummary("Ready for instruction");
        abortRef.current = null;
      }
    },
    [activeId]
  );

  function stop() {
    if (abortRef.current) {
      abortRef.current.abort();
      setBusy(false);
      setAgentState("idle");
      setAgentSummary("Stopped by user");
    }
  }

  function retry() {
    if (lastSubmission) {
      void submit(lastSubmission.text, lastSubmission.attachments);
    }
  }

  function handleSSEEvent(
    conversationId: string,
    agentMessageId: string,
    event: string,
    value: Record<string, unknown>
  ) {
    if (event === "text_delta") {
      const delta = safeString(value.text);
      setMessages((items) => {
        const updated = items.map((item) =>
          item.id === agentMessageId ? { ...item, text: item.text + delta } : item
        );
        try {
          localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated));
        } catch (_e) {}
        return updated;
      });
    } else if (event === "tool_call") {
      const name = safeString(value.name);
      const tool: ToolActivity = {
        id: crypto.randomUUID(),
        name,
        status: "calling",
        summary: safeToolLabel(name),
        args: (value.args as any) || undefined,
      };
      setMessages((items) => {
        const updated = items.map((item) =>
          item.id === agentMessageId
            ? { ...item, toolCalls: [...(item.toolCalls ?? []), tool] }
            : item
        );
        try {
          localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated));
        } catch (_e) {}
        return updated;
      });
      setAgentSummary(`Executing ${name}...`);
      addActivity(safeToolLabel(name), "working", "Running authorized tool");
    } else if (event === "tool_result") {
      const name = safeString(value.name);
      setMessages((items) => {
        const updated = items.map((item) => {
          if (item.id !== agentMessageId || !item.toolCalls) return item;
          return {
            ...item,
            toolCalls: item.toolCalls.map((tc) =>
              tc.name === name && tc.status === "calling"
                ? { ...tc, status: "complete" as const, result: value.result || undefined }
                : tc
            ),
          };
        });
        try {
          localStorage.setItem(`gxl_cc_msgs_${conversationId}`, JSON.stringify(updated));
        } catch (_e) {}
        return updated;
      });
      addActivity(safeToolLabel(name), "complete", "Tool action completed");
    } else if (event === "error") {
      const errorMsg = safeString(value.message) || "Execution encountered an error.";
      setMessages((items) =>
        items.map((item) =>
          item.id === agentMessageId ? { ...item, text: item.text || errorMsg, kind: "error" } : item
        )
      );
    } else if (event === "notification_created") {
      setUnread((c) => c + 1);
    }
  }

  function addActivity(label: string, state: AgentState, detail?: string) {
    setActivity((items) => [
      ...items.slice(-99),
      { id: crypto.randomUUID(), label, state, detail, timestamp: new Date().toISOString() },
    ]);
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#141416] text-[#f4f4f5] select-none font-sans">
      
      {/* 1. GROWX LABS SIDEBAR */}
      <CommandSidebar
        open={sidebar}
        conversations={conversations}
        activeId={activeId}
        unread={unread}
        onClose={() => setSidebar(false)}
        onSelect={(id) => {
          setActiveId(id);
          if (window.innerWidth < 768) setSidebar(false);
        }}
        onNew={() => {
          setActiveId("new");
          setMessages([]);
          setActivity([]);
          if (window.innerWidth < 768) setSidebar(false);
        }}
      />

      {/* 2. MAIN CONVERSATION CANVAS */}
      <section className="flex min-w-0 flex-1 flex-col bg-[#141416] relative overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#27272a] px-3 sm:px-4 bg-[#141416]">
          
          {/* Left: Sidebar toggle & Conversation dropdown */}
          <div className="flex items-center gap-2 min-w-0">
            {!sidebar && (
              <button
                onClick={() => setSidebar(true)}
                className="size-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft size={16} />
              </button>
            )}

            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-left text-xs font-semibold text-white transition-colors cursor-pointer truncate max-w-[260px] sm:max-w-md"
            >
              <span className="truncate">{activeTitle}</span>
              <ChevronDown size={14} className="text-zinc-500 shrink-0" />
            </button>
          </div>

          {/* Right: Agent presence pill, notification bell, timeline toggle */}
          <div className="flex items-center gap-2">
            
            {/* Agent Status Presence Pill */}
            <div className="hidden sm:block">
              <AgentPresence
                name="GXL Orchestrator"
                state={agentState}
                summary={agentSummary}
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => {
                setFlyoutMode("notifications");
                setFlyout(true);
              }}
              className="relative size-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={15} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
              )}
            </button>

            {/* Timeline Drawer Toggle */}
            <button
              onClick={() => setFlyout(!flyout)}
              className={cn(
                "size-8 rounded-lg border transition-colors flex items-center justify-center cursor-pointer",
                flyout
                  ? "bg-white/10 text-white border-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 border-white/10"
              )}
              title="Toggle Timeline & Artifacts"
            >
              <PanelRight size={15} />
            </button>
          </div>

        </header>

        {/* Scrollable Conversation Thread */}
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar" aria-live="polite">
          <MessageThread
            messages={messages}
            busy={busy}
            onSuggestion={(text) => void submit(text, [])}
            onRetry={retry}
          />
        </div>

        {/* Floating Capsule Composer */}
        <CommandComposer
          busy={busy}
          canRetry={Boolean(lastSubmission)}
          onSubmit={submit}
          onStop={stop}
          onRetry={retry}
        />

      </section>

      {/* 3. CONTEXT & TIMELINE DRAWER */}
      {flyout && (
        <ContextFlyout
          open={flyout}
          mode={flyoutMode}
          activity={activity}
          onClose={closeFlyout}
          onMode={setFlyoutMode}
          onUnreadChange={setUnread}
        />
      )}

    </div>
  );
}

function safeToolLabel(name: string): string {
  const map: Record<string, string> = {
    get_company_stats: "Database Lead Statistics",
    search_leads: "Lead Search Pipeline",
    search: "Web Research",
    terminal: "Terminal Execution",
    sql: "Database Query",
  };
  return map[name] || `Tool: ${name}`;
}
