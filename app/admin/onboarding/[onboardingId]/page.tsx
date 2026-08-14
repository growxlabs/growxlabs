import { OnboardingAdminDetail } from "@/components/admin/onboarding/OnboardingAdminWorkspace";
export default async function AdminOnboardingDetailPage({params}:{params:Promise<{onboardingId:string}>}){return <main className="p-6 md:p-10"><OnboardingAdminDetail id={(await params).onboardingId}/></main>}
