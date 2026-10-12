import { notFound, redirect } from "next/navigation";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { isHealthcareLeadManager } from "@/lib/employee-os/persona";
import { getAccessibleLead, SalesAccessError } from "@/lib/employee-os/sales-service";
import { SalesHeader } from "@/components/workspace/SalesUI";
import { DefinitionList, EmptyState } from "@/components/workspace/WorkspaceUI";
import { LeadActions } from "@/components/workspace/LeadActions";
import { LeadIntelligenceBrief } from "@/components/workspace/LeadIntelligenceBrief";

function normalizeWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  if (digits.length >= 10) {
    return digits;
  }
  return null;
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  try {
    const context = await requireActiveEmployeeContext();
    const { leadId } = await params;
    if (isHealthcareLeadManager(context)) {
      redirect(`/workspace/h/leads/${leadId}`);
    }
    const lead = await getAccessibleLead(context, leadId);

    const waPhone = normalizeWhatsAppPhone(lead.phone);

    return (
      <>
        <SalesHeader
          title={lead.business_name || lead.name || "Prospect"}
          description={[
            lead.name,
            lead.status,
            lead.priority && `${lead.priority} priority`,
          ]
            .filter(Boolean)
            .join(" · ")}
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-9">
            {/* Bilingual Business Intelligence & Playbook (Telugu + English) */}
            <LeadIntelligenceBrief customFields={lead.custom_fields} />

            <section>
              <h2 className="mb-3 font-semibold text-slate-900">Prospect overview</h2>
              <DefinitionList
                items={[
                  ["Company", lead.business_name],
                  ["Website", lead.website_url],
                  ["Location", lead.city],
                  ["Source", lead.source],
                  ["Status", lead.status],
                ]}
              />
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-slate-900">Qualification</h2>
              {lead.qualification ? (
                <DefinitionList
                  items={[
                    ["State", lead.qualification.state],
                    ["Problem", lead.qualification.problem_summary],
                    ["Current process", lead.qualification.current_process],
                    ["Impact", lead.qualification.impact],
                    ["Potential fit", lead.qualification.potential_fit],
                    ["Next step", lead.qualification.next_step],
                  ]}
                />
              ) : (
                <EmptyState>Qualification has not started.</EmptyState>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-slate-900">Activity timeline</h2>
              {lead.activities.length ? (
                <ul className="divide-y border-y border-slate-200">
                  {lead.activities.map((a: any) => (
                    <li key={a.id} className="py-4">
                      <p className="text-sm font-medium capitalize text-slate-900">
                        {a.activity_type} {a.outcome && `· ${a.outcome}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{a.notes}</p>
                      <time className="mt-1 block text-xs text-slate-400">
                        {new Date(a.occurred_at).toLocaleString()}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>No activity logged.</EmptyState>
              )}
            </section>
          </div>

          <aside>
            <h2 className="mb-3 font-semibold text-slate-900">Contact</h2>
            <DefinitionList
              items={[
                ["Name", lead.name],
                ["Email", lead.email],
                ["Phone", lead.phone],
                ["LinkedIn", lead.linkedin_url],
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Call
                </a>
              )}
              {waPhone && (
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  WhatsApp
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Email
                </a>
              )}
            </div>
          </aside>
        </div>

        <LeadActions lead={lead} />
      </>
    );
  } catch (e) {
    if (e instanceof SalesAccessError && e.status === 404) notFound();
    throw e;
  }
}
