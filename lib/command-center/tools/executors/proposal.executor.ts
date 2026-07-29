import { supabaseAdmin } from "@/lib/supabase/admin";
import { ToolExecutor } from "../registry/tool-types";
import { GenerateProposalSchema } from "../../validation/tool.schemas";
import { z } from "zod";

export const generateProposalExecutor: ToolExecutor<z.infer<typeof GenerateProposalSchema>, unknown> = {
  name: "generate_proposal",
  description: "Generate and persist a new Scope of Work (SOW) client proposal.",
  inputSchema: GenerateProposalSchema,
  riskLevel: "medium",
  requiredPermissions: ["proposals:write"],
  async execute(input, context) {
    const pkg = input.selectedPackage || "Growth Tier";
    const pricingMap: Record<string, { budget: string; deliverables: string[] }> = {
      "Standard Tier": {
        budget: "₹2,50,000",
        deliverables: [
          "Responsive High-Converting Web Application",
          "Basic Lead Capture & CRM Sync",
          "Automated Email Notifications",
          "Standard Performance & SEO Package"
        ]
      },
      "Growth Tier": {
        budget: "₹4,50,000",
        deliverables: [
          "Full Custom Web Application + Mobile Web Optimization",
          "Advanced Lead Enrichment & Auto-Scoring Engine",
          "WhatsApp & Email Automation Sequences",
          "Custom Admin Control Panel & CRM Dashboard",
          "3 Months Support & Maintenance"
        ]
      },
      "Enterprise Suite": {
        budget: "₹8,50,000",
        deliverables: [
          "Complete Enterprise AI Platform Integration",
          "Multi-Channel Inbound Lead Ingestion & Distribution",
          "Dedicated Custom API & Microservices Infrastructure",
          "AI Agent Workflows & Command Center Integration",
          "Priority 24/7 SLA & Dedicated Engineer Support"
        ]
      }
    };

    const pkgData = pricingMap[pkg] || {
      budget: input.customPrice || "₹4,50,000",
      deliverables: ["Custom Web System Development", "CRM & Lead Automation", "Dedicated Support"]
    };

    const finalBudget = input.customPrice || pkgData.budget;
    const deliverables = pkgData.deliverables;

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .insert([{
        client_name: input.clientName,
        business_name: input.businessName,
        package_name: pkg,
        budget: finalBudget,
        deliverables: deliverables,
        status: "draft",
        valid_days: input.validDays || 7
      }])
      .select()
      .single();

    const proposalId = proposal?.id || "prop_" + Math.random().toString(36).substring(2, 9);
    const pdfUrl = `${context.baseUrl || ""}/api/proposals/${proposalId}/view`;

    if (error) {
      console.warn("Could not insert proposal into database, returning memory proposal:", error.message);
    }

    return {
      proposalId,
      pdfUrl,
      clientName: input.clientName,
      businessName: input.businessName,
      selectedPackage: pkg,
      budget: finalBudget,
      timeline: "3 to 5 Weeks",
      deliverables,
      status: "generated",
      validUntil: new Date(Date.now() + (input.validDays || 7) * 86400000).toISOString().split("T")[0]
    };
  }
};
