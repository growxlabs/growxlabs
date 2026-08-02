import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  redirect(session?.user?.role === "CLIENT" ? "/client/assessment" : "/contact");
}
