import { redirect } from "next/navigation";

// The legacy Team CRM duplicated Employee Sales. Phase 7 keeps a single
// employee execution surface while preserving this URL as a compatibility entry.
export default function TeamCRMCompatibilityPage(){redirect("/workspace/sales")}
