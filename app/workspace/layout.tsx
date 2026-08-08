import type { ReactNode } from "react";
import { resolveEmployeeContext } from "@/lib/employee-os/context";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { WorkspaceState } from "@/components/workspace/WorkspaceState";
import { employeeNotifications } from "@/lib/employee-os/workspace-data";

export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const result = await resolveEmployeeContext();
  if (result.state !== "active") return <WorkspaceState state={result.state}/>;
  const unreadCount=(await employeeNotifications(result.employee,100)).filter(item=>!item.read_at).length;
  return <div className="min-h-screen bg-slate-50 text-slate-900"><WorkspaceNav name={result.employee.name} role={result.employee.role} permissions={result.employee.permissions} unreadCount={unreadCount}/><main className="mx-auto min-h-screen max-w-6xl px-5 pb-16 pt-20 md:ml-64 md:px-10 md:pt-10">{children}</main></div>;
}
