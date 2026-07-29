"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Paperclip, Terminal, Cpu, User, Briefcase, FileText,
  BarChart3, PenTool, Download, Command, X,
  PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Plus, MessageSquare, Loader2,
  ArrowUp, ChevronDown, Check, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { ToolCallWidget, ToolCall } from "./ToolCallWidget";
import { SubagentCard, Subagent } from "./SubagentCard";
import { AppShell } from "./primitives/AppShell";
import { Workspace } from "./primitives/Workspace";
import { Header } from "./primitives/Header";
import { Badge } from "./primitives/Badge";

/* ──────── Auto-resize textarea hook ──────── */
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (reset) { ta.style.height = `${minHeight}px`; return; }
      ta.style.height = `${minHeight}px`;
      ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity))}px`;
    },
    [minHeight, maxHeight],
  );
  useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`; }, [minHeight]);
  useEffect(() => { const h = () => adjustHeight(); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface Message {
  id: string;
  sender: "user" | "gxl";
  text: string;
  timestamp: string;
  activeAgents?: string[];
  activityLogs?: string[];
  proposal?: { clientName: string; budget: string; timeline: string; deliverables: string[]; status: string };
  chart?: { month: string; revenue: number }[];
  toolCalls?: ToolCall[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const DEFAULT_CONVO: Conversation = {
  id: "default",
  title: "New conversation",
  messages: [],
  createdAt: new Date(0)
};

export function CommandCenterWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string>("default");
  const [activePersonaFilter, setActivePersonaFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; base64: string }[]>([]);
  const [subagents, setSubagents] = useState<Subagent[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 44, maxHeight: 180 });

  const activeConvo = conversations.find(c => c.id === activeConvoId) || {
    ...DEFAULT_CONVO,
    id: activeConvoId
  };

  useEffect(() => {
    async function fetchConvos() {
      try {
        const res = await fetch("/api/admin/command-center");
        const json = await res.json();
        if (json.success && json.conversations) {
          const mapped = json.conversations.map((c: any) => ({
            id: c.id,
            title: c.title,
            messages: [],
            createdAt: new Date(c.createdAt)
          }));
          setConversations(mapped);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }
    fetchConvos();
  }, []);

  useEffect(() => {
    if (!activeConvoId || activeConvoId === "default") return;
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/admin/command-center?conversationId=${activeConvoId}`);
        const json = await res.json();
        if (json.success && json.messages) {
          setConversations(prev => prev.map(c => {
            if (c.id === activeConvoId) {
              return { ...c, messages: json.messages };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    fetchMessages();
  }, [activeConvoId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo.messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && attachments.length === 0) return;
    if (isProcessing) return;

    const userMsgId = "user_" + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    let targetConvoId = activeConvoId;
    if (targetConvoId === "default") {
      targetConvoId = "convo_" + Date.now();
      const newConvo: Conversation = {
        id: targetConvoId,
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: [userMsg],
        createdAt: new Date()
      };
      setConversations(prev => [newConvo, ...prev]);
      setActiveConvoId(targetConvoId);
    } else {
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvoId) {
          return { ...c, messages: [...c.messages, userMsg] };
        }
        return c;
      }));
    }

    setInputText("");
    adjustHeight(true);
    const sentAttachments = [...attachments];
    setAttachments([]);
    setIsProcessing(true);

    const gxlMsgId = "gxl_" + Date.now();
    const initialGxlMsg: Message = {
      id: gxlMsgId,
      sender: "gxl",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      toolCalls: []
    };

    setConversations(prev => prev.map(c => {
      if (c.id === targetConvoId) {
        return { ...c, messages: [...c.messages, initialGxlMsg] };
      }
      return c;
    }));

    try {
      const response = await fetch("/api/admin/command-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: targetConvoId,
          history: activeConvo.messages,
          attachments: sentAttachments
        })
      });

      if (!response.body) throw new Error("No response body stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventLine = block.split("\n").find(l => l.startsWith("event:"));
          const dataLine = block.split("\n").find(l => l.startsWith("data:"));

          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event:", "").trim();
          const dataJson = JSON.parse(dataLine.replace("data:", "").trim());

          setConversations(prev => prev.map(c => {
            if (c.id !== targetConvoId) return c;
            const updatedMsgs = c.messages.map(m => {
              if (m.id !== gxlMsgId) return m;

              if (event === "text_delta") {
                return { ...m, text: m.text + dataJson.text };
              }
              if (event === "tool_call") {
                const existingCalls = m.toolCalls || [];
                const newCall: ToolCall = {
                  id: dataJson.name + "-" + Date.now(),
                  name: dataJson.name,
                  args: dataJson.args,
                  status: "calling"
                };
                return { ...m, toolCalls: [...existingCalls, newCall] };
              }
              if (event === "tool_result") {
                const existingCalls = m.toolCalls || [];
                const updatedCalls = existingCalls.map(tc => {
                  if (tc.name === dataJson.name && tc.status === "calling") {
                    return { ...tc, status: "complete" as const, result: dataJson.result };
                  }
                  return tc;
                });
                return { ...m, toolCalls: updatedCalls };
              }
              if (event === "proposal") {
                return { ...m, proposal: dataJson };
              }
              if (event === "chart") {
                return { ...m, chart: dataJson };
              }
              if (event === "subagent_created") {
                setSubagents(prevSub => [...prevSub, dataJson]);
              }
              return m;
            });
            return { ...c, messages: updatedMsgs };
          }));
        }
      }
    } catch (err: any) {
      console.error("Stream execution error:", err);
      setConversations(prev => prev.map(c => {
        if (c.id !== targetConvoId) return c;
        return {
          ...c,
          messages: c.messages.map(m => m.id === gxlMsgId ? { ...m, text: m.text + "\n\n[System Error: Connection failed]" } : m)
        };
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type,
            base64: evt.target?.result as string
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <AppShell>
      <Header
        title="GXL Command Center"
        subtitle="AI-Native Operating System"
        leftActions={
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        }
        rightActions={
          <>
            <Badge variant="blue">Engine Active</Badge>
            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 transition-colors"
            >
              {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </button>
          </>
        }
      />

      <Workspace>
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-[#e6e6e6] bg-[#fafafa] flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-[#e6e6e6]">
                <button
                  onClick={() => setActiveConvoId("default")}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#e6e6e6] bg-white text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#0075de]" />
                  <span>New Conversation</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <p className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Recent Sessions
                </p>
                {conversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvoId(c.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 truncate",
                      activeConvoId === c.id ? "bg-[#0075de]/10 text-[#0075de] font-semibold" : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Central Chat & Artifact Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
            {activeConvo.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-12 h-12 rounded-2xl bg-[#0075de]/10 flex items-center justify-center text-[#0075de]">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{getGreeting()}, Team GrowX</h2>
                  <p className="text-xs text-neutral-500 max-w-md mt-1 font-mono">
                    Your Central AI Orchestrator is online. Ask questions, generate SOW client proposals, inspect leads, or search live web data.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-4">
                  {[
                    "Get total lead stats and recent leads summary",
                    "Create a growth proposal for ABC Hospital",
                    "List all registered client agreements & invoices",
                    "Search latest news on AI automation tools"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs p-3 rounded-xl border border-[#e6e6e6] bg-[#fafafa] hover:bg-neutral-100 text-neutral-700 transition-colors font-medium"
                    >
                      → {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConvo.messages.map(msg => (
                <div key={msg.id} className={cn("flex flex-col gap-1.5", msg.sender === "user" ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                      {msg.sender === "user" ? "You" : "GXL Orchestrator"}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-300">{msg.timestamp}</span>
                  </div>

                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-sans",
                    msg.sender === "user"
                      ? "bg-[#0075de] text-white rounded-tr-none shadow-sm"
                      : "bg-[#f6f5f4] text-neutral-800 rounded-tl-none border border-[#e6e6e6]"
                  )}>
                    {msg.text || (isProcessing && msg.sender === "gxl" ? "Processing response..." : "")}
                  </div>

                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="w-full max-w-[85%]">
                      <ToolCallWidget toolCalls={msg.toolCalls} />
                    </div>
                  )}

                  {msg.proposal && (
                    <div className="w-full max-w-[85%] my-2 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-800 uppercase tracking-wider">
                          Scope of Work Proposal
                        </span>
                        <Badge variant="emerald">SOW Generated</Badge>
                      </div>
                      <p className="text-sm font-bold text-neutral-900">{msg.proposal.clientName}</p>
                      <p className="text-xs text-neutral-600 font-mono">Budget: {msg.proposal.budget}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-[#e6e6e6] p-4 bg-white shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              {attachments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-mono text-neutral-700 border border-neutral-200">
                      <Paperclip className="w-3 h-3 text-neutral-500" />
                      <span className="truncate max-w-[140px]">{att.name}</span>
                      <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-neutral-700">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 p-2 rounded-2xl border border-[#e6e6e6] bg-[#fafafa] focus-within:border-[#0075de] focus-within:ring-1 focus-within:ring-[#0075de] transition-all shadow-sm">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); adjustHeight(); }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask GXL Central Orchestrator or run tools..."
                  className="flex-1 bg-transparent border-0 resize-none text-sm text-neutral-900 focus:outline-none focus:ring-0 min-h-[44px] py-2.5 px-1 font-sans"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || (!inputText.trim() && attachments.length === 0)}
                  className="p-2.5 rounded-xl bg-[#0075de] text-white hover:bg-[#0060b8] disabled:opacity-40 disabled:hover:bg-[#0075de] transition-colors shadow-sm"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4 font-bold" />}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Inspector Panel */}
        <AnimatePresence initial={false}>
          {inspectorOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-[#e6e6e6] bg-[#fafafa] flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-4 border-b border-[#e6e6e6]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">Agent Environment</h3>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
                <div className="p-3 bg-white border border-[#e6e6e6] rounded-xl space-y-2">
                  <p className="font-bold text-neutral-800">Central Orchestrator</p>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Active tools: 17 connected database and API executors.
                  </p>
                </div>

                {subagents.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Subagents ({subagents.length})</p>
                    {subagents.map(sa => (
                      <SubagentCard key={sa.id} agent={sa} />
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </Workspace>
    </AppShell>
  );
}
