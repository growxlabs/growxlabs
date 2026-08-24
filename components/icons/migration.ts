/**
 * GrowxLabs Icon System — Lucide to Growx Icon Migration Map
 * 
 * Complete reference mapping table indicating GrowxLabs replacement symbols
 * for Lucide React icon components across all 12 functional domains.
 */

export const growxIconMigration = {
  // 01 — Navigation
  Menu: "GrowxMenu",
  ChevronDown: "GrowxChevronDown",
  ChevronUp: "GrowxChevronUp",
  ChevronLeft: "GrowxChevronLeft",
  ChevronRight: "GrowxChevronRight",
  ArrowRight: "GrowxArrowRight",
  ArrowLeft: "GrowxArrowLeft",
  ArrowUp: "GrowxArrowUp",
  ArrowDown: "GrowxArrowDown",
  ExternalLink: "GrowxExternalLink",
  ArrowUpRight: "GrowxExternalLink",
  Maximize2: "GrowxExpand",
  Minimize2: "GrowxCollapse",
  MoreHorizontal: "GrowxMoreHorizontal",
  MoreVertical: "GrowxMoreVertical",

  // 02 — Window & Interface Actions
  X: "GrowxClose",
  Plus: "GrowxAdd",
  Minus: "GrowxRemove",
  Check: "GrowxCheck",
  RefreshCw: "GrowxRefresh",
  RotateCcw: "GrowxRefresh",
  Maximize: "GrowxFullscreen",
  Minimize: "GrowxMinimize",
  PanelLeft: "GrowxPanelLeft",
  PanelRight: "GrowxPanelRight",
  Sidebar: "GrowxSidebar",

  // 03 — File Actions
  File: "GrowxFile",
  FileText: "GrowxDocument",
  Folder: "GrowxFolder",
  FolderOpen: "GrowxFolderOpen",
  Upload: "GrowxUpload",
  Download: "GrowxDownload",
  Copy: "GrowxCopy",
  Save: "GrowxSave",
  Archive: "GrowxArchive",
  Trash: "GrowxTrash",
  Trash2: "GrowxTrash",
  Paperclip: "GrowxAttachment",

  // 04 — Code & Developer
  Code: "GrowxCode",
  Code2: "GrowxDeveloper",
  Terminal: "GrowxTerminal",
  GitBranch: "GrowxGitBranch",
  GitCommit: "GrowxCommit",
  GitPullRequest: "GrowxRepository",
  Command: "GrowxCommand",
  Bug: "GrowxBug",
  Package: "GrowxPackage",
  Box: "GrowxProduct",
  Cpu: "GrowxArchitecture",
  Layers: "GrowxArchitecture",
  Webhook: "GrowxAPI",
  Rocket: "GrowxDeploy",
  FileCode: "GrowxLogs",

  // 05 — Data
  Table: "GrowxTable",
  BarChart: "GrowxChart",
  BarChart2: "GrowxChart",
  LineChart: "GrowxChart",
  Activity: "GrowxActivity",
  Filter: "GrowxFilter",
  ArrowUpDown: "GrowxSort",
  History: "GrowxHistory",
  Clock: "GrowxClock",
  Calendar: "GrowxCalendar",
  List: "GrowxList",
  Grid: "GrowxGrid",
  LayoutGrid: "GrowxGrid",
  Database: "GrowxDatabase",
  HardDrive: "GrowxStorage",
  Server: "GrowxStorage",

  // 06 — Communication
  MessageSquare: "GrowxMessage",
  MessageCircle: "GrowxComment",
  Mail: "GrowxMail",
  Send: "GrowxSend",
  Inbox: "GrowxInbox",
  AtSign: "GrowxMention",
  Phone: "GrowxContact",

  // 07 — Identity & Access
  User: "GrowxUser",
  Users: "GrowxUsers",
  UserCheck: "GrowxRecruiter",
  UserPlus: "GrowxTeam",
  Briefcase: "GrowxPortfolio",
  Building: "GrowxOrganization",
  Building2: "GrowxOrganization",
  Key: "GrowxKey",
  Lock: "GrowxLock",
  Unlock: "GrowxUnlock",
  Fingerprint: "GrowxPasskey",
  Laptop: "GrowxDevice",
  Smartphone: "GrowxDevice",
  ShieldCheck: "GrowxPermission",

  // 08 — Security
  Shield: "GrowxSecurity",
  Scan: "GrowxScan",
  AlertTriangle: "GrowxWarning",
  AlertCircle: "GrowxWarning",
  Radio: "GrowxThreat",
  BadgeCheck: "GrowxVerified",
  FileCheck: "GrowxAudit",
  Wrench: "GrowxPatch",
  BoxSelect: "GrowxSandbox",
  LockKeyhole: "GrowxBoundary",

  // 09 — Web & Crawl
  Globe: "GrowxWeb",
  Globe2: "GrowxWeb",
  Compass: "GrowxResearch",
  Eye: "GrowxResearch",
  Search: "GrowxSearch",
  Layout: "GrowxBrowser",
  FileSpreadsheet: "GrowxPage",
  Link: "GrowxLink",
  Link2: "GrowxLink",
  Network: "GrowxCrawl",
  FileSignature: "GrowxEvidence",
  Camera: "GrowxScreenshot",
  Crosshair: "GrowxTarget",

  // 10 — Agent Actions
  Play: "GrowxRun",
  Square: "GrowxStop",
  Pause: "GrowxPause",
  ListOrdered: "GrowxPlan",
  CheckSquare: "GrowxTask",
  Hammer: "GrowxTool",
  Sparkles: "GrowxAgent",
  Bot: "GrowxAgent",
  Brain: "GrowxReason",
  Award: "GrowxResult",

  // 11 — Status
  CheckCircle: "GrowxSuccess",
  CheckCircle2: "GrowxSuccess",
  XCircle: "GrowxError",
  Info: "GrowxInfo",
  Loader: "GrowxRunning",
  Loader2: "GrowxRunning",
  PauseCircle: "GrowxPaused",
  WifiOff: "GrowxOffline",
} as const;

export type GrowxMigratedIcon = keyof typeof growxIconMigration;
