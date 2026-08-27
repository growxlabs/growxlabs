"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Webhook, 
  Clock, 
  MousePointer, 
  Database, 
  Play, 
  RotateCcw, 
  Cpu, 
  Server, 
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Terminal,
  ShieldCheck,
  CheckCircle,
  Sparkles
} from "lucide-react";

// Node description database for hover tooltips
interface NodeDetail {
  title: string;
  category: string;
  description: string;
  metrics: string;
}

const nodeDetails: Record<string, NodeDetail> = {
  api_gateway: {
    title: "API Gateway",
    category: "Ingestion Layer",
    description: "Authenticates, rate-limits, and normalizes incoming HTTP payload streams before routing them down to specific engine endpoints.",
    metrics: "Throughput: 14.5k req/s // Latency: 1.2ms"
  },
  stripe_webhooks: {
    title: "Stripe Webhooks",
    category: "Payment Triggers",
    description: "Captures instant event signals from Stripe payment gateways (e.g. invoice.paid, subscription.created) to initiate post-purchase automations.",
    metrics: "Delivery success rate: 99.98% // Retries: 0"
  },
  cron_scheduler: {
    title: "Cron Scheduler",
    category: "Time Triggers",
    description: "Executes time-synchronized polling and batch workflows at precise intervals (e.g. midnight reconciliation, hourly status sync).",
    metrics: "Accuracy: ±50ms // Scheduled jobs: 1,480 active"
  },
  user_action: {
    title: "User Action Trigger",
    category: "Manual Triggers",
    description: "Initiated instantly via client interactions (e.g. manual dashboard clicks, admin override signals, custom button triggers).",
    metrics: "Avg user latency: 120ms // Click tracking: OK"
  },
  crm_sync: {
    title: "CRM Data Sync",
    category: "Database Triggers",
    description: "Monitors change data capture (CDC) logs in Hubspot, Salesforce, or local CRMs to trigger automatic contact synchronization workflows.",
    metrics: "CDC Latency: 400ms // Sync integrity: 100%"
  },
  api_endpoint: {
    title: "API Endpoint POST",
    category: "Gateway Route",
    description: "Receives raw request streams, parses JSON payloads, and validates schemas against event endpoints.",
    metrics: "Route: /v1/webhook/pipeline // Method: POST"
  },
  workflow_def: {
    title: "Workflow Definition Schema",
    category: "Configuration Layer",
    description: "Loads the declarative YAML/JSON blueprints representing step sequences, conditional routers, and action parameters.",
    metrics: "Format: JSON-Schema Draft 7 // Blueprints: 86 active"
  },
  instance_creation: {
    title: "Instance Creation",
    category: "Initialization",
    description: "Initializes a unique workflow execution run, generating event IDs, tracking metrics, and establishing isolation sandboxes.",
    metrics: "Generated ID: WF-10938 // Memory sandbox: 12MB"
  },
  trigger_router: {
    title: "Workflow Trigger Router",
    category: "Core Orchestrator",
    description: "Evaluates trigger parameters and dynamically dispatches executions to specialized engine threads.",
    metrics: "Dispatch queue: 0ms delay // Thread count: 32 active"
  },
  state_manager: {
    title: "Workflow State Manager",
    category: "State Machine",
    description: "Maintains durable execution state, tracking step progress, transaction boundaries, and variables across execution lifecycles.",
    metrics: "State mode: Transactional // Lock latency: 0.8ms"
  },
  execution_instance: {
    title: "Execution Instance",
    category: "Runtime Engine",
    description: "The main processing execution frame. Directs isolated task threads and executes code instructions inside secure runtimes.",
    metrics: "Instruction cycles: 45k/s // Execution state: SUCCESS"
  },
  data_context: {
    title: "Data Context Scope",
    category: "Data Store",
    description: "Captures and holds runtime state, parameters, variables, and step outputs in a secure transactional JSON context.",
    metrics: "Context size: 1.4KB // Memory layout: Flat JSON"
  },
  action_dispatcher: {
    title: "Action Dispatcher",
    category: "Queue Manager",
    description: "Handles asynchronous dispatching of API integrations, webhooks, database writes, and background queue workers.",
    metrics: "Job status: Active // Thread safety: Mutex-Locked"
  },
  step_definitions: {
    title: "Step Definitions",
    category: "Logic Parser",
    description: "Parses conditional paths, logic loops, script code blocks, and operational sequence instructions.",
    metrics: "Logic blocks: Evaluated // Loop capacity: Unlimited"
  },
  persistence_store: {
    title: "Durable Persistence Store",
    category: "Database Layer",
    description: "Durable database engine (PostgreSQL, Redis) backing transaction histories, state locks, and execution log tables.",
    metrics: "Connection pool: 120/150 // Write latency: 3.1ms"
  },
  step_1_fetch: {
    title: "Step 1: Fetch Data",
    category: "External Request",
    description: "Executes a secure call to external CRM/APIs to fetch customer details, verifying profile data before processing.",
    metrics: "Method: GET // Endpoint: api.crm.com/v1/user"
  },
  api_calls: {
    title: "External API Integration",
    category: "Integrations",
    description: "Dispatches HTTP requests to third-party web services and API endpoints, handling authentication and response decoding.",
    metrics: "SSL cipher: TLSv1.3 // Response: 200 OK"
  },
  gateway_1: {
    title: "Gateway 1: Conditions",
    category: "Logic Switch",
    description: "Evaluates boolean logic and parameter checks (e.g. isPaid == true) to branch the execution sequence.",
    metrics: "Result: TRUE // Decision route: Step 2A (Process)"
  },
  db_operations: {
    title: "Database Operations",
    category: "Data Storage",
    description: "Applies atomic CRUD updates, transaction tracking, and schema sync operations inside internal application tables.",
    metrics: "Query time: 0.9ms // Isolation level: Read Committed"
  },
  step_2a_process: {
    title: "Step 2A: Process Order",
    category: "Core Execution",
    description: "Executes final order processing logic, modifying customer ledger files, reserving stock, and issuing invoice events.",
    metrics: "Ledger status: LOCKED // Settlement: SETTLED"
  },
  step_2b_notify: {
    title: "Step 2B: Notify Customer",
    category: "Integrations",
    description: "Fires outgoing WhatsApp transactional messages, customer invoice emails, and notification updates.",
    metrics: "Email delivery: SENT // WhatsApp status: DELIVERED"
  },
  step_2c_error: {
    title: "Step 2C: Log Error",
    category: "Diagnostics",
    description: "Registers failures, captures thread stack traces, and notifies support channels via Slack webhook alerts.",
    metrics: "Log level: ERROR // Incident ID: INC-4091"
  },
  error_handler: {
    title: "Error Handler Thread",
    category: "Diagnostics",
    description: "Executes circuit breaker protocols, performs automated rollbacks, and initiates transactional compensation flows.",
    metrics: "Recovery plan:补偿机制 // Retries: Exhausted"
  },
  timers_delays: {
    title: "Timers & Delays",
    category: "Background Scheduling",
    description: "Pauses execution state durably for a specified delay (e.g. wait 30 minutes before sending lead nurturing follow-up).",
    metrics: "Timer: 30m wait // Wakeup scheduled: 23:39:15"
  }
};

export function InteractiveWorkflowEngine() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Simulation steps sequence mapping node names
  const simulationSteps = [
    "stripe_webhooks",
    "trigger_router",
    "state_manager",
    "execution_instance",
    "data_context",
    "persistence_store",
    "step_1_fetch",
    "gateway_1",
    "step_2a_process",
    "timers_delays"
  ];

  // Auto run simulation loops
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setTimeout(() => {
      if (activeStep < simulationSteps.length - 1) {
        setActiveStep((prev) => prev + 1);
        setHoveredNode(simulationSteps[activeStep + 1]);
      } else {
        setIsSimulating(false);
        setActiveStep(-1);
        setHoveredNode(null);
      }
    }, 1400); // 1.4s per step for professional reading flow

    return () => clearTimeout(interval);
  }, [isSimulating, activeStep]);

  const startSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);
    setHoveredNode(simulationSteps[0]);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setActiveStep(-1);
    setHoveredNode(null);
  };

  // Helper function to check if node or line is active during simulation
  const isNodeActive = (nodeId: string) => {
    if (isSimulating) {
      const stepIdx = simulationSteps.indexOf(nodeId);
      return stepIdx !== -1 && stepIdx <= activeStep;
    }
    return hoveredNode === nodeId;
  };

  return (
    <div className="w-full bg-background border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6 select-none relative overflow-hidden">
      
      {/* ─── Top Control Panel ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#355CFF] animate-ping" />
            <h4 className="font-mono text-[11px] tracking-[0.18em] text-[#355CFF] uppercase font-bold">
              Interactive Blueprint Architecture
            </h4>
          </div>
          <p className="text-muted-foreground text-[12px] mt-1 font-sans">
            Hover over nodes to inspect metrics, or trigger the live workflow simulator.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="bg-[#355CFF] hover:bg-[#2A4AD4] text-white font-mono text-[11px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>SIMULATE RUN</span>
            </button>
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

      {/* ─── Main Content Layout: Graphic Grid + Side Inspector ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
        
        {/* Left Column: Unified Responsive SVG (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border/80 rounded-xl p-3 md:p-5 relative flex items-center justify-center">
          <svg
            viewBox="0 0 1000 860"
            className="w-full h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ─── Title Text Blocks ─── */}
            <text x="50" y="45" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.05em">
              AUTOMATED BUSINESS WORKFLOW ENGINE: EXECUTION & ORCHESTRATION ARCHITECTURE
            </text>
            <text x="50" y="68" fill="#6B7280" fontFamily="monospace" fontSize="10" letterSpacing="0.1em">
              EVENT-DRIVEN PROCESSING FRAMEWORK
            </text>

            {/* Column Headers */}
            <text x="65" y="112" fill="#6B7280" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.15em">TRIGGER EVENTS</text>
            <text x="315" y="112" fill="#6B7280" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.15em">WORKFLOW ENGINE CORE</text>
            <text x="665" y="112" fill="#6B7280" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="0.15em">METRICS & ORCHESTRATION PATHS</text>

            <line x1="50" x2="225" y1="122" y2="122" stroke="#9CA3AF" strokeWidth="1.2" />
            <line x1="300" x2="575" y1="122" y2="122" stroke="#9CA3AF" strokeWidth="1.2" />
            <line x1="650" x2="930" y1="122" y2="122" stroke="#9CA3AF" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* ─── CONNECTION LINES LAYER (SVG Paths) ─── */}
            {/* Stripe Webhook -> Trigger Router */}
            <path
              d="M 215,250 L 300,250"
              stroke={isNodeActive("trigger_router") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("trigger_router") ? "2" : "1.5"}
              strokeDasharray={isNodeActive("trigger_router") ? "3 3" : "none"}
              className={isNodeActive("trigger_router") ? "animate-[dash_12s_linear_infinite]" : ""}
            />
            {/* API Gateway -> API Endpoint */}
            <path
              d="M 215,150 L 300,150"
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            {/* Cron -> Router */}
            <path
              d="M 215,350 L 255,350 L 255,260 L 300,260"
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            {/* User Action -> Router */}
            <path
              d="M 215,450 L 255,450 L 255,270 L 300,270"
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            {/* CRM Sync -> Router */}
            <path
              d="M 215,550 L 265,550 L 265,280 L 300,280"
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />

            {/* API Endpoint -> Def */}
            <path d="M 415,150 L 450,150" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Def -> Instance */}
            <path d="M 565,150 L 600,150" stroke="#9CA3AF" strokeWidth="1.5" />

            {/* Trigger Router -> Workflow Engine Box */}
            <path
              d="M 357,280 L 357,325"
              stroke={isNodeActive("state_manager") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("state_manager") ? "2" : "1.5"}
              strokeDasharray={isNodeActive("state_manager") ? "3 3" : "none"}
            />

            {/* State Manager -> Exec Instance */}
            <path
              d="M 437,365 L 437,405"
              stroke={isNodeActive("execution_instance") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("execution_instance") ? "2" : "1.5"}
            />
            {/* Exec Instance -> Data Context */}
            <path
              d="M 437,445 L 437,485"
              stroke={isNodeActive("data_context") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("data_context") ? "2" : "1.5"}
            />
            {/* Data Context -> Action Dispatcher */}
            <path d="M 437,525 L 437,565" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Action Dispatcher -> Step Defs */}
            <path d="M 437,605 L 437,645" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Step Defs -> Persistence Store */}
            <path
              d="M 437,685 L 437,725"
              stroke={isNodeActive("persistence_store") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("persistence_store") ? "2" : "1.5"}
            />

            {/* Persistence Store -> Data Flow Diamond */}
            <path
              d="M 575,760 L 620,760 L 620,250 L 670,250"
              stroke={isNodeActive("step_1_fetch") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("step_1_fetch") ? "2" : "1.5"}
              strokeDasharray={isNodeActive("step_1_fetch") ? "3 3" : "none"}
            />

            {/* Data Flow Diamond -> Start Trigger Event */}
            <path d="M 720,250 L 800,250" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Data Flow Diamond -> Step 1 Fetch */}
            <path
              d="M 695,275 L 695,325"
              stroke={isNodeActive("step_1_fetch") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("step_1_fetch") ? "2" : "1.5"}
            />

            {/* Step 1 Fetch -> API Calls */}
            <path d="M 770,350 L 800,350" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Step 1 Fetch -> Gateway 1 Conditions */}
            <path
              d="M 695,375 L 695,415"
              stroke={isNodeActive("gateway_1") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("gateway_1") ? "2" : "1.5"}
            />

            {/* Gateway 1 -> DB Operations */}
            <path d="M 720,440 L 800,440" stroke="#9CA3AF" strokeWidth="1.5" />
            
            {/* Gateway 1 -> Step 2A (Yes) */}
            <path
              d="M 695,465 C 695,500 640,500 640,535"
              stroke={isNodeActive("step_2a_process") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("step_2a_process") ? "2" : "1.5"}
            />
            {/* Gateway 1 -> Step 2B (No) */}
            <path d="M 695,465 C 695,500 800,500 800,535" stroke="#9CA3AF" strokeWidth="1.5" />

            {/* Step 2A -> Step 2C Error */}
            <path d="M 640,585 L 640,635" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Step 2A -> Timers Delays */}
            <path
              d="M 640,585 L 600,585 L 600,740 L 640,740"
              stroke={isNodeActive("timers_delays") ? "#355CFF" : "#9CA3AF"}
              strokeWidth={isNodeActive("timers_delays") ? "2" : "1.5"}
            />

            {/* Step 2B -> Error Handler */}
            <path d="M 800,585 L 800,635" stroke="#9CA3AF" strokeWidth="1.5" />


            {/* ─── COLUMN 1: TRIGGER EVENT NODES ─── */}
            {[
              { id: "api_gateway", y: 130, label: "API Gateway", icon: <Globe className="w-3.5 h-3.5" /> },
              { id: "stripe_webhooks", y: 230, label: "Stripe Webhooks", icon: <Webhook className="w-3.5 h-3.5" /> },
              { id: "cron_scheduler", y: 330, label: "Cron Scheduler", icon: <Clock className="w-3.5 h-3.5" /> },
              { id: "user_action", y: 430, label: "User Action", icon: <MousePointer className="w-3.5 h-3.5" /> },
              { id: "crm_sync", y: 530, label: "CRM Data Sync", icon: <Database className="w-3.5 h-3.5" /> }
            ].map((node) => (
              <g
                key={node.id}
                onMouseEnter={() => !isSimulating && setHoveredNode(node.id)}
                onMouseLeave={() => !isSimulating && setHoveredNode(null)}
                className="cursor-pointer group"
              >
                <rect
                  x="50"
                  y={node.y}
                  width="165"
                  height="40"
                  rx="6"
                  fill={isNodeActive(node.id) ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                  stroke={isNodeActive(node.id) ? "#355CFF" : "#9CA3AF"}
                  strokeWidth={isNodeActive(node.id) ? "2" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle
                  cx="70"
                  cy={node.y + 20}
                  r="10"
                  fill={isNodeActive(node.id) ? "#355CFF" : "#9CA3AF"}
                  className="transition-colors duration-300"
                />
                {/* SVG ForeignObject to render Lucide Icons inside SVG */}
                <foreignObject x="63" y={node.y + 13} width="14" height="14" className={isNodeActive(node.id) ? "text-white" : "text-muted-foreground"}>
                  {node.icon}
                </foreignObject>
                <text
                  x="90"
                  y={node.y + 24}
                  fill="#1A1A1A"
                  fontFamily="system-ui, sans-serif"
                  fontSize="10"
                  fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            ))}


            {/* ─── COLUMN 2: WORKFLOW CORE ─── */}
            {[
              { id: "api_endpoint", x: 300, y: 130, label: "API Endpoint POST", desc: "POST /v1/webhook" },
              { id: "workflow_def", x: 450, y: 130, label: "Workflow Blueprint", desc: "Declarative JSON/YAML" },
              { id: "instance_creation", x: 600, y: 130, label: "Instance Creation", desc: "Isolated run sandbox" }
            ].map((node) => (
              <g
                key={node.id}
                onMouseEnter={() => !isSimulating && setHoveredNode(node.id)}
                onMouseLeave={() => !isSimulating && setHoveredNode(null)}
                className="cursor-pointer group"
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width="115"
                  height="40"
                  rx="6"
                  fill={isNodeActive(node.id) ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                  stroke={isNodeActive(node.id) ? "#355CFF" : "#9CA3AF"}
                  strokeWidth={isNodeActive(node.id) ? "2" : "1.2"}
                  className="transition-all duration-300"
                />
                <text x={node.x + 8} y={node.y + 18} fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="bold">
                  {node.label}
                </text>
                <text x={node.x + 8} y={node.y + 30} fill="#4B5563" fontFamily="monospace" fontSize="6.5">
                  {node.desc}
                </text>
              </g>
            ))}

            {/* Workflow Trigger Router */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("trigger_router")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="300"
                y="230"
                width="115"
                height="40"
                rx="6"
                fill={isNodeActive("trigger_router") ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                stroke={isNodeActive("trigger_router") ? "#355CFF" : "#9CA3AF"}
                strokeWidth={isNodeActive("trigger_router") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="308" y="248" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                Workflow Trigger Router
              </text>
              <text x="308" y="260" fill="#4B5563" fontFamily="monospace" fontSize="6.5">
                Evaluates parameters
              </text>
            </g>

            {/* Workflow Engine Core Border Container Box */}
            <rect
              x="280"
              y="300"
              width="315"
              height="490"
              rx="12"
              fill="rgba(26,26,26,0.005)"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <rect
              x="290"
              y="310"
              width="145"
              height="20"
              rx="4"
              fill="#9CA3AF"
              opacity="0.25"
            />
            <text x="298" y="323" fill="#374151" fontFamily="monospace" fontSize="8" fontWeight="bold" letterSpacing="0.05em">
              WORKFLOW ENGINE CORE
            </text>

            {/* Engine Core Inner Nodes */}
            {[
              { id: "state_manager", y: 340, label: "Workflow State Manager", sub: "Manages state, durable persistence" },
              { id: "execution_instance", y: 420, label: "Execution Instance", sub: "Dynamic execution of steps" },
              { id: "data_context", y: 500, label: "Data Context Scope", sub: "JSON Context, variables" },
              { id: "action_dispatcher", y: 580, label: "Action Dispatcher", sub: "Asynchronous dispatch" },
              { id: "step_definitions", y: 660, label: "Step Definitions", sub: "Logic, Conditionals, Loops" },
              { id: "persistence_store", y: 740, label: "Durable Persistence Store", sub: "PostgreSQL, Redis storage" }
            ].map((node) => (
              <g
                key={node.id}
                onMouseEnter={() => !isSimulating && setHoveredNode(node.id)}
                onMouseLeave={() => !isSimulating && setHoveredNode(null)}
                className="cursor-pointer group"
              >
                <rect
                  x="300"
                  y={node.y}
                  width="275"
                  height="45"
                  rx="6"
                  fill={isNodeActive(node.id) ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                  stroke={isNodeActive(node.id) ? "#355CFF" : "#9CA3AF"}
                  strokeWidth={isNodeActive(node.id) ? "2" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle
                  cx="320"
                  cy={node.y + 22}
                  r="8"
                  fill={isNodeActive(node.id) ? "#355CFF" : "#9CA3AF"}
                  className="transition-colors duration-300"
                />
                <foreignObject x="315" y={node.y + 17} width="10" height="10" className={isNodeActive(node.id) ? "text-white" : "text-muted-foreground"}>
                  {node.id === "persistence_store" ? <Server className="w-2.5 h-2.5" /> : <Cpu className="w-2.5 h-2.5" />}
                </foreignObject>
                <text x="340" y={node.y + 19} fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="bold">
                  {node.label}
                </text>
                <text x="340" y={node.y + 32} fill="#4B5563" fontFamily="system-ui, sans-serif" fontSize="7.5">
                  {node.sub}
                </text>
              </g>
            ))}


            {/* ─── COLUMN 3: MONITORS / EXECUTION PATHS ─── */}
            
            {/* Data Flow Check Diamond */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("step_1_fetch")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <polygon
                points="695,225 720,250 695,275 670,250"
                fill={isNodeActive("step_1_fetch") ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                stroke={isNodeActive("step_1_fetch") ? "#355CFF" : "#9CA3AF"}
                strokeWidth={isNodeActive("step_1_fetch") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <path d="M 691,244 L 699,252 M 699,244 L 695,244 L 695,256" stroke={isNodeActive("step_1_fetch") ? "#355CFF" : "#374151"} strokeWidth="1.2" />
              <text x="690" y="215" fill="#374151" fontFamily="monospace" fontSize="6.5">DATA FLOW</text>
            </g>

            {/* Start Trigger Event */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("instance_creation")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="800"
                y="230"
                width="115"
                height="40"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="808" y="248" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                START
              </text>
              <text x="808" y="260" fill="#4B5563" fontFamily="monospace" fontSize="6.5">
                Trigger Event
              </text>
            </g>

            {/* Step 1 Fetch Data */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("step_1_fetch")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="630"
                y="330"
                width="130"
                height="45"
                rx="6"
                fill={isNodeActive("step_1_fetch") ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                stroke={isNodeActive("step_1_fetch") ? "#355CFF" : "#9CA3AF"}
                strokeWidth={isNodeActive("step_1_fetch") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="638" y="348" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                STEP 1: FETCH DATA
              </text>
              <text x="638" y="361" fill="#4B5563" fontFamily="monospace" fontSize="7">
                CRM / API call
              </text>
            </g>

            {/* API Calls */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("api_calls")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="800"
                y="330"
                width="115"
                height="45"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="808" y="356" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                API CALLS
              </text>
            </g>

            {/* Gateway 1 Conditions Switch */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("gateway_1")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <polygon
                points="695,415 720,440 695,465 670,440"
                fill={isNodeActive("gateway_1") ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                stroke={isNodeActive("gateway_1") ? "#355CFF" : "#9CA3AF"}
                strokeWidth={isNodeActive("gateway_1") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="705" y="495" fill="#374151" fontFamily="monospace" fontSize="6.5">Yes</text>
              <text x="735" y="435" fill="#374151" fontFamily="monospace" fontSize="6.5">No</text>
              <text x="590" y="430" fill="#374151" fontFamily="monospace" fontSize="6.5">GATEWAY 1: CONDITIONS</text>
            </g>

            {/* DB Operations */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("db_operations")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="800"
                y="415"
                width="115"
                height="45"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="808" y="435" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                DB OPERATIONS
              </text>
            </g>

            {/* Step 2A Process Order */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("step_2a_process")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="590"
                y="535"
                width="110"
                height="45"
                rx="6"
                fill={isNodeActive("step_2a_process") ? "rgba(16,185,129,0.05)" : "#FAF9F6"}
                stroke={isNodeActive("step_2a_process") ? "#10B981" : "#9CA3AF"}
                strokeWidth={isNodeActive("step_2a_process") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="598" y="553" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="bold">
                STEP 2A:
              </text>
              <text x="598" y="565" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="black">
                PROCESS ORDER
              </text>
            </g>

            {/* Step 2B Notify Customer */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("step_2b_notify")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="745"
                y="535"
                width="110"
                height="45"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="753" y="553" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="bold">
                STEP 2B:
              </text>
              <text x="753" y="565" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="black">
                NOTIFY CUSTOMER
              </text>
            </g>

            {/* Step 2C Log Error */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("step_2c_error")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="590"
                y="635"
                width="110"
                height="45"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="598" y="653" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                STEP 2C:
              </text>
              <text x="598" y="665" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                LOG ERROR
              </text>
            </g>

            {/* Error Handler */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("error_handler")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="745"
                y="635"
                width="110"
                height="45"
                rx="6"
                fill="#FAF9F6"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <text x="753" y="653" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                ERROR
              </text>
              <text x="753" y="665" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                HANDLER
              </text>
            </g>

            {/* Timers & Delays */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredNode("timers_delays")}
              onMouseLeave={() => !isSimulating && setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="590"
                y="735"
                width="110"
                height="45"
                rx="6"
                fill={isNodeActive("timers_delays") ? "rgba(53,92,255,0.03)" : "#FAF9F6"}
                stroke={isNodeActive("timers_delays") ? "#355CFF" : "#9CA3AF"}
                strokeWidth={isNodeActive("timers_delays") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="598" y="753" fill="#1A1A1A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                TIMERS/DELAYS
              </text>
              <text x="598" y="765" fill="#4B5563" fontFamily="monospace" fontSize="8">
                #30m wait
              </text>
            </g>

            {/* ─── SVG LEGEND BLOCKS ─── */}
            <line x1="390" x2="420" y1="835" y2="835" stroke="#9CA3AF" strokeWidth="1.5" />
            <text x="430" y="838" fill="#6B7280" fontFamily="monospace" fontSize="8">DATA FLOW</text>

            <line x1="530" x2="560" y1="835" y2="835" stroke="#355CFF" strokeWidth="2" strokeDasharray="3 3" />
            <text x="570" y="838" fill="#6B7280" fontFamily="monospace" fontSize="8">ACTIVE RUN / EXECUTION PATH</text>
          </svg>
        </div>

        {/* Right Column: Node Inspector & Status Display (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          
          {/* Status Inspector Box */}
          <div className="bg-card border border-border rounded-xl p-5 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-[#355CFF]" />
                  <span>Node Inspector</span>
                </span>
                <span className="font-mono text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              <AnimatePresence mode="wait">
                {hoveredNode && nodeDetails[hoveredNode] ? (
                  <motion.div
                    key={hoveredNode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <span className="text-[9px] font-mono tracking-wider text-[#355CFF] bg-[#355CFF]/5 px-2 py-0.5 rounded uppercase font-bold">
                        {nodeDetails[hoveredNode].category}
                      </span>
                      <h4 className="text-xl font-black text-foreground mt-2 tracking-tight">
                        {nodeDetails[hoveredNode].title}
                      </h4>
                    </div>

                    <p className="text-muted-foreground text-[13.5px] leading-relaxed font-sans font-normal">
                      {nodeDetails[hoveredNode].description}
                    </p>

                    <div className="bg-background border border-border p-3 rounded-lg font-mono text-[10px] text-muted-foreground space-y-1">
                      <span className="text-foreground font-bold block mb-1">SYSTEM TELEMETRY:</span>
                      <span className="block">{nodeDetails[hoveredNode].metrics}</span>
                      <span className="block">Status: ACTIVE // Integrity: 100%</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-3"
                  >
                    <HelpCircle className="w-10 h-10 text-[#E5E2DC] mx-auto animate-pulse" />
                    <p className="text-[13px] text-muted-foreground font-sans max-w-[200px] mx-auto">
                      Hover over any node in the orchestration diagram to inspect its engine role and system telemetry.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Metrics Bar Chart */}
            <div className="border-t border-border pt-4 mt-6">
              <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block mb-3">
                Live Server Telemetry
              </span>
              <div className="space-y-2.5">
                {[
                  { label: "Engine CPU Load", val: isSimulating ? 78 : 34, color: "bg-[#355CFF]" },
                  { label: "Memory Pool", val: 56, color: "bg-[#6B7280]" },
                  { label: "Database Queue", val: isSimulating ? 88 : 12, color: isSimulating ? "bg-emerald-500" : "bg-[#6B7280]" }
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex justify-between text-[9.5px] font-mono">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="font-bold text-foreground">{bar.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-background border border-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${bar.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.val}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Status Card */}
          <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
                {isSimulating ? (
                  <Activity className="w-4 h-4 text-[#355CFF] animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">Engine Status</p>
                <p className="text-[12px] font-bold text-foreground font-sans">
                  {isSimulating ? `RUNNING SIMULATION... Step ${activeStep + 1}/10` : "SYSTEM SECURED & READY"}
                </p>
              </div>
            </div>
            {isSimulating && (
              <span className="text-[8px] font-mono tracking-widest text-[#355CFF] bg-[#355CFF]/5 border border-[#355CFF]/15 px-1.5 py-0.5 rounded animate-pulse">
                SIM_RUNNING
              </span>
            )}
          </div>

        </div>
        
      </div>
      
    </div>
  );
}
