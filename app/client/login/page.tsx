import { redirect } from "next/navigation";
export default function ClientLogin(){redirect("/login?callbackUrl=%2Fclient%2Fdashboard");}
