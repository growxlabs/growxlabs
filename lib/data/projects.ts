export interface CaseStudy {
  slug: string;
  title: string;
  subtitle?: string;
  client?: string;
  category: string;
  tag: string;
  description: string;
  image: string;
  problem: string;
  solution: string;
  tech: string[];
  metric: string;
  link?: string;
  status: "Live" | "Beta" | "Development";
  results: {
    label: string;
    value: string;
  }[];
  gallery: string[];
  video?: string;
  features?: {
    title: string;
    desc: string;
  }[];
}

/**
 * Portfolio Projects (Real client and enterprise projects built by GrowXLabs)
 * GrowXLabs-owned products (3RDMIND, Pipper, ResumeForgeAI, UniversalAI, RecruitAI)
 * are presented on the dedicated /products and /ailab pages.
 */
export const projects: CaseStudy[] = [
  {
    slug: "trionyx",
    title: "TRIONYX",
    subtitle: "Distributor Management Platform",
    client: "Client: Trionyx India Pvt. Ltd.",
    tag: "Distribution Platform",
    category: "// DISTRIBUTION PLATFORM",
    description: "Connects distributor operations, enquiries, inventory and sales in one platform.",
    image: "/portfolio/trionyx-dashboard.png",
    problem: "Trionyx needed a modern, high-performance digital platform to showcase their specialized product catalog, provide direct technical specifications to buyers, and streamline day-to-day customer communication.",
    solution: "Engineered a custom enterprise web platform with interactive product catalogs, structured technical documentation, automated inquiry routing, and unified operational workflows.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    metric: "Client Project",
    link: "https://trionyx.in?utm_source=growxlabswebsite",
    status: "Live",
    results: [
      { label: "Status", value: "Production" },
      { label: "Architecture", value: "Next.js & TypeScript" },
      { label: "Experience", value: "Responsive Web" },
      { label: "Workflows", value: "Automated Routing" }
    ],
    gallery: ["/portfolio/trionyx.png"],
    features: [
      { title: "Product Catalog & Showcase", desc: "Interactive presentation of Trionyx products with clean categorization, technical specifications, and visual previews." },
      { title: "Customer Inquiry Pipeline", desc: "Structured request forms that route technical queries and quote requests directly to the operations team." },
      { title: "Operational Tooling", desc: "Integrated administrative workflows for managing product details, media assets, and customer communications." },
      { title: "High-Performance Architecture", desc: "Server-rendered pages optimized for speed, mobile responsiveness, and clean search discovery." }
    ]
  },
  {
    slug: "growx-crawl",
    title: "GrowX Crawl",
    tag: "Internal R&D",
    category: "// INTERNAL R&D",
    description: "A web research tool built to discover companies, crawl websites, extract useful information and keep the evidence behind every finding.",
    image: "/portfolio/growx-crawl.svg",
    problem: "Deep web research and competitive analysis required multiple disjointed tools for crawling, JavaScript rendering, structured data extraction, and verification.",
    solution: "Built an internal, local-first web research platform combining fast HTTP crawling, Playwright rendering, SEO/AEO/GEO audits, structured company modeling, and verifiable source evidence.",
    tech: ["TypeScript", "Node.js", "Playwright", "DuckDB", "CLI Runtime"],
    metric: "Internal R&D",
    status: "Live",
    results: [
      { label: "Runtime", value: "Local-first" },
      { label: "Control", value: "CLI + Agent Runtime" },
      { label: "Engine", value: "HTTP + Playwright" },
      { label: "Audits", value: "SEO / AEO / GEO" }
    ],
    gallery: ["/portfolio/growx-crawl.svg"],
    features: [
      { title: "Company Discovery", desc: "Uncovers public profiles, people, key executives, and related domains across target markets." },
      { title: "Dual-Engine Crawling", desc: "High-throughput static HTTP fetching with automated Playwright browser fallback for dynamic JavaScript sites." },
      { title: "Verifiable Evidence Graph", desc: "Retains exact source URLs, timestamps, DOM selectors, and confidence metrics behind every extracted finding." },
      { title: "Triple Visibility Audit", desc: "Comprehensive scoring across traditional SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO)." }
    ]
  }
];

/**
 * All Projects & Products Archive (Maintained for internal references and legacy routing)
 */
export const allProjectsArchive: CaseStudy[] = [
  ...projects,
  {
    slug: "3rdmind",
    title: "3rdMind",
    tag: "AI Agents",
    category: "AI Agent Platform",
    description: "Multi-agent startup orchestration platform where AI C-suite executives collaborate, execute real business tasks, and continuously improve through a compounding intelligence loop.",
    image: "/portfolio/3rdmind.png",
    problem: "Solo founders and lean teams lack the bandwidth to handle strategy, marketing, sales, finance, and engineering simultaneously.",
    solution: "Built an autonomous agent squad of six AI C-suite roles that decompose founder goals into executable tasks.",
    tech: ["Next.js", "Supabase Realtime", "OpenRouter", "Multi-Agent"],
    metric: "Agent Intelligence",
    link: "https://3rdmind.growxlabs.tech?utm_source=growxlabswebsite",
    status: "Beta",
    results: [
      { label: "AI Agents", value: "6 C-Suite" },
      { label: "Feedback Loops", value: "3 Signals" },
      { label: "Self-Improvement", value: "Active" },
      { label: "Task Automation", value: "85%" }
    ],
    gallery: [],
    features: [
      { title: "C-Suite Agent Squad", desc: "Six specialized AI agents (CEO, CMO, CTO, CFO, CRO, CSO) that collaborate on real business decisions." }
    ]
  },
  {
    slug: "pipper",
    title: "Pipper",
    tag: "AI Agent Harness",
    category: "AI Developer Tools",
    description: "Unified agent developer harness and desktop runtime that lets developers orchestrate Codex, Claude-Code, and OpenCode workflows side-by-side in one local hub.",
    image: "/portfolio/pipper.png",
    problem: "Software developers suffer from velocity bottlenecks when managing disconnected terminal runtimes.",
    solution: "Built a unified local desktop harness (Omni) and secure web hub (pipper.dev) that centralizes agent access.",
    tech: ["Electron", "Next.js", "Node.js", "AI Agents"],
    metric: "Integrated Agents",
    link: "https://pipper.dev?utm_source=growxlabswebsite",
    status: "Development",
    results: [
      { label: "Agent Runtimes", value: "3 Integrated" },
      { label: "Workspace State", value: "Unified" },
      { label: "Subscriptions", value: "All-in-One" },
      { label: "Code Verification", value: "Parallel" }
    ],
    gallery: [],
    features: [
      { title: "Subscription Hub", desc: "Manage and authorize your Codex, Claude-Code, and OpenCode subscriptions." }
    ]
  },
  {
    slug: "resumeforgeai",
    title: "ResumeForgeAI",
    tag: "AI Product",
    category: "AI Product",
    description: "AI-powered career platform that helps developers craft ATS-optimized resumes, practice real-time voice mock interviews, and auto-generate project documentation.",
    image: "/portfolio/resumeforgeai.png",
    problem: "Developers struggle to pass automated resume filters and practice realistic technical interviews.",
    solution: "Built a modular career intelligence platform with specialized modules that track job readiness.",
    tech: ["Next.js", "Claude AI", "Supabase", "WebRTC"],
    metric: "Career Intel",
    link: "https://resumeforgeai.in?utm_source=growxlabswebsite",
    status: "Live",
    results: [
      { label: "Platform", value: "Active" },
      { label: "Community", value: "Growing" },
      { label: "Success Rate", value: "High" }
    ],
    gallery: [],
    features: [
      { title: "ATS Optimization", desc: "Real-time resume alignment and scoring against target job descriptions." }
    ]
  },
  {
    slug: "universalai",
    title: "UniversalAI",
    tag: "AI Platform",
    category: "AI Platform",
    description: "Unified AI workspace that runs multiple language models side-by-side, enabling real-time comparison, document intelligence, and autonomous code generation.",
    image: "/portfolio/universalai.png",
    problem: "Teams waste hours switching between disconnected AI tools, losing context and slowing critical decisions.",
    solution: "Designed a single workspace where multiple AI models respond in parallel.",
    tech: ["Next.js 15", "PostgreSQL", "OpenRouter", "Gemini API", "Prisma"],
    metric: "Multi-Model",
    link: "https://universalai.co.in?utm_source=growxlabswebsite",
    status: "Live",
    results: [
      { label: "AI Models", value: "Multiple" },
      { label: "Speed", value: "Instant" },
      { label: "System", value: "Ready" }
    ],
    gallery: [],
    features: [
      { title: "Parallel Execution", desc: "Run and compare responses from GPT-4o, Gemini, and Claude side-by-side in real-time." }
    ]
  },
  {
    slug: "recruitai",
    title: "RecruitAI",
    tag: "AI Automation",
    category: "AI Recruitment Automation",
    description: "AI-driven hiring platform that screens resumes, conducts proctored assessments, and delivers scored candidate shortlists in minutes.",
    image: "/portfolio/recruitai.png",
    problem: "Recruitment teams spend the majority of their time manually sorting unqualified applications.",
    solution: "Built an end-to-end recruitment automation system with AI-powered resume scoring.",
    tech: ["Next.js 15", "n8n Workflow", "Supabase DB", "Claude API", "PostgreSQL"],
    metric: "Automation",
    link: "https://recruitaitech.in?utm_source=growxlabswebsite",
    status: "Live",
    results: [
      { label: "Time Saved", value: "70%" },
      { label: "Screening Velocity", value: "3x Faster" }
    ],
    gallery: [],
    features: [
      { title: "Automated Screening", desc: "Filters and qualifies candidate profiles autonomously." }
    ]
  }
];
