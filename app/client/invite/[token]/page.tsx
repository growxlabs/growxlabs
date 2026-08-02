import { AcceptInvitation } from "@/components/client/AcceptInvitation";
export default async function InvitationPage({params}:{params:Promise<{token:string}>}){const {token}=await params;return <AcceptInvitation token={token}/>;}
