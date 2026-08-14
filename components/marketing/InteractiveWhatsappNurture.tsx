"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  MessageCircle, 
  Send, 
  Smartphone, 
  Inbox, 
  HelpCircle, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Mail, 
  BellRing, 
  Users,
  Play,
  RotateCcw,
  Activity,
  Terminal,
  ArrowRight
} from "lucide-react";

interface NodeDetail {
  title: string;
  category: string;
  description: string;
  metrics: string;
}

const nodeDetails: Record<string, NodeDetail> = {
  website_chat: {
    title: "Website Live Chat Widget",
    category: "Messaging Input Channel",
    description: "Inbound query initiated via custom desktop or mobile web chat widgets. Instantly parsed for execution routing.",
    metrics: "Volume: ~240/day // Hook latency: 12ms"
  },
  whatsapp: {
    title: "Official WhatsApp Cloud API",
    category: "Messaging Input Channel",
    description: "Meta business gateway boasting an average 98% open rate. Dispatches rich templates, interactive media, and buttons.",
    metrics: "Volume: ~1,450/day // Delivery success: 99.9%"
  },
  messenger: {
    title: "Facebook Messenger Webhook",
    category: "Messaging Input Channel",
    description: "Direct direct social platform integration feeding page inquiries straight into central workspace registers.",
    metrics: "Volume: ~180/day // Sync rate: Real-time"
  },
  sms: {
    title: "Cellular SMS Fallback Gateway",
    category: "Messaging Input Channel",
    description: "Traditional mobile carrier SMS pipeline to ensure reachability in areas without active data coverage.",
    metrics: "Volume: ~65/day // SLA delivery: 100%"
  },
  agent_inbox: {
    title: "Real-Time Agent Inbox Registry",
    category: "Central Communication Core",
    description: "The primary workspace console that unifies active human agents, tracking conversation history, tags, and profiles.",
    metrics: "Active Agents: 8 // Response Time SLA: <30s"
  },
  customer_inquiry: {
    title: "Customer Inquiry Ticket",
    category: "Real-Time Resolution Path",
    description: "Open query detailing customer interest. Monitored for automated keyword classification and routing.",
    metrics: "Active ticket: #9842 // Intent: High-intent pricing"
  },
  agent_response: {
    title: "Instant Agent Response",
    category: "Real-Time Resolution Path",
    description: "Manual agent reply or AI-Copilot draft instantly dispatched back to the customer's chat interface.",
    metrics: "Dispatch time: 4.8s // Context retention: Perfect"
  },
  conv_resolved: {
    title: "Conversation Resolved & Closed",
    category: "Real-Time Resolution Path",
    description: "Resolution registered, ticket marked complete, and conversation history synced directly to central CRM databases.",
    metrics: "Sync Status: SUCCESS // CRM target: Salesforce"
  },
  automated_workflow: {
    title: "Operational Messaging Workflow",
    category: "Central Automation Core",
    description: "The background process tracking idle ticket counters. Triggers escalations and follow-ups on inactive lines.",
    metrics: "Active campaigns: 340 // Drip efficiency: 94.2%"
  },
  inquiry_idle: {
    title: "Unresolved / Idle Inquiry Intake",
    category: "Automated Drip Path",
    description: "An unresolved customer ticket that has had zero human interaction, flagged for autonomous nurturing campaigns.",
    metrics: "Age of ticket: 5 min // Nurture state: ARMED"
  },
  inactivity_trigger: {
    title: "30-Min Inactivity Timeout Trigger",
    category: "Automated Drip Path",
    description: "Countdown register monitoring user delay. Activates exactly at 30 minutes of customer silence.",
    metrics: "Limit: 30m 00s // Precision: <0.1s"
  },
  followup_1: {
    title: "Auto-Follow-Up 1: Friendly Check-In",
    category: "Automated Drip Path",
    description: "Automatic friendly check-in template sent via WhatsApp. Contains direct response buttons to capture attention.",
    metrics: "Open rate: 98.2% // CTA Response rate: 38.5%"
  },
  followup_2: {
    title: "Auto-Follow-Up 2: Support & FAQ Block",
    category: "Automated Drip Path",
    description: "Secondary follow-up offering helpful resources, pricing guides, explanatory video hooks, and booking links.",
    metrics: "Click-through: 44.8% // Meeting booked: 14.6%"
  },
  agent_alert: {
    title: "Urgent Agent / Manager Alert",
    category: "Automated Drip Path",
    description: "Automated alert dispatched via Slack/SMS to sales supervisors, warning them of a high-value unresponsive lead.",
    metrics: "Alert Level: P1 CRITICAL // Latency: 200ms"
  },
  agent_engagement: {
    title: "Active Human Agent Engagement",
    category: "Automated Drip Path",
    description: "Manual hot-swap takeover where a live specialist reviews full system logs and initiates targeted communication.",
    metrics: "Specialist Assigned: Level-3 Agent // Status: ACQUIRED"
  }
};

export function InteractiveWhatsappNurture() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [simulationType, setSimulationType] = useState<"instant" | "drip" | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const instantSteps = [
    "website_chat",
    "whatsapp",
    "messenger",
    "sms",
    "agent_inbox",
    "customer_inquiry",
    "agent_response",
    "conv_resolved"
  ];

  const dripSteps = [
    "website_chat",
    "whatsapp",
    "automated_workflow",
    "inquiry_idle",
    "inactivity_trigger",
    "followup_1",
    "followup_2",
    "agent_alert",
    "agent_engagement"
  ];

  const currentSteps = simulationType === "instant" ? instantSteps : dripSteps;

  useEffect(() => {
    if (!isSimulating || !simulationType) return;

    const interval = setTimeout(() => {
      if (activeStep < currentSteps.length - 1) {
        setActiveStep((prev) => prev + 1);
        setHoveredNode(currentSteps[activeStep + 1]);
      } else {
        setIsSimulating(false);
        setActiveStep(-1);
        setSimulationType(null);
        setHoveredNode(null);
      }
    }, 1200);

    return () => clearTimeout(interval);
  }, [isSimulating, activeStep, simulationType]);

  const startSimulation = (type: "instant" | "drip") => {
    setIsSimulating(true);
    setSimulationType(type);
    setActiveStep(0);
    setHoveredNode(type === "instant" ? instantSteps[0] : dripSteps[0]);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setActiveStep(-1);
    setSimulationType(null);
    setHoveredNode(null);
  };

  const isNodeActive = (nodeId: string) => {
    if (isSimulating && simulationType) {
      const stepIdx = currentSteps.indexOf(nodeId);
      return stepIdx !== -1 && stepIdx <= activeStep;
    }
    return hoveredNode === nodeId;
  };

  return (
    <div className="w-full bg-background border border-[#9CA3AF] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6 select-none relative overflow-hidden text-foreground">
      
      {/* ─── Top Control Panel ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#355CFF] animate-ping" />
            <h4 className="font-mono text-[11px] tracking-[0.18em] text-[#355CFF] uppercase font-bold">
              WhatsApp Pipeline Simulator
            </h4>
          </div>
          <p className="text-muted-foreground text-[12px] mt-1 font-sans">
            Interactive blueprint of the instant resolution queue versus governed escalation workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isSimulating ? (
            <>
              <button
                onClick={() => startSimulation("instant")}
                className="bg-[#355CFF] hover:bg-[#2A4AD4] text-white font-mono text-[11px] font-bold px-3.5 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>TRACE INSTANT RESOLUTION</span>
              </button>
              <button
                onClick={() => startSimulation("drip")}
                className="bg-[#355CFF]/10 text-[#355CFF] border border-[#355CFF]/20 hover:bg-[#355CFF]/20 font-mono text-[11px] font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>TRACE DRIP ESCALATION</span>
              </button>
            </>
          ) : (
            <button
              onClick={stopSimulation}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-mono text-[11px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET BLUEPRINT</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
        
        {/* Left Column: Responsive SVG Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-[#9CA3AF]/40 rounded-xl p-3 md:p-5 relative flex items-center justify-center">
          <svg
            viewBox="0 0 1000 860"
            className="w-full h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid Blueprint Overlay */}
            <defs>
              <pattern id="whatsapp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,26,26,0.02)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="1000" height="860" fill="url(#whatsapp-grid)" />

            {/* Scheme Title Text */}
            <text x="50" y="45" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.05em">
              INSTANT MESSAGING & ESCALATION WORKFLOW SCHEMA
            </text>
            <text x="50" y="70" fill="#6B7280" fontFamily="monospace" fontSize="10" letterSpacing="0.1em">
              REAL-TIME INTEGRATION PROTOCOL V4.2
            </text>

            <text x="50" y="120" fill="#1A1A1A" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="0.1em">CUSTOMER MESSAGING CHANNELS</text>
            <line x1="50" y1="130" x2="330" y2="130" stroke="#1A1A1A" strokeWidth="1" />

            {/* Central Split Bar (Real-Time Agent Inbox / Escalation Workflow) */}
            {/* Outline box */}
            <rect x="420" y="100" width="45" height="340" fill="#FAF9F6" stroke="#9CA3AF" strokeWidth="1.2" rx="4" />
            <rect x="420" y="440" width="45" height="360" fill="#FAF9F6" stroke="#9CA3AF" strokeWidth="1.2" rx="4" />
            
            {/* Filled highlight backgrounds for simulated active state */}
            {isNodeActive("agent_inbox") && (
              <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} x="420" y="100" width="45" height="340" fill="#355CFF" />
            )}
            {isNodeActive("automated_workflow") && (
              <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} x="420" y="440" width="45" height="360" fill="#355CFF" />
            )}

            {/* Vertical text inside bars */}
            <text x="447" y="270" fill="#1A1A1A" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="0.15em" transform="rotate(-90 447 270)" textAnchor="middle">
              REAL-TIME AGENT INBOX
            </text>
            <text x="447" y="620" fill="#1A1A1A" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="0.15em" transform="rotate(-90 447 620)" textAnchor="middle">
              ESCALATION WORKFLOW
            </text>

            {/* ─── CONNECTION PATHS (SVG Lines) ─── */}
            {/* Website Chat (x=120, y=190) -> Inbox */}
            <path
              d="M 280,190 L 420,190"
              stroke={isNodeActive("agent_inbox") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_inbox") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_inbox") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* WhatsApp (x=120, y=270) -> Inbox */}
            <path
              d="M 280,270 L 420,270"
              stroke={isNodeActive("agent_inbox") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_inbox") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_inbox") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Messenger (x=120, y=350) -> Inbox */}
            <path
              d="M 280,350 L 420,350"
              stroke={isNodeActive("agent_inbox") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_inbox") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_inbox") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* SMS (x=120, y=430) -> Inbox */}
            <path
              d="M 280,430 L 420,430"
              stroke={isNodeActive("agent_inbox") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_inbox") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_inbox") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />

            {/* WhatsApp (x=120, y=270) -> Automated Workflow (curved path down) */}
            <path
              d="M 280,270 C 350,270 350,620 420,620"
              stroke={isNodeActive("automated_workflow") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("automated_workflow") ? "2" : "1.2"}
              strokeDasharray={isNodeActive("automated_workflow") ? "none" : "3 3"}
              markerEnd={isNodeActive("automated_workflow") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />

            {/* Inbox -> Customer Inquiry (Real-Time) */}
            <path
              d="M 465,220 L 530,220"
              stroke={isNodeActive("customer_inquiry") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("customer_inquiry") ? "2" : "1.2"}
              markerEnd={isNodeActive("customer_inquiry") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Customer Inquiry -> Agent Response */}
            <path
              d="M 650,220 L 710,220"
              stroke={isNodeActive("agent_response") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_response") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_response") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Agent Response -> Conversation Resolved */}
            <path
              d="M 830,220 L 890,220"
              stroke={isNodeActive("conv_resolved") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("conv_resolved") ? "2" : "1.2"}
              markerEnd={isNodeActive("conv_resolved") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />

            {/* Automated Workflow -> Inquiry (Unresolved/Idle) */}
            <path
              d="M 465,560 L 530,560"
              stroke={isNodeActive("inquiry_idle") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("inquiry_idle") ? "2" : "1.2"}
              markerEnd={isNodeActive("inquiry_idle") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Inquiry (Idle) -> Inactivity Trigger */}
            <path
              d="M 650,560 L 710,560"
              stroke={isNodeActive("inactivity_trigger") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("inactivity_trigger") ? "2" : "1.2"}
              markerEnd={isNodeActive("inactivity_trigger") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Inactivity Trigger -> Follow-Up 1 */}
            <path
              d="M 830,560 L 890,560"
              stroke={isNodeActive("followup_1") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("followup_1") ? "2" : "1.2"}
              markerEnd={isNodeActive("followup_1") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Follow-Up 1 -> Follow-Up 2 (downwards loop) */}
            <path
              d="M 950,600 L 950,680 C 950,710 830,710 650,710"
              stroke={isNodeActive("followup_2") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("followup_2") ? "2" : "1.2"}
              markerEnd={isNodeActive("followup_2") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Follow-Up 2 -> Agent Alert */}
            <path
              d="M 530,710 L 465,710 C 400,710 390,750 530,750"
              stroke={isNodeActive("agent_alert") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_alert") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_alert") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />
            {/* Agent Alert -> Agent Engagement */}
            <path
              d="M 650,750 L 710,750"
              stroke={isNodeActive("agent_engagement") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("agent_engagement") ? "2" : "1.2"}
              markerEnd={isNodeActive("agent_engagement") ? "url(#arrow-blue)" : "url(#arrow-gray)"}
            />

            {/* Markers Definitions for Arrows */}
            <defs>
              <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9CA3AF" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#355CFF" />
              </marker>
            </defs>

            {/* ─── INTERACTIVE NODES (GROUPS WITH HOVER HANDLERS) ─── */}

            {/* Input Channels */}
            {/* Website Chat */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("website_chat")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="80" y="160" width="200" height="50" fill={isNodeActive("website_chat") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("website_chat") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("website_chat") ? "1.8" : "1"} rx="6" />
              <text x="140" y="190" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600">WEBSITE CHAT</text>
              <circle cx="110" cy="185" r="14" fill="#E5E2DC" />
              <g transform="translate(102, 177) scale(0.65)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#355CFF" strokeWidth="2" fill="none" /></g>
            </g>

            {/* WhatsApp */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("whatsapp")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="80" y="245" width="200" height="50" fill={isNodeActive("whatsapp") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("whatsapp") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("whatsapp") ? "1.8" : "1"} rx="6" />
              <text x="140" y="275" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600">WHATSAPP</text>
              <circle cx="110" cy="270" r="14" fill="#E5E2DC" />
              <g transform="translate(102, 262) scale(0.65)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#355CFF" strokeWidth="2" fill="none" /></g>
            </g>

            {/* FB Messenger */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("messenger")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="80" y="325" width="200" height="50" fill={isNodeActive("messenger") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("messenger") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("messenger") ? "1.8" : "1"} rx="6" />
              <text x="140" y="355" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600">MESSENGER</text>
              <circle cx="110" cy="350" r="14" fill="#E5E2DC" />
              <g transform="translate(102, 342) scale(0.65)"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4Z" stroke="#355CFF" strokeWidth="2" fill="none" /></g>
            </g>

            {/* SMS */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("sms")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="80" y="405" width="200" height="50" fill={isNodeActive("sms") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("sms") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("sms") ? "1.8" : "1"} rx="6" />
              <text x="140" y="435" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600">SMS GATEWAY</text>
              <circle cx="110" cy="430" r="14" fill="#E5E2DC" />
              <g transform="translate(102, 422) scale(0.65)"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="#355CFF" strokeWidth="2" fill="none" /><line x1="12" y1="18" x2="12.01" y2="18" stroke="#355CFF" strokeWidth="3" /></g>
            </g>

            {/* ─── TOP PATH NODES (INSTANT PATH) ─── */}
            {/* Customer Inquiry */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("customer_inquiry")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="530" y="180" width="120" height="80" fill={isNodeActive("customer_inquiry") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("customer_inquiry") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("customer_inquiry") ? "1.8" : "1.2"} rx="8" />
              <text x="590" y="215" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">CUSTOMER</text>
              <text x="590" y="230" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">INQUIRY</text>
              <text x="590" y="248" fill="#6B7280" fontFamily="monospace" fontSize="8.5" textAnchor="middle">(Real-Time)</text>
            </g>

            {/* Agent Response */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("agent_response")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="710" y="180" width="120" height="80" fill={isNodeActive("agent_response") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("agent_response") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("agent_response") ? "1.8" : "1.2"} rx="8" />
              <text x="770" y="215" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">AGENT</text>
              <text x="770" y="230" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">RESPONSE</text>
              <text x="770" y="248" fill="#6B7280" fontFamily="monospace" fontSize="8.5" textAnchor="middle">(Instant)</text>
            </g>

            {/* Conversation Resolved */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("conv_resolved")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="890" y="180" width="85" height="80" fill={isNodeActive("conv_resolved") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("conv_resolved") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("conv_resolved") ? "1.8" : "1.2"} rx="8" />
              <text x="932" y="215" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="bold" textAnchor="middle">CONVERSATION</text>
              <text x="932" y="230" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="bold" textAnchor="middle">RESOLVED</text>
            </g>


            {/* ─── BOTTOM PATH NODES (DRIP ESCALATION) ─── */}
            {/* Inquiry Idle */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("inquiry_idle")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="530" y="520" width="120" height="80" fill={isNodeActive("inquiry_idle") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("inquiry_idle") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("inquiry_idle") ? "1.8" : "1.2"} rx="8" />
              <text x="590" y="555" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">INQUIRY</text>
              <text x="590" y="570" fill="#6B7280" fontFamily="monospace" fontSize="8.5" textAnchor="middle">(Unresolved/Idle)</text>
            </g>

            {/* Inactivity Trigger */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("inactivity_trigger")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="710" y="520" width="120" height="80" fill={isNodeActive("inactivity_trigger") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("inactivity_trigger") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("inactivity_trigger") ? "1.8" : "1.2"} rx="8" />
              <text x="770" y="550" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">TRIGGER:</text>
              <text x="770" y="565" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle">30 MIN INACTIVITY</text>
            </g>

            {/* Follow-up 1 */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("followup_1")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="890" y="520" width="85" height="80" fill={isNodeActive("followup_1") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("followup_1") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("followup_1") ? "1.8" : "1.2"} rx="8" />
              <text x="932" y="550" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="bold" textAnchor="middle">AUTO-FOLLOW UP 1</text>
              <text x="932" y="568" fill="#6B7280" fontFamily="monospace" fontSize="8" textAnchor="middle">(Friendly Reminder)</text>
            </g>

            {/* Follow-up 2 */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("followup_2")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="530" y="670" width="120" height="80" fill={isNodeActive("followup_2") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("followup_2") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("followup_2") ? "1.8" : "1.2"} rx="8" />
              <text x="590" y="700" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">AUTO-FOLLOW UP 2</text>
              <text x="590" y="718" fill="#6B7280" fontFamily="monospace" fontSize="8" textAnchor="middle">(Offer Support/FAQ)</text>
            </g>

            {/* Agent Alert */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("agent_alert")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="530" y="725" width="120" height="50" fill={isNodeActive("agent_alert") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("agent_alert") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("agent_alert") ? "1.8" : "1.2"} rx="8" />
              <text x="590" y="750" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle">AGENT ALERT (Urgent)</text>
            </g>

            {/* Agent Engagement */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode("agent_engagement")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect x="710" y="710" width="120" height="80" fill={isNodeActive("agent_engagement") ? "#FAF9F6" : "#FFFFFF"} stroke={isNodeActive("agent_engagement") ? "#355CFF" : "#9CA3AF"} strokeWidth={isNodeActive("agent_engagement") ? "1.8" : "1.2"} rx="8" />
              <text x="770" y="745" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">AGENT</text>
              <text x="770" y="760" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">ENGAGEMENT</text>
            </g>

            {/* Decorative Connection lines & Loops */}
            {/* Split connectors */}
            <line x1="442.5" y1="440" x2="442.5" y2="440" stroke="#9CA3AF" strokeWidth="1.2" />

            {/* Legend Box bottom-left */}
            <rect x="80" y="580" width="200" height="210" fill="#FAF9F6" stroke="#9CA3AF" strokeWidth="1" rx="6" />
            <text x="95" y="605" fill="#1A1A1A" fontFamily="monospace" fontSize="10.5" fontWeight="bold" letterSpacing="0.1em">SCHEMA LEGEND</text>
            
            <line x1="95" y1="625" x2="135" y2="625" stroke="#9CA3AF" strokeWidth="1.5" />
            <path d="M 130,622 L 136,625 L 130,628 Z" fill="#9CA3AF" />
            <text x="155" y="629" fill="#6B7280" fontFamily="system-ui, sans-serif" fontSize="11">Inbound Message</text>

            <line x1="95" y1="660" x2="135" y2="660" stroke="#9CA3AF" strokeWidth="2.5" />
            <text x="155" y="664" fill="#6B7280" fontFamily="system-ui, sans-serif" fontSize="11">System Routing Path</text>

            <circle cx="115" cy="695" r="9" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
            <path d="M 115,690 L 115,695 L 119,695" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
            <text x="155" y="699" fill="#6B7280" fontFamily="system-ui, sans-serif" fontSize="11">Time/Delay Trigger</text>

            <g transform="translate(105, 725) scale(0.8)">
              <rect x="0" y="0" width="20" height="20" rx="3" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
              <circle cx="10" cy="10" r="3" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
            </g>
            <text x="155" y="739" fill="#6B7280" fontFamily="system-ui, sans-serif" fontSize="11">Automation Core</text>

            <g transform="translate(105, 760) scale(0.8)">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
              <path d="M22 6l-10 7L2 6" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
            </g>
            <text x="155" y="774" fill="#6B7280" fontFamily="system-ui, sans-serif" fontSize="11">System Notification</text>

          </svg>
        </div>

        {/* Right Column: Telemetry Diagnostic Console (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-card border border-[#9CA3AF]/40 rounded-xl p-5 shadow-sm text-left">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#355CFF]" />
                <h5 className="font-mono text-[11px] tracking-[0.1em] text-foreground uppercase font-bold">
                  TELEMETRY PANEL
                </h5>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground uppercase bg-[#E5E2DC]/50 px-2 py-0.5 rounded">
                {isSimulating ? "LIVE RUN" : "INSPECT MODE"}
              </span>
            </div>

            {/* Information Inspector */}
            {hoveredNode && nodeDetails[hoveredNode] ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#355CFF] uppercase tracking-wider block mb-1">
                    {nodeDetails[hoveredNode].category}
                  </span>
                  <h6 className="text-[16px] font-black tracking-tight text-foreground leading-tight">
                    {nodeDetails[hoveredNode].title}
                  </h6>
                </div>

                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {nodeDetails[hoveredNode].description}
                </p>

                <div className="bg-background border border-border rounded-md p-3.5 font-mono text-[11px] text-foreground/90 space-y-1 relative">
                  <div className="absolute top-2 right-2 text-[#355CFF]/30"><Terminal className="w-3.5 h-3.5" /></div>
                  <span className="text-muted-foreground block uppercase text-[9px] tracking-wider mb-1.5">SYSTEM DIAGNOSTICS:</span>
                  <div className="truncate">{nodeDetails[hoveredNode].metrics}</div>
                  <div>Trace State: <span className="text-[#355CFF] font-bold">ACTIVE</span></div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl p-6">
                <MessageCircle className="w-8 h-8 text-[#9CA3AF] mb-2.5 animate-pulse" />
                <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                  AWAITING NODE PROBE
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Hover over blueprint modules or trigger a trace simulation run above.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border mt-6 font-mono text-[9.5px] text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>ACTIVE FLOW ENGINES:</span>
              <span className="text-foreground">2 OPERATIONAL</span>
            </div>
            <div className="flex justify-between">
              <span>LATENCY TOLERANCE:</span>
              <span className="text-[#355CFF] font-semibold">&lt;50ms SYNC</span>
            </div>
            <div className="flex justify-between">
              <span>CRM SYNC PIPELINE:</span>
              <span className="text-[#10B981] font-semibold">ONLINE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
