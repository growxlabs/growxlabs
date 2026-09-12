"use client";

import React from "react";

export function DeepfakeArchitectureDiagram({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full h-full bg-[#05060A] text-neutral-200 font-mono select-none overflow-hidden flex flex-col justify-between p-3 sm:p-5 md:p-6 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(192, 240, 251, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(192, 240, 251, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── Top HUD Telemetry Bar ── */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[9px] sm:text-[10px] tracking-wider text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#C0F0FB] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0F0FB] animate-pulse" />
            GROWX_DEEPFAKE_V2.1
          </span>
          <span className="text-neutral-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-neutral-400">BACKBONE: DINOv2 (ViT-B/14)</span>
          <span className="text-neutral-600 hidden lg:inline">|</span>
          <span className="hidden lg:inline text-neutral-400">LATENT: 768-DIMENSIONAL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-semibold">ACCURACY: 96.89%</span>
          <span className="text-[#C0F0FB] bg-[#C0F0FB]/10 px-2 py-0.5 rounded border border-[#C0F0FB]/20 font-bold">
            18.4ms / INFERENCE
          </span>
        </div>
      </div>

      {/* ── Main Pipeline Grid (5 Stages) ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 sm:gap-3 flex-1 items-stretch my-auto">
        {/* STAGE 1: Live Biometrics */}
        <div className="flex flex-col justify-between bg-[#090B12]/90 border border-neutral-800/90 rounded-lg p-3 hover:border-[#C0F0FB]/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold tracking-widest text-[#C0F0FB] uppercase">
                01. INGESTION
              </span>
              <span className="text-[9px] text-neutral-500">60 FPS</span>
            </div>
            <p className="font-sans font-bold text-xs text-white mb-2 tracking-tight">
              Biometric Feed
            </p>
            <div className="space-y-1.5 text-[10px] text-neutral-400 mb-3">
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Input</span>
                <span className="text-neutral-300 font-bold">224×224 RGB</span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Tokens</span>
                <span className="text-neutral-300 font-bold">14×14 Patches</span>
              </div>
            </div>
          </div>

          {/* SVG Geometric Face Landmark Wireframe */}
          <div className="relative h-20 w-full bg-black/60 rounded border border-white/5 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 80" className="w-20 h-16 text-[#C0F0FB]/70 stroke-current">
              {/* Face Contour */}
              <path d="M 30 20 Q 50 10 70 20 Q 80 50 50 75 Q 20 50 30 20" fill="none" strokeWidth="1" strokeDasharray="2,2" />
              {/* Eyes */}
              <circle cx="40" cy="35" r="3" fill="#C0F0FB" />
              <circle cx="60" cy="35" r="3" fill="#C0F0FB" />
              {/* Nose & Mouth Landmarks */}
              <line x1="50" y1="35" x2="50" y2="48" strokeWidth="1" />
              <line x1="45" y1="48" x2="55" y2="48" strokeWidth="1" />
              <path d="M 42 58 Q 50 63 58 58" fill="none" strokeWidth="1.2" />
              {/* Landmark Mesh Grid */}
              <line x1="40" y1="35" x2="50" y2="48" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="60" y1="35" x2="50" y2="48" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="50" y1="48" x2="42" y2="58" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="50" y1="48" x2="58" y2="58" strokeWidth="0.5" strokeOpacity="0.4" />
            </svg>
            <div className="absolute bottom-1 right-1.5 text-[8px] text-[#C0F0FB] bg-black/80 px-1 rounded">
              68 LANDMARKS
            </div>
          </div>
        </div>

        {/* STAGE 2: DINOv2 Transformer */}
        <div className="flex flex-col justify-between bg-[#090B12]/90 border border-neutral-800/90 rounded-lg p-3 hover:border-[#C0F0FB]/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold tracking-widest text-[#C0F0FB] uppercase">
                02. BACKBONE
              </span>
              <span className="text-[9px] text-emerald-400">86M PARAMS</span>
            </div>
            <p className="font-sans font-bold text-xs text-white mb-2 tracking-tight">
              DINOv2 ViT
            </p>
            <div className="space-y-1.5 text-[10px] text-neutral-400 mb-3">
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Architecture</span>
                <span className="text-neutral-300 font-bold">ViT-B/14</span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Attention</span>
                <span className="text-neutral-300 font-bold">12 Heads</span>
              </div>
            </div>
          </div>

          {/* Transformer Layers Visualizer */}
          <div className="relative h-20 w-full bg-black/60 rounded border border-white/5 p-2 flex flex-col justify-between text-[8px]">
            <div className="bg-neutral-800/80 text-neutral-300 px-1.5 py-0.5 rounded text-center border border-white/5 font-bold">
              MULTI-HEAD ATTENTION
            </div>
            <div className="flex items-center justify-center">
              <span className="text-neutral-600 text-[10px]">↓</span>
            </div>
            <div className="bg-neutral-800/80 text-neutral-300 px-1.5 py-0.5 rounded text-center border border-white/5 font-bold">
              FEED-FORWARD MLP
            </div>
            <div className="text-center text-[8px] text-[#C0F0FB] font-bold">
              EMBEDDING z ∈ ℝ⁷⁶⁸
            </div>
          </div>
        </div>

        {/* STAGE 3: 768-D Latent Manifold */}
        <div className="flex flex-col justify-between bg-[#090B12]/90 border border-neutral-800/90 rounded-lg p-3 hover:border-[#C0F0FB]/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold tracking-widest text-[#C0F0FB] uppercase">
                03. MANIFOLD
              </span>
              <span className="text-[9px] text-[#C0F0FB]">UMAP-3D</span>
            </div>
            <p className="font-sans font-bold text-xs text-white mb-2 tracking-tight">
              Latent Space
            </p>
            <div className="space-y-1.5 text-[10px] text-neutral-400 mb-3">
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Dimension</span>
                <span className="text-neutral-300 font-bold">768-D Dense</span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Clustering</span>
                <span className="text-neutral-300 font-bold">k-NN (k=7)</span>
              </div>
            </div>
          </div>

          {/* 3D Scatter Dispersion Visualization */}
          <div className="relative h-20 w-full bg-black/60 rounded border border-white/5 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 80" className="w-full h-full p-2">
              {/* Coordinate Grid */}
              <line x1="20" y1="70" x2="80" y2="70" stroke="#333" strokeWidth="0.5" />
              <line x1="20" y1="70" x2="20" y2="15" stroke="#333" strokeWidth="0.5" />
              <line x1="20" y1="70" x2="45" y2="45" stroke="#333" strokeWidth="0.5" strokeDasharray="1,2" />
              {/* Authentic Cluster (Emerald) */}
              <circle cx="35" cy="35" r="2.5" fill="#10B981" />
              <circle cx="40" cy="32" r="2" fill="#10B981" />
              <circle cx="38" cy="40" r="2.5" fill="#10B981" />
              <circle cx="32" cy="38" r="1.8" fill="#10B981" />
              {/* Deepfake Cluster (Rose) */}
              <circle cx="70" cy="50" r="2.5" fill="#F43F5E" />
              <circle cx="65" cy="55" r="2" fill="#F43F5E" />
              <circle cx="75" cy="48" r="2.2" fill="#F43F5E" />
              {/* Query Probe Point */}
              <circle cx="36" cy="36" r="3.5" fill="#C0F0FB" stroke="#fff" strokeWidth="1" className="animate-ping" />
            </svg>
            <div className="absolute top-1 right-1.5 text-[7px] text-emerald-400 bg-black/80 px-1 rounded">
              REAL CLUSTER
            </div>
            <div className="absolute bottom-1 right-1.5 text-[7px] text-rose-400 bg-black/80 px-1 rounded">
              SYNTHETIC
            </div>
          </div>
        </div>

        {/* STAGE 4: Biomechanical Real-World Physics */}
        <div className="flex flex-col justify-between bg-[#090B12]/90 border border-neutral-800/90 rounded-lg p-3 hover:border-[#C0F0FB]/40 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold tracking-widest text-[#C0F0FB] uppercase">
                04. PHYSICS
              </span>
              <span className="text-[9px] text-emerald-400">PASSED</span>
            </div>
            <p className="font-sans font-bold text-xs text-white mb-2 tracking-tight">
              Biomechanical
            </p>
            <div className="space-y-1.5 text-[10px] text-neutral-400 mb-3">
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Cranial Sync</span>
                <span className="text-emerald-400 font-bold">Match (0.99)</span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-white/5 flex items-center justify-between">
                <span>Lip-Phoneme</span>
                <span className="text-emerald-400 font-bold">Synchronous</span>
              </div>
            </div>
          </div>

          {/* rPPG Subdermal Pulse Waveform */}
          <div className="relative h-20 w-full bg-black/60 rounded border border-white/5 flex flex-col justify-between p-2">
            <div className="text-[8px] text-neutral-400 flex justify-between">
              <span>rPPG PULSE WAVE</span>
              <span className="text-emerald-400 font-bold">72 BPM</span>
            </div>
            <svg viewBox="0 0 100 30" className="w-full h-8 text-emerald-400 stroke-current fill-none">
              <path
                d="M 0 15 L 20 15 L 25 12 L 30 18 L 35 15 L 42 15 L 45 3 L 48 27 L 51 10 L 54 18 L 57 15 L 75 15 L 78 12 L 82 18 L 86 15 L 100 15"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-[8px] text-neutral-500 truncate">
              VASCULAR BLOOD-FLOW DETECTED
            </div>
          </div>
        </div>

        {/* STAGE 5: Decision Verification Head */}
        <div className="flex flex-col justify-between bg-[#090B12]/90 border border-emerald-500/40 rounded-lg p-3 group relative">
          <div className="absolute top-2 right-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                05. VERIFIED
              </span>
            </div>
            <p className="font-sans font-bold text-xs text-white mb-2 tracking-tight">
              Classification
            </p>

            {/* Probability Bars */}
            <div className="space-y-2 mb-3 text-[9px]">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-emerald-300 font-bold">Authentic Human</span>
                  <span className="text-emerald-400 font-bold">98.4%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "98.4%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-neutral-400">Synthetic GenAI</span>
                  <span className="text-neutral-300">1.1%</span>
                </div>
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: "1.1%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-neutral-400">Deepfake Swap</span>
                  <span className="text-neutral-300">0.5%</span>
                </div>
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: "0.5%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Final Verification Status Stamp */}
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded p-1.5 text-center">
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase block">
              ✓ GENUINE HUMAN
            </span>
            <span className="text-[8px] text-neutral-400 block mt-0.5">
              Confidence: 98.4% · Macro F1: 0.9688
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom HUD Architecture Footer ── */}
      <div className="flex flex-wrap items-center justify-between pt-3 mt-3 border-t border-white/10 text-[9px] sm:text-[10px] text-neutral-500">
        <div className="flex items-center gap-2 sm:gap-4">
          <span>DATASET: 17,978 VERIFIED IMAGES</span>
          <span className="text-neutral-700">·</span>
          <span>FALSE POSITIVE RATE: &lt; 4.8%</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <span>PROVENANCE: MULTIMODAL ZERO-TRUST RUNTIME</span>
        </div>
      </div>
    </div>
  );
}
