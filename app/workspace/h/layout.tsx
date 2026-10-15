import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { isHealthcareLeadManager } from "@/lib/employee-os/persona";

export const dynamic = "force-dynamic";

/**
 * Healthcare Workspace Root Layout
 * Guarantees that every single route under /workspace/h/* strictly enforces:
 * 1. requireActiveEmployeeContext()
 * 2. isHealthcareLeadManager(context)
 */
export default async function HealthcareWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireActiveEmployeeContext();

  if (!isHealthcareLeadManager(context)) {
    redirect("/workspace");
  }

  return <>{children}</>;
}
