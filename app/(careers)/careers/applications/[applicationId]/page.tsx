import CandidateApplicationPage from '../../application/[reference]/page';

export default async function CanonicalCandidateApplicationPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  return <CandidateApplicationPage params={Promise.resolve({ reference: applicationId })} />;
}
