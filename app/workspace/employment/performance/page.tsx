import { EmptyState,EmploymentNav,PageHeader } from "@/components/workspace/WorkspaceUI";
export default function PerformancePage(){return <><PageHeader eyebrow="My Employment" title="Performance" description="Your published goals and review information."/><EmploymentNav/><EmptyState>No employee-scoped published performance information is currently available.</EmptyState></>}
