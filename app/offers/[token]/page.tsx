import OfferDecision from "@/components/onboarding/OfferDecision";

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OfferDecision token={token} />;
}
