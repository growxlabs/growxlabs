import { ContractorSigningPage } from "@/components/contractors/ContractorSigningPage";

export default async function ContractorAgreementSigningRoute({ params, searchParams }: { params: Promise<{ agreementNumber: string }>; searchParams: Promise<{ token?: string }> }) {
  const { agreementNumber } = await params;
  const query = await searchParams;
  return <ContractorSigningPage agreementNumber={decodeURIComponent(agreementNumber)} token={query.token || ""} />;
}
