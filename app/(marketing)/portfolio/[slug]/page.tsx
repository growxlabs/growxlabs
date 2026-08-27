import { notFound } from "next/navigation";
import { projects } from "@/lib/data/projects";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Cpu, FileText, Play, Server } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/Button";
import { DynamicSchema } from "@/components/marketing/DynamicSchema";

export async function generateStaticParams() {
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Built by GrowxLabs Product Studio`,
    description: project.description,
    alternates: {
      canonical: `https://growxlabs.tech/portfolio/${slug}`,
    },
    openGraph: {
      title: `${project.title} — GrowxLabs`,
      description: project.description,
      images: [{ url: project.image }],
    }
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  // Define dynamic blueprints for other projects
  const blueprints: Record<string, { title: string; code: string }[]> = {
    pipper: [
      {
        title: "Agent Multi-Runtime Spawn",
        code: `// Spawn Codex, Claude-Code, and OpenCode workflows side-by-side\nconst harness = new AgentHarness({\n  workspace: "./src",\n  subscriptions: {\n    codex: process.env.CODEX_TOKEN,\n    claude: process.env.CLAUDE_TOKEN,\n    opencode: process.env.OPENCODE_TOKEN\n  }\n});\n\nawait harness.orchestrate({\n  task: "Implement authentication and cross-verify implementation",\n  collaborators: ["claude-code", "opencode"]\n});`
      },
      {
        title: "Workspace Credential Hub",
        code: `// Securely inject shared workspace context and credentials\nconst session = await CredentialHub.authorize({\n  provider: "pipper.dev",\n  scope: ["codex", "claude-code", "opencode"]\n});\n\nconst workspace = await LocalWorkspace.bind(session.workspaceId);`
      }
    ],
    universalai: [
      {
        title: "Multi-Model Router",
        code: `// Parallel LLM Dispatcher\nconst responses = await Promise.all([\n  openRouter.chat("gpt-4o", prompt),\n  openRouter.chat("claude-3-5", prompt),\n  gemini.chat("gemini-1.5-pro", prompt)\n]);`
      },
      {
        title: "MCP Tool Definition",
        code: `{\n  "name": "search_database",\n  "description": "Perform semantic vector searches",\n  "inputSchema": {\n    "query": "string",\n    "limit": 10\n  }\n}`
      }
    ],
    resumeforgeai: [
      {
        title: "ATS Score Evaluator",
        code: `// Claude Prompt Alignment scoring\nconst analysis = await anthropic.messages.create({\n  model: "claude-3-5-sonnet",\n  system: "Evaluate resume against JD. Output ATS score 0-100.",\n  messages: [{ role: "user", content: payload }]\n});`
      },
      {
        title: "WebRTC Audio Gateway",
        code: `// Real-time voice stream listener\nconst peerConnection = new RTCPeerConnection();\nnavigator.mediaDevices.getUserMedia({ audio: true })\n  .then(stream => stream.getTracks()\n  .forEach(track => peerConnection.addTrack(track, stream)));`
      }
    ],
    "3rdmind": [
      {
        title: "Agent Task Decomposition",
        code: `// CEO Agent decomposes founder goals\nconst subtasks = await agentRuntime.decompose({\n  agent: "ceo",\n  goal: founderGoal,\n  delegates: ["cmo", "cto", "cfo", "cso", "cro"]\n});`
      },
      {
        title: "Compounding Intelligence Loop",
        code: `// Self-improving learning extraction\nconst learnings = await learningService.extract({\n  judgeScore,\n  outcomeSignal,\n  userFeedback,\n  confidenceThreshold: 0.6\n});`
      }
    ]
  };

  const projectDetails: Record<string, {
    oneLineValueProp: string;
    challengeTitle: string;
    challengeDesc: string;
    challengePoints: string[];
    solutionTitle: string;
    solutionDesc: string;
    solutionPoints: string[];
    engineeringScope: string[];
  }> = {
    pipper: {
      oneLineValueProp: "Unified developer harness to orchestrate Codex, Claude-Code, and OpenCode side-by-side.",
      challengeTitle: "The Challenge",
      challengeDesc: "Software engineers waste valuable developer velocity switching between proprietary terminal interfaces, managing multiple disconnected AI subscriptions, and lacking a unified workspace to cross-verify agent output.",
      challengePoints: [
        "Fragmented local execution loops for terminal-based AI tools.",
        "High cost of maintaining multiple individual agent enterprise subscriptions.",
        "Risk of code regression from unchecked single-agent generation.",
        "No shared filesystem context or context-aware clipboard across model providers."
      ],
      solutionTitle: "The Solution",
      solutionDesc: "A sleek local desktop harness (Omni) and secure web hub (pipper.dev) that centralizes agent access, shares credentials securely, and coordinates multi-agent development tasks in real-time.",
      solutionPoints: [
        "Unified API Hub: Single subscription gateway for Codex, Claude-Code, and OpenCode runtimes.",
        "Omni Desktop Shell: Tabbed local runtime workspace linking terminals directly to the project filesystem.",
        "Parallel Agent Verification: Multi-agent execution where one agent checks and edits the code output of another.",
        "Local Sandboxed State: Full filesystem boundaries preventing agents from reading or writing unauthorized folders."
      ],
      engineeringScope: [
        "Electron Desktop Runtime",
        "Multi-Agent Terminal Emulation",
        "Credential Hub Architecture",
        "Local Filesystem Security Boundaries",
        "TypeScript/Node Core Client"
      ]
    },
    universalai: {
      oneLineValueProp: "Bridging linguistic diversity and multi-model execution through autonomous orchestration.",
      challengeTitle: "The Challenge",
      challengeDesc: "Developers and enterprises face massive workflow fragmentation and high decision latency when switching between multiple disconnected AI models.",
      challengePoints: [
        "Inability to compare responses from different state-of-the-art LLMs side-by-side.",
        "Manual API switching causing development bottlenecks.",
        "Lack of secure sandboxed environments for execution.",
        "Fragmented document querying without unified RAG databases."
      ],
      solutionTitle: "The Solution",
      solutionDesc: "A unified multi-model orchestration layer enabling parallel streaming, local semantic vector caching, and secure developer agent workspaces.",
      solutionPoints: [
        "Parallel Execution: Run and compare responses from GPT-4o, Gemini, and Claude side-by-side.",
        "Agent Workspace: Dynamic sandbox for AI agents to write and preview code live.",
        "Document Intelligence: Semantic vector search matching query embeddings in real-time.",
        "Model Context Protocol (MCP): Unified registry connecting APIs to LLMs."
      ],
      engineeringScope: [
        "Multi-Model Routing Layer",
        "WebSockets Streaming Architecture",
        "RAG Vector Pipeline",
        "Secure Sandbox Engineering",
        "Modern UI/UX Design"
      ]
    },
    resumeforgeai: {
      oneLineValueProp: "Automated ATS optimization, voice mock interviews, and codebase documentation.",
      challengeTitle: "The Challenge",
      challengeDesc: "Technical job seekers struggle to align their experience with ATS filters, document their codebases, and practice for high-pressure technical interviews.",
      challengePoints: [
        "Resumes failing automated ATS filters due to formatting and keyword mismatch.",
        "Hours wasted writing technical architecture documentation manually.",
        "Lack of accessible, realistic mock interview training environments.",
        "Disjointed metrics tracking overall job readiness."
      ],
      solutionTitle: "The Solution",
      solutionDesc: "An AI-powered career intelligence ecosystem powered by a central mentor brain that tracks readiness across dedicated modules.",
      solutionPoints: [
        "ATS Scorer: Instant resume-to-JD alignment analysis with keyword injection.",
        "Voice Mock Interviews: Real-time WebRTC audio simulator of live engineering panels.",
        "Codebase to SRS: Auto-generated software specifications from project repositories.",
        "MentorForge AI: Central progress scoring and career path guidance."
      ],
      engineeringScope: [
        "System Architecture Design",
        "WebRTC Audio Streaming",
        "AI Prompt Engineering",
        "Automated Code Parsers",
        "Sleek Interactive Frontend"
      ]
    }
  };

  // RecruitAI Specific Specs and Features (Exact from reference file)
  const recruitAiSpecs = [
    { component: "Framework & Client", tech: "Next.js 16 (App Router), React 19, TypeScript", description: "Server-side rendering (SSR), client-side interactivity, and strict static typing." },
    { component: "Backend & Storage", tech: "Supabase (BaaS)", description: "Database client, secure file storage (resumes/photos), and auth management." },
    { component: "Database", tech: "PostgreSQL (hosted on Neon Serverless)", description: "Relational database housing applications, proctoring metrics, and exam sessions." },
    { component: "AI Assessment", tech: "OpenRouter (DeepSeek Chat, Qwen, Llama 3)", description: "Multi-LLM fallback pool for ATS resume evaluation and automated interview grading." },
    { component: "WebRTC & Streaming", tech: "LiveKit & Browser WebRTC", description: "Primary webcam streaming via LiveKit; side-angle phone camera via peer-to-peer WebRTC." },
    { component: "Signaling Protocol", tech: "Supabase Realtime Broadcast", description: "Zero-cost serverless signaling handshake for peer-to-peer mobile camera feeds." },
    { component: "Browser Lockdowns", tech: "Safe Exam Browser (SEB) Configuration", description: "Generates XML config profiles to lock down candidate systems during exams." },
    { component: "Speech Processing", tech: "Web Speech API (SpeechSynthesis, webkitSpeechRecognition)", description: "Runs native Text-to-Speech (TTS) and Speech-to-Text (STT) during automated interviews." },
    { component: "OCR & Parsing", tech: "HuggingFace APIs, Mammoth, PDF-Parse", description: "Parses text from resumes (.pdf, .docx) using cloud and local fallbacks." },
    { component: "Notifications", tech: "Nodemailer & SMTP", description: "Sends automatic application results and exam invitations to candidates." }
  ];

  const recruitAiFeatures = [
    {
      title: "AI-Powered ATS & Resume Screener",
      bullets: [
        "Zero-Failure File Parser: Supports PDF and DOCX parsing, routing requests through HuggingFace OCR with instant local pdf-parse and mammoth fallbacks if the primary API fails.",
        "LLM Evaluation Pool: Evaluates candidate resumes against standardized criteria (skills match: 40%, experience: 30%, education: 20%, clarity: 10%) using multiple LLM endpoints via OpenRouter.",
        "Automatic Shortlisting: Automatically transitions candidates to SHORTLISTED or REJECTED status based on their score threshold (70%) and triggers automatic email responses."
      ]
    },
    {
      title: "Dual-Camera Proctoring System (\"Third Eye\")",
      bullets: [
        "LiveKit Integration: Establishes a primary video/audio stream from the candidate's desktop webcam directly to the recruiter's monitor desk.",
        "Mobile Camera Connection: Generates a temporary, token-secured QR code. When scanned by a candidate’s smartphone, it initiates a mobile web-camera stream showing a side view of their physical workspace.",
        "Serverless Signaling: Uses Supabase Realtime broadcast channels to exchange SDP offers, answers, and ICE candidates between desktop and mobile devices, avoiding the cost of a dedicated WebRTC signaling server."
      ]
    },
    {
      title: "Safe Exam Browser (SEB) Lockdowns",
      bullets: [
        "System Locking: Generates and downloads a custom .seb plist XML profile that forces the candidate to take the exam in a locked sandbox, preventing screenshots, virtualization, Alt+Tab, and right-clicks.",
        "Real-time Fraud Checks: Monitors tab switches, copy-paste attempts, and microphone activity."
      ]
    },
    {
      title: "Interactive Voice-Based AI Interviewer",
      bullets: [
        "Browser-Native TTS/STT: Asks questions using the browser's speechSynthesis and transcribes candidate answers in real-time using webkitSpeechRecognition.",
        "Automated Evaluation: Submits the text transcript logs to LLM models to analyze correctness and generate a final PASS/FAIL recommendation based on technical performance."
      ]
    }
  ];

  // UniversalAI Specific Specs and Features (Exact from reference file)
  const universalAiSpecs = [
    { component: "Core Architecture", tech: "Next.js 15 (React 19), TypeScript, Node.js v18+", description: "Provides high-throughput concurrent rendering and server-side model routing." },
    { component: "Database & storage", tech: "PostgreSQL (Neon / Supabase Serverless)", description: "Relational database schema storing persistent user chats, settings, and histories." },
    { component: "ORM Layer", tech: "Prisma ORM", description: "Provides type-safe querying, schema migrations, and structured relationship mapping." },
    { component: "Auth & Sessions", tech: "NextAuth.js (Auth.js) with JWT Session Cookies", description: "Authenticates client sessions using JWT cookies and OAuth providers." },
    { component: "OpenRouter APIs", tech: "OpenRouter Aggregation Engine", description: "Provides unified, low-latency API access to Anthropic Claude, Meta Llama, and OpenAI GPT models." },
    { component: "Gemini Integration", tech: "Google Gemini Flash & Pro Native APIs", description: "Enables fast multi-modal image reasoning and massive context prompt checks." },
    { component: "Tool Orchestration", tech: "Model Context Protocol (MCP)", description: "Secure client/server tool orchestration protocol to bind external services to LLM streams." },
    { component: "Animation & Styling", tech: "Radix UI Primitives, Tailwind CSS, Framer Motion", description: "Powers premium responsive styling and fluid glassmorphism comparison transitions." },
    { component: "Payments & Gateways", tech: "Stripe & Razorpay API integrations", description: "Handles webhook billing operations, invoices, and feature-gate variables." },
    { component: "Mobile Client", tech: "Kotlin & Android Studio (universe-ai-mobile)", description: "Companion native Android client featuring direct API calls and local DB caching." }
  ];

  const universalAiFeatures = [
    {
      title: "Concurrent Model Streams (Side-by-Side Comparison)",
      bullets: [
        "Parallel Dispatch: Streams answers from up to 3 models (GPT-4o, Gemini, Claude 3.5 Sonnet) simultaneously side-by-side inside a unified layout.",
        "Resource Diagnostics: Monitors and displays real-time latency measurements, token consumption speeds, and API costs to analyze model efficiency."
      ]
    },
    {
      title: "Autonomous Developer Sandbox & Code Agent",
      bullets: [
        "Folder Tree Generation: The AI coding assistant compiles complete repository configurations, writing structural files and code blocks on the fly.",
        "Interactive Preview: Renders live browser visual previews of generated components directly in a dedicated workspace frame."
      ]
    },
    {
      title: "Document Intelligence & Vector RAG Pipeline",
      bullets: [
        "Fast Document Parsing: Parses user uploads (such as PDFs) locally and embeds key text passages into RAG contextual memory buffers.",
        "Grounded Reasoning: Injects document snippets back into prompt chains to assure AI responses are mathematically grounded in project data."
      ]
    },
    {
      title: "Real-Time Translation Hub & Feature Gates",
      bullets: [
        "Preserved Syntax Translation: Dynamically translates active chat threads across languages without breaking code snippet blocks or Markdown elements.",
        "Usage Metering & billing: Stripe and Razorpay integrations monitor account limits and lock premium capabilities behind secure sub checks."
      ]
    }
  ];

  const pipperSpecs = [
    { component: "Desktop Runtime", tech: "Electron, HTML5, Vanilla CSS", description: "Provides a lightweight desktop container that integrates local terminal shells and workspaces." },
    { component: "Orchestration Client", tech: "Node.js v20+, TypeScript", description: "Runs parallel subprocess instances of Codex, Claude-Code, and OpenCode, managing standard streams." },
    { component: "Workspace Sandboxing", tech: "Node fs & OS Security Boundaries", description: "Enforces strict read/write boundaries for agent file access, preventing modification of external directories." },
    { component: "Credential Gateway", tech: "pipper.dev API Service", description: "Centralized authorization service validating model subscriptions and session tokens." },
    { component: "Cross-Verification Engine", tech: "Llama 3 & Claude Sonnet", description: "Compares agent-generated code drafts, runs automated syntax parsers, and merges refined blocks." }
  ];

  const pipperFeatures = [
    {
      title: "Subscription Hub & Authentication",
      bullets: [
        "Single-Sign-On Access: Authenticate your Codex, Claude-Code, and OpenCode enterprise subscriptions in a unified login session.",
        "Secure Token Storage: Uses standard keychain encryption to securely store API credentials locally without exposing them to cloud relays."
      ]
    },
    {
      title: "Side-by-Side Agent Orchestration",
      bullets: [
        "Concurrent Runtimes: Runs multiple terminal-based AI agents concurrently to perform separate project development tasks.",
        "Interactive Terminal Panel: Premium tabbed terminal grid allowing you to view running stdout/stderr of each agent live."
      ]
    },
    {
      title: "Parallel Agent Code Verification",
      bullets: [
        "Double-Agent Auditing: Configures one agent runtime to audit and review the code modifications of another agent prior to saving.",
        "Syntax Checkers & Compilers: Auto-executes local build scripts and syntax check tools to verify correctness of generated codes."
      ]
    },
    {
      title: "Safe Local Workspace Harness",
      bullets: [
        "Filesystem Safety Boundaries: Enforces sandboxing controls where agents can only access files inside the approved project root folder.",
        "Smart Workspace Diffing: Generates git-compatible diff patches, allowing developers to review changes before committing them."
      ]
    }
  ];

  const thirdMindSpecs = [
    { component: "Core Architecture", tech: "Next.js 15 (React 19), Node.js Runtime, TypeScript", description: "Decoupled asynchronous agent-runtime model with high concurrency and typing." },
    { component: "Database & Storage", tech: "Supabase & PostgreSQL Realtime", description: "Relational database schema storing persistent agent performance logs, telemetry, and strategy states." },
    { component: "Agent Runtime", tech: "OpenRouter APIs (GPT-4o, Gemini Pro, DeepSeek)", description: "Orchestrated C-suite agents running parallel LLM nodes with dynamic confidence scoring." },
    { component: "Automation Integration", tech: "n8n Workflow Engines", description: "Integrates external service tools, browser controls, and custom script runtimes." },
    { component: "Feedback Processing", tech: "Compounding Intelligence Service", description: "Calculates judge scores, processes outcome indicators, and extracts prompt diffs." },
    { component: "User Interface", tech: "Tailwind CSS & Framer Motion", description: "Premium dashboard with real-time agent message feeds and performance visualizations." }
  ];

  const thirdMindFeatures = [
    {
      title: "Squad Collaboration (C-Suite Agents)",
      bullets: [
        "CEO Task Decomposition: Translates high-level founder objectives into specialized C-suite mandates.",
        "Cooperative Execution: CMO generates campaigns, CTO codes assets, CSO fetches outreach leads, CFO monitors economics, and CRO handles validation."
      ]
    },
    {
      title: "Self-Improving Loop (Compounding Memory)",
      bullets: [
        "Judge Agent Scoring: Auto-evaluates task execution across quality, completeness, and role-adherence.",
        "Outcome Tracking: Verifies real-world indicators like email responses, code test successes, and social metrics.",
        "Human-in-the-Loop Diffs: Analyzes user edits using semantic diff extractors to formulate prompts rules."
      ]
    },
    {
      title: "Mathematical Governance & Prompts Compiler",
      bullets: [
        "Confidence Tuning: Reinforces positive outcomes and decays inactive learnings (-0.05/week).",
        "Prompts Compiler: Consolidates confidence rules to generate versioned, lightweight prompt overrides."
      ]
    },
    {
      title: "Council Matrix (Collaborative Brainstorming)",
      bullets: [
        "AI Board Meetings: Convenes private agent council rooms to debate proposals and reach consensus before executing critical actions."
      ]
    }
  ];

  // Render Custom UniversalAI page if matches slug
  if (project.slug === "universalai") {
    return (
      <>
        <DynamicSchema
          graph={[
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://growxlabs.tech/portfolio/universalai#product",
              "name": "UniversalAI",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "All",
              "description": "Unified AI workspace that lets teams run multiple language models side-by-side, compare responses in real time, query documents intelligently, and generate code autonomously.",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": "https://growxlabs.tech/portfolio/universalai#case-study",
              "name": "How We Built UniversalAI",
              "headline": "UniversalAI — Multi-Model AI Platform Built by GrowXLabs",
              "description": "A deep-dive into how GrowXLabs designed and shipped a unified AI workspace supporting parallel model execution, document intelligence, and autonomous coding agents.",
              "author": {
                "@type": "Organization",
                "name": "GrowXLabs",
                "url": "https://growxlabs.tech"
              }
            }
          ]}
        />
        <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
            
            {/* Hero Section */}
            <section className="mb-20">
              <Link href="/portfolio" className="inline-block mb-10">
                <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                    AI Platform
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                    UniversalAI.
                  </h1>
                  
                  <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                    Multi-model AI orchestration platform supporting parallel model execution, custom tools, and document intelligence.
                  </p>
                  
                  {/* Tech Chips & Live Case study button */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                          Live Case Study &rarr;
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column: Showcase Image */}
                <div className="lg:col-span-6 relative">
                  {/* Background Glow */}
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />
                  
                  <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                    <Image
                      src={project.image}
                      alt="UniversalAI Showcase Screen"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">3x LLMs</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">PARALLEL STREAMS</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Instant</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">MULTILINGUAL TRANS</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Monaco</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">DEVELOPER SANDBOX</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Prisma</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">RELATIONAL POSTGRES</span>
                </div>
              </div>
            </section>

            {/* Overview Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="max-w-4xl space-y-6">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">01 / Overview</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  UniversalAI is an advanced, production-grade AI orchestration and translation platform designed to unify state-of-the-art Large Language Models and specialized tools into a single, high-fidelity workspace. Built on a Next.js and TypeScript framework, it solves the challenge of single-model bias and tool fragmentation by running parallel execution streams from GPT-4o, Gemini Pro, and Claude 3.5 Sonnet side-by-side. The platform integrates a semantic Retrieval-Augmented Generation (RAG) system for document intelligence, alongside a dedicated AI agent workspace that generates, executes, and previews project files on the fly. By securing conversations through a robust PostgreSQL persistence layer and supporting instant multilingual communication, UniversalAI delivers a scalable, enterprise-ready environment for technical collaboration.
                </p>
              </div>
            </section>

            {/* Technical Specifications Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">02 / Architecture Specs</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Technical Specifications</h2>
              </div>
              <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-white/[0.01]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                  <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">Component</th>
                      <th className="px-6 py-4">Technology / Tool</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    {universalAiSpecs.map((spec, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{spec.component}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{spec.tech}</td>
                        <td className="px-6 py-4 text-zinc-400 font-light">{spec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Core Features Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">03 / Platform Modules</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Core Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {universalAiFeatures.map((feat, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-[24px] p-8 hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-primary font-mono text-xs font-bold block mb-2">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-4">{feat.title}</h3>
                    <ul className="space-y-3">
                      {feat.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture & Flow Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">04 / Systems Flow</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Architecture & System Flow</h2>
              </div>
              
              <div className="space-y-12">
                {/* 2D SVG Diagram */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">System Interaction Diagram</h3>
                  <div className="w-full border border-white/[0.08] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto flex justify-center">
                    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" className="min-w-[800px] text-[10px] font-mono select-none">
                      <defs>
                        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                        </linearGradient>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C0F0FB" />
                        </marker>
                      </defs>

                      {/* Background grid */}
                      <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                        <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
                        <path d="M100,0 V500 M200,0 V500 M300,0 V500 M400,0 V500 M500,0 V500 M600,0 V500 M700,0 V500" />
                      </g>

                      {/* Flows / Lines */}
                      <path d="M220,95 H320" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="225" y="85" fill="#C0F0FB">1. Prompt / Event Stream</text>

                      <path d="M390,130 V240" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="400" y="185" fill="#C0F0FB">2. Auth Verification</text>

                      <path d="M460,260 L580,180" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="475" y="215" fill="#C0F0FB">3. Async Concurrent Dispatch</text>

                      <path d="M460,290 L580,380" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="475" y="340" fill="#C0F0FB">3. Concurrent LLM Prompts</text>

                      <path d="M320,275 H220" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="235" y="260" fill="#C0F0FB">4. Sync Message Logs</text>

                      <path d="M580,200 L460,275" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="495" y="255" fill="#a7f3d0">5. Token stream</text>

                      <path d="M580,360 L460,295" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="495" y="315" fill="#a7f3d0">5. Token stream</text>

                      <path d="M320,95 H220" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="2,2" markerEnd="url(#arrow)" />
                      <text x="230" y="115" fill="#a7f3d0">6. Parallel Render Chunks</text>

                      {/* Boxes */}
                      <rect x="80" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="95" fill="#fff" fontWeight="bold">User Client UI</text>
                      <text x="95" y="112" fill="#888" fontSize="8">React / Framer Motion</text>

                      <rect x="320" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="95" fill="#fff" fontWeight="bold">NextAuth.js</text>
                      <text x="335" y="112" fill="#888" fontSize="8">JWT Authenticator</text>

                      <rect x="320" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="275" fill="#fff" fontWeight="bold">Next.js Gateway</text>
                      <text x="335" y="292" fill="#888" fontSize="8">API Router / Promises</text>

                      <rect x="80" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="275" fill="#fff" fontWeight="bold">PostgreSQL</text>
                      <text x="95" y="292" fill="#888" fontSize="8">Supabase Relational</text>

                      <rect x="580" y="140" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="175" fill="#fff" fontWeight="bold">OpenRouter</text>
                      <text x="595" y="192" fill="#888" fontSize="8">API Aggregation Cluster</text>

                      <rect x="580" y="320" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="355" fill="#fff" fontWeight="bold">Gemini Engine</text>
                      <text x="595" y="372" fill="#888" fontSize="8">Google Multimodal API</text>
                    </svg>
                  </div>
                </div>

                {/* Database Schema Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 01</span>
                    <h4 className="text-white font-bold mb-2">users</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Stores credentials, profile indicators, email handles, and dynamic Stripe subscription levels.
                    </p>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 02</span>
                    <h4 className="text-white font-bold mb-2">sessions</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Logs active user logins, verification keys, and NextAuth adapter parameters.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 03</span>
                    <h4 className="text-white font-bold mb-2">chats</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Collects user conversations, workspace selections, and custom instructions reference indices.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 04</span>
                    <h4 className="text-white font-bold mb-2">messages</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Holds prompt logs, model identifiers, outputs content, and response speed metrics.
                    </p>
                  </div>
                </div>

                {/* Parallel Stream Sequence */}
                <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">Parallel Stream Workflow</h3>
                  <ol className="space-y-4 text-sm text-zinc-400 font-light leading-relaxed">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">1</span>
                      <div>
                        <strong className="text-white font-semibold block">Prompt Dispatch</strong>
                        The client sends a prompt along with model parameters to the Next.js API endpoint.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">2</span>
                      <div>
                        <strong className="text-white font-semibold block">Middleware Filtering</strong>
                        Auth middleware decrypts session JWT cookies and validates user rate limits on Upstash Redis cache.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">3</span>
                      <div>
                        <strong className="text-white font-semibold block">Concurrent Execution</strong>
                        The endpoint maps the payload and dispatches parallel HTTP streams to OpenRouter (for Claude / Llama) and Gemini native API concurrently.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">4</span>
                      <div>
                        <strong className="text-white font-semibold block">Edge Token Pipes</strong>
                        API routes catch chunk-by-chunk stream chunks and pipe them directly back to the client using server-sent event (SSE) buffers.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">5</span>
                      <div>
                        <strong className="text-white font-semibold block">Real-time Comparative Render</strong>
                        Client hooks parse concurrent text stream pieces and feed them side-by-side into separate Framer Motion markdown boxes without blocking UI rendering.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Redesigned Agency CTA */}
            <section className="mt-32">
              <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                    Let's build together
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    Need a similar <span className="text-[#C0F0FB]">orchestration platform?</span>
                  </h2>
                  
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    We design, build, and deploy custom engineering pipelines and AI products tailored to scale your company's operational capacity.
                  </p>
                  
                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                        Book Strategy Call
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </>
    );
  } else if (project.slug === "resumeforgeai") {
    const resumeForgeSpecs = [
      { component: "Web Frontend", tech: "Next.js 14 (App Router), React 18, TypeScript", description: "Provides a responsive client-side interface and server-side rendering (SSR)." },
      { component: "Mobile Container", tech: "Ionic Capacitor 8.x", description: "Packages the web bundle into native iOS and Android apps with cross-platform wrappers." },
      { component: "Backend-as-a-Service", tech: "Supabase (PostgreSQL with RLS)", description: "Handles relational database state, Row-Level Security (RLS) policies, and auth." },
      { component: "Authentication", tech: "Supabase Auth, JWT Validation (via jose)", description: "Secures client-server communication using OAuth and token-based validation." },
      { component: "Storage", tech: "Supabase Storage Buckets", description: "Stores resume PDFs, user uploads, profile assets, and static media." },
      { component: "Caching & Limits", tech: "Upstash Redis & Upstash Ratelimit", description: "Implements distributed rate-limiting and session caching at the Edge." },
      { component: "AI Engine", tech: "Google Gemini AI API (@google/generative-ai)", description: "Orchestrates Resume optimization prompts, mock interview feedback, and code summarization." },
      { component: "Client-side OCR", tech: "Tesseract.js", description: "Extracts raw text data from uploaded image/PDF resumes locally on the client." },
      { component: "Parsing Utilities", tech: "pdfjs-dist, pdf-parse, Mammoth", description: "Extracts plain text from complex PDF and Word docx documents on server and client." },
      { component: "Document PDF Gen", tech: "jsPDF Client-side Rendering", description: "Dynamically exports optimized, ATS-compliant resume layouts directly into PDFs." },
      { component: "Payment Gateway", tech: "Razorpay API integration", description: "Processes premium subscription payments and handles payment hooks." },
      { component: "SMTP & Email", tech: "Brevo API Integration", description: "Sends transactional emails, verification links, and weekly progress alerts." }
    ];

    const resumeForgeFeatures = [
      {
        title: "📄 ResumeForge & InterviewForge",
        bullets: [
          "ATS Resume Builder: Generates highly tailored resumes with instant keyword injection based on target JD parameters and evaluates them against custom ATS scoring algorithms.",
          "Voice Mock Interviews: Features browser-native real-time WebRTC audio streams to simulate technical and behavioral panel evaluations with smart scoring and analysis."
        ]
      },
      {
        title: "✨ ExplainForge & ProjectForge",
        bullets: [
          "SRS Documentation Parser: Automatically scans code repositories, maps architectures, and compiles complete Software Requirement Specifications (SRS) with custom flowcharts.",
          "Project Blueprints: Generates step-by-step development roadmaps, SQL schema templates, and API route skeletons tailored to expand user portfolio project depth."
        ]
      },
      {
        title: "💻 CodingForge & MentorForge",
        bullets: [
          "DSA Monaco Sandbox: Features an integrated browser coding environment with hints powered by Gemini AI that guide the logical steps without showing solutions.",
          "Global Progress Tracker: Evaluates aggregate metrics to calculate a dynamic Global Career Readiness Score, pointing out skill gaps and highlighting readiness indices."
        ]
      },
      {
        title: "🗺️ CareerForge & JobForge",
        bullets: [
          "Linear Roadmaps: Designs targeted weekly learning schedules focused on acquiring missing technologies required by targeted job listings.",
          "Match Probabilities: Scans web job postings to evaluate profile-to-role match probability percentages and manages pipelines in an interactive Kanban board."
        ]
      },
      {
        title: "📖 KnowledgeForge & StudyForge",
        bullets: [
          "System Design Wiki: Houses System Design tutorials, DSA guides, and DevOps templates, formatted with high-quality styling exportable directly to PDFs.",
          "Spaced-Repetition Engine: Summarizes target technical docs and compiles flashcards synced to a custom learning frequency algorithm."
        ]
      }
    ];

    return (
      <>
        <DynamicSchema
          graph={[
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://growxlabs.tech/portfolio/resumeforgeai#product",
              "name": "ResumeForgeAI",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "description": "AI-powered career platform that helps developers craft ATS-optimized resumes, practice real-time voice mock interviews, and auto-generate professional project documentation.",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": "https://growxlabs.tech/portfolio/resumeforgeai#case-study",
              "name": "How We Built ResumeForgeAI",
              "headline": "ResumeForgeAI — Career Intelligence Platform Built by GrowXLabs",
              "description": "A look at how GrowXLabs built a ten-module career intelligence platform covering resume optimization, live voice interviews, coding practice, and job-readiness tracking.",
              "author": {
                "@type": "Organization",
                "name": "GrowXLabs",
                "url": "https://growxlabs.tech"
              }
            }
          ]}
        />
        <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
            
            {/* Hero Section */}
            <section className="mb-20">
              <Link href="/portfolio" className="inline-block mb-10">
                <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                    AI Product
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                    ResumeForgeAI.
                  </h1>
                  
                  <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                    Autonomous career intelligence ecosystem providing automated ATS optimization, voice-enabled mock interviews, and codebase-to-SRS documentation.
                  </p>
                  
                  {/* Tech Chips & Live Case study button */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                          Live Case Study &rarr;
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column: Showcase Image */}
                <div className="lg:col-span-6 relative">
                  {/* Background Glow */}
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />
                  
                  <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                    <Image
                      src={project.image}
                      alt="ResumeForgeAI Showcase Screen"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">10</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">FORGES / MODULES</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Real-Time</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">VOICE FEEDBACK</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Cross-Platform</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">WEB, iOS & ANDROID</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">Gemini AI</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">MENTOR ENGINE</span>
                </div>
              </div>
            </section>

            {/* Overview Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="max-w-4xl space-y-6">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">01 / Overview</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  ResumeForgeAI is an all-in-one AI-powered Career Intelligence Ecosystem designed to guide developers from learning to landing their dream jobs. The platform features a modular architecture comprising ten specialized "Forges" that manage resume optimization, technical interview practice, codebase documentation, and strategic job hunting. At its core, a centralized AI agent (MentorForge) tracks user progress, analyzes skill gaps, and calculates a dynamic "Career Readiness Score" to guide learning paths. Built on a modern stack including Next.js, Supabase, and Gemini AI, it delivers real-time voice feedback, automated database schema planning, and interactive coding environments. With native compilation via Capacitor, the entire system operates cross-platform across web, Android, and iOS, providing a premium, unified career acceleration suite.
                </p>
              </div>
            </section>

            {/* Technical Specifications Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">02 / Architecture Specs</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Technical Specifications</h2>
              </div>
              <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-white/[0.01]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                  <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">Component</th>
                      <th className="px-6 py-4">Technology / Tool</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    {resumeForgeSpecs.map((spec, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{spec.component}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{spec.tech}</td>
                        <td className="px-6 py-4 text-zinc-400 font-light">{spec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Core Features Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">03 / Platform Modules</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Core Features (The Forges)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resumeForgeFeatures.map((feat, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-[24px] p-8 hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-primary font-mono text-xs font-bold block mb-2">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-4">{feat.title}</h3>
                    <ul className="space-y-3">
                      {feat.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture & Flow Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">04 / Systems Flow</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Architecture & System Flow</h2>
              </div>
              
              <div className="space-y-12">
                {/* 2D SVG Diagram */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">System Interaction Diagram</h3>
                  <div className="w-full border border-white/[0.08] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto flex justify-center">
                    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" className="min-w-[800px] text-[10px] font-mono select-none">
                      <defs>
                        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                        </linearGradient>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C0F0FB" />
                        </marker>
                      </defs>

                      {/* Background grid */}
                      <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                        <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
                        <path d="M100,0 V500 M200,0 V500 M300,0 V500 M400,0 V500 M500,0 V500 M600,0 V500 M700,0 V500" />
                      </g>

                      {/* Flows / Lines */}
                      <path d="M220,95 H320" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="225" y="85" fill="#C0F0FB">1. HTTPS Request</text>

                      <path d="M460,95 L580,75" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="470" y="70" fill="#C0F0FB">2. Rate-Limit check</text>

                      <path d="M460,115 L580,185" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="470" y="160" fill="#C0F0FB">3. Verify JWT Auth</text>

                      <path d="M390,130 V240" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="400" y="185" fill="#C0F0FB">4. Pass Request</text>

                      <path d="M460,275 L580,385" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="470" y="340" fill="#C0F0FB">5. Prompt Gemini</text>

                      <path d="M460,250 L580,210" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="485" y="240" fill="#C0F0FB">6. SQL Queries & RLS</text>

                      <path d="M460,290 L580,310" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="480" y="290" fill="#C0F0FB">7. Read/Write assets</text>

                      <path d="M390,310 V380" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="400" y="350" fill="#C0F0FB">8. Parse PDF/Docx</text>

                      <path d="M320,270 L220,290" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="225" y="270" fill="#C0F0FB">9. Email & Payments</text>

                      <path d="M580,150 L150,170" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="280" y="150" fill="#a7f3d0">10. Realtime Profile Sync</text>

                      {/* Boxes */}
                      <rect x="80" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="95" fill="#fff" fontWeight="bold">React SPA Client</text>
                      <text x="95" y="112" fill="#888" fontSize="8">Web / Capacitor wrapper</text>

                      <rect x="320" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="95" fill="#fff" fontWeight="bold">Auth Middleware</text>
                      <text x="335" y="112" fill="#888" fontSize="8">Next.js Edge Middleware</text>

                      <rect x="320" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="275" fill="#fff" fontWeight="bold">Next.js API Server</text>
                      <text x="335" y="292" fill="#888" fontSize="8">Server Actions / Routes</text>

                      <rect x="320" y="380" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="415" fill="#fff" fontWeight="bold">Document Engine</text>
                      <text x="335" y="432" fill="#888" fontSize="8">Mammoth / pdfjs-dist</text>

                      <rect x="80" y="260" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="295" fill="#fff" fontWeight="bold">External APIs</text>
                      <text x="95" y="312" fill="#888" fontSize="8">Brevo & Razorpay Gateway</text>

                      <rect x="580" y="40" width="140" height="50" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="70" fill="#fff" fontWeight="bold">Upstash Redis</text>

                      <rect x="580" y="140" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="175" fill="#fff" fontWeight="bold">Supabase DB</text>
                      <text x="595" y="192" fill="#888" fontSize="8">PostgreSQL + RLS</text>

                      <rect x="580" y="260" width="140" height="50" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="290" fill="#fff" fontWeight="bold">Supabase Storage</text>

                      <rect x="580" y="360" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="395" fill="#fff" fontWeight="bold">Gemini AI API</text>
                      <text x="595" y="412" fill="#888" fontSize="8">Google LLM Controller</text>
                    </svg>
                  </div>
                </div>

                {/* Database Schema Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 01</span>
                    <h4 className="text-white font-bold mb-2">profiles</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Handles core user account details, targets, learning achievements, and global readiness metrics.
                    </p>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 02</span>
                    <h4 className="text-white font-bold mb-2">resume_templates</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Stores multiple resume layouts, parsed files text, and customized keyword mapping tables.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 03</span>
                    <h4 className="text-white font-bold mb-2">mock_interviews</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Logs interactive audio transcripts, question streams, scoring metrics, and rubrics.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 04</span>
                    <h4 className="text-white font-bold mb-2">learning_roadmaps</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Maintains time-bound study goals, schedules, and active recall card indexes.
                    </p>
                  </div>
                </div>

                {/* WebRTC Signaling Sequence */}
                <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">WebRTC Audio Streaming Sequence</h3>
                  <ol className="space-y-4 text-sm text-zinc-400 font-light leading-relaxed">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">1</span>
                      <div>
                        <strong className="text-white font-semibold block">Context Initialization</strong>
                        The client browser initializes user audio inputs via <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">navigator.mediaDevices.getUserMedia</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">2</span>
                      <div>
                        <strong className="text-white font-semibold block">Track Negotiation</strong>
                        Browser creates an <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">RTCPeerConnection</code> and binds the microphone track to exchange SDP signals with the serverless gateway.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">3</span>
                      <div>
                        <strong className="text-white font-semibold block">Real-time Stream Pipeline</strong>
                        Voice data packets stream dynamically to the voice evaluation endpoint where they undergo instant Speech-to-Text conversion.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">4</span>
                      <div>
                        <strong className="text-white font-semibold block">Model Assessment</strong>
                        The transcription logs are passed to Gemini AI to generate answers correctness, evaluation scores, and actionable feedback metrics.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">5</span>
                      <div>
                        <strong className="text-white font-semibold block">Database Persistence</strong>
                        The resulting report and readiness indicators save to Supabase, triggering a realtime update on the MentorForge dashboard.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Redesigned Agency CTA */}
            <section className="mt-32">
              <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                    Let's build together
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    Need a similar <span className="text-[#C0F0FB]">career ecosystem?</span>
                  </h2>
                  
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    We design, build, and deploy custom engineering pipelines and AI products tailored to scale your company's operational capacity.
                  </p>
                  
                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                        Book Strategy Call
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </>
    );
  } else if (project.slug === "recruitai") {
    return (
      <>
        <DynamicSchema
          graph={[
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://growxlabs.tech/portfolio/recruitai#product",
              "name": "RecruitAI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": "AI-driven hiring platform that screens resumes, conducts proctored assessments, and delivers scored candidate shortlists — cutting recruitment turnaround from days to minutes.",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": "https://growxlabs.tech/portfolio/recruitai#case-study",
              "name": "How We Built RecruitAI",
              "headline": "RecruitAI — AI Recruitment Automation Built by GrowXLabs",
              "description": "How GrowXLabs built an end-to-end AI hiring platform with automated resume scoring, proctored assessments, and voice-based interview evaluation for enterprise recruiters.",
              "author": {
                "@type": "Organization",
                "name": "GrowXLabs",
                "url": "https://growxlabs.tech"
              }
            }
          ]}
        />
        <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
            
            {/* Hero Section */}
            <section className="mb-20">
              <Link href="/portfolio" className="inline-block mb-10">
                <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
              </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Content */}
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                  AI Recruitment Automation
                </span>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                  RecruitAI.
                </h1>
                
                <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                  Enterprise-grade, AI-driven talent acquisition and secure assessment platform designed to automate the recruitment pipeline from application to final offer.
                </p>
                
                {/* Tech Chips & Live Case study button */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                        Live Case Study &rarr;
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Showcase Image */}
              <div className="lg:col-span-6 relative">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />
                
                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                  <Image
                    src={project.image}
                    alt="RecruitAI Showcase Screen"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
              {project.results.map((result, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">{result.value}</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">{result.label}</span>
                </div>
              ))}
            </div>
            </section>

            {/* Overview Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="max-w-4xl space-y-6">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">01 / Overview</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  RecruitAI is an enterprise-grade, AI-driven talent acquisition and secure assessment platform designed to automate the recruitment pipeline from application to final offer. The platform parses and scores candidate resumes using a multi-model LLM fallback mechanism, matching skills and experience directly to job descriptions. For secure examinations, it deploys a dual-camera proctoring system ("Third Eye") that streams desktop and mobile video feeds using WebRTC, utilizing Supabase Realtime for serverless signaling. Additionally, candidates undergo a voice-based AI interview round driven by browser-native speech-to-text and text-to-speech translation models. By combining automated screening, secure environments, and smart evaluations, RecruitAI establishes an efficient, bias-free, and highly scalable hiring workflow.
                </p>
              </div>
            </section>

            {/* Technical Specifications Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">02 / Architecture Specs</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Technical Specifications</h2>
              </div>
              <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-white/[0.01]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                  <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">Component</th>
                      <th className="px-6 py-4">Technology / Tool</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    {recruitAiSpecs.map((spec, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{spec.component}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{spec.tech}</td>
                        <td className="px-6 py-4 text-zinc-400 font-light">{spec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Core Features Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">03 / Platform Modules</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Core Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recruitAiFeatures.map((feat, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-[24px] p-8 hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-primary font-mono text-xs font-bold block mb-2">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-4">{feat.title}</h3>
                    <ul className="space-y-3">
                      {feat.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture & Flow Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">04 / Systems Flow</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Architecture & System Flow</h2>
              </div>
              
              <div className="space-y-12">
                {/* 2D SVG Diagram */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">System Interaction Diagram</h3>
                  <div className="w-full border border-white/[0.08] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto flex justify-center">
                    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" className="min-w-[800px] text-[10px] font-mono select-none">
                      <defs>
                        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                        </linearGradient>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C0F0FB" />
                        </marker>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f87171" />
                        </marker>
                      </defs>

                      {/* Background grid */}
                      <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                        <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
                        <path d="M100,0 V500 M200,0 V500 M300,0 V500 M400,0 V500 M500,0 V500 M600,0 V500 M700,0 V500" />
                      </g>

                      {/* Flows / Lines */}
                      <path d="M220,95 H320" stroke="#C0F0FB" strokeWidth="1.5" strokeDasharray="3,3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                      <text x="230" y="85" fill="#C0F0FB">1. Submit Resume</text>

                      <path d="M460,95 H580" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="475" y="85" fill="#C0F0FB">2. Score Resume</text>

                      <path d="M390,130 V260" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="400" y="195" fill="#C0F0FB">3. Save App Details</text>

                      <path d="M220,115 L320,175" stroke="#a7f3d0" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="225" y="155" fill="#a7f3d0">4. Join Exam Room</text>

                      <path d="M460,185 L580,240" stroke="#a7f3d0" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="470" y="210" fill="#a7f3d0">5. Stream Desktop Video</text>

                      <path d="M150,130 V260" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="75" y="195" fill="#fef08a">6. Show QR Code</text>

                      <path d="M220,305 H320" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <path d="M320,325 H220" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="235" y="295" fill="#f87171">7. WebRTC Signaling</text>

                      <path d="M150,350 L580,270" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4,4" markerEnd="url(#arrow-red)" />
                      <text x="270" y="340" fill="#f87171">8. Direct WebRTC Stream</text>

                      <path d="M220,335 L320,305" stroke="#e9d5ff" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="230" y="350" fill="#e9d5ff">9. Connection State Change</text>

                      <path d="M390,260 L220,125" stroke="#e9d5ff" strokeWidth="1.5" strokeDasharray="2,2" markerEnd="url(#arrow)" />
                      <text x="280" y="145" fill="#e9d5ff">10. Listen to State Change</text>

                      {/* Boxes */}
                      <rect x="80" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="95" fill="#fff" fontWeight="bold">Candidate Browser</text>
                      <text x="95" y="112" fill="#888" fontSize="8">Desktop Exam Client</text>

                      <rect x="80" y="280" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="315" fill="#fff" fontWeight="bold">Mobile Phone</text>
                      <text x="95" y="332" fill="#888" fontSize="8">Side Workspace Camera</text>

                      <rect x="320" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="95" fill="#fff" fontWeight="bold">Next.js Server</text>
                      <text x="335" y="112" fill="#888" fontSize="8">App Router API</text>

                      <rect x="320" y="155" width="140" height="50" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="185" fill="#a7f3d0" fontWeight="bold">LiveKit Cloud</text>

                      <rect x="320" y="260" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="295" fill="#fff" fontWeight="bold">Supabase BaaS</text>
                      <text x="335" y="312" fill="#888" fontSize="8">Database & Realtime</text>

                      <rect x="580" y="220" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="255" fill="#fff" fontWeight="bold">Recruiter Admin</text>
                      <text x="595" y="272" fill="#888" fontSize="8">Monitoring Panel</text>

                      <rect x="580" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="95" fill="#fff" fontWeight="bold">OpenRouter AI</text>
                      <text x="595" y="112" fill="#888" fontSize="8">LLM Grading Fallbacks</text>
                    </svg>
                  </div>
                </div>

                {/* Database Schema Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 01</span>
                    <h4 className="text-white font-bold mb-2">profiles</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Stores core candidate details, academic credentials, skills, and target job roles.
                    </p>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 02</span>
                    <h4 className="text-white font-bold mb-2">applications</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Manages the candidacy state (ats_score, ats_status, resume_url, status tracking).
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Table 03</span>
                    <h4 className="text-white font-bold mb-2">exam_proctoring_sessions</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Tracks live integrity variables (e.g., mobile_connected, tab switches, microphone logs).
                    </p>
                  </div>
                </div>

                {/* WebRTC Signaling Sequence */}
                <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">WebRTC Signaling Sequence</h3>
                  <ol className="space-y-4 text-sm text-zinc-400 font-light leading-relaxed">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">1</span>
                      <div>
                        <strong className="text-white font-semibold block">Handshake Initialization</strong>
                        The Candidate Desktop page subscribes to a Supabase broadcast channel named <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">proctor-{"{examId}"}</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">2</span>
                      <div>
                        <strong className="text-white font-semibold block">QR Scan</strong>
                        The candidate scans the QR code containing a JWT token. The phone loads the <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">/third-eye/connect</code> route.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">3</span>
                      <div>
                        <strong className="text-white font-semibold block">Token Exchange</strong>
                        The phone validates the token, subscribes to the <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">proctor-{"{examId}"}</code> broadcast channel, and fires a <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">mobile-connected</code> message.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">4</span>
                      <div>
                        <strong className="text-white font-semibold block">SDP Exchange</strong>
                        The desktop receives the announcement, acts as the WebRTC receiver, and sends a connection <code className="text-primary font-mono text-xs px-1 bg-white/5 rounded">ready</code> message. The phone generates a WebRTC SDP Offer and transmits it via the channel.
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">5</span>
                      <div>
                        <strong className="text-white font-semibold block">Direct Stream</strong>
                        The desktop returns an SDP Answer and exchanges ICE Candidates via Supabase. Once connected, a secure, peer-to-peer MediaStream is established, piping the mobile camera feed directly to the Recruiter's Live Monitor client.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Redesigned Agency CTA */}
            <section className="mt-32">
              <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                    Let's build together
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    Need a similar <span className="text-[#C0F0FB]">automation platform?</span>
                  </h2>
                  
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    We design, build, and deploy custom engineering pipelines and AI products tailored to scale your company's operational capacity.
                  </p>
                  
                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                        Book Strategy Call
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </>
    );
  } else if (project.slug === "pipper") {
    return (
      <>
        <DynamicSchema
          graph={[
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://growxlabs.tech/portfolio/pipper#product",
              "name": "Pipper",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "All",
              "description": "Unified agent developer harness and desktop runtime that lets developers orchestrate Codex, Claude-Code, and OpenCode workflows side-by-side in one local hub.",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": "https://growxlabs.tech/portfolio/pipper#case-study",
              "name": "How We Built Pipper",
              "headline": "Pipper — Unified Agent Developer Harness & Desktop Runtime Built by GrowXLabs",
              "description": "An in-depth look at how GrowXLabs engineered a secure, parallel local agent workspace harness.",
              "author": {
                "@type": "Organization",
                "name": "GrowXLabs",
                "url": "https://growxlabs.tech"
              }
            }
          ]}
        />
        <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
            
            {/* Hero Section */}
            <section className="mb-20">
              <Link href="/portfolio" className="inline-block mb-10">
                <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
              </Link>
 
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                    AI Developer Tools
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                    Pipper.
                  </h1>
                  
                  <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                    Unified Multi-Agent Harness &amp; Desktop Runtime for AI-Native Engineering.
                  </p>
                  
                  {/* Tech Chips & Live Case study button */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                          Live Site &rarr;
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
 
                {/* Right Column: Showcase Image */}
                <div className="lg:col-span-6 relative">
                  {/* Background Glow */}
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />
                  
                  <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                    <Image
                      src={project.image}
                      alt="Pipper Showcase Screen"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
 
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
                {project.results.map((result, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">{result.value}</span>
                    <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">{result.label}</span>
                  </div>
                ))}
              </div>
            </section>
 
            {/* Overview Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="max-w-4xl space-y-6">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">01 / Overview</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  Pipper is a local developer harness and desktop interface (Omni) that centralizes agent-based coding runtimes. By launching Codex, Claude-Code, and OpenCode subprocesses concurrently within a single sandboxed session, the runtime shares workspace context, synchronizes credential access, and coordinates parallel agent operations. Developers can instruct one agent to implement feature blocks, while other runtimes actively audit outputs, run syntax compilers, and perform local check routines before safe write-backs to the project file system. Powered by Electron and Node, Pipper bridges the gap between fragmented command-line agents and unified IDE workflows.
                </p>
              </div>
            </section>
 
            {/* Technical Specifications Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">02 / Architecture Specs</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Technical Specifications</h2>
              </div>
              <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-white/[0.01]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                  <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">Component</th>
                      <th className="px-6 py-4">Technology / Tool</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    {pipperSpecs.map((spec, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{spec.component}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{spec.tech}</td>
                        <td className="px-6 py-4 text-zinc-400 font-light">{spec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
 
            {/* Core Features Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">03 / Platform Modules</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Core Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pipperFeatures.map((feat, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-[24px] p-8 hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-primary font-mono text-xs font-bold block mb-2">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-4">{feat.title}</h3>
                    <ul className="space-y-3">
                      {feat.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
 
            {/* Architecture & Flow Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">04 / Systems Flow</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Architecture & System Flow</h2>
              </div>
              
              <div className="space-y-12">
                {/* 2D SVG Diagram */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">Workspace Orchestration Loop</h3>
                  <div className="w-full border border-white/[0.08] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto flex justify-center">
                    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" className="min-w-[800px] text-[10px] font-mono select-none">
                      <defs>
                        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                        </linearGradient>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#355CFF" />
                        </marker>
                      </defs>
 
                      {/* Background grid */}
                      <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                        <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
                        <path d="M100,0 V500 M200,0 V500 M300,0 V500 M400,0 V500 M500,0 V500 M600,0 V500 M700,0 V500" />
                      </g>
 
                      {/* Flows / Lines */}
                      <path d="M220,95 H320" stroke="#355CFF" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="230" y="85" fill="#355CFF">1. Trigger Goal</text>
 
                      <path d="M460,95 H580" stroke="#355CFF" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="475" y="85" fill="#355CFF">2. Bind Workspace</text>
 
                      <path d="M650,130 V240" stroke="#355CFF" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="660" y="185" fill="#355CFF">3. Parallel Exec</text>
 
                      <path d="M580,275 H460" stroke="#355CFF" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="480" y="265" fill="#355CFF">4. Draft Diffs</text>
 
                      <path d="M320,275 H220" stroke="#a7f3d0" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="235" y="265" fill="#a7f3d0">5. Verify & Compile</text>
 
                      <path d="M150,240 V130" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="160" y="185" fill="#a7f3d0">6. Safe Write-Back</text>
 
                      {/* Boxes */}
                      <rect x="80" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="95" fill="#fff" fontWeight="bold">Developer IDE</text>
                      <text x="95" y="112" fill="#888" fontSize="8">Workspace / Files</text>
 
                      <rect x="320" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="95" fill="#fff" fontWeight="bold">Omni Desktop</text>
                      <text x="335" y="112" fill="#888" fontSize="8">Secure Shell Harness</text>
 
                      <rect x="580" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="95" fill="#fff" fontWeight="bold">Agent Router</text>
                      <text x="595" y="112" fill="#888" fontSize="8">Codex/Claude/OpenCode</text>
 
                      <rect x="580" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="275" fill="#fff" fontWeight="bold">Agent Runtimes</text>
                      <text x="595" y="292" fill="#888" fontSize="8">Subprocess Shells</text>
 
                      <rect x="320" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="275" fill="#fff" fontWeight="bold">Cross-Verifier</text>
                      <text x="335" y="292" fill="#888" fontSize="8">AST / Syntax Audits</text>
 
                      <rect x="80" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="275" fill="#fff" fontWeight="bold">Sandboxed OS</text>
                      <text x="95" y="292" fill="#888" fontSize="8">Strict folder lock</text>
                    </svg>
                  </div>
                </div>
 
                {/* Conceptual Data Model */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Module 01</span>
                    <h4 className="text-white font-bold mb-2">Omni Desktop App</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Minimalist terminal container launching agent sub-processes, embedding shared credentials.
                    </p>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Module 02</span>
                    <h4 className="text-white font-bold mb-2">Credential Vault</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Locally securely binds model authorization tokens for Codex, Claude-Code, and OpenCode interfaces.
                    </p>
                  </div>
 
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Module 03</span>
                    <h4 className="text-white font-bold mb-2">Security Shield</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Monitors agent syscalls, preventing unauthorized directory traversals or outbound API calls.
                    </p>
                  </div>
 
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Module 04</span>
                    <h4 className="text-white font-bold mb-2">AST Merge Tool</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Parses abstract syntax trees from different agents to resolve git conflict styles and verify structure.
                    </p>
                  </div>
                </div>
              </div>
            </section>
 
            {/* Redesigned Agency CTA */}
            <section className="mt-32">
              <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                    Let's build together
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    Need a similar <span className="text-[#C0F0FB]">developer harness?</span>
                  </h2>
                  
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    We design, build, and deploy custom developer workflows, terminal CLI wrappers, and custom desktop platforms.
                  </p>
                  
                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                        Book Strategy Call
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
 
          </div>
        </div>
      </>
    );
  } else if (project.slug === "3rdmind") {
    return (
      <>
        <DynamicSchema
          graph={[
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://growxlabs.tech/portfolio/3rdmind#product",
              "name": "3RDMIND",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": "Multi-agent startup orchestration platform where AI C-suite executives collaborate, execute real business tasks, and continuously improve through a compounding intelligence loop.",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": "https://growxlabs.tech/portfolio/3rdmind#case-study",
              "name": "How We Built 3RDMIND",
              "headline": "3RDMIND — Autonomous Multi-Agent Startup Orchestration & Compounding Intelligence Platform Built by GrowXLabs",
              "description": "An in-depth look at how GrowXLabs engineered a self-optimizing multi-agent network with continuous learning feedback signals.",
              "author": {
                "@type": "Organization",
                "name": "GrowXLabs",
                "url": "https://growxlabs.tech"
              }
            }
          ]}
        />
        <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
            
            {/* Hero Section */}
            <section className="mb-20">
              <Link href="/portfolio" className="inline-block mb-10">
                <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                    AI Agent Platform
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                    3RDMIND.
                  </h1>
                  
                  <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                    Autonomous Multi-Agent Startup Orchestration &amp; Compounding Intelligence Platform.
                  </p>
                  
                  {/* Tech Chips & Live Case study button */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                          Live Case Study &rarr;
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column: Showcase Image */}
                <div className="lg:col-span-6 relative">
                  {/* Background Glow */}
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />
                  
                  <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                    <Image
                      src={project.image}
                      alt="3RDMIND Showcase Screen"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
                {project.results.map((result, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">{result.value}</span>
                    <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">{result.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Overview Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="max-w-4xl space-y-6">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">01 / Overview</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  3RDMIND is an advanced agentic AI platform that simulates, runs, and scales digital startups using a squad of specialized C-suite agents (CEO, CMO, CTO, CFO, CRO, CSO) who collaborate, make decisions, execute tasks, and continuously learn from real-world feedback loops. Built on a decoupled, asynchronous agent-runtime model, the platform features a frontend Dashboard (Next.js), a Supabase Realtime backend, and a centralized Agent Runtime orchestrator powered by OpenRouter models. By tracking judge ratings, conversion outcomes, and natural language user corrections, the Compounding Intelligence Layer automatically updates agent operating strategies without polluting core system prompts.
                </p>
              </div>
            </section>

            {/* Technical Specifications Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">02 / Architecture Specs</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Technical Specifications</h2>
              </div>
              <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-white/[0.01]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                  <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">Component</th>
                      <th className="px-6 py-4">Technology / Tool</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                    {thirdMindSpecs.map((spec, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{spec.component}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{spec.tech}</td>
                        <td className="px-6 py-4 text-zinc-400 font-light">{spec.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Core Features Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">03 / Platform Modules</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Core Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {thirdMindFeatures.map((feat, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-[24px] p-8 hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="text-primary font-mono text-xs font-bold block mb-2">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-4">{feat.title}</h3>
                    <ul className="space-y-3">
                      {feat.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400 font-light leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture & Flow Section */}
            <section className="my-20 border-t border-white/[0.06] pt-20">
              <div className="mb-10">
                <span className="text-primary font-mono text-[10px] uppercase tracking-widest">04 / Systems Flow</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">Architecture & System Flow</h2>
              </div>
              
              <div className="space-y-12">
                {/* 2D SVG Diagram */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono text-zinc-500">Compounding Intelligence Loop</h3>
                  <div className="w-full border border-white/[0.08] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto flex justify-center">
                    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" className="min-w-[800px] text-[10px] font-mono select-none">
                      <defs>
                        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                        </linearGradient>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C0F0FB" />
                        </marker>
                      </defs>

                      {/* Background grid */}
                      <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                        <path d="M0,50 H800 M0,100 H800 M0,150 H800 M0,200 H800 M0,250 H800 M0,300 H800 M0,350 H800 M0,400 H800 M0,450 H800" />
                        <path d="M100,0 V500 M200,0 V500 M300,0 V500 M400,0 V500 M500,0 V500 M600,0 V500 M700,0 V500" />
                      </g>

                      {/* Flows / Lines */}
                      <path d="M220,95 H320" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="230" y="85" fill="#C0F0FB">1. Assign Goals</text>

                      <path d="M460,95 H580" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="475" y="85" fill="#C0F0FB">2. Decompose Tasks</text>

                      <path d="M650,130 V240" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="660" y="185" fill="#C0F0FB">3. Execute Tools</text>

                      <path d="M580,275 H220" stroke="#C0F0FB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="350" y="265" fill="#C0F0FB">4. Outcome Signals</text>

                      <path d="M150,130 V240" stroke="#a7f3d0" strokeWidth="1.5" markerEnd="url(#arrow)" />
                      <text x="160" y="185" fill="#a7f3d0">5. User Feedback</text>

                      <path d="M220,275 H320" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="235" y="295" fill="#a7f3d0">6. Save Learnings</text>

                      <path d="M390,240 V130" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
                      <text x="400" y="185" fill="#a7f3d0">7. Inject Strategy</text>

                      {/* Boxes */}
                      <rect x="80" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="95" fill="#fff" fontWeight="bold">Founder / User</text>
                      <text x="95" y="112" fill="#888" fontSize="8">Goal Assignment</text>

                      <rect x="320" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="95" fill="#fff" fontWeight="bold">CEO Agent</text>
                      <text x="335" y="112" fill="#888" fontSize="8">Startup Orchestrator</text>

                      <rect x="580" y="60" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="95" fill="#fff" fontWeight="bold">C-Suite Squad</text>
                      <text x="595" y="112" fill="#888" fontSize="8">CMO, CTO, CFO, CRO</text>

                      <rect x="580" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="595" y="275" fill="#fff" fontWeight="bold">Agent Execution</text>
                      <text x="595" y="292" fill="#888" fontSize="8">MCP Tools / browser</text>

                      <rect x="320" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="335" y="275" fill="#fff" fontWeight="bold">Supabase DB</text>
                      <text x="335" y="292" fill="#888" fontSize="8">Learnings / Performance</text>

                      <rect x="80" y="240" width="140" height="70" rx="12" fill="url(#cardGrad)" stroke="#ffffff" strokeOpacity="0.08" />
                      <text x="95" y="275" fill="#fff" fontWeight="bold">Learning Service</text>
                      <text x="95" y="292" fill="#888" fontSize="8">Compounding Engine</text>
                    </svg>
                  </div>
                </div>

                {/* Conceptual Data Model */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Signal 01</span>
                    <h4 className="text-white font-bold mb-2">Performance Logs</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Captures task execution summaries, judge evaluations, human ratings, and natural language edit deltas.
                    </p>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Signal 02</span>
                    <h4 className="text-white font-bold mb-2">Agent Learnings</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Stores categorized operating insights alongside dynamic confidence scores and evidence weightings.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Signal 03</span>
                    <h4 className="text-white font-bold mb-2">Strategy Versions</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Tracks compiled prompt additions generated over time, enabling safe rollback and version comparison.
                    </p>
                  </div>

                  <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2 font-mono">Signal 04</span>
                    <h4 className="text-white font-bold mb-2">Outcome Events</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      Records real-world telemetry (e.g., email responses, deployments) to validate long-term strategy efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Redesigned Agency CTA */}
            <section className="mt-32">
              <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                    Let's build together
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    Need a similar <span className="text-[#C0F0FB]">multi-agent network?</span>
                  </h2>
                  
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    We design, build, and deploy custom engineering pipelines and AI products tailored to scale your company's operational capacity.
                  </p>
                  
                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                        Book Strategy Call
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </>
    );
  }

  const activeBlueprints = blueprints[project.slug] || [];
  const details = projectDetails[project.slug] || {
    oneLineValueProp: project.description,
    challengeTitle: "The Challenge",
    challengeDesc: project.problem,
    challengePoints: [],
    solutionTitle: "The Solution",
    solutionDesc: project.solution,
    solutionPoints: [],
    engineeringScope: ["System Architecture", "Custom Engineering", "UI/UX Strategy", "Performance Audit"]
  };

  return (
    <>
      <DynamicSchema
        graph={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": `https://growxlabs.tech/portfolio/${project.slug}#product`,
            "name": project.title,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "All",
            "description": project.description,
            "offers": {
              "@type": "Offer",
              "price": "0"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": `https://growxlabs.tech/portfolio/${project.slug}#case-study`,
            "name": `How We Built ${project.title}`,
            "headline": `${project.title} — Built by GrowXLabs Product Studio`,
            "description": project.description,
            "author": {
              "@type": "Organization",
              "name": "GrowXLabs",
              "url": "https://growxlabs.tech"
            }
          }
        ]}
      />
      <div className="pt-24 pb-32 w-full bg-[#050505] text-zinc-300 font-sans selection:bg-primary/20 selection:text-white">
        
        {/* Global Container Wrapper */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 w-full">
          
          {/* Hero Section */}
          <section className="mb-20">
            <Link href="/portfolio" className="inline-block mb-10">
              <Button variant="ghost" className="text-zinc-500 hover:text-white h-auto py-1 pl-0 font-bold tracking-tight text-xs uppercase cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
              </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Content */}
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 inline-block w-fit">
                  {project.category}
                </span>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none uppercase break-words">
                  {project.title}.
                </h1>
                
                <p className="text-zinc-400 text-lg sm:text-xl md:text-2xl font-light leading-relaxed tracking-tight max-w-3xl">
                  {details.oneLineValueProp}
                </p>
                
                {/* Tech Chips & Live Case study button */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <Button className="h-9 px-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer">
                        Live Case Study &rarr;
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Showcase Media */}
              <div className="lg:col-span-6 relative">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-40 pointer-events-none" />

                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.01] shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                  {project.video ? (
                    <video 
                      src={project.video} 
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain"
                      poster={project.image}
                    />
                  ) : (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16">
              {project.results.map((result, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight block leading-none">{result.value}</span>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest block">{result.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Challenge & Solution Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 my-24 border-t border-white/[0.06] pt-24">
            {/* Challenge */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                Problem
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
                {details.challengeTitle}
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
                {details.challengeDesc}
              </p>
              {details.challengePoints.length > 0 && (
                <ul className="space-y-3.5 pt-4">
                  {details.challengePoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Solution */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                Solution
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
                {details.solutionTitle}
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
                {details.solutionDesc}
              </p>
              {details.solutionPoints.length > 0 && (
                <ul className="space-y-3.5 pt-4">
                  {details.solutionPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Code Blueprints, Tech Stack & Engineering Scope Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 my-24 border-t border-white/[0.06] pt-24">
            
            {/* Left Column: Code Blueprints */}
            <div className="lg:col-span-8 space-y-6">
              {activeBlueprints.length > 0 && (
                <>
                  <div className="max-w-2xl">
                    <span className="text-primary font-bold uppercase text-[10px] tracking-widest font-mono">System Integrity</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">Engineering Blueprints</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeBlueprints.map((blueprint, i) => (
                      <div key={i} className="bg-[#0c0c0c] border border-white/[0.08] rounded-[24px] overflow-hidden shadow-2xl">
                        {/* Title Bar */}
                        <div className="bg-white/[0.03] px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60 block" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{blueprint.title}</span>
                        </div>
                        {/* Syntax container */}
                        <pre className="p-6 overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed bg-[#050505]">
                          <code>{blueprint.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-[32px] p-8 space-y-8 sticky top-28 shadow-sm">
                <div>
                  <h3 className="text-white font-bold mb-4 uppercase text-[10px] tracking-wider opacity-60">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/[0.04] rounded-md text-[10px] font-bold text-zinc-300 border border-white/[0.05] uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4 uppercase text-[10px] tracking-wider opacity-60">Engineering Scope</h3>
                  <ul className="space-y-3">
                    {details.engineeringScope.map((s, i) => (
                      <li key={i} className="flex items-center text-zinc-300 text-xs font-semibold">
                        <CheckCircle2 size={15} className="text-primary mr-3 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Redesigned Agency CTA */}
          <section className="mt-32">
            <div className="bg-[#080808] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden group">
              {/* Subtle background grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
              
              <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary block font-mono">
                  Let's build together
                </span>
                
                <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-white tracking-tight max-w-3xl mx-auto leading-tight">
                  Need a similar <span className="text-[#C0F0FB]">automation platform?</span>
                </h2>
                
                <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                  We design, build, and deploy custom engineering pipelines and AI products tailored to scale your company's operational capacity.
                </p>
                
                <div className="pt-4">
                  <Link href="/contact">
                    <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold tracking-tight text-xs rounded-full shadow-lg shadow-white/5 cursor-pointer">
                      Book Strategy Call
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
