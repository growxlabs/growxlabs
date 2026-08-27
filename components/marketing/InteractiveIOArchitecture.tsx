"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, 
  Cpu, 
  Shield, 
  Workflow, 
  Activity, 
  Terminal, 
  Play, 
  RotateCcw, 
  HelpCircle,
  Zap,
  Layers,
  Key,
  Globe,
  Database,
  CheckCircle,
  FileText
} from "lucide-react";

interface ModuleDetail {
  title: string;
  category: string;
  description: string;
  metrics: string;
}

const moduleDetails: Record<string, ModuleDetail> = {
  intelligent_layers: {
    title: "Antigravity Dev Framework",
    category: "Agent Orchestration",
    description: "Google's new agent-first development environment that allows engineers to manage, orchestrate, and deploy collaborative networks of autonomous AI agents.",
    metrics: "Active agent grids: 86 active // Workspace sync: OK"
  },
  neural_protocols: {
    title: "Gemini Spark Runtime",
    category: "Autonomous Core",
    description: "Powers the 24/7 background execution of Spark agents, managing event loops, state durably, and executing actions autonomously.",
    metrics: "Thread ID: SPARK-1082 // Wakeup checks: 0ms delay"
  },
  dynamic_agents: {
    title: "Collaborative Agents",
    category: "Multi-Agent System",
    description: "Coordinates multiple specialized AI agent threads working in parallel to solve complex coding, data syncing, or workflow tasks.",
    metrics: "Cooperation score: 99.8% // Context sharing: ACTIVE"
  },
  distributed_compute: {
    title: "Sandboxed Compute",
    category: "Secure Execution",
    description: "Runs AI-generated scripts and coding tasks in isolated, secure sandboxes to protect local file systems and system integrity.",
    metrics: "Memory allocated: 512MB RAM // Security check: PASS"
  },
  emergent_services: {
    title: "Gemini 3.5 Flash Engine",
    category: "LLM Inference Core",
    description: "Google's speed-optimized model, engineered for real-time generative interfaces, low-latency search index routing, and immediate task executions.",
    metrics: "Inference time: 1.2ms latency // Throughput: 1.2M tokens/s"
  },
  secure_fabric: {
    title: "Spark Cloud Persistence",
    category: "24/7 Background Core",
    description: "Ensures the Gemini Spark agent continues operating securely in the cloud long after you close your laptop, handling cron schedules and background actions.",
    metrics: "Cron trigger sync: ACTIVE // Idle CPU load: 0.02%"
  },
  decentralized_structures: {
    title: "Multi-Agent State Mesh",
    category: "State Sync & Consensus",
    description: "Maintains absolute data consistency, transaction tracking, and variable states across collaborative agent execution instances.",
    metrics: "Consensus delay: 42ms // Ledger integrity: 100%"
  },
  seamless_ecosystem: {
    title: "Enterprise & Workflow Integration",
    category: "Ecosystem Reconciler",
    description: "Consolidates workspace triggers, active agent automation webhooks, and external API inputs into finalized business settlements.",
    metrics: "Throughput: 28k req/s // Connectors: REST, gRPC, WASM"
  }
};

export function InteractiveIOArchitecture() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Simulation step trace sequence
  const simulationSteps = [
    "neural_protocols",
    "dynamic_agents",
    "distributed_compute",
    "intelligent_layers",
    "emergent_services",
    "secure_fabric",
    "decentralized_structures",
    "seamless_ecosystem"
  ];

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setTimeout(() => {
      if (activeStep < simulationSteps.length - 1) {
        setActiveStep((prev) => prev + 1);
        setHoveredModule(simulationSteps[activeStep + 1]);
      } else {
        setIsSimulating(false);
        setActiveStep(-1);
        setHoveredModule(null);
      }
    }, 1400);

    return () => clearTimeout(interval);
  }, [isSimulating, activeStep]);

  const startSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);
    setHoveredModule(simulationSteps[0]);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setActiveStep(-1);
    setHoveredModule(null);
  };

  const isModuleActive = (moduleId: string) => {
    if (isSimulating) {
      const stepIdx = simulationSteps.indexOf(moduleId);
      return stepIdx !== -1 && stepIdx <= activeStep;
    }
    return hoveredModule === moduleId;
  };

  return (
    <div className="w-full bg-background border border-white/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6 select-none relative overflow-hidden">
      
      {/* ─── Top Control Panel ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C0F0FB] animate-ping" />
            <h4 className="font-mono text-[11px] tracking-[0.18em] text-[#C0F0FB] uppercase font-bold">
              AI-Native Internet Blueprint
            </h4>
          </div>
          <p className="text-muted-foreground text-[12px] mt-1 font-sans">
            Interactive trace dashboard of autonomous execution architectures. Hover over zones or trace the pipeline flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="bg-[#C0F0FB] hover:bg-primary/80 text-primary-foreground font-mono text-[11px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>TRACE SYSTEM FLOW</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-primary-foreground font-mono text-[11px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET BLUEPRINT</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
        
        {/* Left Column: Unified Responsive SVG blueprint (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-white/10 rounded-xl p-3 md:p-5 relative flex items-center justify-center">
          <svg
            viewBox="0 0 1000 860"
            className="w-full h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ambient grid background pattern overlay */}
            <defs>
              <pattern id="architecture-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,26,26,0.015)" strokeWidth="0.8" />
              </pattern>
              <pattern id="secure-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1000" height="860" fill="url(#architecture-grid)" />

            {/* Poster Header Title Block */}
            <text x="50" y="55" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="bold" letterSpacing="0.05em">
              GOOGLE I/O 2026: AI-NATIVE INTERNET ARCHITECTURES
            </text>
            <text x="50" y="78" fill="#A1A1AA" fontFamily="monospace" fontSize="10.5" letterSpacing="0.1em">
              INTEGRATED DISTRIBUTED SYSTEM PROTOCOLS
            </text>

            {/* Swiss Editorial Border Delimiters */}
            <line x1="50" x2="950" y1="92" y2="92" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <line x1="50" x2="950" y1="815" y2="815" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

            {/* Main Quad dividing axes */}
            <line x1="500" x2="500" y1="92" y2="815" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <line x1="50" x2="950" y1="453" y2="453" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />


            {/* ═══════════════════════════════════════════════════ */}
            {/* QUADRANT 1: INTELLIGENT NETWORK LAYERS (Top-Left)   */}
            {/* ═══════════════════════════════════════════════════ */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("intelligent_layers")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              {/* Outer boundary hover card */}
              <rect
                x="60"
                y="110"
                width="420"
                height="325"
                rx="8"
                fill={isModuleActive("intelligent_layers") ? "rgba(192,240,251,0.02)" : "transparent"}
                stroke={isModuleActive("intelligent_layers") ? "#C0F0FB" : "transparent"}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              <text x="75" y="140" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="0.08em">
                ANTIGRAVITY DEV FRAMEWORK
              </text>
              <text x="75" y="155" fill="#A1A1AA" fontFamily="monospace" fontSize="8" letterSpacing="0.1em">
                AGENT ORCHESTRATION ENGINE // MULTI-AGENT STATE GRID
              </text>
            </g>

            {/* Sub-node A: Neural Protocols */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("neural_protocols")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="75"
                y="180"
                width="390"
                height="65"
                rx="6"
                fill={isModuleActive("neural_protocols") ? "rgba(192,240,251,0.05)" : "#FAF9F6"}
                stroke={isModuleActive("neural_protocols") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("neural_protocols") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="90" y="210" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="bold">
                GEMINI SPARK RUNTIME
              </text>
              <text x="90" y="226" fill="#9CA3AF" fontFamily="monospace" fontSize="7.5">
                Autonomous 24/7 background agent execution cycles
              </text>
              <circle cx="430" cy="212" r="10" fill={isModuleActive("neural_protocols") ? "#C0F0FB" : "rgba(255,255,255,0.15)"} className="transition-colors" />
              <path d="M 425,212 L 435,212 M 430,207 L 430,217" stroke="white" strokeWidth="1.2" />
            </g>

            {/* Sub-node B: Dynamic Agents */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("dynamic_agents")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="75"
                y="265"
                width="390"
                height="65"
                rx="6"
                fill={isModuleActive("dynamic_agents") ? "rgba(192,240,251,0.05)" : "#FAF9F6"}
                stroke={isModuleActive("dynamic_agents") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("dynamic_agents") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="90" y="295" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="bold">
                COLLABORATIVE AGENTS
              </text>
              <text x="90" y="311" fill="#9CA3AF" fontFamily="monospace" fontSize="7.5">
                Synchronizing multiple specialized coding and data threads
              </text>
              <circle cx="430" cy="297" r="10" fill={isModuleActive("dynamic_agents") ? "#C0F0FB" : "rgba(255,255,255,0.15)"} className="transition-colors" />
              <path d="M 426,297 Q 430,293 434,297" stroke="white" strokeWidth="1.2" fill="none" />
            </g>

            {/* Sub-node C: Distributed Compute */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("distributed_compute")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="75"
                y="350"
                width="390"
                height="65"
                rx="6"
                fill={isModuleActive("distributed_compute") ? "rgba(192,240,251,0.05)" : "#FAF9F6"}
                stroke={isModuleActive("distributed_compute") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("distributed_compute") ? "2" : "1.2"}
                className="transition-all duration-300"
              />
              <text x="90" y="380" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="bold">
                SANDBOXED COMPUTE
              </text>
              <text x="90" y="396" fill="#9CA3AF" fontFamily="monospace" fontSize="7.5">
                Isolated runtimes protecting local environment files
              </text>
              <circle cx="430" cy="382" r="10" fill={isModuleActive("distributed_compute") ? "#C0F0FB" : "rgba(255,255,255,0.15)"} className="transition-colors" />
              <path d="M 425,382 L 435,382" stroke="white" strokeWidth="1.2" />
            </g>


            {/* ─── CROSS-QUADRANT CONNECTION PATHWAYS ─── */}
            {/* Intelligent Network Layers -> Emergent AI Services */}
            <path
              d="M 465,212 L 535,212"
              stroke={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
              strokeWidth={isModuleActive("emergent_services") ? "2" : "1.5"}
              strokeDasharray={isModuleActive("emergent_services") ? "3 3" : "none"}
            />
            {/* Distributed Compute -> Decentralized Structures */}
            <path
              d="M 270,415 L 270,490"
              stroke={isModuleActive("decentralized_structures") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
              strokeWidth={isModuleActive("decentralized_structures") ? "2" : "1.5"}
            />


            {/* ═══════════════════════════════════════════════════ */}
            {/* QUADRANT 2: EMERGENT AI SERVICES (Top-Right)        */}
            {/* ═══════════════════════════════════════════════════ */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("emergent_services")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="520"
                y="110"
                width="420"
                height="325"
                rx="8"
                fill={isModuleActive("emergent_services") ? "rgba(192,240,251,0.02)" : "transparent"}
                stroke={isModuleActive("emergent_services") ? "#C0F0FB" : "transparent"}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              <text x="535" y="140" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="0.08em">
                GEMINI 3.5 FLASH ENGINE
              </text>
              <text x="535" y="155" fill="#A1A1AA" fontFamily="monospace" fontSize="8" letterSpacing="0.1em">
                LOW-LATENCY TOKEN GENERATION // MULTIMODAL CONTEXT PIPELINES
              </text>

              {/* Diagonal Trajectory Vector */}
              <path
                d="M 540,360 L 860,190"
                stroke={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("emergent_services") ? "2.5" : "1.5"}
              />
              <polygon
                points="860,185 865,198 850,196"
                fill={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
              />

              {/* Data packet orbits on the trajectory */}
              {[
                { cx: 540, cy: 360 },
                { cx: 620, cy: 317 },
                { cx: 700, cy: 275 },
                { cx: 780, cy: 232 },
                { cx: 860, cy: 190 }
              ].map((orbit, idx) => (
                <g key={idx}>
                  <circle
                    cx={orbit.cx}
                    cy={orbit.cy}
                    r={isModuleActive("emergent_services") ? "7" : "5"}
                    fill={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={orbit.cx}
                    cy={orbit.cy}
                    r="12"
                    stroke={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                    strokeWidth="0.8"
                    opacity={isModuleActive("emergent_services") ? "0.8" : "0.3"}
                    strokeDasharray="2 2"
                  />
                </g>
              ))}

              {/* Context flow sine waveform at bottom of Quad 2 */}
              <path
                d="M 535,400 Q 575,375 615,400 T 695,400 T 775,400 T 855,400 T 935,400"
                stroke={isModuleActive("emergent_services") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth="1.5"
                fill="none"
              />
            </g>


            {/* ═══════════════════════════════════════════════════ */}
            {/* QUADRANT 3: DECENTRALIZED STRUCTURES (Bottom-Left)  */}
            {/* ═══════════════════════════════════════════════════ */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("decentralized_structures")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="60"
                y="470"
                width="420"
                height="325"
                rx="8"
                fill={isModuleActive("decentralized_structures") ? "rgba(192,240,251,0.02)" : "transparent"}
                stroke={isModuleActive("decentralized_structures") ? "#C0F0FB" : "transparent"}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              <text x="75" y="500" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="0.08em">
                MULTI-AGENT STATE MESH
              </text>
              <text x="75" y="515" fill="#A1A1AA" fontFamily="monospace" fontSize="8" letterSpacing="0.1em">
                STATE CONCURRENCY // DATA PARALLEL STATE SYNC
              </text>

              {/* Connected Orbit Nodes Graph */}
              {/* Internal Connecting Lines */}
              {[
                { x1: 270, y1: 650, x2: 170, y2: 590 },
                { x1: 270, y1: 650, x2: 370, y2: 590 },
                { x1: 270, y1: 650, x2: 170, y2: 710 },
                { x1: 270, y1: 650, x2: 370, y2: 710 },
                { x1: 170, y1: 590, x2: 370, y2: 590 },
                { x1: 170, y1: 710, x2: 370, y2: 710 },
                { x1: 170, y1: 590, x2: 170, y2: 710 },
                { x1: 370, y1: 590, x2: 370, y2: 710 }
              ].map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={isModuleActive("decentralized_structures") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isModuleActive("decentralized_structures") ? "1.5" : "1"}
                  opacity={isModuleActive("decentralized_structures") ? "0.8" : "0.4"}
                />
              ))}

              {/* Center Core Hub */}
              <circle
                cx="270"
                cy="650"
                r="18"
                fill={isModuleActive("decentralized_structures") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                className="transition-colors duration-300"
              />
              <circle
                cx="270"
                cy="650"
                r="26"
                stroke={isModuleActive("decentralized_structures") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth="1.2"
                fill="none"
                strokeDasharray="3 3"
              />

              {/* Orbiting Satellite Nodes */}
              {[
                { cx: 170, cy: 590 },
                { cx: 370, cy: 590 },
                { cx: 170, cy: 710 },
                { cx: 370, cy: 710 }
              ].map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.cx}
                  cy={dot.cy}
                  r="8"
                  fill={isModuleActive("decentralized_structures") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                  stroke="white"
                  strokeWidth="1.5"
                  className="transition-colors duration-300"
                />
              ))}
            </g>

            {/* Decentralized Structures -> Seamless AI Ecosystem */}
            <path
              d="M 440,650 L 535,650"
              stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
              strokeWidth={isModuleActive("seamless_ecosystem") ? "2" : "1.5"}
              strokeDasharray={isModuleActive("seamless_ecosystem") ? "3 3" : "none"}
            />


            {/* ═══════════════════════════════════════════════════ */}
            {/* MODULE 5: SECURE ADAPTIVE FABRIC (Middle-Right)      */}
            {/* ═══════════════════════════════════════════════════ */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("secure_fabric")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              {/* Border Container Box with detailed hatch pattern overlay */}
              <rect
                x="765"
                y="310"
                width="160"
                height="150"
                rx="12"
                fill="url(#secure-hatch)"
                stroke={isModuleActive("secure_fabric") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("secure_fabric") ? "2" : "1"}
                className="transition-all duration-300"
              />
              <rect
                x="775"
                y="320"
                width="140"
                height="20"
                rx="4"
                fill={isModuleActive("secure_fabric") ? "rgba(192,240,251,0.1)" : "#9CA3AF"}
                opacity={isModuleActive("secure_fabric") ? "1" : "0.2"}
                className="transition-all duration-300"
              />
              <text x="785" y="333" fill={isModuleActive("secure_fabric") ? "#C0F0FB" : "#FFFFFF"} fontFamily="monospace" fontSize="7.5" fontWeight="bold" className="transition-colors">
                SPARK CLOUD PERSISTENCE
              </text>

              {/* Shield Visual Core */}
              <circle
                cx="845"
                cy="395"
                r="22"
                fill={isModuleActive("secure_fabric") ? "rgba(192,240,251,0.08)" : "#FAF9F6"}
                stroke={isModuleActive("secure_fabric") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <foreignObject x="836" y="386" width="18" height="18" className={isModuleActive("secure_fabric") ? "text-[#C0F0FB]" : "text-muted-foreground"}>
                <Shield className="w-4 h-4 shrink-0" />
              </foreignObject>

              <text x="785" y="440" fill="#A1A1AA" fontFamily="monospace" fontSize="6.5">
                [SPARK.CORE // PERSIST-V2]
              </text>
            </g>


            {/* ═══════════════════════════════════════════════════ */}
            {/* QUADRANT 4: SEAMLESS AI ECOSYSTEM (Bottom-Right)    */}
            {/* ═══════════════════════════════════════════════════ */}
            <g
              onMouseEnter={() => !isSimulating && setHoveredModule("seamless_ecosystem")}
              onMouseLeave={() => !isSimulating && setHoveredModule(null)}
              className="cursor-pointer group"
            >
              <rect
                x="520"
                y="470"
                width="420"
                height="325"
                rx="8"
                fill={isModuleActive("seamless_ecosystem") ? "rgba(192,240,251,0.02)" : "transparent"}
                stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "transparent"}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              <text x="535" y="500" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="0.08em">
                ENTERPRISE & WORKFLOW INTEGRATION
              </text>
              <text x="535" y="515" fill="#A1A1AA" fontFamily="monospace" fontSize="8" letterSpacing="0.1em">
                WORKSPACE EVENT TRIGGERS // AGENT PIPELINE SETTLEMENTS
              </text>

              {/* Incoming gRPC/REST Integrations */}
              {[
                { label: "Gmail Triggers", x: 535, y: 540 },
                { label: "Agent Webhooks", x: 670, y: 540 },
                { label: "External APIs", x: 805, y: 540 }
              ].map((input, idx) => (
                <g key={idx}>
                  <rect
                    x={input.x}
                    y={input.y}
                    width="110"
                    height="35"
                    rx="5"
                    fill="#1A1A1A"
                    stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                    strokeWidth="1"
                    className="transition-all"
                  />
                  <text x={input.x + 8} y={input.y + 20} fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="bold">
                    {input.label}
                  </text>
                  
                  {/* Tracing lines from inputs down to Gateway processor */}
                  <path
                    d={`M ${input.x + 55},${input.y + 35} L ${input.x + 55},595 L 730,595 L 730,625`}
                    stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                    strokeWidth="1"
                    fill="none"
                  />
                </g>
              ))}

              {/* Execution Gateway Processor Card */}
              <rect
                x="635"
                y="625"
                width="190"
                height="60"
                rx="6"
                fill={isModuleActive("seamless_ecosystem") ? "rgba(192,240,251,0.05)" : "#FAF9F6"}
                stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth={isModuleActive("seamless_ecosystem") ? "2" : "1.2"}
                className="transition-all"
              />
              <text x="650" y="650" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="bold">
                GEMINI SPARK ORCHESTRATOR
              </text>
              <text x="650" y="666" fill="#9CA3AF" fontFamily="monospace" fontSize="7.5">
                Autonomous background execution flow
              </text>

              {/* Gateway to resolution endpoint path */}
              <path
                d="M 730,685 L 730,730"
                stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth="1.5"
              />

              {/* Stable Run Resolution final node */}
              <rect
                x="615"
                y="730"
                width="230"
                height="45"
                rx="6"
                fill="#1A1A1A"
                stroke={isModuleActive("seamless_ecosystem") ? "#C0F0FB" : "rgba(255,255,255,0.15)"}
                strokeWidth="1.5"
              />
              <text x="625" y="756" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="bold">
                RESOLVED BUSINESS SETTLEMENT
              </text>
            </g>

          </svg>
        </div>

        {/* Right Column: Node Inspector & status display (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          
          {/* Status Inspector Box */}
          <div className="bg-card border border-white/10 rounded-xl p-5 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-[#C0F0FB]" />
                  <span>Ecosystem Inspector</span>
                </span>
                <span className="font-mono text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] animate-pulse" />
                  <span>ACTIVE</span>
                </span>
              </div>

              <AnimatePresence mode="wait">
                {hoveredModule && moduleDetails[hoveredModule] ? (
                  <motion.div
                    key={hoveredModule}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <span className="text-[9px] font-mono tracking-wider text-[#C0F0FB] bg-[#C0F0FB]/5 px-2 py-0.5 rounded uppercase font-bold">
                        {moduleDetails[hoveredModule].category}
                      </span>
                      <h4 className="text-lg font-black text-foreground mt-2 tracking-tight">
                        {moduleDetails[hoveredModule].title}
                      </h4>
                    </div>

                    <p className="text-muted-foreground text-[13px] leading-relaxed font-sans font-normal">
                      {moduleDetails[hoveredModule].description}
                    </p>

                    <div className="bg-background border border-white/10 p-3 rounded-lg font-mono text-[9.5px] text-muted-foreground space-y-1">
                      <span className="text-foreground font-bold block mb-1">MODULE SPECS:</span>
                      <span className="block">{moduleDetails[hoveredModule].metrics}</span>
                      <span className="block">Status: SECURED // Verification: PASS</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-3"
                  >
                    <HelpCircle className="w-10 h-10 text-[#9CA3AF] mx-auto animate-pulse" />
                    <p className="text-[13px] text-muted-foreground font-sans max-w-[200px] mx-auto">
                      Hover over any architectural segment to inspect its system specs and telemetry status in real time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Core Load Telemetry Charts */}
            <div className="border-t border-white/10 pt-4 mt-6">
              <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase block mb-3">
                Global Gateway Telemetry
              </span>
              <div className="space-y-2.5">
                {[
                  { label: "Intelligent Ingestion", val: isSimulating ? 82 : 45, color: "bg-[#C0F0FB]" },
                  { label: "Fabric Validation", val: isSimulating ? 96 : 28, color: "bg-[#6B7280]" },
                  { label: "Ecosystem Settlement", val: isSimulating ? 99 : 88, color: isSimulating ? "bg-emerald-500" : "bg-[#C0F0FB]" }
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex justify-between text-[9.5px] font-mono">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="font-bold text-foreground">{bar.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-background border border-white/10 rounded-full overflow-hidden">
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

          {/* Model Status Card */}
          <div className="bg-background border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-card border border-white/10 flex items-center justify-center">
                {isSimulating ? (
                  <Activity className="w-4 h-4 text-[#C0F0FB] animate-spin" />
                ) : (
                  <Workflow className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">System Trace</p>
                <p className="text-[12px] font-bold text-foreground font-sans">
                  {isSimulating ? `TRACE SIMULATOR ACTIVE` : "SYSTEM SECURED & READY"}
                </p>
              </div>
            </div>
            {isSimulating && (
              <span className="text-[8px] font-mono tracking-widest text-[#C0F0FB] bg-[#C0F0FB]/5 border border-[#C0F0FB]/15 px-1.5 py-0.5 rounded animate-pulse">
                TRACE_RUNNING
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
