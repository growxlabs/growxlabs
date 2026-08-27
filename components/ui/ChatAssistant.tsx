"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Session and History
  useEffect(() => {
    let sid = localStorage.getItem("growx_chat_sid");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("growx_chat_sid", sid);
    }
    setSessionId(sid);

    // Load History
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?session_id=${sid}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(m => ({ role: m.role, content: m.message })));
        } else {
          setMessages([{ role: "assistant", content: "Welcome to GrowxLabs. How can I assist with your software engineering or technical requirements today?" }]);
        }
      } catch (e) {
        setMessages([{ role: "assistant", content: "Welcome to GrowxLabs. How can I assist with your software engineering or technical requirements today?" }]);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const saveMessage = async (role: string, message: string) => {
    if (!sessionId) return;
    try {
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, role, message }),
      });
    } catch (e) { console.error("Auto-save failed:", e); }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const history = [...messages, { role: "user", content: userMessage } as Message];
    
    setInput("");
    setMessages(history);
    setIsLoading(true);

    // Save User Message to DB
    saveMessage("user", userMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await response.json();
      const botReply = data.message || "Connection error. Please retry.";
      
      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
      
      // Save AI Response to DB
      saveMessage("assistant", botReply);

    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Our strategy systems are currently high in demand. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-[95vw] md:w-[450px] h-[650px] glass rounded-[2.5rem] border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-card/[0.02] flex items-center justify-between shrink-0">
               <div className="flex items-center space-x-4">
                 <div className="h-10 w-10 rounded-2xl bg-card flex items-center justify-center">
                    <Bot className="text-black h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="text-white font-black text-lg tracking-tighter uppercase leading-none">Strategy Assistant</h3>
                   <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-2" />
                     Online & Secure
                   </span>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-all"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("max-w-[85%] p-6 rounded-[1.5rem] text-[15px] leading-relaxed shadow-xl", 
                    m.role === "user" ? "bg-white text-black font-bold rounded-tr-none" : "bg-white/[0.03] text-white/80 border border-white/5 rounded-tl-none font-normal"
                  )}>{m.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-card/5 p-5 rounded-2xl border border-white/5 flex space-x-2">
                     <span className="w-1.5 h-1.5 bg-card/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <span className="w-1.5 h-1.5 bg-card/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <span className="w-1.5 h-1.5 bg-card/40 rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-8 pt-0 shrink-0">
              <div className="relative">
                <input 
                  autoFocus value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our services..."
                  className="w-full h-16 bg-card/[0.03] border border-white/5 rounded-2xl pl-7 pr-16 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                />
                <button 
                  type="submit" disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-card text-black flex items-center justify-center hover:bg-neutral-200 transition-all disabled:opacity-50"
                ><Send size={18} /></button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-20 w-20 bg-card rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.15)] text-black relative group"
      >
        <div className="absolute inset-0 bg-card rounded-full animate-ping opacity-10" />
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </motion.button>
    </div>
  );
}
