"use client";

import React, { useState, useMemo } from "react";
import * as Icons from "@/components/icons";
import { growxIconMigration } from "@/components/icons";

interface IconItem {
  id: string;
  name: keyof typeof Icons;
  group: 
    | "CORE"
    | "NAVIGATION"
    | "INTERFACE"
    | "FILES"
    | "DEVELOPER"
    | "DATA"
    | "COMMUNICATION"
    | "IDENTITY"
    | "SECURITY"
    | "WEB & CRAWL"
    | "AGENTS"
    | "STATUS";
  purpose: string;
  keywords: string[];
}

const ALL_ICONS: IconItem[] = [
  // 01 — CORE (10)
  { id: "menu", name: "GrowxMenu", group: "CORE", purpose: "Main GrowxLabs navigation caliper hierarchy", keywords: ["menu", "nav", "hamburger", "bars", "drawer"] },
  { id: "search", name: "GrowxSearch", group: "CORE", purpose: "Website search & interface discovery lens", keywords: ["search", "find", "lookup", "explore", "query"] },
  { id: "arrow-right", name: "GrowxArrowRight", group: "CORE", purpose: "Primary directional action vector", keywords: ["arrow", "right", "next", "continue", "explore"] },
  { id: "external-link", name: "GrowxExternalLink", group: "CORE", purpose: "External destination link & launch ray", keywords: ["external", "link", "out", "newtab", "url"] },
  { id: "contact", name: "GrowxContact", group: "CORE", purpose: "Contact GrowxLabs & direct communication boundary", keywords: ["contact", "message", "chat", "email", "talk"] },
  { id: "product", name: "GrowxProduct", group: "CORE", purpose: "Software products & shipped constructs", keywords: ["product", "software", "box", "package", "cube"] },
  { id: "research", name: "GrowxResearch", group: "CORE", purpose: "R&D, GrowX Crawl optical discovery aperture", keywords: ["research", "observe", "scope", "discover", "r&d"] },
  { id: "terminal", name: "GrowxTerminal", group: "CORE", purpose: "CLI, Pipper, engineering execution chevron", keywords: ["terminal", "cli", "command", "prompt", "code"] },
  { id: "architecture", name: "GrowxArchitecture", group: "CORE", purpose: "System architecture nodes & orthogonal data bus", keywords: ["architecture", "system", "infrastructure", "nodes", "topology"] },
  { id: "security", name: "GrowxSecurity", group: "CORE", purpose: "Protective boundary polygon & verification keyway", keywords: ["security", "shield", "protect", "defense", "secure"] },

  // 02 — NAVIGATION (11)
  { id: "chevron-down", name: "GrowxChevronDown", group: "NAVIGATION", purpose: "Downward directional disclosure chevron", keywords: ["chevron", "down", "expand", "dropdown", "select"] },
  { id: "chevron-up", name: "GrowxChevronUp", group: "NAVIGATION", purpose: "Upward directional disclosure chevron", keywords: ["chevron", "up", "collapse", "dropdown"] },
  { id: "chevron-left", name: "GrowxChevronLeft", group: "NAVIGATION", purpose: "Leftward navigational chevron", keywords: ["chevron", "left", "back", "previous"] },
  { id: "chevron-right", name: "GrowxChevronRight", group: "NAVIGATION", purpose: "Rightward navigational chevron", keywords: ["chevron", "right", "forward", "next"] },
  { id: "arrow-left", name: "GrowxArrowLeft", group: "NAVIGATION", purpose: "Directional vector pointing left", keywords: ["arrow", "left", "back", "return"] },
  { id: "arrow-up", name: "GrowxArrowUp", group: "NAVIGATION", purpose: "Directional vector pointing up", keywords: ["arrow", "up", "ascend", "top"] },
  { id: "arrow-down", name: "GrowxArrowDown", group: "NAVIGATION", purpose: "Directional vector pointing down", keywords: ["arrow", "down", "descend", "bottom"] },
  { id: "expand", name: "GrowxExpand", group: "NAVIGATION", purpose: "Diagonal outward viewport expand", keywords: ["expand", "maximize", "fullscreen", "grow"] },
  { id: "collapse", name: "GrowxCollapse", group: "NAVIGATION", purpose: "Diagonal inward collapse vectors", keywords: ["collapse", "minimize", "shrink", "close"] },
  { id: "more-horizontal", name: "GrowxMoreHorizontal", group: "NAVIGATION", purpose: "3-point horizontal index array", keywords: ["more", "options", "dots", "menu", "horizontal"] },
  { id: "more-vertical", name: "GrowxMoreVertical", group: "NAVIGATION", purpose: "3-point vertical index array", keywords: ["more", "options", "dots", "kebab", "vertical"] },

  // 03 — INTERFACE (13)
  { id: "dashboard", name: "GrowxDashboard", group: "INTERFACE", purpose: "Asymmetric split overview workspace", keywords: ["dashboard", "overview", "console", "workspace"] },
  { id: "settings", name: "GrowxSettings", group: "INTERFACE", purpose: "Precision multi-track calibration sliders", keywords: ["settings", "configure", "sliders", "preferences", "options"] },
  { id: "notification", name: "GrowxNotification", group: "INTERFACE", purpose: "Acoustic signal emitter beacon", keywords: ["notification", "bell", "alert", "update", "ping"] },
  { id: "close", name: "GrowxClose", group: "INTERFACE", purpose: "Precision dismissal cross", keywords: ["close", "dismiss", "x", "cancel", "remove"] },
  { id: "add", name: "GrowxAdd", group: "INTERFACE", purpose: "Orthogonal addition vector", keywords: ["add", "plus", "create", "new", "insert"] },
  { id: "remove", name: "GrowxRemove", group: "INTERFACE", purpose: "Horizontal subtraction vector", keywords: ["remove", "minus", "delete", "subtract"] },
  { id: "check", name: "GrowxCheck", group: "INTERFACE", purpose: "Engineered verification vector", keywords: ["check", "done", "confirm", "accept", "tick"] },
  { id: "refresh", name: "GrowxRefresh", group: "INTERFACE", purpose: "Dual-arc cycle synchronization loop", keywords: ["refresh", "reload", "sync", "cycle", "update"] },
  { id: "fullscreen", name: "GrowxFullscreen", group: "INTERFACE", purpose: "Four-corner display viewport perimeter", keywords: ["fullscreen", "maximize", "screen", "frame"] },
  { id: "minimize", name: "GrowxMinimize", group: "INTERFACE", purpose: "Window minimize anchor rule", keywords: ["minimize", "collapse", "tray", "hide"] },
  { id: "panel-left", name: "GrowxPanelLeft", group: "INTERFACE", purpose: "Split container with left pane focus", keywords: ["panel", "left", "layout", "sidebar"] },
  { id: "panel-right", name: "GrowxPanelRight", group: "INTERFACE", purpose: "Split container with right inspector focus", keywords: ["panel", "right", "inspector", "drawer"] },
  { id: "sidebar", name: "GrowxSidebar", group: "INTERFACE", purpose: "Collapsible navigation sidebar perimeter", keywords: ["sidebar", "drawer", "navigation", "layout"] },

  // 04 — FILES (11)
  { id: "document", name: "GrowxDocument", group: "FILES", purpose: "Folded-corner technical spec report", keywords: ["document", "spec", "report", "paper", "doc"] },
  { id: "file", name: "GrowxFile", group: "FILES", purpose: "Generic flat file asset with notched corner", keywords: ["file", "asset", "blob", "item"] },
  { id: "folder", name: "GrowxFolder", group: "FILES", purpose: "Tabbed directory storage vault", keywords: ["folder", "directory", "vault", "group"] },
  { id: "folder-open", name: "GrowxFolderOpen", group: "FILES", purpose: "Active open directory vault", keywords: ["folder", "open", "browse", "directory"] },
  { id: "upload", name: "GrowxUpload", group: "FILES", purpose: "Upward asset ingress vector into cloud", keywords: ["upload", "import", "ingress", "push"] },
  { id: "download", name: "GrowxDownload", group: "FILES", purpose: "Downward asset egress vector to disk", keywords: ["download", "export", "egress", "save"] },
  { id: "copy", name: "GrowxCopy", group: "FILES", purpose: "Dual cascading layered asset sheets", keywords: ["copy", "clone", "duplicate", "clipboard"] },
  { id: "save", name: "GrowxSave", group: "FILES", purpose: "Physical storage medium with write window", keywords: ["save", "disk", "write", "commit"] },
  { id: "archive", name: "GrowxArchive", group: "FILES", purpose: "Cold storage archive chest with slot index", keywords: ["archive", "cold", "backup", "vault"] },
  { id: "trash", name: "GrowxTrash", group: "FILES", purpose: "Disposal receptacle with lid separation rule", keywords: ["trash", "delete", "bin", "remove", "destroy"] },
  { id: "attachment", name: "GrowxAttachment", group: "FILES", purpose: "Orthogonal interlocking binder link", keywords: ["attachment", "paperclip", "link", "attach"] },

  // 05 — DEVELOPER (11)
  { id: "developer", name: "GrowxDeveloper", group: "DEVELOPER", purpose: "Interlocking logic brackets flanking compiler vector", keywords: ["developer", "dev", "engineering", "code"] },
  { id: "code", name: "GrowxCode", group: "DEVELOPER", purpose: "Syntax brackets with central token dot", keywords: ["code", "syntax", "tags", "html", "script"] },
  { id: "git-branch", name: "GrowxGitBranch", group: "DEVELOPER", purpose: "Divergent code stream graph node", keywords: ["git", "branch", "fork", "stream", "version"] },
  { id: "commit", name: "GrowxCommit", group: "DEVELOPER", purpose: "Linear execution ledger point", keywords: ["commit", "hash", "git", "checkpoint"] },
  { id: "repository", name: "GrowxRepository", group: "DEVELOPER", purpose: "Indexed source code ledger vault", keywords: ["repo", "repository", "git", "project", "code"] },
  { id: "command", name: "GrowxCommand", group: "DEVELOPER", purpose: "Engineered system invocation loop", keywords: ["command", "cmd", "meta", "key", "hotkey"] },
  { id: "bug", name: "GrowxBug", group: "DEVELOPER", purpose: "System defect anomaly trace with sensor legs", keywords: ["bug", "defect", "issue", "error", "fault"] },
  { id: "package", name: "GrowxPackage", group: "DEVELOPER", purpose: "Isometric software distribution artifact", keywords: ["package", "npm", "bundle", "artifact", "build"] },
  { id: "api", name: "GrowxAPI", group: "DEVELOPER", purpose: "Bidirectional service contract gateway", keywords: ["api", "rest", "graphql", "rpc", "endpoint", "gateway"] },
  { id: "deploy", name: "GrowxDeploy", group: "DEVELOPER", purpose: "Ascending launch vector to edge production", keywords: ["deploy", "ship", "launch", "release", "production"] },
  { id: "logs", name: "GrowxLogs", group: "DEVELOPER", purpose: "Sequential execution ledger stream with status ticks", keywords: ["logs", "stdout", "stream", "trace", "events"] },

  // 06 — DATA (12)
  { id: "database", name: "GrowxDatabase", group: "DATA", purpose: "Structured storage ledger vault with schema tiers", keywords: ["database", "db", "sql", "schema", "postgres"] },
  { id: "storage", name: "GrowxStorage", group: "DATA", purpose: "Multi-tier archive drawer bays with asset slots", keywords: ["storage", "s3", "blob", "bucket", "disk", "media"] },
  { id: "table", name: "GrowxTable", group: "DATA", purpose: "Tabular database grid with schema header", keywords: ["table", "grid", "rows", "columns", "data"] },
  { id: "chart", name: "GrowxChart", group: "DATA", purpose: "Multi-tier metrics telemetry bars", keywords: ["chart", "analytics", "graph", "metrics", "stats"] },
  { id: "activity", name: "GrowxActivity", group: "DATA", purpose: "Real-time system pulse heartbeat vector", keywords: ["activity", "pulse", "live", "telemetry", "health"] },
  { id: "filter", name: "GrowxFilter", group: "DATA", purpose: "Stepped funnel classification gate", keywords: ["filter", "funnel", "refine", "search"] },
  { id: "sort", name: "GrowxSort", group: "DATA", purpose: "Bidirectional ordinal sorting vector", keywords: ["sort", "order", "asc", "desc", "rank"] },
  { id: "history", name: "GrowxHistory", group: "DATA", purpose: "Temporal counter-clockwise replay trace", keywords: ["history", "undo", "time", "log", "revert"] },
  { id: "clock", name: "GrowxClock", group: "DATA", purpose: "Precision chronograph dial with orthogonal hands", keywords: ["clock", "time", "duration", "timer", "schedule"] },
  { id: "calendar", name: "GrowxCalendar", group: "DATA", purpose: "Scheduled temporal grid with binder lugs", keywords: ["calendar", "date", "schedule", "events"] },
  { id: "list", name: "GrowxList", group: "DATA", purpose: "Sequential structured item index", keywords: ["list", "items", "index", "catalog", "directory"] },
  { id: "grid", name: "GrowxGrid", group: "DATA", purpose: "4-cell modular matrix partition", keywords: ["grid", "layout", "cards", "modules"] },

  // 07 — COMMUNICATION (6)
  { id: "message", name: "GrowxMessage", group: "COMMUNICATION", purpose: "Direct communication transcript box with signal tick", keywords: ["message", "chat", "sms", "talk", "dialogue"] },
  { id: "mail", name: "GrowxMail", group: "COMMUNICATION", purpose: "Engineered postal packet with faceted fold", keywords: ["mail", "email", "inbox", "postal", "letter"] },
  { id: "send", name: "GrowxSend", group: "COMMUNICATION", purpose: "High-speed directional transmit vector", keywords: ["send", "transmit", "dispatch", "forward"] },
  { id: "inbox", name: "GrowxInbox", group: "COMMUNICATION", purpose: "Ingress receptacle tray with retrieval slot", keywords: ["inbox", "incoming", "messages", "tray"] },
  { id: "mention", name: "GrowxMention", group: "COMMUNICATION", purpose: "Identity anchor operator vector", keywords: ["mention", "at", "tag", "user", "callout"] },
  { id: "comment", name: "GrowxComment", group: "COMMUNICATION", purpose: "Contextual annotation node attached to code/text", keywords: ["comment", "annotation", "note", "feedback"] },

  // 08 — IDENTITY (13)
  { id: "user", name: "GrowxUser", group: "IDENTITY", purpose: "Minimal circular focal head above shoulder curve", keywords: ["user", "account", "profile", "human", "avatar"] },
  { id: "users", name: "GrowxUsers", group: "IDENTITY", purpose: "Multi-operator cluster nodes with shared perimeter", keywords: ["users", "group", "people", "accounts", "community"] },
  { id: "recruiter", name: "GrowxRecruiter", group: "IDENTITY", purpose: "Candidate screening target in assessment bracket", keywords: ["recruiter", "talent", "candidate", "hire", "eval"] },
  { id: "team", name: "GrowxTeam", group: "IDENTITY", purpose: "Structured organizational team cell", keywords: ["team", "org", "department", "squad"] },
  { id: "organization", name: "GrowxOrganization", group: "IDENTITY", purpose: "Hierarchical enterprise governance structure", keywords: ["organization", "enterprise", "company", "hierarchy"] },
  { id: "portfolio", name: "GrowxPortfolio", group: "IDENTITY", purpose: "Architectural project case vault with artifact spine", keywords: ["portfolio", "cases", "works", "briefcase", "archive"] },
  { id: "key", name: "GrowxKey", group: "IDENTITY", purpose: "Cryptographic credential token with stepped bitting", keywords: ["key", "auth", "token", "access", "apikey"] },
  { id: "lock", name: "GrowxLock", group: "IDENTITY", purpose: "Secured credential boundary vault", keywords: ["lock", "private", "secure", "closed", "protected"] },
  { id: "unlock", name: "GrowxUnlock", group: "IDENTITY", purpose: "Released credential boundary shackle", keywords: ["unlock", "public", "open", "released"] },
  { id: "passkey", name: "GrowxPasskey", group: "IDENTITY", purpose: "Biometric cryptographic key node", keywords: ["passkey", "fido", "biometric", "auth", "webauthn"] },
  { id: "device", name: "GrowxDevice", group: "IDENTITY", purpose: "Authorized client hardware terminal", keywords: ["device", "laptop", "hardware", "machine", "terminal"] },
  { id: "session", name: "GrowxSession", group: "IDENTITY", purpose: "Active authenticated network session token", keywords: ["session", "token", "cookie", "auth", "active"] },
  { id: "permission", name: "GrowxPermission", group: "IDENTITY", purpose: "Role-based access matrix evaluation stamp", keywords: ["permission", "rbac", "role", "access", "grant"] },

  // 09 — SECURITY (10)
  { id: "scan", name: "GrowxScan", group: "SECURITY", purpose: "Active security sweep radar grid", keywords: ["scan", "audit", "radar", "inspect", "sweep"] },
  { id: "vulnerability", name: "GrowxVulnerability", group: "SECURITY", purpose: "Compromised polygon boundary with fracture index", keywords: ["vulnerability", "cve", "flaw", "exploit", "risk"] },
  { id: "warning", name: "GrowxWarning", group: "SECURITY", purpose: "Geometric hazard alert beacon", keywords: ["warning", "hazard", "alert", "caution", "danger"] },
  { id: "threat", name: "GrowxThreat", group: "SECURITY", purpose: "Active adversarial attack vector", keywords: ["threat", "attack", "malware", "vector", "adversary"] },
  { id: "verified", name: "GrowxVerified", group: "SECURITY", purpose: "Cryptographic signature validation stamp", keywords: ["verified", "valid", "proven", "badge", "trust"] },
  { id: "fingerprint", name: "GrowxFingerprint", group: "SECURITY", purpose: "Unique identity hash topography ridges", keywords: ["fingerprint", "hash", "biometric", "id", "signature"] },
  { id: "audit", name: "GrowxAudit", group: "SECURITY", purpose: "Structured audit log inspection scope", keywords: ["audit", "compliance", "log", "check", "inspect"] },
  { id: "patch", name: "GrowxPatch", group: "SECURITY", purpose: "Firmware/software security hotfix patch", keywords: ["patch", "hotfix", "repair", "fix", "update"] },
  { id: "sandbox", name: "GrowxSandbox", group: "SECURITY", purpose: "Isolated execution container boundary", keywords: ["sandbox", "isolate", "container", "quarantine"] },
  { id: "boundary", name: "GrowxBoundary", group: "SECURITY", purpose: "Hardened zero-trust network perimeter", keywords: ["boundary", "firewall", "perimeter", "zerotrust", "network"] },

  // 10 — WEB & CRAWL (14)
  { id: "browser", name: "GrowxBrowser", group: "WEB & CRAWL", purpose: "DOM rendering viewport with URL address bar", keywords: ["browser", "web", "dom", "chrome", "page"] },
  { id: "web", name: "GrowxWeb", group: "WEB & CRAWL", purpose: "Orbital web perimeter with axial equatorial lines", keywords: ["web", "globe", "internet", "network", "global"] },
  { id: "crawl", name: "GrowxCrawl", group: "WEB & CRAWL", purpose: "Stepped node-to-node graph traversal cascade", keywords: ["crawl", "spider", "traverse", "graph", "harvest"] },
  { id: "evidence", name: "GrowxEvidence", group: "WEB & CRAWL", purpose: "Observation finding sheet with verification anchor", keywords: ["evidence", "proof", "citation", "fact", "verify"] },
  { id: "page", name: "GrowxPage", group: "WEB & CRAWL", purpose: "Target web document with HTML DOM structure", keywords: ["page", "html", "dom", "document", "url"] },
  { id: "link", name: "GrowxLink", group: "WEB & CRAWL", purpose: "Interlocked URI hyperlink vectors", keywords: ["link", "url", "href", "hyperlink", "anchor"] },
  { id: "sitemap", name: "GrowxSitemap", group: "WEB & CRAWL", purpose: "Hierarchical site tree map topology", keywords: ["sitemap", "tree", "hierarchy", "xml", "routes"] },
  { id: "extract", name: "GrowxExtract", group: "WEB & CRAWL", purpose: "Structured data parsing & transformation funnel", keywords: ["extract", "parse", "transform", "scrape", "structure"] },
  { id: "capture", name: "GrowxCapture", group: "WEB & CRAWL", purpose: "Viewport coordinate target acquisition", keywords: ["capture", "target", "acquire", "snapshot", "coord"] },
  { id: "screenshot", name: "GrowxScreenshot", group: "WEB & CRAWL", purpose: "Visual DOM render frame with aperture lens", keywords: ["screenshot", "camera", "render", "image", "capture"] },
  { id: "monitor", name: "GrowxMonitor", group: "WEB & CRAWL", purpose: "Standing automated site inspection monitor", keywords: ["monitor", "cron", "watcher", "schedule", "uptime"] },
  { id: "compare", name: "GrowxCompare", group: "WEB & CRAWL", purpose: "Side-by-side schema difference analyzer", keywords: ["compare", "diff", "delta", "versions", "schema"] },
  { id: "target", name: "GrowxTarget", group: "WEB & CRAWL", purpose: "Concentric crawl goal coordinate", keywords: ["target", "goal", "destination", "focus", "aim"] },
  { id: "source", name: "GrowxSource", group: "WEB & CRAWL", purpose: "Origin web citation & crawl provenance", keywords: ["source", "provenance", "origin", "citation", "root"] },

  // 11 — AGENTS (11)
  { id: "agent", name: "GrowxAgent", group: "AGENTS", purpose: "Hexagonal cyclical execution loop with core nucleus", keywords: ["agent", "autonomous", "loop", "bot", "orchestrate"] },
  { id: "run", name: "GrowxRun", group: "AGENTS", purpose: "Agent pipeline execution vector", keywords: ["run", "play", "start", "execute", "trigger"] },
  { id: "stop", name: "GrowxStop", group: "AGENTS", purpose: "Immediate agent halt block", keywords: ["stop", "halt", "kill", "abort", "terminate"] },
  { id: "pause", name: "GrowxPause", group: "AGENTS", purpose: "Agent standby pause gates", keywords: ["pause", "standby", "suspend", "wait", "hold"] },
  { id: "plan", name: "GrowxPlan", group: "AGENTS", purpose: "Multi-step reasoning roadmap ledger", keywords: ["plan", "steps", "tasks", "roadmap", "strategy"] },
  { id: "task", name: "GrowxTask", group: "AGENTS", purpose: "Discrete executable agent unit", keywords: ["task", "job", "unit", "action", "work"] },
  { id: "tool", name: "GrowxTool", group: "AGENTS", purpose: "Agent capability execution instrument", keywords: ["tool", "plugin", "mcp", "capability", "action"] },
  { id: "context", name: "GrowxContext", group: "AGENTS", purpose: "Model working context window buffer", keywords: ["context", "memory", "tokens", "buffer", "window"] },
  { id: "model", name: "GrowxModel", group: "AGENTS", purpose: "Neural weights matrix node", keywords: ["model", "weights", "llm", "neural", "parameters"] },
  { id: "reason", name: "GrowxReason", group: "AGENTS", purpose: "Autonomous inference logic branch", keywords: ["reason", "inference", "think", "logic", "deduce"] },
  { id: "result", name: "GrowxResult", group: "AGENTS", purpose: "Final agent execution deliverable token", keywords: ["result", "output", "deliverable", "outcome", "trophy"] },

  // 12 — STATUS (7)
  { id: "success", name: "GrowxSuccess", group: "STATUS", purpose: "Verified status state circle with check vector", keywords: ["success", "pass", "ok", "completed", "green"] },
  { id: "error", name: "GrowxError", group: "STATUS", purpose: "Execution failure state circle with cancel cross", keywords: ["error", "fail", "failed", "crash", "red"] },
  { id: "info", name: "GrowxInfo", group: "STATUS", purpose: "Informational telemetry status marker", keywords: ["info", "help", "notice", "about", "status"] },
  { id: "pending", name: "GrowxPending", group: "STATUS", purpose: "Awaiting execution status with dashed perimeter", keywords: ["pending", "waiting", "queued", "hold", "timer"] },
  { id: "running", name: "GrowxRunning", group: "STATUS", purpose: "Active processing state with spinning segmented arc", keywords: ["running", "loading", "busy", "processing", "spin"] },
  { id: "paused", name: "GrowxPaused", group: "STATUS", purpose: "Suspended pipeline status state", keywords: ["paused", "hold", "halted", "standby", "idle"] },
  { id: "offline", name: "GrowxOffline", group: "STATUS", purpose: "Disconnected system endpoint marker", keywords: ["offline", "disconnected", "down", "unreachable", "dead"] },
];

const GROUPS = [
  "ALL",
  "CORE",
  "NAVIGATION",
  "INTERFACE",
  "FILES",
  "DEVELOPER",
  "DATA",
  "COMMUNICATION",
  "IDENTITY",
  "SECURITY",
  "WEB & CRAWL",
  "AGENTS",
  "STATUS",
] as const;

export default function GrowxIconsPreviewPage() {
  const [activeGroup, setActiveGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeStroke, setActiveStroke] = useState<number>(1.8);
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter icons based on group & search query
  const filteredIcons = useMemo(() => {
    let result = ALL_ICONS;
    if (activeGroup !== "ALL") {
      result = result.filter((i) => i.group === activeGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.group.toLowerCase().includes(q) ||
          i.purpose.toLowerCase().includes(q) ||
          i.keywords.some((k) => k.includes(q))
      );
    }
    return result;
  }, [activeGroup, searchQuery]);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  // Group counts for tabs
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: ALL_ICONS.length };
    ALL_ICONS.forEach((i) => {
      counts[i.group] = (counts[i.group] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#080a0d] text-[#e5e7eb] pt-28 pb-36 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 space-y-20">
        
        {/* ══════════════════════════════════════════════════════════════════
            HEADER & SYSTEM SPECIFICATION
        ══════════════════════════════════════════════════════════════════ */}
        <header className="border-b border-neutral-800/80 pb-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[#bdefff] px-2.5 py-1 rounded bg-[#bdefff]/10 border border-[#bdefff]/20">
                // SYSTEM LIBRARY
              </span>
              <span className="text-neutral-500 font-mono text-xs">
                Phase 04 • {ALL_ICONS.length} Total Symbols
              </span>
            </div>

            {/* Stroke selector */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-neutral-400 text-[11px] uppercase tracking-wider">Active Stroke:</span>
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
                {[1.5, 1.8, 2.0].map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setActiveStroke(sw)}
                    className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                      activeStroke === sw
                        ? "bg-[#bdefff] text-black font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {sw.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
              Growx Icons
            </h1>
            <p className="text-neutral-400 text-base max-w-3xl leading-relaxed font-sans">
              The universal SVG icon system for GrowxLabs. Engineered from first principles with technical clarity, geometric precision, and editorial minimalism across 12 distinct domains.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded bg-[#10141a] border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase">Grid Canvas</span>
              <span className="text-white font-bold">24 × 24 px (viewBox)</span>
            </div>
            <div className="p-3 rounded bg-[#10141a] border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase">Categories</span>
              <span className="text-white font-bold">12 Functional Domains</span>
            </div>
            <div className="p-3 rounded bg-[#10141a] border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase">Color Inheritance</span>
              <span className="text-[#bdefff] font-bold">currentColor (Zero fills)</span>
            </div>
            <div className="p-3 rounded bg-[#10141a] border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase">Library Count</span>
              <span className="text-white font-bold">{ALL_ICONS.length} Unique Symbols</span>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            SEARCH & CATEGORY FILTER BAR (STICKY)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6 sticky top-20 z-40 bg-[#080a0d]/95 backdrop-blur-md pt-4 pb-2 border-b border-neutral-800">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input Field */}
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Icons.GrowxSearch size={16} strokeWidth={activeStroke} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search icons by name, category, or concept (e.g. security, crawl, user, arrow)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#10141a] border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#bdefff] focus:ring-1 focus:ring-[#bdefff] font-mono transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white cursor-pointer"
                >
                  <Icons.GrowxClose size={14} />
                </button>
              )}
            </div>

            {/* Results count & Quick Actions */}
            <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
              <span>Showing <strong className="text-white">{filteredIcons.length}</strong> of {ALL_ICONS.length} icons</span>
              {copiedText && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                  ✓ Copied {copiedText}
                </span>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
            {GROUPS.map((grp) => {
              const count = groupCounts[grp] || 0;
              const isActive = activeGroup === grp;
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setActiveGroup(grp)}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
                    isActive
                      ? "bg-[#bdefff] text-black font-bold shadow-xs"
                      : "bg-[#10141a] text-neutral-400 hover:text-white border border-neutral-800/80"
                  }`}
                >
                  <span>{grp}</span>
                  <span className={`text-[10px] ${isActive ? "text-black/70 font-bold" : "text-neutral-500"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            ICON GRID & LIVE SELECTION BENCH
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-12">
          {filteredIcons.length === 0 ? (
            <div className="py-24 text-center border border-neutral-800 rounded-xl bg-[#0e1117] space-y-4">
              <Icons.GrowxSearch size={32} className="mx-auto text-neutral-600" />
              <p className="text-lg font-serif text-neutral-300">No icons found matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setActiveGroup("ALL"); }}
                className="text-xs font-mono text-[#bdefff] hover:underline cursor-pointer"
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredIcons.map((item) => {
                const IconComponent = (Icons as any)[item.name];
                const isSelected = selectedIcon?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIcon(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-44 relative ${
                      isSelected
                        ? "bg-[#16202c] border-[#bdefff] shadow-[0_0_20px_rgba(189,239,255,0.15)]"
                        : "bg-[#0e1117] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#12161f]"
                    }`}
                  >
                    {/* Top Group tag */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
                      <span>{item.group}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`<${item.name} />`, item.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#bdefff] hover:underline cursor-pointer"
                        title="Copy JSX snippet"
                      >
                        Copy JSX
                      </button>
                    </div>

                    {/* Center Icon Symbol */}
                    <div className="my-auto flex items-center justify-center text-white group-hover:text-[#bdefff] transition-colors py-2">
                      {IconComponent ? (
                        <IconComponent size={26} strokeWidth={activeStroke} />
                      ) : (
                        <span className="text-red-500 font-mono text-xs">Missing</span>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="space-y-1 pt-2 border-t border-neutral-800/60">
                      <div className="font-mono text-xs font-bold text-neutral-200 truncate group-hover:text-white">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate">
                        {item.purpose}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            16 — SVG INSPECTION MODAL / DRAWER BENCH
        ══════════════════════════════════════════════════════════════════ */}
        {selectedIcon && (
          <section className="p-8 rounded-2xl bg-[#0f131a] border border-[#bdefff]/40 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#bdefff] px-2 py-0.5 rounded bg-[#bdefff]/10 border border-[#bdefff]/20">
                  // SVG GEOMETRY INSPECTOR
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  {selectedIcon.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIcon(null)}
                className="text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Close Inspector [X]
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Multi-Size Test Render Glass */}
              <div className="lg:col-span-5 flex items-center justify-around p-6 rounded-xl bg-[#080a0d] border border-neutral-800 text-white">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 flex items-center justify-center">
                    {React.createElement((Icons as any)[selectedIcon.name], { size: 16, strokeWidth: activeStroke })}
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">16px</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 flex items-center justify-center text-[#bdefff]">
                    {React.createElement((Icons as any)[selectedIcon.name], { size: 20, strokeWidth: activeStroke })}
                  </div>
                  <span className="font-mono text-[10px] text-[#bdefff] font-bold">20px</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 flex items-center justify-center">
                    {React.createElement((Icons as any)[selectedIcon.name], { size: 24, strokeWidth: activeStroke })}
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">24px (Base)</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 flex items-center justify-center text-[#bdefff]">
                    {React.createElement((Icons as any)[selectedIcon.name], { size: 36, strokeWidth: activeStroke })}
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">36px</span>
                </div>
              </div>

              {/* Code Snippet & Properties */}
              <div className="lg:col-span-7 space-y-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-[#080a0d] border border-neutral-800 text-neutral-300 space-y-2">
                  <div className="text-neutral-500">// Component Import</div>
                  <div className="text-[#bdefff]">
                    import &#123; {selectedIcon.name} &#125; from &quot;@/components/icons&quot;;
                  </div>
                  <div className="text-neutral-500 pt-1">// Usage</div>
                  <div>
                    &lt;<span className="text-cyan-300">{selectedIcon.name}</span> size=&#123;<span className="text-amber-300">20</span>&#125; strokeWidth=&#123;<span className="text-amber-300">{activeStroke}</span>&#125; /&gt;
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(`<${selectedIcon.name} size={20} />`, selectedIcon.name)}
                    className="px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold cursor-pointer"
                  >
                    Copy JSX Snippet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedIcon.name, selectedIcon.name)}
                    className="px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 cursor-pointer"
                  >
                    Copy Component Name
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            17 — SMALL SIZE (16px & 18px) OPTICAL READABILITY AUDIT
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6 border-t border-neutral-800/80 pt-16">
          <div className="border-b border-neutral-800 pb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#bdefff] block">
              17 // SMALL SIZE READABILITY AUDIT
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Dense UI &amp; 16–18px Optical Verification
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Auditing complex symbols at small viewport sizes to ensure no path crowding or optical blur occurs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              "GrowxArchitecture",
              "GrowxEvidence",
              "GrowxCrawl",
              "GrowxAgent",
              "GrowxRecruiter",
              "GrowxOrganization",
              "GrowxPermission",
              "GrowxVulnerability",
              "GrowxSitemap",
              "GrowxContext",
              "GrowxModel",
              "GrowxTable"
            ].map((name) => {
              const Comp = (Icons as any)[name];
              return (
                <div key={name} className="p-4 rounded-xl bg-[#0e1117] border border-neutral-800 flex flex-col items-center gap-3">
                  <div className="h-8 flex items-center justify-center text-white">
                    {Comp && <Comp size={18} strokeWidth={activeStroke} />}
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 text-center truncate max-w-full">
                    {name.replace("Growx", "")} (18px)
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            18 — ICON FAMILY HARMONY TEST (Random Mix Without Labels)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6 border-t border-neutral-800/80 pt-16">
          <div className="border-b border-neutral-800 pb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#bdefff] block">
              18 // FAMILY COHESION AUDIT
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Blind Mix Family Cohesion Test
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Representative icons from across all 12 domains rendered side-by-side at 24px without labels to verify single-hand design language.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-xl bg-[#0e1117] border border-neutral-800 shadow-xl">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-6 items-center justify-items-center text-white">
              {[
                "GrowxSearch", "GrowxSecurity", "GrowxUser", "GrowxCrawl", "GrowxFile", "GrowxAgent",
                "GrowxDeploy", "GrowxEvidence", "GrowxMail", "GrowxDatabase", "GrowxSettings", "GrowxTerminal",
                "GrowxScan", "GrowxTable", "GrowxCode", "GrowxActivity", "GrowxOrganization", "GrowxLock",
                "GrowxChart", "GrowxSuccess", "GrowxWarning", "GrowxError", "GrowxExpand", "GrowxGitBranch"
              ].map((name) => {
                const Comp = (Icons as any)[name];
                return (
                  <div
                    key={name}
                    title={name}
                    className="w-10 h-10 rounded-lg bg-[#141820]/80 border border-neutral-800/60 flex items-center justify-center hover:border-[#bdefff]/50 hover:text-[#bdefff] transition-all cursor-pointer"
                    onClick={() => handleCopy(`<${name} />`, name)}
                  >
                    {Comp && <Comp size={22} strokeWidth={activeStroke} />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            21 — REMAINING LUCIDE USAGE & MIGRATION REPORT
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6 border-t border-neutral-800/80 pt-16">
          <div className="border-b border-neutral-800 pb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#bdefff] block">
              21 // MIGRATION AUDIT REPORT
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Lucide to Growx Migration Matrix
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Tracking completed replacements and remaining Lucide icons for review before Phase 05 product adoption.
            </p>
          </div>

          <div className="border border-neutral-800 rounded-xl overflow-hidden font-mono text-xs">
            <table className="w-full text-left divide-y divide-neutral-800">
              <thead className="bg-[#12161f] text-neutral-400">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase">Legacy Lucide Icon</th>
                  <th className="px-6 py-3.5 font-bold uppercase text-[#bdefff]">Growx Equivalent</th>
                  <th className="px-6 py-3.5 font-bold uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-[#0e1117] text-neutral-300">
                {Object.entries(growxIconMigration).map(([lucideName, growxName]) => (
                  <tr key={lucideName} className="hover:bg-neutral-900/30">
                    <td className="px-6 py-3 text-neutral-400">
                      <code>&lt;{lucideName} /&gt;</code>
                    </td>
                    <td className="px-6 py-3 text-[#bdefff] font-bold">
                      <code>&lt;{growxName} /&gt;</code>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
