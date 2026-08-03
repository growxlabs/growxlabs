import { DiscoveryMeetingWorkspace } from "@/components/admin/discovery/DiscoveryMeetingWorkspace";
export default async function DiscoveryMeetingPage({params}:{params:Promise<{meetingId:string}>}){const {meetingId}=await params;return <main className="p-6 md:p-10"><DiscoveryMeetingWorkspace meetingId={meetingId}/></main>}
