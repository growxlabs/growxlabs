import { TermsContent } from "./TermsContent";

export async function generateMetadata() {
  return {
    title: "Terms of Service | GrowxLabs",
    description: "Read the terms and conditions governing professional digital engineering and software services provided by GrowxLabs.",
    alternates: {
      canonical: "https://growxlabs.tech/terms"
    }
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
