"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Node {
  id: string;
  cx: number;
  cy: number;
  label: string;
  desc: string;
}

export function PipelineSection() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const column0: Node[] = [
    { id: "A0", cx: 15, cy: 10, label: "Design", desc: "Premium interfaces" },
    { id: "A1", cx: 15, cy: 30, label: "Code", desc: "Clean frontend" },
    { id: "A2", cx: 15, cy: 50, label: "Data", desc: "Structured schemas" },
    { id: "A3", cx: 15, cy: 70, label: "API", desc: "Secure endpoints" },
    { id: "A4", cx: 15, cy: 90, label: "Logic", desc: "Business rules" },
  ];

  const column1: Node[] = [
    { id: "B0", cx: 42, cy: 20, label: "Frontend", desc: "React components" },
    { id: "B1", cx: 42, cy: 40, label: "Backend", desc: "Node runtimes" },
    { id: "B2", cx: 42, cy: 60, label: "Database", desc: "Relational storage" },
    { id: "B3", cx: 42, cy: 80, label: "Caching", desc: "Fast retrieval" },
  ];

  const column2: Node[] = [
    { id: "C0", cx: 68, cy: 30, label: "AI Core", desc: "Neural engines" },
    { id: "C1", cx: 68, cy: 50, label: "Orchestration", desc: "Workflow agents" },
    { id: "C2", cx: 68, cy: 70, label: "Security", desc: "Secure tokens" },
  ];

  const column3: Node[] = [
    { id: "D0", cx: 94, cy: 20, label: "Integration", desc: "Third-party APIs" },
    { id: "D1", cx: 94, cy: 40, label: "Messaging", desc: "Real-time updates" },
    { id: "D2", cx: 94, cy: 60, label: "Payments", desc: "Stripe billing" },
    { id: "D3", cx: 94, cy: 80, label: "Webhooks", desc: "Event listeners" },
  ];

  const column4: Node[] = [
    { id: "E0", cx: 121, cy: 10, label: "Deployment", desc: "Cloud deployment" },
    { id: "E1", cx: 121, cy: 30, label: "Scaling", desc: "Load balancers" },
    { id: "E2", cx: 121, cy: 50, label: "Monitoring", desc: "Log tracking" },
    { id: "E3", cx: 121, cy: 70, label: "CDN", desc: "Edge networks" },
    { id: "E4", cx: 121, cy: 90, label: "Uptime", desc: "Continuous uptime" },
  ];

  const allNodes = [...column0, ...column1, ...column2, ...column3, ...column4];

  // Helper to generate connection paths between two columns
  const renderConnections = (colsFrom: Node[], colsTo: Node[]) => {
    return colsFrom.map((nFrom) =>
      colsTo.map((nTo) => {
        const pathId = `${nFrom.id}-${nTo.id}`;
        const isActive = activeNode === nFrom.id || activeNode === nTo.id;
        return (
          <g key={pathId}>
            {/* Background thin lines */}
            <motion.line
              x1={nFrom.cx}
              y1={nFrom.cy}
              x2={nTo.cx}
              y2={nTo.cy}
              stroke={isActive ? "#C0F0FB" : "rgba(255, 255, 255, 0.07)"}
              strokeWidth={isActive ? 0.8 : 0.35}
              transition={{ duration: 0.3 }}
            />
            {/* Pulsing particles along active lines */}
            {isActive && (
              <circle r="0.6" fill="#C0F0FB">
                <animateMotion
                  path={`M ${nFrom.cx} ${nFrom.cy} L ${nTo.cx} ${nTo.cy}`}
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })
    );
  };

  return (
    <section className="w-full lg:h-screen lg:min-h-[750px] flex items-center py-20 lg:py-0 px-6 md:px-10 xl:px-16 2xl:px-24 bg-background relative overflow-hidden select-none">
      {/* Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Left Column: Copy */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left z-10">
            <h2 className="text-[clamp(32px,4.5vw,52px)] font-black text-foreground leading-[1.05] tracking-tight">
              Enterprise AI & <br className="hidden sm:inline" />
              Custom Product Engineering
            </h2>
          <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-relaxed max-w-xl mx-auto lg:mx-0">
            We are an AI Engineering Lab and software company. We design, build, and deploy production-grade AI systems, custom workflows, and automated pipelines for enterprise operations at scale.
          </p>
        </div>

        {/* Right Column: Visual Neural Graph */}
        <div className="lg:col-span-7 flex justify-center items-center w-full z-10">
          <div className="relative w-full max-w-[680px] aspect-[136/100]">
            {/* Subtle glow hubs in background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#C0F0FB]/5 blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 left-[68%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-[#C0F0FB]/3 blur-[60px] pointer-events-none" />

            <svg
              viewBox="0 0 136 100"
              className="w-full h-full select-none"
              style={{ overflow: "visible" }}
            >
              {/* Lines / Connections */}
              {renderConnections(column0, column1)}
              {renderConnections(column1, column2)}
              {renderConnections(column2, column3)}
              {renderConnections(column3, column4)}

              {/* Pulse animation for steady state background data flow */}
              <circle r="0.4" fill="rgba(255, 255, 255, 0.25)">
                <animateMotion
                  path="M 15 50 L 42 40 L 68 50 L 94 40 L 121 50"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="0.4" fill="rgba(192, 240, 251, 0.3)">
                <animateMotion
                  path="M 15 10 L 42 20 L 68 30 L 94 20 L 121 10"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="0.4" fill="rgba(255, 255, 255, 0.25)">
                <animateMotion
                  path="M 15 90 L 42 80 L 68 70 L 94 80 L 121 90"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Nodes rendering */}
              {allNodes.map((node) => {
                const isActive = activeNode === node.id;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group/node"
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                  >
                    {/* Hover larger transparent target for easy mousing */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={4}
                      fill="transparent"
                    />

                    {/* Node Dot */}
                    <motion.circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isActive ? 1.4 : 0.9}
                      fill={isActive ? "#C0F0FB" : "rgba(255, 255, 255, 0.35)"}
                      stroke={isActive ? "rgba(192, 240, 251, 0.4)" : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth={isActive ? 0.8 : 0.4}
                      animate={{
                        scale: isActive ? 1.25 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
