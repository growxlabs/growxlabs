import CandidateApplicationPage from '../../application/[reference]/page';

export default function CanonicalCandidateApplicationPage({ params }: { params: Promise<{ applicationId: string }> }) {
  return <CandidateApplicationPage params={params} />;
}
