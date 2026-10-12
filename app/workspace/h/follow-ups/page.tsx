import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getFollowUps } from "@/lib/employee-os/sales-service";
import { HealthcareFollowUpsView } from "@/components/workspace/HealthcareFollowUpsView";
import { css } from "@/styled-system/css";

export const dynamic = "force-dynamic";

export default async function HealthcareFollowUpsPage() {
  const context = await requireActiveEmployeeContext();
  const followups = await getFollowUps(context);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "56rem",
        mx: "auto",
      })}
    >
      <header className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
        <p
          className={css({
            fontSize: "12px",
            fontWeight: "600",
            color: "#2563EB",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          Tasks
        </p>
        <h1
          className={css({
            fontSize: { base: "24px", sm: "30px" },
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: "#020617",
          })}
        >
          Follow-ups
        </h1>
        <p className={css({ fontSize: "14px", color: "#64748B" })}>
          Manage your scheduled calls, conversations, and revisit reminders.
        </p>
      </header>

      <HealthcareFollowUpsView items={followups} />
    </div>
  );
}
