import type { ReactNode } from "react";
import { resolveEmployeeContext } from "@/lib/employee-os/context";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";
import { WorkspaceState } from "@/components/workspace/WorkspaceState";
import { employeeNotifications } from "@/lib/employee-os/workspace-data";
import { css, cx } from "@/styled-system/css";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const result = await resolveEmployeeContext();
  if (result.state !== "active") return <WorkspaceState state={result.state} />;
  const unreadCount = (await employeeNotifications(result.employee, 100)).filter((item) => !item.read_at).length;
  return (
    <div
      className={cx(
        "workspace-theme",
        css({
          minHeight: "100vh",
          bg: "#F8FAFC",
          color: "#0F172A",
        })
      )}
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
      }}
    >
      <WorkspaceNav
        name={result.employee.name}
        role={result.employee.role}
        designation={result.employee.designation}
        permissions={result.employee.permissions}
        unreadCount={unreadCount}
      />
      <main
        className={css({
          mx: "auto",
          minHeight: "100vh",
          maxWidth: "72rem",
          px: { base: "16px", md: "40px" },
          pb: { base: "96px", md: "64px" },
          pt: { base: "64px", md: "40px" },
          ml: { base: "0", md: "256px" },
        })}
      >
        {children}
      </main>
    </div>
  );
}
