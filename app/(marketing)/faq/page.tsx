import { FAQContent } from "./FAQContent";
import Script from "next/script";

const faqCategories = [
  {
    id: "about",
    title: "About GrowxLabs",
    items: [
      {
        question: "What is GrowxLabs?",
        answer: "GrowxLabs is an AI-native software company, product studio, and AI engineering lab. We research, design, and engineer custom enterprise software, production web platforms, intelligent workflows, and multi-agent systems designed for scale and operational continuity."
      },
      {
        question: "Where is GrowxLabs located and how do you work with clients?",
        answer: "GrowxLabs is headquartered in India and works with engineering teams, technology leaders, and enterprise organizations worldwide across North America, Europe, the Middle East, Asia-Pacific, and India."
      },
      {
        question: "How does GrowxLabs approach software and AI engineering?",
        answer: "We prioritize production-grade, maintainable software. We build with modern neural architectures, multi-agent frameworks, and scalable cloud runtimes natively from day one, collaborating directly with technical founders and engineering leaders."
      },
      {
        question: "Can we engage GrowxLabs for confidentiality-critical projects?",
        answer: "Yes. We maintain strict confidentiality, sign mutual NDAs before technical discovery, enforce least-privilege access controls, and build within your enterprise security and data governance standards."
      }
    ]
  },
  {
    id: "services",
    title: "Engineering & AI Capabilities",
    items: [
      {
        question: "What types of software systems does GrowxLabs engineer?",
        answer: "We engineer custom enterprise applications, web platform infrastructure, autonomous agent harnesses, document intelligence pipelines, internal developer platforms, and complex multi-system integrations."
      },
      {
        question: "How does GrowxLabs develop autonomous AI agents and multi-agent systems?",
        answer: "We design multi-agent runtimes with deterministic tool execution, sandboxed environments, human-in-the-loop controls, and complete operational observability to ensure reliable background execution in production."
      },
      {
        question: "How does GrowxLabs handle legacy systems and enterprise modernization?",
        answer: "We evaluate existing software architecture, map operational workflows, and engineer targeted AI capabilities and secure API integrations that connect with existing databases, ERPs, and cloud environments without disruptive migrations."
      },
      {
        question: "What technology stack and infrastructure does GrowxLabs utilize?",
        answer: "Our stack includes TypeScript, Next.js, Node.js, Python, PostgreSQL, Redis, vector systems, frontier LLM architectures (OpenAI, Anthropic Claude, open-weights models), and major cloud platforms (AWS, GCP, Vercel)."
      }
    ]
  },
  {
    id: "working",
    title: "Engagements & Collaboration",
    items: [
      {
        question: "How does a typical engagement with GrowxLabs work?",
        answer: "Engagements begin with technical discovery and architecture alignment. We scope focused phases, build functional prototypes for early validation, and deploy robust production software with automated testing and documentation."
      },
      {
        question: "Can we start with a focused proof-of-concept or architectural sprint?",
        answer: "Yes. We frequently engage in architectural discovery sprints or focused proof-of-concepts to validate technical feasibility, latency, and system integration before full-scale deployment."
      },
      {
        question: "How do we begin a project with GrowxLabs?",
        answer: "Contact us at sai@growxlabs.tech or through our contact page to discuss your project scope, architecture requirements, and timeline."
      }
    ]
  },
  {
    id: "academy",
    title: "AI Academy & Certifications",
    items: [
      {
        question: "Who are the GrowxLabs engineering courses designed for?",
        answer: "Our curriculum is engineered for developers, engineering students, and software practitioners looking to master modern AI engineering, neural architectures, and full-stack software development."
      },
      {
        question: "Are GrowxLabs course certificates verifiable?",
        answer: "Yes. Course completions include cryptographically signed certificates verifiable through our public verification portal."
      }
    ]
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqCategories.flatMap((category) =>
    category.items.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  )
};

export async function generateMetadata() {
  return {
    title: "Frequently Asked Questions | GrowxLabs",
    description: "Frequently asked questions about GrowxLabs software engineering, enterprise AI capabilities, web platforms, and technical engagements.",
    alternates: {
      canonical: "https://growxlabs.tech/faq"
    }
  };
}

export default function FAQPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQContent categories={faqCategories} />
    </>
  );
}
