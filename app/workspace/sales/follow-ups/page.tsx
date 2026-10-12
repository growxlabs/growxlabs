import { redirect } from "next/navigation";
import { isHealthcareLeadManager } from "@/lib/employee-os/persona";
import { requireActiveEmployeeContext } from "@/lib/employee-os/context";
import { getFollowUps } from "@/lib/employee-os/sales-service";
import { SalesHeader } from "@/components/workspace/SalesUI";
import { FollowUpList } from "@/components/workspace/FollowUpList";

export default async function FollowupsPage() {
  const c = await requireActiveEmployeeContext();
  if (isHealthcareLeadManager(c)) {
    redirect("/workspace/h/follow-ups");
  }
  const followups = await getFollowUps(c);
  return (
    <>
      <SalesHeader
        title="Follow-ups"
        description="Due, upcoming, overdue and completed actions you own."
      />
      <FollowUpList items={followups} />
    </>
  );
}
