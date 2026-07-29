import { redirect } from "next/navigation";

export default function GovernancePage() {
  redirect("/admin/command-center/governance/approvals");
}
